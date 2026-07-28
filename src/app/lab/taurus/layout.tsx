import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab · Réplica Taurus",
  robots: { index: false, follow: false },
};

export default function TaurusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
