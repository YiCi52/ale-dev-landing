"use client";

import { useEffect, useState } from "react";

/*
  Tema claro/oscuro (Alejo, 19-oct, como en la página de Mari). Por defecto sigue la hora de Bogotá: de 6 a 18 claro (papel
  de plano, líneas negras), de noche oscuro. Si el visitante lo cambia a mano, se respeta su elección en este navegador.
  En claro el hero es la misma casa de día, con la luna pálida en el cielo; la carga sigue siendo de noche.
*/
type Tema = "claro" | "oscuro";
const CLAVE = "v5-tema";

function porHora(): Tema {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Bogota" }));
  return h >= 6 && h < 18 ? "claro" : "oscuro";
}

function leerGuardado(): Tema | null {
  try {
    const v = window.localStorage.getItem(CLAVE);
    return v === "claro" || v === "oscuro" ? v : null;
  } catch {
    return null;
  }
}

function aplicar(t: Tema) {
  document.querySelector<HTMLElement>(".v5-raiz")?.setAttribute("data-tema", t);
}

export function Tema() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    // el tema real solo se conoce en el navegador (hora local y elección guardada)
    const iniciar = () => { const t = leerGuardado() ?? porHora(); aplicar(t); setTema(t); };
    iniciar();
  }, []);

  const cambiar = () => {
    const t: Tema = tema === "claro" ? "oscuro" : "claro";
    aplicar(t);
    setTema(t);
    try { window.localStorage.setItem(CLAVE, t); } catch { /* sin almacenamiento: el cambio vale solo esta visita */ }
  };

  const claro = tema === "claro";
  return (
    <button type="button" className="v5-tema" onClick={cambiar} aria-label={claro ? "Cambiar a tema oscuro" : "Cambiar a tema claro"} aria-pressed={claro}>
      <svg viewBox="0 0 24 24" aria-hidden width="18" height="18">
        {claro ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </g>
        )}
      </svg>
    </button>
  );
}
