import { Hero } from "@/components/hero/Hero";
import { BarajaCasos } from "@/components/casos/BarajaCasos";
import { Testimonio } from "@/components/casos/Testimonio";
import { Servicios } from "@/components/servicios/Servicios";
import { Constelacion } from "@/components/constelacion/Constelacion";
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
      {/*
        La baraja NO va envuelta en <Reveal>: ese wrapper aplica `transform` y
        `will-change: transform`, y eso lo convierte en el marco de referencia
        de sus descendientes — las cartas `position: sticky` de adentro dejan
        de pegarse y pasan de largo. Es el mismo mecanismo que rompía el header
        `fixed` del sitio de la clienta. La sección trae su propia entrada.
      */}
      <BarajaCasos />
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
      {/*
        La constelación va después de la oferta: Servicios dice QUÉ construyo,
        la constelación muestra TODO lo que viene incluido debajo — el
        territorio de Castillo (lo que pasa después de que llega el visitante).
      */}
      <Reveal>
        <Constelacion />
      </Reveal>
      <Reveal>
        <Contacto />
      </Reveal>
    </>
  );
}
