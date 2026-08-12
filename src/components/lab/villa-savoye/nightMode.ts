/*
  Estado día/noche compartido entre las dos escenas del lab (pub/sub mínimo).
  El toggle vive en la UI de cada capítulo; ambas escenas se suscriben.
*/

type Listener = (isNight: boolean) => void;

let night = false;
const listeners = new Set<Listener>();

export function isNightMode(): boolean {
  return night;
}

export function setNightMode(value: boolean): void {
  if (night === value) return;
  night = value;
  listeners.forEach((fn) => fn(night));
}

export function onNightMode(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
