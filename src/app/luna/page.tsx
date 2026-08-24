import type { Metadata } from "next";
import { LunaLoader } from "@/components/luna/LunaLoader";
import { LunaMar } from "@/components/luna/LunaMar";
import { LunaEscenario } from "@/components/luna/LunaEscenario";
import { BarajaCasos } from "@/components/casos/BarajaCasos";
import { Testimonio } from "@/components/casos/Testimonio";
import { Servicios } from "@/components/servicios/Servicios";
import { Constelacion } from "@/components/constelacion/Constelacion";
import { Contacto } from "@/components/form/Contacto";
import { Reveal } from "@/components/ui";
import "@/components/luna/luna.css";

/*
  /luna — ruta de PRUEBA del rediseño "El gato y la luna".
  Contrato: design-system/castillo-luna/BRIEF.md. noindex hasta que Alejandro
  apruebe la dirección; ahí esta composición reemplaza al Hero del home.

  Estructura: loader (el sello) → escenario narrativo (6 beats, la luna crece)
  → aterrizaje en el contenido real que ya existe (baraja → testimonio →
  servicios → constelación → contacto). Las pestañas del header global
  (Sobre mí · Proyectos · Contacto) siguen vivas por el layout raíz.
*/
export const metadata: Metadata = {
  title: "El gato y la luna — test de dirección",
  robots: { index: false, follow: false },
};

export default function LunaPage() {
  return (
    <div className="luna">
      {/*
        Gate del loader: decide ANTES del primer pintado si esta sesión ya lo
        vio (patrón del sello en layout.tsx — un efecto de React llegaría
        después de la hidratación y el overlay parpadearía). Constante de
        código, sin entrada de usuario; si sessionStorage falla, no hay loader.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(!sessionStorage.getItem("cs-luna-loader")){sessionStorage.setItem("cs-luna-loader","1");document.documentElement.dataset.lunaLoader="play"}}catch(e){}`,
        }}
      />
      <LunaLoader />
      {/* el mar es el fondo fijo de TODA la página, no solo del escenario */}
      <LunaMar />
      <LunaEscenario />

      {/* Aterrizaje: el contenido real del sitio, intacto (BRIEF §8) */}
      <BarajaCasos />
      <Reveal>
        <Testimonio />
      </Reveal>
      <Reveal>
        <Servicios />
      </Reveal>
      <Reveal>
        <Constelacion />
      </Reveal>
      <Reveal>
        <Contacto />
      </Reveal>
    </div>
  );
}
