import type { Metadata } from "next";
import Link from "next/link";
import { CasoMacroLift } from "@/components/casos/CasoMacroLift";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "MacroLift — capacidad técnica previa",
  description:
    "Caso: aplicación web de cálculo nutricional. Muestra la capacidad técnica previa a Castillo Studio — lógica, estado y despliegue.",
};

export default function MacroLiftPage() {
  return (
    <>
      <Container size="wide">
        <nav aria-label="Migas de pan" className="pt-32 sm:pt-40">
          <Link
            href="/#casos"
            className="font-mono text-xs uppercase tracking-[0.18em] text-subtle transition-colors hover:text-foreground"
          >
            ← Trabajo seleccionado
          </Link>
        </nav>
      </Container>
      <CasoMacroLift />
    </>
  );
}
