import { SetbyHero } from "@/components/lab/setby/SetbyHero";

import "./setby.css";

/**
 * Réplica de estudio del hero "Setby" (@ayzz.thedesigner).
 *
 * Prueba de capacidad del pipeline 3D pre-renderizado: contenedor de carga
 * modelado y renderizado en Blender (Cycles), integrado como hero con sándwich
 * de tipografía y swing pendular en CSS. Cero WebGL en el navegador.
 */
export default function SetbyPage() {
  return (
    <main className="setby">
      <header className="setby-nav">
        <span className="setby-nav__brand">
          <span className="setby-nav__mark" aria-hidden>
            ◤
          </span>
          Setby
        </span>
        <nav aria-label="Navegación del demo">
          <a href="#setby-hero-title">Services</a>
          <a href="#setby-hero-title">Network</a>
          <a href="#setby-hero-title">Contact</a>
        </nav>
        <span className="setby-nav__tag">Logistics Enhanced</span>
      </header>

      <SetbyHero />

      <footer className="setby-footer">
        <p>
          Réplica de estudio · 3D pre-renderizado en Blender · referencia:
          @ayzz.thedesigner
        </p>
      </footer>
    </main>
  );
}
