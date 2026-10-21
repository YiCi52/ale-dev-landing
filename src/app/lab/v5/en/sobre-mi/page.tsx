import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { SobreMi } from "@/components/lab/v5/SobreMi";

export const metadata: Metadata = { title: "About · Castillo Studio", robots: { index: false, follow: false } };

export default function AboutEn() {
  return (
    <div lang="en" className="pt-16">
      <SobreMi idioma="en" />
      <Cierre idioma="en" />
    </div>
  );
}
