import { Hero } from "@/components/hero/Hero";
import { Servicios } from "@/components/servicios/Servicios";
import { Proceso } from "@/components/proceso/Proceso";
import { SobreMi } from "@/components/sobre-mi/SobreMi";
import { CasoMacroLift } from "@/components/casos/CasoMacroLift";
import { Contacto } from "@/components/form/Contacto";
import { Reveal } from "@/components/ui";

export default function Home() {
  return (
    <>
      <Hero />
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
        <CasoMacroLift />
      </Reveal>
      <Reveal>
        <Contacto />
      </Reveal>
    </>
  );
}
