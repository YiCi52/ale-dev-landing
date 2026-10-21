"use client";

import { type CSSProperties, useEffect, useRef } from "react";

import { MARCAS, PlantaSvg } from "./PlantaSvg";
import { observarProgreso, sinMovimiento } from "./scroll";
import { TEXTOS, type Idioma } from "./textos";
import "./planta.css";

/*
  "Por dentro" (Alejo, 19-oct: "que de frente pase a un plano desde arriba"; 20-oct: "el plano de la v4 sí estaba
  hermoso"). El último cuadro del hero se apaga, desde el centro se abre el papel (cuarzo en claro, noche en oscuro) y la
  planta de la misma casa se dibuja en tinta con el scroll: bordes, cajas, muros, muebles, cotas. Al final aparecen los
  cinco recintos numerados; cada número es una parte del sistema y la lista dice cuál.
*/
const tramo = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export function Plano({ idioma = "es" }: { idioma?: Idioma }) {
  const tp = TEXTOS[idioma].plano;
  const seccion = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = seccion.current;
    const fija = el?.querySelector<HTMLElement>(".v5-plano-fija");
    if (!el || !fija) return;
    const render = el.querySelector<HTMLImageElement>(".v5-plano-render");
    const raiz = el.closest<HTMLElement>(".v5-raiz");
    const ponerRender = () => {
      if (render) render.src = `/lab/v5/${raiz?.getAttribute("data-tema") === "claro" ? "casa-dia" : "casa-sinluna"}/1440/c-120.webp`;
    };
    ponerRender();
    const vigia = new MutationObserver(ponerRender);
    if (raiz) vigia.observe(raiz, { attributes: true, attributeFilter: ["data-tema"] });

    // el recinto y su renglón de la lista se encienden juntos, se toque cuál se toque
    const marcar = (id: string | null) => {
      el.querySelectorAll<Element>("[data-llamada]").forEach((n) => {
        n.toggleAttribute("data-activo", n.getAttribute("data-llamada") === id);
        n.toggleAttribute("data-atenuado", id !== null && n.getAttribute("data-llamada") !== id);
      });
    };
    const alEntrar = (ev: Event) => {
      const id = (ev.target as Element | null)?.closest?.("[data-llamada]")?.getAttribute("data-llamada");
      marcar(id ?? null);
    };
    const alSalir = () => marcar(null);
    fija.addEventListener("pointerover", alEntrar);
    fija.addEventListener("focusin", alEntrar);
    fija.addEventListener("pointerleave", alSalir);
    fija.addEventListener("focusout", alSalir);

    const aplicar = (p: number) => {
      fija.style.setProperty("--apaga", String(tramo(p, 0, 0.12)));
      fija.style.setProperty("--papel", String(tramo(p, 0.06, 0.24)));
      fija.style.setProperty("--trazo", String(tramo(p, 0.16, 0.66)));
      fija.style.setProperty("--relleno", String(tramo(p, 0.5, 0.7)));
      fija.style.setProperty("--llamadas", String(tramo(p, 0.62, 0.86)));
    };
    const quitar = sinMovimiento() ? (aplicar(1), () => {}) : observarProgreso(el, aplicar);
    return () => {
      quitar(); vigia.disconnect();
      fija.removeEventListener("pointerover", alEntrar); fija.removeEventListener("focusin", alEntrar);
      fija.removeEventListener("pointerleave", alSalir); fija.removeEventListener("focusout", alSalir);
    };
  }, []);

  return (
    <section ref={seccion} className="v5-plano" aria-labelledby="v5-plano-t">
      <div className="v5-plano-fija">
        {/* eslint-disable-next-line @next/next/no-img-element -- último cuadro del hero (misma cámara) */}
        <img src="/lab/v5/casa-sinluna/1440/c-120.webp" alt="" className="v5-plano-render" loading="lazy" />
        <div className="v5-papel" aria-hidden />
        <div className="v5-planta v5-gutter">
          <header className="v5-planta-titulo">
            <p className="v5-mono">{tp.rotulo}</p>
            <h2 id="v5-plano-t" className="v5-display">{tp.titulo} <span className="v5-luz">{tp.tituloLuz}</span></h2>
          </header>
          <div className="v5-planta-dibujo">
            <PlantaSvg corte={tp.corte} nombres={tp.llamadas.map((l) => l[0])} />
          </div>
          <ol className="v5-planta-lista">
            {tp.llamadas.map(([nombre, texto], k) => (
              <li key={nombre} data-llamada={MARCAS[k].id} tabIndex={0} style={{ "--i": k / tp.llamadas.length } as CSSProperties}>
                <span className="v5-planta-numero" aria-hidden>{k + 1}</span>
                <span><strong className="font-medium">{nombre}.</strong> {texto}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
