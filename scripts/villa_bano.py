"""
Baño de los padres (fase 4, 29-sep-2026) — el recinto más fotografiado de la casa después de la rampa.

Evidencia: fotos Archweb S8 5/7/8/26 + expediente/recintos-nivel-1.md (planta oficial CMN, ±0,3 m).
  · una PLATAFORMA de mosaico azul claro (5 × 5 cm) con la BAÑERA hundida en ella [S8 7]
  · el DIVÁN (méridienne) de mosaico gris: la misma masa, que sale del borde de la plataforma y ondula como una
    chaise longue [S8 5/7]
  · muros de azulejo blanco, lavamanos de pedestal, WC y radiador contra el muro del fondo [S8 7]
  · abierto al dormitorio, separado solo por una CORTINA blanca en una barra [S6, S8 5]
  · CLARABOYA sobre el baño [S8 5/8; Flickr/dalbera]; su posición exacta no está dibujada → interpretación
Posiciones finas (fin de la plataforma, sanitarios, claraboya) = lectura de las fotos, marcadas en el código.
"""
import bpy, bmesh, math
import villa_materia as vm

BANO = (-5.0, -2.30, -6.10, -3.30)                  # x0, x1, z0, z1 del baño dentro de la suite [CMN]
# Disposición releída de la foto S8 7 (29-sep, comparada lado a lado): la tina va JUNTO al diván (una franja azul
# delgada entre los dos) y su cabecera casi toca el muro del fondo; la plataforma azul se abre hacia la izquierda y
# hacia el frente; atrás a la izquierda queda piso blanco con radiador, bidé/WC y lavamanos. ⚠️ La planta del CMN
# ponía la tina en x −4,65…−4,0 (±0,3 m, planta esquemática): gana la foto, que es directa.
# 30-sep: el borde izquierdo iba en x −4,85 y dejaba 8 cm abiertos contra el muro (x −4,93). En S8 8 y S8 26 (tomadas
# desde el fondo) la plataforma llega al muro de ese lado sin ranura: se lleva hasta la cara del muro.
PARED_O = -4.93
PLATAFORMA = [(PARED_O, -5.90), (-3.10, -5.90), (-3.10, -3.40), (-3.95, -3.40), (-3.95, -4.15), (PARED_O, -4.15)]
TINA = (-3.85, -3.22, -5.15, -3.56)                 # 0,63 × 1,59 m, hundida 40 cm
DIVAN = (-3.10, -2.36, -6.10, -3.36)                # a lo largo de la tina, del fondo al frente
H_PLAT, PROF_TINA = 0.42, 0.40
CLARABOYA = (-4.40, -3.40, -5.00, -4.05)            # hueco en la cubierta sobre la plataforma (interpretación)
E_BROCAL = 0.10
# El hueco de la LOSA incluye el brocal: si la losa llegaba al vano, el brocal quedaba encima de ella con su cara de
# abajo en el plano del cielo raso y su cara interior en el plano del hueco (caras coplanares, chequeo 30-sep).
HUECO_CLARABOYA = (CLARABOYA[0] - E_BROCAL, CLARABOYA[1] + E_BROCAL, CLARABOYA[2] - E_BROCAL, CLARABOYA[3] + E_BROCAL)


