type Props = { className?: string };

/*
  GATO C — perfil caminando, SILUETA PURA. Etapa 0.5.

  Sin facetas, sin rim light, sin detalle: exactamente lo que pidió Alejandro
  para validar antes de facetar. La razón de este orden está en el §7 del spec:
  a 16px las facetas son ruido, así que la identidad la carga la silueta. Si no
  se reconoce como gato así, ningún facetado lo salva.

  Los tres invariantes que deben sobrevivir a cualquier pose:
    1. las dos cuñas de las orejas
    2. la línea del lomo que cae del pecho a la cadera
    3. la curva de la cola

  Contorno POLIGONAL, no curvo, porque la dirección aprobada es geométrica: la
  silueta ya anticipa el facetado en vez de contradecirlo.

  Mira a la IZQUIERDA (canónico). La derecha se obtiene con scaleX(-1) — el
  personaje es simétrico a propósito para que el espejo sea gratis (§6).
  Las patas van en grupos separados: ya son las piezas del rig del §4.
*/
export function GatoPerfilSilueta({ className }: Props) {
  return (
    <svg
      viewBox="0 0 280 180"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      {/* patas lejanas primero: quedan detrás del cuerpo */}
      <g id="pata-del-der">
        <path d="M 120 96 L 130 96 L 134 124 L 132 150 L 122 150 L 122 124 Z" />
      </g>
      <g id="pata-tra-der">
        <path d="M 170 100 L 181 100 L 176 126 L 172 150 L 162 150 L 166 126 Z" />
      </g>

      {/* cuerpo + cabeza + orejas: una sola pieza */}
      <g id="cuerpo">
        <path
          d="M 30 58 L 40 47 L 52 36 L 58 32 L 60 8 L 72 30 L 80 28 L 86 10
             L 94 34 L 96 46 L 106 52 L 120 56 L 156 58 L 188 55 L 206 63
             L 210 88 L 200 104 L 176 108 L 140 112 L 112 106 L 100 92
             L 84 80 L 58 72 L 36 64 Z"
        />
      </g>

      {/* cola: tres tramos que después serán cola-1/2/3 del rig */}
      <g id="cola">
        <path
          d="M 203 66 L 213 62 L 236 50 L 252 28 L 258 12 L 249 10
             L 243 26 L 229 44 L 209 55 L 200 58 Z"
        />
      </g>

      {/* patas cercanas: delante del cuerpo */}
      <g id="pata-del-izq">
        <path d="M 100 94 L 112 96 L 92 122 L 78 150 L 68 150 L 84 121 Z" />
      </g>
      <g id="pata-tra-izq">
        <path d="M 192 98 L 203 100 L 212 124 L 224 150 L 214 150 L 202 124 Z" />
      </g>
    </svg>
  );
}
