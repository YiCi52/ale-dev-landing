import { Container } from "./Container";
import { cn } from "@/lib/cn";

type SectionProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  containerSize?: "narrow" | "default" | "wide";
  spacing?: "tight" | "default" | "loose";
};

const spacingClasses: Record<NonNullable<SectionProps["spacing"]>, string> = {
  tight: "py-16 sm:py-20",
  default: "py-24 sm:py-32 lg:py-40",
  loose: "py-32 sm:py-44 lg:py-56",
};

export function Section({
  children,
  id,
  className,
  containerSize = "default",
  spacing = "default",
}: SectionProps) {
  return (
    <section id={id} className={cn(spacingClasses[spacing], className)}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}
