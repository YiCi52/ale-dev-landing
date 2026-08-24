"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CatMascot } from "@/components/ui";
import { BEATS } from "./beats";
import { useLunaCursor } from "./useLunaCursor";

/*
  LunaEscenario — el corazón del rediseño (BRIEF §2 y §5).

  Escenario sticky de pantalla completa + centinelas invisibles de 100svh:
  el IO con banda central decide el beat activo y lo escribe como UN atributo
  (data-beat). Todo lo visual —fase de la luna, halo, reflejo, posición del
  gato— lo deriva el CSS de ese atributo. React solo mira el scroll.

  Mecánica calcada de RecorridoV2 (lab de Mari, verificada en Playwright):
  threshold 0 + rootMargin -45%/-45% = el beat activo es el del tramo que
  cruza el centro de la pantalla. Scroll nativo intacto.
*/
export function LunaEscenario() {
  const [beat, setBeat] = useState(0);
  const centinelasRef = useRef<HTMLDivElement>(null);
  const escenarioRef = useRef<HTMLElement>(null);
  const ondasRef = useLunaCursor(escenarioRef);

  useEffect(() => {
    const cont = centinelasRef.current;
    if (!cont || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) setBeat(idx);
          }
        }
      },
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" },
    );
    for (const c of cont.children) observer.observe(c);
    return () => observer.disconnect();
  }, []);

  const activo = BEATS[beat];

  return (
    <section
      ref={escenarioRef}
      className="luna-escenario relative"
      data-beat={beat}
      aria-label="Cómo trabaja Castillo Studio, contado con la luna"
    >
      {/* Escenario pegado: cielo, luna, agua, gato y texto */}
      <div className="luna-cielo sticky top-0 h-svh overflow-hidden">
        <div className="luna-estrellas" aria-hidden />

        {/* Nubes: una capa a deriva lenta (blend screen sobre el vacío) */}
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

        {/* El agua: textura base siempre + camino de reflejo que se enciende */}
        <div className="luna-agua" aria-hidden>
          <Image
            src="/luna/agua-textura.jpg"
            alt=""
            fill
            sizes="100vw"
            className="luna-agua__base object-cover"
          />
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

        {/* Las ondas del dedo en el agua (pool imperativo del hook) */}
        <div ref={ondasRef} className="absolute inset-0 pointer-events-none" aria-hidden />

        {/* El gato — la silueta propia, caminando la orilla */}
        <div className="luna-gato" aria-hidden>
          <CatMascot className="h-auto w-full" />
        </div>

        {/* Capa hero (solo beat 0): wordmark cortado abajo */}
        <div className="luna-hero-capa absolute inset-x-0 bottom-[-0.12em] text-center">
          <p className="luna-wordmark" aria-hidden>
            CASTILLO
          </p>
        </div>
        <div className="luna-hero-capa absolute top-[18svh] inset-x-4 sm:inset-x-12">
          <p className="luna-label mb-4">Castillo Studio — Bogotá</p>
          {/* el ancho de medida va en el h1 (ch del display), no en el
              contenedor: un ch del div base mide ~9px y encajona una
              palabra por línea */}
          <h1 className="luna-display max-w-[13ch]">
            Sitios que capturan clientes para estudios con criterio visual.
          </h1>
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

      {/* Centinelas: un tramo de 100svh por beat, metidos bajo el escenario */}
      <div ref={centinelasRef} className="-mt-[100svh]" aria-hidden>
        {BEATS.map((b, i) => (
          <div key={b.titulo} data-idx={i} className="h-svh" />
        ))}
      </div>
    </section>
  );
}
