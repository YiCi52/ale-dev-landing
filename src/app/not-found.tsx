import Link from "next/link";

import { Cabecera } from "@/components/lab/v5/Cabecera";
import { archivo, newsreader } from "@/components/lab/v5/fuentes";
import "./(v5)/v5.css";

/* 404 con la piel de la v5 (24-oct): antes salía la página por defecto de Next, fuera del diseño del sitio. */
export default function NoEncontrada() {
  return (
    <div className={`v5-raiz ${archivo.variable} ${newsreader.variable}`}>
      <Cabecera />
      <main className="v5-gutter v5-404">
        <p className="v5-mono">404</p>
        <h1 className="v5-display">Esta página <span className="v5-luz">no tiene luz.</span></h1>
        <p className="v5-texto">La dirección no existe o se movió. El resto del sitio sí está encendido.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="v5-boton v5-boton-luz">Volver al inicio</Link>
          <Link href="/trabajo" className="v5-boton v5-boton-linea">Ver trabajo</Link>
        </div>
      </main>
    </div>
  );
}
