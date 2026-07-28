"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import "./hero-arch.css";

const TILT_MAX = 7;

/**
 * Figura hero: arco arquitectónico en cromo, PRE-RENDERIZADO en Blender (Cycles).
 * Reemplaza al cristal R3F en vivo: mismo carácter reactivo al cursor pero como
 * imagen fotorrealista + tilt CSS → 0 canvas WebGL (protege Lighthouse) y se ve
 * 4K real. Flote suave en idle; se inclina hacia el puntero con lag líquido.
 * Solo desktop/puntero fino. Reduced-motion: queda quieto.
 */
export function HeroArch() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      tx = ((e.clientX / window.innerWidth) * 2 - 1) * TILT_MAX;
      ty = ((e.clientY / window.innerHeight) * 2 - 1) * -TILT_MAX;
    };

    const tick = () => {
      // lag → se siente líquido, no rígido
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      stage.style.setProperty("--ry", `${cx.toFixed(2)}deg`);
      stage.style.setProperty("--rx", `${cy.toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[52%] md:block"
      style={{
        maskImage: "linear-gradient(to bottom, #000 78%, transparent 98%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent 98%)",
      }}
    >
      <div ref={stageRef} className="hero-arch-stage">
        <div className="hero-arch-float">
          <Image
            src="/hero/arch-chrome.png"
            alt=""
            width={1100}
            height={1500}
            className="hero-arch-img"
          />
        </div>
      </div>
    </div>
  );
}
