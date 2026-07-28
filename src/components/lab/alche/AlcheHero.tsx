"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

const WORDMARK = "ALCHE";
const SCRAMBLE_POOL = "▚▞ACHLE01/\\|<>";
const SCRAMBLE_STEP_MS = 55;
const SCRAMBLE_HOLD = 3;

/**
 * Wordmark que se resuelve letra a letra desde ruido de bloques — el equivalente
 * DOM del glitch de bloques RGB del sitio de referencia.
 */
function useScrambledWordmark(isEnabled: boolean) {
  const [text, setText] = useState(isEnabled ? "" : WORDMARK);

  useEffect(() => {
    if (!isEnabled) {
      setText(WORDMARK);
      return;
    }

    let frame = 0;
    const totalFrames = WORDMARK.length * SCRAMBLE_HOLD;

    const id = window.setInterval(() => {
      frame += 1;
      const settled = Math.floor(frame / SCRAMBLE_HOLD);

      setText(
        WORDMARK.split("")
          .map((char, index) => {
            if (index < settled) return char;
            return SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
          })
          .join(""),
      );

      if (frame >= totalFrames) {
        setText(WORDMARK);
        window.clearInterval(id);
      }
    }, SCRAMBLE_STEP_MS);

    return () => window.clearInterval(id);
  }, [isEnabled]);

  return text;
}

export function AlcheHero() {
  const isReducedMotion = useReducedMotion();
  const wordmark = useScrambledWordmark(!isReducedMotion);
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="alche-hero" aria-labelledby="alche-title">
      <div className="alche-rings" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div className="alche-hero__inner">
        <p className="alche-eyebrow">
          <span aria-hidden>◆</span> Creative Studio — Tokyo / Bogotá
        </p>

        <h1 id="alche-title" className="alche-wordmark">
          <span aria-hidden>{wordmark}</span>
          <span className="sr-only">{WORDMARK}</span>
        </h1>

        <p className="alche-lede">
          Diseñamos objetos que la marca puede habitar. Una sola forma, muchos
          estados — cromo, malla y trazo.
        </p>
      </div>

      <div className="alche-brief" aria-hidden>
        <p className="alche-brief__line alche-brief__line--client">
          Client: we have a 50k budget and need a CRAZY 3D website
        </p>
        <p className="alche-brief__line alche-brief__line--us">Us: hows this? 😩</p>
      </div>

      <p className="alche-scrollcue" aria-hidden>
        SCROLL
      </p>
    </section>
  );
}
