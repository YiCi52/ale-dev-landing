"""
La cocina (hallazgo #6, 1-oct-2026 — después de la fase 5, como pidió Alejandro).

Evidencia (Archweb): i17, i19, i22, i23, i24, i25, i27, i37, i39.
  · ALACENA empotrada en el muro hacia el hall (y 4,75, entre sus dos puertas: x −8,40…−5,73, el único muro
    interior libre del recinto en el DWG). En i19 termina en la puerta oscura junto a la ventana — es la puerta
    x −9,25…−8,45 del DWG. Abajo: compartimento abierto con repisa + puertas corredizas de ALUMINIO; al medio, nicho
    con salpicadero de azulejo y repisa; arriba, alacena con corredizas de aluminio y repisas abiertas a los lados;
    marco blanco [i19, i25, i39].
  · MESÓN en L bajo la cinta (fachadas oeste y sur), tapa de azulejo blanco con canto, abierto abajo con la tubería
    y los radiadores a la vista [i17, i23, i27]; PILETA DOBLE de azulejo con cuatro llaves de cuello alto [i24, i37].
  · MESA CENTRAL en L de tapa de azulejo blanco sobre patas delgadas [i17, i19].
  · Banco bajo de azulejo contra el muro, con radiador debajo [i17].
Medidas = lectura de foto (INTERPRETACIÓN ±0,1 m): tapa del mesón a 0,85 m, fondo 0,60.
i22 (pasillo con alacenas de vidrio esmerilado a ambos lados) no se ubica con seguridad en el DWG: no se modela.
Coordenadas de OBRA.
"""
import bpy, bmesh
import villa_obra

PISO = 3.31
X_O, Y_S = -9.30, 10.55          # caras interiores de las fachadas oeste y sur (la cocina está en esa esquina)
Y_HALL = 4.75                     # cara del muro hacia el hall (lado cocina)
ALACENA_X = (-8.40, -5.73)
H_MESON, F_MESON = 0.85, 0.60


def _mat(nombre, rgb, rough, metal=0.0):
    m = bpy.data.materials.get(nombre)
    if m: return m
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def _caja(nombre, x0, x1, y0, y1, z0, z1, m, col):
    return villa_obra._prisma(nombre, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], PISO + z0, PISO + z1, m, col)


def _azulejo():
    return bpy.data.materials.get("m_azulejo_tapa") or _azulejo_tapa()


def _azulejo_tapa():
    """Azulejo 10 × 10 cm en coordenadas de mundo para tapas y frentes (la baldosa de muros corta a 1,40 m)."""
    import villa_materia as vm
    return vm.baldosa("m_azulejo_tapa", (0.88, 0.88, 0.85), (0.86, 0.86, 0.83), (0.72, 0.72, 0.70), 0.10, 0.12,
                      bump=0.15, caras=True)


