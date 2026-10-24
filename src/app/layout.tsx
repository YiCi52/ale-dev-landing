import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StructuredData } from "@/components/seo/StructuredData";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

/*
  Castillo v5 (24-oct): Geist Mono (rótulos técnicos) vive aquí; Archivo y Newsreader en el layout de la v5.
  Geist se mantiene para las páginas internas (/lab, /styleguide).
  Contrato: design-system/castillo-v2/MASTER.md. Variable font — los pesos
  400/500/600/700 salen del mismo archivo.
*/
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:
      "Castillo Studio — Sitios que capturan clientes para arquitectos y diseñadores",
    template: "%s · Castillo Studio",
  },
  /*
   * El copy evita la promesa saturada del nicho ("una web que refleje tu
   * trabajo") y ocupa el territorio libre detectado en la auditoría de
   * competencia: lo que pasa DESPUÉS de que llega el visitante.
   */
  description:
    "No solo una vitrina: sitios con diseño editorial y captura de clientes integrada para arquitectos, diseñadores de interior y estudios con criterio visual. Desarrollo a medida en Next.js.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Castillo Studio",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="es-CO"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col isolate">
        <StructuredData />
        {/*
          24-oct-2026: la v5 es el sitio. La cabecera, el pie, el scroll suave, el grano y el cursor del tema anterior
          salieron del layout raíz: cada grupo de rutas trae los suyos (la v5, en app/(v5)/layout.tsx). Antes la v5 los
          escondía con CSS y el celular igual bajaba gsap y framer (~330 KB) sin usarlos.
        */}
        {children}
        {/*
          Analítica. Iba faltando desde el día 1 y se notó el 23-ago: el
          formulario llevaba dos meses sin guardar un lead y no había forma
          de saber cuánta gente lo intentó — sin analítica no existe la
          pregunta "¿cuántos llegaron?", solo "¿cuántos escribieron?".

          Vercel y no Google Analytics: sin cookies (no exige banner bajo la
          Ley 1581), ~1 kB en vez de ~50, y el script y el beacon salen del
          mismo origen (/_vercel/insights) así que el CSP los cubre con
          'self' sin abrir un dominio nuevo a script-src ni a connect-src.
        */}
        <Analytics />
      </body>
    </html>
  );
}
