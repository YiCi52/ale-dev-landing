#!/bin/bash
# Fase 6: renderiza un tramo del recorrido como secuencia PNG; si Metal se cae, relanza y sigue (placeholders).
# Uso: bash scripts/tanda-recorrido.sh <tramo> [P=50] [M=32]
cd "$(dirname "$0")/.."
T=${1:-llegada_rampa}; D=$PWD/artefactos-bake/recorrido/$T; mkdir -p "$D"
for intento in 1 2 3 4 5 6 7 8; do
  dev=""; [ $intento -gt 3 ] && dev=1
  VILLA_CPU=$dev VILLA_RECORRIDO=$T VILLA_PASTO_N=${VILLA_PASTO_N:-0} VILLA_MUESTRAS=${M:-32} VILLA_PCT=${P:-50} \
  VILLA_OUT=$D VILLA_LOG=/tmp/rec-$T.log bash scripts/render-seguro.sh >/dev/null 2>&1 && { echo "ok $T ($(ls $D | wc -l) fotogramas)"; exit 0; }
  find "$D" -name 'f_*.png' -size 0 -delete                      # placeholders del fotograma que se cayó
  echo "reintento $intento ($(ls $D | wc -l) hechos)"
done
echo "FALLO $T"
