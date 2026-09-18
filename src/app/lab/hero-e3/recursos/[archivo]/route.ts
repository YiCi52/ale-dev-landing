import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Lab · E3 UMBRAL — sirve los cuadros de LOOKDEV que la prueba necesita, sin
 * copiarlos a public/ (public/lab ya roza el limite de Vercel):
 *   cx_NNNN.webp  -> E2-B4 aprobada (relevo), desde gatoC/lookdev
 *   es_NNNN.webp  -> la sala de prueba de E3, y su indice.json
 * Solo en desarrollo. En produccion responde 404.
 */
const LOOKDEV = "/Users/alejandrodiazdelcastillo/CastilloStudio/gatoC/lookdev";
const ORIGENES: { patron: RegExp; dir: string; tipo: string; nombre?: string }[] = [
  { patron: /^cx_\d{4}\.webp$/, dir: `${LOOKDEV}/2026-09-12-e2-relevo/prueba/07-e2B4-B`, tipo: "image/webp" },
  { patron: /^es_\d{4}\.webp$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio`, tipo: "image/webp" },
  { patron: /^indice\.json$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio`, tipo: "application/json" },
  // v2: la sala corta
  { patron: /^es2_\d{4}\.webp$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v2`, tipo: "image/webp" },
  { patron: /^indice2\.json$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v2`, tipo: "application/json", nombre: "indice.json" },
  // v3: misma sala, luz compartida (prueba corta)
  { patron: /^es3_\d{4}\.webp$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v3`, tipo: "image/webp" },
  { patron: /^indice3\.json$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v3`, tipo: "application/json", nombre: "indice.json" },
  // v4: el umbral en 3D (sala + iris con espesor)
  { patron: /^es4[si]_\d{4}\.webp$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v4`, tipo: "image/webp" },
  { patron: /^indice4\.json$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v4`, tipo: "application/json", nombre: "indice.json" },
  // v5: el cruce visible (espesor de ~2 R)
  { patron: /^es5[si]_\d{4}\.webp$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v5`, tipo: "image/webp" },
  { patron: /^indice5\.json$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v5`, tipo: "application/json", nombre: "indice.json" },
  // v5.1: microacabado del espesor
  { patron: /^es51[si]_\d{4}\.webp$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v51`, tipo: "image/webp" },
  { patron: /^indice51\.json$/, dir: `${LOOKDEV}/2026-09-13-e3-umbral/espacio_v51`, tipo: "application/json", nombre: "indice.json" },
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ archivo: string }> },
) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const { archivo } = await params;
  const origen = ORIGENES.find((o) => o.patron.test(archivo));
  if (!origen) return new Response(null, { status: 404 });
  try {
    const datos = await readFile(path.join(origen.dir, origen.nombre ?? archivo));
    // VENTANA (17-sep): los cuadros pasan a pedirse y soltarse por tramo, asi que
    // un cuadro liberado se vuelve a pedir al volver atras. Con `no-store` eso era
    // una descarga nueva cada vez; cacheados, la vuelta no cuesta red. El indice
    // sigue sin cachearse: es lo que cambia cuando se re-hornea.
    const cache = origen.tipo === "application/json"
      ? "no-store"
      : "public, max-age=3600, immutable";
    return new Response(datos, {
      headers: { "Content-Type": origen.tipo, "Cache-Control": cache },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
