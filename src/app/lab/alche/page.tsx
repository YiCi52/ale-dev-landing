import { AlcheCanvas } from "@/components/lab/alche/AlcheCanvas";
import { AlcheHero } from "@/components/lab/alche/AlcheHero";
import { AlcheHorizontal } from "@/components/lab/alche/AlcheHorizontal";
import { AlcheOutline } from "@/components/lab/alche/AlcheOutline";
import { AlcheWorks } from "@/components/lab/alche/AlcheWorks";

import "./alche.css";

/**
 * Réplica de estudio del sitio de ALCHE (@jerrythewebdev).
 *
 * Ejercicio de capacidad, no material de portafolio: reproduce el patrón del
 * objeto 3D recurrente que cambia de material por sección. El canvas es único y
 * vive fijo detrás del documento.
 */
export default function AlchePage() {
  return (
    <main className="alche">
      <AlcheCanvas />

      <nav className="alche-nav" aria-label="Navegación del demo">
        <span className="alche-nav__mark" aria-hidden>
          ◭
        </span>
        <ul>
          <li>
            <a href="#alche-title">Home</a>
          </li>
          <li>
            <a href="#alche-works-title">Works</a>
          </li>
          <li>
            <a href="#alche-outline-title">Studio</a>
          </li>
        </ul>
      </nav>

      <AlcheHero />
      <AlcheHorizontal />
      <AlcheWorks />
      <AlcheOutline />

      <footer className="alche-footer">
        <p>Réplica de estudio · referencia: ALCHE por @jerrythewebdev</p>
      </footer>
    </main>
  );
}
