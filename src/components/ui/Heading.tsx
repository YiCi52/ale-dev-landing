import { cn } from "@/lib/cn";

type Level = "display" | "h1" | "h2" | "h3" | "h4";

type HeadingProps = {
  children: React.ReactNode;
  level?: Level;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
};

const levelClasses: Record<Level, string> = {
  display:
    "font-serif text-display leading-[0.95] tracking-[-0.025em] text-foreground",
  h1: "font-serif text-5xl sm:text-6xl leading-[1] tracking-[-0.02em] text-foreground",
  h2: "font-serif text-4xl sm:text-5xl leading-[1.05] tracking-[-0.015em] text-foreground",
  h3: "font-serif text-2xl sm:text-3xl leading-[1.15] tracking-[-0.01em] text-foreground",
  h4: "font-sans text-lg sm:text-xl font-medium leading-snug text-foreground",
};

export function Heading({
  children,
  level = "h2",
  as,
  className,
}: HeadingProps) {
  const Tag = as ?? (level === "display" ? "h1" : (level as "h1" | "h2" | "h3" | "h4"));
  return <Tag className={cn(levelClasses[level], className)}>{children}</Tag>;
}
