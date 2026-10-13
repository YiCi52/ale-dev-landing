import { describe, expect, it } from "vitest";

import { PELICULA, cuadroDe, cubrir, luzDe, proyectoDe } from "./escena";

describe("cuadroDe", () => {
  it("recorre la película en la primera parte del scroll y se queda en el último cuadro", () => {
    expect(cuadroDe(0, 130)).toBe(1);
    expect(cuadroDe(PELICULA, 130)).toBe(130);
    expect(cuadroDe(0.9, 130)).toBe(130);
  });
});

describe("proyectoDe", () => {
  it("no muestra proyectos mientras corre la película", () => {
    expect(proyectoDe(0.3, 2)).toEqual({ indice: 0, visible: 0 });
  });

  it("muestra uno a la vez: aparece, se queda y se disuelve antes del siguiente", () => {
    const tramo = (1 - PELICULA) / 2;
    expect(proyectoDe(PELICULA + tramo * 0.5, 2)).toEqual({ indice: 0, visible: 1 });
    expect(proyectoDe(PELICULA + tramo * 0.95, 2).visible).toBeLessThan(0.3);
    expect(proyectoDe(PELICULA + tramo * 1.5, 2).indice).toBe(1);
  });

  it("el último proyecto no se disuelve al final", () => {
    expect(proyectoDe(1, 2)).toEqual({ indice: 1, visible: 1 });
  });
});

describe("cubrir", () => {
  it("ida y vuelta entre pantalla y cuadro con object-fit: cover", () => {
    const c = cubrir(1000, 1000, 1600, 900);
    const [sx, sy, ox, oy] = c.uniforme;
    const [x, y] = c.aPantalla(0.5, 0.5);
    expect(x).toBeCloseTo(0.5);
    expect(y).toBeCloseTo(0.5);
    expect(0.5 * sx + ox).toBeCloseTo(0.5);
    expect(0.5 * sy + oy).toBeCloseTo(0.5);
    expect(c.alto(0.2)).toBeCloseTo(0.2);
  });
});

describe("luzDe", () => {
  it("la luna brilla llena hasta el eclipse y se apaga al cerrarse", () => {
    expect(luzDe(1)).toBe(1);
    expect(luzDe(92)).toBeCloseTo(0.5);
    expect(luzDe(120)).toBe(0);
  });
});
