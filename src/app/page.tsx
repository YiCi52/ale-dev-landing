import { Hero } from "@/components/hero/Hero";
import { BarajaCasos } from "@/components/casos/BarajaCasos";
import { Testimonio } from "@/components/casos/Testimonio";
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
      {/*
        El testimonio va DESPUÉS del trabajo y ANTES de la oferta: primero se
        ve lo que hizo, después alguien más lo respalda, y recién ahí se habla
        de servicios. Al revés, el elogio llega antes de que haya algo que
        elogiar.
      */}
      <Reveal>
        <Testimonio />
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
