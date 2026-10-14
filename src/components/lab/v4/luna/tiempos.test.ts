import { describe, expect, it } from "vitest";

import { ESTRATOS, RASGOS, TRAMOS, enDisco, estadoDe } from "./tiempos";

describe("estadoDe", () => {
  it("empieza de noche con la luna libre y en foto", () => {
    const e = estadoDe(0);
    expect(e.papel).toBe(0);
    expect(e.plano).toBe(0);
    expect(e.alinear).toBe(0);
  });

  it("la luna ya está de frente cuando la foto termina de volverse plano", () => {
    const e = estadoDe(TRAMOS.plano[1]);
    expect(e.alinear).toBe(1);
    expect(e.plano).toBe(1);
    expect(e.papel).toBe(1);
  });

  it("las llamadas se trazan antes del corte y la luna vuelve después del corte", () => {
    expect(TRAMOS.llamadas[1]).toBeLessThanOrEqual(TRAMOS.corte[0]);
    expect(TRAMOS.corte[1]).toBeLessThanOrEqual(TRAMOS.vuelve[0]);
    const e = estadoDe(TRAMOS.vuelve[1]);
    expect(e.plano).toBe(0);
    expect(e.papel).toBe(0);
    expect(e.alinear).toBe(1);
  });

  it("termina exactamente en la luna de la galería, con el cielo encendido, y se vuelve transparente", () => {
    const destino: [number, number, number] = [0.5, 0.2, 0.09];
    const e = estadoDe(1, 16 / 9, destino);
    expect(e.x).toBeCloseTo(0.5);
    expect(e.y).toBeCloseTo(0.2);
    expect(e.radio).toBeCloseTo(0.09);
    expect(e.cielo).toBe(1);
    expect(e.revelar).toBe(1);
    expect(TRAMOS.cielo[1]).toBeLessThanOrEqual(TRAMOS.revelar[0]);
  });

  it("en celular la luna nunca es más ancha que la pantalla", () => {
    const aspecto = 375 / 812;
    expect(estadoDe(0.5, aspecto).radio * 2).toBeLessThanOrEqual(aspecto);
  });
});

describe("enDisco", () => {
  it("el centro de la cara visible es el centro del disco y el este queda a la derecha", () => {
    expect(enDisco(0, 0)).toEqual([0, -0]);
    expect(enDisco(0, 30)[0]).toBeCloseTo(0.5);
    expect(enDisco(30, 0)[1]).toBeCloseTo(-0.5);
  });

  it("todos los rasgos caen dentro del disco", () => {
    for (const r of RASGOS) {
      const [x, y] = enDisco(r.lat, r.lon);
      expect(Math.hypot(x, y)).toBeLessThan(1);
    }
  });
});

describe("contenido", () => {
  it("cinco estratos que suman exactamente las 14 capas, sin repetir", () => {
    expect(ESTRATOS).toHaveLength(5);
    const todas = ESTRATOS.flatMap((e) => [...e.capas]);
    expect(todas).toHaveLength(14);
    expect(new Set(todas).size).toBe(14);
    for (const e of ESTRATOS) expect(["piedra", "nogal", "cuarzo"]).toContain(e.material);
  });
});
