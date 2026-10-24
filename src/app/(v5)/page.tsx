import type { Metadata } from "next";
import { Cierre } from "@/components/lab/v5/Cierre";
import { Hero } from "@/components/lab/v5/Hero";
import { Intro } from "@/components/lab/v5/Intro";
import { Manifiesto } from "@/components/lab/v5/Manifiesto";
import { Puertas } from "@/components/lab/v5/Puertas";
import { Testimonio } from "@/components/lab/v5/Testimonio";
import { Trabajo } from "@/components/lab/v5/Trabajo";
import { metaDe } from "@/components/lab/v5/meta";

/*
  Página v5 (18-oct-2026), "Luz prestada": noche → la luna hace visible la casa → se encienden las luces (llega una
  consulta) → por dentro (render → plano con lo que trabaja) → obras encendidas → una clienta → servicios y proceso →
  preguntas → cierre. Una sola idea de principio a fin: la luz que muestra la obra de otro.
*/
export const metadata: Metadata = metaDe("/", "es", { absolute: "Castillo Studio — Sitios web para estudios de arquitectura e interiorismo" }, "Diseño y construyo sitios para estudios de arquitectura e interiorismo: la obra se recorre y cada consulta llega a tu WhatsApp en el mismo minuto.");

export default function V5Page() {
  return (
    <div>
      <Intro />
      <Hero />
      <Manifiesto />
      <Puertas />
      <Trabajo />
      <Testimonio />
      <Cierre />
    </div>
  );
}
