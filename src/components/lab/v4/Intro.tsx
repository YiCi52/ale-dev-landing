/*
  Pantalla de carga (Alejo, 14-oct; referencia: StringTune / Igloo, ~2 s medidos en string-tune.fiddle.digital).
  Aparece la luna llena real, una sombra la eclipsa hasta dejar exactamente la C del logo (creciente fina: círculo
  de radio 100 menos uno de 91 corrido 24 a la derecha), la C se vuelve luz y la cortina se abre al hero.
  Solo CSS: está pintada desde el primer cuadro, sin esperar JavaScript. Con movimiento reducido no se muestra.
*/
const C_LOGO = (() => {
  const R = 100, r = 91, dx = 24, x = (R * R - r * r + dx * dx) / (2 * dx), y = Math.sqrt(R * R - x * x);
  return `M${x.toFixed(2)},${(-y).toFixed(2)} A${R},${R} 0 1 0 ${x.toFixed(2)},${y.toFixed(2)} A${r},${r} 0 ${x > dx ? 1 : 0} 1 ${x.toFixed(2)},${(-y).toFixed(2)}Z`;
})();

export function Intro() {
  return (
    <div className="v4-intro" aria-hidden>
      <div className="v4-intro-luna">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen fija de la carga, pintada antes de hidratar */}
        <img src="/lab/v4/luna/luna-llena.webp" alt="" width={720} height={720} fetchPriority="high" className="v4-intro-disco" />
        <span className="v4-intro-sombra" />
        <svg viewBox="-100 -100 200 200" className="v4-intro-c">
          <path d={C_LOGO} fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
