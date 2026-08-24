import { CatMascot } from "@/components/ui";

/*
  LunaLoader — la pantalla de carga ES el sello (BRIEF §2b).

  Cero JS de componente: el gate inline de la página pone
  data-luna-loader="play" en <html> ANTES del primer pintado (mismo patrón
  del sello en layout.tsx) y el CSS hace el resto — la luna pasa de nueva a
  llena en 0.9s, la línea se llena en 1s y el overlay se desvanece SOLO a
  los 1.15s (tope duro del brief: 1.2s). Si sessionStorage está bloqueado o
  ya se vio en esta sesión, el atributo no existe y el loader ni se pinta.
  reduced-motion lo elimina por CSS.
*/
export function LunaLoader() {
  return (
    <div className="luna-loader luna" aria-hidden>
      <div className="flex items-center gap-4">
        <div className="luna-loader__astro">
          <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <defs>
              <mask id="luna-loader-fase" maskUnits="userSpaceOnUse" x="0" y="0" width="60" height="60">
                <rect width="60" height="60" fill="#fff" />
                <circle className="luna-sombra" cx="30" cy="30" r="20.5" fill="#000" />
              </mask>
            </defs>
            <circle cx="30" cy="30" r="20" fill="var(--luna-glow)" mask="url(#luna-loader-fase)" />
          </svg>
        </div>
        <div className="w-10 text-[color:var(--luna-muted)]">
          <CatMascot className="h-auto w-full" />
        </div>
      </div>
      <p className="luna-label">Castillo — Bogotá ©2026</p>
      <div className="luna-loader__linea" />
    </div>
  );
}
