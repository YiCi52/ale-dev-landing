import type { Metadata } from "next";

import { Cabecera } from "@/components/lab/v5/Cabecera";
import { archivo, newsreader } from "@/components/lab/v5/fuentes";
import { Imanes } from "@/components/lab/v5/Imanes";

import "./v5.css";

/*
  Versión 5 de la página propia (18-oct-2026): "Luz prestada". La v4 queda quieta en /lab/v4 para el feedback de Alejo.
  Archivo (con eje de ancho) manda en títulos y texto; Newsreader cursiva solo para las palabras de luz; Geist Mono (del
  layout raíz) para lo técnico. Desde el 24-oct es el sitio completo (grupo de rutas (v5)).
*/

/* 24-oct: la v5 es el sitio (antes en /lab/v5, sin indexar). Cada página trae sus metadatos (components/lab/v5/meta.ts). */
export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

const TEMA_ANTES = `(function(){try{var t=localStorage.getItem("v5-tema");if(t!=="claro"&&t!=="oscuro"){var h=Number(new Date().toLocaleString("en-US",{hour:"numeric",hour12:false,timeZone:"America/Bogota"}));t=h>=6&&h<18?"claro":"oscuro";}document.currentScript.parentElement.setAttribute("data-tema",t);}catch(e){}})();`;

export default function V5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v5-raiz ${archivo.variable} ${newsreader.variable}`} suppressHydrationWarning>
      {/* misma regla que Tema.tsx (elección guardada o la hora de Bogotá), aplicada antes de pintar */}
      <script dangerouslySetInnerHTML={{ __html: TEMA_ANTES }} />
      <Cabecera />
      <Imanes />
      <main>{children}</main>
    </div>
  );
}
