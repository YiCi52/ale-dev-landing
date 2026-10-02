"""
Luminarias reales de la Villa (fase 5, noche — 1-oct-2026).

Antes, de noche, la casa se encendía con bombillos genéricos flotando en el aire. Ahora cada luz sale de una
luminaria que se VE en las fotos de Archweb, con su cuerpo modelado y su propia fuente:
  · vestíbulo: bombillos desnudos en el cielo raso [i49] y colgantes [i13]
  · rampa: apliques tubulares en el muro del descanso y plafón [i09, i15]
  · salón: la canaleta lineal (ya modelada en villa_detalle; aquí su fuente) [i28–i30, i50]
  · cocina: aplique sobre la pileta [i24]
  · baño de los padres: aplique globo sobre el lavamanos [i26]
  · boudoir y dormitorios: aplique lineal sobre la puerta [i12, i51]
  · exterior: farol junto a la entrada [e45], postes-farol en la cubierta [e17, e34, e41], farol en la esquina
    del kiosque [e33]
Posición fina = lectura de foto (INTERPRETACIÓN ±0,3 m). Coordenadas de OBRA. Luz cálida 2700 K.
Recintos sin luminaria visible en las fotos (dormitorios del oeste): un plafón tenue marcado como interpretación,
para que la cinta no quede negra desde afuera.
"""
import bpy, math

CALIDA = (1.0, 0.72, 0.45)                    # ~2700 K
Y_LOSA, Y_TECHO, H_PB = 3.31, 6.45, 3.07


def _emisor(nombre, fuerza):
    m = bpy.data.materials.get(nombre)
    if m: return m
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*CALIDA, 1); b.inputs["Emission Color"].default_value = (*CALIDA, 1)
    b.inputs["Emission Strength"].default_value = fuerza; b.inputs["Roughness"].default_value = 0.3
    return m


def _mat(nombre, rgb, rough=0.4, metal=0.0):
    m = bpy.data.materials.get(nombre)
    if m: return m
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def _poner(o, col):
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o)
    return o


def _luz(nombre, tipo, loc, energia, col, radio=0.05, tam=None, rot=None):
    ld = bpy.data.lights.new(nombre, type=tipo); ld.energy = energia; ld.color = CALIDA
    if tipo == "POINT": ld.shadow_soft_size = radio
    if tipo == "AREA": ld.shape = "RECTANGLE"; ld.size, ld.size_y = tam
    o = bpy.data.objects.new(nombre, ld); col.objects.link(o); o.location = loc
    if rot: o.rotation_euler = rot
    return o


def _esfera(nombre, loc, r, mat, col, aplastar=1.0):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=r, location=loc)
    o = _poner(bpy.context.object, col); o.name = nombre; o.scale = (1, 1, aplastar); o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    return o


def _cilindro(nombre, a, b, r, mat, col):
    import mathutils
    va, vb = mathutils.Vector(a), mathutils.Vector(b); d = vb - va
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=r, depth=d.length, location=(va + vb) / 2)
    o = _poner(bpy.context.object, col); o.name = nombre
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler(); o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    return o


def bombillo_desnudo(nombre, x, y, techo, col, energia=160):
    """Portalámparas al ras del cielo y bombillo a la vista [i49]."""
    negro = _mat("m_portalampara", (0.03, 0.03, 0.03)); vidrio = _emisor("m_bombillo", 6.0)
    _cilindro(f"{nombre}_rosca", (x, y, techo), (x, y, techo - 0.07), 0.025, negro, col)
    _esfera(f"{nombre}_bulbo", (x, y, techo - 0.11), 0.04, vidrio, col)
    _luz(nombre, "POINT", (x, y, techo - 0.14), energia, col, 0.04)


def colgante(nombre, x, y, techo, col, caida=0.9, energia=140):
    """Colgante de globo opalino sobre cable [i13]."""
    negro = _mat("m_portalampara", (0.03, 0.03, 0.03)); opal = _emisor("m_opalino", 3.5)
    _cilindro(f"{nombre}_cable", (x, y, techo), (x, y, techo - caida), 0.004, negro, col)
    _esfera(f"{nombre}_globo", (x, y, techo - caida - 0.12), 0.13, opal, col)
    _luz(nombre, "POINT", (x, y, techo - caida - 0.12), energia, col, 0.12)


def aplique_tubo(nombre, base, eje, largo, col, energia=50):
    """Aplique tubular opalino sobre el muro [i09, i15]. base = centro, eje = dirección del tubo."""
    opal = _emisor("m_opalino", 3.5)
    a = tuple(base[i] - eje[i] * largo / 2 for i in range(3)); b = tuple(base[i] + eje[i] * largo / 2 for i in range(3))
    _cilindro(f"{nombre}_tubo", a, b, 0.035, opal, col)
    _luz(nombre, "POINT", base, energia, col, 0.10)


def aplique_globo(nombre, loc, sale, col, energia=40):
    """Globo opalino sobre brazo corto [i26]. sale = vector hacia afuera del muro."""
    cromo = _mat("m_cromo_lum", (0.8, 0.8, 0.78), 0.15, 1.0); opal = _emisor("m_opalino", 3.5)
    p = tuple(loc[i] + sale[i] * 0.16 for i in range(3))
    _cilindro(f"{nombre}_brazo", loc, p, 0.008, cromo, col)
    _esfera(f"{nombre}_globo", p, 0.10, opal, col)
    _luz(nombre, "POINT", p, energia, col, 0.09)