def _mosaico(nombre, base, junta, var=0.18, lado=0.05):
    """Mosaico VIDRIADO como el de la foto: cada tesela con su tono (algunas claramente más claras u oscuras), brillo
    del esmalte que cambia de pieza a pieza, teselas apenas desniveladas (el reflejo se quiebra en cada una) y la
    junta hundida. Lo que delataba el render era la grilla perfecta y pareja."""
    m, b = vm._mat(nombre, base, 0.15); nt = m.node_tree
    geo = nt.nodes.new("ShaderNodeNewGeometry"); pos = vm._pos_caras(nt, geo)
    lad = nt.nodes.new("ShaderNodeTexBrick"); lad.offset = 0.0; lad.squash = 1.0
    lad.inputs["Scale"].default_value = 1.0; lad.inputs["Brick Width"].default_value = lado
    lad.inputs["Row Height"].default_value = lado; lad.inputs["Mortar Size"].default_value = 0.0035
    lad.inputs["Mortar Smooth"].default_value = 0.4; lad.inputs["Bias"].default_value = 0.0
    lad.inputs["Color1"].default_value = (1, 1, 1, 1); lad.inputs["Color2"].default_value = (1, 1, 1, 1)
    lad.inputs["Mortar"].default_value = (0, 0, 0, 1)
    nt.links.new(pos, lad.inputs["Vector"])
    celda = nt.nodes.new("ShaderNodeVectorMath"); celda.operation = "SNAP"; celda.inputs[1].default_value = (lado,) * 3
    nt.links.new(pos, celda.inputs[0])
    azar = nt.nodes.new("ShaderNodeTexWhiteNoise"); azar.noise_dimensions = "3D"
    nt.links.new(celda.outputs["Vector"], azar.inputs["Vector"])
    sep = nt.nodes.new("ShaderNodeSeparateColor"); nt.links.new(azar.outputs["Color"], sep.inputs["Color"])
    # tono por tesela: la mayoría cerca del color base, unas pocas bien distintas (curva en S)
    tono = nt.nodes.new("ShaderNodeValToRGB")
    tono.color_ramp.elements[0].color = tuple(max(0.0, c * (1 - var * 1.6)) for c in base) + (1,)
    tono.color_ramp.elements[1].color = tuple(min(1.0, c * (1 + var * 1.4)) for c in base) + (1,)
    mid = tono.color_ramp.elements.new(0.5); mid.color = (*base, 1)
    e1 = tono.color_ramp.elements.new(0.3); e1.color = tuple(c * (1 - var * 0.3) for c in base) + (1,)
    e2 = tono.color_ramp.elements.new(0.7); e2.color = tuple(c * (1 + var * 0.3) for c in base) + (1,)
    nt.links.new(sep.outputs["Red"], tono.inputs["Fac"])
    col = nt.nodes.new("ShaderNodeMix"); col.data_type = "RGBA"
    nt.links.new(lad.outputs["Fac"], col.inputs["Factor"])            # Fac = 1 en la junta
    nt.links.new(tono.outputs["Color"], col.inputs[6]); col.inputs[7].default_value = (*junta, 1)
    nt.links.new(col.outputs[2], b.inputs["Base Color"])
    # brillo del esmalte: cada tesela entre 0,06 y 0,22; la junta mate
    rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs["To Min"].default_value = 0.06; rr.inputs["To Max"].default_value = 0.22
    nt.links.new(sep.outputs["Green"], rr.inputs["Value"])
    rj = nt.nodes.new("ShaderNodeMix"); rj.data_type = "FLOAT"
    nt.links.new(lad.outputs["Fac"], rj.inputs[0]); nt.links.new(rr.outputs["Result"], rj.inputs[2]); rj.inputs[3].default_value = 0.85
    nt.links.new(rj.outputs[0], b.inputs["Roughness"])
    # relieve: junta hundida + cada tesela a su propia altura (±) → el reflejo se quiebra
    alto = nt.nodes.new("ShaderNodeMath"); alto.operation = "MULTIPLY_ADD"
    nt.links.new(sep.outputs["Blue"], alto.inputs[0]); alto.inputs[1].default_value = 0.35
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    nt.links.new(lad.outputs["Fac"], inv.inputs[1]); nt.links.new(inv.outputs[0], alto.inputs[2])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.35; bp.inputs["Distance"].default_value = 0.002
    nt.links.new(alto.outputs[0], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Coat Weight"].default_value = 0.6; b.inputs["Coat Roughness"].default_value = 0.05     # el vidriado
    return m


def _prisma(nombre, poli, h0, h1, material, col):
    """Contorno (x, z) extruido de h0 a h1."""
    from mathutils.geometry import tessellate_polygon
    me = bpy.data.meshes.new(nombre); bm = bmesh.new()
    ab = [bm.verts.new((x, z, h0)) for x, z in poli]; ar = [bm.verts.new((x, z, h1)) for x, z in poli]
    for i, j, k in tessellate_polygon([[(x, z, 0.0) for x, z in poli]]):
        bm.faces.new((ab[k], ab[j], ab[i])); bm.faces.new((ar[i], ar[j], ar[k]))
    n = len(poli)
    for k in range(n): bm.faces.new((ab[k], ab[(k + 1) % n], ar[(k + 1) % n], ar[k]))
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); col.objects.link(o); me.materials.append(material); return o


