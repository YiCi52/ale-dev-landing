import type { Metadata } from "next";
import localFont from "next/font/local";

// Fuente grotesca solo para el demo /lab (scope local vía variable en el wrapper).
const grotesk = localFont({
  src: "../../fonts/SpaceGrotesk-300-700-latin.woff2",   // local desde 1-oct (ver src/app/layout.tsx)
  variable: "--font-grotesk",
  weight: "300 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lab · Demo estilo Sanjaya",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={grotesk.variable}>{children}</div>;
}
