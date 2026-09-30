"""
Obra gris de la Villa desde el plano (fase 2 del PLAN-OBRA, 28-sep-2026).

Lee los contornos EXACTOS de muros y pilotis del DWG (rellenos SOLID de la capa 7, ya en metros:
expediente/dwg-muros-solidos.json) y los levanta. Nada se mide a ojo: si un muro está mal, se
corrige el plano o el JSON, no este archivo.

Ejes del JSON: x (izq −, der +), z (lado 2 / fondo −, lado 1 / acceso +). Blender: (X, Y, Z) = (x, z, altura).
"""
import bpy, bmesh, json, math, os, mathutils
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


def vidrio_herradura(altura, material, col, grosor=0.012):   # 12 mm (antes 5 cm: lupa)
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
    # #57 (30-sep): por DENTRO los montantes son claros [e47, i04]; por fuera, oscuros [e05, e45, e52]. La cara que
    # mira al vestíbulo (hacia el centro de la cuerda de la herradura) y sus cantos van en blanco.
    claro = bpy.data.materials.get("m_montante_int") or bpy.data.materials.new("m_montante_int"); claro.use_nodes = True
    bc = next(n for n in claro.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bc.inputs["Base Color"].default_value = (0.80, 0.80, 0.78, 1); bc.inputs["Roughness"].default_value = 0.45
    me.materials.append(claro)
    cx, cy = (pts[0][0] + pts[-1][0]) / 2, (pts[0][1] + pts[-1][1]) / 2 + 2.0
    for p_ in me.polygons:
        hacia = mathutils.Vector((cx - p_.center.x, cy - p_.center.y, 0.0))
        if hacia.length > 0 and p_.normal.dot(hacia.normalized()) > -0.5: p_.material_index = 1


def planta_baja(altura_muros, altura_pilotis, m_muro, m_piloti, m_vidrio, col):
    polis = _cargar("dwg-muros-solidos.json")["niveles"]["nivel0"]
    chicos = [p for p in polis if _area(p) < 0.12]
    muros = [p for p in polis if _area(p) >= 0.12 and not villa_circulacion.es_muro_de_rampa(*_bbox(p))
             and not villa_circulacion.es_de_escalera(*_bbox(p))]     # la escalera es exenta: sus antepechos van aparte
    for n, p in enumerate(muros):
        _prisma(f"pb_muro_{n}", p, 0.0, altura_muros, m_muro, col)
    centros = pilotis(chicos, altura_pilotis, m_piloti, col)
    PILOTIS_CENTROS[:] = centros
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


PILOTIS_CENTROS = []                               # los llena planta_baja; el nivel principal los prolonga
MURO_TERRAZA = -4.60                 # cara del muro del lado kiosque/boudoir (chequeo 30-sep)
TERRAZA = (1.40, 9.5, -4.62, 4.78)                 # x0, x1, z0, z1 del jardín suspendido
# La vidriera del salón SÍ está en el DWG (nivel 1, capa 2): la franja entre z 4,65 y 4,75 (hallazgo #16). Antes iba
# en 4,78 y atravesaba por la mitad las columnas del eje 4,75: media columna quedaba afuera, en la terraza (lo vio
# Alejandro, 30-sep). En S9 13 y S9 23 las columnas están ENTERAS adentro y el vidrio pasa por fuera, pegado.
VIDRIERA_Z = 4.70
# La tapa cubre TODO el conjunto (z −4,60…−2,40): en las fotos de Archweb (S9, 19/20/29/30) la mesa de la terraza
# es un tablero delgado de hormigón sobre apoyos de lámina, no un cajón. Los pares de líneas son esos apoyos.
MESA_Z0, MESA_Z1, H_MESA, E_MESA = -4.60, -2.40, 0.72, 0.06
H_JARDINERA = 0.45                                  # alto leído de S9 13/17 (interpretación ±10 cm)


def columnas_nivel(z0, z1, W, D, muros, rects, material, col, radio=0.14):
    """Los pilotis SIGUEN hacia arriba: las fotos del salón (S8, 29/30) muestran columnas redondas exentas a
    1,25 m de la ventana. El plano del nivel 1 no las dibuja. Se prolongan los de la planta baja salvo donde
    quedan dentro de un muro, de la fachada, del pozo de la rampa o de la escalera."""
    cajas = [_bbox(p) for p in muros] + [tuple(r) for r in rects]
    hechas = 0
    for x, z in PILOTIS_CENTROS:
        if abs(x) > W / 2 - 0.35 or abs(z) > D / 2 - 0.35: continue
        if -1.5 < x < 1.5 and -7.4 < z < 2.8: continue            # pozo de la rampa
        # a cielo abierto no hay nada que sostener: el piloti del centro de la terraza termina en su piso
        # (Alejandro, 28-sep: "no sostiene nada"). Los del borde, bajo la losa, sí siguen.
        if TERRAZA[0] + 0.2 < x < 9.3 and TERRAZA[2] + 0.2 < z < TERRAZA[3] - 0.2: continue
        if villa_circulacion.es_de_escalera(x - 0.1, x + 0.1, z - 0.1, z + 0.1): continue
        if any(b[0] - 0.2 < x < b[1] + 0.2 and b[2] - 0.2 < z < b[3] + 0.2 for b in cajas): continue
        if TERRAZA[0] - 0.3 < x < 9.3 and abs(z - VIDRIERA_Z) < radio + 0.06:
            z = VIDRIERA_Z + 0.05 + radio + 0.005             # del lado del salón, tangente al marco (INTERPRETACIÓN de foto)
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radio, depth=z1 - z0, location=(x, z, (z0 + z1) / 2))
        o = bpy.context.object; o.name = f"n1_columna_{hechas}"
        for c in o.users_collection: c.objects.unlink(o)
        col.objects.link(o); o.data.materials.append(material); bpy.ops.object.shade_smooth(); hechas += 1
    print(f"[villa_obra] nivel principal: {hechas} columnas (pilotis prolongados)")
    return hechas


