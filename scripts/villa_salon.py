"""
Salón: chimenea + mesón y radiadores (hallazgos #3, #9 y #34 del inventario de fotos, 30-sep-2026).

Evidencia (Archweb, citadas por archivo): i28, i29, i30, i34, i35, i36, i50, i58, i59.
  · La chimenea y el mesón son UNA pieza: una tapa de concreto gris oscuro, continua, que corre bajo la cinta de
    ventanas desde el muro azul del comedor y se adelanta hacia el salón en un bloque con el hogar de ladrillo
    abierto al frente, adosado a una columna (la columna sube desde la tapa) [i30, i35, i36].
  · El frente del mesón: paneles grises lisos, con los radiadores claros detrás [i35, i50].
  · Radiadores BLANCOS bajo el resto de la cinta [i50, i58]; bajo la ventana del muro rosa, uno OSCURO [i28, i29].
Posición: el bloque a la izquierda (hacia el comedor) de la columna del eje x ≈ 0 junto a la cinta; el mesón de ahí
al muro azul [i59: corre desde el comedor hasta la chimenea]. Medidas = lectura de foto (INTERPRETACIÓN ±0,1 m).
"""
import bpy
import villa_obra

CARA_CINTA = 10.55                      # cara interior de la fachada del salón (envolvente de 20 cm)
TAPA_Z, TAPA_E = 0.72, 0.06             # tapa a 0,72–0,78 m del piso
FONDO_MESON = 0.60
MESON_X = (-4.62, -1.10)                # del muro azul (x −4,65) a la chimenea
CHIMENEA = (-1.10, 0.22, 9.02)          # x0, x1 del bloque y su frente (la columna x −0,01 queda en el borde +x)
HOGAR = (-0.98, -0.18)                  # boca del hogar


def _mat(nombre, rgb, rough, metal=0.0):
    m = bpy.data.materials.get(nombre)
    if m: return m
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def _ladrillo():
    """Ladrillo rojo con junta clara, en coordenadas de mundo [i35, i36]."""
    m = bpy.data.materials.get("m_ladrillo_chimenea")
    if m: return m
    m = bpy.data.materials.new("m_ladrillo_chimenea"); m.use_nodes = True; nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], sep.inputs["Vector"])
    suma = nt.nodes.new("ShaderNodeMath"); suma.operation = "ADD"
    nt.links.new(sep.outputs["X"], suma.inputs[0]); nt.links.new(sep.outputs["Y"], suma.inputs[1])
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(suma.outputs[0], comb.inputs["X"]); nt.links.new(sep.outputs["Z"], comb.inputs["Y"])
    lad = nt.nodes.new("ShaderNodeTexBrick"); nt.links.new(comb.outputs["Vector"], lad.inputs["Vector"])
    lad.inputs["Scale"].default_value = 1.0; lad.inputs["Brick Width"].default_value = 0.22
    lad.inputs["Row Height"].default_value = 0.065; lad.inputs["Mortar Size"].default_value = 0.008
    lad.inputs["Color1"].default_value = (0.42, 0.16, 0.08, 1); lad.inputs["Color2"].default_value = (0.36, 0.13, 0.07, 1)
    lad.inputs["Mortar"].default_value = (0.55, 0.50, 0.44, 1)
    nt.links.new(lad.outputs["Color"], b.inputs["Base Color"]); b.inputs["Roughness"].default_value = 0.85
    return m


