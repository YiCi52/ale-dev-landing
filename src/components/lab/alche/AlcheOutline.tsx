"use client";

import { useReveal } from "@/hooks/use-reveal";

/** Triángulo redondeado en coordenadas SVG — misma silueta que la geometría 3D. */
const TRIANGLE_PATH =
  "M100 22 L166 138 A18 18 0 0 1 150 166 L50 166 A18 18 0 0 1 34 138 Z";

/**
 * Momento de inversión: el fondo se aclara y el mismo triángulo se dibuja solo
 * con un trazo. Es la tercera vida del objeto — cromo, malla, línea.
 */
export function AlcheOutline() {
  const { ref, visible } = useReveal<HTMLElement>({ threshold: 0.35 });

  return (
    <section
      ref={ref}
      className={`alche-outline${visible ? " is-drawn" : ""}`}
      aria-labelledby="alche-outline-title"
    >
      <svg
        className="alche-outline__svg"
        viewBox="0 0 200 200"
        role="img"
        aria-labelledby="alche-outline-svg-title"
      >
        <title id="alche-outline-svg-title">Logotipo de ALCHE dibujándose</title>
        <path d={TRIANGLE_PATH} className="alche-outline__stroke" />
      </svg>

      <div className="alche-outline__copy">
        <h2 id="alche-outline-title">
          一つの形、
          <br />
          三つの状態
        </h2>
        <p>
          Una forma, tres estados. El mismo triángulo sostiene el sitio entero —
          por eso se recuerda.
        </p>
      </div>
    </section>
  );
}