def ventana_terraza(z0, m_vidrio, col, x=(2.80, 3.70), alto=(1.05, 1.85), y=(-4.80, -4.55)):
    """#19 (30-sep): ventana cuadrada OSCURA en el muro de la terraza del lado del boudoir, sobre la mitad izquierda
    de la jardinera en U [e11, e15, e18, e27, e35, e37]. Tamaño y posición = lectura de foto (INTERPRETACIÓN ±0,15 m)."""
    hueco = _prisma("tmp_hueco_ventana", [(x[0], y[0]), (x[1], y[0]), (x[1], y[1]), (x[0], y[1])],
                    z0 + alto[0], z0 + alto[1], m_vidrio, col)
    lo, hi = mathutils.Vector((x[0], y[0], z0 + alto[0])), mathutils.Vector((x[1], y[1], z0 + alto[1]))
    for o in [o for o in col.objects if o.name.startswith(("n1_muro", "n1_tabique")) and o.type == "MESH"]:
        bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        if all(min(v[i] for v in bb) < hi[i] and max(v[i] for v in bb) > lo[i] for i in range(3)):
            bpy.context.view_layer.objects.active = o
            md = o.modifiers.new("ventana", "BOOLEAN"); md.operation = "DIFFERENCE"; md.solver = "EXACT"; md.object = hueco
            bpy.ops.object.modifier_apply(modifier=md.name)
    bpy.data.objects.remove(hueco, do_unlink=True)
    yc = -4.675
    _prisma("n1_ventana_terraza_vidrio", [(x[0], yc - 0.006), (x[1], yc - 0.006), (x[1], yc + 0.006), (x[0], yc + 0.006)],
            z0 + alto[0], z0 + alto[1], m_vidrio, col)
    m = bpy.data.materials.get("pb_montante")
    for n, (a0, a1, h0, h1) in enumerate([(x[0], x[1], alto[0], alto[0] + 0.04), (x[0], x[1], alto[1] - 0.04, alto[1]),
                                           (x[0], x[0] + 0.04, alto[0], alto[1]), (x[1] - 0.04, x[1], alto[0], alto[1])]):
        _prisma(f"n1_ventana_terraza_marco_{n}", [(a0, yc - 0.03), (a1, yc - 0.03), (a1, yc + 0.03), (a0, yc + 0.03)],
                z0 + h0, z0 + h1, m, col)


