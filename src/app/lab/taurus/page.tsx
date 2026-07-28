import { TaurusGlass } from "@/components/lab/taurus/TaurusGlass";
import { TaurusHero } from "@/components/lab/taurus/TaurusHero";
import { TaurusPricing } from "@/components/lab/taurus/TaurusPricing";
import { TaurusSteps } from "@/components/lab/taurus/TaurusSteps";

import "./taurus.css";

/**
 * Réplica de estudio del sitio "Taurus" (@ayzz.thedesigner).
 *
 * Prueba de capacidad, no material de portafolio: reproduce el género fintech
 * dark del original — terminal de velas en vivo, logo de candlesticks, línea
 * SVG en "How It Works", configurador de precios con estado y tarjeta de vidrio
 * 3D. Todo CSS/React, sin WebGL (como el original).
 */
export default function TaurusPage() {
  return (
    <main className="taurus">
      <header className="taurus-nav">
        <span className="taurus-nav__brand">
          <span className="taurus-nav__bull" aria-hidden>
            ♉
          </span>
          TAURUS
        </span>
        <nav aria-label="Navegación del demo">
          <a href="#taurus-pricing-title">Pricing</a>
          <a href="#taurus-steps-title">How It Works</a>
          <a href="#taurus-glass-title">Competitions</a>
        </nav>
        <button type="button" className="taurus-btn taurus-btn--sm">
          Community
        </button>
      </header>

      <TaurusHero />
      <TaurusSteps />
      <TaurusPricing />
      <TaurusGlass />

      <footer className="taurus-footer">
        <p>Réplica de estudio · referencia: Taurus por @ayzz.thedesigner</p>
      </footer>
    </main>
  );
}
