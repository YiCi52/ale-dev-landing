import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Testimonio } from "@/components/lab/v5/Testimonio";
import { Trabajo } from "@/components/lab/v5/Trabajo";

export const metadata: Metadata = { title: "Work · Castillo Studio", robots: { index: false, follow: false } };

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
