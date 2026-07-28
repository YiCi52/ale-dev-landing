import { LabNav } from "@/components/lab/LabNav";
import { LabHero } from "@/components/lab/LabHero";

export default function LabPage() {
  return (
    <div className="relative min-h-screen bg-[#08090c] text-white antialiased">
      <LabNav />
      <LabHero />
      {/* Fase 2: Hidden Cost (nodos reactivos) + statement + footer */}
    </div>
  );
}
