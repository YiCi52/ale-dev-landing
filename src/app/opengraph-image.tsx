import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Castillo Studio — Sitios para arquitectos y diseñadores";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#1a1714",
          color: "#f5f0e8",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#9a8f80",
          }}
        >
          Castillo Studio · Diseño + desarrollo
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              fontSize: 110,
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            Sitios para arquitectos
          </div>
          <div
            style={{
              fontSize: 110,
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#9a8f80",
            }}
          >
            y diseñadores de interior.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#6b6358",
          }}
        >
          <div>Bogotá, Colombia</div>
          <div>ale-dev-landing.vercel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
