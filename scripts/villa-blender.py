"""
La Villa Savoye en Blender, construida desde PLANTA.md.

Por qué existe: dos días armando la casa con cajas en three.js dieron
geometría correcta y aspecto de sandbox. El problema no era el orden ni los
planos — era el medio. Materiales planos y luz de tiempo real no parecen
arquitectura. Cycles sí.

    /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/villa-blender.py

Las coordenadas salen de PLANTA.md §1-2 y de planta.ts. Este archivo NO
inventa medidas: si algo no cuadra, se corrige el documento primero.
"""
import bpy, math, os, sys

RAIZ = os.getcwd()
ASSETS = os.path.expanduser("~/CastilloStudio/assets/polyhaven")   # Poly Haven CC0, fuera del repo
MODO = os.environ.get("VILLA_MODO", "dia")          # "dia" | "noche"
# Cada toma con su cielo (28-sep): el exterior se ve mejor contra el bosque; el rincón del solárium mira por su
# ventana a un prado abierto (el otro HDRI muestra casas y un muro de piedra desde la cámara de aproximación).
if os.environ.get("VILLA_CAM") == "rincon":
    for k, v in (("VILLA_HDR", os.path.join(ASSETS, "charolettenbrunn_park_4k.hdr")), ("VILLA_HDRI_GIRO", "145"),
                 ("VILLA_SOL_AZ", "170"), ("VILLA_SOL_EL", "28")):
        os.environ.setdefault(k, v)
if not os.environ.get("VILLA_CAM"):                     # la toma de aproximación: sin el tronco gigante de
    os.environ.setdefault("VILLA_HDRI_GIRO", "300")      # fondo ("parece Ant-Man", Alejandro 28-sep); pinos lejanos
HDR = os.environ.get("VILLA_HDR", os.path.join(ASSETS, "ballawley_park_4k.hdr"))
if not os.path.exists(HDR): HDR = os.path.join(RAIZ, "public/lab/villa-savoye/sky_1k.hdr")
OUT = os.environ.get("VILLA_OUT", os.path.join(RAIZ, "artefactos-bake/prueba-villa.png"))

# ── PLANTA.md §1 ──────────────────────────────────────────────────────────
CRUJIA, VOLADIZO = 4.75, 1.25              # fase 1 (DWG): voladizo 1,25, no 1,125
W, D = CRUJIA * 4, CRUJIA * 4 + VOLADIZO * 2   # 19.0 x 21.5
# Alturas MEDIDAS en la fachada 1 y el corte A-A del DWG (28-sep, 24,8 px/m, ±5 cm). Antes eran a ojo y la caja
# quedaba 70 cm más alta, con la ventana corrida 23 cm más alta de lo real: 3,3 / 0,55 / 1,2 / 1,5 + antepecho 1,05.
#   bajo la losa 3,07 · piso acabado 3,31 · ventana 4,34→5,31 · cielo raso 6,45 · cubierta acabada 6,66 · remate 6,88
H_PILOTIS, H_BANDA_INF, H_VENTANA, H_BANDA_SUP = 3.07, 1.27, 0.97, 1.14
H_VOL = H_BANDA_INF + H_VENTANA + H_BANDA_SUP          # hasta el cielo raso
Y_LOSA, Y_TECHO = H_PILOTIS + 0.24, H_PILOTIS + H_VOL   # piso acabado 3,31 · cielo raso 6,45
E_CUBIERTA, H_REMATE = 0.21, 0.43                      # losa de cubierta (acabado 6,66) · remate de fachada (6,88)
H_PANTALLA = 2.74                                      # pantallas del solárium: coronan a 9,40
T_TAB = 0.15

# ── PLANTA.md §2: los tabiques, con sus huecos de puerta ──────────────────
TABIQUES = [
    ("z", 4.78, 0.1, 9.5, [(4.0, 7.0)], True),
    ("z", 4.78, -9.5, 0.1, [(-8.9, -8.0)], False),
    ("x", -4.79, 4.78, 10.75, [(6.4, 7.3)], False),
    ("x", 0.1, -4.83, 4.78, [(1.2, 3.0)], False),
    ("x", -1.5, -7.0, 4.78, [], False),
    ("z", -4.83, 1.36, 9.5, [], False),
    ("x", 4.47, -10.75, -4.83, [(-7.6, -6.7)], False),
    ("x", 1.36, -10.75, -4.83, [], False),
    ("x", -5.12, -10.75, 4.78, [(-9.6, -8.7), (-3.6, -2.7), (2.6, 3.5)], False),
    ("z", -4.99, -9.5, -5.12, [(-7.6, -6.7)], False),
    ("z", 1.92, -9.5, -5.12, [], False),
    ("z", -6.17, -5.12, 1.36, [(-3.4, -2.5)], False),
    ("z", -0.28, -5.12, -1.5, [(-4.4, -3.5)], False),
]

def tramos(a, b, puertas):
    out, cur = [], a
    for p0, p1 in sorted(puertas):
        if p0 > cur: out.append((cur, min(p0, b)))
        cur = max(cur, p1)
    if cur < b: out.append((cur, b))
    return [(u, w) for u, w in out if w - u > 0.05]

