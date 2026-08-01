import { Hero } from "@/components/hero/Hero";
import { SelectedWork } from "@/components/casos/SelectedWork";
import { CasoMHInterior } from "@/components/casos/CasoMHInterior";
import { CasoMacroLift } from "@/components/casos/CasoMacroLift";
import { Servicios } from "@/components/servicios/Servicios";
import { Proceso } from "@/components/proceso/Proceso";
import { SobreMi } from "@/components/sobre-mi/SobreMi";
import { Contacto } from "@/components/form/Contacto";
import { Reveal } from "@/components/ui";

/*
  Orden portfolio-first: la PRUEBA va antes que el pitch. El visitante ve
  trabajo real terminado antes de leer qué se vende o cómo se trabaja.
  (Antes: servicios y proceso iban primero y los casos quedaban enterrados.)
*/
export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <SelectedWork />
      </Reveal>
      <Reveal>
        <CasoMHInterior />
      </Reveal>
      <Reveal>
        <CasoMacroLift />
      </Reveal>
      <Reveal>
        <Servicios />
      </Reveal>
      <Reveal>
        <Proceso />
      </Reveal>
      <Reveal>
        <SobreMi />
      </Reveal>
      <Reveal>
        <Contacto />
      </Reveal>
    </>
  );
}
