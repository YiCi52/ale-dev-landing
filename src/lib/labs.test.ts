import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { LAB_DESTACADO, LABS } from "./labs";
import { ESTACIONES, PORTADA, PUNTOS, RECINTOS } from "@/components/lab/villa-savoye/contenido";

/*
  Lo que se rompe en silencio en estas secciones no es la lógica: es un enlace
  a un lab que no existe o una imagen que no se subió (en producción se ve
  como un hueco gris). Estas pruebas leen el disco para atraparlo antes.
*/
const RAIZ = path.resolve(__dirname, "../..");
const enPublic = (ruta: string) => existsSync(path.join(RAIZ, "public", ruta));

describe("sección Labs", () => {
  const todos = [LAB_DESTACADO, ...LABS];

  it("cada lab enlaza a una página que existe", () => {
    for (const lab of todos) {
      expect(existsSync(path.join(RAIZ, "src/app/lab", lab.slug, "page.tsx")), lab.slug).toBe(true);
    }
  });

  it("cada miniatura existe en public", () => {
    for (const lab of todos) expect(enPublic(lab.imagen), lab.imagen).toBe(true);
  });

  it("no repite slugs y todas las imágenes tienen texto alternativo", () => {
    expect(new Set(todos.map((l) => l.slug)).size).toBe(todos.length);
    for (const lab of todos) expect(lab.alt.length).toBeGreaterThan(20);
  });
});

describe("contenido de la Villa", () => {
  const vistas = [PORTADA, ...PUNTOS, ...ESTACIONES, ...RECINTOS];

  it("cada render citado existe en public", () => {
    for (const v of vistas) expect(enPublic(v.imagen), v.imagen).toBe(true);
  });

  it("cada vista cita la foto del museo con la que se comparó", () => {
    for (const v of vistas) expect(v.foto.trim().length, v.titulo).toBeGreaterThan(1);
  });
});
