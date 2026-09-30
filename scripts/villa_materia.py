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


def _pos_caras(nt, geo):
    """Posición para texturas 2D que también sirve en caras VERTICALES: arriba/abajo usa (x, y); en las caras
    verticales usa (x + y, z). Sin esto el ladrillo solo varía en x en un costado y sale a rayas pálidas
    (costados del baño, 29-sep)."""
    sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], sp.inputs["Vector"])
    sn = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Normal"], sn.inputs["Vector"])
    ab = nt.nodes.new("ShaderNodeMath"); ab.operation = "ABSOLUTE"; nt.links.new(sn.outputs["Z"], ab.inputs[0])
    es_tapa = nt.nodes.new("ShaderNodeMath"); es_tapa.operation = "GREATER_THAN"; es_tapa.inputs[1].default_value = 0.5
    nt.links.new(ab.outputs[0], es_tapa.inputs[0])
    suma = nt.nodes.new("ShaderNodeMath"); suma.operation = "ADD"
    nt.links.new(sp.outputs["X"], suma.inputs[0]); nt.links.new(sp.outputs["Y"], suma.inputs[1])
    lado = nt.nodes.new("ShaderNodeCombineXYZ"); nt.links.new(suma.outputs[0], lado.inputs["X"]); nt.links.new(sp.outputs["Z"], lado.inputs["Y"])
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "VECTOR"
    nt.links.new(es_tapa.outputs[0], mx.inputs["Factor"]); nt.links.new(lado.outputs["Vector"], mx.inputs[4])
    nt.links.new(geo.outputs["Position"], mx.inputs[5])
    return mx.outputs[1]


def baldosa(nombre, c1, c2, junta, lado, rough, giro=0.0, bump=0.2, largo=None, traba=0.0, caras=False):
    """Baldosa procedural en coordenadas de MUNDO (continúa entre piezas), con giro opcional (la diagonal).
    caras=True: también en caras verticales (piezas revestidas, no solo pisos)."""
    m, b = _mat(nombre, c1, rough); nt = m.node_tree
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, giro)
    nt.links.new(_pos_caras(nt, geo) if caras else geo.outputs["Position"], mp.inputs["Vector"])
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


