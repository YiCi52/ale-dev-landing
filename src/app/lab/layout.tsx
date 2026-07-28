import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

// Fuente grotesca solo para el demo /lab (scope local vía variable en el wrapper).
const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lab · Demo estilo Sanjaya",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={grotesk.variable}>{children}</div>;
}
