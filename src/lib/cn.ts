import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
  Extender twMerge para que reconozca nuestras font-sizes custom como font-size
  (no como text-color). Sin esto, `text-display` + `text-foreground` colapsan
  porque comparten el prefijo `text-`.
*/
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "hero-sub"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
