/** La C del logo: círculo de radio 100 menos uno de 91 corrido 24 a la derecha (la luna creciente). */
export const C_LOGO = (() => {
  const R = 100, r = 91, dx = 24, x = (R * R - r * r + dx * dx) / (2 * dx), y = Math.sqrt(R * R - x * x);
  return `M${x.toFixed(2)},${(-y).toFixed(2)} A${R},${R} 0 1 0 ${x.toFixed(2)},${y.toFixed(2)} A${r},${r} 0 ${x > dx ? 1 : 0} 1 ${x.toFixed(2)},${(-y).toFixed(2)}Z`;
})();

export const INICIO = "/lab/v5";
export const HABLEMOS = "/lab/v5/hablemos";
