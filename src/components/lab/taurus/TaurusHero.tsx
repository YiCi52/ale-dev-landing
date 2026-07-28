"use client";

import { CandlestickChart } from "./CandlestickChart";
import { CandlestickLogo } from "./CandlestickLogo";

export function TaurusHero() {
  return (
    <section className="taurus-hero" aria-labelledby="taurus-hero-title">
      <div className="taurus-hero__glow" aria-hidden />

      <div className="taurus-hero__grid">
        <div className="taurus-hero__copy">
          <p className="taurus-eyebrow">
            <span className="taurus-star" aria-hidden>
              ★★★★★
            </span>
            4.7 — Futures Prop Firm
          </p>

          <h1 id="taurus-hero-title" className="taurus-hero__title">
            Join the
            <span className="taurus-hero__title-accent"> Arena</span>
          </h1>

          <p className="taurus-hero__lede">
            Amateurs focus on profits. Professionals focus on process. A futures
            prop firm designed for traders who think long term.
          </p>

          <form
            className="taurus-hero__cta"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="tu@email.com"
              aria-label="Email"
              className="taurus-hero__input"
            />
            <button type="submit" className="taurus-btn">
              Get Started
            </button>
          </form>
        </div>

        <div className="taurus-hero__panel">
          <div className="taurus-terminal">
            <div className="taurus-terminal__head">
              <span>TAURUS·50K</span>
              <span className="taurus-terminal__price">$1,428.60</span>
              <span className="taurus-terminal__delta">▲ 2.14%</span>
            </div>
            <CandlestickChart className="taurus-terminal__chart" />
          </div>

          <div className="taurus-logo-badge">
            <CandlestickLogo className="taurus-logo-badge__mark" />
            <p>
              Built For Traders.
              <br />
              <span>Not Designed For Failure.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
