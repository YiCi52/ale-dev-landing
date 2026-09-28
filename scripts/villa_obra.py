"""
Obra gris de la Villa desde el plano (fase 2 del PLAN-OBRA, 28-sep-2026).

Lee los contornos EXACTOS de muros y pilotis del DWG (rellenos SOLID de la capa 7, ya en metros:
expediente/dwg-muros-solidos.json) y los levanta. Nada se mide a ojo: si un muro está mal, se
corrige el plano o el JSON, no este archivo.

Ejes del JSON: x (izq −, der +), z (lado 2 / fondo −, lado 1 / acceso +). Blender: (X, Y, Z) = (x, z, altura).
"""
import bpy, bmesh, json, math, os

EXP = os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente")


def _cargar(nombre):
    with open(os.path.join(EXP, nombre), encoding="utf-8") as f:
        return json.load(f)


def _area(p):
    return abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2


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
    vs = [bm.verts.new((x, z, z0)) for x, z in pts]
    cara = bm.faces.new(vs)
    bmesh.ops.recalc_face_normals(bm, faces=[cara])
    if cara.normal.z < 0: cara.normal_flip()
    ext = bmesh.ops.extrude_face_region(bm, geom=[cara])
    bmesh.ops.translate(bm, vec=(0, 0, z1 - z0), verts=[v for v in ext["geom"] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); me.materials.append(material)
    return o


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
    muros = [p for p in polis if _area(p) >= 0.12]
    for n, p in enumerate(muros):
        _prisma(f"pb_muro_{n}", p, 0.0, altura_muros, m_muro, col)
    centros = pilotis(chicos, altura_pilotis, m_piloti, col)
    vidrio_herradura(altura_muros, m_vidrio, col)
    print(f"[villa_obra] planta baja: {len(muros)} muros · {len(centros)} pilotis · vidrio de la herradura")
