import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

/*
  Imagen al compartir el link (24-oct-2026): la v5. Noche azul, la luna en C, el título de la home y el lema. Sin
  Edge Runtime (Next lo marca como obsoleto para esto).
*/
export const alt = "Castillo Studio — Tu obra, a la luz. Sitios web para estudios de arquitectura e interiorismo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = "M47.81,-87.83 A100,100 0 1 0 47.81,87.83 A91,91 0 1 1 47.81,-87.83Z";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", color: "#e8edf5", backgroundImage: "linear-gradient(180deg, #141823 0%, #05060a 70%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="44" height="44" viewBox="-110 -110 220 220"><path d={C} fill="#e8edf5" /></svg>
          <div style={{ fontSize: 30, letterSpacing: "-0.01em" }}>Castillo Studio</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 116, lineHeight: 1, letterSpacing: "-0.03em" }}>
            Tu obra,&nbsp;<span style={{ fontStyle: "italic", color: "#f0b679" }}>a la luz.</span>
          </div>
          <div style={{ fontSize: 30, color: "#b4bdcc", maxWidth: 900, lineHeight: 1.35 }}>
            Sitios web para estudios de arquitectura e interiorismo: la obra se recorre y cada consulta llega a tu WhatsApp en el mismo minuto.
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
