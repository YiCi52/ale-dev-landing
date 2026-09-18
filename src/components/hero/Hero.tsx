import { Button, Container, Text } from "@/components/ui";
import { AnimatedHeadline } from "@/components/hero/AnimatedHeadline";
import { SelloCastillo } from "@/components/hero/SelloCastillo";
import { HeroAtmosphere } from "@/components/hero/HeroAtmosphere";
import { HeroCrystalMount } from "@/components/hero/HeroCrystalMount";

/**
 * Hero — jerarquía de un solo protagonista (iteración 2026-08-26).
 *
 * El problema que resolvió esta pasada: el hero decía la misma idea tres veces
 * (titular → h2 → párrafo) y repartía el peso visual entre diez elementos, así
 * que ninguno mandaba. Ahora la escalera es explícita:
 *   1. sello (identidad, discreto)   2. titular (el protagonista)
 *   3. cristal (el objeto)           4. una línea de contexto
 *   5. dos acciones + un dato        — en ese orden de peso, sin empates.
 *
 * Un solo pill, no tres: MASTER pide "Bogotá · hora local" y tres chips con
 * borde lila competían con el acento del propio cristal.
 */
export function Hero() {
  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden py-32 sm:py-40">
      <HeroAtmosphere />
      <HeroCrystalMount />
      <Container size="wide">
        <div className="hero-enter relative z-10">
          <SelloCastillo />
          {/*
            El titular NO abre con el mecanismo (inversión 2026-08-02): antes
            decía "No una vitrina. Un sistema que captura.", una distinción de
            categoría que solo entiende quien YA sabe que las vitrinas fallan.
            Respondía una pregunta que todavía no había hecho hacer.

            2026-08-26 — dos cambios, y el segundo lo dictó el público:
            1. Se retiró el h2 "No una vitrina: un sistema que captura." Era
               ese titular jubilado, que nunca se borró: solo bajó un nivel y
               quedó repitiendo la promesa entre el titular y el párrafo. Si
               vuelve a hacer falta el mecanismo, va en Servicios.
            2. El titular decía "Tu trabajo ya impresiona. Lo que pasa
               después, no." Mari —diseñadora de interiores, o sea el público
               exacto de este sitio— lo leyó como un ataque: abre señalando un
               defecto de quien lo lee, y encima obliga a reconstruir el verbo
               elidido. La corrección es suya: afirmar primero y ofrecer
               después, sin defecto de por medio. "Convencerlos" en vez de
               "impresionarlos" porque el trabajo de ellos ya impresiona — lo
               que este sitio mejora es la DECISIÓN de quien lo mira, que es
               justamente lo que Castillo vende.
          */}
          <AnimatedHeadline
            text="Tu trabajo ya impresiona. Podría convencerlos aún más."
            className="mt-10 max-w-4xl"
          />
          <Text size="lg" tone="muted" className="mt-8 max-w-md">
            El sitio donde tus referidos terminan de decidirse — para
            arquitectos y diseñadores de interior.
          </Text>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button as="a" href="#contacto" size="lg" variant="primary">
              Hablemos de tu proyecto
            </Button>
            <Button as="a" href="#casos" size="lg" variant="ghost">
              Ver caso real ↓
            </Button>
          </div>
          <p className="mt-16 font-sans text-xs uppercase tracking-[0.18em] text-subtle">
            Bogotá · remoto
          </p>
        </div>
      </Container>
    </section>
  );
}