def chimenea_y_meson(z, col):
    gris = _mat("m_concreto_oscuro", (0.055, 0.055, 0.06), 0.55)
    panel = _mat("m_meson_panel", (0.32, 0.32, 0.31), 0.5)
    ladrillo = _ladrillo()
    y_front = CARA_CINTA - FONDO_MESON
    x0, x1, y_chim = CHIMENEA
    # tapa continua en L: mesón + bloque de la chimenea
    villa_obra.unir([
        villa_obra._prisma("mu_meson_tapa", [(MESON_X[0], y_front), (x0, y_front), (x0, CARA_CINTA), (MESON_X[0], CARA_CINTA)],
                           z + TAPA_Z, z + TAPA_Z + TAPA_E, gris, col),
        villa_obra._prisma("mu_chimenea_tapa", [(x0, y_chim), (x1, y_chim), (x1, CARA_CINTA), (x0, CARA_CINTA)],
                           z + TAPA_Z, z + TAPA_Z + TAPA_E + 0.04, gris, col)])
    # frente del mesón: paneles grises con zócalo retirado
    n_p = 4; ancho = (x0 - MESON_X[0]) / n_p
    for k in range(n_p):
        a = MESON_X[0] + k * ancho
        villa_obra._prisma(f"mu_meson_panel_{k}", [(a + 0.004, y_front), (a + ancho - 0.004, y_front),
                                                    (a + ancho - 0.004, y_front + 0.02), (a + 0.004, y_front + 0.02)],
                           z + 0.10, z + TAPA_Z - 0.005, panel, col)
    villa_obra._prisma("mu_meson_zocalo", [(MESON_X[0], y_front + 0.04), (x0, y_front + 0.04), (x0, y_front + 0.06),
                                           (MESON_X[0], y_front + 0.06)], z, z + 0.10, gris, col)
    # chimenea: marco de concreto oscuro (dos pilares al frente) y caja de ladrillo abierta al salón
    h0, h1 = HOGAR
    for n, (a, b) in enumerate([(x0, h0), (h1, x1)]):
        villa_obra._prisma(f"mu_chimenea_pilar_{n}", [(a, y_chim), (b, y_chim), (b, y_front), (a, y_front)],
                           z, z + TAPA_Z, gris, col)
    villa_obra._prisma("mu_chimenea_dintel", [(h0, y_chim), (h1, y_chim), (h1, y_chim + 0.12), (h0, y_chim + 0.12)],
                       z + TAPA_Z - 0.12, z + TAPA_Z, gris, col)
    fondo = y_front - 0.02
    villa_obra._prisma("mu_chimenea_ladrillo_fondo", [(h0, fondo - 0.12), (h1, fondo - 0.12), (h1, fondo), (h0, fondo)],
                       z, z + TAPA_Z - 0.12, ladrillo, col)
    for n, (a, b) in enumerate([(h0, h0 + 0.12), (h1 - 0.12, h1)]):
        villa_obra._prisma(f"mu_chimenea_ladrillo_lado_{n}", [(a, y_chim + 0.12), (b, y_chim + 0.12), (b, fondo), (a, fondo)],
                           z, z + TAPA_Z - 0.12, ladrillo, col)
    villa_obra._prisma("mu_chimenea_hogar", [(h0, y_chim), (h1, y_chim), (h1, fondo), (h0, fondo)], z, z + 0.03, ladrillo, col)
    print("[villa_salon] chimenea + mesón (una pieza, tapa gris oscura continua)")


def radiadores(z, col, M_blanco_nombre="mu_radiador_blanco"):
    """Radiadores de aletas: blancos bajo la cinta desde la chimenea hacia el extremo rosa [i50, i58]; OSCURO bajo la
    ventana del muro rosa [i28, i29]; en el tramo del mesón quedan detrás de los paneles (no se modelan)."""
    blanco = _mat(M_blanco_nombre, (0.78, 0.78, 0.76), 0.4, 0.2)
    oscuro = _mat("mu_radiador_oscuro", (0.05, 0.045, 0.045), 0.45, 0.3)
    import bmesh
    yr = CARA_CINTA - 0.09
    tramos = [("cinta", CHIMENEA[1] + 0.25, 9.10, yr, blanco, "x"), ("rosa", 6.70, 8.90, 9.30 - 0.09, oscuro, "y")]
    for nombre, a, b, fijo, m, eje in tramos:
        me = bpy.data.meshes.new(f"mu_radiador_{nombre}"); bm = bmesh.new()   # UNA malla por tramo (Metal)
        n = int((b - a) / 0.06)
        for k in range(n + 1):
            u = a + (b - a) * k / n
            r = bmesh.ops.create_cube(bm, size=1.0)
            for v in r["verts"]:
                ex, ey = (0.024, 0.10) if eje == "x" else (0.10, 0.024)
                cx, cy = (u, fijo - 0.01) if eje == "x" else (fijo - 0.01, u)
                v.co = (cx + v.co.x * ex, cy + v.co.y * ey, z + 0.38 + v.co.z * 0.48)
        bm.to_mesh(me); bm.free()
        o = bpy.data.objects.new(me.name, me); col.objects.link(o); me.materials.append(m)
    print("[villa_salon] radiadores: blancos bajo la cinta, oscuro bajo la ventana rosa")


def vigas(y_techo, col, xs=(-0.01, 4.74), ancho=0.28, alto=0.30, y=(4.75, CARA_CINTA)):
    """#47 (30-sep): vigas descolgadas que cruzan el cielo raso del salón de la vidriera a la cinta, sobre la línea de
    columnas del eje x 0 y del eje x 4,75 [i50, i58]. Canto ~30 cm y ancho de la columna = lectura de foto
    (INTERPRETACIÓN ±5 cm); blancas como el cielo raso."""
    blanco = bpy.data.materials.get("blanco")
    for n, x in enumerate(xs):
        villa_obra._prisma(f"n1_viga_salon_{n}", [(x - ancho / 2, y[0]), (x + ancho / 2, y[0]), (x + ancho / 2, y[1]), (x - ancho / 2, y[1])],
                           y_techo - alto, y_techo + 0.001, blanco, col)
    print(f"[villa_salon] {len(xs)} vigas descolgadas en el salón")
