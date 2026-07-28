import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Grain } from "@/components/ui/Grain";
import { FluidCursor } from "@/components/ui/FluidCursor";
import "./globals.css";

/*
  Castillo v2: Geist único (display+body) + Geist Mono (labels/índices).
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
    default: "Castillo Studio — Sitios para arquitectos y diseñadores",
    template: "%s · Castillo Studio",
  },
  description:
    "Sitios web con diseño editorial para arquitectos, diseñadores de interior y estudios con criterio visual. Desarrollo a medida en Next.js. Desde Bogotá, para clientes en cualquier parte.",
  metadataBase: new URL("https://ale-dev-landing.vercel.app"),
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
        <SmoothScroll />
        <Grain />
        <FluidCursor />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
