import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Plano } from "@/components/lab/v5/Plano";
import { Preguntas } from "@/components/lab/v5/Preguntas";
import { Servicios } from "@/components/lab/v5/Servicios";

export const metadata: Metadata = { title: "Services · Castillo Studio", robots: { index: false, follow: false } };

export default function ServicesEn() {
  return (
    <div lang="en">
      <h1 className="sr-only">Services · Castillo Studio</h1>
      <Plano idioma="en" />
      <Servicios idioma="en" />
      <Preguntas idioma="en" />
      <Cierre idioma="en" />
    </div>
  );
}
