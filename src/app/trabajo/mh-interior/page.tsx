import type { Metadata } from "next";
import Link from "next/link";
import { CasoMHInterior } from "@/components/casos/CasoMHInterior";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "MH Interior Design — portafolio bilingüe con captura de clientes",
  description:
    "Caso completo: sitio de portafolio para una diseñadora de interiores en Bogotá, con seis proyectos, dos idiomas y un sistema que registra y notifica cada contacto.",
};

export default function MHInteriorPage() {
  return (
    <>
      <Container size="wide">
        <nav aria-label="Migas de pan" className="pt-12 sm:pt-16">
          <Link
            href="/#casos"
            className="font-mono text-xs uppercase tracking-[0.18em] text-subtle transition-colors hover:text-foreground"
          >
            ← Trabajo seleccionado
          </Link>
        </nav>
      </Container>
      <CasoMHInterior />
    </>
  );
}
