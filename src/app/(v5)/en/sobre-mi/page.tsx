import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { SobreMi } from "@/components/lab/v5/SobreMi";
import { metaDe } from "@/components/lab/v5/meta";

export const metadata: Metadata = metaDe("/sobre-mi", "en", "About", "Alejandro Díaz del Castillo: I design and build websites for architecture and interior design studios, one project at a time.");

export default function AboutEn() {
  return (
    <div lang="en" className="pt-16">
      <SobreMi idioma="en" />
      <Cierre idioma="en" />
    </div>
  );
}
