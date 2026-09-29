"""
Muebles con detalle (fase 4, 29-sep-2026). Alejandro: "se le pueden poner más detalles a las sillas, la alfombra, la
mesa". Lo que delataba que eran de maqueta:
  · cojines = cajas biseladas → ahora TAPIZADO: caras abombadas, asiento con el hundido del uso, vivo (cordón de
    costura) en el canto, y el cuero con arrugas suaves además del poro
  · alfombra = una lámina → ahora lana de bucle con fibra, borde ribeteado y una ondulación mínima (no está planchada)
  · LC6 = caballetes de tubo → base como la del catálogo: patas de sección ovalada ("ala de avión"), travesaño,
    niveladores; tablero de vidrio de 19 mm con canto verde y topes transparentes
  · mesa baja: nogal con veta y patas con regatón
  · Thonet: asiento redondo de rejilla (esterilla) tejida, madera curvada con veta
La alfombra y la mesa baja NO tienen evidencia en las fotos: son del amoblado anterior (interpretación).
"""
import bpy, bmesh, math


# ── materiales ─────────────────────────────────────────────────────────────────────────────────────────────
def _mat(nombre, rgb, rough, metal=0.0):
    m = bpy.data.materials.get(nombre) or bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m, b


def madera(nombre, c1, c2, escala=6.0, rough=0.4):
    """Veta: bandas de una textura de ondas deformada por ruido, en coordenadas del objeto (sigue a la pieza)."""
    m, b = _mat(nombre, c1, rough); nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    onda = nt.nodes.new("ShaderNodeTexWave"); onda.wave_type = "BANDS"; onda.bands_direction = "X"
    onda.inputs["Scale"].default_value = escala; onda.inputs["Distortion"].default_value = 7.0
    onda.inputs["Detail"].default_value = 3.0; onda.inputs["Detail Scale"].default_value = 2.0
    nt.links.new(tc.outputs["Object"], onda.inputs["Vector"])
    rampa = nt.nodes.new("ShaderNodeValToRGB")
    rampa.color_ramp.elements[0].color = (*c1, 1); rampa.color_ramp.elements[1].color = (*c2, 1)
    nt.links.new(onda.outputs["Fac"], rampa.inputs["Fac"]); nt.links.new(rampa.outputs["Color"], b.inputs["Base Color"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.04
    nt.links.new(onda.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Coat Weight"].default_value = 0.15                          # barniz
    return m


def lana(nombre, rgb):
    """Lana de bucle: fibra fina (bump de alta frecuencia), trama cruzada y variación de tono; borde ribeteado."""
    m, b = _mat(nombre, rgb, 0.95); nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    trama = []
    for giro in (0.0, math.pi / 2):
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, giro)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        o = nt.nodes.new("ShaderNodeTexWave"); o.inputs["Scale"].default_value = 70.0; o.inputs["Distortion"].default_value = 2.5
        nt.links.new(mp.outputs["Vector"], o.inputs["Vector"]); trama.append(o)
    suma = nt.nodes.new("ShaderNodeMath"); suma.operation = "MULTIPLY"
    nt.links.new(trama[0].outputs["Fac"], suma.inputs[0]); nt.links.new(trama[1].outputs["Fac"], suma.inputs[1])
    fibra = nt.nodes.new("ShaderNodeTexNoise"); fibra.inputs["Scale"].default_value = 900.0; fibra.inputs["Detail"].default_value = 8.0
    nt.links.new(tc.outputs["Object"], fibra.inputs["Vector"])
    mezcla = nt.nodes.new("ShaderNodeMath"); mezcla.operation = "ADD"
    nt.links.new(suma.outputs[0], mezcla.inputs[0]); nt.links.new(fibra.outputs["Fac"], mezcla.inputs[1])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.7
    nt.links.new(mezcla.outputs[0], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    tono = nt.nodes.new("ShaderNodeTexNoise"); tono.inputs["Scale"].default_value = 3.0
    mp_t = nt.nodes.new("ShaderNodeMapping"); mp_t.inputs["Scale"].default_value = (1.0, 10.0, 1.0)   # el pelo "peinado"
    nt.links.new(tc.outputs["Object"], mp_t.inputs["Vector"]); nt.links.new(mp_t.outputs["Vector"], tono.inputs["Vector"])
    tr = nt.nodes.new("ShaderNodeMapRange"); tr.inputs["To Min"].default_value = 0.8; tr.inputs["To Max"].default_value = 1.1
    nt.links.new(tono.outputs["Fac"], tr.inputs["Value"])
    fr = nt.nodes.new("ShaderNodeMapRange"); fr.inputs["To Min"].default_value = 0.78; fr.inputs["To Max"].default_value = 1.0
    nt.links.new(mezcla.outputs[0], fr.inputs["Value"])
    k = nt.nodes.new("ShaderNodeMath"); k.operation = "MULTIPLY"
    nt.links.new(tr.outputs["Result"], k.inputs[0]); nt.links.new(fr.outputs["Result"], k.inputs[1])
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
    mul.inputs[6].default_value = (*rgb, 1); nt.links.new(k.outputs[0], mul.inputs[7])
    nt.links.new(mul.outputs[2], b.inputs["Base Color"])
    b.inputs["Sheen Weight"].default_value = 0.15                         # con 0,6 lavaba el color: la alfombra se leía como espuma
    return m


def rejilla_tejida(nombre):
    """Esterilla de caña (asiento Thonet): dos tramas a ±45° y los huecos octogonales oscuros."""
    m, b = _mat(nombre, (0.62, 0.47, 0.25), 0.55); nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    ondas = []
    for giro in (math.pi / 4, -math.pi / 4):
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, giro)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        o = nt.nodes.new("ShaderNodeTexWave"); o.inputs["Scale"].default_value = 90.0
        nt.links.new(mp.outputs["Vector"], o.inputs["Vector"]); ondas.append(o)
    mx = nt.nodes.new("ShaderNodeMath"); mx.operation = "MAXIMUM"
    nt.links.new(ondas[0].outputs["Fac"], mx.inputs[0]); nt.links.new(ondas[1].outputs["Fac"], mx.inputs[1])
    rampa = nt.nodes.new("ShaderNodeValToRGB")
    rampa.color_ramp.elements[0].position = 0.45; rampa.color_ramp.elements[0].color = (0.05, 0.035, 0.02, 1)
    rampa.color_ramp.elements[1].position = 0.6; rampa.color_ramp.elements[1].color = (0.62, 0.47, 0.25, 1)
    nt.links.new(mx.outputs[0], rampa.inputs["Fac"]); nt.links.new(rampa.outputs["Color"], b.inputs["Base Color"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.5
    nt.links.new(mx.outputs[0], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def vidrio_grueso(nombre):
    """Como el vidrio de la casa: los rayos de sombra lo atraviesan. Sin eso el tablero proyectaba sombra negra
    completa y se leía como una lámina negra (render del comedor, 29-sep)."""
    m, b = _mat(nombre, (0.80, 0.92, 0.86), 0.01)                          # el verde del canto: vidrio flotado
    b.inputs["Transmission Weight"].default_value = 1.0; b.inputs["IOR"].default_value = 1.52
    nt = m.node_tree; sal = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    lp = nt.nodes.new("ShaderNodeLightPath"); tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    tr.inputs["Color"].default_value = (0.92, 0.97, 0.94, 1)
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Shadow Ray"], mx.inputs["Fac"]); nt.links.new(b.outputs["BSDF"], mx.inputs[1])
    nt.links.new(tr.outputs["BSDF"], mx.inputs[2]); nt.links.new(mx.outputs["Shader"], sal.inputs["Surface"])
    return m


def arrugas(material):
    """Al cuero existente le suma arrugas suaves y alargadas (el uso), además del poro que ya tiene."""
    nt = material.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    if not b.inputs["Normal"].is_linked: return
    poro = b.inputs["Normal"].links[0].from_socket
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1.0, 5.0, 1.0); nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    ar = nt.nodes.new("ShaderNodeTexNoise"); ar.inputs["Scale"].default_value = 9.0; ar.inputs["Detail"].default_value = 4.0
    ar.inputs["Distortion"].default_value = 0.6; nt.links.new(mp.outputs["Vector"], ar.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.12
    nt.links.new(ar.outputs["Fac"], bp.inputs["Height"]); nt.links.new(poro, bp.inputs["Normal"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])


# ── piezas ─────────────────────────────────────────────────────────────────────────────────────────────────
def tapizado(nombre, x0, x1, y0, y1, z0, z1, material, col, abombado=0.014, hundido=0.0, vivo=True, cortes=7):
    """Cojín tapizado: caja subdividida con cada cara abombada hacia afuera (máximo al centro, cero en las aristas),
    hundido opcional arriba (el asiento usado) y suavizado; el vivo es un cordón fino en el canto de arriba."""
    me = bpy.data.meshes.new(nombre); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cortes, use_grid_fill=True)
    cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2
    hx, hy, hz = (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2
    for v in bm.verts:
        u, w, t = v.co.x, v.co.y, v.co.z                                    # en −1…1
        dx = (1 - w * w) * (1 - t * t) * abombado * (1 if u > 0 else -1) if abs(u) > 0.999 else 0.0
        dy = (1 - u * u) * (1 - t * t) * abombado * (1 if w > 0 else -1) if abs(w) > 0.999 else 0.0
        dz = (1 - u * u) * (1 - w * w) * abombado * (1 if t > 0 else -1) if abs(t) > 0.999 else 0.0
        if t > 0.999: dz -= hundido * (1 - u * u) * (1 - w * w)
        v.co = (cx + u * hx + dx, cy + w * hy + dy, cz + t * hz + dz)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); col.objects.link(o)
    o.modifiers.new("suave", "SUBSURF").levels = 2
    for p in me.polygons: p.use_smooth = True
    me.materials.append(material)
    piezas = [o]
    if vivo:
        r = 0.018; ins = 0.004; zv = z1 - 0.008
        pts = []
        for (ax, ay, a0) in ((x1 - r - ins, y1 - r - ins, 0), (x0 + r + ins, y1 - r - ins, 90), (x0 + r + ins, y0 + r + ins, 180), (x1 - r - ins, y0 + r + ins, 270)):
            for k in range(5):
                a = math.radians(a0 + 90 * k / 4); pts.append((ax + r * math.cos(a), ay + r * math.sin(a), zv))
        pts.append(pts[0])
        piezas.append(_tubo(f"{nombre}_vivo", pts, 0.004, material, col))
    return piezas


def _tubo(nombre, puntos, radio, material, col):
    cu = bpy.data.curves.new(nombre, "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = radio; cu.bevel_resolution = 2
    sp = cu.splines.new("POLY"); sp.points.add(len(puntos) - 1)
    for p, q in zip(sp.points, puntos): p.co = (*q, 1)
    o = bpy.data.objects.new(nombre, cu); col.objects.link(o); cu.materials.append(material); return o


def _caja_redonda(nombre, x0, x1, y0, y1, z0, z1, material, col, r=0.01):
    me = bpy.data.meshes.new(nombre); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = ((x0 + x1) / 2 + v.co.x * (x1 - x0), (y0 + y1) / 2 + v.co.y * (y1 - y0), (z0 + z1) / 2 + v.co.z * (z1 - z0))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); col.objects.link(o)
    bv = o.modifiers.new("canto", "BEVEL"); bv.width = r; bv.segments = 4; bv.limit_method = "ANGLE"
    bv.harden_normals = True          # sin esto el suavizado inclinaba las normales de las caras grandes: el vidrio
    for p in me.polygons: p.use_smooth = True   # refractaba mal y se veía NEGRO (aislado 29-sep ocultando el tablero)
    me.materials.append(material); return o


def _agrupar(objs, nombre, loc, rot_z, col):
    ve = bpy.data.objects.new(nombre, None); col.objects.link(ve)
    for o in objs: o.parent = ve
    ve.location = loc; ve.rotation_euler = (0, 0, rot_z); return ve


# ── muebles ────────────────────────────────────────────────────────────────────────────────────────────────
def lc2(nombre, loc, rot, M, col):
    """LC2 Petit Confort: jaula de tubo cromado (abajo cerrada, arriba U abierta al frente) y cinco cojines tapizados."""
    w, d, h, r = 0.76, 0.70, 0.67, 0.012
    x0, x1, y0, y1 = -w / 2, w / 2, -d / 2, d / 2
    zb, zt = 0.17, 0.62
    p = [_tubo(f"{nombre}_marco_bajo", [(x0, y0, zb), (x1, y0, zb), (x1, y1, zb), (x0, y1, zb), (x0, y0, zb)], r, M["cromo"], col),
         _tubo(f"{nombre}_marco_alto", [(x0, y0, zt), (x0, y1, zt), (x1, y1, zt), (x1, y0, zt)], r, M["cromo"], col)]
    for (x, y) in [(x0, y0), (x1, y0), (x0, y1), (x1, y1)]:
        p.append(_tubo(f"{nombre}_pata", [(x, y, 0.0), (x, y, zt)], r, M["cromo"], col))
        p.append(_caja_redonda(f"{nombre}_regaton", x - 0.013, x + 0.013, y - 0.013, y + 0.013, -0.001, 0.012, M["acero_negro"], col, 0.004))
    for yy in (y0 + 0.2, y1 - 0.2):                                         # flejes que sostienen el asiento
        p.append(_tubo(f"{nombre}_fleje", [(x0, yy, zb), (x1, yy, zb)], 0.006, M["cromo"], col))
    ga = 0.13
    p += tapizado(f"{nombre}_brazo_i", x0 + 0.015, x0 + ga, y0 + 0.015, y1 - 0.015, zb + 0.012, zt - 0.006, M["cognac"], col, 0.010)
    p += tapizado(f"{nombre}_brazo_d", x1 - ga, x1 - 0.015, y0 + 0.015, y1 - 0.015, zb + 0.012, zt - 0.006, M["cognac"], col, 0.010)
    p += tapizado(f"{nombre}_respaldo", x0 + ga, x1 - ga, y1 - 0.16, y1 - 0.015, zb + 0.012, h, M["cognac"], col, 0.012)
    p += tapizado(f"{nombre}_asiento", x0 + ga, x1 - ga, y0 + 0.015, y1 - 0.16, zb + 0.012, 0.42, M["cognac"], col, 0.016, hundido=0.022)
    return _agrupar(p, nombre, loc, rot, col)


def lc6(nombre, loc, rot, M, col, largo=2.25, fondo=0.855):
    """LC6: vidrio de 19 mm sobre una base de acero negro con patas de sección ovalada, travesaño y niveladores."""
    vid = vidrio_grueso("mu_vidrio_lc6")
    zt = 0.71
    p = [_caja_redonda(f"{nombre}_tablero", -largo / 2, largo / 2, -fondo / 2, fondo / 2, zt + 0.004, zt + 0.023, vid, col, 0.003)]
    for x in (-largo / 2 + 0.28, largo / 2 - 0.28):
        for y in (-fondo / 2 + 0.07, fondo / 2 - 0.07):
            p.append(_caja_redonda(f"{nombre}_pata", x - 0.03, x + 0.03, y - 0.012, y + 0.012, 0.018, zt - 0.03, M["acero_negro"], col, 0.011))
            p.append(_caja_redonda(f"{nombre}_nivelador", x - 0.018, x + 0.018, y - 0.018, y + 0.018, 0.0, 0.018, M["acero_negro"], col, 0.006))
            p.append(_caja_redonda(f"{nombre}_tope", x - 0.012, x + 0.012, y - 0.012, y + 0.012, zt - 0.002, zt + 0.004, vid, col, 0.004))
        p.append(_caja_redonda(f"{nombre}_cabezal", x - 0.03, x + 0.03, -fondo / 2 + 0.05, fondo / 2 - 0.05, zt - 0.05, zt - 0.02, M["acero_negro"], col, 0.01))
    p.append(_caja_redonda(f"{nombre}_travesano", -largo / 2 + 0.28, largo / 2 - 0.28, -0.02, 0.02, zt - 0.09, zt - 0.05, M["acero_negro"], col, 0.012))
    return _agrupar(p, nombre, loc, rot, col)


def mesa_baja(nombre, loc, rot, M, col):
    nogal = madera("mu_nogal_veta", (0.12, 0.065, 0.035), (0.06, 0.03, 0.015), 5.0)
    p = [_caja_redonda(f"{nombre}_tablero", -0.5, 0.5, -0.35, 0.35, 0.355, 0.38, nogal, col, 0.005)]
    for (x, y) in [(-0.45, -0.3), (0.45, -0.3), (-0.45, 0.3), (0.45, 0.3)]:
        p.append(_tubo(f"{nombre}_pata", [(x, y, 0.012), (x, y, 0.355)], 0.011, M["cromo"], col))
        p.append(_caja_redonda(f"{nombre}_regaton", x - 0.012, x + 0.012, y - 0.012, y + 0.012, 0.0, 0.012, M["acero_negro"], col, 0.004))
    return _agrupar(p, nombre, loc, rot, col)


def thonet(nombre, loc, rot, M, col):
    """Thonet de madera curvada con asiento REDONDO de esterilla, como las que Le Corbusier ponía en sus comedores."""
    haya = madera("mu_haya_veta", (0.26, 0.13, 0.055), (0.18, 0.085, 0.035), 14.0)
    cana = rejilla_tejida("mu_esterilla")
    p = []
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.205, depth=0.012, location=(0, 0, 0.452))
    asiento = bpy.context.object; asiento.name = f"{nombre}_esterilla"
    for c in asiento.users_collection: c.objects.unlink(asiento)
    col.objects.link(asiento); asiento.data.materials.append(cana); p.append(asiento)
    aro = [(0.215 * math.cos(a), 0.215 * math.sin(a), 0.452) for a in [2 * math.pi * k / 48 for k in range(49)]]
    p.append(_tubo(f"{nombre}_aro_asiento", aro, 0.016, haya, col))
    for (x, y) in [(-0.16, -0.16), (0.16, -0.16), (-0.14, 0.14), (0.14, 0.14)]:
        p.append(_tubo(f"{nombre}_pata", [(x * 1.14, y * 1.14, 0.0), (x * 1.06, y * 1.06, 0.22), (x, y, 0.44)], 0.013, haya, col))
    p.append(_tubo(f"{nombre}_aro", [(0.2 * math.cos(a), 0.2 * math.sin(a), 0.2) for a in [2 * math.pi * k / 40 for k in range(41)]], 0.009, haya, col))
    resp = [(-0.15, 0.15, 0.45)] + [(0.17 * math.cos(a), 0.17 + 0.03 * math.sin(a), 0.66 + 0.17 * math.sin(a))
                                     for a in [math.pi * (1 - k / 16) for k in range(1, 16)]] + [(0.15, 0.15, 0.45)]
    p.append(_tubo(f"{nombre}_respaldo", resp, 0.012, haya, col))
    return _agrupar(p, nombre, loc, rot, col)


def alfombra(nombre, x0, x1, y0, y1, z, col, rgb=(0.62, 0.57, 0.48)):
    """Lana de 12 mm con ribete: la pieza central y el borde son dos cuerpos del mismo alto con tonos distintos; una
    ondulación mínima (±2 mm) para que no parezca planchada."""
    m = lana("mu_lana_bucle", rgb); rib = lana("mu_lana_ribete", tuple(c * 0.45 for c in rgb))           # ribete que se lea
    p = []
    for nm, mat, (a0, a1, b0, b1) in (("centro", m, (x0 + 0.05, x1 - 0.05, y0 + 0.05, y1 - 0.05)),
                                      ("ribete_n", rib, (x0, x1, y1 - 0.05, y1)), ("ribete_s", rib, (x0, x1, y0, y0 + 0.05)),
                                      ("ribete_e", rib, (x1 - 0.05, x1, y0 + 0.05, y1 - 0.05)), ("ribete_o", rib, (x0, x0 + 0.05, y0 + 0.05, y1 - 0.05))):
        me = bpy.data.meshes.new(f"{nombre}_{nm}"); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=12, use_grid_fill=True)
        for v in bm.verts:
            x = (a0 + a1) / 2 + v.co.x * (a1 - a0); y = (b0 + b1) / 2 + v.co.y * (b1 - b0)
            ond = 0.002 * math.sin(x * 2.3 + 0.7) * math.sin(y * 1.7) if v.co.z > 0 else 0.0
            v.co = (x, y, z + 0.004 + v.co.z * 0.008 + ond)   # 8 mm: con 12 se leía como tarima
        bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(me.name, me); col.objects.link(o); me.materials.append(mat)
        bv = o.modifiers.new("canto", "BEVEL"); bv.width = 0.003; bv.segments = 2; bv.limit_method = "ANGLE"
        for pg in me.polygons: pg.use_smooth = True
        p.append(o)
    return p
