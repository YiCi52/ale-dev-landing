/** Fase de la luna para una fecha (aproximación con el mes sinódico desde la luna nueva del 6-ene-2000 18:14 UTC). */
const SINODICO = 29.530588853;
const NUEVA = Date.UTC(2000, 0, 6, 18, 14);

export type Fase = { edad: number; iluminada: number; nombre: string };

export function faseLunar(fecha: Date): Fase {
  const dias = (fecha.getTime() - NUEVA) / 86400000;
  const edad = ((dias % SINODICO) + SINODICO) % SINODICO;
  const iluminada = (1 - Math.cos((2 * Math.PI * edad) / SINODICO)) / 2;
  const nombres = ["Luna nueva", "Luna creciente", "Cuarto creciente", "Gibosa creciente", "Luna llena", "Gibosa menguante", "Cuarto menguante", "Luna menguante"];
  return { edad, iluminada, nombre: nombres[Math.round((edad / SINODICO) * 8) % 8] };
}
