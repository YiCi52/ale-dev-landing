import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/footer/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Grain } from "@/components/ui/Grain";
import { FluidCursor } from "@/components/ui/FluidCursor";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
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
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
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
