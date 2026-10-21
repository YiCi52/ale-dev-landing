import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { SobreMi } from "@/components/lab/v5/SobreMi";

/* Sobre mí: quién está detrás de Castillo Studio y cómo trabaja. */
export const metadata: Metadata = { title: "Sobre mí · Castillo Studio", robots: { index: false, follow: false } };

export default function SobreMiPage() {
  return (
    <div className="pt-16">
      <SobreMi />
      <Cierre />
    </div>
  );
}
