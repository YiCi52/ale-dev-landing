import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  as: "a";
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

type ButtonAsButton = CommonProps & {
  as?: "button";
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

type ButtonProps = ButtonAsLink | ButtonAsButton;

const base =
  "inline-flex items-center justify-center font-sans font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] focus-visible:ring-foreground disabled:opacity-50 disabled:pointer-events-none";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:bg-[var(--color-fg-muted)]",
  secondary:
    "border border-[color:var(--color-border-strong)] text-foreground hover:border-foreground hover:bg-[color:var(--color-bg-elevated)]",
  ghost:
    "text-muted hover:text-foreground",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
};

export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if (props.as === "a") {
    const isExternal = props.target === "_blank";
    return (
      <a
        href={props.href}
        target={props.target}
        rel={isExternal ? (props.rel ?? "noopener noreferrer") : props.rel}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
