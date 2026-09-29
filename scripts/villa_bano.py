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
PLATAFORMA = (-4.85, -3.10, -5.60, -3.95)           # la masa azul (su fin hacia el fondo = lectura de S8 7)
TINA = (-4.65, -4.00, -5.35, -4.15)                 # la bañera hundida [CMN: x −4,65…−4,0]
DIVAN = (-3.10, -2.40, -6.10, -3.95)                # el diván, a lo largo del lado de la plataforma [CMN]
H_PLAT, PROF_TINA = 0.45, 0.40
CLARABOYA = (-4.40, -3.40, -5.00, -4.05)            # hueco en la cubierta sobre la plataforma (interpretación)


def _mosaico(nombre, c1, c2):
    return vm.baldosa(nombre, c1, c2, (0.62, 0.64, 0.64), 0.05, 0.25, bump=0.25, caras=True)


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
    """La plataforma como marco alrededor del hueco de la tina (cuatro piezas) + el fondo de la tina."""
    azul = _mosaico("m_mosaico_azul", (0.38, 0.60, 0.74), (0.33, 0.55, 0.70))   # azul cielo [S8 7]; más pálido se leía gris
    px0, px1, pz0, pz1 = PLATAFORMA; tx0, tx1, tz0, tz1 = TINA
    h1 = piso + H_PLAT
    for nm, r in (("o", (px0, tx0, pz0, pz1)), ("e", (tx1, px1, pz0, pz1)),
                  ("s", (tx0, tx1, pz0, tz0)), ("n", (tx0, tx1, tz1, pz1))):
        _caja(f"bano_plataforma_{nm}", *r, piso, h1, azul, col)
    _caja("bano_tina_fondo", tx0, tx1, tz0, tz1, piso, h1 - PROF_TINA, azul, col)
    for k, x in enumerate((tx0 + 0.12, tx0 + 0.22)):                    # dos llaves en el borde [S8 7]
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.018, depth=0.06, location=(x, tz1 + 0.06, h1 + 0.03))
        o = bpy.context.object; o.name = f"bano_llave_{k}"
        for c in o.users_collection: c.objects.unlink(o)
        col.objects.link(o); o.data.materials.append(_cromo())


def _perfil_divan(z):
    """Altura del diván a lo largo de z (del borde de la plataforma hacia el fondo): baja, cadera, sube a la cabecera."""
    pts = [(-3.95, 0.45), (-4.40, 0.30), (-4.90, 0.30), (-5.40, 0.52), (-5.80, 0.78), (-6.00, 0.80), (-6.10, 0.70)]   # la ola de S8 7
    for (za, ha), (zb, hb) in zip(pts, pts[1:]):
        if zb <= z <= za:
            t = (z - za) / (zb - za); t = t * t * (3 - 2 * t)             # suavizado entre puntos
            return ha + (hb - ha) * t
    return pts[-1][1]


def divan(piso, col, pasos=40):
    """El diván: sólido bajo la ola, del piso a la superficie; mosaico gris."""
    gris = _mosaico("m_mosaico_gris", (0.27, 0.28, 0.30), (0.23, 0.24, 0.26))
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
    """Lavamanos de pedestal, WC y radiador contra el muro del fondo (z −3,30) [S8 7]. Posición = interpretación."""
    por = _porcelana(); zw = BANO[3] - 0.05
    # lavamanos: pedestal + cuenco
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.09, depth=0.72, location=(-4.45, zw - 0.18, piso + 0.36))
    ped = bpy.context.object; ped.name = "bano_lavamanos_pie"
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.27, location=(-4.45, zw - 0.25, piso + 0.80))
    cu = bpy.context.object; cu.name = "bano_lavamanos"; cu.scale = (1.0, 0.8, 0.32)
    # WC
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.19, depth=0.40, location=(-3.75, zw - 0.32, piso + 0.20))
    wc = bpy.context.object; wc.name = "bano_wc"; wc.scale = (0.95, 1.3, 1.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-3.75, zw - 0.09, piso + 0.62))
    tq = bpy.context.object; tq.name = "bano_wc_tanque"; tq.scale = (0.40, 0.16, 0.34)
    for o in (ped, cu, wc, tq):
        for c in o.users_collection: c.objects.unlink(o)
        col.objects.link(o); o.data.materials.append(por); bpy.ops.object.select_all(action="DESELECT")
        for p in o.data.polygons: p.use_smooth = True
        bv = o.modifiers.new("canto", "BEVEL"); bv.width = 0.02; bv.segments = 3; bv.harden_normals = True
    # radiador de columnas, blanco
    rad = vm._mat("m_radiador_bano", (0.85, 0.85, 0.83), 0.4)[0]
    for k in range(10):
        x = -4.95 + 0.06 + k * 0.055
        _caja(f"bano_radiador_{k}", x - 0.02, x + 0.02, zw - 0.12, zw - 0.04, piso + 0.15, piso + 0.75, rad, col)


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
                    bump=0.2, largo=0.15, traba=0.5, caras=True)
    n = sum(vm._asignar_caras(o, az, vm._mira_hacia(BANO, y_losa, y_techo)) for o in vm._objetos(("n1_muro", "n1_tabique")))
    return n


def claraboya(y_techo, e_cubierta, col):
    """Brocal de 30 cm sobre la cubierta y vidrio encima; el hueco lo abre la losa (HUECO en villa-blender)."""
    blanco = bpy.data.materials.get("blanco"); vid = bpy.data.materials.get("vidrio")
    x0, x1, z0, z1 = CLARABOYA; e = 0.10; h0, h1 = y_techo - 0.01, y_techo + e_cubierta + 0.30
    for nm, r in (("o", (x0 - e, x0, z0 - e, z1 + e)), ("e", (x1, x1 + e, z0 - e, z1 + e)),
                  ("s", (x0, x1, z0 - e, z0)), ("n", (x0, x1, z1, z1 + e))):
        _caja(f"cub_claraboya_brocal_{nm}", *r, h0, h1, blanco, col)
    if vid: _caja("cub_claraboya_vidrio", x0 - e, x1 + e, z0 - e, z1 + e, h1, h1 + 0.012, vid, col)


def construir(col, y_losa, y_techo, e_cubierta):
    piso = y_losa + 0.013                                               # sobre la baldosa del baño
    plataforma_y_tina(piso, col); divan(piso, col); sanitarios(piso, col); cortina(piso, y_techo, col)
    n = paredes(y_losa, y_techo); claraboya(y_techo, e_cubierta, col)
    print(f"[villa_bano] plataforma azul + tina · diván gris · sanitarios · cortina · claraboya · azulejo en {n} caras")
