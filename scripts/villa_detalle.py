"""
Detalle de la Villa: pasto con hebras reales y el mobiliario de época.

Por qué existe (27-sep): el render de villa-blender.py ya tenía luz y materia, pero
Alejandro lo miró y dijo tres cosas ciertas — el pasto es una foto plana, la casa está
vacía, y los muebles que había (piezas mid-century de Poly Haven) no tienen nada que ver
con 1929. PLANTA.md "Los muebles reales" lo documenta con las fotos: LC4, LC2 cognac,
densidad MUY baja, y un radiador de rejilla corrido bajo la cinta de ventanas.

Todo aquí es geometría propia (tubo cromado + cojines), sin descargas: el mueble de
Le Corbusier ES tubo y prisma, y modelarlo es más fiel que un modelo genérico.

Ejes: Blender (X, Y, Z) = (x, z, y) de PLANTA.md — el mismo cambio que caja().
"""
import bpy, bmesh, math, os


# ── materiales ────────────────────────────────────────────────────────────
def _principled(nombre, rgb, rough, metal=0.0):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m, b


def _cuero(nombre, rgb):
    """Cuero: brillo satinado que varía con el uso + poro fino. Un cojín plano lee plástico."""
    m, b = _principled(nombre, rgb, 0.42)
    b.inputs["Coat Weight"].default_value = 0.25; b.inputs["Coat Roughness"].default_value = 0.35
    nt = m.node_tree; tc = nt.nodes.new("ShaderNodeTexCoord")
    uso = nt.nodes.new("ShaderNodeTexNoise"); uso.inputs["Scale"].default_value = 3.0
    nt.links.new(tc.outputs["Object"], uso.inputs["Vector"])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.30; mr.inputs["To Max"].default_value = 0.55
    nt.links.new(uso.outputs["Fac"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])
    poro = nt.nodes.new("ShaderNodeTexVoronoi"); poro.inputs["Scale"].default_value = 900.0
    nt.links.new(tc.outputs["Object"], poro.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.08
    nt.links.new(poro.outputs["Distance"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def _pony(nombre):
    """Piel de vaca (pony) de la LC4 del museo [S8 28–30]: blanca con manchas café oscuro de borde irregular, pelo corto
    (poco brillo, sin la capa satinada del cuero)."""
    m, b = _principled(nombre, (0.78, 0.74, 0.68), 0.7)
    nt = m.node_tree; tc = nt.nodes.new("ShaderNodeTexCoord")
    mancha = nt.nodes.new("ShaderNodeTexNoise"); mancha.inputs["Scale"].default_value = 2.2
    mancha.inputs["Detail"].default_value = 6.0; mancha.inputs["Roughness"].default_value = 0.62
    nt.links.new(tc.outputs["Object"], mancha.inputs["Vector"])
    corte = nt.nodes.new("ShaderNodeValToRGB")
    corte.color_ramp.elements[0].position = 0.50; corte.color_ramp.elements[0].color = (0.78, 0.74, 0.68, 1)
    corte.color_ramp.elements[1].position = 0.53; corte.color_ramp.elements[1].color = (0.07, 0.045, 0.03, 1)
    nt.links.new(mancha.outputs["Fac"], corte.inputs["Fac"]); nt.links.new(corte.outputs["Color"], b.inputs["Base Color"])
    pelo = nt.nodes.new("ShaderNodeTexNoise"); pelo.inputs["Scale"].default_value = 400.0
    nt.links.new(tc.outputs["Object"], pelo.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.12
    nt.links.new(pelo.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Sheen Weight"].default_value = 0.4
    return m


def _vidrio_mesa(nombre):
    m, b = _principled(nombre, (0.85, 0.92, 0.9), 0.02)
    b.inputs["Transmission Weight"].default_value = 1.0; b.inputs["IOR"].default_value = 1.52
    return m


def materiales():
    return {
        "cromo": _principled("mu_cromo", (0.92, 0.92, 0.93), 0.07, 1.0)[0],
        "acero_negro": _principled("mu_acero_negro", (0.02, 0.02, 0.022), 0.35, 0.6)[0],
        "cognac": _cuero("mu_cognac", (0.33, 0.10, 0.035)),
        "cuero_negro": _cuero("mu_cuero_negro", (0.018, 0.016, 0.015)),
        "pony": _pony("mu_pony"),
        "vidrio_mesa": _vidrio_mesa("mu_vidrio_mesa"),
        "haya": _principled("mu_haya", (0.23, 0.11, 0.045), 0.38)[0],      # madera curvada Thonet
        "lana": _principled("mu_lana", (0.62, 0.57, 0.48), 0.95)[0],
        "nogal": _principled("mu_nogal", (0.10, 0.055, 0.03), 0.3)[0],
        "rejilla": _principled("mu_rejilla", (0.52, 0.53, 0.53), 0.45, 0.3)[0],      # radiadores GRISES [S8]
        "canaleta": _principled("mu_canaleta", (0.62, 0.63, 0.64), 0.3, 0.8)[0],
        "hormigon_claro": _principled("mu_hormigon_claro", (0.72, 0.70, 0.66), 0.9)[0],
        "follaje": _principled("mu_follaje", (0.12, 0.16, 0.10), 0.7)[0],
        "tierra": _principled("mu_tierra", (0.10, 0.075, 0.05), 0.95)[0],
        "flor": _principled("mu_lavanda", (0.30, 0.22, 0.45), 0.8)[0],
        "luz_calida": _emisor("mu_luz_calida", (1.0, 0.78, 0.52), 45.0 if os.environ.get("VILLA_MODO") == "noche" else 0.0),
    }


def _emisor(nombre, rgb, fuerza):
    m, b = _principled(nombre, rgb, 0.5)
    b.inputs["Emission Color"].default_value = (*rgb, 1); b.inputs["Emission Strength"].default_value = fuerza
    return m


# ── primitivas ────────────────────────────────────────────────────────────
def _col(nombre):
    c = bpy.data.collections.get(nombre)
    if not c:
        c = bpy.data.collections.new(nombre); bpy.context.scene.collection.children.link(c)
    return c


def tubo(nombre, puntos, radio, material, col):
    """Tubo por una polilínea (tubo de acero curvado): curva con perfil circular y tapas."""
    cu = bpy.data.curves.new(nombre, "CURVE"); cu.dimensions = "3D"
    cu.bevel_depth = radio; cu.bevel_resolution = 4; cu.use_fill_caps = True
    sp = cu.splines.new("POLY"); sp.points.add(len(puntos) - 1)
    for p, (x, y, z) in zip(sp.points, puntos): p.co = (x, y, z, 1)
    o = bpy.data.objects.new(nombre, cu); col.objects.link(o)
    cu.materials.append(material); return o


def arco(c, r, a0, a1, n=16, plano="xz"):
    """Puntos de un arco (para curvar tubos) en el plano dado, centro c."""
    out = []
    for k in range(n + 1):
        a = a0 + (a1 - a0) * k / n
        u, v = r * math.cos(a), r * math.sin(a)
        out.append((c[0] + u, c[1], c[2] + v) if plano == "xz" else (c[0], c[1] + u, c[2] + v))
    return out


def cojin(nombre, x0, x1, y0, y1, z0, z1, material, col, redondeo=0.035):
    """Prisma con canto redondeado — el cojín LC es una caja, pero nunca de arista viva."""
    me = bpy.data.meshes.new(nombre); o = bpy.data.objects.new(nombre, me); col.objects.link(o)
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    o.scale = (x1 - x0, y1 - y0, z1 - z0); o.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    me.transform(o.matrix_basis); o.matrix_basis.identity()
    bv = o.modifiers.new("canto", "BEVEL"); bv.width = redondeo; bv.segments = 5; bv.limit_method = "ANGLE"
    bv.harden_normals = True                      # caras grandes planas de verdad (ver villa_muebles._caja_redonda)
    for p in me.polygons: p.use_smooth = True
    me.materials.append(material); return o


def _agrupar(objs, nombre, loc, rot_z, col):
    """Emparenta las piezas a un vacío: el mueble se arma en origen y se coloca de una vez."""
    ve = bpy.data.objects.new(nombre, None); col.objects.link(ve)
    for o in objs: o.parent = ve
    ve.location = loc; ve.rotation_euler = (0, 0, rot_z); return ve


# ── muebles (medidas del catálogo Cassina, en metros) ─────────────────────
def lc2(nombre, loc, rot, M, col):
    """LC2 Petit Confort (1928): jaula de tubo cromado que abraza cinco cojines de cuero."""
    w, d, h, r = 0.76, 0.70, 0.67, 0.012
    x0, x1, y0, y1 = -w / 2, w / 2, -d / 2, d / 2
    zb, zt = 0.17, 0.62
    p = [tubo(f"{nombre}_marco_bajo", [(x0, y0, zb), (x1, y0, zb), (x1, y1, zb), (x0, y1, zb), (x0, y0, zb)], r, M["cromo"], col),
         # arriba el marco es una U ABIERTA AL FRENTE (brazos + respaldo): cerrado, su lado delantero cruzaba el
         # asiento a 62 cm (la "barra que atraviesa la silla" que vio Alejandro)
         tubo(f"{nombre}_marco_alto", [(x0, y0, zt), (x0, y1, zt), (x1, y1, zt), (x1, y0, zt)], r, M["cromo"], col)]
    for (x, y) in [(x0, y0), (x1, y0), (x0, y1), (x1, y1)]:
        p.append(tubo(f"{nombre}_pata", [(x, y, 0.0), (x, y, zt)], r, M["cromo"], col))
    ga = 0.13                                   # grueso del cojín de brazo
    p.append(cojin(f"{nombre}_brazo_i", x0 + 0.015, x0 + ga, y0 + 0.015, y1 - 0.015, zb + 0.01, zt - 0.005, M["cognac"], col))
    p.append(cojin(f"{nombre}_brazo_d", x1 - ga, x1 - 0.015, y0 + 0.015, y1 - 0.015, zb + 0.01, zt - 0.005, M["cognac"], col))
    p.append(cojin(f"{nombre}_respaldo", x0 + ga, x1 - ga, y1 - 0.16, y1 - 0.015, zb + 0.01, h, M["cognac"], col))
    p.append(cojin(f"{nombre}_asiento", x0 + ga, x1 - ga, y0 + 0.015, y1 - 0.16, zb + 0.01, 0.41, M["cognac"], col, 0.05))
    return _agrupar(p, nombre, loc, rot, col)


def _perfil_lc4(x):
    """Silueta del colchón de la LC4: cabecera alta, cadera baja, rodillas, pies (x en 0..1.6)."""
    pts = [(0.0, 0.78), (0.12, 0.70), (0.35, 0.52), (0.62, 0.40), (0.85, 0.44),
           (1.08, 0.56), (1.28, 0.55), (1.45, 0.50), (1.60, 0.47)]
    for (xa, za), (xb, zb) in zip(pts, pts[1:]):
        if xa <= x <= xb: return za + (zb - za) * (x - xa) / (xb - xa)
    return pts[-1][1]


def lc4(nombre, loc, rot, M, col):
    """LC4 (1928): cuna de tubo cromado con colchón negro, apoyada sobre base H de acero negro."""
    n, ancho = 32, 0.52
    xs = [1.6 * k / n for k in range(n + 1)]
    p = []
    for lado in (-1, 1):
        y = lado * (ancho / 2 + 0.01)
        p.append(tubo(f"{nombre}_riel", [(x - 0.8, y, _perfil_lc4(x) - 0.045) for x in xs], 0.011, M["cromo"], col))
        p.append(tubo(f"{nombre}_arco", arco((0.0, y, 1.05), 0.78, math.radians(-150), math.radians(-30), 20), 0.012, M["cromo"], col))
        p.append(tubo(f"{nombre}_pie", [(-0.42, y, 0.0), (-0.42, y, 0.30), (0.42, y, 0.30), (0.42, y, 0.0)], 0.02, M["acero_negro"], col))
    p.append(tubo(f"{nombre}_travesano", [(0.0, -0.3, 0.26), (0.0, 0.3, 0.26)], 0.018, M["acero_negro"], col))
    me = bpy.data.meshes.new(f"{nombre}_colchon"); o = bpy.data.objects.new(me.name, me); col.objects.link(o)
    bm = bmesh.new(); prev = None
    for x in xs:
        z = _perfil_lc4(x); x -= 0.8
        fila = [bm.verts.new((x, -ancho / 2, z - 0.03)), bm.verts.new((x, ancho / 2, z - 0.03)),
                bm.verts.new((x, ancho / 2, z + 0.03)), bm.verts.new((x, -ancho / 2, z + 0.03))]
        if prev:
            for i in range(4): bm.faces.new((prev[i], prev[(i + 1) % 4], fila[(i + 1) % 4], fila[i]))
        prev = fila
    bm.to_mesh(me); bm.free()
    o.modifiers.new("suave", "SUBSURF").levels = 2
    for pg in me.polygons: pg.use_smooth = True
    me.materials.append(M["pony"]); p.append(o)                          # la del museo es de piel de pony [S8]
    p.append(cojin(f"{nombre}_almohada", -0.8, -0.62, -0.2, 0.2, 0.70, 0.84, M["cuero_negro"], col, 0.06))
    return _agrupar(p, nombre, loc, rot, col)


def thonet(nombre, loc, rot, M, col):
    """Silla de madera curvada Thonet: la que Le Corbusier ponía en sus comedores."""
    p = [cojin(f"{nombre}_asiento", -0.21, 0.21, -0.21, 0.21, 0.44, 0.465, M["haya"], col, 0.012)]
    for (x, y) in [(-0.17, -0.17), (0.17, -0.17), (-0.15, 0.15), (0.15, 0.15)]:
        p.append(tubo(f"{nombre}_pata", [(x * 1.12, y * 1.12, 0.0), (x, y, 0.44)], 0.013, M["haya"], col))
    p.append(tubo(f"{nombre}_aro", [(-0.18 * 1.1, 0.0, 0.2)] + [(0.18 * 1.1 * math.cos(a), 0.18 * 1.1 * math.sin(a), 0.2)
                                     for a in [math.pi * k / 12 for k in range(12, 37)]], 0.009, M["haya"], col))
    p.append(tubo(f"{nombre}_respaldo", [(-0.15, 0.15, 0.44)] + arco((0.0, 0.17, 0.66), 0.17, math.pi, 0.0, 14, "xz")[1:-1]
                  + [(0.15, 0.15, 0.44)], 0.012, M["haya"], col))
    return _agrupar(p, nombre, loc, rot, col)


def mesa(nombre, loc, rot, M, col, largo=2.1, fondo=0.82):
    """Mesa de comedor: tablero de nogal sobre caballetes de tubo negro (la LC6 es de esta familia)."""
    # LC6 del museo [S8 28–30]: tablero de VIDRIO grueso sobre base de acero negro
    p = [cojin(f"{nombre}_tablero", -largo / 2, largo / 2, -fondo / 2, fondo / 2, 0.71, 0.73, M["vidrio_mesa"], col, 0.003)]
    for x in (-largo / 2 + 0.25, largo / 2 - 0.25):
        p.append(tubo(f"{nombre}_caballete", [(x, -fondo / 2 + 0.08, 0.0), (x, -fondo / 2 + 0.08, 0.70),
                                               (x, fondo / 2 - 0.08, 0.70), (x, fondo / 2 - 0.08, 0.0)], 0.016, M["acero_negro"], col))
    p.append(tubo(f"{nombre}_viga", [(-largo / 2 + 0.25, 0.0, 0.62), (largo / 2 - 0.25, 0.0, 0.62)], 0.014, M["acero_negro"], col))
    return _agrupar(p, nombre, loc, rot, col)


def mesa_baja(nombre, loc, rot, M, col):
    p = [cojin(f"{nombre}_tablero", -0.5, 0.5, -0.35, 0.35, 0.36, 0.38, M["nogal"], col, 0.004)]
    for (x, y) in [(-0.45, -0.3), (0.45, -0.3), (-0.45, 0.3), (0.45, 0.3)]:
        p.append(tubo(f"{nombre}_pata", [(x, y, 0.0), (x, y, 0.36)], 0.011, M["cromo"], col))
    return _agrupar(p, nombre, loc, rot, col)


# ── el salón, amoblado con la densidad de las fotos (baja) ────────────────
def salon(Y_LOSA, Y_TECHO, D, M, col):
    """SALLE: X −4.79…+9.50, Y +4.78…+10.63 (PLANTA.md §2). Abre a la terraza en Y=+4.78."""
    z = Y_LOSA
    # muebles con detalle (villa_muebles.py, 29-sep): tapizado, vivo, arrugas, lana, LC6 de catálogo, esterilla
    import villa_muebles as vm
    vm.arrugas(M["cognac"]); vm.arrugas(M["cuero_negro"])
    vm.alfombra("mu_alfombra", 2.3, 5.9, 6.3, 9.0, z + 0.012, col)          # sobre la baldosa (z+0.012)
    vm.lc2("mu_lc2_a", (3.1, 7.65, z), math.radians(-90), M, col)
    vm.lc2("mu_lc2_b", (5.1, 7.65, z), math.radians(90), M, col)
    vm.mesa_baja("mu_mesa_baja", (4.1, 7.65, z + 0.03), 0, M, col)           # apoyada sobre la alfombra
    lc4("mu_lc4", (7.6, 6.2, z), math.radians(-18), M, col)
    vm.lc6("mu_comedor", (-2.2, 8.4, z), 0, M, col)
    for n, (x, y, r) in enumerate([(-2.8, 7.75, 0), (-1.6, 7.75, 0), (-2.8, 9.05, math.pi), (-1.6, 9.05, math.pi)]):
        vm.thonet(f"mu_thonet_{n}", (x, y, z), r, M, col)
    # #3 + #9 + #34 (30-sep): chimenea y mesón (una pieza) y radiadores blancos/oscuro — ver villa_salon.py
    import villa_salon
    import villa_cubierta; villa_cubierta.construir(Y_TECHO + 0.21, col)   # #21 + #55 (después de villa_plantas)
    villa_salon.chimenea_y_meson(z, col); villa_salon.radiadores(z, col); villa_salon.vigas(Y_TECHO - 0.01, col)
    import villa_cuartos
    villa_cuartos.muebles_bajo_ventana(z, col)                         # #32: dormitorios, bajo la cinta
    # LUMINARIA: tubo lineal suspendido de varillas que corre a lo largo del salón [S3 "en forme de gouttière";
    # S8 28–30]. Los globos de antes estaban MAL (nivel-1-principal.md). Canaleta metálica abierta arriba (luz
    # indirecta al cielo raso) con el tubo emisor adentro. Largo y posición = lectura de las fotos (interpretación).
    yl, zl, x0l, x1l = 7.9, Y_TECHO - 0.45, -3.8, 8.6
    cojin("mu_canaleta", x0l, x1l, yl - 0.07, yl + 0.07, zl - 0.06, zl, M["canaleta"], col, 0.004)
    cojin("mu_canaleta_luz", x0l + 0.05, x1l - 0.05, yl - 0.05, yl + 0.05, zl - 0.005, zl + 0.004, M["luz_calida"], col, 0.002)
    for n, x in enumerate([x0l + 0.4, (x0l + x1l) / 2, x1l - 0.4]):
        tubo(f"mu_canaleta_vara_{n}", [(x, yl, zl), (x, yl, Y_TECHO)], 0.005, M["acero_negro"], col)


def terraza(Y_LOSA, M, col):
    """TERRASSE: jardineras de hormigón blanco empotradas con arbustos bajos tipo lavanda + la mesa fija."""
    z = Y_LOSA
    # 30-sep: FUERA los tres tramos largos de jardinera contra los muros (mu_jardinera_*). Ninguna foto los muestra:
    # en S9 8, 13 y 17 la terraza tiene UNA jardinera (la U del DWG, villa_obra) y la mesa. Eran interpretación mía;
    # los quitó Alejandro al verlo.
    mesa_terraza(z, M, col)
    jardinera_vidriera(z, M, col)


def jardinera_vidriera(z, M, col, x=(2.90, 5.90), y=(3.62, 4.55), alto=0.40, e=0.10):
    """#20 + #52 (30-sep): jardinera baja al pie de la vidriera del salón, del lado de la terraza, con plantas en los
    extremos y una CLARABOYA vidriada inclinada al centro [e08, e11, e13, e14, e20, e32, i57]. Largo y posición =
    lectura de foto (INTERPRETACIÓN ±0,3 m); pegada al marco de la vidriera."""
    import villa_obra, villa_plantas as vp
    x0, x1 = x; y0, y1 = y; h = z + alto
    blanco = M["hormigon_claro"]
    piezas = [villa_obra._prisma(f"mu_jard_vid_{n}", pol, z, h, blanco, col) for n, pol in enumerate([
        [(x0, y0), (x1, y0), (x1, y0 + e), (x0, y0 + e)], [(x0, y1 - e), (x1, y1 - e), (x1, y1), (x0, y1)],
        [(x0, y0), (x0 + e, y0), (x0 + e, y1), (x0, y1)], [(x1 - e, y0), (x1, y0), (x1, y1), (x1 - e, y1)]])]
    villa_obra.unir(piezas)
    xc = (x0 + x1) / 2; ancho_c = 1.10
    for n, (a, b) in enumerate([(x0 + e, xc - ancho_c / 2), (xc + ancho_c / 2, x1 - e)]):      # tierra a los lados
        cojin(f"mu_jard_vid_tierra_{n}", a, b, y0 + e, y1 - e, h - 0.10, h - 0.04, M["tierra"], col, 0.002)
    # claraboya: caja de marco oscuro con vidrio inclinado (baja hacia la terraza)
    oscuro = bpy.data.materials.get("pb_montante"); vidrio = bpy.data.materials.get("vidrio")
    ca, cb = xc - ancho_c / 2, xc + ancho_c / 2
    villa_obra._prisma("mu_jard_vid_brocal", [(ca, y0 + e), (cb, y0 + e), (cb, y1 - e), (ca, y1 - e)], h - 0.10, h + 0.02, blanco, col)
    import bmesh
    me = bpy.data.meshes.new("mu_jard_vid_claraboya"); bm = bmesh.new()
    alto_f, alto_t = h + 0.22, h + 0.06                                # fondo (vidriera) más alto que el frente
    vs = [bm.verts.new(v) for v in ((ca, y1 - e, alto_f), (cb, y1 - e, alto_f), (cb, y0 + e, alto_t), (ca, y0 + e, alto_t))]
    bm.faces.new(vs); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(me.name, me); col.objects.link(o); me.materials.append(vidrio)
    so = o.modifiers.new("grosor", "SOLIDIFY"); so.thickness = 0.012
    for n, (a, b, yy) in enumerate([(ca, cb, y1 - e), (ca, cb, y0 + e)]):
        zz = alto_f if yy == y1 - e else alto_t
        cojin(f"mu_jard_vid_claraboya_marco_{n}", a, b, yy - 0.03, yy + 0.03, h, zz + 0.02, oscuro, col, 0.002)
    for n, (a, zf) in enumerate([(ca, 0), (cb, 0)]):
        villa_obra._prisma(f"mu_jard_vid_claraboya_lado_{n}", [(a - 0.02, y0 + e), (a + 0.02, y0 + e), (a + 0.02, y1 - e), (a - 0.02, y1 - e)],
                           h, h + 0.12, oscuro, col)
    t = h - 0.04
    vp.arbusto("mu_planta_vid_a", (x0 + 0.55, (y0 + y1) / 2, t), 0.36, 0.45, col, semilla=11, densidad=70)
    vp.matas("mu_planta_vid_pasto_a", (x0 + 0.45, (y0 + y1) / 2, t), 0.30, col, semilla=12, n=7, escala=(1.0, 1.5))
    vp.arbusto("mu_planta_vid_b", (x1 - 0.55, (y0 + y1) / 2, t), 0.34, 0.42, col, semilla=13, densidad=70)
    vp.flores("mu_planta_vid_flor", (x1 - 0.50, (y0 + y1) / 2, t), 0.30, col, semilla=14, n=6)


def mesa_terraza(z, M, col):
    """La mesa de la terraza [S9 13, 19, 29, 30]: tablero delgado de concreto blanco (~2,2 × 0,65 × 0,06) sobre 4 patas
    delgadas, largo paralelo al muro del vano. Posición = lectura de las fotos (INTERPRETACIÓN, ±0,5 m)."""
    x0, x1, y0, y1, h = 7.35, 8.0, -2.3, -0.1, 0.72
    cojin("mu_mesa_terraza", x0, x1, y0, y1, z + h - 0.06, z + h, M["hormigon_claro"], col, 0.008)
    for (x, y) in [(x0 + 0.08, y0 + 0.12), (x1 - 0.08, y0 + 0.12), (x0 + 0.08, y1 - 0.12), (x1 - 0.08, y1 - 0.12)]:
        tubo("mu_mesa_terraza_pata", [(x, y, z), (x, y, z + h - 0.06)], 0.014, M["acero_negro"], col)
    # tierra y matas dentro de la jardinera en U del DWG (x 2,75…4,75 · z −4,6…−2,55)
    cojin("mu_tierra_jardinera", 2.76, 4.74, -4.59, -2.56, z + 0.30, z + 0.40, M["tierra"], col, 0.002)
    # plantas REALES (villa_plantas, Poly Haven CC0) en vez de esferas con ruido [#13; S9 8: arbustos redondeados
    # de hoja verde, una mata de pasto y algo de flor]. Qué va en cada extremo = interpretación de la foto.
    import villa_plantas as vp
    t = z + 0.40
    vp.arbusto("mu_planta_arbusto_a", (3.25, -3.95, t), 0.46, 0.65, col, semilla=1, densidad=85)
    vp.arbusto("mu_planta_arbusto_b", (4.20, -3.05, t), 0.40, 0.55, col, semilla=2, densidad=85)
    vp.matas("mu_planta_pasto", (4.25, -4.15, t), 0.30, col, semilla=3, n=9, escala=(1.2, 1.8))
    vp.flores("mu_planta_flor", (3.20, -2.95, t), 0.32, col, semilla=4, n=8)
    # cubresuelo: en la foto casi no se ve tierra entre las plantas
    vp.matas("mu_planta_pasto_borde", (3.75, -3.50, t), 0.85, col, semilla=5, n=22, escala=(0.9, 1.4))
    vp.flores("mu_planta_flor_borde", (3.75, -3.50, t), 0.85, col, semilla=6, n=10)


def pasto(W, D, col, radio=58.0, cortes=150):        # 58 m: pasa la órbita de la cámara (~50 m)
    """Pelo de partículas sobre un disco de pradera. La foto de pasto queda DEBAJO como suelo:
    las hebras le dan volumen y sombra propia, que es lo que el ojo lee como textura a ras."""
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=cortes, y_subdivisions=cortes, size=radio * 2, location=(0, 0, 0.002))
    o = bpy.context.object; o.name = "pasto_hebras"
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o)
    vg = o.vertex_groups.new(name="densidad")
    gx0, gx1, gy0, gy1 = -W / 2 - 1.5, W / 2 + 1.5, -D / 2 - 1.5, D / 2 + 1.5
    for v in o.data.vertices:
        x, y = v.co.x, v.co.y
        en_huella = gx0 < x < gx1 and gy0 < y < gy1
        en_camino = -1.9 < x < 1.9 and y < gy0 + 0.3
        rr = math.hypot(x, y)
        w = 0.0 if (en_huella or en_camino or rr > radio) else min(1.0, (radio - rr) / 6.0)
        vg.add([v.index], w, "REPLACE")

    m = bpy.data.materials.new("pasto_hebra"); m.use_nodes = True; nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    info = nt.nodes.new("ShaderNodeHairInfo")
    rampa = nt.nodes.new("ShaderNodeValToRGB")
    rampa.color_ramp.elements[0].color = (0.025, 0.05, 0.012, 1)     # raíz en sombra
    rampa.color_ramp.elements[1].color = (0.20, 0.30, 0.07, 1)       # punta al sol
    nt.links.new(info.outputs["Intercept"], rampa.inputs["Fac"])
    varia = nt.nodes.new("ShaderNodeMix"); varia.data_type = "RGBA"; varia.blend_type = "MULTIPLY"
    varia.inputs["Factor"].default_value = 0.35
    nt.links.new(rampa.outputs["Color"], varia.inputs["A"])
    ruido = nt.nodes.new("ShaderNodeTexNoise"); ruido.inputs["Scale"].default_value = 0.35
    nt.links.new(ruido.outputs["Color"], varia.inputs["B"])
    nt.links.new(varia.outputs["Result"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.55
    b.inputs["Subsurface Weight"].default_value = 0.15
    o.data.materials.append(m)

    o.modifiers.new("pasto", "PARTICLE_SYSTEM")
    ps = o.particle_systems[-1]; st = ps.settings
    ps.vertex_group_density = "densidad"
    # 27-sep: 260k × 14 hijos (3,6 M hebras) tumbó el Mac de Alejandro (8 GB compartidos con la GPU).
    # Tope ~500k hebras; se sube solo con VILLA_PASTO_N y mirando la memoria.
    st.type = "HAIR"; st.count = int(os.environ.get("VILLA_PASTO_N", "110000")); st.hair_length = 0.11
    st.use_advanced_hair = True; st.emit_from = "FACE"; st.distribution = "RAND"
    o.show_instancer_for_render = False          # el disco emisor no se renderiza, solo sus hebras
    st.normal_factor = 0.10; st.factor_random = 0.035     # con pelo avanzado el LARGO sale de aquí (1.0 = hebras de 1 m), no de hair_length
    st.render_type = "PATH"; st.display_step = 2; st.render_step = 3
    st.child_type = "INTERPOLATED"; st.child_percent = 0; st.rendered_child_count = 8
    st.child_length_threshold = 0.45; st.child_length = 1.0
    st.roughness_1 = 0.05; st.roughness_endpoint = 0.06; st.roughness_2 = 0.03; st.roughness_2_size = 0.5
    st.clump_factor = 0.15
    st.root_radius = 1.0; st.tip_radius = 0.05; st.radius_scale = 0.006; st.use_close_tip = True
    st.material_slot = "pasto_hebra"
    return o


# ── pisos: dos baldosas en el salón y losas grandes en la terraza (PLANTA.md "MATERIA Y COLOR") ──
def _baldosa(nombre, c1, c2, junta, lado, rough):
    m = bpy.data.materials.new(nombre); m.use_nodes = True; nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    lad = nt.nodes.new("ShaderNodeTexBrick"); lad.offset = 0.0; lad.squash = 1.0
    lad.inputs["Scale"].default_value = 1.0
    lad.inputs["Brick Width"].default_value = lado; lad.inputs["Row Height"].default_value = lado
    lad.inputs["Mortar Size"].default_value = 0.004 if lado < 0.5 else 0.008
    lad.inputs["Color1"].default_value = (*c1, 1); lad.inputs["Color2"].default_value = (*c2, 1)
    lad.inputs["Mortar"].default_value = (*junta, 1)
    nt.links.new(tc.outputs["Object"], lad.inputs["Vector"])
    nt.links.new(lad.outputs["Color"], b.inputs["Base Color"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.25; bp.invert = True
    nt.links.new(lad.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = rough
    return m


def pisos(Y_LOSA, col):
    z = Y_LOSA + 0.002
    ocre = _baldosa("mu_baldosa_ocre", (0.56, 0.42, 0.27), (0.50, 0.37, 0.24), (0.30, 0.26, 0.21), 0.2, 0.32)
    cafe = _baldosa("mu_baldosa_cafe", (0.16, 0.08, 0.045), (0.13, 0.065, 0.04), (0.10, 0.08, 0.06), 0.2, 0.28)
    losa = _baldosa("mu_losa_terraza", (0.58, 0.56, 0.52), (0.52, 0.50, 0.47), (0.30, 0.29, 0.27), 0.9, 0.85)
    cojin("mu_piso_salon", -4.79, 9.5, 5.45, 10.4, z, z + 0.01, ocre, col, 0.001)
    cojin("mu_piso_umbral", -4.79, 9.5, 4.75, 5.45, z, z + 0.01, cafe, col, 0.001)
    # 30-sep: arrancaba en x 0,18 (1,1 m DENTRO del pozo de la rampa, encimada al piso del hall). El recinto real:
    # del muro del pozo (x 1,40) a la cara interior de la fachada (9,30), del muro del kiosque (−4,60) a la vidriera.
    # piso de concreto gris con junta de pasto: lo pinta villa_acabados.losetas_arriba sobre el material blanco (#11)
    cojin("mu_piso_terraza", 1.40, 9.30, -4.60, 4.65, z, z + 0.01, bpy.data.materials.get("blanco") or losa, col, 0.001)


def detallar(W, D, Y_LOSA, Y_TECHO):
    col = _col("detalle")
    M = materiales()
    pisos(Y_LOSA, col)
    salon(Y_LOSA, Y_TECHO, D, M, col)
    terraza(Y_LOSA, M, col)
    if os.environ.get("VILLA_PASTO_N", "420000") != "0":
        if os.environ.get("VILLA_PASTO_MODO") == "pelo": pasto(W, D, col)      # el de antes (hebras), por si acaso
        else:
            import villa_pasto; villa_pasto.pradera(W, D, col)                 # matas instanciadas (28-sep)
    return M
