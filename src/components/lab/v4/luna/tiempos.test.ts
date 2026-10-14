import { describe, expect, it } from "vitest";

import { CAPAS, FRASES, TRAMOS, estadoDe, fraseDe } from "./tiempos";

const DESTINO: [number, number, number] = [0.5, 0.12, 0.05];

describe("estadoDe", () => {
  it("empieza en blanco con la C sola y sin luna 3D", () => {
    const e = estadoDe(0, DESTINO);
    expect(e.noche).toBe(0);
    expect(e.linea).toBe(0);
    expect(e.solida).toBe(0);
    expect(e.polvo).toBe(0);
  });

  it("al acercarse la luna ocupa ~80% del alto de la pantalla", () => {
    const e = estadoDe(TRAMOS.acercar[1], DESTINO);
    expect(e.radio * 2).toBeCloseTo(0.8);
    expect(e.solida).toBe(1);
  });

  it("el polvo sale con el viento, se queda escribiendo y vuelve a la luna", () => {
    expect(estadoDe(TRAMOS.viento[0], DESTINO).polvo).toBe(0);
    expect(estadoDe(0.82, DESTINO).polvo).toBe(1);
    expect(estadoDe(TRAMOS.rearme[1], DESTINO).polvo).toBe(0);
  });

  it("termina exactamente donde está la luna del primer cuadro de la galería", () => {
    const e = estadoDe(1, DESTINO);
    expect(e.x).toBeCloseTo(DESTINO[0]);
    expect(e.y).toBeCloseTo(DESTINO[1]);
    expect(e.radio).toBeCloseTo(DESTINO[2]);
    expect(e.galeria).toBe(1);
  });
});

describe("fraseDe", () => {
  it("no hay frase antes ni después de su tramo", () => {
    expect(fraseDe(0.1).indice).toBe(-1);
    expect(fraseDe(0.7).indice).toBe(-1);
  });

  it("recorre las frases en orden, una a la vez", () => {
    const [a, b] = TRAMOS.frases;
    const paso = (b - a) / FRASES.length;
    expect(fraseDe(a + paso * 0.5).indice).toBe(0);
    expect(fraseDe(a + paso * (FRASES.length - 0.5)).indice).toBe(FRASES.length - 1);
  });

  it("cada frase entra completa antes de empezar a irse", () => {
    const [a, b] = TRAMOS.frases;
    const paso = (b - a) / FRASES.length;
    const mitad = fraseDe(a + paso * 0.55);
    expect(mitad.entra).toBe(1);
    expect(mitad.sale).toBe(0);
  });
});

describe("contenido", () => {
  it("son 14 capas y entre 4 y 6 frases", () => {
    expect(CAPAS).toHaveLength(14);
    expect(FRASES.length).toBeGreaterThanOrEqual(4);
    expect(FRASES.length).toBeLessThanOrEqual(6);
  });
});

describe("celular", () => {
  it("la luna nunca es más ancha que la pantalla", () => {
    const aspecto = 375 / 812;
    for (const p of [0.3, 0.6, 0.8]) {
      const e = estadoDe(p, DESTINO, aspecto);
      expect(e.radio * 2).toBeLessThanOrEqual(aspecto);
    }
  });
});
