"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

type Props = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

/**
 * Envuelve un CTA y lo hace "magnético": sigue el puntero con suavidad y
 * vuelve a su sitio al salir. Solo en punteros finos (no touch). El easing
 * de retorno usa la curva del proyecto.
 */
export function MagneticButton({ children, strength = 0.3, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  // Cacheado (no se re-evalúa en cada pointermove) + respeta reduced-motion.
  const enabledRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      enabledRef.current = fine.matches && !rm.matches;
    };
    update();
    fine.addEventListener("change", update);
    rm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);

  const handleMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (!enabledRef.current) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2;
    const my = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${mx * strength}px, ${my * strength * 1.3}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </span>
  );
}
