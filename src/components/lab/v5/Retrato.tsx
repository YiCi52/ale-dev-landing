"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { montarCalco } from "./calco";
import { sinMovimiento } from "./scroll";

/* El retrato con el mismo calco de la galería (Alejo, 21-oct: "que aplique a mi foto"). Foco 50 % 26 %, igual que el CSS. */
const FOCO = { x: 0.5, y: 0.26 };

export function Retrato({ alt }: { alt: string }) {
  const marco = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!marco.current || !lienzo.current || sinMovimiento() || !window.matchMedia("(hover: hover)").matches) return;
    return montarCalco(marco.current, lienzo.current, "/sobre-mi/alejandro-calco.webp", FOCO);
  }, []);
  return (
    <figure ref={marco} className="v5-retrato">
      <Image src="/sobre-mi/alejandro.jpg" alt={alt} fill sizes="(max-width: 860px) 360px, 34vw" className="v5-retrato-foto" />
      <canvas ref={lienzo} className="v5-foto-calco" aria-hidden />
    </figure>
  );
}
