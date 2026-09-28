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
HDR = os.environ.get("VILLA_HDR", os.path.join(ASSETS, "ballawley_park_4k.hdr"))
if not os.path.exists(HDR): HDR = os.path.join(RAIZ, "public/lab/villa-savoye/sky_1k.hdr")
OUT = os.environ.get("VILLA_OUT", os.path.join(RAIZ, "artefactos-bake/prueba-villa.png"))

# ── PLANTA.md §1 ──────────────────────────────────────────────────────────
CRUJIA, VOLADIZO = 4.75, 1.125
W, D = CRUJIA * 4, CRUJIA * 4 + VOLADIZO * 2   # 19.0 x 21.25
H_PILOTIS, H_BANDA_INF, H_VENTANA, H_BANDA_SUP = 3.3, 0.55, 1.2, 1.5
H_VOL = H_BANDA_INF + H_VENTANA + H_BANDA_SUP
Y_LOSA, Y_TECHO = H_PILOTIS + 0.15, H_PILOTIS + H_VOL
T_TAB = 0.15

# ── PLANTA.md §2: los tabiques, con sus huecos de puerta ──────────────────
TABIQUES = [
    ("z", 4.78, 0.1, 9.5, [(4.0, 7.0)], True),
    ("z", 4.78, -9.5, 0.1, [(-8.9, -8.0)], False),
    ("x", -4.79, 4.78, 10.63, [(6.4, 7.3)], False),
    ("x", 0.1, -4.83, 4.78, [(1.2, 3.0)], False),
    ("x", -1.5, -7.0, 4.78, [], False),
    ("z", -4.83, 1.36, 9.5, [], False),
    ("x", 4.47, -10.63, -4.83, [(-7.6, -6.7)], False),
    ("x", 1.36, -10.63, -4.83, [], False),
    ("x", -5.12, -10.63, 4.78, [(-9.6, -8.7), (-3.6, -2.7), (2.6, 3.5)], False),
    ("z", -4.99, -9.5, -5.12, [(-7.6, -6.7)], False),
    ("z", 1.92, -9.5, -5.12, [], False),
    ("z", -6.17, -5.12, 1.36, [(-3.4, -2.5)], False),
    ("z", -0.28, -5.12, -1.5, [(-4.4, -3.5)], False),
]
LOSA = [(-9.5,-1.5,-10.625,-4.57),(0.1,9.5,-10.625,-4.57),(-1.5,0.1,-10.625,-7.0),
        (-9.5,-1.5,4.78,10.625),(0.1,9.5,4.78,10.625),(-1.5,0.1,4.78,10.625),
        (-9.5,-1.5,-4.57,2.4),(0.1,1.4,-4.57,2.4),(-6.35,-1.5,2.4,4.78),(0.1,1.4,2.4,4.78)]
VACIO_RAMPA = (-1.5, 0.1, -7.0, 4.78)

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

# ── planta baja: la herradura + el bloque de servicio ─────────────────────
H_RDC = H_PILOTIS - 0.2
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=6.5, depth=H_RDC,
                                    location=(0.3, 1.0, H_RDC/2))
herradura = bpy.context.object; herradura.name = "herradura"
bpy.ops.object.modifier_add(type='SOLIDIFY'); herradura.modifiers[-1].thickness = 0.06
herradura.data.materials.append(M_VIDRIO)
caja("bloque_servicio", -8.7, -3.5, 0, H_RDC, -6.8, -0.4, M_VERDE)

# ── pilotis ───────────────────────────────────────────────────────────────
for i in range(5):
    for j in range(5):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.16, depth=H_PILOTIS,
            location=((i-2)*(W/4-0.8), (j-2)*(D/4-0.8), H_PILOTIS/2))
        bpy.context.object.data.materials.append(M_BLANCO)

# ── losa del nobile, en paneles alrededor del vacio de la rampa ───────────
vx0, vx1, vz0, vz1 = VACIO_RAMPA
for n,(x0,x1,z0,z1) in enumerate([(-W/2,vx0,-D/2,D/2),(vx1,W/2,-D/2,D/2),
                                  (vx0,vx1,-D/2,vz0),(vx0,vx1,vz1,D/2)]):
    caja(f"losa_nobile_{n}", x0, x1, H_PILOTIS, Y_LOSA, z0, z1, M_PISO)

# ── tabiques con sus huecos ───────────────────────────────────────────────
for n,(eje, v, a, b, puertas, vidrio) in enumerate(TABIQUES):
    material = M_VIDRIO if vidrio else (M_ROSA if n == 2 else M_AZUL if n == 1 else M_BLANCO)
    for u, w in tramos(a, b, puertas):
        # Los tabiques paran 2 cm antes de la cara interior de la fachada: si llegan justo
        # al mismo plano, Cycles dibuja una línea negra (dos caras en el mismo lugar).
        if eje == "x":
            u, w = max(u, -D/2+0.21), min(w, D/2-0.21)
            caja(f"tab{n}", v-T_TAB/2, v+T_TAB/2, Y_LOSA, Y_TECHO-0.01, u, w, material)
        else:
            u, w = max(u, -W/2+0.21), min(w, W/2-0.21)
            caja(f"tab{n}", u, w, Y_LOSA, Y_TECHO-0.01, v-T_TAB/2, v+T_TAB/2, material)

