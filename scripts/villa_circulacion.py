"""
Rampa y escalera de la Villa, desde las líneas del DWG (fase 2, 28-sep-2026).

RAMPA (capa 1/2 de los niveles 0 y 1): un pozo de x −1,25…1,25 con DOS tramos lado a lado de 1,18 m separados
por un muro central de 14 cm (x ±0,07), que corren de z 2,50 a −6,08, y un descanso al fondo (z −6,08…−7,12).
Las líneas de recorrido (x −0,67 y +0,59) y el arco que gira en el descanso dicen el sentido: se sube por el
tramo oeste hacia el fondo, se gira en el descanso y se vuelve por el tramo este hasta el piso de arriba.
Se repite igual del nivel principal a la cubierta.

ESCALERA: no es una caracol. Es una U: dos tramos rectos de x −4,75 a −3,15 (z 0,80…1,48 y 1,62…2,30) con un
muro de ojo en medio (z 1,48…1,62) y un remate semicircular con compensadas (centro −3,15 / 1,55, radio 0,75).
Sus muros ya salen de los rellenos del plano (villa_obra); aquí van solo los peldaños.
Ejes como en villa_obra: JSON (x, z) → Blender (X, Y); la altura es la Z de Blender.
"""
import bpy, bmesh, json, math, os

POZO_X = (-1.25, 1.25)
TRAMO_OESTE, TRAMO_ESTE, MURO_X = (-1.25, -0.07), (0.07, 1.25), (-0.07, 0.07)
Z_BOCA, Z_DESCANSO, Z_FONDO = 2.50, -6.08, -7.12
E_LOSA, H_BARANDA = 0.20, 1.00

ESC_CENTRO, ESC_R = (-3.15, 1.55), 0.75
ESC_X0 = -4.75
ESC_TRAMO_A, ESC_TRAMO_B = (0.80, 1.48), (1.62, 2.30)
PELDANOS_RECTOS, COMPENSADAS = 6, 6

# Huecos que la escalera y la rampa le abren a las losas (x0, x1, z0, z1)
HUECO_RAMPA = (POZO_X[0], POZO_X[1], Z_FONDO, Z_BOCA)
HUECOS_ESCALERA = [(ESC_X0, ESC_CENTRO[0], *ESC_TRAMO_A), (ESC_X0, ESC_CENTRO[0], *ESC_TRAMO_B),
                   (ESC_CENTRO[0], ESC_CENTRO[0] + ESC_R, ESC_TRAMO_A[0], ESC_TRAMO_B[1])]


def _perfil_en_x(bm, perfil, x0, x1):
    """Extruye un perfil (z, altura) entre dos planos x. Triangulado a mano: Metal no perdona n-gonos cóncavos."""
    from mathutils.geometry import tessellate_polygon
    limpio = []
    for p in perfil:                                            # sin vértices repetidos (el tramo que nace en el suelo los trae)
        if not limpio or math.dist(p, limpio[-1]) > 1e-4: limpio.append(p)
    if len(limpio) > 2 and math.dist(limpio[0], limpio[-1]) <= 1e-4: limpio.pop()
    perfil = limpio
    a = [bm.verts.new((x0, z, h)) for z, h in perfil]
    b = [bm.verts.new((x1, z, h)) for z, h in perfil]
    for i, j, k in tessellate_polygon([[(z, h, 0.0) for z, h in perfil]]):
        for tri in ((a[i], a[j], a[k]), (b[k], b[j], b[i])):
            try: bm.faces.new(tri)
            except ValueError: pass
    n = len(perfil)
    for k in range(n):
        try: bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k]))
        except ValueError: pass


