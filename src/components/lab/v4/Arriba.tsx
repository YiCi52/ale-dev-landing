"use client";

import { useEffect } from "react";

/*
  Alejo (14-oct): "siempre que cargo la página comienza al final". El navegador recordaba la posición del scroll al
  recargar; con pantalla de carga y una historia que se cuenta de arriba abajo, la página arranca siempre arriba.
*/
export function Arriba() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);
  return null;
}
