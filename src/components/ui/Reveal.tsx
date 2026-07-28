"use client";

import { useReveal } from "@/hooks/use-reveal";

type Variant = "rise" | "blur" | "clip";

const variantClass: Record<"rise" | "blur", string> = {
  rise: "reveal",
  blur: "reveal reveal-blur",
};

type Props = {
  children: React.ReactNode;
  /** Retraso en ms — úsalo con un índice para escalonar (stagger) una lista. */
  delay?: number;
  className?: string;
  /** rise = fade + sube · blur = fade + desenfoca · clip = sube desde detrás de una línea (máscara) */
  variant?: Variant;
};

export function Reveal({ children, delay = 0, className, variant = "rise" }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  // clip: máscara con overflow (el elemento OBSERVADO nunca lleva clip-path,
  // que rompe IntersectionObserver → area clippeada = ratio 0 = nunca dispara).
  if (variant === "clip") {
    return (
      <div
        ref={ref}
        className={`reveal-mask${visible ? " reveal-visible" : ""}${
          className ? ` ${className}` : ""
        }`}
      >
        <div className="reveal-mask-inner" style={delayStyle}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={delayStyle}
      className={`${variantClass[variant]}${visible ? " reveal-visible" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
}
