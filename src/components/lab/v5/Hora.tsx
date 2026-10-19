"use client";

import { useEffect, useState } from "react";

import { faseLunar } from "./luna-hoy";

/*
  Lo vivo que no depende del visitante: la hora de Bogotá y la luna de hoy (fase real, calculada). Se pinta después de
  montar para no chocar con el HTML del servidor, y se actualiza sola cada medio minuto.
*/
export function Hora() {
  const [texto, setTexto] = useState("");
  useEffect(() => {
    const poner = () => {
      const ahora = new Date();
      const hora = ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" });
      const f = faseLunar(ahora);
      setTexto(`Bogotá ${hora} · ${f.nombre.toLowerCase()} ${Math.round(f.iluminada * 100)} %`);
    };
    poner();
    const id = window.setInterval(poner, 30000);
    return () => window.clearInterval(id);
  }, []);
  return <p className="v5-mono" aria-live="off" suppressHydrationWarning>{texto || "Bogotá"}</p>;
}
