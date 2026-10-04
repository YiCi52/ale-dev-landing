import { HeroEscena } from "@/components/hero/escena/HeroEscena";
import { BarajaCasos } from "@/components/casos/BarajaCasos";
import { Testimonio } from "@/components/casos/Testimonio";
import { LabsSeccion } from "@/components/labs/LabsSeccion";
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

  EL HERO ES LA ESCENA (21-sep-2026). Entra `HeroEscena` —la E3-v5.1 aprobada— en
  el lugar que tenía el hero de agosto (`components/hero/Hero.tsx`, que queda en el
  repo sin usar por si hay que volver). No se le cambió nada a la escena: ni gato,
  ni cristal, ni umbral, ni cámara, ni timing, ni composición.

  QUÉ SIGUE DESPUÉS DEL UMBRAL. La escena termina cruzando la pupila y rematando
  con «Caso 01 · MH Interior — un sitio que no muestra el proyecto: lo hace
  atravesable». Lo que viene a continuación es exactamente eso: la baraja de casos
  (`#casos`), cuya PRIMERA carta es MH Interior y lleva a /trabajo/mh-interior. El
  umbral promete un caso y la sección siguiente lo entrega; no hay pantalla muerta
  entre los dos.
*/
export default function Home() {
  return (
    <>
      <HeroEscena />
      {/*
        La baraja NO va envuelta en <Reveal>: ese wrapper aplica `transform` y
        `will-change: transform`, y eso lo convierte en el marco de referencia
        de sus descendientes — las cartas `position: sticky` de adentro dejan
        de pegarse y pasan de largo. Es el mismo mecanismo que rompía el header
        `fixed` del sitio de la clienta. La sección trae su propia entrada.
      */}
      <BarajaCasos />
      {/*
        Labs (4-oct-2026): la sección 3 del MASTER. Va pegada al trabajo porque
        también es trabajo — lo que se prueba antes de llevarlo a un cliente —, y
        antes del testimonio, que respalda todo lo visto hasta ahí.
      */}
      <LabsSeccion />
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
