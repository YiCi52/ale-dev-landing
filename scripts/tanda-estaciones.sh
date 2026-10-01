#!/bin/bash
# Fase 5: una toma por estación de luz (scripts/villa_estaciones.py).
cd "$(dirname "$0")/.."
for e in ${@:-llegada vestibulo rampa_pb rampa_n1 hall salon salon_terraza terraza rampa_ext solarium cocina boudoir bano}; do
  for dev in "" 1; do
    VILLA_CPU=$dev VILLA_ESTACION=$e VILLA_PASTO_N=${VILLA_PASTO_N:-0} VILLA_MUESTRAS=${M:-64} VILLA_PCT=${P:-50} \
    VILLA_OUT=$PWD/artefactos-bake/luz/est-$e.png VILLA_LOG=/tmp/est-$e.log bash scripts/render-seguro.sh >/dev/null 2>&1 && { echo "ok $e"; break; }
    [ -n "$dev" ] && echo "FALLO $e"
  done
done
