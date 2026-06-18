import { Hero } from "@/components/hero/Hero";
import { Servicios } from "@/components/servicios/Servicios";
import { Proceso } from "@/components/proceso/Proceso";
import { SobreMi } from "@/components/sobre-mi/SobreMi";
import { CasoMacroLift } from "@/components/casos/CasoMacroLift";
import { Contacto } from "@/components/form/Contacto";

export default function Home() {
  return (
    <>
      <Hero />
      <Servicios />
      <Proceso />
      <SobreMi />
      <CasoMacroLift />
      <Contacto />
    </>
  );
}