# ── escena limpia ─────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene

def mat(nombre, rgb, rough=0.85, metal=0.0, alpha=1.0, trans=False):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if trans:
        b.inputs["Transmission Weight"].default_value = 0.95
        b.inputs["IOR"].default_value = 1.45
        m.use_backface_culling = False
    return m

# Materiales de PLANTA.md "MATERIA Y COLOR" — leidos de las fotos reales
M_BLANCO   = mat("blanco",  (0.90, 0.89, 0.86), 0.62)
M_ROSA     = mat("rosa",    (0.52, 0.20, 0.14), 0.75)   # polychromie del salon
M_AZUL     = mat("azul",    (0.09, 0.17, 0.22), 0.75)
M_VERDE    = mat("verde",   (0.04, 0.09, 0.05), 0.68)   # el volumen bajo
M_PISO     = mat("ocre",    (0.55, 0.42, 0.28), 0.55)   # baldosa del salon
M_HORMIGON = mat("hormigon",(0.44, 0.43, 0.40), 0.88)
M_VIDRIO   = mat("vidrio",  (0.62, 0.70, 0.70), 0.02, 0.0, 0.15, trans=True)
# Menos transmisión: con 0.95 el vidrio era un hueco y el interior oscuro se leía como
# bandas negras. La cinta de la Savoye, vista de afuera, sobre todo refleja el cielo.
# 27-sep: con el interior ya amoblado e iluminado, vuelve a vidrio de verdad. El 0.55 dejaba 45 % de
# panel gris opaco: de noche la luna lo pintaba y tapaba la luz de la casa. Los rayos de sombra lo
# atraviesan (Light Path → Transparent): así el sol entra por la cinta y dibuja sobre el piso.
_vn = M_VIDRIO.node_tree; _vb = _vn.nodes["Principled BSDF"]
_vb.inputs["Transmission Weight"].default_value = 1.0; _vb.inputs["Base Color"].default_value = (0.92, 0.96, 0.95, 1)
_lp = _vn.nodes.new("ShaderNodeLightPath"); _tr = _vn.nodes.new("ShaderNodeBsdfTransparent")
_mx = _vn.nodes.new("ShaderNodeMixShader"); _so = next(n for n in _vn.nodes if n.type == "OUTPUT_MATERIAL")
_vn.links.new(_lp.outputs["Is Shadow Ray"], _mx.inputs["Fac"]); _vn.links.new(_vb.outputs["BSDF"], _mx.inputs[1])
_vn.links.new(_tr.outputs["BSDF"], _mx.inputs[2]); _vn.links.new(_mx.outputs["Shader"], _so.inputs["Surface"])
# 28-sep (fase 3): vidrio más "de foto": IOR de vidrio flotado, un verde apenas en el tinte, y huellas/polvo
# (rugosidad 0…0,05 con ruido en coordenadas de mundo) para que los reflejos no sean de espejo perfecto.
_vb.inputs["IOR"].default_value = 1.52; _vb.inputs["Base Color"].default_value = (0.90, 0.96, 0.93, 1)
_gv = _vn.nodes.new("ShaderNodeNewGeometry"); _rv = _vn.nodes.new("ShaderNodeTexNoise")
_rv.inputs["Scale"].default_value = 3.0; _rv.inputs["Detail"].default_value = 6.0
_vn.links.new(_gv.outputs["Position"], _rv.inputs["Vector"])
_mr = _vn.nodes.new("ShaderNodeMapRange"); _mr.inputs["From Min"].default_value = 0.45; _mr.inputs["From Max"].default_value = 0.75
_mr.inputs["To Min"].default_value = 0.0; _mr.inputs["To Max"].default_value = 0.05
_vn.links.new(_rv.outputs["Fac"], _mr.inputs["Value"]); _vn.links.new(_mr.outputs["Result"], _vb.inputs["Roughness"])
M_CARP     = mat("carpint", (0.10, 0.05, 0.03), 0.45)

def caja(nombre, x0, x1, y0, y1, z0, z1, material):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = nombre
    # primitive_cube_add(size=1) YA da un cubo de lado 1: la escala es el lado
    # completo, no el semi-lado. Dividir entre dos dejaba cada pieza a la mitad
    # y la casa se veia desarmada, con todo flotando suelto.
    o.scale = (x1-x0, z1-z0, y1-y0)
    o.location = ((x0+x1)/2, (z0+z1)/2, (y0+y1)/2)   # Blender: Z arriba
    o.data.materials.append(material)
    return o

# ── planta baja + pilotis: DESDE EL PLANO (fase 2, scripts/villa_obra.py) ────
# Antes: cilindro cerrado r 6,5, bloque de servicio corrido 2,4 m y pilotis en retícula equivocada.
# Ahora: contornos exactos del DWG (rellenos de la capa 7) extruidos; el vidrio curvo sale del arco de la capa 2.
H_RDC = H_PILOTIS - 0.2
sys.path.insert(0, os.path.join(RAIZ, "scripts"))
import villa_obra
villa_obra.planta_baja(H_RDC, H_PILOTIS, M_VERDE, M_BLANCO, M_VIDRIO, esc.collection)

