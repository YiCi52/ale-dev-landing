import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab · Réplica Setby",
  robots: { index: false, follow: false },
};

export default function SetbyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
