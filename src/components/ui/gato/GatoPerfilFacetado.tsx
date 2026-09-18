type Props = { className?: string };

/*
  GATO C — perfil caminando, FACETADO de prueba. Etapa 0.5-B.

  MISMA silueta que GatoPerfilSilueta, subdividida en facetas. Eso es
  deliberado: la comparación solo sirve si el contorno no cambia, así lo único
  que se juzga es el facetado.

  Reglas del §8 del spec, aplicadas:
  · Base negro mate #0B0B0F. Las facetas se separan SOLO por sombra.
  · ΔL ≤ 8% entre facetas vecinas → los tonos van de #0B0B0F a #22222C.
  · CERO stroke en el cuerpo: las aristas del gato no pueden competir con las
    del cristal, que sí son brillantes y contrastadas.
  · Facetas grandes en el cuerpo, medianas en la cabeza, mínimas en las patas.
  · Rim light lila #5B4A96 a baja opacidad, solo para despegar del fondo.
  · Un único punto de ojo — sin iris, sin expresión (decisión del 30-ago).

  ⚠️ Facetado dibujado a mano para VALIDAR la dirección. El asset final se
  cosecha del modelo Blender (ruta C): ahí las facetas salen de geometría real
  y no se inventan.
*/
export function GatoPerfilFacetado({ className }: Props) {
  return (
    <svg
      viewBox="0 0 280 180"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* patas lejanas: un escalón más oscuras = profundidad sin dibujar dos veces (§6) */}
      <g id="pata-del-der">
        <path d="M 120 96 L 130 96 L 134 124 L 132 150 L 122 150 L 122 124 Z" fill="#0B0B0F" />
      </g>
      <g id="pata-tra-der">
        <path d="M 170 100 L 181 100 L 176 126 L 172 150 L 162 150 L 166 126 Z" fill="#0B0B0F" />
      </g>

      <g id="cuerpo">
        {/* lomo — la faceta más clara: recibe la luz cenital */}
        <path d="M 106 52 L 120 56 L 156 58 L 188 55 L 206 63 L 196 72 L 150 70 L 112 66 Z" fill="#22222C" />
        {/* flanco superior */}
        <path d="M 112 66 L 150 70 L 196 72 L 190 92 L 148 94 L 110 88 Z" fill="#1A1A22" />
        {/* flanco inferior / vientre en sombra */}
        <path d="M 110 88 L 148 94 L 190 92 L 200 104 L 176 108 L 140 112 L 112 106 Z" fill="#0E0E13" />
        {/* grupa */}
        <path d="M 196 72 L 206 63 L 210 88 L 200 104 L 190 92 Z" fill="#16161D" />
        {/* pecho */}
        <path d="M 100 92 L 110 88 L 112 106 Z" fill="#101016" />
        <path d="M 84 80 L 100 92 L 110 88 L 112 66 L 96 68 Z" fill="#15151C" />
        {/* cuello */}
        <path d="M 96 46 L 106 52 L 112 66 L 96 68 L 88 58 Z" fill="#1D1D26" />
        {/* cráneo */}
        <path d="M 52 36 L 58 32 L 72 30 L 80 28 L 94 34 L 96 46 L 88 58 L 62 52 Z" fill="#1F1F28" />
        {/* mejilla */}
        <path d="M 62 52 L 88 58 L 96 68 L 84 80 L 58 72 Z" fill="#141419" />
        {/* hocico */}
        <path d="M 30 58 L 40 47 L 52 36 L 62 52 L 58 72 L 36 64 Z" fill="#0E0E13" />
        {/* orejas: interior más oscuro que el cráneo */}
        <path d="M 58 32 L 60 8 L 72 30 Z" fill="#0B0B0F" />
        <path d="M 80 28 L 86 10 L 94 34 Z" fill="#0B0B0F" />
      </g>

      {/* cola: tres tramos, tonos decrecientes hacia la punta */}
      <g id="cola">
        <path d="M 203 66 L 213 62 L 216 56 L 205 58 L 200 58 Z" fill="#1A1A22" />
        <path d="M 213 62 L 236 50 L 240 40 L 216 56 Z" fill="#16161D" />
        <path d="M 236 50 L 252 28 L 258 12 L 249 10 L 243 26 L 229 44 L 240 40 Z" fill="#101016" />
      </g>

      {/* patas cercanas: más claras que las lejanas */}
      <g id="pata-del-izq">
        <path d="M 100 94 L 112 96 L 92 122 L 78 150 L 68 150 L 84 121 Z" fill="#18181F" />
      </g>
      <g id="pata-tra-izq">
        <path d="M 192 98 L 203 100 L 212 124 L 224 150 L 214 150 L 202 124 Z" fill="#18181F" />
      </g>

      {/* RIM LIGHT — solo para despegar del fondo. Nunca compite con el cristal. */}
      <g id="rim" opacity="0.5">
        <path d="M 52 36 L 58 32 L 72 30 L 80 28 L 94 34 L 96 46 L 93 46 L 91 36 L 79 31 L 72 33 L 59 35 L 54 39 Z" fill="#5B4A96" />
        <path d="M 106 52 L 120 56 L 156 58 L 188 55 L 206 63 L 203 66 L 187 59 L 156 62 L 120 60 L 105 56 Z" fill="#5B4A96" />
      </g>

      {/* OJO — un solo punto. Sin iris, sin expresión (decisión 30-ago). */}
      <circle id="ojo" cx="55" cy="50" r="2.6" fill="#CBBCFF" opacity="0.85" />
    </svg>
  );
}