def _caja(nombre, x0, x1, z0, z1, h0, h1, material, col):
    return _prisma(nombre, [(x0, z0), (x1, z0), (x1, z1), (x0, z1)], h0, h1, material, col)


def plataforma_y_tina(piso, col):
    """Plataforma en L (deja piso libre atrás a la izquierda para los sanitarios) con la tina hundida: se arma como
    la L menos el hueco de la tina, en franjas, + el fondo de la tina."""
    azul = _mosaico("m_mosaico_azul", (0.42, 0.63, 0.76), (0.80, 0.84, 0.85))
    tx0, tx1, tz0, tz1 = TINA; h1 = piso + H_PLAT
    import villa_obra
    xs = [x for x, _ in PLATAFORMA]; zs = [z for _, z in PLATAFORMA]
    rects = villa_obra.rects_con_huecos(min(xs), max(xs), min(zs), max(zs), [TINA])
    fuera_l = lambda r: r[1] <= -3.95 + 1e-6 and r[3] > -4.15 + 1e-6          # la muesca de los sanitarios
    for k, r in enumerate(villa_obra.rects_con_huecos(min(xs), max(xs), min(zs), max(zs), [TINA, (PARED_O, -3.95, -4.15, -3.40)])):
        _caja(f"bano_plataforma_{k}", *r, piso, h1, azul, col)
    _caja("bano_tina_fondo", tx0, tx1, tz0, tz1, piso, h1 - PROF_TINA, azul, col)
    import villa_cuartos
    villa_cuartos.escalon_bano(piso, col, azul)                          # #31 [i08, i26, i52]
    cromo = _cromo()
    for k, x in enumerate((tx0 + 0.20, tx0 + 0.34)):                    # llaves en el borde del fondo [S8 7]
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.016, depth=0.07, location=(x, tz1 + 0.07, h1 + 0.035))
        o = bpy.context.object; o.name = f"bano_llave_{k}"
        for c in o.users_collection: c.objects.unlink(o)
        col.objects.link(o); o.data.materials.append(cromo)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.03, location=((tx0 + tx1) / 2, tz1 - 0.02, h1 - 0.12))   # caño [S8 7]
    o = bpy.context.object; o.name = "bano_cano"
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o); o.data.materials.append(vm._mat("m_laton", (0.55, 0.42, 0.20), 0.3, 1.0)[0])


def _perfil_divan(z):
    """Altura del diván a lo largo de z (del borde de la plataforma hacia el fondo): baja, cadera, sube a la cabecera."""
    # S8 7: alto contra el muro del fondo, baja hasta el nivel de la plataforma a media tina y sube un poco adelante
    pts = [(-3.36, 0.82), (-3.80, 0.74), (-4.40, 0.50), (-4.95, 0.42), (-5.55, 0.46), (-6.10, 0.55)]
    for (za, ha), (zb, hb) in zip(pts, pts[1:]):
        if zb <= z <= za:
            t = (z - za) / (zb - za); t = t * t * (3 - 2 * t)             # suavizado entre puntos
            return ha + (hb - ha) * t
    return pts[-1][1]


