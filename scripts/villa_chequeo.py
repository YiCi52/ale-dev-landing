"""
Chequeo geométrico de TODA la obra (30-sep-2026). Pedido de Alejandro tras las esquinas vacías de la jardinera:
"¿comprobaste que no se repitiera en otro lado?". Se corre con VILLA_CHEQUEO=1 (no renderiza).

Busca, entre pares de piezas de obra (muros, losas, bandas, vidrios, antepechos, jardineras, baño):
  · RENDIJAS: cajas que se enfrentan con un hueco de 2 mm a 15 cm y comparten al menos 10 cm de frente
  · CARAS COPLANARES: caras de objetos distintos en el mismo plano (±0,6 mm) que se solapan → rayas negras
Usa las caras reales (no solo las cajas) para las coplanares; también para las rendijas (caras que se miran).
"""
import bpy, mathutils

PREFIJOS = ("pb_", "n1_", "fa_", "cub", "circ_", "losa_", "antepecho", "bano_", "mu_jardinera", "mu_piso", "carp_marcos",
            "piloti", "herradura", "mont_")


def _caras(objs, area_min=0.01):
    """Caras alineadas a los ejes, en coordenadas de mundo: (objeto, eje, signo, plano, min, max de los otros ejes)."""
    caras = []
    for o in objs:
        mw = o.matrix_world; rot = mw.to_3x3()
        for p in o.data.polygons:
            if p.area < area_min: continue
            n = (rot @ p.normal).normalized()
            eje = max(range(3), key=lambda k: abs(n[k]))
            if abs(n[eje]) < 0.999: continue
            vs = [mw @ o.data.vertices[v].co for v in p.vertices]
            otros = [k for k in range(3) if k != eje]
            caras.append((o.name, eje, 1 if n[eje] > 0 else -1, vs[0][eje],
                          [min(v[k] for v in vs) for k in otros], [max(v[k] for v in vs) for k in otros]))
    return caras


def _solape(a, b):
    return min(min(a[5][k], b[5][k]) - max(a[4][k], b[4][k]) for k in range(2))


def _relleno(objs, p, excluir):
    """¿El punto p (mundo) queda DENTRO de alguna otra pieza? Entonces la "rendija" la tapa una tercera pieza."""
    v = mathutils.Vector(p)
    for o in objs:
        if o.name in excluir: continue
        a, b = [min((o.matrix_world @ mathutils.Vector(c))[i] for c in o.bound_box) for i in range(3)], \
               [max((o.matrix_world @ mathutils.Vector(c))[i] for c in o.bound_box) for i in range(3)]
        if not all(a[i] - 1e-4 <= v[i] <= b[i] + 1e-4 for i in range(3)): continue
        loc = o.matrix_world.inverted() @ v
        ok, q, n, _ = o.closest_point_on_mesh(loc)
        if ok and (q - loc).dot(n) >= -1e-5: return True
    return False


def rendijas(caras, tope=0.15, minimo=0.002, frente=0.10, objs=()):
    """Ranura real: dos caras de objetos distintos que se MIRAN (normales opuestas, cada una apuntando a la otra),
    separadas de 2 mm a 15 cm y con al menos 10 cm de frente compartido en los dos sentidos."""
    hallazgos = set()
    por_eje = {}
    for c in caras: por_eje.setdefault(c[1], []).append(c)
    for grupo in por_eje.values():
        pos = [c for c in grupo if c[2] > 0]; neg = [c for c in grupo if c[2] < 0]
        for a in pos:                                  # a mira hacia +; b (mira hacia −) debe estar delante
            for b in neg:
                if a[0] == b[0]: continue
                gap = b[3] - a[3]
                if minimo < gap < tope and _solape(a, b) >= frente:
                    centro = [0, 0, 0]; centro[a[1]] = (a[3] + b[3]) / 2
                    for j, k in enumerate(o for o in range(3) if o != a[1]):
                        centro[k] = (max(a[4][j], b[4][j]) + min(a[5][j], b[5][j])) / 2
                    if objs and _relleno(objs, centro, (a[0], b[0])): continue
                    hallazgos.add((round(gap * 100, 1), "xyz"[a[1]], round(a[3], 2), *sorted((a[0], b[0]))))
    return sorted(hallazgos, reverse=True)


def coplanares(caras, tol=0.0006):
    """Rayas: caras de objetos distintos en el mismo plano, mirando HACIA EL MISMO LADO, que se solapan.
    (Dos caras en contacto que se miran de frente no se ven nunca: esas no cuentan.)"""
    por_plano = {}
    for c in caras: por_plano.setdefault((c[1], c[2], round(c[3], 3)), []).append(c)
    hallazgos = set()
    for grupo in por_plano.values():
        for i, a in enumerate(grupo):
            for b in grupo[i + 1:]:
                if a[0] == b[0] or abs(a[3] - b[3]) > tol: continue
                if _solape(a, b) > 0.02: hallazgos.add(("xyz"[a[1]] + ("+" if a[2] > 0 else "-"), round(a[3], 3), *sorted((a[0], b[0]))))
    return sorted(hallazgos)


def correr():
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH" and o.name.startswith(PREFIJOS) and not o.hide_render]
    caras = _caras(objs)
    r = rendijas(caras, objs=objs); c = coplanares(caras)
    print(f"[chequeo] {len(objs)} piezas de obra · {len(r)} rendijas · {len(c)} pares coplanares")
    for h in r: print("[chequeo] RENDIJA", h)
    for h in c: print("[chequeo] COPLANAR", h)
    import os
    for n in filter(None, os.environ.get("VILLA_CAJAS", "").split(",")):   # cajas de piezas puntuales, para ubicar cámaras
        o = bpy.data.objects.get(n)
        if o: a, b = [min((o.matrix_world @ mathutils.Vector(c))[i] for c in o.bound_box) for i in range(3)], [max((o.matrix_world @ mathutils.Vector(c))[i] for c in o.bound_box) for i in range(3)]; print("[caja]", n, [round(v, 3) for v in a], [round(v, 3) for v in b])


def cobertura():
    """Qué piezas revisa el chequeo y cuáles no (por nombre), y cuántas caras curvas quedan fuera del método."""
    import collections
    todas = [o for o in bpy.context.scene.objects if o.type == "MESH" and not o.hide_render]
    dentro = [o for o in todas if o.name.startswith(PREFIJOS)]
    fuera = collections.Counter(o.name.rstrip("0123456789._").rstrip("_") for o in todas if not o.name.startswith(PREFIJOS))
    grupos = collections.Counter(o.name.split("_")[0] for o in dentro)
    print("[cobertura] revisadas por grupo:", dict(grupos))
    for o in dentro:
        rot = o.matrix_world.to_3x3(); n_c = sum(1 for p in o.data.polygons if max(abs((rot @ p.normal).normalized()[k]) for k in range(3)) < 0.999)
        if n_c > 20: print(f"[cobertura] curva/inclinada: {o.name} ({n_c} caras fuera del método)")
    print("[cobertura] NO revisadas:", dict(fuera))
