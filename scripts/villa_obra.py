"""
Obra gris de la Villa desde el plano (fase 2 del PLAN-OBRA, 28-sep-2026).

Lee los contornos EXACTOS de muros y pilotis del DWG (rellenos SOLID de la capa 7, ya en metros:
expediente/dwg-muros-solidos.json) y los levanta. Nada se mide a ojo: si un muro está mal, se
corrige el plano o el JSON, no este archivo.

Ejes del JSON: x (izq −, der +), z (lado 2 / fondo −, lado 1 / acceso +). Blender: (X, Y, Z) = (x, z, altura).
"""
import bpy, bmesh, json, math, os
import villa_circulacion

EXP = os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente")


def _cargar(nombre):
    with open(os.path.join(EXP, nombre), encoding="utf-8") as f:
        return json.load(f)


def _area(p):
    return abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2


def _bbox(p):
    return min(x for x, _ in p), max(x for x, _ in p), min(z for _, z in p), max(z for _, z in p)


def _centro(p):
    return (sum(a for a, _ in p) / len(p), sum(b for _, b in p) / len(p))


def _prisma(nombre, poli, z0, z1, material, col):
    """Extruye un contorno cerrado del plano entre dos alturas."""
    me = bpy.data.meshes.new(nombre); o = bpy.data.objects.new(nombre, me); col.objects.link(o)
    bm = bmesh.new()
    pts = []
    for q in poli:                                   # sin vértices repetidos: el aplanado del DWG los trae
        if not pts or math.dist(q, pts[-1]) > 1e-3: pts.append(q)
    if len(pts) > 2 and math.dist(pts[0], pts[-1]) <= 1e-3: pts.pop()
    if len(pts) < 3: bm.free(); bpy.data.objects.remove(o); return None
    # Triangulación explícita (ear clipping de Blender) + paredes a mano: una sola n-gono cóncava de 40
    # vértices hacía que Cycles/Metal abortara (SIGABRT) al construir el BVH.
    from mathutils.geometry import tessellate_polygon
    abajo = [bm.verts.new((x, z, z0)) for x, z in pts]
    arriba = [bm.verts.new((x, z, z1)) for x, z in pts]
    for a, b, c in tessellate_polygon([[(x, z, 0.0) for x, z in pts]]):
        for tri in ((abajo[c], abajo[b], abajo[a]), (arriba[a], arriba[b], arriba[c])):
            try: bm.faces.new(tri)
            except ValueError: pass
    n = len(pts)
    for k in range(n):
        try: bm.faces.new((abajo[k], abajo[(k + 1) % n], arriba[(k + 1) % n], arriba[k]))
        except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.dissolve_degenerate(bm, dist=1e-4, edges=bm.edges)
    bm.to_mesh(me); bm.free(); me.materials.append(material)
    suavizar_curvas(me)
    return o


def suavizar_curvas(me, angulo=25):
    """Las curvas del plano llegan como polilíneas (48 caras en una pantalla): sombreadas planas se leen como
    PANELES. Sombreado suave, pero toda arista de más de 25° queda viva (esquinas, cantos, remates)."""
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(angulo))


def pilotis(poligonos, altura, material, col, radio=0.14):
    """Los pilotis vienen como cuadritos (a veces duplicados): se agrupan y se vuelven cilindros."""
    centros = []
    for p in poligonos:
        c = _centro(p)
        if all(math.dist(c, q) > 0.35 for q in centros): centros.append(c)
    for n, (x, z) in enumerate(centros):
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radio, depth=altura, location=(x, z, altura / 2))
        o = bpy.context.object; o.name = f"piloti_{n}"
        for c in o.users_collection: c.objects.unlink(o)
        col.objects.link(o); o.data.materials.append(material); bpy.ops.object.shade_smooth()
    return centros


