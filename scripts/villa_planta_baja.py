"""
La planta baja habitada (opción B, 1-oct-2026: "habitada con evidencia").

QUÉ va en cada recinto sale de fuentes; DÓNDE está cada recinto en el DWG construido es INTERPRETACIÓN, porque el
único plano con muebles (FLC 19414, "Mme Savoye – Soubassement", 1:50) es de PROYECTO y no coincide con lo construido.
  · [T1] folleto oficial CMN 2021: dos cuartos de servicio con parqué, lavabo y radiador; apartamento del chofer
    (baño, sala, dormitorio); lavandería con dos piletas de concreto; garaje; hall con lavabo y dos mesas
    incrustadas cada una en un poste.
  · [P1] FLC 19414: cama contra el muro interior y lavabos espalda con espalda en los cuartos de servicio; cama al
    centro en el cuarto del chofer; mesa rectangular con 4 sillas junto a la ventana en la sala del chofer; banco de
    trabajo a lo largo del muro diagonal del garaje.
  · [F3] foto de 1931 (Gravot, FLC L2(17)61): mesa delgada rectangular atravesada por un poste frente a la entrada,
    con florero. · [i21] museo hoy: pileta larga de concreto con llaves de bronce.
Recintos (DWG nivel 0, coordenadas de OBRA; asignación = interpretación):
  servicio 1: x −6,27…−2,45 · y −9,50…−7,20 | servicio 2: y −7,20…−5,12 | lavandería: y −4,32…−2,20
  chofer (sala + dormitorio): x −1,25…4,70 · y −10,55…−7,20, detrás del paño vidriado trasero | garaje: x 1,4…6,1
"""
import bpy, math
import villa_obra

P = 0.05                                           # piso de planta baja


def _mat(nombre, rgb, rough, metal=0.0):
    m = bpy.data.materials.get(nombre)
    if m: return m
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def _caja(nombre, x0, x1, y0, y1, z0, z1, m, col):
    a, b = sorted((x0, x1)); c, d = sorted((y0, y1))
    return villa_obra._prisma(nombre, [(a, c), (b, c), (b, d), (a, d)], P + z0, P + z1, m, col)


def cama(nombre, x0, x1, y0, y1, col):
    """Cama de hierro de época: bastidor negro delgado, colchón, sábana blanca y manta gris doblada al pie."""
    hierro = _mat("m_hierro_cama", (0.03, 0.03, 0.03), 0.5, 0.4); sab = _mat("m_sabana", (0.88, 0.87, 0.84), 0.9)
    manta = _mat("m_manta", (0.30, 0.31, 0.32), 0.95)
    _caja(f"{nombre}_bastidor", x0, x1, y0, y1, 0.30, 0.34, hierro, col)
    for k, (x, y) in enumerate(((x0, y0), (x1, y0), (x0, y1), (x1, y1))):
        sx = 0.03 if x == x0 else -0.03; sy = 0.03 if y == y0 else -0.03
        _caja(f"{nombre}_pata_{k}", x, x + sx, y, y + sy, 0.0, 0.34 if k > 1 else 0.85, hierro, col)
    _caja(f"{nombre}_colchon", x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.02, 0.34, 0.50, sab, col)
    largo_x = abs(x1 - x0) > abs(y1 - y0)
    if largo_x: _caja(f"{nombre}_manta", x1 - 0.55, x1 - 0.05, y0 + 0.01, y1 - 0.01, 0.50, 0.53, manta, col)
    else:       _caja(f"{nombre}_manta", x0 + 0.01, x1 - 0.01, y1 - 0.55, y1 - 0.05, 0.50, 0.53, manta, col)


def lavabo_mural(nombre, x, y, sale, col):
    import villa_bano
    por = villa_bano._porcelana()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.24, location=(x + sale[0] * 0.24, y + sale[1] * 0.24, P + 0.80))
    o = bpy.context.object; o.name = nombre; o.scale = (1.0, 0.8, 0.28)
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o); o.data.materials.append(por)
    for p in o.data.polygons: p.use_smooth = True


