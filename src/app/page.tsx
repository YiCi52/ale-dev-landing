import { Hero } from "@/components/hero/Hero";
import { Servicios } from "@/components/servicios/Servicios";
import { Proceso } from "@/components/proceso/Proceso";

export default function Home() {
  return (
    <>
      <Hero />
      <Servicios />
      <Proceso />
    </>
  );
}
