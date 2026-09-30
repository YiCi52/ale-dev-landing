"""
Jardín de la cubierta (hallazgos #21 y #55 del inventario de fotos, 30-sep-2026).

El plano de cubierta NO dibuja jardineras: todo sale de las fotos de Archweb, así que las POSICIONES son
INTERPRETACIÓN (±0,5 m); los TIPOS sí son de foto:
  · jardineras ELEVADAS de concreto blanco (~0,45 m) con arbolito, arbustos y hiedra, junto a la boca de la rampa
    [e38, e40]; una con una conífera junto a la baranda [e38];
  · jardinera con LAVANDA contra la pantalla, a los lados de la banca [e39, e10];
  · plantas asomando sobre el borde de la cubierta encima de la vidriera del salón [e20, e21, e29, e34];
  · GRAVILLA: la cubierta del kiosque [e35, e37] y los canteros alrededor de las jardineras del solárium [e38, e39].
Plantas: villa_plantas (Poly Haven CC0).
"""
import bpy
import villa_obra
import villa_plantas as vp

# (nombre, x0, x1, y0, y1, alto) — jardineras elevadas
JARDINERAS = [
    ("boca_rampa", -4.10, -1.60, 3.00, 4.30, 0.45),       # e38, e40: L grande con arbolito junto a la boca
    ("conifera", 0.35, 1.15, 2.80, 3.60, 0.45),           # e38: conífera junto a la baranda de la boca
    ("borde_terraza", 2.40, 7.20, 5.00, 5.60, 0.40),       # e20, e21, e34: asoman sobre la vidriera
    ("lavanda_der", 0.45, 1.55, 7.70, 8.22, 0.35),         # e39: lavanda a la derecha de la banca
    ("lavanda_izq", -2.70, -1.45, 7.70, 8.22, 0.35),       # e39, e10: y a la izquierda
]
GRAVILLA = [
    ("kiosque", 4.93, 9.28, -10.54, -4.78),               # e35, e37
    ("solarium", -4.60, 1.40, 4.90, 7.60),                # e38, e39: el cantero de gravilla del solárium
]


def _grava(nombre, x0, x1, y0, y1, z, col):
    m = bpy.data.materials.get("gravilla")
    villa_obra._prisma(f"cub_gravilla_{nombre}", [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], z, z + 0.025, m, col)


def construir(z, col):
    blanco = bpy.data.materials.get("blanco"); tierra = bpy.data.materials.get("mu_tierra")
    for nombre, x0, x1, y0, y1, h in JARDINERAS:
        e = 0.10
        piezas = [villa_obra._prisma(f"cub_jard_{nombre}_{k}", pol, z, z + h, blanco, col) for k, pol in enumerate([
            [(x0, y0), (x1, y0), (x1, y0 + e), (x0, y0 + e)], [(x0, y1 - e), (x1, y1 - e), (x1, y1), (x0, y1)],
            [(x0, y0), (x0 + e, y0), (x0 + e, y1), (x0, y1)], [(x1 - e, y0), (x1, y0), (x1, y1), (x1 - e, y1)]])]
        villa_obra.unir(piezas)
        villa_obra._prisma(f"cub_jard_{nombre}_tierra", [(x0 + e, y0 + e), (x1 - e, y0 + e), (x1 - e, y1 - e), (x0 + e, y1 - e)],
                           z, z + h - 0.06, tierra or blanco, col)
        t = z + h - 0.06; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if nombre.startswith("lavanda"):
            vp.flores(f"mu_cub_planta_{nombre}", (cx, cy, t), min(x1 - x0, y1 - y0) * 0.9, col, semilla=hash(nombre) % 97, n=10)
            vp.matas(f"mu_cub_planta_{nombre}_mata", (cx, cy, t), (x1 - x0) / 2, col, semilla=hash(nombre) % 89, n=6, escala=(1.0, 1.4))
        elif nombre == "conifera":
            vp.arbusto(f"mu_cub_planta_{nombre}", (cx, cy, t), 0.30, 1.40, col, semilla=31, densidad=90)
        else:
            largo = max(x1 - x0, y1 - y0); n = max(2, int(largo / 0.9))
            for k in range(n):
                u = (k + 0.5) / n
                px, py = (x0 + (x1 - x0) * u, cy) if (x1 - x0) >= (y1 - y0) else (cx, y0 + (y1 - y0) * u)
                vp.arbusto(f"mu_cub_planta_{nombre}_{k}", (px, py, t), 0.38, 0.60 if k % 2 else 0.85, col, semilla=40 + k, densidad=70)
            vp.matas(f"mu_cub_planta_{nombre}_mata", (cx, cy, t), largo / 2.5, col, semilla=51, n=8)
    for g in GRAVILLA: _grava(*g, z, col)
    print(f"[villa_cubierta] {len(JARDINERAS)} jardineras elevadas + gravilla (INTERPRETACIÓN de posición)")
