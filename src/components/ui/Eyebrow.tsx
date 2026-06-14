import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
};

export function Eyebrow({ children, className, as: Tag = "p" }: EyebrowProps) {
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
