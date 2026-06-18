import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/supabase", () => ({
  supabase: { from: fromMock },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Map([["user-agent", "test-runner/1.0"]]),
}));

const fetchMock = vi.fn();

describe("submitContact", () => {
  beforeEach(() => {
    insertMock.mockReset();
    fromMock.mockClear();
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    delete process.env.MAKE_WEBHOOK_URL;
  });

  const validInput = {
    nombre: "Test",
    email: "test@ejemplo.com",
    whatsapp: "+57 300 000 0000",
    tipoProyecto: "landing" as const,
    mensaje: "Mensaje de prueba con suficientes caracteres.",
  };

  it("inserta lead válido en Supabase", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    const { submitContact } = await import("./contact");
    const result = await submitContact(validInput);
    expect(result.ok).toBe(true);
    expect(fromMock).toHaveBeenCalledWith("leads");
    expect(insertMock).toHaveBeenCalledOnce();
    const inserted = insertMock.mock.calls[0][0];
    expect(inserted.nombre).toBe("Test");
    expect(inserted.tipo_proyecto).toBe("landing");
    expect(inserted.source).toBe("landing");
  });

  it("rechaza input inválido sin tocar Supabase", async () => {
    const { submitContact } = await import("./contact");
    const result = await submitContact({
      ...validInput,
      email: "no-es-email",
    });
    expect(result.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("retorna error si Supabase falla", async () => {
    insertMock.mockResolvedValueOnce({ error: { message: "DB down" } });
    const { submitContact } = await import("./contact");
    const result = await submitContact(validInput);
    expect(result.ok).toBe(false);
  });

  it("bloquea bots: honeypot lleno es rechazado por el schema sin tocar Supabase", async () => {
    const { submitContact } = await import("./contact");
    const result = await submitContact({
      ...validInput,
      honeypot: "bot-tocó-este-campo",
    });
    expect(result.ok).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("dispara webhook a Make si MAKE_WEBHOOK_URL está configurada", async () => {
    process.env.MAKE_WEBHOOK_URL = "https://hook.example/test";
    insertMock.mockResolvedValueOnce({ error: null });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

    const { submitContact } = await import("./contact");
    const result = await submitContact(validInput);

    expect(result.ok).toBe(true);
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hook.example/test",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("no dispara webhook si MAKE_WEBHOOK_URL no está seteada", async () => {
    insertMock.mockResolvedValueOnce({ error: null });
    const { submitContact } = await import("./contact");
    const result = await submitContact(validInput);
    expect(result.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