# ── fachadas: banda inferior, cinta de vidrio continua, banda superior ────
yv0, yv1 = H_PILOTIS + H_BANDA_INF, H_PILOTIS + H_BANDA_INF + H_VENTANA
for nombre, x0, x1, z0, z1 in [("sur",-W/2,W/2,D/2-0.19,D/2), ("norte",-W/2,W/2,-D/2,-D/2+0.19),
                               ("este",W/2-0.19,W/2,-D/2+0.19,D/2-0.19), ("oeste",-W/2,-W/2+0.19,-D/2+0.19,D/2-0.19)]:
    caja(f"fa_{nombre}_inf", x0,x1, H_PILOTIS, yv0, z0,z1, M_BLANCO)
    caja(f"fa_{nombre}_sup", x0,x1, yv1, Y_TECHO, z0,z1, M_BLANCO)
    caja(f"fa_{nombre}_vid", x0,x1, yv0, yv1, z0+0.06, z1-0.06, M_VIDRIO)
    # montantes de carpintería cada ~1.1 m (mismo paso que villaModel.ts)
    largo_x = (x1 - x0) > (z1 - z0)
    a, b = (x0, x1) if largo_x else (z0, z1)
    n_m = max(1, int((b - a) / 1.1))
    for k in range(n_m + 1):
        u = a + (b - a) * k / n_m
        if largo_x: caja(f"mont_{nombre}_{k}", u-0.03, u+0.03, yv0, yv1, z0-0.01, z1+0.01, M_CARP)
        else:       caja(f"mont_{nombre}_{k}", x0-0.01, x1+0.01, yv0, yv1, u-0.03, u+0.03, M_CARP)

# ── cubierta ──────────────────────────────────────────────────────────────
for n,(x0,x1,z0,z1) in enumerate(LOSA):
    x0, x1 = max(x0, -W/2+0.23), min(x1, W/2-0.23); z0, z1 = max(z0, -D/2+0.23), min(z1, D/2-0.23)
    caja(f"cubierta_{n}", x0, x1, Y_TECHO-0.01, Y_TECHO+0.34, z0, z1, M_BLANCO)
for nombre, x0,x1,z0,z1 in [("s",-W/2,W/2,D/2-0.22,D/2), ("n",-W/2,W/2,-D/2,-D/2+0.22),
                            ("e",W/2-0.22,W/2,-D/2+0.22,D/2-0.22), ("o",-W/2,-W/2+0.22,-D/2+0.22,D/2-0.22)]:
    caja(f"antepecho_{nombre}", x0,x1, Y_TECHO+0.001, Y_TECHO+1.05, z0,z1, M_BLANCO)

# ── pantallas curvas del solárium (villaModel.ts, misma conversión de ejes que caja()) ──
def pantalla(nombre, r, h, cx, cz, theta0, largo, y_base, segs=48, grosor=0.14):
    import bmesh
    me = bpy.data.meshes.new(nombre); o = bpy.data.objects.new(nombre, me)
    esc.collection.objects.link(o); bm = bmesh.new(); vs = []
    for k in range(segs + 1):
        th = theta0 + largo * k / segs
        x, z = cx + r * math.sin(th), cz + r * math.cos(th)   # three.js: x=r·sinθ, z=r·cosθ
        vs.append((bm.verts.new((x, z, y_base)), bm.verts.new((x, z, y_base + h))))
    for k in range(segs):
        bm.faces.new((vs[k][0], vs[k+1][0], vs[k+1][1], vs[k][1]))
    bm.to_mesh(me); bm.free()
    o.modifiers.new("grosor", "SOLIDIFY").thickness = grosor
    o.data.materials.append(M_BLANCO); return o
pantalla("sol1", 4.6, 2.6, -1.5, -2.0, math.pi*0.05, math.pi*1.15, Y_TECHO + 0.35)
pantalla("sol2", 3.1, 2.2,  4.8, -2.2, math.pi*1.10, math.pi*0.85, Y_TECHO + 0.35)

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

pbr(M_BLANCO, "painted_plaster_wall", 2.5, tinte=(0.84, 0.82, 0.76), fuerza_normal=0.35)
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
    if o.name.startswith(("sol", "herradura", "fa_", "antepecho", "cubierta", "losa")): continue
    bv = o.modifiers.new("bisel", "BEVEL"); bv.width = 0.015; bv.segments = 2; bv.limit_method = "ANGLE"

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
mp_w.inputs["Rotation"].default_value = (0, 0, AZ_SOL_HDRI - AZ_OBJETIVO)
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

# ── render ────────────────────────────────────────────────────────────────
esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print("[villa] METAL no disponible:", e); esc.cycles.device = "CPU"
esc.cycles.samples = int(os.environ.get("VILLA_MUESTRAS", "160"))
esc.cycles.use_denoising = True
esc.view_settings.view_transform = "AgX"
if os.environ.get("VILLA_CAM") != "interior": esc.view_settings.exposure = -0.1 if MODO == "dia" else 1.2
try: esc.view_settings.look = "AgX - Punchy"
except Exception: pass
esc.render.resolution_x, esc.render.resolution_y = 1280, 800
esc.render.resolution_percentage = int(os.environ.get("VILLA_PCT", "100"))
esc.render.image_settings.file_format = "PNG"
esc.render.filepath = OUT
print(f"[villa] objetos: {len(esc.objects)} · renderizando…")
bpy.ops.render.render(write_still=True)
print(f"[villa] ✓ {OUT}")
