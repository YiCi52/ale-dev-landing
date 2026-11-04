import { ImageResponse } from "next/og";

import { DEMOS, demoPorSlug } from "@/lib/demos";
import { SITE_URL } from "@/lib/site";

/*
  Imagen al compartir /demo/<slug> (4-nov-2026): lleva el nombre de la empresa. La general de la home habla de estudios de
  arquitectura y no le dice nada a una clínica; Mari preguntó "¿es Marco?" al verla en el chat.
*/
export const alt = "Castillo Studio: una demostración preparada para ti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return DEMOS.map((d) => ({ slug: d.slug }));
}

const C = "M47.81,-87.83 A100,100 0 1 0 47.81,87.83 A91,91 0 1 1 47.81,-87.83Z";

type Props = { params: Promise<{ slug: string }> };

export default async function OpenGraphDemo({ params }: Props) {
  const demo = demoPorSlug((await params).slug);
  const nombre = demo?.nombre ?? "tu negocio";
  const tamano = nombre.length > 24 ? 92 : nombre.length > 16 ? 108 : 124;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", color: "#e8edf5", backgroundImage: "linear-gradient(180deg, #141823 0%, #05060a 70%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="44" height="44" viewBox="-110 -110 220 220"><path d={C} fill="#e8edf5" /></svg>
          <div style={{ fontSize: 30, letterSpacing: "-0.01em" }}>Castillo Studio</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: "#f0b679" }}>Una demostración preparada para</div>
          <div style={{ display: "flex", fontSize: tamano, lineHeight: 1.02, letterSpacing: "-0.03em" }}>{nombre}</div>
          <div style={{ fontSize: 30, color: "#b4bdcc", maxWidth: 900, lineHeight: 1.35 }}>
            Cómo se vería el sistema con una consulta que llega de noche.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 20, letterSpacing: "0.18em", textTransform: "uppercase", color: "#858d9c" }}>
          {SITE_URL.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size,
  );
}
