"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Estela de AGUA del cursor — simulación de fluidos REAL (Navier-Stokes en GPU,
 * webgl-fluid-enhanced). Nada persistente: al mover el cursor el "mar" se abre
 * como una ola y al parar se cierra y desaparece solo (disipación alta = BREVE).
 * Va DETRÁS del contenido (-z-10) como atmósfera de fondo: el texto y las fotos
 * lo cubren, nunca al revés. Paleta "mar negro" tenue, sin bloom (el bloom lo
 * volvía brillante). Solo desktop/puntero fino + reduced-motion. Lazy (no SSR).
 */

// Magnitud de velocidad del splat (≈ delta normalizado * splatForce del sim).
const FORCE = 6000;
const MAX_VEL = 160;

const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

export function FluidCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // /lab monta sus propias escenas WebGL: dos contextos a resolución retina en
  // la misma página compiten por GPU y producen tirones al scrollear.
  const isLabRoute = pathname?.startsWith("/lab") ?? false;

  useEffect(() => {
    if (isLabRoute) return;

    const container = ref.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let sim: { stop: () => void; splatAtLocation: (x: number, y: number, dx: number, dy: number) => void } | null = null;
    let cancelled = false;

    // Import dinámico: el módulo no entra al bundle inicial ni corre en SSR.
    import("webgl-fluid-enhanced").then((mod) => {
      if (cancelled) return;
      const instance = new mod.default(container);
      instance.setConfig({
        transparent: true,
        hover: false, // los splats los inyectamos nosotros (canvas es pointer-events-none)
        colorful: false,
        // "Mar negro" (la versión que Alejandro prefirió): azules profundos
        // desaturados + un guiño violeta. Sin bloom = sin brillo de humo.
        colorPalette: ["#4a5d85", "#56497f", "#3a5570", "#5d6a94"],
        brightness: 0.34, // bajo: atmósfera de fondo, no protagonista brillante
        bloom: false, // el bloom era lo que lo hacía brillante/"humo azul"
        sunrays: false,
        shading: true,
        densityDissipation: 3, // se desvanece en ~1s → BREVE
        velocityDissipation: 1.6, // el remolino se calma rápido → "el mar se cierra"
        curl: 22,
        splatRadius: 0.2,
        splatForce: FORCE,
        simResolution: 128,
        dyeResolution: 1024,
      });
      instance.start();
      sim = instance;
    });

    const onMove = (e: PointerEvent) => {
      if (!sim) return;
      if (Math.abs(e.movementX) + Math.abs(e.movementY) < 1) return;
      const canvas = container.querySelector("canvas");
      if (!canvas || canvas.clientWidth === 0) return;
      const scaleX = canvas.width / canvas.clientWidth;
      // dx/dy = velocidad real del puntero → la ola se ABRE en la dirección del gesto.
      const dx = clamp((e.movementX / window.innerWidth) * FORCE, MAX_VEL);
      const dy = clamp((-e.movementY / window.innerHeight) * FORCE, MAX_VEL);
      sim.splatAtLocation(e.clientX * scaleX, e.clientY, dx, dy);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", onMove);
      sim?.stop();
      // Limpia el canvas que el sim inyecta (evita duplicados con StrictMode).
      container.replaceChildren();
    };
  }, [isLabRoute]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // `fixed!`: webgl-fluid-enhanced escribe `position: relative` inline en el
      // contenedor al inicializar, y eso ganaba sobre la clase. El resultado era
      // un bloque en flujo de ~720px empujando el contenido de TODA la página.
      // `-z-10`: detrás del contenido (body/secciones son transparentes sobre
      // fondo casi-negro), así el fluido es atmósfera de fondo y el texto/fotos
      // lo cubren — ya no se sobrepone. `screen` suma su luz sobre el negro.
      className="pointer-events-none fixed! inset-0 -z-10 mix-blend-screen [&>canvas]:h-full [&>canvas]:w-full"
    />
  );
}