# ── losa del nivel principal: huecos REALES de rampa y escalera (fase 2, del DWG) ──────
import villa_circulacion as circ
HUECOS_PISO = [circ.HUECO_RAMPA, *circ.HUECOS_ESCALERA]
for n,(x0,x1,z0,z1) in enumerate(villa_obra.rects_con_huecos(-W/2, W/2, -D/2, D/2, HUECOS_PISO)):
    caja(f"losa_nobile_{n}", x0, x1, H_PILOTIS, Y_LOSA, z0, z1, M_PISO)
circ.tapas_escalera(H_PILOTIS, Y_LOSA, M_PISO, esc.collection, "losa_nobile_tapas_escalera")

# ── tabiques del nivel principal: DESDE EL PLANO (fase 2) ───────────────
# Antes: TABIQUES a mano (PLANTA.md §2), con la franja oeste mal. Ahora: muros rellenos + pares de líneas del DWG.
# La polychromie (rosa, azul) vuelve en la fase 3 (materia): aquí todo es obra gris.
villa_obra.nivel_principal(Y_LOSA, Y_TECHO - 0.01, W, D, M_BLANCO, esc.collection, M_VIDRIO)

# Vanos SIN vidrio de la cinta: todo lo que da al jardín suspendido y a su parte techada, el KIOSQUE
# (planta oficial CMN, recintos-nivel-1.md). Este: de la esquina maciza del kiosque (z −9,45) hasta el salón.
# Norte: el frente del kiosque, del muro del boudoir (x 4,90) a la esquina maciza (x 9,30).
VANOS = {"este": (-9.45, 4.78), "norte": (4.90, 9.30)}
# ── fachadas: banda inferior, cinta de vidrio continua, banda superior ────
yv0, yv1 = H_PILOTIS + H_BANDA_INF, H_PILOTIS + H_BANDA_INF + H_VENTANA
for nombre, x0, x1, z0, z1 in [("sur",-W/2,W/2,D/2-0.19,D/2), ("norte",-W/2,W/2,-D/2,-D/2+0.19),
                               ("este",W/2-0.19,W/2,-D/2+0.19,D/2-0.19), ("oeste",-W/2,-W/2+0.19,-D/2+0.19,D/2-0.19)]:
    # la fachada este se parte donde empieza el salón (z 4,72): su cara interior, del lado del estar, es ROSA
    # [CMN: "rosa junto al estar"; S8 28–29: el muro rosa lleva la cinta de ventanas]
    cortes_f = [(z0, 4.72), (4.72, z1)] if nombre == "este" else [(z0, z1)]
    for n_f, (f0, f1) in enumerate(cortes_f):
        caja(f"fa_{nombre}_inf_{n_f}", x0,x1, H_PILOTIS, yv0, f0,f1, M_BLANCO)
        caja(f"fa_{nombre}_sup_{n_f}", x0,x1, yv1, Y_TECHO, f0,f1, M_BLANCO)
    # En la TERRAZA la cinta sigue, pero es un VANO sin vidrio con "baby pilotis" [S4]: el paisaje se ve desde
    # afuera, al aire libre. Solo la fachada este toca la terraza (z −4,60…4,78).
    vano = VANOS.get(nombre)
    # vidrio de 12 mm en el plano de los montantes (antes: un bloque macizo de 7 a 19 cm que refractaba como lupa)
    largo_x_ = (x1 - x0) > (z1 - z0); cz_v, cx_v = (z0 + z1) / 2, (x0 + x1) / 2
    a_v, b_v = (x0, x1) if largo_x_ else (z0, z1)
    tramos_vid = [(a_v, b_v)] if not vano else [(a_v, vano[0]), (vano[1], b_v)]
    for n_t, (t0, t1) in enumerate(tramos_vid):
        if t1 - t0 < 0.05: continue
        if largo_x_: caja(f"fa_{nombre}_vid_{n_t}", t0, t1, yv0, yv1, cz_v - 0.006, cz_v + 0.006, M_VIDRIO)
        else:        caja(f"fa_{nombre}_vid_{n_t}", cx_v - 0.006, cx_v + 0.006, yv0, yv1, t0, t1, M_VIDRIO)
    # montantes de carpintería cada ~1.1 m (mismo paso que villaModel.ts); en el vano no hay carpintería
    largo_x = (x1 - x0) > (z1 - z0)
    a, b = (x0, x1) if largo_x else (z0, z1)
    n_m = max(1, int((b - a) / 1.1))
    for k in range(n_m + 1):
        u = a + (b - a) * k / n_m
        if vano and vano[0] < u < vano[1]: continue
        # perfil delgado en el plano del vidrio (7 cm de fondo), no un poste del ancho del muro: así lo muestran
        # las fotos del salón (S8 28–30); con 21 cm se leían como pilares de madera
        cz_, cx_ = (z0 + z1) / 2, (x0 + x1) / 2
        if largo_x: caja(f"mont_{nombre}_{k}", u-0.025, u+0.025, yv0, yv1, cz_-0.035, cz_+0.035, M_CARP)
        else:       caja(f"mont_{nombre}_{k}", cx_-0.035, cx_+0.035, yv0, yv1, u-0.025, u+0.025, M_CARP)
    if vano:                                                   # baby pilotis: en los ejes de la estructura (interpretación)
        for n_p, u in enumerate([k * CRUJIA / 2 for k in range(-4, 5) if vano[0] + 0.3 < k * CRUJIA / 2 < vano[1] - 0.3]):
            loc = (u, (z0 + z1) / 2, (yv0 + yv1) / 2) if largo_x else ((x0 + x1) / 2, u, (yv0 + yv1) / 2)
            bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.05, depth=yv1 - yv0, location=loc)
            o = bpy.context.object; o.name = f"fa_baby_piloti_{n_p}"; o.data.materials.append(M_BLANCO)
            bpy.ops.object.shade_smooth()

