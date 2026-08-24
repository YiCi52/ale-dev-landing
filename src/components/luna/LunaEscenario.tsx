"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CatMascot } from "@/components/ui";
import { BEATS } from "./beats";
import { useLunaCursor } from "./useLunaCursor";
import { useGatoScrub, progresoDe } from "./useGatoScrub";

/*
  LunaEscenario — el primer acto del rediseño (BRIEF §2 y §5).

  Escenario sticky de pantalla completa + tramos de 100svh que dan la
  altura: el beat activo sale del PROGRESO continuo del scroll y se escribe
  como UN atributo data-beat — en el WRAPPER .luna, no acá: el mar es una
  capa fija hermana (LunaMar) y necesita heredar el mismo estado para
  encender el reflejo y mover la fase de la luna reflejada. React solo mira
  el scroll; todo lo visual lo deriva el CSS del atributo. Scroll nativo
  intacto — nada secuestra la rueda.

  El agua NO vive acá: es fondo fijo de toda la página (LunaMar). El cielo
  del escenario se desvanece hacia abajo para que el mar se vea a través.
*/
export function LunaEscenario() {
  const [beat, setBeat] = useState(0);
  const escenarioRef = useRef<HTMLElement>(null);
  const gatoRef = useRef<HTMLDivElement>(null);
  useLunaCursor(escenarioRef);
  useGatoScrub(escenarioRef, gatoRef);

  /*
    El beat se deriva del PROGRESO continuo del escenario, no de un IO con
    banda central: un salto de scroll (restauración, anchor, scrollTo) se
    brincaba la banda sin disparar el callback y el estado quedaba viejo —
    el mismo bug que RevealV2 ya pagó. round(prog × N) es el equivalente
    exacto de la banda central, y es una función del scroll actual: no hay
    evento que perderse.
  */
  useEffect(() => {
    const escenario = escenarioRef.current;
    if (!escenario) return;

    let rafId = 0;
    let pedido = false;
    const medir = () => {
      pedido = false;
      setBeat(Math.round(progresoDe(escenario) * (BEATS.length - 1)));
      /*
        --post: cuánto se ha scrolleado MÁS ALLÁ de la narrativa (0..1 en
        ~un viewport). El mar lo usa para tragarse el cielo: al salir de la
        historia el agua crece hasta ocupar el fondo entero de la página.
      */
      const rect = escenario.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const post = Math.min(1, Math.max(0, (-rect.top - total) / (window.innerHeight * 0.9)));
      escenario.closest<HTMLElement>(".luna")?.style.setProperty("--post", post.toFixed(3));
    };
    const onScroll = () => {
      if (pedido) return;
      pedido = true;
      rafId = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  /* el estado del mundo vive en el wrapper: escenario Y mar lo heredan */
  useEffect(() => {
    escenarioRef.current
      ?.closest(".luna")
      ?.setAttribute("data-beat", String(beat));
  }, [beat]);

  const activo = BEATS[beat];

  return (
    <section
      ref={escenarioRef}
      className="luna-escenario relative"
      aria-label="Cómo trabaja Castillo Studio, contado con la luna"
    >
      {/* Escenario pegado: cielo, luna, gato y texto — el mar es de la página */}
      <div className="luna-cielo sticky top-0 h-svh overflow-hidden">
        <div className="luna-estrellas" aria-hidden />

        {/* Nubes: deriva lentísima en blend screen */}
        <div className="luna-nubes" aria-hidden>
          <Image src="/luna/nubes-1.jpg" alt="" fill sizes="100vw" className="object-cover" />
        </div>

        {/*
          La luna fotográfica. La fase es el mismo mecanismo del sello pero en
          divs: la foto (blend screen: su fondo negro desaparece) + una sombra
          circular color vacío que se retira hacia la derecha beat a beat.
        */}
        <div className="luna-astro" aria-hidden>
          <Image
            src="/luna/luna-llena.jpg"
            alt=""
            fill
            sizes="(max-width: 640px) 60vw, 30vw"
            priority
            className="luna-astro__img object-cover"
          />
          <div className="luna-astro__sombra" />
        </div>

        {/* El gato — la silueta propia. La posición la escribe useGatoScrub
            (camina CON el scroll); su reflejo viaja con él por herencia. */}
        <div ref={gatoRef} className="luna-gato" aria-hidden>
          <CatMascot className="h-auto w-full" />
          <div className="luna-gato__reflejo">
            <CatMascot className="h-auto w-full" />
          </div>
        </div>

        {/* Capa hero (solo beat 0): wordmark cortado abajo */}
        <div className="luna-hero-capa absolute inset-x-0 bottom-[-0.12em] text-center">
          <p className="luna-wordmark" aria-hidden>
            CASTILLO
          </p>
        </div>
        {/* El titular es SOPORTE, no protagonista: bloque compacto arriba a
            la izquierda (patrón StringTune "Master Your Skills") — el drama
            del hero lo ponen la luna, el mar y el wordmark. */}
        <div className="luna-hero-capa absolute top-[16svh] left-4 sm:left-12">
          <p className="luna-label mb-4">Castillo Studio — Bogotá</p>
          <h1 className="luna-hero-titulo max-w-[19ch]">
            Sitios que capturan clientes para estudios con criterio visual.
          </h1>
          <p className="luna-label mt-5" style={{ color: "var(--luna-accent)" }}>
            Scrollea — la luna cuenta el resto
          </p>
        </div>

        {/* Texto del beat activo (re-montado por key = re-anima el revelado) */}
        {beat > 0 && (
          <div
            key={beat}
            className="absolute bottom-[34svh] inset-x-4 sm:left-12 sm:right-auto sm:max-w-[560px]"
          >
            <p className="luna-beat-texto luna-label mb-3" style={{ color: "var(--luna-accent)" }}>
              {activo.fase}
            </p>
            <h2 className="luna-beat-texto luna-display">{activo.titulo}</h2>
            <p
              className="luna-beat-texto luna-beat-texto--sub mt-4 text-sm font-light leading-relaxed"
              style={{ color: "var(--luna-muted)" }}
            >
              {activo.copy}
            </p>
          </div>
        )}

        {/* Progreso: contador + hairline que se llena con la luna */}
        <div className="absolute bottom-10 right-4 sm:right-12 flex items-center gap-4">
          <p className="luna-label" aria-live="polite">
            {String(beat).padStart(2, "0")}
            <span style={{ opacity: 0.45 }}> / {String(BEATS.length - 1).padStart(2, "0")}</span>
          </p>
          <div className="luna-progreso h-px w-28 sm:w-40">
            <div
              className="luna-progreso__fill h-full w-full"
              style={{ transform: `scaleX(${beat / (BEATS.length - 1)})` }}
            />
          </div>
        </div>
      </div>

      {/* Tramos de scroll: 100svh por beat, metidos bajo el escenario. Ya no
          se observan (el beat sale del progreso) — solo dan la altura. */}
      <div className="-mt-[100svh]" aria-hidden>
        {BEATS.map((b) => (
          <div key={b.titulo} className="h-svh" />
        ))}
      </div>
    </section>
  );
}
