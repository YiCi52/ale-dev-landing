"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/*
  LunaMar — el mar como fondo de TODA la página (pedido de Alejandro, 24-ago:
  "que el mar continúe de fondo en toda la página principal").

  Capa fija detrás de todo el contenido (z bajo el FluidCursor, que hace de
  estela luminosa sobre el agua). Contiene:
  - el vacío + estrellas tenues (base de página completa),
  - la banda de agua con marea leve (bob de transform, compositor-friendly),
  - el REFLEJO LITERAL de la luna: la misma foto invertida, más tenue y
    ondulada, con SU MISMA FASE (la sombra se mueve con --sombra igual que
    arriba — por eso los vars viven en el wrapper .luna),
  - el camino de luz (foto) que se enciende con --reflejo,
  - las ondas del dedo (pool reciclado, nacen en la banda de agua en toda
    la página, no solo durante la narrativa).
*/

const POOL = 14;
const PASO_ONDA = 48;
/* fracción inferior del viewport que es agua en la narrativa; con --post
   el agua crece, así que la zona interactiva también (se lee del wrapper) */
const ZONA_AGUA = 0.3;

function useOndas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contenedor = ref.current;
    if (!contenedor) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const ondas = Array.from({ length: POOL }, () => {
      const o = document.createElement("div");
      o.className = "luna-onda";
      contenedor.appendChild(o);
      return o;
    });
    let idx = 0;
    let ultimaX = -1;
    let ultimaY = -1;

    const onMove = (e: PointerEvent) => {
      /* la línea de agua baja/sube con --post: tras la narrativa TODO es mar
         y las ondas nacen en cualquier parte del viewport */
      const post = parseFloat(
        getComputedStyle(contenedor.closest(".luna") ?? document.body)
          .getPropertyValue("--post") || "0",
      );
      const zona = ZONA_AGUA + (1 - ZONA_AGUA) * post;
      if (e.clientY < window.innerHeight * (1 - zona)) return;
      if (Math.hypot(e.clientX - ultimaX, e.clientY - ultimaY) < PASO_ONDA) return;
      ultimaX = e.clientX;
      ultimaY = e.clientY;
      const onda = ondas[idx];
      idx = (idx + 1) % POOL;
      onda.style.left = `${e.clientX}px`;
      onda.style.top = `${e.clientY}px`;
      onda.classList.remove("is-viva");
      void onda.offsetWidth;
      onda.classList.add("is-viva");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      for (const o of ondas) o.remove();
    };
  }, []);

  return ref;
}

export function LunaMar() {
  const ondasRef = useOndas();

  return (
    <div className="luna-mar" aria-hidden>
      {/* estrellas tenues de página completa (más calladas que las del hero) */}
      <div className="luna-mar__estrellas" />

      {/* la banda de agua — crece con --post hasta tragarse el fondo entero */}
      <div className="luna-mar__agua">
        <div className="luna-mar__marea">
          {/* priority ACÁ y no en el camino: Next detecta ESTA textura como
              LCP (el camino arranca casi apagado, --reflejo 0.05 — la capa
              grande y visible del primer pintado es el agua). El warning de
              la ronda 2 era exactamente ese priority mal puesto. */}
          <Image
            src="/luna/agua-textura.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="luna-mar__base object-cover"
          />
          {/* segunda capa a contracorriente: el agua se VE moverse */}
          <div className="luna-mar__corriente">
            <Image
              src="/luna/agua-textura.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          {/*
            el reflejo LITERAL de la luna — no una calcomanía: el disco
            invertido se ROMPE en bandas horizontales (las franjas pintan
            agua encima), los bordes se disuelven con máscara radial y todo
            tiembla. Comparte fase (--sombra) y posición (--astro-x).
          */}
          <div className="luna-mar__luna">
            <Image
              src="/luna/luna-llena.jpg"
              alt=""
              fill
              sizes="30vw"
              className="luna-astro__img object-cover"
            />
            <div className="luna-astro__sombra" />
            {/* dos capas de rotura con periodos primos (23/13px): su
                interferencia es lo que hace que las bandas no se lean como
                escanlíneas mecánicas */}
            <div className="luna-mar__rotura" />
            <div className="luna-mar__rotura luna-mar__rotura--fina" />
          </div>
          {/* la estela ancla el disco al camino: sin ella el reflejo
              flotaba desconectado del brillo que arranca más abajo */}
          <div className="luna-mar__estela" />
          {/* el camino de luz se enciende con la historia y tiembla. Sin
              priority: a la carga está casi apagado (--reflejo 0.05) y
              precargarlo eran 98KB robándole el ancho de banda al LCP real
              (el agua, arriba). */}
          <div className="luna-reflejo">
            <Image
              src="/luna/reflejo-camino.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* ondas del dedo — viven acá para existir en TODA la página */}
      <div ref={ondasRef} className="absolute inset-0" />
    </div>
  );
}