def divan(piso, col, pasos=40):
    """El diván: sólido bajo la ola, del piso a la superficie; mosaico gris."""
    gris = _mosaico("m_mosaico_gris", (0.36, 0.36, 0.37), (0.24, 0.24, 0.25), var=0.28)
    x0, x1, z_a, z_b = DIVAN[0], DIVAN[1], DIVAN[3], DIVAN[2]            # recorre de −3,95 a −6,10
    me = bpy.data.meshes.new("bano_divan"); bm = bmesh.new()
    zs = [z_a + (z_b - z_a) * k / pasos for k in range(pasos + 1)]
    arriba = [[bm.verts.new((x, z, piso + _perfil_divan(z))) for x in (x0, x1)] for z in zs]
    abajo = [[bm.verts.new((x, z, piso)) for x in (x0, x1)] for z in zs]
    for k in range(pasos):
        bm.faces.new((arriba[k][0], arriba[k][1], arriba[k + 1][1], arriba[k + 1][0]))
        bm.faces.new((abajo[k + 1][0], abajo[k + 1][1], abajo[k][1], abajo[k][0]))
        for lado in (0, 1):
            f = (abajo[k][lado], abajo[k + 1][lado], arriba[k + 1][lado], arriba[k][lado])
            bm.faces.new(f if lado else f[::-1])
    for extremo in (0, pasos):
        f = (abajo[extremo][0], abajo[extremo][1], arriba[extremo][1], arriba[extremo][0])
        bm.faces.new(f if extremo else f[::-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(me.name, me); col.objects.link(o); me.materials.append(gris)
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(40))
    bv = o.modifiers.new("canto", "BEVEL"); bv.width = 0.02; bv.segments = 3; bv.limit_method = "ANGLE"; bv.harden_normals = True


def _cromo():
    m = bpy.data.materials.get("mu_cromo")
    return m if m else vm._mat("m_cromo_bano", (0.9, 0.9, 0.9), 0.08, 1.0)[0]


def _porcelana():
    return vm._mat("m_porcelana", (0.92, 0.92, 0.90), 0.12)[0]


def sanitarios(piso, col):
    """Atrás a la izquierda, sobre piso (fuera de la plataforma) [S8 7]: radiador de columnas contra el muro lateral,
    bidé/WC bajo y lavamanos de pedestal junto al muro del fondo."""
    por = _porcelana(); zw = BANO[3] - 0.02
    objs = []
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.075, depth=0.70, location=(-4.15, zw - 0.20, piso + 0.35))
    objs.append(bpy.context.object); objs[-1].name = "bano_lavamanos_pie"
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.26, location=(-4.15, zw - 0.26, piso + 0.78))
    objs.append(bpy.context.object); objs[-1].name = "bano_lavamanos"; objs[-1].scale = (1.0, 0.78, 0.30)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.17, depth=0.38, location=(-4.62, zw - 0.36, piso + 0.19))
    objs.append(bpy.context.object); objs[-1].name = "bano_wc"; objs[-1].scale = (0.9, 1.35, 1.0)
    for o in objs:
        for c in o.users_collection: c.objects.unlink(o)
        col.objects.link(o); o.data.materials.append(por)
        for p in o.data.polygons: p.use_smooth = True
        bv = o.modifiers.new("canto", "BEVEL"); bv.width = 0.02; bv.segments = 3; bv.harden_normals = True
    cromo = _cromo()
    for k, dx in enumerate((-0.06, 0.06)):                               # llaves del lavamanos
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.012, depth=0.08, location=(-4.15 + dx, zw - 0.10, piso + 0.88))
        o = bpy.context.object; o.name = f"bano_llave_lav_{k}"
        for c in o.users_collection: c.objects.unlink(o)
        col.objects.link(o); o.data.materials.append(cromo)
    rad = vm._mat("m_radiador_bano", (0.86, 0.86, 0.84), 0.35)[0]      # radiador de columnas contra el muro izquierdo
    for k in range(12):
        z = zw - 0.15 - k * 0.055
        _caja(f"bano_radiador_{k}", BANO[0] + 0.04, BANO[0] + 0.13, z - 0.02, z + 0.02, piso + 0.15, piso + 0.72, rad, col)


