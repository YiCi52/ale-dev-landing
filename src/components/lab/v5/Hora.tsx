"use client";

import { useEffect, useState } from "react";

import { faseLunar } from "./luna-hoy";
import { TEXTOS, type Idioma } from "./textos";

/*
  Lo vivo que no depende del visitante: la hora de Bogotá y la luna de hoy (fase real, calculada). Se pinta después de
  montar para no chocar con el HTML del servidor, y se actualiza sola cada medio minuto.
*/
export function Hora({ idioma = "es" }: { idioma?: Idioma }) {
  const [texto, setTexto] = useState("");
  useEffect(() => {
    const poner = () => {
      const ahora = new Date();
      const t = TEXTOS[idioma].hora;
      const hora = ahora.toLocaleTimeString(t.locale, { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });
      const f = faseLunar(ahora);
      setTexto(`${t.ciudad} ${hora} · ${t.fases[f.indice]} ${Math.round(f.iluminada * 100)}\u00a0%`);
    };
    poner();
    const id = window.setInterval(poner, 30000);
    return () => window.clearInterval(id);
  }, [idioma]);
  return <p className="v5-mono" aria-live="off" suppressHydrationWarning>{texto || "Bogotá"}</p>;
}
