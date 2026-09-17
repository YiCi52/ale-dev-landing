import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const limitMock = vi.fn();
const selectMock = vi.fn(() => ({ limit: limitMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

const SECRETO = "secreto-de-prueba";

function peticion(autorizacion?: string) {
  const headers = autorizacion ? { authorization: autorizacion } : undefined;
  return new NextRequest("https://ejemplo.test/api/keepalive", { headers });
}

async function llamar(autorizacion = `Bearer ${SECRETO}`) {
  const { GET } = await import("./route");
  return GET(peticion(autorizacion));
}

describe("GET /api/keepalive", () => {
  beforeEach(() => {
    limitMock.mockReset();
    selectMock.mockClear();
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

  it("lee la fila de latido y responde 200 solo si la fila llegó", async () => {
    limitMock.mockResolvedValueOnce({ data: [{ id: 1 }], error: null });
    const res = await llamar();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("latido");
  });

  // El bug del 16-sep: leer `leads` daba 42501 (anon sin SELECT) y la ruta
  // respondía ok. Supabase no contó esas peticiones como actividad.
  it("un error CON código de Postgres (42501) es fallo, no éxito", async () => {
    limitMock.mockResolvedValueOnce({
      data: null,
      error: { code: "42501", message: "permission denied for table latido" },
    });
    const res = await llamar();
    expect(res.status).toBe(502);
    expect((await res.json()).motivo).toMatch(/42501/);
  });

  it("un error sin código (red caída) es fallo", async () => {
    limitMock.mockResolvedValueOnce({
      data: null,
      error: { code: "", message: "fetch failed" },
    });
    const res = await llamar();
    expect(res.status).toBe(502);
  });

  it("una respuesta sin filas es fallo: la fila única desapareció", async () => {
    limitMock.mockResolvedValueOnce({ data: [], error: null });
    const res = await llamar();
    expect(res.status).toBe(502);
    expect((await res.json()).motivo).toMatch(/fila/);
  });

  it("si el cliente lanza una excepción responde 502, no 500 mudo", async () => {
    limitMock.mockRejectedValueOnce(new Error("socket hang up"));
    const res = await llamar();
    expect(res.status).toBe(502);
    expect((await res.json()).motivo).toMatch(/socket hang up/);
  });
});
