import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GatoPerfilSilueta } from "@/components/ui/gato/GatoPerfilSilueta";
import { GatoPerfilFacetado } from "@/components/ui/gato/GatoPerfilFacetado";
import { HeroCrystalMount } from "@/components/hero/HeroCrystalMount";

import "./gato.css";

/**
 * Lab · GATO C — etapa 0.5. Lámina de validación, no una sección del sitio.
 *
 * Responde tres preguntas y nada más:
 *   A · ¿la silueta pura se lee como gato?
 *   B · ¿el facetado aporta o ensucia?
 *   C · ¿alguno compite con el cristal?
 *
 * El cristal es el REAL (HeroCrystalMount, iridescence 0.45 + eje lila): la
 * comparación no sirve contra un placeholder.
 */
export const metadata: Metadata = {
  title: "Lab · GATO C validación",
  robots: { index: false, follow: false },
};

const ESCALERA = [192, 96, 64, 32, 16];

export default function GatoPage() {
  // Banco de trabajo interno del hero: existe en desarrollo, en produccion es 404.
  // La escena que sale al publico es components/hero/escena (vista previa: /lab/hero-e3).
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="gc-lamina">
      <h1 className="gc-titulo">GATO C · validación de silueta</h1>
      <p className="gc-bajada">
        Primer pase dibujado a mano para decidir la dirección. El asset final se
        cosecha del modelo Blender. Lo único que hay que juzgar acá: si la
        silueta se lee, si el facetado suma, y si alguno le pelea la atención al
        cristal.
      </p>

      <div className="gc-fila">
        <div className="gc-celda">
          <span className="gc-rotulo">A · Silueta pura</span>
          <div className="gc-caja gc-silueta">
            <GatoPerfilSilueta className="gc-svg" />
          </div>
        </div>
        <div className="gc-celda">
          <span className="gc-rotulo">B · Facetado de prueba</span>
          <div className="gc-caja">
            <GatoPerfilFacetado className="gc-svg" />
          </div>
        </div>
      </div>

      <span className="gc-rotulo">E · Perfil junto al cristal real</span>
      <div className="gc-juntos">
        <div className="gc-suelo" />
        <img src="/lab/gatoc/gato-perfil.png" alt="" className="gc-juntos__gato3d" />
        <HeroCrystalMount />
      </div>

      <span className="gc-rotulo" style={{ marginTop: "6svh", display: "block" }}>
        F · 3/4 trasero junto al cristal real
      </span>
      <div className="gc-juntos">
        <div className="gc-suelo" />
        <img src="/lab/gatoc/gato-34.png" alt="" className="gc-juntos__gato3d" />
        <HeroCrystalMount />
      </div>

      <p className="gc-rotulo" style={{ margin: "8svh 0 2svh" }}>
        Escalera de lectura · la identidad tiene que sobrevivir a 16px
      </p>
      <div className="gc-escalera">
        {ESCALERA.map((px) => (
          <div key={px} className="gc-escalon">
            <GatoPerfilSilueta className="gc-svg" />
            <style>{`.gc-escalon:nth-child(${ESCALERA.indexOf(px) + 1}) svg{width:${px}px}`}</style>
            {px}px
          </div>
        ))}
      </div>
    </main>
  );
}
