"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

// Lazy: three.js NO se descarga en SSR ni en mobile (gate por JS antes de montar).
const LabGlass = dynamic(() => import("./LabGlass").then((m) => m.LabGlass), {
  ssr: false,
});

const ESCRITORIO = "(min-width: 768px) and (pointer: fine)";
const suscribir = (aviso: () => void) => {
  const mql = window.matchMedia(ESCRITORIO);
  mql.addEventListener("change", aviso);
  return () => mql.removeEventListener("change", aviso);
};
const enEscritorio = () => window.matchMedia(ESCRITORIO).matches;
const enServidor = () => false;

export function LabGlassMount() {
  const enabled = useSyncExternalStore(suscribir, enEscritorio, enServidor);

  return enabled ? <LabGlass /> : null;
}
