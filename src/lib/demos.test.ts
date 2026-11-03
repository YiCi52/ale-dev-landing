import { describe, expect, it } from "vitest";

import { DEMOS, demoPorSlug, enlaceWhatsApp, preguntasDe, ofertaTexto } from "./demos";

describe("demos de prospectos", () => {
  it("cada slug es único y en minúsculas con guiones", () => {
    const slugs = DEMOS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("todas tienen lo mínimo para armar la página", () => {
    for (const d of DEMOS) {
      expect(d.nombre.length).toBeGreaterThan(2);
      expect(d.hecho.length).toBeGreaterThan(20);
      expect(d.titulo.antes.length + d.titulo.luz.length).toBeGreaterThan(10);
      expect(d.consulta.mensaje.length).toBeGreaterThan(15);
      expect(["clinica", "estudio"]).toContain(d.tipo);
    }
  });

  it("la respuesta sugerida nunca inventa horarios ni precios", () => {
    for (const d of DEMOS) {
      const r = d.consulta.respuestaSugerida;
      expect(r).not.toMatch(/\b\d{1,2}\s?(:|h\b|am\b|pm\b|a\. m\.|p\. m\.)/i);
      expect(r).not.toMatch(/\$\s?\d/);
      expect(r).toMatch(/confirm/i);
    }
  });

  it("busca por slug y devuelve undefined si no existe", () => {
    expect(demoPorSlug(DEMOS[0].slug)?.nombre).toBe(DEMOS[0].nombre);
    expect(demoPorSlug("no-existe")).toBeUndefined();
  });

  it("cada tipo trae tres preguntas con opciones", () => {
    for (const tipo of ["clinica", "estudio"] as const) {
      const p = preguntasDe(tipo);
      expect(p).toHaveLength(3);
      for (const q of p) expect(q.opciones.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("la oferta de clínicas y de estudios dice precio y plazo", () => {
    const c = ofertaTexto("clinica");
    expect(c).toContain("$2.500.000");
    expect(c).toContain("$500.000 al mes");
    expect(c).toContain("3 semanas");
    const e = ofertaTexto("estudio");
    expect(e).toContain("$3.600.000");
    expect(e).toContain("5 semanas");
  });

  it("el enlace de WhatsApp lleva las tres respuestas y se codifica", () => {
    const d = DEMOS[0];
    const q = preguntasDe(d.tipo);
    const url = enlaceWhatsApp(d, [q[0].opciones[0], q[1].opciones[1], q[2].opciones[2]]);
    expect(url.startsWith("https://wa.me/573003519162?text=")).toBe(true);
    const texto = decodeURIComponent(url.split("?text=")[1]);
    expect(texto).toContain(d.nombre);
    expect(texto).toContain(q[0].opciones[0]);
    expect(texto).toContain(q[2].opciones[2]);
    expect(url).not.toMatch(/\s/);
  });

  it("sin las tres respuestas no hay enlace", () => {
    const d = DEMOS[0];
    expect(enlaceWhatsApp(d, ["a", "", "c"])).toBe("");
    expect(enlaceWhatsApp(d, [])).toBe("");
  });
});