def cortina(piso, techo, col):
    """Barra a lo largo del borde del baño hacia el dormitorio y la cortina blanca, corrida hacia un extremo [S8 5]."""
    x = BANO[1] - 0.06; zr0, zr1 = BANO[2] + 0.05, BANO[3] - 0.05; hr = piso + 2.15
    cu = bpy.data.curves.new("bano_barra", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 0.012
    sp = cu.splines.new("POLY"); sp.points.add(1)
    sp.points[0].co = (x, zr0, hr, 1); sp.points[1].co = (x, zr1, hr, 1)
    o = bpy.data.objects.new("bano_barra", cu); col.objects.link(o); cu.materials.append(_cromo())
    tela, b = vm._mat("m_cortina", (0.90, 0.89, 0.86), 0.8)
    b.inputs["Transmission Weight"].default_value = 0.35; b.inputs["Sheen Weight"].default_value = 0.3
    me = bpy.data.meshes.new("bano_cortina"); bm = bmesh.new()
    ancho, n_z, n_h = 0.60, 60, 12                                    # recogida hacia un extremo
    z_ini = zr1 - ancho
    filas = []
    for i in range(n_h + 1):
        h = hr - 0.03 - (hr - 0.03 - piso - 0.03) * i / n_h
        fila = []
        for j in range(n_z + 1):
            t = j / n_z; z = z_ini + ancho * t
            pliegue = 0.07 * math.sin(t * math.pi * 14) * (1 - 0.25 * i / n_h)
            fila.append(bm.verts.new((x + pliegue, z, h)))
        filas.append(fila)
    for i in range(n_h):
        for j in range(n_z):
            bm.faces.new((filas[i][j], filas[i][j + 1], filas[i + 1][j + 1], filas[i + 1][j]))
    bm.to_mesh(me); bm.free()
    oc = bpy.data.objects.new(me.name, me); col.objects.link(oc); me.materials.append(tela); me.shade_smooth()
    oc.modifiers.new("grosor", "SOLIDIFY").thickness = 0.004


def paredes(y_losa, y_techo):
    """Azulejo blanco rectangular en los muros que miran al baño [S8 7/8/26]."""
    az = vm.baldosa("m_azulejo_bano", (0.90, 0.90, 0.88), (0.87, 0.87, 0.85), (0.74, 0.74, 0.72), 0.075, 0.12,
                    bump=0.2, largo=0.15, traba=0.0, caras=True)       # en retícula, sin trabar [S8 7]
    n = sum(vm._asignar_caras(o, az, vm._mira_hacia(BANO, y_losa, y_techo)) for o in vm._objetos(("n1_muro", "n1_tabique")))
    return n


def claraboya(y_techo, e_cubierta, col):
    """Brocal de 30 cm sobre la cubierta y vidrio encima; el hueco lo abre la losa (HUECO en villa-blender)."""
    blanco = bpy.data.materials.get("blanco"); vid = bpy.data.materials.get("vidrio")
    x0, x1, z0, z1 = CLARABOYA; e = E_BROCAL; h0, h1 = y_techo - 0.01, y_techo + e_cubierta + 0.30
    for nm, r in (("o", (x0 - e, x0, z0 - e, z1 + e)), ("e", (x1, x1 + e, z0 - e, z1 + e)),
                  ("s", (x0, x1, z0 - e, z0)), ("n", (x0, x1, z1, z1 + e))):
        _caja(f"cub_claraboya_brocal_{nm}", *r, h0, h1, blanco, col)
    if vid: _caja("cub_claraboya_vidrio", x0 - e, x1 + e, z0 - e, z1 + e, h1, h1 + 0.012, vid, col)


def construir(col, y_losa, y_techo, e_cubierta):
    piso = y_losa + 0.013                                               # sobre la baldosa del baño
    plataforma_y_tina(piso, col); divan(piso, col); sanitarios(piso, col); cortina(piso, y_techo, col)
    n = paredes(y_losa, y_techo); claraboya(y_techo, e_cubierta, col)
    print(f"[villa_bano] plataforma azul + tina · diván gris · sanitarios · cortina · claraboya · azulejo en {n} caras")
