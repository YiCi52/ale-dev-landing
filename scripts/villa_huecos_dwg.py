# Revisor de HUECOS (30-sep): cada línea de vidrio/puerta del DWG (capa 2) de los niveles 0 y 1 que no tiene nada
# construido a 1 m de altura. Se corre con VILLA_SCRIPT_EXTRA=scripts/villa_huecos_dwg.py. Marca también cosas que
# NO son huecos (puertas abiertas, líneas de recorrido de la rampa, borde de losa, jardineras bajas): hay que triar.
import bpy, json, mathutils, os
d = json.load(open(os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente/dwg-muros.json")))
dg = bpy.context.evaluated_depsgraph_get()
objs = [o for o in bpy.context.scene.objects if o.type == "MESH" and not o.hide_render
        and not o.name.startswith(("pasto", "pradera", "grav", "camino", "mu_planta", "carp_"))]
def ocupado(p):
    for o in objs:
        bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        if not all(min(v[i] for v in bb) - 0.05 <= p[i] <= max(v[i] for v in bb) + 0.05 for i in range(3)): continue
        loc = o.matrix_world.inverted() @ mathutils.Vector(p)
        ok, q, n, _ = o.closest_point_on_mesh(loc)
        if ok and (o.matrix_world @ q - mathutils.Vector(p)).length < 0.10: return o.name
    return None
for nivel, z in (("nivel0", 1.0), ("nivel1", 3.31 + 1.0)):
    vistos = set()
    for s in d["niveles"][nivel]:
        if s["capa"] != "2" or s["tipo"] == "ARC": continue
        pts = s["pts"]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            L = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
            if L < 0.3: continue
            for t in (0.25, 0.5, 0.75):
                p = (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z)
                k = (round(p[0], 1), round(p[1], 1))
                if k in vistos: continue
                vistos.add(k)
                if not ocupado(p): print("[hueco]", nivel, [round(v, 2) for v in p], "linea", [round(x0,2), round(y0,2), round(x1,2), round(y1,2)])