# ── cubierta: losa con los huecos REALES (fase 2): terraza abierta y rampa (interior de la U del DWG) ──
HUECOS_CUBIERTA = [(1.40, 9.5, -4.57, 4.78),          # terraza: jardín suspendido, abierto al cielo
                   circ.HUECO_RAMPA,                   # la rampa llega al solárium (el descanso también: 1,5 m de altura libre si no)
                   *circ.HUECOS_ESCALERA]              # la escalera llega adentro de su caja techada
for n,(x0,x1,z0,z1) in enumerate(villa_obra.rects_con_huecos(-W/2+0.23, W/2-0.23, -D/2+0.23, D/2-0.23, HUECOS_CUBIERTA)):
    caja(f"cubierta_{n}", x0, x1, Y_TECHO-0.01, Y_TECHO+E_CUBIERTA, z0, z1, M_BLANCO)
for nombre, x0,x1,z0,z1 in [("s",-W/2,W/2,D/2-0.22,D/2), ("n",-W/2,W/2,-D/2,-D/2+0.22),
                            ("e",W/2-0.22,W/2,-D/2+0.22,D/2-0.22), ("o",-W/2,-W/2+0.22,-D/2+0.22,D/2-0.22)]:
    caja(f"antepecho_{nombre}", x0,x1, Y_TECHO+0.001, Y_TECHO+H_REMATE, z0,z1, M_BLANCO)   # remate bajo: 22 cm sobre la cubierta

# ── pantallas del solárium, caja de la escalera y muros de la rampa: DESDE EL PLANO (fase 2) ──
# Antes: dos arcos a ojo (villaModel.ts) puestos sobre la terraza. Ahora: contornos del nivel 2 del DWG.
villa_obra.cubierta(Y_TECHO + E_CUBIERTA, H_PANTALLA, 1.05, M_BLANCO, esc.collection)
circ.tapas_escalera(Y_TECHO - 0.01, Y_TECHO + E_CUBIERTA, M_BLANCO, esc.collection, "cubierta_tapas_escalera")

# ── rampa y escalera: DESDE EL PLANO (fase 2) ─────────────────────────────
PISOS = [0.0, Y_LOSA, Y_TECHO + E_CUBIERTA]            # suelo · nivel principal · cubierta
circ.rampa(PISOS, M_BLANCO, esc.collection)
circ.escalera(PISOS, M_BLANCO, esc.collection)
circ.antepechos_escalera(PISOS, M_BLANCO, esc.collection, Y_TECHO + E_CUBIERTA + villa_obra.ALTO_ESCALERA - villa_obra.E_TECHO_ESCALERA)
circ.barandas(PISOS, esc.collection)

# ── terreno ───────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=160, location=(0,0,0)); bpy.context.object.name = "pradera"
bpy.context.object.data.materials.append(mat("pradera",(0.10,0.17,0.06),0.95))
# Antes: una losa de hormigón de 30x26 que se leía como parqueadero. La casa está sobre
# pasto; bajo la huella hay gravilla por donde entra el auto.
M_GRAVILLA = mat("gravilla", (0.50, 0.46, 0.40), 0.95)
caja("gravilla", -W/2 - 1.2, W/2 + 1.2, -0.02, 0.03, -D/2 - 1.2, D/2 + 1.2, M_GRAVILLA)
caja("camino", -1.6, 1.6, -0.02, 0.03, -D/2 - 1.2, -D/2 - 40, M_GRAVILLA)


# ══ CALIDAD (27-sep) — la villa es un hito: vende la luz y la materia, no las cajas ══════
# Alejandro: "parece de Roblox: no transmite la luz, los materiales se sienten planos".
def _nodos(m):
    nt = m.node_tree; b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord"); return nt, b, tc

