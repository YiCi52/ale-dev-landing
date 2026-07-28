"use client";

import { useEffect, useRef, useState } from "react";

type RevealOptions = {
  threshold?: number;
  rootMargin?: string;
};

/**
 * Observa un elemento y devuelve `visible` la primera vez que entra al viewport
 * (one-shot: se desconecta al revelar). El elemento se estiliza con las clases
 * `.reveal*` de globals.css, que ya respetan reduced-motion vía el reset global.
 *
 * Se expone como hook para poder aplicar el reveal DIRECTO sobre cualquier
 * elemento (li, h2, figure) sin meter un `<div>` wrapper que rompa grids.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: RevealOptions,
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback sin IntersectionObserver: diferido a macrotask para no hacer
    // setState síncrono dentro del effect.
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Revela al entrar, PERO también si el elemento ya quedó por encima del
        // viewport (llegada por ancla #seccion, o scroll rápido que se saltó el
        // cruce): sin esto quedaría invisible para siempre en opacity:0.
        const scrolledPast = entry.boundingClientRect.bottom <= 0;
        if (entry.isIntersecting || scrolledPast) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.12,
        rootMargin: options?.rootMargin ?? "0px 0px -80px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, visible };
}
