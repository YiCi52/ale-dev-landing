import { Cierre } from "@/components/lab/v5/Cierre";
import { Hero } from "@/components/lab/v5/Hero";
import { Intro } from "@/components/lab/v5/Intro";
import { Manifiesto } from "@/components/lab/v5/Manifiesto";
import { Plano } from "@/components/lab/v5/Plano";
import { Preguntas } from "@/components/lab/v5/Preguntas";
import { Servicios } from "@/components/lab/v5/Servicios";
import { Testimonio } from "@/components/lab/v5/Testimonio";
import { Trabajo } from "@/components/lab/v5/Trabajo";

/*
  Página v5 (18-oct-2026), "Luz prestada": noche → la luna hace visible la casa → se encienden las luces (llega una
  consulta) → por dentro (render → plano con lo que trabaja) → obras encendidas → una clienta → servicios y proceso →
  preguntas → cierre. Una sola idea de principio a fin: la luz que muestra la obra de otro.
*/
export default function V5Page() {
  return (
    <main>
      <Intro />
      <Hero />
      <Manifiesto />
      <Plano />
      <Trabajo />
      <Testimonio />
      <Servicios />
      <Preguntas />
      <Cierre />
    </main>
  );
}
