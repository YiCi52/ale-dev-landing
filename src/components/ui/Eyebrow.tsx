import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
  /** pill: estilo tech tipo Sanjaya — monospace en cápsula con borde + glifo. */
  pill?: boolean;
};

export function Eyebrow({
  children,
  className,
  as: Tag = "p",
  pill = false,
}: EyebrowProps) {
  if (pill) {
    return (
      <Tag
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-white/[0.02] px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted backdrop-blur-sm",
          className,
        )}
      >
        <span aria-hidden className="text-[0.62em] text-[color:var(--color-accent)]">
          ◆
        </span>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn(
        "font-sans text-xs uppercase tracking-[0.22em] text-muted",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
