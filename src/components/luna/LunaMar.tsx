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

const POOL = 12;
const PASO_ONDA = 64;
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
      if (e.clientY < window.innerHeight * (1 - ZONA_AGUA)) return;
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

      {/* la banda de agua respira con la marea */}
      <div className="luna-mar__agua">
        <div className="luna-mar__marea">
          <Image
            src="/luna/agua-textura.jpg"
            alt=""
            fill
            sizes="100vw"
            className="luna-mar__base object-cover"
          />
          {/* el reflejo LITERAL: la luna invertida, tenue, con su fase */}
          <div className="luna-mar__luna">
            <Image
              src="/luna/luna-llena.jpg"
              alt=""
              fill
              sizes="30vw"
              className="luna-astro__img object-cover"
            />
            <div className="luna-astro__sombra" />
          </div>
          {/* el camino de luz se enciende con la historia */}
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
