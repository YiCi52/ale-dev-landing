import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Footer } from "@/components/footer/Footer";
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

export const metadata: Metadata = {
  title: {
    default: "Alejandro Díaz del Castillo — Dev freelance",
    template: "%s · Alejandro Díaz del Castillo",
  },
  description:
    "Webs con criterio. Sin pinta de plantilla. Desarrollo de landings, sitios y web apps con Next.js, Supabase y diseño editorial para emprendedores y PYMEs en Colombia.",
  metadataBase: new URL("https://ale-dev-landing.vercel.app"),
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Alejandro Díaz del Castillo — Dev",
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
      className={`${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
