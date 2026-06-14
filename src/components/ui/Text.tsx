import { cn } from "@/lib/cn";

type Tone = "default" | "muted" | "subtle";
type Size = "sm" | "base" | "lg" | "xl";

type TextProps = {
  children: React.ReactNode;
  size?: Size;
  tone?: Tone;
  className?: string;
  as?: "p" | "span" | "div";
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const toneClasses: Record<Tone, string> = {
  default: "text-foreground",
  muted: "text-muted",
  subtle: "text-subtle",
};

export function Text({
  children,
  size = "base",
  tone = "default",
  className,
  as: Tag = "p",
}: TextProps) {
  return (
    <Tag
      className={cn(
        "font-sans leading-relaxed",
        sizeClasses[size],
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
