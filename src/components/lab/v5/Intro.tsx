import { C_LOGO } from "./marca";

/*
  Carga (la que le gustó a Alejo en la v4): la luna llena real, una sombra la eclipsa hasta dejar la C del logo, la C se
  vuelve luz y la cortina se abre a la noche del hero. Solo CSS, pintada desde el primer cuadro. Con movimiento reducido
  no se muestra.
*/
export function Intro() {
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