def vidrio_herradura(altura, material, col, grosor=0.05):
    """El vidrio curvo del vestíbulo: el arco más largo de la capa 2 (vidrio) del nivel 0."""
    lineas = _cargar("dwg-muros.json")["niveles"]["nivel0"]
    arcos = [s for s in lineas if s["tipo"] == "ARC" and s["capa"] == "2"]
    if not arcos: return None
    arco = max(arcos, key=lambda s: sum(math.dist(a, b) for a, b in zip(s["pts"], s["pts"][1:])))
    me = bpy.data.meshes.new("herradura_vidrio"); o = bpy.data.objects.new(me.name, me); col.objects.link(o)
    bm = bmesh.new(); prev = None
    for x, z in arco["pts"]:
        par = (bm.verts.new((x, z, 0.0)), bm.verts.new((x, z, altura)))
        if prev: bm.faces.new((prev[0], par[0], par[1], prev[1]))
        prev = par
    bm.to_mesh(me); bm.free()
    o.modifiers.new("grosor", "SOLIDIFY").thickness = grosor
    me.materials.append(material)
    _montantes(arco["pts"], altura, col)
    return o


def _montantes(pts, altura, col, paso=0.42, ancho=0.05, fondo=0.09):
    """Montantes verticales oscuros cada ~0,42 m a lo largo del vidrio curvo (fotos S9: "apretados")."""
    m = bpy.data.materials.get("pb_montante") or bpy.data.materials.new("pb_montante")
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (0.03, 0.045, 0.035, 1); b.inputs["Roughness"].default_value = 0.4
    b.inputs["Metallic"].default_value = 0.5
    largo = [0.0]
    for a, c in zip(pts, pts[1:]): largo.append(largo[-1] + math.dist(a, c))
    n = int(largo[-1] / paso)
    me = bpy.data.meshes.new("pb_montantes"); bm = bmesh.new()      # UNA pieza: 100 objetos sueltos tumbaban Metal
    for k in range(n + 1):
        d = min(largo[-1] * k / n, largo[-1] - 1e-6)
        i = max(j for j in range(len(largo) - 1) if largo[j] <= d)
        t = (d - largo[i]) / max(largo[i + 1] - largo[i], 1e-6)
        x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t; z = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t
        ang = math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0])
        r = bmesh.ops.create_cube(bm, size=1.0)
        ca, sa = math.cos(ang), math.sin(ang)
        for v in r["verts"]:
            vx, vy, vz = v.co.x * ancho, v.co.y * fondo, v.co.z * altura
            v.co = (x + vx * ca - vy * sa, z + vx * sa + vy * ca, altura / 2 + vz)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("pb_montantes", me); col.objects.link(o); me.materials.append(m)


def planta_baja(altura_muros, altura_pilotis, m_muro, m_piloti, m_vidrio, col):
    polis = _cargar("dwg-muros-solidos.json")["niveles"]["nivel0"]
    chicos = [p for p in polis if _area(p) < 0.12]
    muros = [p for p in polis if _area(p) >= 0.12 and not villa_circulacion.es_muro_de_rampa(*_bbox(p))]
    for n, p in enumerate(muros):
        _prisma(f"pb_muro_{n}", p, 0.0, altura_muros, m_muro, col)
    centros = pilotis(chicos, altura_pilotis, m_piloti, col)
    vidrio_herradura(altura_muros, m_vidrio, col)
    print(f"[villa_obra] planta baja: {len(muros)} muros · {len(centros)} pilotis · vidrio de la herradura")


