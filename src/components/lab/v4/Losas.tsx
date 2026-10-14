"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";

/*
  Pitch C (Alejo, 14-oct: "me gusta porque es una sección distinta y así hay protagonismo a los materiales").
  Referencias: Vanity (las frases anteriores no desaparecen, se apilan; la última losa es clara) y textura.agency
  (índice lateral fijo). Tres losas de piso a techo —piedra, piedra, cuarzo— con filo dorado; cada una se pega
  arriba y tapa a la anterior, que se encoge un poco y se oscurece. Cada frase lleva al lado una prueba.
*/
type Losa = { material: "piedra" | "cuarzo"; frase: string; detalle: string; prueba: "obra" | "recorrido" | "correo" };

const LOSAS: Losa[] = [
  { material: "piedra", frase: "Diseño a la medida de tu obra.", detalle: "Cada sitio parte de tus proyectos: su luz, sus materiales, su manera de mostrarse.", prueba: "obra" },
  { material: "piedra", frase: "Cada proyecto se recorre.", detalle: "Fotos, planos y recorridos: el visitante camina la obra antes de escribirte.", prueba: "recorrido" },
  { material: "cuarzo", frase: "Cada consulta llega a tu correo.", detalle: "El formulario filtra, guarda y te avisa ese mismo minuto. Cada semana, un respaldo.", prueba: "correo" },
];

function Prueba({ tipo }: { tipo: Losa["prueba"] }) {
  if (tipo === "correo") {
    // ejemplo del aviso que llega (formato real del sistema; los datos son de muestra y lo dice)
    return (
      <div className="v4-correo" role="img" aria-label="Ejemplo del aviso de una consulta nueva en el correo">
        <p className="v4-mono" style={{ color: "#6d6a63" }}>Ejemplo · aviso de consulta</p>
        <p className="mt-3 text-[15px] font-medium" style={{ color: "var(--piedra-950)" }}>Nueva consulta desde tu sitio</p>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]" style={{ color: "#3d3b37" }}>
          <dt className="v4-mono">Nombre</dt><dd>Laura G.</dd>
          <dt className="v4-mono">Proyecto</dt><dd>Casa en Chía · 280 m²</dd>
          <dt className="v4-mono">Etapa</dt><dd>Tiene lote, busca diseño</dd>
          <dt className="v4-mono">Recibida</dt><dd>10:42 · respaldada</dd>
        </dl>
      </div>
    );
  }
  const foto = tipo === "obra" ? "mh-sala" : "villa-salon";
  const pie = tipo === "obra" ? "MH Interior · sitio de cliente" : "Villa Savoye · recorrido";
  return (
    <figure className="v4-losa-foto">
      {/* eslint-disable-next-line @next/next/no-img-element -- foto de prueba dentro de la losa */}
      <img src={`/lab/v4/proyectos/${foto}.webp`} alt={pie} loading="lazy" />
      <figcaption className="v4-mono mt-3">{pie}</figcaption>
    </figure>
  );
}

export function Losas() {
  const seccion = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = seccion.current;
    if (!el || sinMovimiento()) return;
    const losas = Array.from(el.querySelectorAll<HTMLElement>("[data-losa]"));
    const indice = Array.from(el.querySelectorAll<HTMLElement>("[data-indice]"));
    return observarProgreso(el, (p) => {
      // p recorre las tres losas: cada tercio, la siguiente sube y tapa a la anterior
      const pos = p * (LOSAS.length - 1);
      losas.forEach((l, i) => {
        const tapada = Math.min(1, Math.max(0, pos - i));
        l.style.transform = `scale(${(1 - tapada * 0.04).toFixed(4)})`;
        l.style.filter = `brightness(${(1 - tapada * 0.45).toFixed(3)})`;
      });
      indice.forEach((n, i) => n.toggleAttribute("data-activo", Math.round(pos) === i));
    });
  }, []);

  return (
    <section ref={seccion} id="v4-losas" aria-label="Lo que hago" className="v4-losas relative" style={{ height: `${LOSAS.length * 100}svh` }}>
      <ol className="v4-losas-indice" aria-hidden>
        {LOSAS.map((l, i) => <li key={l.frase} data-indice className="v4-mono">{String(i + 1).padStart(2, "0")}</li>)}
      </ol>
      {LOSAS.map((l, i) => (
        <article key={l.frase} data-losa className={`v4-losa-c v4-losa-${l.material}`} style={{ top: `${i * 14}px`, zIndex: i + 1 }}>
          <div className="v4-losa-texto">
            <p className="v4-mono" style={{ color: "var(--veta-oro)" }}>{String(i + 1).padStart(2, "0")} / {String(LOSAS.length).padStart(2, "0")}</p>
            <h3 className="v4-display v4-losa-frase">{l.frase}</h3>
            <p className="v4-losa-detalle">{l.detalle}</p>
          </div>
          <Prueba tipo={l.prueba} />
        </article>
      ))}
    </section>
  );
}
