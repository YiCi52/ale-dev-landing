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

/*
  Sin esto el simulador sigue renderizando para siempre: el tinte se apaga en
  ~1s pero el bucle sigue dibujando lienzos vacíos a cada frame mientras el
  visitante LEE — que es la mayor parte del tiempo que pasa en la página, y
  justo cuando compite con el cristal 3D del hero.
*/
const INACTIVIDAD_MS = 1400;

/*
  La disipación es ASINTÓTICA: se acerca a cero y nunca llega. Pausar sin más
  congelaba ese resto tenue en pantalla hasta el siguiente movimiento del
  mouse — poco visible pero permanente, y se notaba (lo detectó Alejandro).
  Por eso el lienzo se apaga por OPACIDAD antes de dormirlo y se reenciende al
  despertar: opacity es compositor-friendly, no depende de que la librería
  exponga un "clear", y como a esa altura casi no queda tinte, el apagado es
  imperceptible. La espera cubre la transición para no pausar a mitad del fade.
*/
/* Debe coincidir con la transición de [data-fluido] > canvas en globals.css:
   se pausa DESPUÉS de que termine el fundido, o se congela a mitad de camino
   y vuelve el corte seco que esto vino a resolver. */
const APAGADO_MS = 900;

type Sim = {
  stop: () => void;
  togglePause: (drawWhilePaused?: boolean) => boolean;
  splatAtLocation: (x: number, y: number, dx: number, dy: number) => void;
};

const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));

export function FluidCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // /lab monta sus propias escenas WebGL: dos contextos a resolución retina en
  // la misma página compiten por GPU y producen tirones al scrollear.
  const isLabRoute = pathname?.startsWith("/lab") ?? false;
  /*
    /luna: la MISMA simulación deja de ser neblina y se vuelve el agua del
    mundo — tinte de luz lunar, algo más presente, y con dos restricciones
    que la convierten en "pasar un dedo por el agua": el contenedor lleva
    una máscara CSS que la recorta a la banda del mar (luna.css,
    [data-fluido-luna]) y los splats solo se inyectan cuando el puntero
    está en esa banda.
  */
  const isLunaRoute = pathname?.startsWith("/luna") ?? false;

  useEffect(() => {
    if (isLabRoute) return;

    const container = ref.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let sim: Sim | null = null;
    let cancelled = false;
    let dormido = false;
    let temporizador: number | undefined;
    let apagador: number | undefined;

    /*
      El apagado va por un data-attribute y una regla CSS sobre el <canvas>
      (ver globals.css), NO por estilo inline en el contenedor: la librería
      REESCRIBE el atributo `style` del contenedor por su cuenta y se lleva
      por delante cualquier opacidad que le pongamos ahí. Verificado: el
      inline quedaba puesto y el valor computado seguía en 1.
    */
    // togglePause devuelve el estado resultante, así que la misma llamada sirve
    // para dormir y despertar y el booleano nunca se desincroniza del sim.
    const dormir = () => {
      if (!sim || dormido) return;
      // Primero se apaga a la vista, DESPUÉS se congela: al revés queda el
      // resto de tinte pegado en pantalla hasta el siguiente movimiento.
      container.dataset.fluido = "dormido";
      apagador = window.setTimeout(() => {
        if (sim && !dormido) dormido = sim.togglePause(false);
      }, APAGADO_MS);
    };
    const despertar = () => {
      window.clearTimeout(apagador);
      container.dataset.fluido = "activo";
      if (sim && dormido) dormido = sim.togglePause(false);
    };
    const reprogramarSiesta = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(dormir, INACTIVIDAD_MS);
    };

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
        // En /luna: luz de luna sobre el agua — la paleta del rediseño.
        colorPalette: isLunaRoute
          ? ["#cfc3ff", "#9f86ff", "#f5f2ff", "#b9a8ff"]
          : ["#4a5d85", "#56497f", "#3a5570", "#5d6a94"],
        brightness: isLunaRoute ? 0.5 : 0.34, // la estela en el agua sí se ve
        bloom: false, // el bloom era lo que lo hacía brillante/"humo azul"
        sunrays: false,
        shading: true,
        densityDissipation: 3, // se desvanece en ~1s → BREVE
        velocityDissipation: 1.6, // el remolino se calma rápido → "el mar se cierra"
        curl: 22,
        splatRadius: 0.2,
        splatForce: FORCE,
        simResolution: 128,
        // 512 en vez de 1024: el tinte se dibuja a la mitad de lado, o sea a un
        // cuarto de píxeles por frame. En un fluido borroso, tenue y a brillo
        // 0.34 la diferencia no se ve; el ahorro de relleno sí se siente cuando
        // comparte GPU con el cristal del hero.
        dyeResolution: 512,
      });
      instance.start();
      sim = instance;
      reprogramarSiesta();
    });

    const onMove = (e: PointerEvent) => {
      if (!sim) return;
      if (Math.abs(e.movementX) + Math.abs(e.movementY) < 1) return;
      // en /luna la ola solo nace en el agua (banda inferior del viewport);
      // la máscara CSS ya recorta lo visible, esto ahorra el splat inútil
      if (isLunaRoute && e.clientY < window.innerHeight * 0.62) return;
      despertar();
      reprogramarSiesta();
      const canvas = container.querySelector("canvas");
      if (!canvas || canvas.clientWidth === 0) return;
      const scaleX = canvas.width / canvas.clientWidth;
      // dx/dy = velocidad real del puntero → la ola se ABRE en la dirección del gesto.
      const dx = clamp((e.movementX / window.innerWidth) * FORCE, MAX_VEL);
      const dy = clamp((-e.movementY / window.innerHeight) * FORCE, MAX_VEL);
      sim.splatAtLocation(e.clientX * scaleX, e.clientY, dx, dy);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    if (isLunaRoute) container.dataset.fluidoLuna = "1";
    else delete container.dataset.fluidoLuna;

    return () => {
      cancelled = true;
      window.clearTimeout(temporizador);
      window.clearTimeout(apagador);
      window.removeEventListener("pointermove", onMove);
      sim?.stop();
      // Limpia el canvas que el sim inyecta (evita duplicados con StrictMode).
      container.replaceChildren();
    };
  }, [isLabRoute, isLunaRoute]);

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
