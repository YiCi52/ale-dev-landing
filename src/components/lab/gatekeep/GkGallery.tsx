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
    // La esfera NO se congela: baja a cámara lenta detrás del overlay (más
    // orgánico, y elimina la clase de bugs "quedó pausada para siempre").
    if (spinRef.current) gsap.to(spinRef.current, { timeScale: 0.12, duration: 0.6 });

    const rect = el.getBoundingClientRect();
    const ghost = el.cloneNode(true) as HTMLElement;
    ghost.classList.add("gk-gal__ghost");
    ghost.style.top = `${rect.top}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    // El clon hereda el translate3d de la esfera y GSAP lo leería como punto de
    // partida (por eso "salía de la derecha"): el rect ya incluye ese offset,
    // así que el transform del clon se anula.
    ghost.style.transform = "none";
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    el.style.opacity = "0";

    // FLIP con transforms puros: top/left quedan FIJOS en el punto de partida y
    // el viaje al centro es x/y (compositor). Animar top/left era lo que cortaba
    // la animación y la dejaba descentrada.
    const targetW = Math.min(560, window.innerWidth * 0.82);
    const targetH = targetW * (10 / 16);
    const dx = (window.innerWidth - targetW) / 2 - rect.left;
    const dy = (window.innerHeight - targetH) / 2 - rect.top;

    gsap.to(overlay, { autoAlpha: 1, duration: 0.4 });
    gsap.to(ghost, {
      x: dx,
      y: dy,
      width: targetW,
      height: targetH,
      duration: 0.8,
      ease: "expo.inOut",
    });

    let released = false;
    const release = () => {
      if (released) return; // los dos listeners comparten un solo disparo
      released = true;
      if (spinRef.current) gsap.to(spinRef.current, { timeScale: 1, duration: 0.8 });
      gsap.to(overlay, { autoAlpha: 0, duration: 0.35 });
      gsap.to(ghost, {
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
        duration: 0.65,
        ease: "expo.inOut",
        onComplete: () => {
          el.style.opacity = "1";
          ghost.remove();
          ghostRef.current = null;
          setFocused(null);
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
