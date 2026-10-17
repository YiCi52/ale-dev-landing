"use client";

import { useEffect, useRef, useState } from "react";

import { ESTRATOS } from "../luna/tiempos";
import { sinMovimiento } from "../scroll";
import { CENTRO, ESTRELLAS } from "./estrellas";
import type { MotorConstelacion } from "./MotorConstelacion";

/*
  Prueba de la constelación (Alejo, 14-oct). Las etiquetas salen RADIALMENTE desde el centro de la pantalla
  (lección L-030: centradas debajo del punto se pisaban siempre) y se apagan las que quedan detrás.
*/
/** `encabezado`: "h1" en la página de prueba; "h2" dentro de la página Trabajo (los servicios en detalle). */
export function Constelacion({ encabezado = "h1", etiqueta = "Prueba · la constelación" }: { encabezado?: "h1" | "h2"; etiqueta?: string }) {
  const Titulo = encabezado;
  const lienzo = useRef<HTMLCanvasElement>(null);
  const etiquetas = useRef<HTMLDivElement>(null);
  const [grupo, setGrupo] = useState(-2);
  const grupoRef = useRef(-2);
  useEffect(() => { grupoRef.current = grupo; }, [grupo]);

  useEffect(() => {
    const c = lienzo.current, capa = etiquetas.current;
    if (!c || !capa || sinMovimiento()) return;
    let motor: MotorConstelacion | null = null, raf = 0, vivo = true, cursor: [number, number] | null = null, sobre = -2;
    const mover = (e: PointerEvent) => { const r = c.getBoundingClientRect(); cursor = [e.clientX - r.left, e.clientY - r.top]; };
    const salir = () => { cursor = null; };
    c.addEventListener("pointermove", mover);
    c.addEventListener("pointerleave", salir);
    const nodos = new Map<string, HTMLElement>();
    capa.querySelectorAll<HTMLElement>("[data-id]").forEach((n) => nodos.set(n.dataset.id!, n));
    const tick = (t: number) => {
      if (!motor || !vivo) return;
      const w = c.clientWidth, h = c.clientHeight;
      const puntos = motor.dibujar(t / 1000);
      // el cursor sobre una estrella enciende su constelación (la más cercana a menos de 28 px)
      const cerca = cursor ? puntos.filter((p) => p.estrella.grupo >= 0 && p.z < 1).map((p) => ({ p, d: Math.hypot(p.x - cursor![0], p.y - cursor![1]) })).sort((a, b) => a.d - b.d)[0] : undefined;
      const nuevo = cerca && cerca.d < 28 ? cerca.p.estrella.grupo : -2;
      if (nuevo !== sobre) { sobre = nuevo; setGrupo(nuevo); }
      motor.resaltar(grupoRef.current);
      for (const p of puntos) {
        const n = nodos.get(p.estrella.id);
        if (!n) continue;
        const dx = p.x - w / 2, dy = p.y - h / 2, l = Math.hypot(dx, dy) || 1;
        const sep = p.estrella.id === CENTRO.id ? 0 : 14;
        const derecha = dx >= 0;
        n.style.transform = `translate(${p.x + (dx / l) * sep}px, ${p.y + (dy / l) * sep}px) translate(${p.estrella.id === CENTRO.id ? "-50%" : derecha ? "0" : "-100%"}, -50%)`;
        n.style.opacity = p.z > 0.9995 ? "0" : p.estrella.id === CENTRO.id ? "1" : String(Math.max(0.15, Math.min(1, (0.9995 - p.z) * 260)));
      }
      raf = requestAnimationFrame(tick);
    };
    const alCambiar = () => motor?.medir();
    window.addEventListener("resize", alCambiar);
    import("./MotorConstelacion").then((m) => {
      if (!vivo) return;
      motor = new m.MotorConstelacion(c);
      motor.medir();
      raf = requestAnimationFrame(tick);
    }).catch(() => undefined);
    return () => { vivo = false; cancelAnimationFrame(raf); window.removeEventListener("resize", alCambiar); c.removeEventListener("pointermove", mover); c.removeEventListener("pointerleave", salir); motor?.destruir(); };
  }, []);

  return (
    <section aria-labelledby="v4-const-titulo" className="relative h-[100svh] overflow-hidden" style={{ background: "var(--piedra-950)" }}>
      <div className="absolute left-4 top-24 z-10 max-w-[34ch] sm:left-12">
        <p className="v4-mono">{etiqueta}</p>
        <Titulo id="v4-const-titulo" className="v4-display mt-4 text-[clamp(30px,3.6vw,56px)] leading-[1.02]">Catorce capas alrededor de tu sitio</Titulo>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--cuarzo-200)" }}>
          Cada constelación es un grupo: lo que ve tu cliente, lo que captura, lo que te avisa, lo que lo sostiene y lo que lo protege.
        </p>
        <ul className="mt-6 hidden gap-1 sm:grid">
          {ESTRATOS.map((e, i) => (
            <li key={e.nombre}>
              <button
                type="button"
                className="v4-mono text-left transition-colors"
                style={{ color: grupo === i ? "var(--cuarzo-50)" : "var(--apagado)" }}
                onMouseEnter={() => setGrupo(i)}
                onMouseLeave={() => setGrupo(-2)}
                onFocus={() => setGrupo(i)}
                onBlur={() => setGrupo(-2)}
              >
                {String(i + 1).padStart(2, "0")} · {e.nombre}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <canvas ref={lienzo} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" aria-label="Constelación de las 14 capas; arrastra para girarla" role="img" />
      <div ref={etiquetas} className="pointer-events-none absolute inset-0" aria-hidden>
        {[CENTRO, ...ESTRELLAS].map((s) => (
          <span
            key={s.id}
            data-id={s.id}
            className={s.id === CENTRO.id ? "v4-display absolute left-0 top-0 text-[18px]" : "v4-mono absolute left-0 top-0 whitespace-nowrap"}
            style={{ color: s.id === CENTRO.id ? "var(--cuarzo-50)" : grupo === -2 || grupo === s.grupo ? "var(--cuarzo-200)" : "rgba(217,213,204,.25)", marginTop: s.id === CENTRO.id ? 26 : 0 }}
          >
            {s.nombre}
          </span>
        ))}
      </div>
    </section>
  );
}
