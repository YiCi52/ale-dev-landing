"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/*
  S7 + S8 — Cierre del reel de @avi_vashishta29:
  · "Interactive 3D models with CTAs": poste de señales callejero en CSS 3D;
    el grupo sigue el cursor y cada señal es un CTA deliberadamente NO funcional.
  · Collage glitch: miniaturas dispersas con glitch al hover + capa ASCII viva.
*/

const SIGNS = [
  { text: "contacto", cls: "gk-sign--blue", top: "12%", rotY: -18, flip: false },
  { text: "proyectos", cls: "gk-sign--white", top: "34%", rotY: 14, flip: true },
  { text: "laboratorio", cls: "gk-sign--yellow", top: "56%", rotY: -8, flip: false },
] as const;

const MINIS = [
  { top: "8%", left: "6%", w: 150, hue: 174 },
  { top: "14%", left: "70%", w: 180, hue: 40 },
  { top: "26%", left: "30%", w: 130, hue: 8 },
  { top: "34%", left: "82%", w: 120, hue: 210 },
  { top: "44%", left: "12%", w: 200, hue: 96 },
  { top: "58%", left: "64%", w: 150, hue: 320 },
  { top: "66%", left: "34%", w: 120, hue: 54 },
  { top: "72%", left: "8%", w: 160, hue: 260 },
  { top: "80%", left: "76%", w: 190, hue: 150 },
  { top: "86%", left: "44%", w: 130, hue: 20 },
] as const;

const ASCII_CHARS = "░▒▓█▚▞·:+xo";

export function GkSigns() {
  const groupRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const asciiRef = useRef<HTMLPreElement>(null);

  // El poste sigue el cursor (rotación del grupo completo).
  useEffect(() => {
    const scene = sceneRef.current;
    const group = groupRef.current;
    if (!scene || !group) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const rotY = gsap.quickTo(group, "rotationY", { duration: 0.9, ease: "power3.out" });
    const rotX = gsap.quickTo(group, "rotationX", { duration: 0.9, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      const r = scene.getBoundingClientRect();
      rotY(((e.clientX - r.left) / r.width - 0.5) * 38);
      rotX(((e.clientY - r.top) / r.height - 0.5) * -10);
    };
    scene.addEventListener("pointermove", move);
    return () => scene.removeEventListener("pointermove", move);
  }, []);

  // Capa ASCII viva: regenera una línea por tick (barato a propósito).
  useEffect(() => {
    const pre = asciiRef.current;
    if (!pre) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cols = 110;
    const rows = 42;
    const line = () =>
      Array.from({ length: cols }, () =>
        ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
      ).join("");
    const lines = Array.from({ length: rows }, line);
    pre.textContent = lines.join("\n");
    if (reduced) return;

    const id = window.setInterval(() => {
      lines[Math.floor(Math.random() * rows)] = line();
      pre.textContent = lines.join("\n");
    }, 140);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <section className="gk-signs" aria-label="Poste de señales 3D (demo)">
        <div className="gk-section-head">
          <h2>Señales que navegan</h2>
          <span className="gk-eyebrow">cta no funcional a propósito · mueve el cursor</span>
        </div>
        <div className="gk-signs__scene" ref={sceneRef}>
          <div className="gk-signs__group" ref={groupRef}>
            <div className="gk-pole__cap" aria-hidden />
            <div className="gk-pole" aria-hidden />
            {SIGNS.map((s) => (
              <span
                key={s.text}
                className={`gk-sign ${s.cls}`}
                style={{
                  top: s.top,
                  transform: `translateX(${s.flip ? "-92%" : "-8%"}) rotateY(${s.rotY}deg)`,
                }}
                title="Demo: este CTA no lleva a ningún lado"
              >
                {s.flip ? <i aria-hidden>←</i> : null}
                {s.text}
                {!s.flip ? <i aria-hidden>→</i> : null}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="gk-collage" aria-label="Cierre del lab">
        <pre className="gk-ascii" ref={asciiRef} aria-hidden />
        {MINIS.map((m, i) => (
          <figure
            key={i}
            className="gk-mini"
            style={{
              top: m.top,
              left: m.left,
              width: m.w,
              aspectRatio: "16 / 10",
              background: `linear-gradient(140deg, hsl(${m.hue} 34% 16%), hsl(${m.hue} 52% 42%))`,
            }}
          >
            <span>site {String(i + 1).padStart(2, "0")}</span>
          </figure>
        ))}
        <div className="gk-fin">
          <h2>Ficción declarada</h2>
          <p>
            Réplica de estudio construida como ejemplo vacío: ningún botón lleva a ningún
            lado a propósito. Género replicado: los carruseles, el grid al scroll y el
            poste de señales de @avi_vashishta29 (Pt. 08), y el reveal en hover, la
            transición espacial, el producto con scrub y el portal de @seanaiux.
          </p>
          <p>
            Todo es CSS 3D + GSAP + canvas 2D. Cero WebGL en vivo, cero assets externos:
            cada &quot;imagen&quot; es un gradiente generado.
          </p>
        </div>
      </section>
    </>
  );
}