def parque_cesta(nombre, c1, c2, junta, lado=0.24, tablillas=4, rough=0.45):
    """Dos ladrillos (tablillas en x y en y) y un tablero de ajedrez que elige cuál va en cada cuadro."""
    m, b = _mat(nombre, c1, rough); nt = m.node_tree
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    def tablilla(giro):
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, giro)
        nt.links.new(geo.outputs["Position"], mp.inputs["Vector"])
        lad = nt.nodes.new("ShaderNodeTexBrick"); lad.offset = 0.0; lad.squash = 1.0
        lad.inputs["Scale"].default_value = 1.0; lad.inputs["Brick Width"].default_value = lado
        lad.inputs["Row Height"].default_value = lado / tablillas; lad.inputs["Mortar Size"].default_value = 0.0015
        lad.inputs["Color1"].default_value = (*c1, 1); lad.inputs["Color2"].default_value = (*c2, 1)
        lad.inputs["Mortar"].default_value = (*junta, 1); lad.inputs["Bias"].default_value = 0.0
        nt.links.new(mp.outputs["Vector"], lad.inputs["Vector"]); return lad
    t1, t2 = tablilla(0.0), tablilla(math.pi / 2)
    aj = nt.nodes.new("ShaderNodeTexChecker"); aj.inputs["Scale"].default_value = 1.0 / lado / 2
    nt.links.new(geo.outputs["Position"], aj.inputs["Vector"])
    aj.inputs["Color1"].default_value = (1, 1, 1, 1); aj.inputs["Color2"].default_value = (0, 0, 0, 1)
    col = nt.nodes.new("ShaderNodeMix"); col.data_type = "RGBA"
    nt.links.new(aj.outputs["Fac"], col.inputs["Factor"]); nt.links.new(t1.outputs["Color"], col.inputs[6]); nt.links.new(t2.outputs["Color"], col.inputs[7])
    veta = nt.nodes.new("ShaderNodeTexNoise"); veta.inputs["Scale"].default_value = 60.0; veta.inputs["Detail"].default_value = 4
    nt.links.new(geo.outputs["Position"], veta.inputs["Vector"])
    vr = nt.nodes.new("ShaderNodeMapRange"); vr.inputs["To Min"].default_value = 0.9; vr.inputs["To Max"].default_value = 1.08
    nt.links.new(veta.outputs["Fac"], vr.inputs["Value"])
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
    nt.links.new(col.outputs[2], mul.inputs[6]); nt.links.new(vr.outputs["Result"], mul.inputs[7])
    nt.links.new(mul.outputs[2], b.inputs["Base Color"])
    fac = nt.nodes.new("ShaderNodeMix"); fac.data_type = "FLOAT"
    nt.links.new(aj.outputs["Fac"], fac.inputs[0]); nt.links.new(t1.outputs["Fac"], fac.inputs[2]); nt.links.new(t2.outputs["Fac"], fac.inputs[3])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.08; bp.invert = True
    nt.links.new(fac.outputs[0], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
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
    muro rosa lleva la cinta de ventanas, o sea que es fachada).
    AZUL = el muro corto del FONDO, lado comedor/cocina (x −4,65), el que tiene la puerta: la foto S8 58 lo muestra
    entero en azul lavanda pálido, mirando desde el extremo rosa. 30-sep (hallazgo #2): el azul estaba en un paño
    junto a la vidriera. Tono medido en S8 58 contra el cielo raso junto al muro: sRGB ~(115, 133, 154), el azul
    ~1,34× el rojo → lineal (0,36, 0,45, 0,62)."""
    (x0, x1, z0, z1), _ = RECINTOS["salon"]
    rosa = pintura("m_rosa_terracota", (0.62, 0.34, 0.27))
    azul = pintura("m_azul_polychromie", (0.36, 0.45, 0.62))
    en_altura = lambda c: y_losa - 0.05 < c.z < y_techo + 0.05
    n_r = sum(_asignar_caras(o, rosa, lambda c, nn: nn.x < -0.9 and c.y > z0 and c.x > 9.0)
              for o in _objetos(("fa_este_inf_1", "fa_este_sup_1")))
    n_a = sum(_asignar_caras(o, azul, lambda c, nn: en_altura(c) and nn.x > 0.9 and abs(c.x - x0) < 0.10
                             and z0 - 0.05 < c.y < z1) for o in _objetos(("n1_muro", "n1_tabique")))
    print(f"[materia] salón: {n_r} caras rosa terracota (fachada del estar) · {n_a} caras azul (muro del fondo)")


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
    # 30-sep (#5): el azul ultramar va SOLO en el muro de la puerta, el este (x 4,75), no en los cuatro [i10, i51:
    # mirando al azul, la ventana queda a la izquierda; la otra puerta, abierta, en el muro de enfrente]. Tono
    # medido en i10 contra el muro blanco: sRGB ~(56, 54, 86) → más oscuro y más violeta que el anterior.
    boudoir = pintura("m_azul_profundo", (0.07, 0.10, 0.28))
    charron = pintura("m_bleu_charron", (0.20, 0.33, 0.50))
    bx0, bx1, bz0, bz1 = RECINTOS["cuarto_b"][0]
    X_MURO_PUERTA = 4.75                                              # cara interior del muro este (n1_muro, x 4,75…4,90)
    muro_puerta = lambda c, nn: (y_losa - 0.05 < c.z < y_techo + 0.05 and nn.x < -0.9 and abs(c.x - X_MURO_PUERTA) < 0.06
                                 and bz0 - 0.05 < c.y < bz1 + 0.05)
    n_b = sum(_asignar_caras(o, boudoir, muro_puerta) for o in _objetos(("n1_muro", "n1_tabique")))
    n_p = sum(_asignar_caras(o, charron, _mira_hacia((-5.9, -5.0, -4.4, 0.6), y_losa, y_techo))
              for o in _objetos(("n1_muro", "n1_tabique")))
    z = y_losa + 0.002
    # parqué RUBIO ("plancher blond" [eg-xiste]; parqué en fotos de cuartos S8 5/10/12/32; huéspedes [CMN])
    # parqué EN CUADROS (tipo cesta): cuadros de 24 cm de 4 tablillas, alternando la dirección [S8 10/12]
    parque = parque_cesta("m_parque", (0.56, 0.41, 0.25), (0.47, 0.34, 0.20), (0.30, 0.21, 0.12))
    for nombre, r in (("huespedes", (-9.30, -6.05, -3.13, 1.62)), ("hijo", (-9.30, -6.05, -10.56, -4.75)),
                      ("boudoir", (1.45, 4.75, -10.56, -4.75)), ("suite", (-4.65, -1.45, -10.56, -2.0))):
        _losa_piso(f"mu_piso_{nombre}", *r, z, parque, col)
    # cocina: baldosa cuadrada tostada [S8 19]; baños: baldosa blanca chica (baño 14 y el de la suite, este un
    # milímetro más arriba porque se monta sobre el parqué de la suite)
    tostada = baldosa("m_baldosa_cocina", (0.50, 0.36, 0.24), (0.46, 0.33, 0.22), (0.30, 0.25, 0.20), 0.20, 0.4)
    _losa_piso("mu_piso_cocina", -9.30, -4.79, 4.86, 10.56, z, tostada, col)
    banio = baldosa("m_baldosa_bano", (0.84, 0.84, 0.81), (0.80, 0.80, 0.78), (0.62, 0.62, 0.60), 0.15, 0.2)   # blanca de 15 cm [S8 7]
    _losa_piso("mu_piso_bano14", -9.30, -6.05, -4.62, -3.28, z, banio, col)
    _losa_piso("mu_piso_bano_suite", -4.93, -2.30, -6.10, -3.30, z + 0.003, banio, col)
    losa_t = bpy.data.materials.get("mu_losa_terraza")
    if losa_t: _losa_piso("mu_piso_kiosque", 4.93, 9.30, -10.56, -4.75, z, losa_t, col)
    print(f"[materia] boudoir azul profundo ({n_b} caras) · pasillo bleu charron ({n_p}) · parqué huéspedes · piso del kiosque")


def circulacion(y_losa, col):
    """Hall y pasillos del nivel principal. NINGUNA fuente documenta su piso: Alejandro dejó la elección a Claude
    (28-sep). Elegido: la misma baldosa clara del vestíbulo de abajo, un poco más cálida. Razón: la rampa y la
    escalera conectan los dos halls, y en las fotos de circulaciones (S8 1/13) el piso es cerámica clara, no
    parqué ni el ocre del salón. INTERPRETACIÓN, no dato."""
    import villa_obra, villa_circulacion as circ
    z = y_losa + 0.002
    m = baldosa("m_circulacion", (0.72, 0.69, 0.63), (0.68, 0.65, 0.60), (0.50, 0.48, 0.45), 0.20, 0.35)
    piezas = villa_obra.rects_con_huecos(-5.9, 1.40, 0.6, 4.72, [circ.HUECO_RAMPA, *circ.HUECOS_ESCALERA])
    piezas += [(-5.9, -5.0, -4.4, 0.6), (-3.1, -1.45, -2.0, 0.6)]           # pasillo al hijo · entrada de la suite
    for k, r in enumerate(piezas): _losa_piso(f"mu_piso_circulacion_{k}", *r, z, m, col)
    print(f"[materia] hall y pasillos: baldosa clara ({len(piezas)} piezas) — elección de Claude, sin fuente")


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
    # y los cantos de la losa en los huecos de escalera y rampa (se veían ocres, del color del piso del salón)
    n = sum(_asignar_caras(o, blanco, lambda c, nn: nn.z < 0.5) for o in _objetos(("losa_nobile",)))
    print(f"[materia] cielo raso de planta baja en blanco ({n} caras)")


def aplicar(col, y_losa, y_techo, h_pilotis=3.07):
    dinteles(col, (h_pilotis - 0.2, y_techo - 0.01), pisos=(0.05, y_losa + 0.012))    # antes de pintar: la pintura los alcanza
    piso_vestibulo(col); rampa_diagonal(y_losa); salon(y_losa, y_techo); cocina(y_losa, y_techo)
    verde_solo_afuera(h_pilotis); cielo_raso_blanco(); cuartos(y_losa, y_techo, col); circulacion(y_losa, col); puertas(col, (0.05, y_losa + 0.012))


def _circuncentro(a, b, c):
    d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
    if abs(d) < 1e-9: return None
    ux = ((a[0]**2 + a[1]**2) * (b[1] - c[1]) + (b[0]**2 + b[1]**2) * (c[1] - a[1]) + (c[0]**2 + c[1]**2) * (a[1] - b[1])) / d
    uy = ((a[0]**2 + a[1]**2) * (c[0] - b[0]) + (b[0]**2 + b[1]**2) * (a[0] - c[0]) + (c[0]**2 + c[1]**2) * (b[0] - a[0])) / d
    return ux, uy


PUERTAS_GEOM = []                                   # (nivel, bisagra, dir. de giro, dir. del vano, cara0, cara1, radio)


def _puertas_dwg():
    """Las puertas que dibuja el DWG: arco de giro de ~90° (r 0,5–1,1 m) + la línea de la hoja desde la bisagra.
    Devuelve (nivel, bisagra, extremo ABIERTO, extremo del VANO, radio). Sin línea de hoja → no se inventa."""
    ruta = os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente/dwg-muros.json")
    niveles = json.load(open(ruta, encoding="utf-8"))["niveles"]
    fuera = []
    for nivel in ("nivel0", "nivel1"):
        lineas = [t for t in niveles[nivel] if t["tipo"] != "ARC"]
        for s in niveles[nivel]:
            if s["tipo"] != "ARC": continue
            p = s["pts"]; c = _circuncentro(p[0], p[len(p) // 2], p[-1])
            if not c: continue
            r = math.dist(c, p[0])
            giro = abs(math.degrees(math.atan2(p[-1][1] - c[1], p[-1][0] - c[0]) - math.atan2(p[0][1] - c[1], p[0][0] - c[0]))) % 360
            if not (0.5 < r < 1.1 and 70 < min(giro, 360 - giro) < 110): continue
            hoja = None
            for t in lineas:
                for u, v in zip(t["pts"], t["pts"][1:]):
                    for e in (p[0], p[-1]):
                        if (math.dist(u, c) < 0.06 and math.dist(v, e) < 0.06) or (math.dist(v, c) < 0.06 and math.dist(u, e) < 0.06):
                            hoja = e
            if not hoja: continue
            # En ESTE DWG la línea de la hoja va sobre el VANO (puerta cerrada) y el arco termina en la posición
            # abierta. Verificado en render (28-sep): leído al revés, la hoja tapaba el vano como un rectángulo
            # negro y el dintel salía perpendicular al muro, como un estante.
            abierto = p[-1] if math.dist(hoja, p[0]) < 1e-6 else p[0]
            fuera.append((nivel, c, tuple(abierto), tuple(hoja), r))
    return fuera


def _muros_nivel(nivel):
    """Contornos de muro de un nivel (rellenos del DWG + tabiques de pares de líneas) para saber de qué lado del
    vano está el muro."""
    import villa_obra
    polis = [p for p in villa_obra._cargar("dwg-muros-solidos.json")["niveles"][nivel] if villa_obra._area(p) >= 0.05]
    rects = villa_obra.tabiques_de_lineas(nivel, 19.0, 21.5, polis) if nivel == "nivel1" else []
    return polis, rects


def _lado_del_muro(c, u, w, polis, rects):
    """+1 si el muro está del lado −w de la línea del vano (lo normal: la bisagra va en la cara del lado del giro),
    −1 si está del lado +w, 0 si no se sabe (entonces se centra). Mira justo al lado de las dos jambas."""
    def en_muro(x, z):
        return any(_dentro((x, z), p) for p in polis) or any(r[0] < x < r[1] and r[2] < z < r[3] for r in rects)
    votos = 0
    for jx, jz, sg in ((c[0], c[1], -1), (c[0] + u[0] * u[2], c[1] + u[1] * u[2], 1)):
        fx, fz = jx + u[0] * 0.05 * sg, jz + u[1] * 0.05 * sg            # un poco afuera del vano, dentro de la jamba
        votos += en_muro(fx - w[0] * 0.07, fz - w[1] * 0.07) - en_muro(fx + w[0] * 0.07, fz + w[1] * 0.07)
    return (votos > 0) - (votos < 0)


def _caras_del_muro(c, u, w, polis, rects, defecto):
    """Mide las DOS caras reales del muro junto a cada jamba (barrido de 5 mm a lo largo de w). Con un grueso
    supuesto el dintel sobresalía 1 cm (muros de 15 cm, dintel de 16; lo vio Alejandro)."""
    def en_muro(x, z):
        return any(_dentro((x, z), p) for p in polis) or any(r[0] < x < r[1] and r[2] < z < r[3] for r in rects)
    def borde(fx, fz, adentro, afuera):
        """Bisección entre un punto dentro y uno fuera del muro: la cara exacta (±1 µm), no a pasos de 5 mm.
        Con pasos quedaba 2,5 mm corrida y se veía como una línea sobre la puerta (Alejandro, 28-sep)."""
        for _ in range(24):
            mid = (adentro + afuera) / 2
            if en_muro(fx + w[0] * mid, fz + w[1] * mid): adentro = mid
            else: afuera = mid
        return (adentro + afuera) / 2
    medidas = []
    for jx, jz, sg in ((c[0], c[1], -1), (c[0] + u[0] * u[2], c[1] + u[1] * u[2], 1)):
        fx, fz = jx + u[0] * 0.03 * sg, jz + u[1] * 0.03 * sg
        dentro = [k / 200 for k in range(-80, 81) if en_muro(fx + w[0] * k / 200, fz + w[1] * k / 200)]
        if dentro and 0.08 < max(dentro) - min(dentro) + 0.005 < 0.3:     # un muro normal, no una esquina
            medidas.append((borde(fx, fz, min(dentro), min(dentro) - 0.005), borde(fx, fz, max(dentro), max(dentro) + 0.005)))
    if not medidas: return defecto
    return (sum(m[0] for m in medidas) / len(medidas), sum(m[1] for m in medidas) / len(medidas))


ENV_INT = (9.30, 10.55)            # caras interiores de la envolvente de 20 cm (villa-blender E_ENV)


def _hasta_fachada(p, u, alcance=0.08, solape=0.03):
    """Si el extremo del dintel queda a menos de 8 cm de la cara interior de una fachada, lo lleva hasta ella (+3 cm
    adentro). La línea de la hoja del DWG no siempre llega a la fachada: sobre esa puerta quedaba una ranura de
    1,8 cm que atravesaba el muro (chequeo 30-sep, puerta junto a la fachada oeste)."""
    q = list(p)
    for k in range(2):
        if abs(u[k]) < 0.99: continue
        cara = ENV_INT[k] * (1 if u[k] > 0 else -1)
        falta = (cara - p[k]) * (1 if u[k] > 0 else -1)
        if 0 < falta < alcance: q[k] = cara + solape * (1 if u[k] > 0 else -1)
    return tuple(q)


def dinteles(col, techos, grueso=0.15, h_puerta=2.10, pisos=(0.05, 3.322)):
    """Sobre cada puerta, el muro: el DWG corta los muros en la puerta de piso a techo (es un corte a 1 m) y el
    modelo los levantaba así, con un hueco hasta el cielo raso (lo vio Alejandro en el boudoir). En las fotos
    [S8 10/16] la puerta es de ~2,10 m con muro encima. Se nombran como muros de su nivel para que la pintura
    del recinto (azul, azulejo, verde/blanco) los alcance."""
    import villa_obra
    blanco = bpy.data.materials.get("blanco"); verde = bpy.data.materials.get("verde")
    n = 0
    cache = {}
    for k, (nivel, c, hoja, cerrado, r) in enumerate(_puertas_dwg()):
        if nivel not in cache: cache[nivel] = _muros_nivel(nivel)
        w = ((hoja[0] - c[0]) / r, (hoja[1] - c[1]) / r)                 # hacia donde abre
        largo = math.dist(c, cerrado); u = ((cerrado[0] - c[0]) / largo, (cerrado[1] - c[1]) / largo, largo)
        lado = _lado_del_muro(c, u, w, *cache[nivel])
        supuesto = (-grueso, 0.0) if lado > 0 else (0.0, grueso) if lado < 0 else (-grueso / 2, grueso / 2)
        a0, a1 = _caras_del_muro(c, u, w, *cache[nivel], supuesto)
        # 3 cm DENTRO de cada jamba: el muro lleva bisel en sus cantos y, al tope, quedaba una ranura vertical
        # sobre la puerta (la "línea" que seguía viendo Alejandro). Solapado, el dintel tapa la ranura; mismo
        # material en coordenadas de mundo, así que el solape no se nota.
        e0 = _hasta_fachada((c[0] - u[0] * 0.03, c[1] - u[1] * 0.03), (-u[0], -u[1]))
        e1 = _hasta_fachada((cerrado[0] + u[0] * 0.03, cerrado[1] + u[1] * 0.03), u)
        poli = [(e0[0] + w[0] * a1, e0[1] + w[1] * a1), (e1[0] + w[0] * a1, e1[1] + w[1] * a1),
                (e1[0] + w[0] * a0, e1[1] + w[1] * a0), (e0[0] + w[0] * a0, e0[1] + w[1] * a0)]
        PUERTAS_GEOM.append((nivel, c, w, u, a0, a1, r))
        i = 0 if nivel == "nivel0" else 1
        nombre = f"pb_muro_dintel_{k}" if i == 0 else f"n1_tabique_dintel_{k}"
        villa_obra._prisma(nombre, poli, pisos[i] + h_puerta, techos[i], verde if i == 0 else blanco, col); n += 1
    print(f"[materia] {n} dinteles sobre las puertas (antes: hueco hasta el techo)")


def _caja_orientada(bm, o, u, w, a_u, b_u, a_w, b_w, h0, h1):
    """Caja alineada al vano: de a_u a b_u a lo largo de u, de a_w a b_w a lo largo de w, de h0 a h1."""
    pts = [(o[0] + u[0] * p + w[0] * q, o[1] + u[1] * p + w[1] * q) for p, q in ((a_u, a_w), (b_u, a_w), (b_u, b_w), (a_u, b_w))]
    ab = [bm.verts.new((x, z, h0)) for x, z in pts]; ar = [bm.verts.new((x, z, h1)) for x, z in pts]
    bm.faces.new(ab[::-1]); bm.faces.new(ar)
    for k in range(4): bm.faces.new((ab[k], ab[(k + 1) % 4], ar[(k + 1) % 4], ar[k]))


def puertas(col, pisos=(0.05, 3.322), h=2.10):
    """Medida contra la foto S8 10 (cuarto azul), por píxel: hoja LISA enrasada, gris-café cálido de albedo ~0,2
    (la foto la da casi tan clara como el muro azul; la primera versión era casi negra), SIN marco que contraste
    (el canto de la hoja toca el muro), manija de palanca chica con roseta y una bocallave redonda debajo.
    Abiertas 90° hacia el lado del giro del plano, para no cerrar el recorrido."""
    m, b = _mat("m_puerta", (0.20, 0.15, 0.13), 0.5)
    nt = m.node_tree                                                    # pintura satinada: variación mínima
    ruido = nt.nodes.new("ShaderNodeTexNoise"); ruido.inputs["Scale"].default_value = 3.0
    geo = nt.nodes.new("ShaderNodeNewGeometry"); nt.links.new(geo.outputs["Position"], ruido.inputs["Vector"])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.97; mr.inputs["To Max"].default_value = 1.03
    nt.links.new(ruido.outputs["Fac"], mr.inputs["Value"])
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
    mul.inputs[6].default_value = (0.20, 0.15, 0.13, 1); nt.links.new(mr.outputs["Result"], mul.inputs[7])
    nt.links.new(mul.outputs[2], b.inputs["Base Color"])
    metal, _ = _mat("m_manija", (0.80, 0.79, 0.76), 0.18, metal=1.0)
    negro, _ = _mat("m_bocallave", (0.01, 0.01, 0.01), 0.6)
    bh, bman, bll = bmesh.new(), bmesh.new(), bmesh.new()
    n = 0
    for nivel, c, w, u, a0, a1, r in PUERTAS_GEOM:
        h0 = pisos[0] if nivel == "nivel0" else pisos[1]
        ancho = u[2] - 0.006                                           # luz de 3 mm por lado, sin marco
        o = (c[0] + u[0] * 0.003 + w[0] * a1, c[1] + u[1] * 0.003 + w[1] * a1)
        uu = (-u[0], -u[1])
        _caja_orientada(bh, o, w, uu, 0.0, ancho, -0.04, 0.0, h0 + 0.008, h0 + h - 0.003)
        libre = (o[0] + w[0] * (ancho - 0.065), o[1] + w[1] * (ancho - 0.065))
        for cara, sale in ((0.0, 1), (-0.04, -1)):
            f0 = cara if sale > 0 else cara - 0.006
            for hz, lado, mat_bm in ((1.0, 0.018, bman), (0.90, 0.015, bman)):          # roseta de la manija · de la llave
                _caja_orientada(mat_bm, libre, w, uu, -lado, lado, f0, f0 + 0.006, h0 + hz - lado, h0 + hz + lado)
            k0 = f0 + 0.0062 if sale > 0 else f0 - 0.0004
            _caja_orientada(bll, libre, w, uu, -0.003, 0.003, k0, k0 + 0.0004, h0 + 0.89, h0 + 0.91)   # bocallave
            p0 = f0 + 0.006 if sale > 0 else f0 - 0.012
            _caja_orientada(bman, libre, w, uu, -0.007, 0.007, p0, p0 + 0.012, h0 + 0.993, h0 + 1.007)  # cuello
            q0 = p0 + (0.004 if sale > 0 else -0.004)
            _caja_orientada(bman, libre, w, uu, -0.12, 0.007, q0, q0 + 0.012, h0 + 0.994, h0 + 1.006)   # palanca
        for hb in (0.22, 1.02, 1.82):                                   # bisagras en el canto
            _caja_orientada(bman, o, w, uu, -0.010, 0.003, -0.044, 0.004, h0 + hb, h0 + hb + 0.09)
        n += 1
    for nombre, bm_, mat in (("carp_puertas", bh, m), ("carp_manijas", bman, metal), ("carp_bocallaves", bll, negro)):
        bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces)
        me = bpy.data.meshes.new(nombre); bm_.to_mesh(me); bm_.free()
        ob = bpy.data.objects.new(nombre, me); col.objects.link(ob); me.materials.append(mat)
        if nombre == "carp_puertas":                                    # cantos apenas redondeados: atrapan luz
            bv = ob.modifiers.new("canto", "BEVEL"); bv.width = 0.003; bv.segments = 2
            bv.limit_method = "ANGLE"; bv.harden_normals = True
    print(f"[materia] carpintería: {n} puertas lisas sin marco, manija chica y bocallave (medidas contra S8 10)")


