"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  S4.5 — "Particle / space transition" (@seanaiux): campo estelar que acelera a
  WARP con el scroll — las estrellas se estiran en estelas, el pico de velocidad
  ocurre a mitad de la sección y al final desacelera y entrega la siguiente
  sección. Canvas 2D puro, proyección starfield clásica (x = sx/z).
*/

const STARS = 420;

type Star = { sx: number; sy: number; z: number; tint: number };

const seeded = (i: number, salt: number) =>
  Math.abs((Math.sin(i * 127.1 + salt * 311.7) * 43758.5453) % 1);

export function GkWarp() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    const sticky = section.querySelector<HTMLElement>(".gk-warp__sticky");
    if (!sticky) return;

    let W = 0;
    let H = 0;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = sticky.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const stars: Star[] = Array.from({ length: STARS }, (_, i) => ({
      sx: (seeded(i, 1) - 0.5) * 2200,
      sy: (seeded(i, 2) - 0.5) * 2200,
      z: 0.12 + seeded(i, 3) * 0.88,
      tint: seeded(i, 4),
    }));

    // progreso de scroll → velocidad warp (campana: pico al centro)
    const speed = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        speed.v = Math.sin(Math.min(Math.max(p, 0), 1) * Math.PI) ** 2;
      },
    });

    const f = 300; // focal
    let raf = 0;

    const draw = () => {
      const cx = W / 2;
      const cy = H / 2;
      // estela persistente: velo negro semitransparente en vez de clear
      ctx.fillStyle = `rgba(5, 6, 8, ${0.55 - speed.v * 0.35})`;
      ctx.fillRect(0, 0, W, H);

      const v = reduced ? 0.002 : 0.002 + speed.v * 0.06;

      for (const s of stars) {
        const zPrev = s.z;
        s.z -= v;
        if (s.z <= 0.05) {
          s.z = 1;
          continue;
        }
        const x0 = cx + s.sx / (zPrev * f) * 60;
        const y0 = cy + s.sy / (zPrev * f) * 60;
        const x1 = cx + s.sx / (s.z * f) * 60;
        const y1 = cy + s.sy / (s.z * f) * 60;
        const bright = Math.min(1, (1 - s.z) * 1.4 + speed.v * 0.35);
        const color =
          s.tint > 0.9
            ? `rgba(232, 182, 76, ${bright})`
            : s.tint > 0.72
              ? `rgba(121, 224, 210, ${bright})`
              : `rgba(236, 240, 244, ${bright})`;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.min(2.4, (1 - s.z) * 2.6);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // etiqueta y entrega: el canvas se funde al final hacia la siguiente sección
    const ctxg = gsap.context(() => {
      if (reduced) return;
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.5 },
        })
        .fromTo(".gk-warp__label", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.05)
        .to(".gk-warp__label", { opacity: 0, letterSpacing: "0.6em", duration: 0.3 }, 0.45)
        .to(canvas, { opacity: 0, duration: 0.18 }, 0.82);
    }, section);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      st.kill();
      ctxg.revert();
    };
  }, []);

  return (
    <section className="gk-warp" ref={sectionRef} aria-label="Transición espacial (demo)">
      <div className="gk-warp__sticky">
        <canvas ref={canvasRef} aria-hidden />
        <span className="gk-warp__label gk-eyebrow">velocidad de escape</span>
      </div>
    </section>
  );
}
