#!/bin/bash
# Fase 5, noche: estaciones con VILLA_MODO=noche (exposición propia de noche por estación).
cd "$(dirname "$0")/.."
r() { e=$1; x=$2; [ -n "$SOLO" ] && [[ " $SOLO " != *" $e "* ]] && return
  for dev in "" 1; do
    VILLA_CPU=$dev VILLA_MODO=noche VILLA_ESTACION=$e VILLA_EXPO=$x VILLA_PASTO_N=${VILLA_PASTO_N:-0} VILLA_MUESTRAS=${M:-96} VILLA_PCT=${P:-50} \
    VILLA_OUT=$PWD/artefactos-bake/luz/noche-$e.png VILLA_LOG=/tmp/noche-$e.log bash scripts/render-seguro.sh >/dev/null 2>&1 && { echo "ok $e"; return; }
  done; echo "FALLO $e"; }
r llegada ${X_LLEGADA:-1.5}; r vestibulo ${X_VEST:-1.4}; r salon ${X_SALON:-0.6}; r bano ${X_INT:-1.0}; r boudoir ${X_INT:-1.0}; r solarium ${X_LLEGADA:-1.5}
