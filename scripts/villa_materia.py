"""
Fase 3 — MATERIA por recinto (28-sep-2026). Solo lo que tiene evidencia (PLANTA.md "MATERIA Y COLOR", expediente,
fotos Archweb S8/S9). Lo que todavía no está identificado con seguridad (qué dormitorio es cuál) NO se pinta aquí.

  · planta baja: el vestíbulo tenía GRAVA (la del jardín seguía bajo la casa) → baldosa clara [S8 1/13]
  · rampa: losetas cuadradas en DIAGONAL [S9 9]
  · salón: muro ROSA TERRACOTA entero y un paño AZUL junto a la vidriera [PLANTA.md, S8 28–30]
  · cocina: muros de azulejo blanco [expediente nivel-1]
  · recintos: el mapa de coordenadas del nivel principal (leído del plano del DWG, 28-sep)

Ejes: JSON/plano (x, z) → Blender (X, Y); altura = Z de Blender.
"""
import bpy, bmesh, json, math, os

# Recintos del nivel principal (x0, x1, z0, z1), leídos del plano del DWG (dwglab-planta-principal).
# ✅ = identificado con evidencia · ❓ = forma segura, uso por confirmar
RECINTOS = {
    "salon":   ((-4.65, 9.50, 4.72, 10.75), "✅ S3 S5 S7, fotos S8 28–30"),
    "cocina":  ((-9.50, -4.65, 4.72, 10.75), "✅ suroeste, junto al salón [S4]"),
    "terraza": ((1.40, 9.50, -4.60, 4.72), "✅"),
    "cuarto_a": ((4.93, 9.50, -10.75, -4.72), "❓ dormitorio"),
    "cuarto_b": ((1.42, 4.93, -10.75, -4.72), "❓ dormitorio / baño"),
    "suite":   ((-4.65, 1.42, -10.75, -2.00), "❓ ¿suite de los padres (~53 m², baño abierto)?"),
    "oeste_1": ((-9.50, -5.98, -10.75, -3.30), "❓"),
    "oeste_2": ((-9.50, -5.98, -3.30, 1.80), "❓"),
    "oeste_3": ((-9.50, -5.98, 1.80, 4.60), "❓"),
}


def _mat(nombre, color, rough, metal=0.0):
    m = bpy.data.materials.get(nombre) or bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m, b