def aplique_lineal(nombre, a, b, sale, col, energia=35):
    """Regleta lineal opalina sobre la puerta [i12, i51]."""
    opal = _emisor("m_opalino", 3.5)
    a2 = tuple(a[i] + sale[i] * 0.03 for i in range(3)); b2 = tuple(b[i] + sale[i] * 0.03 for i in range(3))
    _cilindro(f"{nombre}_tubo", a2, b2, 0.022, opal, col)
    _luz(nombre, "POINT", tuple((a2[i] + b2[i]) / 2 + sale[i] * 0.05 for i in range(3)), energia, col, 0.15)


def poste_farol(nombre, x, y, piso, col, alto=0.85, energia=25):
    """Poste-farol bajo de la cubierta y del jardín [e17, e34, e41]: fuste negro y cabeza opalina."""
    negro = _mat("m_farol", (0.02, 0.02, 0.02), 0.5); opal = _emisor("m_opalino", 3.5)
    _cilindro(f"{nombre}_fuste", (x, y, piso), (x, y, piso + alto), 0.03, negro, col)
    _cilindro(f"{nombre}_cabeza", (x, y, piso + alto), (x, y, piso + alto + 0.22), 0.07, opal, col)
    _luz(nombre, "POINT", (x, y, piso + alto + 0.11), energia, col, 0.07)


def construir(col, noche):
    """Siempre se modelan los CUERPOS (se ven de día); las FUENTES y la emisión solo de noche."""
    if not noche:
        for nombre in ("m_bombillo", "m_opalino"):
            m = _emisor(nombre, 0.0)
            next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED").inputs["Emission Strength"].default_value = 0.0
    # vestíbulo
    for n, (x, y) in enumerate([(-2.6, 1.8), (2.4, -1.2), (-0.4, -3.4)]):
        bombillo_desnudo(f"lum_vest_bombillo_{n}", x, y, H_PB, col)
    for n, (x, y) in enumerate([(1.0, 3.4), (-1.6, 4.8)]):
        colgante(f"lum_vest_colgante_{n}", x, y, H_PB, col)
    # rampa: aplique tubular en el muro del fondo, sobre el descanso del entrepiso bajo (descanso a 1,655 m; el
    # tramo exterior va a cielo abierto y no lleva) [i09, i15]
    aplique_tubo("lum_rampa_aplique", (0.0, -7.09, 1.655 + 1.95), (1, 0, 0), 0.6, col)
    # salón: la canaleta de villa_detalle ya emite; se le suma una fuente de área a lo largo, hacia el cielo raso
    _luz("lum_salon_canaleta", "AREA", (2.4, 7.9, Y_TECHO - 0.43), 260 if noche else 0, col, tam=(12.0, 0.1), rot=(math.pi, 0, 0))
    # cocina: aplique sobre la pileta (muro de la cinta, lado cocina)
    aplique_globo("lum_cocina", (-7.6, 10.53, Y_LOSA + 2.05), (0, -1, 0), col)
    # baño de los padres: globo sobre el lavamanos (lavamanos en x −4,15 contra el muro del fondo z −3,32)
    aplique_globo("lum_bano", (-4.15, -3.32, Y_LOSA + 1.85), (0, -1, 0), col)
    # boudoir: regleta sobre la puerta (muro x 4,75, puerta z −9,3…−8,5) · dormitorios del oeste: sobre su puerta
    aplique_lineal("lum_boudoir", (4.74, -9.20, Y_LOSA + 2.25), (4.74, -8.60, Y_LOSA + 2.25), (-1, 0, 0), col)
    aplique_lineal("lum_hijo", (-6.32, 0.92, Y_LOSA + 2.25), (-6.32, 1.52, Y_LOSA + 2.25), (-1, 0, 0), col)   # abre hacia −x
    # dormitorios del oeste: plafón tenue (INTERPRETACIÓN, ninguna foto muestra su luminaria)
    for n, (x, y) in enumerate([(-7.7, -7.4), (-7.7, -0.8), (-1.6, -6.4)]):
        _luz(f"lum_plafon_{n}", "AREA", (x, y, Y_TECHO - 0.02), 120 if noche else 0, col, tam=(0.5, 0.5))
    # exterior
    aplique_globo("lum_entrada", (1.1, 6.30, 2.45), (0.15, 1, 0), col, energia=60)
    for n, (x, y) in enumerate([(-1.7, 2.75), (0.6, 4.2), (-3.2, 7.5)]):
        poste_farol(f"lum_cubierta_{n}", x, y, Y_TECHO + 0.21, col)
    aplique_globo("lum_kiosque", (9.28, -4.9, Y_LOSA + 2.2), (-1, 0, 0), col, energia=45)
    if not noche:
        for o in [o for o in bpy.data.objects if o.type == "LIGHT" and o.name.startswith("lum_")]:
            o.data.energy = 0.0
    print(f"[villa_luminarias] luminarias reales ({'encendidas' if noche else 'apagadas'})")
