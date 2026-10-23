"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, useEffect, useRef } from "react";

import { montarCalco } from "./calco";
import { abrirPortal } from "./portal";
import { sinMovimiento } from "./scroll";
import { TEXTOS, type Idioma } from "./textos";

/*
  Trabajo (21-oct): galería asimétrica con la esencia de fiddle.digital (una pieza dominante y satélites chicos, marcas
  de registro alrededor de cada foto, botón ↗, nombre debajo, contador de obras), ajustada a Castillo: el cursor deja el
  calco en tinta de la foto (calco.ts) y al abrir una obra se entra por su plano (portal.ts). Fotos elegidas por impacto
  (Alejo: "más visuales que impresionen más que una cocina"): Vivere de MH Interior y la fachada de la Villa.
*/
type Pieza = { img: string; grande: boolean };
const OBRAS = [
  { id: "mh", nombre: "MH Interior", href: "/trabajo/mh-interior",
    piezas: [{ img: "/lab/v5/proyectos/mh-hidroterapia.webp", grande: true }, { img: "/lab/v5/proyectos/mh-sauna.webp", grande: false }] },
  { id: "villa", nombre: "Villa Savoye", href: "/lab/villa-savoye",
    piezas: [{ img: "/lab/v5/proyectos/villa-fachada.webp", grande: true }, { img: "/lab/v5/proyectos/villa-solarium.webp", grande: false }] },
];
const calcoDe = (img: string) => img.replace(".webp", "-calco.webp");

/* las marcas de registro de un plano: dos ejes, cuatro esquinas en diagonal y cuatro vértices */
function Registro() {
  return (
    <span className="v5-registro" aria-hidden>
      <span className="v5-reg-eje v5-reg-n" /><span className="v5-reg-eje v5-reg-s" />
      <span className="v5-reg-diag v5-reg-no" /><span className="v5-reg-diag v5-reg-ne" />
      <span className="v5-reg-diag v5-reg-so" /><span className="v5-reg-diag v5-reg-se" />
      <span className="v5-reg-punto v5-reg-pno" /><span className="v5-reg-punto v5-reg-pne" />
      <span className="v5-reg-punto v5-reg-pso" /><span className="v5-reg-punto v5-reg-pse" />
    </span>
  );
}

function Foto({ pieza, href, rotulo }: { pieza: Pieza; href: string; rotulo: string }) {
  const marco = useRef<HTMLAnchorElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (!marco.current || !lienzo.current || sinMovimiento() || !window.matchMedia("(hover: hover)").matches) return;
    return montarCalco(marco.current, lienzo.current, calcoDe(pieza.img));
  }, [pieza.img]);
  const entrar = (e: MouseEvent<HTMLAnchorElement>) => {
    const img = marco.current?.querySelector("img");
    if (!img || sinMovimiento() || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    abrirPortal(img, calcoDe(pieza.img), () => router.push(href));
  };
  return (
    <Link ref={marco} href={href} className="v5-foto" tabIndex={-1} aria-hidden="true" onClick={entrar}>
      {/* eslint-disable-next-line @next/next/no-img-element -- foto del proyecto; el calco se pinta encima en el lienzo */}
      <img src={pieza.img} alt="" loading="lazy" decoding="async" />
      <canvas ref={lienzo} className="v5-foto-calco" />
      <span className="v5-foto-rotulo v5-mono">{rotulo}</span>
      <span className="v5-foto-flecha" aria-hidden>↗</span>
    </Link>
  );
}

/* cada marco entra una sola vez al aparecer (no va ligado al scroll: así no se ve el corte al frenar) */
function useEntrada() {
  const galeria = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = galeria.current;
    if (!el) return;
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) if (e.isIntersecting) { e.target.setAttribute("data-visto", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -12% 0px" });
    el.querySelectorAll(".v5-marco").forEach((m) => io.observe(m));
    el.setAttribute("data-listo", "");
    return () => io.disconnect();
  }, []);
  return galeria;
}

export function Trabajo({ idioma = "es" }: { idioma?: Idioma }) {
  const tx = TEXTOS[idioma].trabajo;
  const galeria = useEntrada();
  const router = useRouter();
  const abrirDesdeEnlace = (e: MouseEvent<HTMLAnchorElement>, href: string, img: string) => {
    const foto = e.currentTarget.closest(".v5-marco")?.querySelector<HTMLImageElement>(".v5-foto img");
    if (!foto || sinMovimiento() || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    abrirPortal(foto, calcoDe(img), () => router.push(href));
  };
  return (
    <section id="v5-trabajo" className="v5-trabajo v5-gutter" aria-labelledby="v5-trabajo-t">
      <div className="v5-trabajo-cabeza">
        <div>
          <p className="v5-mono mb-5">{tx.rotulo}</p>
          <h2 id="v5-trabajo-t" className="v5-display text-[clamp(40px,6vw,96px)]">{tx.titulo} <span className="v5-luz">{tx.tituloLuz}</span></h2>
        </div>
        <p className="v5-texto max-w-[34ch]"><span className="v5-solo-cursor">{tx.pista}</span><span className="v5-solo-tactil">{tx.pistaTactil}</span></p>
        <p className="v5-trabajo-cuenta" aria-label={`${OBRAS.length} ${tx.cuenta}`}>
          <span className="v5-display" aria-hidden>{String(OBRAS.length).padStart(2, "0")}</span>
          <span className="v5-mono" aria-hidden>{tx.cuenta}</span>
        </p>
      </div>
      <div ref={galeria} className="v5-galeria">
        {OBRAS.map((o, k) => {
          const d = tx.obras[k];
          const num = String(k + 1).padStart(2, "0");
          return o.piezas.map((p, i) => (
            <article key={`${o.id}-${i}`} className={`v5-marco ${p.grande ? "v5-marco--grande" : "v5-marco--chico"}`} data-obra={k}>
              <div className="v5-marco-foto">
                <Registro />
                <Foto pieza={p} href={o.href} rotulo={`${num}.${i + 1} · ${d.piezas[i]}`} />
              </div>
              {p.grande ? (
                <footer className="v5-marco-datos">
                  <div className="v5-obra-datos">
                    <h3 className="v5-display">{o.nombre}</h3>
                    <span className="v5-mono">{num} · {d.tipo}</span>
                  </div>
                  <p className="v5-texto">{d.detalle} <Link href={o.href} className="v5-enlace" aria-label={`${d.accion}: ${o.nombre}`} onClick={(e) => abrirDesdeEnlace(e, o.href, p.img)}>{d.accion}</Link></p>
                </footer>
              ) : (
                <p className="v5-marco-pie v5-mono">{num} · {o.nombre} — {d.piezas[i]}</p>
              )}
            </article>
          ));
        })}
      </div>
    </section>
  );
}
