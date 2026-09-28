#!/bin/bash
# Render de la Villa sin tumbar el Mac (27-sep: un render de pasto pesado lo apagó).
# Blender con 4 hilos y prioridad baja; si su memoria pasa de TOPE_MB, se mata y se avisa.
# Uso: VILLA_OUT=... [VILLA_*=...] bash scripts/render-seguro.sh
TOPE_MB=${TOPE_MB:-4000}
nice -n 10 /Applications/Blender.app/Contents/MacOS/Blender -b -t 4 -P scripts/villa-blender.py > "${VILLA_LOG:-/tmp/villa-render.log}" 2>&1 &
PID=$!
while kill -0 $PID 2>/dev/null; do
  RSS=$(ps -o rss= -p $PID 2>/dev/null | tr -d ' ')
  if [ -n "$RSS" ] && [ "$RSS" -gt $((TOPE_MB * 1024)) ]; then
    kill -9 $PID; echo "ABORTADO: Blender pasó de ${TOPE_MB} MB"; exit 2
  fi
  sleep 1
done
wait $PID; C=$?
grep -E "Saved|Traceback|Error" "${VILLA_LOG:-/tmp/villa-render.log}" | tail -4
exit $C
