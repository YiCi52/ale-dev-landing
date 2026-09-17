import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Cadena real: supabase.from("latido").update({...}).eq("id", 1).select("id, visto_at")
const selectMock = vi.fn();
const eqMock = vi.fn(() => ({ select: selectMock }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ update: updateMock }));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

const SECRETO = "secreto-de-prueba";
const MARCA = "2026-09-17T09:06:50.123+00:00";

async function llamar(autorizacion = `Bearer ${SECRETO}`) {
  const { GET } = await import("./route");
  return GET(new NextRequest("https://ejemplo.test/api/keepalive", { headers: { authorization: autorizacion } }));
}

describe("GET /api/keepalive", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockClear();
    updateMock.mockClear();
    fromMock.mockClear();
    process.env.CRON_SECRET = SECRETO;
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("sin CRON_SECRET responde 503 con motivo y no toca Supabase", async () => {
    delete process.env.CRON_SECRET;
    const res = await llamar();
    expect(res.status).toBe(503);
    expect((await res.json()).motivo).toMatch(/CRON_SECRET/);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("con la autorización equivocada responde 401 y no toca Supabase", async () => {
    const res = await llamar("Bearer otro");
    expect(res.status).toBe(401);
    expect(fromMock).not.toHaveBeenCalled();
  });

  // Escribir (no solo leer) es la actividad más fuerte, y deja la prueba de que el cron corrió.
  it("marca la hora en la fila 1 de latido y responde 200 con la marca", async () => {
    selectMock.mockResolvedValueOnce({ data: [{ id: 1, visto_at: MARCA }], error: null });
    const res = await llamar();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, visto_at: MARCA });
    expect(fromMock).toHaveBeenCalledWith("latido");
    expect(updateMock).toHaveBeenCalledWith({ visto_at: expect.any(String) });
    expect(eqMock).toHaveBeenCalledWith("id", 1);
  });

  // El bug del 16-sep: leer `leads` daba 42501 (anon sin permiso) y la ruta respondía ok.
  it("un error CON código de Postgres (42501) es fallo, no éxito", async () => {
    selectMock.mockResolvedValueOnce({
      data: null,
      error: { code: "42501", message: "permission denied for table latido" },
    });
    const res = await llamar();
    expect(res.status).toBe(502);
    expect((await res.json()).motivo).toMatch(/42501/);
  });

  it("un error sin código (red caída) es fallo", async () => {
    selectMock.mockResolvedValueOnce({ data: null, error: { code: "", message: "fetch failed" } });
    const res = await llamar();
    expect(res.status).toBe(502);
  });

  // Si RLS bloquea el UPDATE, PostgREST no da error: devuelve [] (0 filas tocadas).
  it("una actualización que no tocó ninguna fila es fallo", async () => {
    selectMock.mockResolvedValueOnce({ data: [], error: null });
    const res = await llamar();
    expect(res.status).toBe(502);
    expect((await res.json()).motivo).toMatch(/fila/);
  });

  it("una fila sin marca de hora es fallo: el trigger no la selló", async () => {
    selectMock.mockResolvedValueOnce({ data: [{ id: 1, visto_at: null }], error: null });
    const res = await llamar();
    expect(res.status).toBe(502);
  });

  it("si el cliente lanza una excepción responde 502, no 500 mudo", async () => {
    selectMock.mockRejectedValueOnce(new Error("socket hang up"));
    const res = await llamar();
    expect(res.status).toBe(502);
    expect((await res.json()).motivo).toMatch(/socket hang up/);
  });
});
