import { Container, Eyebrow, Text } from "@/components/ui";

const year = new Date().getFullYear();

const links = [
  { href: "/privacidad", label: "Privacidad" },
  { href: "mailto:addelcv@gmail.com", label: "Email" },
  {
    href: "https://github.com/YiCi52",
    label: "GitHub",
    external: true,
  },
  {
    href: "https://www.linkedin.com/in/alejandro-diaz-del-castillo",
    label: "LinkedIn",
    external: true,
  },
];

export function Footer() {
  return (
    <footer
      className="border-t border-[color:var(--color-border)] py-16 mt-32"
      role="contentinfo"
    >
      <Container size="wide">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-start">
          <div>
            <Eyebrow>Alejandro Díaz del Castillo</Eyebrow>
            <Text size="base" tone="muted" className="mt-4 max-w-md">
              Dev freelance en Bogotá. Webs y web apps con criterio editorial
              para emprendedores y PYMEs en Colombia.
            </Text>
          </div>

          <nav aria-label="Enlaces secundarios">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    {...(link.external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {link.label}
                    {link.external && (
                      <span aria-hidden className="ml-1">
                        ↗
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-16 pt-8 border-t border-[color:var(--color-border)] flex flex-col sm:flex-row gap-3 sm:justify-between text-sm text-subtle">
          <p>© {year} Alejandro Díaz del Castillo Vargas</p>
          <p>Bogotá, Colombia</p>
        </div>
      </Container>
    </footer>
  );
}
