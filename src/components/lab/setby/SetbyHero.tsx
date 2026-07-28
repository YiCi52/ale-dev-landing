import Image from "next/image";

/**
 * Hero con objeto 3D pre-renderizado (Blender → Cycles → PNG con alfa).
 *
 * El truco del video de @ayzz.thedesigner: el 3D NO corre en vivo (nada de R3F).
 * Es un render offline fotorrealista que se integra como imagen y se anima con
 * CSS. Resultado: se ve 4K sin costar un solo frame de GPU en el navegador.
 *
 * Sándwich de z-index: "Precision" detrás del contenedor, "Delivery" delante —
 * el objeto queda físicamente entre las dos palabras y crea profundidad real.
 */
export function SetbyHero() {
  return (
    <section className="setby-hero" aria-labelledby="setby-hero-title">
      <h1 id="setby-hero-title" className="sr-only">
        Setby — Precision Delivery
      </h1>

      <span className="setby-word setby-word--back" aria-hidden>
        Precision
      </span>

      <div className="setby-object" aria-hidden>
        <div className="setby-object__swing">
          <Image
            src="/lab/setby-container.png"
            alt=""
            width={1800}
            height={1400}
            priority
            className="setby-object__img"
          />
        </div>
      </div>

      <span className="setby-word setby-word--front" aria-hidden>
        Delivery
      </span>

      <p className="setby-hero__lede">
        Logistics with flair and bright innovation. Trusted by those who prize
        care, speed, and dedication.
      </p>
    </section>
  );
}
