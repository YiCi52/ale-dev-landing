"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  text: string;
  className?: string;
};

/**
 * Titular display con reveal palabra-por-palabra al cargar — el efecto de
 * mayor ROI del norte visual (se ve carísimo, cuesta poco). Reduced-motion:
 * las palabras solo hacen fade, sin desplazamiento.
 */
export function AnimatedHeadline({ text, className }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <h1
      className={cn(
        "font-serif text-display leading-[0.95] tracking-[-0.025em] text-foreground text-balance",
        className,
      )}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span
            className="inline-block"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0.4 : 0.75,
              delay: reduce ? 0 : 0.12 + i * 0.07,
              ease: EASE,
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </h1>
  );
}