def baldosa(nombre, c1, c2, junta, lado, rough, giro=0.0, bump=0.2, largo=None, traba=0.0):
    """Baldosa procedural en coordenadas de MUNDO (continúa entre piezas), con giro opcional (la diagonal)."""
    m, b = _mat(nombre, c1, rough); nt = m.node_tree
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, giro)
    nt.links.new(geo.outputs["Position"], mp.inputs["Vector"])
    lad = nt.nodes.new("ShaderNodeTexBrick"); lad.offset = traba; lad.squash = 1.0
    lad.inputs["Scale"].default_value = 1.0; lad.inputs["Brick Width"].default_value = largo or lado
    lad.inputs["Row Height"].default_value = lado; lad.inputs["Mortar Size"].default_value = 0.004
    lad.inputs["Mortar Smooth"].default_value = 0.2
    lad.inputs["Color1"].default_value = (*c1, 1); lad.inputs["Color2"].default_value = (*c2, 1)
    lad.inputs["Mortar"].default_value = (*junta, 1)
    nt.links.new(mp.outputs["Vector"], lad.inputs["Vector"])
    # cada pieza con su tono y su brillo (una baldosa real nunca es idéntica a la de al lado)
    celda = nt.nodes.new("ShaderNodeVectorMath"); celda.operation = "SNAP"; celda.inputs[1].default_value = (largo or lado, lado, lado)
    nt.links.new(mp.outputs["Vector"], celda.inputs[0])
    azar = nt.nodes.new("ShaderNodeTexWhiteNoise"); nt.links.new(celda.outputs["Vector"], azar.inputs["Vector"])
    tono = nt.nodes.new("ShaderNodeMapRange"); tono.inputs["To Min"].default_value = 0.92; tono.inputs["To Max"].default_value = 1.06
    nt.links.new(azar.outputs["Value"], tono.inputs["Value"])
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
    nt.links.new(lad.outputs["Color"], mul.inputs[6]); nt.links.new(tono.outputs["Result"], mul.inputs[7])
    nt.links.new(mul.outputs[2], b.inputs["Base Color"])
    r = nt.nodes.new("ShaderNodeMapRange"); r.inputs["To Min"].default_value = rough * 0.8; r.inputs["To Max"].default_value = min(rough * 1.3, 1.0)
    nt.links.new(azar.outputs["Value"], r.inputs["Value"]); nt.links.new(r.outputs["Result"], b.inputs["Roughness"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump; bp.invert = True
    nt.links.new(lad.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def pintura(nombre, color, rough=0.75):
    """Pintura mate sobre revoque: el mismo grano del revoque blanco, con otro color."""
    blanco = bpy.data.materials.get("blanco")
    if blanco:
        m = blanco.copy(); m.name = nombre
        nt = m.node_tree
        mix = next((n for n in nt.nodes if n.type == "MIX" and n.blend_type == "MULTIPLY"
                    and not n.inputs[6].is_linked and n.inputs[6].default_value[0] > 0.5), None)
        if mix: mix.inputs[6].default_value = (*color, 1); return m
    return _mat(nombre, color, rough)[0]


def _asignar_caras(obj, material, prueba):
    """Pone `material` en las caras de `obj` que cumplen prueba(centro, normal)."""
    me = obj.data
    if material.name not in [m.name for m in me.materials if m]: me.materials.append(material)
    idx = [m.name if m else "" for m in me.materials].index(material.name)
    mw = obj.matrix_world; rot = mw.to_3x3()
    n = 0
    for p in me.polygons:
        c = mw @ p.center; nn = (rot @ p.normal).normalized()
        if prueba(c, nn): p.material_index = idx; n += 1
    return n


def _objetos(prefijos):
    return [o for o in bpy.context.scene.objects if o.type == "MESH" and o.name.startswith(prefijos)]


def piso_vestibulo(col, h=0.05):
    """El vestíbulo en herradura: su piso es el arco del vidrio cerrado por la cuerda, en baldosa clara."""
    ruta = os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente/dwg-muros.json")
    lineas = json.load(open(ruta, encoding="utf-8"))["niveles"]["nivel0"]
    arcos = [s for s in lineas if s["tipo"] == "ARC" and s["capa"] == "2"]
    if not arcos: return
    arco = max(arcos, key=lambda s: sum(math.dist(a, b) for a, b in zip(s["pts"], s["pts"][1:])))
    pts = [tuple(p) for p in arco["pts"]]
    m = baldosa("m_vestibulo", (0.74, 0.71, 0.66), (0.70, 0.67, 0.62), (0.52, 0.50, 0.47), 0.30, 0.35)
    from mathutils.geometry import tessellate_polygon
    me = bpy.data.meshes.new("pb_piso_vestibulo"); bm = bmesh.new()
    ab = [bm.verts.new((x, z, 0.03)) for x, z in pts]; ar = [bm.verts.new((x, z, h)) for x, z in pts]
    for i, j, k in tessellate_polygon([[(x, z, 0.0) for x, z in pts]]):
        bm.faces.new((ab[k], ab[j], ab[i])); bm.faces.new((ar[i], ar[j], ar[k]))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(me.name, me); col.objects.link(o); me.materials.append(m)
    print("[materia] piso del vestíbulo: baldosa clara dentro de la herradura (antes: grava)")


def rampa_diagonal(y_losa=3.31):
    """Tramo EXTERIOR (nivel principal → cubierta): losetas en diagonal [S9 9]. Tramo INTERIOR (planta baja →
    nivel principal): piso liso gris oscuro [S8 9/15/20/31]."""
    m = baldosa("m_rampa", (0.62, 0.60, 0.56), (0.57, 0.55, 0.51), (0.78, 0.77, 0.74), 0.30, 0.6, giro=math.radians(45), bump=0.35)
    oscuro, _ = _mat("m_rampa_interior", (0.075, 0.075, 0.08), 0.5)
    rampa = [o for o in _objetos(("circ_rampa",)) if o.name == "circ_rampa"]
    n = sum(_asignar_caras(o, m, lambda c, nn: nn.z > 0.3 and c.z > y_losa + 0.05) for o in rampa)
    n_i = sum(_asignar_caras(o, oscuro, lambda c, nn: nn.z > 0.3 and c.z <= y_losa + 0.05) for o in rampa)
    print(f"[materia] rampa: exterior en diagonal ({n} caras) · interior gris oscuro ({n_i})")


def salon(y_losa, y_techo):
    """CMN: "muro azul junto al comedor, muro rosa junto al estar, el resto blanco".
    ROSA = la cara interior de la fachada este en el tramo del salón (el extremo del estar; en las fotos S8 28–29 el
    muro rosa lleva la cinta de ventanas, o sea que es fachada). AZUL = el paño junto a la vidriera, del lado del
    comedor. 28-sep: la primera versión puso el rosa en el muro del fondo (salón/cocina): estaba al revés."""
    (x0, x1, z0, z1), _ = RECINTOS["salon"]
    rosa = pintura("m_rosa_terracota", (0.62, 0.34, 0.27))
    azul = pintura("m_azul_polychromie", (0.30, 0.47, 0.55))
    en_altura = lambda c: y_losa - 0.05 < c.z < y_techo + 0.05
    n_r = sum(_asignar_caras(o, rosa, lambda c, nn: nn.x < -0.9 and c.y > z0 and c.x > 9.0)
              for o in _objetos(("fa_este_inf_1", "fa_este_sup_1")))
    n_a = sum(_asignar_caras(o, azul, lambda c, nn: en_altura(c) and nn.y > 0.9 and abs(c.y - z0) < 0.35
                             and x0 < c.x < 1.40) for o in _objetos(("n1_muro", "n1_tabique")))
    print(f"[materia] salón: {n_r} caras rosa terracota (fachada del estar) · {n_a} caras azul (comedor)")


def _mira_hacia(rect, y_losa, y_techo):
    """Caras verticales del nivel principal que miran HACIA el interior del rectángulo."""
    x0, x1, z0, z1 = rect
    return lambda c, nn: (y_losa - 0.05 < c.z < y_techo + 0.05 and abs(nn.z) < 0.3
                          and x0 - 0.3 < c.x < x1 + 0.3 and z0 - 0.3 < c.y < z1 + 0.3
                          and x0 < c.x + nn.x * 0.5 < x1 and z0 < c.y + nn.y * 0.5 < z1)


def cuartos(y_losa, y_techo, col):
    """Solo lo documentado (expediente/recintos-nivel-1.md): boudoir azul profundo [Carnets d'Igor]; pasillo al
    cuarto del hijo "bleu charron" [eg-xiste]; parqué en el cuarto de huéspedes [CMN]; el kiosque con las losas
    de la terraza [CMN]. Lo que no tiene fuente (color de los demás dormitorios) queda blanco."""
    boudoir = pintura("m_azul_profundo", (0.10, 0.17, 0.34))
    charron = pintura("m_bleu_charron", (0.20, 0.33, 0.50))
    n_b = sum(_asignar_caras(o, boudoir, _mira_hacia(RECINTOS["cuarto_b"][0], y_losa, y_techo))
              for o in _objetos(("n1_muro", "n1_tabique")))
    n_p = sum(_asignar_caras(o, charron, _mira_hacia((-5.9, -5.0, -4.4, 0.6), y_losa, y_techo))
              for o in _objetos(("n1_muro", "n1_tabique")))
    z = y_losa + 0.002
    # parqué RUBIO ("plancher blond" [eg-xiste]; parqué en fotos de cuartos S8 5/10/12/32; huéspedes [CMN])
    # tablillas de 30 × 7 cm trabadas a media pieza (antes salían cuadritos de 7 × 7: parecía baldosa)
    parque = baldosa("m_parque", (0.56, 0.41, 0.25), (0.47, 0.34, 0.20), (0.30, 0.21, 0.12), 0.07, 0.45, bump=0.1, largo=0.30, traba=0.5)
    for nombre, r in (("huespedes", (-9.30, -6.05, -3.13, 1.62)), ("hijo", (-9.30, -6.05, -10.56, -4.75)),
                      ("boudoir", (1.45, 4.75, -10.56, -4.75)), ("suite", (-4.65, -1.45, -10.56, -2.0))):
        _losa_piso(f"mu_piso_{nombre}", *r, z, parque, col)
    # cocina: baldosa cuadrada tostada [S8 19]; baños: baldosa blanca chica (baño 14 y el de la suite, este un
    # milímetro más arriba porque se monta sobre el parqué de la suite)
    tostada = baldosa("m_baldosa_cocina", (0.50, 0.36, 0.24), (0.46, 0.33, 0.22), (0.30, 0.25, 0.20), 0.20, 0.4)
    _losa_piso("mu_piso_cocina", -9.30, -4.79, 4.86, 10.56, z, tostada, col)
    banio = baldosa("m_baldosa_bano", (0.84, 0.84, 0.81), (0.80, 0.80, 0.78), (0.62, 0.62, 0.60), 0.10, 0.2)
    _losa_piso("mu_piso_bano14", -9.30, -6.05, -4.62, -3.28, z, banio, col)
    _losa_piso("mu_piso_bano_suite", -4.65, -2.30, -6.10, -3.30, z + 0.003, banio, col)
    losa_t = bpy.data.materials.get("mu_losa_terraza")
    if losa_t: _losa_piso("mu_piso_kiosque", 4.93, 9.30, -10.56, -4.75, z, losa_t, col)
    print(f"[materia] boudoir azul profundo ({n_b} caras) · pasillo bleu charron ({n_p}) · parqué huéspedes · piso del kiosque")


def _losa_piso(nombre, x0, x1, z0, z1, h, material, col):
    me = bpy.data.meshes.new(nombre); bm = bmesh.new()
    r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r["verts"]:
        v.co = ((x0 + x1) / 2 + v.co.x * (x1 - x0), (z0 + z1) / 2 + v.co.y * (z1 - z0), h + 0.005 + v.co.z * 0.01)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); col.objects.link(o); me.materials.append(material)


def cocina(y_losa, y_techo):
    (x0, x1, z0, z1), _ = RECINTOS["cocina"]
    azulejo = baldosa("m_azulejo_cocina", (0.86, 0.86, 0.83), (0.84, 0.84, 0.81), (0.70, 0.70, 0.68), 0.15, 0.12, bump=0.15)
    dentro = lambda c, nn: (y_losa - 0.05 < c.z < y_techo + 0.05 and abs(nn.z) < 0.3
                            and x0 - 0.3 < c.x < x1 + 0.3 and z0 - 0.3 < c.y < z1 + 0.3
                            and x0 < c.x + nn.x * 0.5 < x1 and z0 < c.y + nn.y * 0.5 < z1)   # mira HACIA la cocina
    n = sum(_asignar_caras(o, azulejo, dentro) for o in _objetos(("n1_muro", "n1_tabique")))
    print(f"[materia] cocina: azulejo blanco en {n} caras")


def _herradura():
    ruta = os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente/dwg-muros.json")
    lineas = json.load(open(ruta, encoding="utf-8"))["niveles"]["nivel0"]
    arcos = [s for s in lineas if s["tipo"] == "ARC" and s["capa"] == "2"]
    return max(arcos, key=lambda s: sum(math.dist(a, b) for a, b in zip(s["pts"], s["pts"][1:])))["pts"]


def _dentro(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        x1, y1 = poly[i]; x2, y2 = poly[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1: c = not c
    return c


SERVICIO = (-6.3, -2.4, -9.4, -0.6)                  # el bloque recto de servicio (PLANTA.md, DWG)


def verde_solo_afuera(h_pilotis):
    """El verde de la planta baja es la cara EXTERIOR (lo que la hace desaparecer tras los pilotis). Por dentro,
    el vestíbulo y el bloque de servicio son blancos [S8 1/3/4/13]. Cara verde solo si mira hacia afuera."""
    blanco = bpy.data.materials.get("blanco")
    arco = _herradura()
    x0, x1, z0, z1 = SERVICIO
    # el recinto cerrado de la planta baja: la herradura (z ≥ 0) + el tramo recto hacia el fondo, entre x ±6,4
    # (PLANTA.md: lado derecho recto en x ≈ +6,33 de z 0 a −9,4; el izquierdo contra el bloque de servicio)
    adentro = lambda x, z: (_dentro((x, z), arco) or (-6.4 < x < 6.4 and -9.5 < z < 0.1)
                            or (x0 < x < x1 and z0 < z < z1))
    prueba = lambda c, nn: abs(nn.z) < 0.5 and c.z < h_pilotis and adentro(c.x + nn.x * 0.4, c.y + nn.y * 0.4)
    n = sum(_asignar_caras(o, blanco, prueba) for o in _objetos(("pb_muro",)))
    print(f"[materia] planta baja: {n} caras interiores en blanco (el verde queda solo afuera)")


def cielo_raso_blanco():
    """La cara de abajo de la losa (techo del porche y del vestíbulo) era ocre: la losa entera tenía el material
    del piso del salón. Por debajo es revoque blanco."""
    blanco = bpy.data.materials.get("blanco")
    n = sum(_asignar_caras(o, blanco, lambda c, nn: nn.z < -0.5) for o in _objetos(("losa_nobile",)))
    print(f"[materia] cielo raso de planta baja en blanco ({n} caras)")


def aplicar(col, y_losa, y_techo, h_pilotis=3.07):
    piso_vestibulo(col); rampa_diagonal(y_losa); salon(y_losa, y_techo); cocina(y_losa, y_techo)
    verde_solo_afuera(h_pilotis); cielo_raso_blanco(); cuartos(y_losa, y_techo, col); puertas(col, (0.05, y_losa + 0.012))


def _circuncentro(a, b, c):
    d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
    if abs(d) < 1e-9: return None
    ux = ((a[0]**2 + a[1]**2) * (b[1] - c[1]) + (b[0]**2 + b[1]**2) * (c[1] - a[1]) + (c[0]**2 + c[1]**2) * (a[1] - b[1])) / d
    uy = ((a[0]**2 + a[1]**2) * (c[0] - b[0]) + (b[0]**2 + b[1]**2) * (a[0] - c[0]) + (c[0]**2 + c[1]**2) * (b[0] - a[0])) / d
    return ux, uy


def puertas(col, pisos=(0.05, 3.322)):
    """Las puertas que dibuja el DWG: arco de giro de ~90° (r 0,5–1,1 m) + la línea de la hoja desde la bisagra.
    Se ponen ABIERTAS, como las dibuja el plano (así no cierran la vista del recorrido). Hoja de 4 cm y 2,10 m,
    pintada oscura como en las fotos [S8 10/16]. Sin línea de hoja en el plano → no se inventa."""
    ruta = os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente/dwg-muros.json")
    niveles = json.load(open(ruta, encoding="utf-8"))["niveles"]
    m, _ = _mat("m_puerta", (0.085, 0.06, 0.05), 0.38)
    me = bpy.data.meshes.new("carp_puertas"); bm = bmesh.new(); n = 0
    for nivel, h0 in zip(("nivel0", "nivel1"), pisos):
        lineas = [t for t in niveles[nivel] if t["tipo"] != "ARC"]
        for s in niveles[nivel]:
            if s["tipo"] != "ARC": continue
            p = s["pts"]; c = _circuncentro(p[0], p[len(p) // 2], p[-1])
            if not c: continue
            r = math.dist(c, p[0])
            a0 = math.atan2(p[0][1] - c[1], p[0][0] - c[0]); a1 = math.atan2(p[-1][1] - c[1], p[-1][0] - c[0])
            giro = abs(math.degrees(a1 - a0)) % 360
            if not (0.5 < r < 1.1 and 70 < min(giro, 360 - giro) < 110): continue
            hoja = None
            for t in lineas:
                for u, v in zip(t["pts"], t["pts"][1:]):
                    for e in (p[0], p[-1]):
                        if (math.dist(u, c) < 0.06 and math.dist(v, e) < 0.06) or (math.dist(v, c) < 0.06 and math.dist(u, e) < 0.06):
                            hoja = e
            if not hoja: continue
            dx, dz = (hoja[0] - c[0]) / r, (hoja[1] - c[1]) / r; nx, nz = -dz * 0.02, dx * 0.02
            base = [(c[0] + nx, c[1] + nz), (hoja[0] + nx, hoja[1] + nz), (hoja[0] - nx, hoja[1] - nz), (c[0] - nx, c[1] - nz)]
            ab = [bm.verts.new((x, z, h0)) for x, z in base]; ar = [bm.verts.new((x, z, h0 + 2.10)) for x, z in base]
            bm.faces.new(ab[::-1]); bm.faces.new(ar)
            for k in range(4): bm.faces.new((ab[k], ab[(k + 1) % 4], ar[(k + 1) % 4], ar[k]))
            n += 1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(me.name, me); col.objects.link(o); me.materials.append(m)
    print(f"[materia] carpintería: {n} puertas del DWG, abiertas como las dibuja el plano")
