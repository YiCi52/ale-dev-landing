import { cn } from "@/lib/cn";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export function Divider({ orientation = "horizontal", className }: DividerProps) {
  return (
    <span
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? "block h-px w-full bg-[color:var(--color-border)]"
          : "inline-block h-full w-px bg-[color:var(--color-border)]",
        className,
      )}
    />
  );
}
