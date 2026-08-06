"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  S8 — "Particle Transformation" (@seanaiux, seg ~10-15): cubo de hielo que se
  deshace en una onda de vóxeles. 72 frames horneados en Blender (Cycles + rim
  lila, fondo transparente) escrubeados por scroll sobre canvas, estilo Apple.
  El scrub va amarrado al scroll: interruptible y reversible por construcción.
*/

const FRAME_COUNT = 72;
const FRAME_W = 1600;
const FRAME_H = 1200;
const MAX_DPR = 2;

const framePath = (i: number) =>
  `/lab/gatekeep/cube/frame_${String(i + 1).padStart(4, "0")}.png`;

export function GkCube() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLSpanElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    const images: HTMLImageElement[] = [];
    let currentFrame = -1;

    const draw = (i: number) => {
      const img = images[i];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const scale = Math.min(W / FRAME_W, H / FRAME_H);
      const dw = FRAME_W * scale;
      const dh = FRAME_H * scale;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      currentFrame = i;
      if (hudRef.current) {
        hudRef.current.textContent = `frame ${String(i + 1).padStart(3, "0")} / ${String(FRAME_COUNT).padStart(3, "0")}`;
      }
    };

    // Si el frame pedido aún no bajó, se dibuja el más cercano YA cargado hacia
    // atrás: nunca un canvas en blanco a mitad de scrub.
    const drawNearest = (target: number) => {
      for (let i = target; i >= 0; i--) {
        const img = images[i];
        if (img && img.complete && img.naturalWidth > 0) {
          if (i !== currentFrame) draw(i);
          return;
        }
      }
    };

    const wanted = reduced ? [0] : Array.from({ length: FRAME_COUNT }, (_, i) => i);
    wanted.forEach((i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(i);
      img.onload = () => {
        if (i === 0) {
          setIsReady(true);
          if (currentFrame === -1) draw(0);
        }
      };
      images[i] = img;
    });

    if (reduced) return; // cubo intacto, estático y visible

    let target = 0;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        target = Math.round(self.progress * (FRAME_COUNT - 1));
        drawNearest(target);
      },
    });

    const onResize = () => {
      fit();
      if (currentFrame >= 0) draw(currentFrame);
      else drawNearest(target);
    };
    window.addEventListener("resize", onResize);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
      images.forEach((img) => {
        if (img) img.onload = null;
      });
    };
  }, []);

  return (
    <section
      className="gk-cube"
      ref={sectionRef}
      aria-label="Cubo de hielo deshaciéndose en vóxeles (secuencia pre-renderizada, demo)"
      data-ready={isReady || undefined}
    >
      <div className="gk-cube__sticky">
        <div className="gk-section-head gk-cube__head">
          <h2>Transformación</h2>
          <span className="gk-eyebrow">scrollea — el cubo se deshace</span>
        </div>
        <div className="gk-cube__stage">
          <div className="gk-cube__skeleton" aria-hidden />
          <canvas className="gk-cube__canvas" ref={canvasRef} />
        </div>
        <span className="gk-cube__hud" ref={hudRef} aria-hidden>
          frame 001 / 072
        </span>
      </div>
    </section>
  );
}
