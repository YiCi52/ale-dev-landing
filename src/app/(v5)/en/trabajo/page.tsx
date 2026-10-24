import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Testimonio } from "@/components/lab/v5/Testimonio";
import { Trabajo } from "@/components/lab/v5/Trabajo";
import { metaDe } from "@/components/lab/v5/meta";

export const metadata: Metadata = metaDe("/trabajo", "en", "Work", "A client website with built-in inquiry capture, and the Villa Savoye rebuilt from its drawings so you can walk through it.");

export default function WorkEn() {
  return (
    <div lang="en" className="pt-16">
      <h1 className="sr-only">Work · Castillo Studio</h1>
      <Trabajo idioma="en" />
      <Testimonio idioma="en" />
      <Cierre idioma="en" />
    </div>
  );
}
