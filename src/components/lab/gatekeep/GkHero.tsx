"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  S1 — Tres efectos en una escena:
  · "Space transition" (@seanaiux): nebulosa-ojo en canvas; el scroll hace zoom
    A TRAVÉS de ella (scrub pineado) hasta disolverla.
  · "Object reveal on hover" (@seanaiux): un TRONCO REAL (renderizado en Blender,
    pipeline pre-render G-20/22) aparece tras el titular, y el MUSGO se revela
    exactamente donde pasa el cursor (máscara radial sobre el render con musgo).
  · "Breaking the 4th wall" (@seanaiux/lucid): partículas en un canvas MÁS GRANDE
    que la sección, derivando fuera de sus límites.
*/

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  warm: boolean;
  drift: number;
};

const PARTICLES = 260;
const ESCAPEES = 46;

export function GkHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLCanvasElement>(null);
  const fourthRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nebula = nebulaRef.current;
    const fourth = fourthRef.current;
    const section = sectionRef.current;
    if (!nebula || !fourth || !section) return;

    gsap.registerPlugin(ScrollTrigger);

    const nctx = nebula.getContext("2d");
    const fctx = fourth.getContext("2d");
    if (!nctx || !fctx) return;

    // Partículas orbitando el "iris" (deterministas por índice: sin Math.random
    // en render, y estables entre resizes).
    const seeded = (i: number, salt: number) =>
      (Math.sin(i * 127.1 + salt * 311.7) * 43758.5453) % 1;
    const abs = (n: number) => Math.abs(n);

    const orbit: Particle[] = Array.from({ length: PARTICLES }, (_, i) => ({
      angle: abs(seeded(i, 1)) * Math.PI * 2,
      radius: 70 + abs(seeded(i, 2)) * 150,
      speed: 0.0016 + abs(seeded(i, 3)) * 0.004,
      size: 0.6 + abs(seeded(i, 4)) * 1.8,
      warm: abs(seeded(i, 5)) > 0.82,
      drift: abs(seeded(i, 6)) * 0.3,
    }));

    const escapees: Particle[] = Array.from({ length: ESCAPEES }, (_, i) => ({
      angle: abs(seeded(i, 7)) * Math.PI * 2,
      radius: 40 + abs(seeded(i, 8)) * 80,
      speed: 0.12 + abs(seeded(i, 9)) * 0.5,
      size: 0.8 + abs(seeded(i, 10)) * 1.6,
      warm: abs(seeded(i, 11)) > 0.7,
      drift: 0,
    }));

    // OJO: GSAP escala el canvas — medir SIEMPRE el sticky (que no se transforma),
    // nunca el canvas mismo, o el buffer se infla con el zoom y el dibujo se sale.
    const sticky = section.querySelector<HTMLElement>(".gk-space__sticky");
    if (!sticky) return;
    let W = 0;
    let H = 0;
    let FW = 0;
    let FH = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = sticky.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      FW = W * 1.36;
      FH = H * 1.36;
      nebula.width = W * dpr;
      nebula.height = H * dpr;
      fourth.width = FW * dpr;
      fourth.height = FH * dpr;
      nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 1;
      const w = W;
      const h = H;
      const cx = w / 2;
      const cy = h / 2;

      nctx.clearRect(0, 0, w, h);

      // Iris central: anillos de gradiente que respiran.
      const breathe = 1 + Math.sin(t * 0.008) * 0.04;
      const iris = nctx.createRadialGradient(cx, cy, 8, cx, cy, 190 * breathe);
      iris.addColorStop(0, "rgba(240, 250, 248, 0.9)");
      iris.addColorStop(0.18, "rgba(121, 224, 210, 0.55)");
      iris.addColorStop(0.45, "rgba(38, 92, 92, 0.35)");
      iris.addColorStop(0.75, "rgba(232, 182, 76, 0.08)");
      iris.addColorStop(1, "rgba(7, 8, 10, 0)");
      nctx.fillStyle = iris;
      nctx.fillRect(0, 0, w, h);

      nctx.globalCompositeOperation = "lighter";
      for (const p of orbit) {
        p.angle += p.speed;
        const wobble = Math.sin(t * 0.01 + p.radius) * 8;
        const x = cx + Math.cos(p.angle) * (p.radius + wobble) * 1.35;
        const y = cy + Math.sin(p.angle) * (p.radius + wobble) * 0.55;
        nctx.fillStyle = p.warm
          ? "rgba(232, 182, 76, 0.75)"
          : "rgba(121, 224, 210, 0.6)";
        nctx.beginPath();
        nctx.arc(x, y, p.size, 0, Math.PI * 2);
        nctx.fill();
      }
      nctx.globalCompositeOperation = "source-over";

      // 4ta pared: derivan hacia afuera y se apagan; reaparecen en el centro.
      const fw = FW;
      const fh = FH;
      fctx.clearRect(0, 0, fw, fh);
      for (const p of escapees) {
        p.radius += p.speed;
        const max = Math.max(fw, fh) * 0.62;
        if (p.radius > max) p.radius = 40;
        const x = fw / 2 + Math.cos(p.angle) * p.radius;
        const y = fh / 2 + Math.sin(p.angle) * p.radius * 0.7;
        const fade = 1 - p.radius / max;
        fctx.fillStyle = p.warm
          ? `rgba(232, 182, 76, ${0.5 * fade})`
          : `rgba(121, 224, 210, ${0.45 * fade})`;
        fctx.beginPath();
        fctx.arc(x, y, p.size, 0, Math.PI * 2);
        fctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    if (!reduced) raf = requestAnimationFrame(draw);
    else draw();

    // Zoom A TRAVÉS del ojo (scrub sobre la sección pineada por sticky).
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        })
        .to(nebula, { scale: 7.5, ease: "power2.in", duration: 1 }, 0)
        .to(coreRef.current, { scale: 2.6, opacity: 0, ease: "power2.in", duration: 0.55 }, 0)
        .to(fourth, { opacity: 0, ease: "none", duration: 0.35 }, 0.55)
        .to(nebula, { opacity: 0, ease: "none", duration: 0.22 }, 0.83);
    }, section);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      ctx.revert();
    };
  }, []);

  // Object reveal: el tronco entra al hover del titular; el MUSGO se revela
  // donde toca el cursor (máscara radial sobre el render con musgo).
  useEffect(() => {
    const title = titleRef.current;
    const logEl = logRef.current;
    if (!title || !logEl) return;
    const moss = logEl.querySelector<HTMLElement>(".gk-log__moss");
    if (!moss) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(logEl, { opacity: 1, scale: 1 });
      moss.style.setProperty("--mx", "50%");
      moss.style.setProperty("--my", "35%");
      return;
    }

    const xTo = gsap.quickTo(logEl, "x", { duration: 0.7, ease: "power3.out" });
    const rTo = gsap.quickTo(logEl, "rotation", { duration: 0.9, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      const rect = logEl.getBoundingClientRect();
      moss.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      moss.style.setProperty("--my", `${e.clientY - rect.top}px`);
      const rel = (e.clientX - rect.left) / rect.width - 0.5;
      xTo(rel * 36);
      rTo(rel * 5);
    };
    const enter = () =>
      gsap.to(logEl, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" });
    const leave = () => {
      gsap.to(logEl, { opacity: 0, scale: 0.88, duration: 0.45, ease: "power2.in" });
      moss.style.setProperty("--mx", "-999px");
      moss.style.setProperty("--my", "-999px");
    };

    title.addEventListener("pointermove", move);
    title.addEventListener("pointerenter", enter);
    title.addEventListener("pointerleave", leave);
    return () => {
      title.removeEventListener("pointermove", move);
      title.removeEventListener("pointerenter", enter);
      title.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="gk-space" ref={sectionRef}>
      <div className="gk-space__sticky">
        <canvas className="gk-fourth" ref={fourthRef} aria-hidden />
        <canvas className="gk-nebula" ref={nebulaRef} aria-hidden />
        <div className="gk-hero-core" ref={coreRef}>
          <div className="gk-log" ref={logRef} aria-hidden>
            <Image src="/lab/gatekeep/log-bark.png" alt="" width={1400} height={1000} />
            <Image
              className="gk-log__moss"
              src="/lab/gatekeep/log-moss.png"
              alt=""
              width={1400}
              height={1000}
            />
          </div>
          <h1 ref={titleRef}>
            GATE
            <em>KEEP</em>
            <br />
            NADA
          </h1>
          <p>réplica de estudio · el musgo crece donde pasa tu cursor · luego baja</p>
        </div>
        <span className="gk-eyebrow gk-space__hint">scroll — atraviesa el ojo</span>
      </div>
    </div>
  );
}