def revoque(m, base, var=0.04, bump=0.035, escala=60.0):
    """Revoque pintado: el blanco nunca es plano; varía el tono y la rugosidad, y la luz rasante lo delata."""
    nt, b, tc = _nodos(m)
    ruido = nt.nodes.new("ShaderNodeTexNoise"); ruido.inputs["Scale"].default_value = escala; ruido.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Object"], ruido.inputs["Vector"])
    rampa = nt.nodes.new("ShaderNodeValToRGB")
    rampa.color_ramp.elements[0].color = (base[0]-var, base[1]-var, base[2]-var, 1)
    rampa.color_ramp.elements[1].color = (*base, 1)
    nt.links.new(ruido.outputs["Fac"], rampa.inputs["Fac"]); nt.links.new(rampa.outputs["Color"], b.inputs["Base Color"])
    fino = nt.nodes.new("ShaderNodeTexNoise"); fino.inputs["Scale"].default_value = escala * 6
    nt.links.new(tc.outputs["Object"], fino.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump
    nt.links.new(fino.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.5; mr.inputs["To Max"].default_value = 0.75
    nt.links.new(ruido.outputs["Fac"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])

def granular(m, c1, c2, escala, bump):
    """Pasto y gravilla: dos tonos mezclados por ruido + relieve de Voronoi."""
    nt, b, tc = _nodos(m)
    ruido = nt.nodes.new("ShaderNodeTexNoise"); ruido.inputs["Scale"].default_value = escala / 20; ruido.inputs["Detail"].default_value = 6
    nt.links.new(tc.outputs["Object"], ruido.inputs["Vector"])
    rampa = nt.nodes.new("ShaderNodeValToRGB")
    rampa.color_ramp.elements[0].color = (*c1, 1); rampa.color_ramp.elements[1].color = (*c2, 1)
    nt.links.new(ruido.outputs["Fac"], rampa.inputs["Fac"]); nt.links.new(rampa.outputs["Color"], b.inputs["Base Color"])
    vor = nt.nodes.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = escala
    nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump
    nt.links.new(vor.outputs["Distance"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])

revoque(M_BLANCO, (0.84, 0.82, 0.76))          # blanco cálido, no blanco de pantalla
revoque(M_VERDE, (0.05, 0.10, 0.06), var=0.015)
revoque(M_HORMIGON, (0.46, 0.45, 0.42), var=0.06, bump=0.08, escala=25)
granular(bpy.data.materials["pradera"], (0.06, 0.11, 0.03), (0.13, 0.19, 0.06), 400.0, 0.25)
granular(M_GRAVILLA, (0.44, 0.40, 0.34), (0.60, 0.56, 0.49), 180.0, 0.45)


def pbr(m, prefijo, metros, tinte=None, fuerza_normal=0.7):
    """Texturas escaneadas de Poly Haven. `metros` = lo que mide un mosaico en la realidad."""
    rutas = {k: os.path.join(ASSETS, f"{prefijo}_{k}_2k.jpg") for k in ("diff", "rough", "nor")}
    if not all(os.path.exists(r) for r in rutas.values()):
        print(f"[villa] faltan texturas de {prefijo}: sigue procedural"); return
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1/metros, 1/metros, 1/metros)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    def img(k, dato):
        n = nt.nodes.new("ShaderNodeTexImage"); n.image = bpy.data.images.load(rutas[k])
        n.projection = "BOX"; n.projection_blend = 0.25
        if dato: n.image.colorspace_settings.name = "Non-Color"
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"]); return n
    d, r, nn = img("diff", False), img("rough", True), img("nor", True)
    if tinte:   # el revoque de la Savoye es blanco cálido: la foto aporta variación, no el color
        bw = nt.nodes.new("ShaderNodeRGBToBW"); nt.links.new(d.outputs["Color"], bw.inputs["Color"])
        mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.88 if prefijo != "leafy_grass" else 0.55
        mr.inputs["To Max"].default_value = 1.04 if prefijo != "leafy_grass" else 1.30
        nt.links.new(bw.outputs["Val"], mr.inputs["Value"])
        mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
        mul.inputs["A"].default_value = (*tinte, 1)
        nt.links.new(mr.outputs["Result"], mul.inputs["B"]); nt.links.new(mul.outputs["Result"], b.inputs["Base Color"])
    else:
        nt.links.new(d.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(r.outputs["Color"], b.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = fuerza_normal
    nt.links.new(nn.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], b.inputs["Normal"])

# M_BLANCO y M_VERDE: villa_acabados (revoque sin mosaicos, en coordenadas de mundo), más abajo
pbr(bpy.data.materials["pradera"], "leafy_grass", 2.0, tinte=(0.13, 0.22, 0.06), fuerza_normal=1.0)   # la foto trae hojas secas: el prado de Poissy es verde
pbr(M_GRAVILLA, "gravel_floor", 1.6, tinte=(0.58, 0.55, 0.49), fuerza_normal=1.0)

# ── detalle: pasto con hebras, muebles LC, radiador, jardineras (scripts/villa_detalle.py) ──
sys.path.insert(0, os.path.join(RAIZ, "scripts"))
import villa_detalle
MU = villa_detalle.detallar(W, D, Y_LOSA, Y_TECHO)

# Biseles: una arista viva de CG no atrapa luz; un canto biselado de 1,5 cm sí.
for o in [o for o in esc.objects if o.type == "MESH" and o.name not in ("pradera",) and not o.name.startswith(("mu_", "pasto"))]:
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.select_set(False)
    # el revoque de la caja es continuo: biselar sus piezas por separado dibuja juntas que no existen
    if o.name.startswith(("sol", "herradura", "fa_", "antepecho", "cubierta", "losa", "pb_", "piloti", "cub_", "circ_", "cubierta", "n1_tabique_dintel", "pb_muro_dintel")): continue
    bv = o.modifiers.new("bisel", "BEVEL"); bv.width = 0.015; bv.segments = 2; bv.limit_method = "ANGLE"

# ── acabados de toda la obra (villa_acabados.py): lo aprendido en la prueba del rincón ─────
import villa_acabados
villa_acabados.aplicar(esc, ASSETS, M_BLANCO, M_VERDE, PISOS)
import villa_materia                                     # fase 3: materia por recinto, solo con evidencia
villa_materia.aplicar(esc.collection, Y_LOSA, Y_TECHO, H_PILOTIS)

# ── luz: el mismo HDRI del lab + sol calido ───────────────────────────────
mundo = bpy.data.worlds.new("cielo"); esc.world = mundo; mundo.use_nodes = True
nt = mundo.node_tree; nt.nodes.clear()
env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDR)
# ¿dónde está el sol del HDRI? (el píxel más brillante de una copia reducida)
_an = bpy.data.images.load(HDR); _an.scale(256, 128); _px = list(_an.pixels); _w, _h = 256, 128
_i = max(range(_w*_h), key=lambda k: _px[4*k] + _px[4*k+1] + _px[4*k+2]); _u, _v = (_i % _w + 0.5)/_w, (_i // _w + 0.5)/_h
AZ_SOL_HDRI = (_u - 0.5) * 2 * math.pi; ELEV_SOL = (_v - 0.5) * math.pi
print(f"[villa] sol del HDRI: azimut {math.degrees(AZ_SOL_HDRI):.0f}°, elevación {math.degrees(ELEV_SOL):.0f}°")
# El sol entra por el SE de la cámara de aproximación: ilumina la fachada este de lleno, deja la
# sur en sombra propia (contraste) y tira las sombras de los pilotis en diagonal sobre la gravilla visible.
PHI_SOL = math.radians(float(os.environ.get("VILLA_SOL_AZ", "-38")))     # rumbo en el plano, desde +X
ELEV_OBJ = math.radians(float(os.environ.get("VILLA_SOL_EL", "34")))     # alto: entra por la cinta de ventanas
AZ_OBJETIVO = math.pi - PHI_SOL
mp_w = nt.nodes.new("ShaderNodeMapping"); tc_w = nt.nodes.new("ShaderNodeTexCoord")
mp_w.inputs["Rotation"].default_value = (0, 0, AZ_SOL_HDRI - AZ_OBJETIVO + math.radians(float(os.environ.get("VILLA_HDRI_GIRO", "0"))))
# VILLA_HDRI_GIRO: gira solo el fondo. Se puede porque el sol del HDRI va recortado y la sombra la pone la lámpara.
nt.links.new(tc_w.outputs["Generated"], mp_w.inputs["Vector"]); nt.links.new(mp_w.outputs["Vector"], env.inputs["Vector"])
bg = nt.nodes.new("ShaderNodeBackground"); bg.inputs["Strength"].default_value = 0.55 if MODO == "dia" else 0.018
sal = nt.nodes.new("ShaderNodeOutputWorld")
# El HDRI trae su propio sol (miles de veces más brillante que el cielo) y, rotado, pegaba de frente
# en las dos fachadas por igual: por eso todo se veía nublado aunque la lámpara fuera fuerte.
# Se recorta: el cielo queda solo de relleno azulado y el sol lo pone la lámpara, que sí marca sombra.
tope = nt.nodes.new("ShaderNodeVectorMath"); tope.operation = "MINIMUM"
tope.inputs[1].default_value = (1.6, 1.6, 1.6)
nt.links.new(env.outputs["Color"], tope.inputs[0]); nt.links.new(tope.outputs["Vector"], bg.inputs["Color"])
nt.links.new(bg.outputs["Background"], sal.inputs["Surface"])

import mathutils
# Día: sol nítido alineado con el sol del cielo → sombra contundente. Noche: luna fría y alta.
if MODO == "dia":
    sd = bpy.data.lights.new("sol", type="SUN"); sd.energy = 16.0   # sol:cielo ~8:1, como afuera; con 4 el cielo lo aplanaba
    sd.color = (1.0, 0.88, 0.74); sd.angle = math.radians(0.5)
    dir_sol = mathutils.Vector((math.cos(PHI_SOL), math.sin(PHI_SOL), math.tan(ELEV_OBJ)))
else:
    sd = bpy.data.lights.new("luna", type="SUN"); sd.energy = 0.22
    sd.color = (0.62, 0.72, 1.0); sd.angle = math.radians(0.6)
    dir_sol = mathutils.Vector((-20, 30, 34))
sol = bpy.data.objects.new("sol", sd); esc.collection.objects.link(sol)
sol.rotation_euler = mathutils.Vector(dir_sol).to_track_quat("Z","Y").to_euler()

if MODO == "noche":
    # La luz artificial de la casa: cálida (2700 K) en los cuartos del nivel principal —la cinta de
    # ventanas brilla desde afuera— y en el vestíbulo curvo bajo los pilotis.
    CALIDA = (1.0, 0.70, 0.42)
    def luz_area(nombre, x, z, y, w, energia):
        ld = bpy.data.lights.new(nombre, type="AREA"); ld.energy = energia; ld.color = CALIDA
        ld.shape = "SQUARE"; ld.size = w
        o = bpy.data.objects.new(nombre, ld); esc.collection.objects.link(o)
        o.location = (x, z, y)                               # apunta hacia abajo por defecto
    # Bombillos colgantes (puntuales), no paneles hacia abajo: desde el pasto el ojo ve el TECHO de los
    # cuartos por la cinta, y un panel que apunta al piso lo deja negro. El bombillo lo baña.
    def bombillo(nombre, x, z, y, energia):
        ld = bpy.data.lights.new(nombre, type="POINT"); ld.energy = energia; ld.color = CALIDA
        ld.shadow_soft_size = 0.2
        o = bpy.data.objects.new(nombre, ld); esc.collection.objects.link(o); o.location = (x, z, y)
    for n, (x, z) in enumerate([(-6.5, 7.5), (-6.5, -7.5), (4.5, 8.0), (4.5, -8.0), (-6.8, 0.0), (-3.5, 8.3), (-3.5, -8.3),
                                (-2.2, 8.4), (7.4, 6.4), (0.9, 9.4)]):
        bombillo(f"cuarto_{n}", x, z, Y_TECHO - 0.6, 380)
    for n, (x, z) in enumerate([(0.3, 1.0), (-2.5, 3.0), (2.8, -1.2)]):
        luz_area(f"vestibulo_{n}", x, z, H_RDC - 0.1, 1.2, 260)
    for n, (x, z) in enumerate([(-6, 6), (6, 6), (-6, -6), (6, -6)]):
        luz_area(f"bajo_losa_{n}", x, z, H_PILOTIS - 0.05, 0.8, 45)   # el porche bajo la caja, apenas

# ── camara: el encuadre de aproximacion ───────────────────────────────────
cam_d = bpy.data.cameras.new("cam"); cam_d.lens = 40
cam = bpy.data.objects.new("cam", cam_d); esc.collection.objects.link(cam); esc.camera = cam
cam_d.lens = 50; cam_d.shift_y = 0.12
cam.location = (32.0, 38.0, 1.7)                       # a la altura del ojo, no desde un dron
yaw = math.atan2(-(0 - cam.location.x), (0 - cam.location.y)) if False else math.pi - math.atan2(cam.location.x, cam.location.y)
cam.rotation_euler = (math.pi / 2, 0, yaw)              # cámara horizontal: las verticales no se inclinan
if os.environ.get("VILLA_CAM") == "interior":             # dentro del salón, mirando a la terraza
    cam_d.lens = 22; cam_d.shift_y = 0.0
    cam.location = (0.6, 10.1, Y_LOSA + 1.35)             # desde el comedor hacia las LC2, la LC4 y la terraza
    cam.rotation_euler = (math.radians(84), 0, math.radians(-128))
    esc.view_settings.exposure = 1.1 if MODO == "dia" else -0.6   # de noche los bombillos están EN cuadro: 0.8 quemaba todo a durazno

if os.environ.get("VILLA_CAM") == "planta":                # verificación de obra: planta baja vista desde arriba
    cam_d.type = "ORTHO"; cam_d.ortho_scale = 26; cam_d.shift_y = 0
    cam.location = (0, 0, 40); cam.rotation_euler = (0, 0, 0)
    for o in esc.objects:
        if o.type in ("MESH", "CURVE") and o.name != "pradera":
            zmin = min((o.matrix_world @ mathutils.Vector(c)).z for c in o.bound_box)
            if zmin > float(os.environ.get("VILLA_CORTE", H_PILOTIS - 0.05)): o.hide_render = True

if os.environ.get("VILLA_CAM") in ("aerea", "rampa", "hall", "pasto", "libre"):      # verificación de obra en 3/4, desde arriba
    cam_d.lens = 35; cam_d.shift_y = 0
    mira = mathutils.Vector((0, 0, Y_TECHO))
    cam.location = (22.0, 26.0, 21.0)
    if os.environ["VILLA_CAM"] == "libre":                   # cualquier punto: VILLA_CAM_POS="x,y,z" VILLA_CAM_MIRA="x,y,z"
        cam_d.lens = float(os.environ.get("VILLA_CAM_LENTE", "35"))
        cam.location = tuple(float(v) for v in os.environ["VILLA_CAM_POS"].split(","))
        mira = mathutils.Vector(tuple(float(v) for v in os.environ["VILLA_CAM_MIRA"].split(",")))
    if os.environ["VILLA_CAM"] == "pasto":                   # verificación del pasto: a ras, mirando la casa
        cam_d.lens = 35; cam.location, mira = (12.0, 17.0, 0.55), mathutils.Vector((4.0, 8.0, 1.2))
        if os.environ.get("VILLA_PASTO_CERCA"):                 # a 40 cm del suelo, mirando el pasto de cerca
            cam_d.lens = 50; cam.location, mira = (12.0, 17.0, 0.35), mathutils.Vector((10.5, 14.8, 0.0))
    if os.environ["VILLA_CAM"] == "hall":                    # de pie en el vestíbulo, mirando la rampa (la foto clásica)
        cam_d.lens = 18; cam.location, mira = (1.9, 4.6, 1.6), mathutils.Vector((-0.4, -3.0, 2.2))
    if os.environ["VILLA_CAM"] == "rampa":                   # rampa y escalera, con VILLA_CORTE para quitar la cubierta
        cam.location, mira = (9.0, 10.0, 13.0), mathutils.Vector((-1.5, -1.5, 2.5))
    cam.rotation_euler = (mira - cam.location).to_track_quat("-Z", "Y").to_euler()
    if "VILLA_CORTE" in os.environ:
        for o in esc.objects:
            if o.type in ("MESH", "CURVE") and o.name != "pradera":
                zmin = min((o.matrix_world @ mathutils.Vector(c)).z for c in o.bound_box)
                if zmin > float(os.environ["VILLA_CORTE"]): o.hide_render = True

if os.environ.get("VILLA_CAM") == "corte":                 # corte longitudinal por el pozo de la rampa (como el B-B)
    cx = float(os.environ.get("VILLA_CORTE_X", "0.6"))       # el plano de corte = clip_start de una cámara ortográfica
    cam_d.type = "ORTHO"; cam_d.ortho_scale = 24; cam_d.shift_y = 0
    cam.location = (cx + 30.0, -1.0, 4.5); cam.rotation_euler = (math.pi / 2, 0, math.pi / 2)
    cam_d.clip_start, cam_d.clip_end = 30.0, 80.0
    if "VILLA_CORTE_Z" in os.environ:                       # corte transversal (plano Y del Blender = z del plano)
        cz = float(os.environ["VILLA_CORTE_Z"]); cam_d.ortho_scale = 11
        cam.location = (-3.5, cz + 30.0, 3.4); cam.rotation_euler = (math.pi / 2, 0, math.pi)

# ── render ────────────────────────────────────────────────────────────────
esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    if os.environ.get("VILLA_CPU"): raise RuntimeError("CPU pedida por VILLA_CPU")
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print("[villa] METAL no disponible:", e); esc.cycles.device = "CPU"
esc.cycles.samples = int(os.environ.get("VILLA_MUESTRAS", "160"))
esc.cycles.use_denoising = True
esc.view_settings.view_transform = "AgX"
if os.environ.get("VILLA_CAM") not in ("interior", "hall"): esc.view_settings.exposure = -0.1 if MODO == "dia" else 1.2
if os.environ.get("VILLA_CAM") == "hall": esc.view_settings.exposure = 1.3
if "VILLA_EXPO" in os.environ: esc.view_settings.exposure = float(os.environ["VILLA_EXPO"])   # solo para verificar zonas oscuras
try: esc.view_settings.look = "AgX - Punchy"
except Exception: pass
esc.render.resolution_x, esc.render.resolution_y = 1280, 800
esc.render.resolution_percentage = int(os.environ.get("VILLA_PCT", "100"))
esc.render.image_settings.file_format = "PNG"
esc.render.filepath = OUT
if os.environ.get("VILLA_CAM") not in ("rincon", "planta", "corte", "rampa") and os.environ.get("VILLA_RETOQUE", "1") == "1":
    import villa_lookdev; villa_lookdev.retoque(esc)       # brillo, aberración y viñeta: lo que hace que parezca FOTO
if os.environ.get("VILLA_CAM") == "rincon":               # prueba de techo de calidad (scripts/villa_lookdev.py)
    import villa_lookdev
    villa_lookdev.aplicar(esc, cam, cam_d, Y_TECHO + E_CUBIERTA)
for _pref in [p for p in os.environ.get("VILLA_OCULTAR", "").split(",") if p]:   # depuración: ocultar por prefijo
    for _o in esc.objects:
        if _o.name.startswith(_pref): _o.hide_render = True
if "VILLA_INSPECT" in os.environ:                     # depuración: qué objetos hay alrededor de un punto
    px, py, pz = (float(v) for v in os.environ["VILLA_INSPECT"].split(","))
    for o in esc.objects:
        if o.type != "MESH": continue
        bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        if all(min(v[i] for v in bb) - 0.4 <= p <= max(v[i] for v in bb) + 0.4 for i, p in enumerate((px, py, pz))):
            usos = {}
            for pol in o.data.polygons:
                m = o.data.materials[pol.material_index].name if o.data.materials else "-"; usos[m] = usos.get(m, 0) + 1
            print("[inspect]", o.name, [round(min(v[i] for v in bb), 2) for i in range(3)], [round(max(v[i] for v in bb), 2) for i in range(3)], usos)
    raise SystemExit(0)
print(f"[villa] objetos: {len(esc.objects)} · renderizando…")
bpy.ops.render.render(write_still=True)
print(f"[villa] ✓ {OUT}")
