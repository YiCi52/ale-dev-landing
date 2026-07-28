"use client";

import { useRef } from "react";

import { CandlestickLogo } from "./CandlestickLogo";

const TILT_MAX = 12;

/**
 * Sección "Taurus Competitions": tarjeta de vidrio (glassmorphism) que se
 * inclina en 3D siguiendo el puntero — `perspective` + `rotateX/Y` puros, sin
 * WebGL. La profundidad es toda CSS.
 */
export function TaurusGlass() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width - 0.5;
    const py = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--rx", `${(-py * TILT_MAX).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(px * TILT_MAX).toFixed(2)}deg`);
  };

  const reset = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  return (
    <section className="taurus-glass" aria-labelledby="taurus-glass-title">
      <div className="taurus-glass__stage">
        <div
          ref={cardRef}
          className="taurus-glass__card"
          onPointerMove={handlePointerMove}
          onPointerLeave={reset}
        >
          <div className="taurus-glass__logo">
            <CandlestickLogo className="taurus-glass__mark" />
          </div>
          <p className="taurus-eyebrow">Taurus Competitions</p>
          <h2 id="taurus-glass-title">
            Everyone has
            <br />
            something to gain.
          </h2>
          <p className="taurus-glass__body">
            New competitions launch daily from the Taurus dashboard. Compete for
            cash prizes, Taurus Coins, free challenges and account upgrades — your
            challenge stays unchanged.
          </p>
          <button type="button" className="taurus-btn taurus-btn--ghost">
            Join a Competition
          </button>
        </div>
      </div>
    </section>
  );
}