def machon_terraza(z0, z1, m_muro, col, puerta=(3.70, 4.35), h_puerta=2.10):
    """#23 (30-sep): entre el fin del muro del pozo (z 2,65, DWG) y la vidriera (4,65) el modelo dejaba un hueco de
    piso a techo y desde la terraza se veía el hall. En S9 23, e16 y e25 es un MACHÓN blanco macizo, en el plano del
    muro del pozo, con una puerta angosta OSCURA del lado de la vidriera. El DWG (corte a 1 m) no dibuja nada ahí.
    Ancho y posición de la puerta = lectura de foto (INTERPRETACIÓN, ±0,15 m)."""
    x0, x1, a, b = 1.25, 1.40, 2.65, VIDRIERA_Z - 0.05
    p0, p1 = puerta
    piezas = [_prisma("n1_machon_0", [(x0, a), (x1, a), (x1, p0), (x0, p0)], z0, z1, m_muro, col),
              _prisma("n1_machon_1", [(x0, p1), (x1, p1), (x1, b), (x0, b)], z0, z1, m_muro, col),
              _prisma("n1_machon_2", [(x0, p0 - 0.01), (x1, p0 - 0.01), (x1, p1 + 0.01), (x0, p1 + 0.01)],
                      z0 + h_puerta, z1, m_muro, col)]
    unir(piezas)
    oscuro = bpy.data.materials.get("m_puerta_exterior") or bpy.data.materials.new("m_puerta_exterior")
    oscuro.use_nodes = True
    bsdf = next(n for n in oscuro.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (0.025, 0.025, 0.028, 1); bsdf.inputs["Roughness"].default_value = 0.45
    _prisma("n1_machon_puerta", [(x1 - 0.045, p0), (x1 - 0.005, p0), (x1 - 0.005, p1), (x1 - 0.045, p1)],
            z0 + 0.01, z0 + h_puerta - 0.004, oscuro, col)


def vidriera_terraza(z0, z1, m_vidrio, col, paneles=4):
    """La vidriera corrediza del salón a la terraza: 9 × 3 m [S5][S6], piso a cielo raso, en la franja que dibuja el
    DWG (z 4,65…4,75, ver VIDRIERA_Z). El DWG la arranca en x 0,07; aquí sigue en 1,40 hasta resolver #16."""
    x0, x1 = TERRAZA[0], 9.30; z = VIDRIERA_Z
    _prisma("n1_vidriera_terraza", [(x0, z - 0.015), (x1, z - 0.015), (x1, z + 0.015), (x0, z + 0.015)],
            z0, z1, m_vidrio, col)
    m = bpy.data.materials.get("pb_montante")                 # el mismo acero oscuro de los montantes del vestíbulo
    # #49 (30-sep): barra horizontal NEGRA a ~0,95 m cruzando la vidriera por dentro [e13, e14, e30, i56, i57, i59]
    _prisma("n1_vidriera_barra", [(x0, z + 0.05), (x1, z + 0.05), (x1, z + 0.075), (x0, z + 0.075)],
            z0 + 0.93, z0 + 0.98, m, col)
    me = bpy.data.meshes.new("n1_vidriera_marcos"); bm = bmesh.new()
    def barra(a, b, c, d, h0, h1):
        r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r["verts"]:
            v.co = ((a + b) / 2 + v.co.x * (b - a), (c + d) / 2 + v.co.y * (d - c), (h0 + h1) / 2 + v.co.z * (h1 - h0))
    paso = (x1 - x0) / paneles
    for k in range(paneles + 1):                               # montantes
        x = x0 + k * paso; barra(x - 0.035, x + 0.035, z - 0.05, z + 0.05, z0, z1)
    barra(x0, x1, z - 0.05, z + 0.05, z0, z0 + 0.08)            # riel de abajo
    barra(x0, x1, z - 0.05, z + 0.05, z1 - 0.10, z1)            # riel de arriba
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(me.name, me); col.objects.link(o)
    if m: me.materials.append(m)


def unir(objs):
    """Funde varias piezas en la primera (booleana UNIÓN) y borra las demás: sin caras coplanares ni juntas."""
    objs = [o for o in objs if o]
    if len(objs) < 2: return objs[0] if objs else None
    base = objs[0]; bpy.context.view_layer.objects.active = base
    for o in objs[1:]:
        m = base.modifiers.new("union", "BOOLEAN"); m.operation = "UNION"; m.solver = "EXACT"; m.object = o
        bpy.ops.object.modifier_apply(modifier=m.name); bpy.data.objects.remove(o, do_unlink=True)
    return base


def _solape(r, q):
    """Fracción del rectángulo MÁS CHICO que queda dentro del otro."""
    ax = max(0.0, min(r[1], q[1]) - max(r[0], q[0])); az = max(0.0, min(r[3], q[3]) - max(r[2], q[2]))
    menor = min((r[1] - r[0]) * (r[3] - r[2]), (q[1] - q[0]) * (q[3] - q[2]))
    return ax * az / menor if menor > 0 else 0.0


def _sin_solapes(rects, previos=()):
    """Los pares de líneas del DWG se detectan dos veces (líneas triples, capas repetidas): cuerpos metidos uno
    en otro = caras coplanares = manchas negras y bordes dentados en el render. Se queda el primero."""
    fuera = []
    for r in rects:
        if all(_solape(r, q) < 0.3 for q in [*previos, *fuera]): fuera.append(r)
    return fuera


def nivel_principal(z0, z1, W, D, m_muro, col, m_vidrio=None):
    solidos = [p for p in _cargar("dwg-muros-solidos.json")["niveles"]["nivel1"] if _area(p) >= 0.05]
    # Fuera solo las piezas que viven ENTERAS en la franja de fachada (esquineros): los tabiques que
    # llegan hasta la fachada SÍ van (el 28-sep se perdieron todos los de los dormitorios por filtrar de más).
    en_franja = lambda x, z: abs(x) > W / 2 - 0.3 or abs(z) > D / 2 - 0.3
    interiores = [p for p in solidos if not all(en_franja(x, z) for x, z in p)
                  and not villa_circulacion.es_de_escalera(*_bbox(p))]
    for n, p in enumerate(interiores):
        _prisma(f"n1_muro_{n}", p, z0, z1, m_muro, col)
    rects = _sin_solapes([r for r in tabiques_de_lineas("nivel1", W, D, solidos) if not villa_circulacion.es_muro_de_rampa(*r)])
    # En la TERRAZA los pares de líneas no son muros: son una JARDINERA en U junto al muro del boudoir (fotos S9 13,
    # 17, 19: cajones blancos bajos con arbustos). El 28-sep se había leído como la mesa fija (error: la mesa real es
    # un tablero delgado sobre patas, ver villa_detalle.mesa_terraza). Las piezas se FUNDEN en una sola: prolongadas
    # y sueltas dejaban esquinas vacías o caras coplanares (rayas negras).
    mesa = [r for r in rects if r[0] >= TERRAZA[0] and r[2] >= TERRAZA[2] and r[3] <= MESA_Z1 + 0.05]
    rects = [r for r in rects if r not in mesa]
    piezas = []
    for n, (x0, x1, a, b) in enumerate(mesa):
        if x1 - x0 > b - a: x0, x1 = max(x0 - 0.15, TERRAZA[0]), x1 + 0.15
        else: a, b = a - 0.15, min(b + 0.15, MESA_Z1)
        a = max(a, MURO_TERRAZA)                                  # hasta la cara del muro, no adentro de él
        piezas.append(_prisma(f"n1_jardinera_{n}", [(x0, a), (x1, a), (x1, b), (x0, b)], z0 - 0.01, z0 + H_JARDINERA, m_muro, col))
    unir(piezas)
    for n, (x0, x1, a, b) in enumerate(rects):
        _prisma(f"n1_tabique_{n}", [(x0, a), (x1, a), (x1, b), (x0, b)], z0, z1, m_muro, col)
    vidrios = _sin_solapes(tabiques_de_lineas("nivel1", W, D, solidos, sep=(0.03, 0.08)), previos=rects)
    for n, (x0, x1, a, b) in enumerate(vidrios):
        _prisma(f"n1_vidrio_{n}", [(x0, a), (x1, a), (x1, b), (x0, b)], z0, z1, m_vidrio or m_muro, col)
    if m_vidrio: vidriera_terraza(z0, z1, m_vidrio, col)
    machon_terraza(z0, z1, m_muro, col)
    ventana_terraza(z0, m_vidrio, col)
    columnas = columnas_nivel(z0, z1, W, D, interiores, rects, m_muro, col)
    # Tabique del BAÑO n.º 14 (compartido hijo/huéspedes): la planta oficial del CMN lo dibuja entre el cuarto del
    # hijo y el baño; el DWG no. Puerta hacia el cuarto del hijo junto al pasillo: posición = interpretación.
    for n, (a0, a1) in enumerate([(-9.30, -7.05), (-6.25, -6.05)]):
        _prisma(f"n1_tabique_bano14_{n}", [(a0, -4.75), (a1, -4.75), (a1, -4.62), (a0, -4.62)], z0, z1, m_muro, col)
    _prisma("n1_tabique_bano14_dintel", [(-7.05, -4.75), (-6.25, -4.75), (-6.25, -4.62), (-7.05, -4.62)], z0 + 2.10, z1, m_muro, col)
    print(f"[villa_obra] nivel principal: {len(interiores)} muros rellenos · {len(rects)} tabiques · {len(vidrios)} vidrios · jardinera en U ({len(mesa)} piezas fundidas)")
    return interiores, rects


# ── cubierta (fase 2, 28-sep) ─────────────────────────────────────────────
# Hueco entre las dos pantallas del solárium, sobre el eje de la rampa: la "ventana" que enmarca el paisaje
# al final del recorrido. En el DWG es un vacío de 1,75 m entre las piezas 0 y 1 del nivel 2. Antepecho 1,00
# y dintel 2,03 sobre la cubierta: medidos en la fachada 1 del DWG (28-sep).
VENTANA_SOLARIUM = (-1.39, 0.36, 8.25, 8.40)
# La llegada de la escalera caracol a la cubierta: una caja TECHADA (corte A-A del DWG: losa de 9,10 a 9,30),
# más baja que las pantallas (9,40). Planta = la U de la pieza 2 del nivel 2, con su remate redondo.
CAJA_ESCALERA = (-6.05, -2.25, 0.65, 2.45)
CHIMENEA, ALTO_CHIMENEA = (3.69, 3.98, 9.36, 9.62), 3.65     # #14 (30-sep): ~0,9 m sobre las pantallas, medido en e28 (±0,2) y visto en e16, e25, e38
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
    pantalla_continua(col, z_piso, alto_pantalla, 1.00, 2.03)
    banca_solarium(z_piso, m_muro, col)
    # La chimenea: la pieza 7 del nivel 2 (0,29 × 0,26) que el filtro de área descartaba como "poste". La foto 27
    # de Archweb (S9) la muestra junto a las pantallas, un poco más alta que ellas: altura = interpretación.
    cx0, cx1, cz0, cz1 = CHIMENEA
    _prisma("cub_chimenea", [(cx0, cz0), (cx1, cz0), (cx1, cz1), (cx0, cz1)], z_piso, z_piso + ALTO_CHIMENEA, m_muro, col)
    print(f"[villa_obra] cubierta: {len(muros)} muros (pantallas + rampa) · ventana del solárium · chimenea")


def banca_solarium(z_piso, m_muro, col, alto=0.45, fondo=0.70, grueso=0.08):
    """#15 (30-sep): banca de losa blanca delante de la ventana del solárium, apoyada en la pantalla y con dos
    patas delgadas al frente [e10, e39]. Largo = la ventana + 5 cm por lado; alto y fondo = lectura de foto."""
    x0, x1, a, b = VENTANA_SOLARIUM
    x0, x1 = x0 - 0.05, x1 + 0.05
    _prisma("cub_banca_tapa", [(x0, a - fondo), (x1, a - fondo), (x1, a), (x0, a)], z_piso + alto - grueso, z_piso + alto,
            m_muro, col)
    for n, x in enumerate((x0 + 0.08, x1 - 0.08)):
        _prisma(f"cub_banca_pata_{n}", [(x - 0.025, a - fondo + 0.06), (x + 0.025, a - fondo + 0.06),
                                          (x + 0.025, a - fondo + 0.11), (x - 0.025, a - fondo + 0.11)],
                z_piso, z_piso + alto - grueso, m_muro, col)


def pantalla_continua(col, z_piso, alto, alto_antepecho, alto_dintel):
    """Las dos pantallas del solárium + el paño de la ventana: UN muro. Como piezas sueltas, el bisel dibujaba
    juntas que no existen (lo vio Alejandro en el rincón). Unión booleana y la ventana recortada después.
    Antepecho 1,00 y dintel 2,03 sobre la cubierta: medidos en la fachada 1 del DWG."""
    piezas = [o for o in col.objects if o.name.startswith("cub_pantalla")]
    if not piezas: return
    x0, x1, a, b = VENTANA_SOLARIUM
    base = piezas[0]
    pano = _prisma("cub_pano", [(x0 - 0.002, a), (x1 + 0.002, a), (x1 + 0.002, b), (x0 - 0.002, b)],
                   z_piso, z_piso + alto, base.data.materials[0], col)
    bpy.context.view_layer.objects.active = base
    for o in piezas[1:] + [pano]:
        m = base.modifiers.new("union", "BOOLEAN"); m.operation = "UNION"; m.solver = "EXACT"; m.object = o
        bpy.ops.object.modifier_apply(modifier=m.name)
    hueco = _prisma("cub_hueco", [(x0, a - 0.3), (x1, a - 0.3), (x1, b + 0.3), (x0, b + 0.3)],
                    z_piso + alto_antepecho, z_piso + alto_dintel, base.data.materials[0], col)
    m = base.modifiers.new("ventana", "BOOLEAN"); m.operation = "DIFFERENCE"; m.solver = "EXACT"; m.object = hueco
    bpy.ops.object.modifier_apply(modifier=m.name)
    for o in piezas[1:] + [pano, hueco]: bpy.data.objects.remove(o, do_unlink=True)
    base.name = "cub_pantalla_solarium"; suavizar_curvas(base.data)
    print(f"[villa_obra] pantalla del solárium en una pieza, con su ventana ({len(base.data.polygons)} caras)")
