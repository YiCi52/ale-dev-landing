import { Hero } from "@/components/hero/Hero";
import { BarajaCasos } from "@/components/casos/BarajaCasos";
import { Servicios } from "@/components/servicios/Servicios";
import { Contacto } from "@/components/form/Contacto";
import { Reveal } from "@/components/ui";

/*
  Home portfolio-first y corta a propósito: hero → prueba (baraja de casos) →
  oferta → contacto. Los casos completos y el "sobre mí" viven en sus propias
  rutas (/trabajo/<slug>, /sobre-mi) para que cada proyecto tenga URL propia y
  la home no sea un scroll infinito.
  Ver design-system/castillo-v2/arquitectura-multipagina.md
*/
export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <BarajaCasos />
      </Reveal>
      <Reveal>
        <Servicios />
      </Reveal>
      <Reveal>
        <Contacto />
      </Reveal>
    </>
  );
}
