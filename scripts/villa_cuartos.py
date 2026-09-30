"""
Muebles fijos de los dormitorios y detalles del baño (inventario de fotos, 30-sep-2026).

#32 — Muebles bajos empotrados bajo la cinta de ventanas: tapa oscura corrida, frente de puertas corredizas grises y
     zócalo retirado [i08 suite, i10 y i51 boudoir, i12 y i33 dormitorios del lado oeste].
#31 — Escalón bajo al frente de la plataforma del baño de los padres [i08, i26, i52].
Largos y posiciones = lectura de foto (INTERPRETACIÓN ±0,2 m); alto de la tapa ~0,72 m, fondo ~0,45 m.
"""
import bpy
import villa_obra

CARA_N, CARA_O = -10.55, -9.30          # caras interiores de las fachadas norte y oeste (envolvente de 20 cm)
TAPA, FONDO = 0.72, 0.45

# (nombre, fachada, desde, hasta): tramo a lo largo de la fachada
MUEBLES = [
    ("boudoir", "N", 1.80, 4.50),        # i10, i51: bajo la ventana, casi de muro a muro
    ("suite", "N", -2.20, 1.05),         # i08: al fondo, bajo la ventana del dormitorio
    ("oeste_1", "O", -10.00, -4.20),     # i12, i33: corrido bajo la cinta
    ("oeste_2", "O", -2.90, 1.40),
]


def _mat(nombre, rgb, rough, metal=0.0):
    m = bpy.data.materials.get(nombre)
    if m: return m
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m


def _rect(fachada, a, b, d0, d1):
    """Rectángulo en planta: de a a b a lo largo de la fachada, de d0 a d1 metros hacia adentro."""
    if fachada == "N": return [(a, CARA_N + d0), (b, CARA_N + d0), (b, CARA_N + d1), (a, CARA_N + d1)]
    return [(CARA_O - d1, a), (CARA_O - d0, a), (CARA_O - d0, b), (CARA_O - d1, b)]


def muebles_bajo_ventana(z, col):
    tapa = _mat("m_mueble_tapa", (0.035, 0.03, 0.028), 0.5)
    puerta = _mat("m_mueble_puerta", (0.42, 0.43, 0.43), 0.35, 0.4)
    blanco = bpy.data.materials.get("blanco")
    for nombre, f, a, b in MUEBLES:
        villa_obra._prisma(f"mu_mueble_{nombre}_cuerpo", _rect(f, a, b, 0.0, FONDO - 0.02), z + 0.08, z + TAPA - 0.03,
                           blanco, col)
        villa_obra._prisma(f"mu_mueble_{nombre}_tapa", _rect(f, a - 0.01, b + 0.01, 0.0, FONDO + 0.01), z + TAPA - 0.03,
                           z + TAPA, tapa, col)
        villa_obra._prisma(f"mu_mueble_{nombre}_zocalo", _rect(f, a + 0.02, b - 0.02, 0.0, FONDO - 0.08), z, z + 0.08, tapa, col)
        n = max(2, round((b - a) / 0.6)); ancho = (b - a) / n
        for k in range(n):                                    # hojas corredizas en dos rieles, alternadas
            u0, u1 = a + k * ancho, a + (k + 1) * ancho + (0.02 if k < n - 1 else 0)
            d = FONDO - 0.02 + (0.012 if k % 2 else 0.0)
            villa_obra._prisma(f"mu_mueble_{nombre}_hoja_{k}", _rect(f, u0 + 0.004, u1 - 0.004, d, d + 0.012),
                               z + 0.10, z + TAPA - 0.05, puerta, col)
    print(f"[villa_cuartos] {len(MUEBLES)} muebles bajos bajo la cinta (tapa oscura, hojas corredizas grises)")


def escalon_bano(piso, col, material):
    """Escalón de 20 cm al frente de la plataforma, del lado de la entrada [i08, i26, i52]."""
    villa_obra._prisma("bano_escalon", [(-3.95, -3.40), (-3.10, -3.40), (-3.10, -3.12), (-3.95, -3.12)],
                       piso, piso + 0.20, material, col)
