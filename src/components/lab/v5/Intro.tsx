"use client";

import { useEffect, useState } from "react";

import { C_LOGO } from "./marca";

/*
  Carga (la que le gustó a Alejo en la v4): la luna llena real, una sombra la eclipsa hasta dejar la C del logo, la C se
  vuelve luz y la cortina se abre a la noche del hero. Solo CSS, pintada desde el primer cuadro. Con movimiento reducido
  no se muestra.
  21-oct (Alejo): solo al abrir la página y al tocar el logo; cambiar de idioma o volver de otra página no la repite.
  El estado vive en el módulo: sobrevive a la navegación dentro del sitio y se reinicia al recargar.
*/
let yaSeVio = false;
let pedida = false;

/** El logo la pide antes de navegar al inicio. */
export function pedirIntro(): void {
  pedida = true;
}

export function Intro() {
  const [mostrar] = useState(() => !yaSeVio || pedida);
  useEffect(() => {
    yaSeVio = true;
    pedida = false;
  }, []);
  if (!mostrar) return null;
  return (
    <div className="v5-intro" aria-hidden>
      <div className="v5-intro-luna">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen fija de la carga, pintada antes de hidratar */}
        <img src="/lab/v5/luna-llena.webp" alt="" width={720} height={720} fetchPriority="high" className="v5-intro-disco" />
        <span className="v5-intro-sombra" />
        <svg viewBox="-100 -100 200 200" className="v5-intro-c">
          <path d={C_LOGO} fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
