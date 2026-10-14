import { describe, expect, it } from "vitest";

import { FIN_ECLIPSE, PELICULA, cuadroDe, cuadroExacto, cubrir, eclipseDe, mezclarDatos, proyectoDe } from "./escena";

describe("cuadroDe", () => {
  it("recorre la película en la primera parte del scroll y se queda en el último cuadro", () => {
    expect(cuadroDe(0, 74)).toBe(1);
    expect(cuadroDe(PELICULA, 74)).toBe(74);
    expect(cuadroDe(0.9, 74)).toBe(74);
  });
});

describe("proyectoDe", () => {
  it("no muestra proyectos mientras corre la película", () => {
    expect(proyectoDe(0.3, 2)).toEqual({ indice: 0, visible: 0 });
  });

  it("muestra uno a la vez: aparece, se queda y se disuelve antes del siguiente", () => {
    const tramo = (1 - FIN_ECLIPSE) / 2;
    expect(proyectoDe(FIN_ECLIPSE + tramo * 0.5, 2)).toEqual({ indice: 0, visible: 1 });
    expect(proyectoDe(FIN_ECLIPSE + tramo * 0.95, 2).visible).toBeLessThan(0.3);
    expect(proyectoDe(FIN_ECLIPSE + tramo * 1.5, 2).indice).toBe(1);
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

describe("eclipseDe", () => {
  it("la luna está llena durante la película y se eclipsa mientras se mira el agua", () => {
    expect(eclipseDe(0.2)).toBe(0);
    expect(eclipseDe((PELICULA + FIN_ECLIPSE) / 2)).toBeCloseTo(0.5);
    expect(eclipseDe(0.8)).toBe(1);
  });
});

describe("fundido entre cuadros", () => {
  it("el cuadro exacto recorre de 1 al último con decimales", () => {
    expect(cuadroExacto(0, 110)).toBe(1);
    expect(cuadroExacto(PELICULA, 110)).toBe(110);
    expect(cuadroExacto(PELICULA / 2, 110)).toBeCloseTo(55.5);
  });

  it("los datos intermedios quedan a mitad de camino", () => {
    const a = { reflejo: [0.5, 0.9] as [number, number], radio: 0.1, piso: 0.8, horizonte: 0.5, luna: [0.5, 0.2] as [number, number], luna_radio: 0.1 };
    const b = { ...a, horizonte: 0.3, luna: [0.5, 0.0] as [number, number] };
    const m = mezclarDatos(a, b, 0.5);
    expect(m?.horizonte).toBeCloseTo(0.4);
    expect(m?.luna?.[1]).toBeCloseTo(0.1);
  });
});