def alacena(col):
    blanco = bpy.data.materials.get("blanco"); alu = _mat("m_aluminio", (0.42, 0.43, 0.44), 0.5, 0.3)   # cepillado: gris, no espejo [i19, i25]
    azu = _azulejo(); a, b = ALACENA_X; y = Y_HALL
    # cuerpo bajo (0–0,85, fondo 0,55) con repisa abierta en el primer módulo y 2 corredizas de aluminio
    _caja("mu_coc_alacena_bajo", a, b, y, y + 0.55, 0.0, H_MESON - 0.04, blanco, col)
    _caja("mu_coc_alacena_tapa", a - 0.01, b + 0.01, y, y + 0.58, H_MESON - 0.04, H_MESON, azu, col)
    m0 = a + 0.62
    _caja("mu_coc_alacena_hueco", a + 0.04, m0 - 0.02, y + 0.05, y + 0.56, 0.10, H_MESON - 0.08, _mat("m_sombra", (0.05, 0.05, 0.05), 0.9), col)
    _caja("mu_coc_alacena_repisa", a + 0.04, m0 - 0.02, y + 0.05, y + 0.54, 0.42, 0.44, blanco, col)
    paso = (b - 0.04 - m0) / 2
    for k in range(2):
        u = m0 + k * paso; d = 0.556 + (0.012 if k % 2 else 0)
        _caja(f"mu_coc_alacena_corrediza_{k}", u, u + paso + 0.02, y + d, y + d + 0.012, 0.10, H_MESON - 0.07, alu, col)
        _caja(f"mu_coc_alacena_tirador_{k}", u + 0.06, u + 0.09, y + d + 0.012, y + d + 0.02, 0.62, 0.68, blanco, col)
    # nicho con salpicadero de azulejo (0,85–1,45) y repisa
    _caja("mu_coc_alacena_salpicadero", a, b, y, y + 0.02, H_MESON, 1.45, azu, col)
    _caja("mu_coc_alacena_nicho_repisa", a + 0.03, b - 0.03, y, y + 0.22, 1.16, 1.18, blanco, col)
    for k, x in enumerate((a - 0.03, b - 0.0)):
        _caja(f"mu_coc_alacena_lateral_{k}", x, x + 0.03, y, y + 0.58, 0.0, 2.25, blanco, col)
    # alacena alta (1,45–2,25, fondo 0,40): repisas abiertas a los lados, dos corredizas al centro
    _caja("mu_coc_alacena_alta", a, b, y, y + 0.40, 1.45, 2.25, blanco, col)
    l0, l1 = a + 0.45, b - 0.45
    for k, (u0, u1) in enumerate(((a + 0.03, l0), (l1, b - 0.03))):
        _caja(f"mu_coc_alacena_alta_hueco_{k}", u0, u1, y + 0.03, y + 0.41, 1.49, 2.21, _mat("m_sombra", (0.05, 0.05, 0.05), 0.9), col)
        for h in (1.72, 1.96):
            _caja(f"mu_coc_alacena_alta_repisa_{k}_{h}", u0, u1, y + 0.03, y + 0.40, h, h + 0.02, blanco, col)
    paso = (l1 - l0) / 2
    for k in range(2):
        u = l0 + k * paso; d = 0.405 + (0.012 if k % 2 else 0)
        _caja(f"mu_coc_alacena_alta_corrediza_{k}", u, u + paso + 0.02, y + d, y + d + 0.012, 1.49, 2.21, alu, col)
        _caja(f"mu_coc_alacena_alta_tirador_{k}", u + 0.06, u + 0.09, y + d + 0.012, y + d + 0.02, 1.80, 1.86, blanco, col)


