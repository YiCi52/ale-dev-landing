import { CatMascot, Eyebrow } from "@/components/ui";

/*
  Sello Castillo — el gato y la luna, la marca personal de Alejandro.
  Contrato: design-system/castillo-v2/logo-animado-gato-luna.md

  Secuencia (una vez por sesión): luna en fases → el gato entra caminando por
  debajo → la luna menguante ya ES una C → la C barre hacia la derecha y al
  pasar descubre el nombre → la C sale de cuadro y quedan el gato y el nombre.

  Tres decisiones que sostienen esto:

  1. TODO es CSS. No hay librería de motion ni estado de React. El estado
     natural del marcado (sin CSS, sin JS, sin animación) ya es el estado
     FINAL: gato visible + nombre legible. Nada crítico depende de que algo
     monte y dispare — mismo principio que el titular del hero.
  2. Las fases lunares no son cuatro dibujos: son un disco con un círculo
     que lo enmascara y se desliza. Y la fase creciente y la letra C son la
     misma forma — por eso el "morph" no necesita librería.
  3. La C viaja dentro de una pista del ancho del sello, así el recorrido se
     expresa en % y no hay que medir el texto en JS.

  El gate de "una vez por sesión" vive en el script de layout.tsx: pone
  data-sello="play" en <html> antes del primer pintado, así no hay parpadeo.
*/

export function SelloCastillo() {
  return (
    <div
      tabIndex={0}
      className="sello cat-mascot-wrap relative inline-flex items-center gap-3 rounded-sm text-muted outline-none"
    >
      {/*
        Las clases animadas viven en spans, no en los <svg>: varios navegadores
        no aceleran por hardware las transforms aplicadas directamente sobre un
        elemento SVG (regla `rendering-animate-svg-wrapper` de Vercel).
      */}
      <span className="sello__figura relative block h-10 w-10 shrink-0">
        <span className="sello__gato absolute inset-0 block">
          <CatMascot className="h-full w-full" />
        </span>
      </span>

      {/*
        El nombre completo parte en dos líneas por debajo de 640px, y una
        cortina vertical sobre dos líneas descubre las dos a la vez — el gesto
        deja de leerse como causa. En móvil queda solo la marca, que además es
        lo único que cabe cómodo en un eyebrow a ese ancho.
      */}
      <Eyebrow as="span" className="sello__nombre">
        Castillo Studio
        <span className="hidden sm:inline">
          {" · Alejandro Díaz del Castillo"}
        </span>
      </Eyebrow>

      {/*
        Pista de la luna: capa absoluta del ancho del sello. Va después del
        nombre en el DOM para pintarse encima, y aria-hidden porque es puro
        adorno — el nombre ya está en el árbol de accesibilidad como texto.
      */}
      <span
        aria-hidden
        className="sello__pista pointer-events-none absolute inset-0 flex items-center"
      >
        {/*
          La luna va en el acento y NO en el color del gato: cuando ambos
          coinciden en el mismo punto —el instante "gato bajo la luna", que es
          la imagen de la marca— dos siluetas del mismo gris se fundirían en
          una sola mancha.
        */}
        <span className="sello__luna block h-10 w-10 shrink-0 text-[color:var(--color-accent)]">
          <svg
            viewBox="0 0 60 60"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <defs>
              <mask
                id="sello-fase-lunar"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="60"
                height="60"
              >
                <rect x="0" y="0" width="60" height="60" fill="#fff" />
                {/*
                  El único elemento animado que NO se puede sacar a un span: es
                  el círculo que enmascara al disco, y vive dentro del SVG por
                  definición. Es un translate en un recuadro de 40px.
                */}
                <circle
                  className="sello__sombra"
                  cx="30"
                  cy="30"
                  r="19"
                  fill="#000"
                />
              </mask>
            </defs>
            <circle
              cx="30"
              cy="30"
              r="19"
              fill="currentColor"
              mask="url(#sello-fase-lunar)"
            />
          </svg>
        </span>
      </span>
    </div>
  );
}
