"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Monta la figura hero SOLO en desktop con puntero fino, gateada por JS (no solo
 * CSS): así Three.js ni se descarga ni renderiza en mobile → protege Lighthouse.
 * Cristal R3F en vivo (Alejandro prefirió esta figura al arco, más translúcida).
 * Carga diferida (ssr:false) → three fuera del bundle inicial.
 */
const HeroCrystal = dynamic(
  () => import("./HeroCrystal").then((m) => m.HeroCrystal),
  { ssr: false },
);

export function HeroCrystalMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    // diferido a macrotask (evita react-hooks/set-state-in-effect)
    const id = window.setTimeout(() => setEnabled(mq.matches), 0);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener("change", onChange);
    return () => {
      window.clearTimeout(id);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return enabled ? <HeroCrystal /> : null;
}