def meson_y_pileta(col):
    azu = _azulejo(); cromo = _mat("m_cromo_coc", (0.80, 0.80, 0.78), 0.15, 1.0)
    rad = _mat("m_radiador_coc", (0.86, 0.86, 0.84), 0.35); tubo = _mat("m_tubo_coc", (0.85, 0.85, 0.83), 0.4)
    t0 = H_MESON - 0.05
    # tramo bajo la cinta sur (x −9,30…−6,20) y tramo bajo la cinta oeste (y 6,60…10,55)
    meson = villa_obra.unir([_caja("mu_coc_meson_s", X_O, -6.20, Y_S - F_MESON, Y_S, t0, H_MESON, azu, col),
                             _caja("mu_coc_meson_o", X_O, X_O + F_MESON, 6.60, Y_S, t0, H_MESON, azu, col)])
    hueco = _caja("tmp_hueco_pileta", -7.60 - 0.51, -7.60 + 0.51, Y_S - 0.50, Y_S - 0.10, t0 - 0.05, H_MESON + 0.05, azu, col)
    md = meson.modifiers.new("pileta", "BOOLEAN"); md.operation = "DIFFERENCE"; md.solver = "EXACT"; md.object = hueco
    with bpy.context.temp_override(object=meson, active_object=meson):
        bpy.ops.object.modifier_apply(modifier=md.name)
    bpy.data.objects.remove(hueco, do_unlink=True)
    for n, (x, y) in enumerate([(-6.25, Y_S - F_MESON + 0.04), (X_O + F_MESON - 0.05, 6.65)]):
        _caja(f"mu_coc_meson_pata_{n}", x, x + 0.04, y, y + 0.04, 0.0, t0, tubo, col)
    # pileta doble embutida en el tramo sur, centrada en x −7,6 [i24, i37]
    xc, yc = -7.60, Y_S - 0.30
    for k, dx in enumerate((-0.27, 0.27)):
        # cuba de azulejo: fondo + cuatro paredes, abierta arriba
        pi = _mat("m_pileta_interior", (0.80, 0.81, 0.80), 0.2)
        x0, x1, y0, y1 = xc + dx - 0.24, xc + dx + 0.24, yc - 0.20, yc + 0.20
        _caja(f"mu_coc_pileta_{k}_fondo", x0, x1, y0, y1, t0 - 0.22, t0 - 0.20, pi, col)
        for j, (a_, b_, c_, d_) in enumerate(((x0 - 0.03, x0, y0, y1), (x1, x1 + 0.03, y0, y1), (x0 - 0.03, x1 + 0.03, y0 - 0.03, y0), (x0 - 0.03, x1 + 0.03, y1, y1 + 0.03))):
            _caja(f"mu_coc_pileta_{k}_pared_{j}", a_, b_, c_, d_, t0 - 0.22, H_MESON, azu, col)
    for k, dx in enumerate((-0.40, -0.14, 0.14, 0.40)):
        villa_obra._prisma(f"mu_coc_llave_{k}", [(xc + dx - 0.01, Y_S - 0.06), (xc + dx + 0.01, Y_S - 0.06),
                                                  (xc + dx + 0.01, Y_S - 0.04), (xc + dx - 0.01, Y_S - 0.04)],
                           PISO + H_MESON, PISO + H_MESON + 0.28, cromo, col)
        villa_obra._prisma(f"mu_coc_llave_cuello_{k}", [(xc + dx - 0.01, Y_S - 0.20), (xc + dx + 0.01, Y_S - 0.20),
                                                         (xc + dx + 0.01, Y_S - 0.04), (xc + dx - 0.01, Y_S - 0.04)],
                           PISO + H_MESON + 0.26, PISO + H_MESON + 0.28, cromo, col)
    # tubería horizontal vista bajo el mesón y radiadores de columnas bajo la cinta
    villa_obra._prisma("mu_coc_tubo", [(X_O + 0.02, Y_S - 0.08), (-6.25, Y_S - 0.08), (-6.25, Y_S - 0.05), (X_O + 0.02, Y_S - 0.05)],
                       PISO + 0.14, PISO + 0.17, tubo, col)
    me = bpy.data.meshes.new("mu_coc_radiadores"); bm = bmesh.new()
    for (u0, u1, eje) in ((-8.70, -7.90, "x"), (7.30, 8.60, "y")):
        n = int((u1 - u0) / 0.06)
        for k in range(n + 1):
            u = u0 + (u1 - u0) * k / n
            r = bmesh.ops.create_cube(bm, size=1.0)
            for v in r["verts"]:
                if eje == "x": v.co = (u + v.co.x * 0.03, Y_S - 0.16 + v.co.y * 0.12, PISO + 0.42 + v.co.z * 0.50)
                else:          v.co = (X_O + 0.16 + v.co.x * 0.12, u + v.co.y * 0.03, PISO + 0.42 + v.co.z * 0.50)
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(me.name, me); col.objects.link(o); me.materials.append(rad)


def mesa_central(col):
    """Mesa en L de tapa de azulejo sobre patas delgadas [i17, i19]."""
    azu = _azulejo(); pata = _mat("m_tubo_coc", (0.85, 0.85, 0.83), 0.4)
    t0 = H_MESON - 0.05
    villa_obra.unir([_caja("mu_coc_mesa_a", -8.10, -6.90, 6.30, 9.00, t0, H_MESON, azu, col),
                     _caja("mu_coc_mesa_b", -6.90, -5.80, 8.10, 9.00, t0, H_MESON, azu, col)])
    for n, (x, y) in enumerate([(-8.05, 6.35), (-6.95, 6.35), (-8.05, 8.95), (-5.85, 8.15), (-5.85, 8.95)]):
        _caja(f"mu_coc_mesa_pata_{n}", x, x + 0.03, y - 0.03, y, 0.0, t0, pata, col)


def construir(col):
    alacena(col); meson_y_pileta(col); mesa_central(col)
    print("[villa_cocina] alacena de aluminio, mesón en L con pileta doble, mesa central en L, radiadores")
