import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Hero } from "@/components/lab/v5/Hero";
import { Intro } from "@/components/lab/v5/Intro";
import { Manifiesto } from "@/components/lab/v5/Manifiesto";
import { Puertas } from "@/components/lab/v5/Puertas";
import { Testimonio } from "@/components/lab/v5/Testimonio";
import { Trabajo } from "@/components/lab/v5/Trabajo";

/* English version of the v5 home (same components, English copy from textos.ts). */
export const metadata: Metadata = { title: "Castillo Studio · v5 (EN)", robots: { index: false, follow: false } };

export default function V5HomeEn() {
  return (
    <div lang="en">
      <Intro />
      <Hero idioma="en" />
      <Manifiesto idioma="en" />
      <Puertas idioma="en" />
      <Trabajo idioma="en" />
      <Testimonio idioma="en" />
      <Cierre idioma="en" />
    </div>
  );
}
