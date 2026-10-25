import { describe, expect, it } from "vitest";
import { idiomaDe, rutaEnOtro } from "./idioma";

describe("idioma de la v5", () => {
  it("el inglés vive bajo /en", () => {
    expect(idiomaDe("/en")).toBe("en");
    expect(idiomaDe("/en/hablemos")).toBe("en");
    expect(idiomaDe("/")).toBe("es");
    expect(idiomaDe("/entrevista")).toBe("es");
    expect(idiomaDe(null)).toBe("es");
  });

  it("las páginas con par van a su par", () => {
    expect(rutaEnOtro("/")).toBe("/en");
    expect(rutaEnOtro("/hablemos")).toBe("/en/hablemos");
    expect(rutaEnOtro("/trabajo")).toBe("/en/trabajo");
    expect(rutaEnOtro("/en/servicios")).toBe("/servicios");
    expect(rutaEnOtro("/en")).toBe("/");
  });

  it("las páginas solo en español llevan a la portada en inglés, nunca a un 404", () => {
    expect(rutaEnOtro("/trabajo/mh-interior")).toBe("/en");
    expect(rutaEnOtro("/trabajo/villa-savoye")).toBe("/en");
    expect(rutaEnOtro("/privacidad")).toBe("/en");
    expect(rutaEnOtro("/una-ruta-que-no-existe")).toBe("/en");
  });
});