def pileta_concreto(nombre, x0, x1, y0, y1, col):
    """Pileta larga de concreto sobre ménsulas, con llaves de bronce [i21, T1]."""
    hor = _mat("m_concreto_pileta", (0.55, 0.54, 0.51), 0.85); bronce = _mat("m_bronce", (0.55, 0.38, 0.18), 0.3, 1.0)
    _caja(f"{nombre}_fondo", x0, x1, y0, y1, 0.70, 0.75, hor, col)
    for k, (a, b, c, d) in enumerate(((x0, x1, y0, y0 + 0.05), (x0, x1, y1 - 0.05, y1), (x0, x0 + 0.05, y0, y1), (x1 - 0.05, x1, y0, y1))):
        _caja(f"{nombre}_borde_{k}", a, b, c, d, 0.70, 0.92, hor, col)
    largo_x = abs(x1 - x0) > abs(y1 - y0)
    for k in range(4):
        t = (k + 0.5) / 4
        if largo_x: x, y = x0 + (x1 - x0) * t, y1 + 0.01
        else:       x, y = x0 - 0.01, y0 + (y1 - y0) * t
        _caja(f"{nombre}_llave_{k}", x - 0.015, x + 0.015, y - 0.015, y + 0.015, 0.95, 1.10, bronce, col)


def mesa_poste(nombre, cx, cy, col, largo=1.50, ancho=0.42, alto=0.78, eje="x"):
    """Mesa delgada atravesada por un poste [F3, T1]: tablero blanco pasante sin patas."""
    blanco = bpy.data.materials.get("blanco")
    if eje == "x": _caja(nombre, cx - largo / 2, cx + largo / 2, cy - ancho / 2, cy + ancho / 2, alto - 0.04, alto, blanco, col)
    else:          _caja(nombre, cx - ancho / 2, cx + ancho / 2, cy - largo / 2, cy + largo / 2, alto - 0.04, alto, blanco, col)


def construir(col, M):
    import villa_muebles as vm
    # hall: dos mesas pasantes en los postes junto a la entrada [F3, T1]
    mesa_poste("pb_mesa_poste_0", -1.24, 4.75, col)
    mesa_poste("pb_mesa_poste_1", 1.25, 4.72, col)
    # cuartos de servicio: cama contra el muro interior, lavabo, radiador [P1, T1]
    cama("pb_cama_servicio_1", -6.20, -5.30, -9.40, -7.40, col)
    lavabo_mural("pb_lavabo_servicio_1", -2.47, -8.0, (-1, 0), col)
    cama("pb_cama_servicio_2", -6.20, -5.30, -7.10, -5.20, col)
    lavabo_mural("pb_lavabo_servicio_2", -2.47, -6.2, (-1, 0), col)
    # lavandería: dos piletas de concreto bajo la ventana del bloque de servicio [T1, P1, i21]
    pileta_concreto("pb_pileta_lav_0", -6.13, -5.53, -4.20, -3.30, col)
    pileta_concreto("pb_pileta_lav_1", -6.13, -5.53, -3.20, -2.30, col)
    # apartamento del chofer, detrás del paño trasero: cama al centro y mesa con 4 sillas junto a la ventana [P1]
    cama("pb_cama_chofer", 2.60, 4.50, -9.30, -8.40, col)
    _caja("pb_mesa_chofer", -0.60, 0.40, -10.20, -9.50, 0.72, 0.76, M["haya"], col)
    for k, (x, y) in enumerate(((-0.58, -10.18), (0.38, -10.18), (-0.58, -9.52), (0.38, -9.52))):
        _caja(f"pb_mesa_chofer_pata_{k}", x, x + 0.04, y, y + 0.04, 0.0, 0.72, M["haya"], col)
    for k, (x, y, r) in enumerate(((-0.35, -9.25, math.pi), (0.15, -9.25, math.pi), (-0.85, -9.85, -math.pi / 2), (0.65, -9.85, math.pi / 2))):
        vm.thonet(f"pb_silla_chofer_{k}", (x, y, P), r, M, col)
    # garaje: banco de trabajo a lo largo del muro diagonal hacia el hall [P1]
    _caja("pb_banco_trabajo", 2.40, 4.00, 2.30, 2.95, 0.84, 0.90, M["haya"], col)
    for k, x in enumerate((2.45, 3.95)):
        _caja(f"pb_banco_trabajo_pata_{k}", x, x + 0.05, 2.32, 2.92, 0.0, 0.84, M["acero_negro"], col)
    print("[villa_planta_baja] hall, cuartos de servicio, lavandería, chofer y garaje (qué = fuentes; dónde = interpretación)")
