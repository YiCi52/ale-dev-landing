import type { Metadata } from "next";
import Link from "next/link";
import { SobreMi } from "@/components/sobre-mi/SobreMi";
import { Proceso } from "@/components/proceso/Proceso";
import { Container, Reveal } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sobre mí — Alejandro Díaz del Castillo",
  description:
    "Una persona, no una agencia. Quién está detrás de Castillo Studio y cómo trabaja: proceso, criterios y forma de acompañar cada proyecto.",
};

/*
  La persona vive en su propia página, no compitiendo con el trabajo en la home
  (mismo patrón que el sitio de la clienta: el "sobre mí" es su pestaña).
  El proceso viene aquí porque es parte de "cómo trabajo", no de la venta.
*/
export default function SobreMiPage() {
  return (
    <>
      <Container size="wide">
        <nav aria-label="Migas de pan" className="pt-32 sm:pt-40">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.18em] text-subtle transition-colors hover:text-foreground"
          >
            ← Inicio
          </Link>
        </nav>
      </Container>
      <SobreMi />
      <Reveal>
        <Proceso />
      </Reveal>
    </>
  );
}
