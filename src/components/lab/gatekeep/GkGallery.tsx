"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/*
  S3.5 — "3D Gallery" (@seanaiux, sitio EdenVale): esfera de tarjetas orbitando.
  Click en una tarjeta → vuela al frente (FLIP a overlay centrado) y la esfera
  se atenúa detrás; click de nuevo → vuelve a su órbita. Ejemplo vacío.
*/

const COUNT = 42;
const RADIUS = 290;

// Esfera de Fibonacci precomputada (determinista y REDONDEADA a 2 decimales:
// el SSR serializa floats completos y el cliente los recorta — sin redondeo
// hay hydration mismatch en cada button).
const r2 = (n: number) => Math.round(n * 100) / 100;
const POINTS = Array.from({ length: COUNT }, (_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    x: r2(Math.cos(theta) * Math.sin(phi) * RADIUS),
    y: r2(Math.cos(phi) * RADIUS * 0.72),
    z: r2(Math.sin(theta) * Math.sin(phi) * RADIUS),
    hue: Math.round(((i * 137.5) % 360 + 360) % 360),
  };
});

export function GkGallery() {
  const sphereRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const spinRef = useRef<gsap.core.Tween | null>(null);
  const ghostRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sphere = sphereRef.current;
    if (!sphere) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const spin = gsap.to(sphere, {
      rotationY: "+=360",
      duration: 60,
      ease: "none",
      repeat: -1,
    });
    gsap.to(sphere, {
      rotationX: 8,
      duration: 9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    spinRef.current = spin;
    return () => {
      spin.kill();
      gsap.killTweensOf(sphere);
    };
  }, []);

  // FLIP casero: clona la tarjeta clickeada, la vuela al centro del viewport,
  // y al cerrar la devuelve a su celda de la esfera.
  const focus = (i: number, el: HTMLElement) => {
    if (focused !== null) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    setFocused(i);
    spinRef.current?.pause();

    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.classList.add("gk-gal__ghost");
    ghost.style.top = `${rect.top}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    el.style.opacity = "0";

    gsap.to(overlay, { autoAlpha: 1, duration: 0.35 });
    gsap.to(ghost, {
      top: "50%",
      left: "50%",
      xPercent: -50,
      yPercent: -50,
      width: "min(560px, 82vw)",
      height: "auto",
      aspectRatio: "16/10",
      duration: 0.65,
      ease: "power3.inOut",
    });

    const release = () => {
      gsap.to(overlay, { autoAlpha: 0, duration: 0.3 });
      const back = el.getBoundingClientRect();
      gsap.to(ghost, {
        top: back.top,
        left: back.left,
        xPercent: 0,
        yPercent: 0,
        width: back.width,
        height: back.height,
        duration: 0.55,
        ease: "power3.inOut",
        onComplete: () => {
          el.style.opacity = "1";
          ghost.remove();
          ghostRef.current = null;
          setFocused(null);
          spinRef.current?.play();
        },
      });
    };
    ghost.addEventListener("click", release, { once: true });
    overlay.addEventListener("click", release, { once: true });
  };

  return (
    <section className="gk-gal" aria-label="Galería 3D (demo)">
      <div className="gk-section-head">
        <h2>Galería orbital</h2>
        <span className="gk-eyebrow">click en una pieza para enfocarla</span>
      </div>
      <div className="gk-gal__scene" ref={sceneRef}>
        <div className="gk-gal__sphere" ref={sphereRef}>
          {POINTS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="gk-gal__card"
              aria-label={`Pieza ${i + 1} de la galería (demo)`}
              onClick={(e) => focus(i, e.currentTarget)}
              style={{
                background: `linear-gradient(150deg, hsl(${p.hue} 36% 20%), hsl(${p.hue} 55% 46%))`,
                transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="gk-gal__overlay" ref={overlayRef} aria-hidden />
    </section>
  );
}
