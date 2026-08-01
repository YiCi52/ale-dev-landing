import { Fragment } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Props = {
  text: string;
  className?: string;
};

/**
 * Titular display con reveal palabra-por-palabra — el efecto de mayor ROI del
 * norte visual (se ve carísimo, cuesta poco).
 *
 * La animación es CSS pura (ver `.headline-reveal` en globals.css), no JS:
 * este es el mensaje central del sitio y no puede quedar invisible si una
 * librería de motion no monta o no dispara. Al ser CSS, además, el componente
 * no necesita "use client" y no envía JS al cliente.
 * Reduced-motion lo resuelve el bloque global de globals.css.
 */
export function AnimatedHeadline({ text, className }: Props) {
  const words = text.split(" ");

  return (
    <h1
      className={cn(
        "headline-reveal font-serif text-display leading-[0.95] tracking-[-0.025em] text-foreground text-balance",
        className,
      )}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span style={{ "--word-index": i } as CSSProperties}>{word}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}