def _malla(nombre, construir, material, col):
    me = bpy.data.meshes.new(nombre); bm = bmesh.new()
    construir(bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(nombre, me); col.objects.link(o); me.materials.append(material)
    return o


def _losa_inclinada(z0, h0, z1, h1, piso):
    """Perfil de un tramo de 20 cm con la cara de abajo recortada al piso (el primer tramo nace en el suelo)."""
    pie = [(z1, max(h1 - E_LOSA, piso)), (z0, max(h0 - E_LOSA, piso))]
    if h0 - E_LOSA < piso < h1 - E_LOSA:                        # la cara inferior corta el piso: un vértice más
        t = (piso - (h0 - E_LOSA)) / ((h1 - E_LOSA) - (h0 - E_LOSA))
        pie = [(z1, h1 - E_LOSA), (z0 + t * (z1 - z0), piso), (z0, piso)]
    return [(z0, h0), (z1, h1)] + pie


def rampa(pisos, material, col):
    """pisos = alturas de piso acabado [0, 3,31, 6,66]: un par de tramos + descanso por cada entrepiso."""
    def construir(bm):
        for base, techo in zip(pisos, pisos[1:]):
            medio = (base + techo) / 2
            _perfil_en_x(bm, _losa_inclinada(Z_BOCA, base, Z_DESCANSO, medio, pisos[0]), *TRAMO_OESTE)
            _perfil_en_x(bm, _losa_inclinada(Z_DESCANSO, medio, Z_BOCA, techo, pisos[0]), *TRAMO_ESTE)
            _perfil_en_x(bm, [(Z_DESCANSO, medio), (Z_DESCANSO, medio - E_LOSA),
                              (Z_FONDO, medio - E_LOSA), (Z_FONDO, medio)], *POZO_X)
    _malla("circ_rampa", construir, material, col)
    _malla("circ_rampa_muro", lambda bm: _perfil_en_x(bm, _muro_central(pisos), *MURO_X), material, col)
    print(f"[villa_circulacion] rampa: {len(pisos) - 1} entrepisos · 2 tramos + descanso cada uno")


def _muro_central(pisos):
    """El muro entre los dos tramos: nace sobre el tramo que baja y remata 1 m sobre el que sube.
    Donde el remate de un entrepiso pasa por encima del tramo bajo del siguiente, los dos se funden; donde no,
    queda el hueco entre ellos (junto al descanso), que es por donde se ve de un tramo al otro."""
    largo = Z_BOCA - Z_DESCANSO
    perfil = [(Z_BOCA, pisos[0])]
    for n, (base, techo) in enumerate(zip(pisos, pisos[1:])):
        medio = (base + techo) / 2
        perfil.append((Z_DESCANSO, medio))                                  # sube por el tramo oeste
        perfil.append((Z_DESCANSO, medio + H_BARANDA))                      # remate sobre el descanso
        if n + 1 < len(pisos) - 1:
            sig_base, sig_techo = techo, pisos[n + 2]
            sig_medio = (sig_base + sig_techo) / 2
            # remate: medio+1 → techo+1 (hacia la boca) · tramo bajo siguiente: sig_medio → sig_base (hacia la boca)
            t = (sig_medio - medio - H_BARANDA) / ((techo - medio) + (sig_medio - sig_base))
            t = min(max(t, 0.0), 1.0)
            perfil.append((Z_DESCANSO + t * largo, medio + H_BARANDA + t * (techo - medio)))
    perfil.append((Z_BOCA, pisos[-1] + H_BARANDA))
    return perfil


def _cuna(bm, cx, cz, r, a0, a1, h0, h1, segs=4):
    """Compensada: cuña del centro al arco, de h0 a h1."""
    pts = [(cx, cz)] + [(cx + r * math.cos(a0 + (a1 - a0) * k / segs), cz + r * math.sin(a0 + (a1 - a0) * k / segs))
                        for k in range(segs + 1)]
    ab = [bm.verts.new((x, z, h0)) for x, z in pts]; ar = [bm.verts.new((x, z, h1)) for x, z in pts]
    n = len(pts)
    for k in range(1, n - 1):
        bm.faces.new((ab[0], ab[k + 1], ab[k])); bm.faces.new((ar[0], ar[k], ar[k + 1]))
    for k in range(n):
        bm.faces.new((ab[k], ab[(k + 1) % n], ar[(k + 1) % n], ar[k]))


def _caja(bm, x0, x1, z0, z1, h0, h1):
    r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r["verts"]:
        v.co = ((x0 + x1) / 2 + v.co.x * (x1 - x0), (z0 + z1) / 2 + v.co.y * (z1 - z0), (h0 + h1) / 2 + v.co.z * (h1 - h0))


GARGANTA = 0.16                                        # espesor de la losa de la escalera, medido en vertical


def _borde_escalera(sv):
    """Punto interior (junto a la espina) y exterior (contra el muro) del recorrido en la posición sv (en peldaños).
    Tramo A 0–6 hacia +x · compensadas 6–12 en el semicírculo · tramo B 12–18 hacia −x. Continuo en sv."""
    cx, cz = ESC_CENTRO; huella = (cx - ESC_X0) / PELDANOS_RECTOS
    (a0, a1), (b0, b1) = ESC_TRAMO_A, ESC_TRAMO_B
    if sv <= PELDANOS_RECTOS:
        x = ESC_X0 + sv * huella; return (x, a1), (x, a0)
    if sv <= PELDANOS_RECTOS + COMPENSADAS:
        t = (sv - PELDANOS_RECTOS) / COMPENSADAS; th = -math.pi / 2 + math.pi * t
        r = ESC_R - 0.01
        return (cx, a1 + (b0 - a1) * t), (cx + r * math.cos(th), cz + r * math.sin(th))
    x = cx - (sv - PELDANOS_RECTOS - COMPENSADAS) * huella; return (x, b0), (x, b1)


def _tramo_continuo(bm, base, techo, sub_recto=2, sub_giro=6):
    """La escalera de un entrepiso como UN solo sólido: arriba los peldaños (huella + contrahuella), abajo el intradós
    CONTINUO (base + s·r − garganta), y los dos costados cerrados. Antes eran 18 bloques pegados: por debajo se veían
    las uniones (Alejandro, 28-sep: "se notan las partes pegadas"). El intradós se muestrea fino en las compensadas
    para que la hélice salga lisa."""
    from mathutils.geometry import tessellate_polygon
    n_tot = PELDANOS_RECTOS * 2 + COMPENSADAS; r = (techo - base) / n_tot
    perfil = [(0.0, base)]                                      # perfil de arriba: (s, altura)
    muestras = [0.0]                                             # s donde se muestrea el intradós
    for k in range(n_tot):
        sub = sub_giro if PELDANOS_RECTOS <= k < PELDANOS_RECTOS + COMPENSADAS else sub_recto
        perfil.append((float(k), base + (k + 1) * r))
        for j in range(1, sub + 1):
            sv = k + j / sub; perfil.append((sv, base + (k + 1) * r)); muestras.append(sv)
    bajo = lambda sv: max(base + sv * r - GARGANTA, base)
    T = {lado: [] for lado in (0, 1)}; B = {lado: [] for lado in (0, 1)}
    for sv, h in perfil:
        pts = _borde_escalera(sv)
        for lado in (0, 1): T[lado].append(bm.verts.new((*pts[lado], h)))
    for sv in muestras:
        pts = _borde_escalera(sv)
        for lado in (0, 1): B[lado].append(bm.verts.new((*pts[lado], bajo(sv))))
    def cara(vs):
        try: bm.faces.new(vs)
        except ValueError: pass
    for i in range(len(perfil) - 1):                           # huellas y contrahuellas
        cara((T[0][i], T[1][i], T[1][i + 1], T[0][i + 1]))
    for j in range(len(muestras) - 1):                         # intradós
        cara((B[0][j], B[0][j + 1], B[1][j + 1], B[1][j]))
    cara((T[0][-1], T[1][-1], B[1][-1], B[0][-1]))              # testa de llegada
    for lado in (0, 1):                                          # costados: el perfil de arriba + el intradós al revés
        dom = [(sv, h) for sv, h in perfil] + [(sv, bajo(sv)) for sv in reversed(muestras)]
        vs = T[lado] + list(reversed(B[lado]))
        limpio_d, limpio_v = [], []
        for d, v in zip(dom, vs):
            if not limpio_d or math.dist(d, limpio_d[-1]) > 1e-6: limpio_d.append(d); limpio_v.append(v)
        for i, j, k in tessellate_polygon([[(a, b, 0.0) for a, b in limpio_d]]):
            cara((limpio_v[i], limpio_v[j], limpio_v[k]) if lado else (limpio_v[k], limpio_v[j], limpio_v[i]))


def escalera(pisos, material, col):
    """Un sólido continuo por entrepiso (ver _tramo_continuo). Sombreado suave con aristas vivas: los cantos de los
    peldaños quedan nítidos y el intradós helicoidal, liso."""
    def construir(bm):
        for base, techo in zip(pisos, pisos[1:]): _tramo_continuo(bm, base, techo)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
        bmesh.ops.dissolve_degenerate(bm, dist=1e-5, edges=bm.edges)
    o = _malla("circ_escalera", construir, material, col)
    o.data.shade_smooth(); o.data.set_sharp_from_angle(angle=math.radians(35))
    print(f"[villa_circulacion] escalera en U: {len(pisos) - 1} entrepisos · un sólido continuo por tramo, intradós liso")


def tapas_escalera(h0, h1, material, col, nombre):
    """El hueco de la escalera en la losa es rectangular; su remate es curvo. Estas dos tapas cierran las
    esquinas que quedan FUERA del semicírculo (si no, la losa tendría dos agujeros junto al muro curvo)."""
    cx, cz = ESC_CENTRO; x1 = cx + ESC_R
    from mathutils.geometry import tessellate_polygon
    def construir(bm):
        for signo in (-1, 1):
            esquina = (x1, cz + signo * ESC_R)
            arco = [(cx + ESC_R * math.cos(a), cz + signo * ESC_R * math.sin(a))
                    for a in [math.pi / 2 * (1 - k / 8) for k in range(9)]]      # de (cx, cz±R) a (x1, cz)
            poli = arco + [esquina]
            ab = [bm.verts.new((x, z, h0)) for x, z in poli]; ar = [bm.verts.new((x, z, h1)) for x, z in poli]
            for i, j, k in tessellate_polygon([[(x, z, 0.0) for x, z in poli]]):
                bm.faces.new((ab[i], ab[j], ab[k])); bm.faces.new((ar[k], ar[j], ar[i]))
            n = len(poli)
            for k in range(n):
                bm.faces.new((ab[k], ab[(k + 1) % n], ar[(k + 1) % n], ar[k]))
    _malla(nombre, construir, material, col)


def es_muro_de_rampa(x0, x1, z0, z1):
    """El muro central de la rampa lo construye este módulo con su remate inclinado: villa_obra lo salta."""
    return x0 >= MURO_X[0] - 0.02 and x1 <= MURO_X[1] + 0.02 and z0 >= Z_FONDO - 0.1 and z1 <= Z_BOCA + 1.0


# ── antepechos de la escalera (28-sep, corrección con las fotos S8 3/4/11/13) ──────────────────────
# En el DWG los "muros" de la jaula de la escalera (la U con remate curvo y el muro de ojo) aparecen cortados a la
# altura del plano, como muros. Las fotos muestran otra cosa: la escalera es EXENTA y escultórica —se ve desde el
# vestíbulo, con el espacio abierto por debajo— y esas piezas son su antepecho, que sube con los peldaños.
# Mismo error que el muro central de la rampa. Aquí: cada vértice del contorno del plano sube a la altura del
# peldaño que tiene al lado (+1 m de antepecho) y baja 30 cm por debajo (la zanca).
LOSA_SOBRE = 0.24                                    # la losa que remata cada muro (3,07–3,31 / 6,44–6,66)
ZANCA, ANTEPECHO = 0.34, 1.00                       # zanca = contrahuella + garganta: sigue el intradós


def es_de_escalera(x0, x1, z0, z1):
    return x0 >= ESC_X0 - 0.05 and x1 <= ESC_CENTRO[0] + ESC_R + 0.2 and z0 >= 0.6 and z1 <= 2.5


def _peldano(x, z, base, techo, tramo=None):
    """Altura del peldaño junto al punto (x, z). tramo = 'A' o 'B' para forzar un lado (el muro de ojo)."""
    cx, cz = ESC_CENTRO; largo = cx - ESC_X0; r = (techo - base) / (PELDANOS_RECTOS * 2 + COMPENSADAS)
    if x <= cx or tramo:
        lado = tramo or ("A" if z < cz else "B")
        t = min(max((x - ESC_X0) / largo, 0.0), 1.0)
        s = PELDANOS_RECTOS * t if lado == "A" else PELDANOS_RECTOS + COMPENSADAS + PELDANOS_RECTOS * (1 - t)
    else:
        th = math.atan2(z - cz, x - cx)
        s = PELDANOS_RECTOS + COMPENSADAS * (th + math.pi / 2) / math.pi
    return base + s * r


def _prisma_alabeado(bm, poli, bajo, alto):
    """Como un prisma, pero cada vértice con su propia cota abajo y arriba (el antepecho sube con la escalera)."""
    from mathutils.geometry import tessellate_polygon
    pts = []
    for q in poli:
        if not pts or math.dist(q, pts[-1]) > 1e-3: pts.append(q)
    if len(pts) > 2 and math.dist(pts[0], pts[-1]) <= 1e-3: pts.pop()
    ab = [bm.verts.new((x, z, bajo(x, z))) for x, z in pts]; ar = [bm.verts.new((x, z, alto(x, z))) for x, z in pts]
    for i, j, k in tessellate_polygon([[(x, z, 0.0) for x, z in pts]]):
        for tri in ((ab[k], ab[j], ab[i]), (ar[i], ar[j], ar[k])):
            try: bm.faces.new(tri)
            except ValueError: pass
    n = len(pts)
    for k in range(n):
        try: bm.faces.new((ab[k], ab[(k + 1) % n], ar[(k + 1) % n], ar[k]))
        except ValueError: pass


def antepechos_escalera(pisos, material, col, alto_espina=9.10):
    ruta = os.path.join(os.getcwd(), "src/components/lab/villa-savoye/expediente/dwg-muros-solidos.json")
    niveles = json.load(open(ruta, encoding="utf-8"))["niveles"]
    def construir(bm):
        for nivel, (base, techo) in zip(("nivel0", "nivel1"), zip(pisos, pisos[1:])):
            for p in niveles[nivel]:
                xs = [x for x, _ in p]; zs = [z for _, z in p]
                if not es_de_escalera(min(xs), max(xs), min(zs), max(zs)): continue
                ojo = max(zs) - min(zs) < 0.3                      # el muro de ojo, entre los dos tramos
                if ojo:
                    # El "muro de ojo" del DWG NO es muro: en las fotos S8 3/4/11 el centro de la escalera es un HUECO
                    # con baranda metálica negra (ver barandas()). 28-sep: probado como muro alabeado (moño) y como
                    # muro de piso a techo (tapaba la escalera); las dos cosas eran lecturas del plano sin la foto.
                    continue
                # BANDA HELICOIDAL: el muro exterior sube con los peldaños (+1 m, con pasamanos encima) y por debajo
                # sigue el intradós [S8 4]. Probado "desde el piso" (28-sep): cerraba la escalera en un tambor.
                bajo = lambda x, z, b=base, t=techo: max(_peldano(x, z, b, t) - ZANCA, b)
                alto = lambda x, z, b=base, t=techo: _peldano(x, z, b, t) + ANTEPECHO
                _prisma_alabeado(bm, p, bajo, alto)
    o = _malla("circ_escalera_antepechos", construir, material, col)
    import villa_obra; villa_obra.suavizar_curvas(o.data)
    print("[villa_circulacion] escalera exenta: antepechos que suben con los peldaños (fotos S8)")


# ── barandas metálicas negras (fotos S8 3/4/11/13) ─────────────────────────────────────────────────────────
def _material_negro():
    m = bpy.data.materials.get("m_baranda") or bpy.data.materials.new("m_baranda"); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (0.02, 0.02, 0.022, 1); b.inputs["Roughness"].default_value = 0.35
    b.inputs["Metallic"].default_value = 0.4
    return m


def _tubo(nombre, puntos, radio, material, col):
    cu = bpy.data.curves.new(nombre, "CURVE"); cu.dimensions = "3D"
    cu.bevel_depth = radio; cu.bevel_resolution = 3; cu.use_fill_caps = True
    sp = cu.splines.new("POLY"); sp.points.add(len(puntos) - 1)
    for p, q in zip(sp.points, puntos): p.co = (*q, 1)
    o = bpy.data.objects.new(nombre, cu); col.objects.link(o); cu.materials.append(material)
    return o


def barandas(pisos, col, paso_barrote=1.0):
    """Pasamanos sobre la banda exterior y baranda del lado del hueco central (pasamanos + barrotes), en tubo negro;
    más la baranda del piso principal en el borde del hueco junto al semicírculo, donde la banda de abajo ya pasó
    y la de arriba todavía no llega (interpretación: sin ella ese borde quedaría sin protección)."""
    m = _material_negro(); n_b = 0
    cx, cz = ESC_CENTRO
    n_tot = PELDANOS_RECTOS * 2 + COMPENSADAS
    for nivel, (base, techo) in enumerate(zip(pisos, pisos[1:])):
        r = (techo - base) / n_tot
        ext, inter = [], []
        for i in range(n_tot * 4 + 1):
            sv = i / 4; pi_, po = _borde_escalera(sv)
            h = base + (sv + 0.5) * r
            # exterior: sobre la banda (15 cm hacia afuera del borde del peldaño)
            if sv <= PELDANOS_RECTOS: pe = (po[0], po[1] - 0.075)
            elif sv <= PELDANOS_RECTOS + COMPENSADAS:
                d = math.dist(po, (cx, cz)); pe = (cx + (po[0] - cx) * (d + 0.075) / d, cz + (po[1] - cz) * (d + 0.075) / d)
            else: pe = (po[0], po[1] + 0.075)
            ext.append((*pe, h + ANTEPECHO + 0.02))
            inter.append((*pi_, h + 0.90))
        _tubo(f"circ_pasamanos_ext_{nivel}", ext, 0.02, m, col)
        _tubo(f"circ_pasamanos_int_{nivel}", inter, 0.018, m, col)
        for k in range(0, n_tot, max(1, int(paso_barrote))):          # un barrote por peldaño en el lado del hueco
            sv = k + 0.5; pi_, _ = _borde_escalera(sv)
            _tubo(f"circ_barrote_{nivel}_{k}", [(*pi_, base + (k + 1) * r), (*pi_, base + (sv + 0.5) * r + 0.90)], 0.007, m, col)
            n_b += 1
    # baranda del piso principal alrededor del semicírculo (borde del hueco de la losa)
    y = pisos[1]; rr = ESC_R + 0.20
    arco = [(cx + rr * math.cos(a), cz + rr * math.sin(a), y + 1.0) for a in [-math.pi / 2 + math.pi * k / 24 for k in range(25)]]
    _tubo("circ_baranda_n1", arco, 0.02, m, col)
    for k in range(0, 25, 3):
        x, z, _ = arco[k]; _tubo(f"circ_baranda_n1_barrote_{k}", [(x, z, y), (x, z, y + 1.0)], 0.008, m, col)
    print(f"[villa_circulacion] barandas negras: pasamanos exterior e interior + {n_b} barrotes + borde del piso principal")
