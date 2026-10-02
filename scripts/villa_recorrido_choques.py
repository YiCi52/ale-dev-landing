# Chequeo del recorrido (fase 6): distancia libre de la cámara a la obra en cada punto del camino, en 12 direcciones
# horizontales + arriba/abajo. Se corre con VILLA_SCRIPT_EXTRA=scripts/villa_recorrido_choques.py VILLA_RECORRIDO=<tramo>.
import bpy, math, mathutils, os, villa_recorrido as vr
tramo = os.environ.get("VILLA_RECORRIDO", "llegada_rampa")
curva, idx = vr._catmull(vr.TRAMOS[tramo])
dg = bpy.context.evaluated_depsgraph_get(); esc = bpy.context.scene
peor = []
for k, p in enumerate(curva):
    dmin, quien = 99.0, ""
    dirs = [mathutils.Vector((math.cos(a), math.sin(a), 0)) for a in [i * math.pi / 6 for i in range(12)]] + [mathutils.Vector((0, 0, 1))]
    for d in dirs:
        ok, loc, n, i, o, m = esc.ray_cast(dg, p, d, distance=2.0)
        if ok and (loc - p).length < dmin and not o.name.startswith(("pasto", "mu_planta")): dmin, quien = (loc - p).length, o.name
    peor.append((round(dmin, 2), k, [round(v, 2) for v in p], quien))
peor.sort()
print("[choque] los 12 puntos más ajustados (distancia libre en m, muestra, posición, objeto más cercano):")
for x in peor[:12]: print("[choque]", x)
