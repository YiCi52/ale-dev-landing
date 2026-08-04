import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/nav/Header";
import { Footer } from "@/components/footer/Footer";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Grain } from "@/components/ui/Grain";
import { FluidCursor } from "@/components/ui/FluidCursor";
import { StructuredData } from "@/components/seo/StructuredData";
import { SITE_URL } from "@/lib/site";
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
          Gate del sello del hero. Marca la sesión ANTES del primer pintado
          para que la coreografía luna→gato→C corra una sola vez y no en cada
          navegación del cliente. Va inline y no en un efecto de React porque
          un efecto llega después de la hidratación: el nombre alcanzaría a
          verse y luego se escondería.
          El HTML inyectado es una constante del código, sin ninguna entrada
          de usuario. Si sessionStorage está bloqueado, no pasa nada: sin el
          atributo el sello se queda en su estado final, que es el legible.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!sessionStorage.getItem("cs-sello")){sessionStorage.setItem("cs-sello","1");document.documentElement.dataset.sello="play"}}catch(e){}`,
          }}
        />
        <SmoothScroll />
        <Grain />
        <FluidCursor />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
