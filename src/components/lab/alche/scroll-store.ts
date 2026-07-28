/**
 * Estado compartido entre el DOM (que scrollea con Lenis) y el canvas WebGL fijo.
 *
 * Se usa un objeto mutable en vez de estado de React a propósito: el progreso de
 * scroll y el puntero cambian en cada frame, y pasarlos por props forzaría un
 * re-render por frame de todo el árbol de la escena.
 */
export const alcheScroll = {
  /** Progreso normalizado del documento, 0 → 1. */
  progress: 0,
  /** Puntero normalizado, -1 → 1 en cada eje, con el origen en el centro. */
  pointerX: 0,
  pointerY: 0,
};
