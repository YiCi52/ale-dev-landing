"use client";

import { useCallback, useRef } from "react";
import { GatoPerfilSilueta } from "@/components/ui/gato/GatoPerfilSilueta";
import { useProgresoEscena } from "./useProgresoEscena";

/*
  ETAPA 0 — Prototipo de COSTURA. Sin assets finales, a propósito.

  Lo único que este prototipo tiene que demostrar es que
      Hero → Portal → primera carta de Selected Work
  se puede hacer SIN COSTURA VISIBLE.

  Por eso el gato es un círculo, el cristal un rombo y el proyecto un bloque de
  color: si la costura funciona con placeholders, funciona con cualquier asset;
  si no funciona, ningún asset la salva. Dibujar el gato antes de saber esto
  sería trabajo a riesgo.

  EL MECANISMO (lo que hay que juzgar):
  el "proyecto" que revela el portal y la primera carta del acordeón son EL
  MISMO ELEMENTO. No se desvanece uno para que aparezca otro: al final de la
  escena el elemento se INTERPOLA desde pantalla completa hasta el rectángulo
  exacto de la primera carta, medido en vivo del acordeón real (FLIP). Se
  interpola con transform, nunca con width/height, para no reflowear por cuadro.
*/

export function CosturaEscena() {
  const escena = useRef<HTMLElement>(null);
  const carta = useRef<HTMLDivElement>(null);

  /* Mide el destino real de la costura: dónde vive la primera carta del
     acordeón. Se lee del DOM, no se hardcodea, para probar la costura contra
     la maqueta real y no contra un número inventado. Solo se mide en el tramo
     final, que es cuando el dato importa. */
  const medir = useCallback((p: number) => {
    if (p < 0.7) return;
    const destino = carta.current;
    const seccion = escena.current;
    if (!destino || !seccion) return;
    const r = destino.getBoundingClientRect();
    seccion.style.setProperty("--dx", `${r.left}px`);
    seccion.style.setProperty("--dy", `${r.top}px`);
    seccion.style.setProperty("--dw", `${r.width}px`);
    seccion.style.setProperty("--dh", `${r.height}px`);
  }, []);

  useProgresoEscena(escena, medir);

  return (
    <>
      <section ref={escena} className="cos-escena">
        <div className="cos-escenario">
          <div className="cos-suelo" aria-hidden="true" />
          <div className="cos-cristal" aria-hidden="true" />
          {/* ETAPA 0.5 · el círculo placeholder se sustituye por la SILUETA PURA,
              para juzgarla en la escena real y no aislada en una lámina. */}
          <div className="cos-gato" aria-hidden="true">
            <GatoPerfilSilueta className="cos-gato__svg" />
          </div>

          {/* El portal: máscara que se abre desde la silueta del cristal.
              Dentro vive el proyecto, que es el mismo elemento que termina
              siendo la primera carta. */}
          <div className="cos-portal" aria-hidden="true">
            <div className="cos-proyecto">
              <span>PROYECTO · placeholder</span>
            </div>
          </div>

          <h1 className="cos-titular">Prototipo de costura</h1>
          <p className="cos-marcador">
            p = <span className="cos-marcador__v" />
          </p>
        </div>
      </section>

      {/* Maqueta mínima del acordeón: solo importa la GEOMETRÍA de la primera
          carta, que es el destino de la costura. */}
      <section className="cos-acordeon" aria-label="Selected Work (maqueta)">
        <div ref={carta} className="cos-carta cos-carta--primera">
          <span>Primera carta · destino de la costura</span>
        </div>
        <div className="cos-carta">Segunda carta</div>
        <div className="cos-carta">Tercera carta</div>
      </section>
    </>
  );
}
