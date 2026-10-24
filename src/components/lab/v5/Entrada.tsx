"use client";

import { useEffect, useState } from "react";

/*
  Fundido de entrada entre páginas (24-oct). Solo al navegar dentro del sitio: en la primera carga el contenido nace
  visible, porque Chrome no cuenta como contenido principal (LCP) lo que se pinta primero con opacidad 0 y Google no
  podría medir la página. El estado vive en el módulo: la primera vez es la carga real, las siguientes son navegación.
*/
let primeraCarga = true;

export function Entrada({ children }: { children: React.ReactNode }) {
  const [anima] = useState(() => !primeraCarga);
  useEffect(() => {
    primeraCarga = false;
  }, []);
  return <div className={anima ? "v5-entra" : undefined}>{children}</div>;
}
