import { describe, it, expect } from "vitest";
import { contactSchema, tiposProyecto } from "./contact-schema";

describe("contactSchema", () => {
  const validInput = {
    nombre: "María",
    email: "maria@ejemplo.com",
    whatsapp: "+57 300 123 4567",
    tipoProyecto: "landing" as const,
    mensaje: "Necesito una landing para mi marca de joyas dentales.",
    consentimiento: true as const,
  };

  describe("nombre", () => {
    it("acepta nombre de 2 caracteres o más", () => {
      const result = contactSchema.safeParse({ ...validInput, nombre: "Jo" });
      expect(result.success).toBe(true);
    });

    it("rechaza nombre vacío", () => {
      const result = contactSchema.safeParse({ ...validInput, nombre: "" });
      expect(result.success).toBe(false);
    });

    it("rechaza nombre de 1 caracter", () => {
      const result = contactSchema.safeParse({ ...validInput, nombre: "J" });
      expect(result.success).toBe(false);
    });

    it("trimea espacios alrededor", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        nombre: "  María  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nombre).toBe("María");
      }
    });
  });

  describe("email", () => {
    it("acepta email válido", () => {
      const result = contactSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("rechaza email sin @", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        email: "noesemail",
      });
      expect(result.success).toBe(false);
    });

    it("rechaza email vacío", () => {
      const result = contactSchema.safeParse({ ...validInput, email: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("whatsapp", () => {
    it("es opcional: acepta sin whatsapp", () => {
      const result = contactSchema.safeParse({
        nombre: validInput.nombre,
        email: validInput.email,
        tipoProyecto: validInput.tipoProyecto,
        mensaje: validInput.mensaje,
        consentimiento: true,
      });
      expect(result.success).toBe(true);
    });

    it("acepta formato con código país y espacios", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        whatsapp: "+57 300 351 9162",
      });
      expect(result.success).toBe(true);
    });

    it("acepta formato con paréntesis y guiones", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        whatsapp: "(300) 123-4567",
      });
      expect(result.success).toBe(true);
    });

    it("rechaza letras", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        whatsapp: "abc123",
      });
      expect(result.success).toBe(false);
    });

    it("rechaza número demasiado corto", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        whatsapp: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("tipoProyecto", () => {
    it.each(tiposProyecto.map((t) => t.value))(
      "acepta tipo válido: %s",
      (tipo) => {
        const result = contactSchema.safeParse({
          ...validInput,
          tipoProyecto: tipo,
        });
        expect(result.success).toBe(true);
      },
    );

    it("rechaza tipo no listado", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        tipoProyecto: "ecommerce",
      });
      expect(result.success).toBe(false);
    });

    it("rechaza tipo vacío", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        tipoProyecto: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("mensaje", () => {
    it("rechaza mensaje de menos de 20 caracteres", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        mensaje: "muy corto",
      });
      expect(result.success).toBe(false);
    });

    it("acepta mensaje de exactamente 20 caracteres", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        mensaje: "a".repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it("rechaza mensaje de más de 2000 caracteres", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        mensaje: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("consentimiento (Ley 1581)", () => {
    it("acepta consentimiento explícito (true)", () => {
      const result = contactSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("rechaza false: sin consentimiento, no se procesa el lead", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        consentimiento: false,
      });
      expect(result.success).toBe(false);
    });

    it("rechaza ausencia de consentimiento", () => {
      const result = contactSchema.safeParse({
        nombre: validInput.nombre,
        email: validInput.email,
        tipoProyecto: validInput.tipoProyecto,
        mensaje: validInput.mensaje,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("honeypot", () => {
    it("acepta honeypot vacío", () => {
      const result = contactSchema.safeParse({ ...validInput, honeypot: "" });
      expect(result.success).toBe(true);
    });

    it("rechaza honeypot con contenido (señal de bot)", () => {
      const result = contactSchema.safeParse({
        ...validInput,
        honeypot: "soy-un-bot",
      });
      expect(result.success).toBe(false);
    });
  });
});