def _dentro(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        x1, y1 = poly[i]; x2, y2 = poly[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1: c = not c
    return c


def tabiques_de_lineas(nivel, W, D, solidos, margen_fachada=0.4, sep=(0.10, 0.30)):
    """Los tabiques livianos del DWG vienen como PARES de líneas paralelas (capa 1) sin relleno.
    Cada par ortogonal separado 4–30 cm y solapado >20 cm es un muro. Se descartan los de la franja de
    fachada (esa se construye aparte) y los que ya vienen rellenos (duplicarlos = caras coplanares = negro)."""
    segs = []
    for s in _cargar("dwg-muros.json")["niveles"][nivel]:
        if s["tipo"] == "ARC": continue
        for a, b in zip(s["pts"], s["pts"][1:]):
            if abs(a[1] - b[1]) < 0.01 and abs(a[0] - b[0]) > 0.2: segs.append(("h", a[1], min(a[0], b[0]), max(a[0], b[0])))
            elif abs(a[0] - b[0]) < 0.01 and abs(a[1] - b[1]) > 0.2: segs.append(("v", a[0], min(a[1], b[1]), max(a[1], b[1])))
    muros = []
    for i, s1 in enumerate(segs):
        for s2 in segs[i + 1:]:
            if s1[0] != s2[0] or not (sep[0] <= abs(s1[1] - s2[1]) <= sep[1]): continue
            lo, hi = max(s1[2], s2[2]), min(s1[3], s2[3])
            if hi - lo < 0.2: continue
            c0, c1 = sorted((s1[1], s2[1]))
            rect = (lo, hi, c0, c1) if s1[0] == "h" else (c0, c1, lo, hi)     # (x0, x1, z0, z1)
            cx, cz = (rect[0] + rect[1]) / 2, (rect[2] + rect[3]) / 2
            if abs(cx) > W / 2 - margen_fachada or abs(cz) > D / 2 - margen_fachada: continue
            if any(_dentro((cx, cz), p) for p in solidos): continue
            if any(abs(r[0] - rect[0]) < 0.02 and abs(r[1] - rect[1]) < 0.02 and abs(r[2] - rect[2]) < 0.02 and abs(r[3] - rect[3]) < 0.02 for r in muros): continue
            muros.append(rect)
    return muros


def nivel_principal(z0, z1, W, D, m_muro, col, m_vidrio=None):
    solidos = [p for p in _cargar("dwg-muros-solidos.json")["niveles"]["nivel1"] if _area(p) >= 0.05]
    # Fuera solo las piezas que viven ENTERAS en la franja de fachada (esquineros): los tabiques que
    # llegan hasta la fachada SÍ van (el 28-sep se perdieron todos los de los dormitorios por filtrar de más).
    en_franja = lambda x, z: abs(x) > W / 2 - 0.3 or abs(z) > D / 2 - 0.3
    interiores = [p for p in solidos if not all(en_franja(x, z) for x, z in p)]
    for n, p in enumerate(interiores):
        _prisma(f"n1_muro_{n}", p, z0, z1, m_muro, col)
    rects = [r for r in tabiques_de_lineas("nivel1", W, D, solidos) if not villa_circulacion.es_muro_de_rampa(*r)]
    for n, (x0, x1, a, b) in enumerate(rects):
        _prisma(f"n1_tabique_{n}", [(x0, a), (x1, a), (x1, b), (x0, b)], z0, z1, m_muro, col)
    vidrios = tabiques_de_lineas("nivel1", W, D, solidos, sep=(0.03, 0.08))
    for n, (x0, x1, a, b) in enumerate(vidrios):
        _prisma(f"n1_vidrio_{n}", [(x0, a), (x1, a), (x1, b), (x0, b)], z0, z1, m_vidrio or m_muro, col)
    print(f"[villa_obra] nivel principal: {len(interiores)} muros rellenos · {len(rects)} tabiques · {len(vidrios)} vidrios")
    return interiores, rects


# ── cubierta (fase 2, 28-sep) ─────────────────────────────────────────────
# Hueco entre las dos pantallas del solárium, sobre el eje de la rampa: la "ventana" que enmarca el paisaje
# al final del recorrido. En el DWG es un vacío de 1,75 m entre las piezas 0 y 1 del nivel 2. Antepecho 1,00
# y dintel 2,03 sobre la cubierta: medidos en la fachada 1 del DWG (28-sep).
VENTANA_SOLARIUM = (-1.39, 0.36, 8.25, 8.40)
# La llegada de la escalera caracol a la cubierta: una caja TECHADA (corte A-A del DWG: losa de 9,10 a 9,30),
# más baja que las pantallas (9,40). Planta = la U de la pieza 2 del nivel 2, con su remate redondo.
CAJA_ESCALERA = (-6.05, -2.25, 0.65, 2.45)
ALTO_ESCALERA, E_TECHO_ESCALERA = 2.64, 0.20


def _envolvente(pts):
    """Envolvente convexa (monotone chain): el techo de la caja de escalera sigue su remate curvo."""
    pts = sorted(set((round(x, 4), round(z, 4)) for x, z in pts))
    giro = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    def media(seq):
        h = []
        for p in seq:
            while len(h) >= 2 and giro(h[-2], h[-1], p) <= 0: h.pop()
            h.append(p)
        return h
    abajo, arriba = media(pts), media(reversed(pts))
    return abajo[:-1] + arriba[:-1]


def rects_con_huecos(x0, x1, z0, z1, huecos):
    """Un rectángulo menos otros rectángulos, en franjas verticales: paneles de losa sin caras solapadas."""
    xs = sorted({x0, x1, *[v for h in huecos for v in h[:2] if x0 < v < x1]})
    out = []
    for a, b in zip(xs, xs[1:]):
        cortes = sorted((h[2], h[3]) for h in huecos if h[0] <= a and h[1] >= b)
        cur = z0
        for c0, c1 in cortes:
            if c0 > cur: out.append((a, b, cur, min(c0, z1)))
            cur = max(cur, c1)
        if cur < z1: out.append((a, b, cur, z1))
    return [r for r in out if r[1] - r[0] > 0.01 and r[3] - r[2] > 0.01]


def cubierta(z_piso, alto_pantalla, alto_antepecho, m_muro, col):
    """Pantallas del solárium, caja de la escalera y muros de la rampa: contornos del nivel 2 del DWG.
    Fuera: el contorno de fachada (3, 4: ya son los antepechos), la unión duplicada de las pantallas (5),
    el poste suelto (7) y la pieza 6, que es la mesa fija de la TERRAZA vista desde arriba, no cubierta."""
    polis, vistos = [], []
    for p in _cargar("dwg-muros-solidos.json")["niveles"]["nivel2"]:
        a = _area(p); per = sum(math.dist(p[i], p[i - 1]) for i in range(len(p)))
        c = _centro(p)                                   # duplicado = mismo centro y misma área (con tolerancia:
        repetido = any(math.dist(c, v[0]) < 0.25 and abs(a - v[1]) < 0.1 for v in vistos)   # redondear no basta)
        if repetido or a < 0.3 or 2 * a / per > 0.2: continue                # duplicados, postes, rellenos gruesos
        vistos.append((c, a)); polis.append(p)
    caja = lambda p: (min(x for x, _ in p), max(x for x, _ in p), min(z for _, z in p), max(z for _, z in p))
    union = lambda p: sum(1 for q in polis if q is not p and caja(p)[0] <= _centro(q)[0] <= caja(p)[1]
                          and caja(p)[2] <= _centro(q)[1] <= caja(p)[3]) >= 2
    muros = [p for p in polis if not union(p)]
    ex0, ex1, ez0, ez1 = CAJA_ESCALERA
    for n, p in enumerate(muros):
        rampa = caja(p)[0] > -1.5 and caja(p)[1] < 1.5
        escalera = ex0 <= _centro(p)[0] <= ex1 and ez0 <= _centro(p)[1] <= ez1
        # la caja de escalera: muros hasta DEBAJO de su losa (tapas coplanares = negro en Cycles)
        alto = alto_antepecho if rampa else ALTO_ESCALERA - E_TECHO_ESCALERA if escalera else alto_pantalla
        tipo = "rampa" if rampa else "escalera" if escalera else "pantalla"
        _prisma(f"cub_{tipo}_{n}", p, z_piso, z_piso + alto, m_muro, col)
        if escalera:
            dentro = [q for q in p if ex0 - 0.01 <= q[0] <= ex1 + 0.01 and ez0 - 0.01 <= q[1] <= ez1 + 0.01]
            env = _envolvente(dentro); cx, cz = _centro(env)                # vuelo de 3 cm: sin caras coplanares
            env = [(x + 0.03 * (x - cx) / max(math.dist((x, z), (cx, cz)), 1e-6),
                    z + 0.03 * (z - cz) / max(math.dist((x, z), (cx, cz)), 1e-6)) for x, z in env]
            _prisma("cub_escalera_techo", env, z_piso + ALTO_ESCALERA - E_TECHO_ESCALERA,
                    z_piso + ALTO_ESCALERA, m_muro, col)
    x0, x1, a, b = VENTANA_SOLARIUM
    _prisma("cub_ventana_antepecho", [(x0, a), (x1, a), (x1, b), (x0, b)], z_piso, z_piso + 1.00, m_muro, col)
    _prisma("cub_ventana_dintel", [(x0, a), (x1, a), (x1, b), (x0, b)], z_piso + 2.03, z_piso + alto_pantalla, m_muro, col)
    print(f"[villa_obra] cubierta: {len(muros)} muros (pantallas + rampa) · ventana del solárium")
