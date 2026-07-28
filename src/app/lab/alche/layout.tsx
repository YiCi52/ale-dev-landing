import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab · Réplica ALCHE",
  robots: { index: false, follow: false },
};

export default function AlcheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
