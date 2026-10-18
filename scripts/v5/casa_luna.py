# Hero v5 (18-oct-2026): "Luz prestada". Una casa de piedra negra, nogal y cuarzo frente a un espejo de agua, de noche.
# Con el scroll sale la luna creciente (la C), su luz dibuja los bordes y brilla en el agua, la cámara se acerca y al
# final se encienden las luces de adentro (llegó una consulta). Exporta además las posiciones 2D de la luna y de las
# anclas del plano por cuadro, y una pasada de líneas (Freestyle) del último cuadro para el capítulo "del render al plano".
#
# Uso:  blender -b -P scripts/v5/casa_luna.py -- <salida_dir> [cuadros=1-120] [muestras=64] [ancho=1600] [pasada=render]
#   pasada: render | lineas | datos
import bpy, math, os, sys, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SALIDA = os.path.abspath(ARGS[0] if ARGS else "/tmp/casa")
CUADROS = ARGS[1] if len(ARGS) > 1 else "1-120"
MUESTRAS = int(ARGS[2]) if len(ARGS) > 2 else 64
ANCHO = int(ARGS[3]) if len(ARGS) > 3 else 1600
PASADA = ARGS[4] if len(ARGS) > 4 else "render"
MAT = os.path.expanduser("~/CastilloStudio/marca/materiales-2026-10")
N = 120

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene; esc.frame_start, esc.frame_end = 1, N


# ---------- materiales ----------
def material(nombre):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    nodos = m.node_tree.nodes
    return m, nodos, m.node_tree.links, next(n for n in nodos if n.type == "BSDF_PRINCIPLED")


def con_imagen(nombre, archivo, escala, rugosidad, capa, oscurecer=1.0):
    m, nodos, ln, b = material(nombre)
    t = nodos.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(MAT, archivo)); t.interpolation = "Cubic"
    t.projection = "BOX"; t.projection_blend = 0.2
    tc = nodos.new("ShaderNodeTexCoord"); mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (escala,) * 3
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], t.inputs["Vector"])
    mul = nodos.new("ShaderNodeMixRGB"); mul.blend_type = "MULTIPLY"; mul.inputs["Fac"].default_value = 1.0
    mul.inputs["Color2"].default_value = (oscurecer,) * 3 + (1,)
    ln.new(t.outputs["Color"], mul.inputs["Color1"]); ln.new(mul.outputs[0], b.inputs["Base Color"])
    bmp = nodos.new("ShaderNodeBump"); bmp.inputs["Strength"].default_value = 0.06; bmp.inputs["Distance"].default_value = 0.002
    ln.new(t.outputs["Color"], bmp.inputs["Height"]); ln.new(bmp.outputs[0], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = rugosidad; b.inputs["Coat Weight"].default_value = capa; b.inputs["Coat Roughness"].default_value = 0.05
    return m


def nogal():
    m, nodos, ln, b = material("nogal")
    tc = nodos.new("ShaderNodeTexCoord"); mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.4, 1.4, 14)
    w = nodos.new("ShaderNodeTexWave"); w.wave_type = "BANDS"; w.bands_direction = "Z"
    w.inputs["Distortion"].default_value = 4.0; w.inputs["Detail"].default_value = 6; w.inputs["Detail Scale"].default_value = 1.5
    r = nodos.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (0.03, 0.014, 0.007, 1); r.color_ramp.elements[1].color = (0.16, 0.08, 0.038, 1)
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], w.inputs["Vector"])
    ln.new(w.outputs["Fac"], r.inputs["Fac"]); ln.new(r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.38; b.inputs["Coat Weight"].default_value = 0.35
    return m


def plano_color(nombre, color, rug=0.5, metal=0.0):
    m, _, _, b = material(nombre)
    b.inputs["Base Color"].default_value = color + (1,); b.inputs["Roughness"].default_value = rug; b.inputs["Metallic"].default_value = metal
    return m


def vidrio():
    m, _, _, b = material("vidrio")
    b.inputs["Base Color"].default_value = (0.75, 0.8, 0.82, 1); b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = 0.03; b.inputs["IOR"].default_value = 1.45
    return m


def agua():
    m, nodos, ln, b = material("agua")
    b.inputs["Base Color"].default_value = (0.004, 0.005, 0.007, 1); b.inputs["Roughness"].default_value = 0.05; b.inputs["IOR"].default_value = 1.33
    tc = nodos.new("ShaderNodeTexCoord"); nz = nodos.new("ShaderNodeTexNoise"); nz.noise_dimensions = "4D"
    nz.inputs["Scale"].default_value = 3.2; nz.inputs["Detail"].default_value = 4
    ln.new(tc.outputs["Object"], nz.inputs["Vector"])
    nz.inputs["W"].default_value = 0.0; nz.inputs["W"].keyframe_insert("default_value", frame=1)
    nz.inputs["W"].default_value = 1.6; nz.inputs["W"].keyframe_insert("default_value", frame=N)
    bmp = nodos.new("ShaderNodeBump"); bmp.inputs["Strength"].default_value = 0.12; bmp.inputs["Distance"].default_value = 0.02
    ln.new(nz.outputs["Fac"], bmp.inputs["Height"]); ln.new(bmp.outputs[0], b.inputs["Normal"])
    return m


def emisivo(nombre, color, fuerza):
    m = bpy.data.materials.new(nombre); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL": nt.nodes.remove(n)
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs["Color"].default_value = color + (1,); e.inputs["Strength"].default_value = fuerza
    nt.links.new(e.outputs[0], next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL").inputs[0])
    return m, e


def caja(nombre, tam, loc, m, bisel=0.012):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.name = nombre
    o.scale = tuple(v / 2 for v in tam); bpy.ops.object.transform_apply(scale=True); o.data.materials.append(m)
    if bisel:
        bpy.ops.object.modifier_add(type="BEVEL"); o.modifiers[-1].width = bisel; o.modifiers[-1].segments = 2
    return o


M_PIEDRA = con_imagen("piedra", "piedra-2x.png", 0.35, 0.18, 0.7)
M_PISO = con_imagen("piso", "piedra-2x.png", 0.12, 0.08, 0.9, 0.8)
M_CUARZO = con_imagen("cuarzo", "cuarzo-2x.png", 0.45, 0.12, 0.5)
M_NOGAL = nogal()
M_ACERO = plano_color("acero", (0.02, 0.02, 0.022), 0.35, 1.0)
M_TIERRA = plano_color("tierra", (0.0012, 0.0014, 0.0013), 1.0)
next(n for n in M_TIERRA.node_tree.nodes if n.type == "BSDF_PRINCIPLED").inputs["Specular IOR Level"].default_value = 0.0   # sin brillo rasante
M_VIDRIO = vidrio()
M_AGUA = agua()

# ---------- sitio ----------
caja("tierra", (220, 220, 0.2), (0, 40, -0.12), M_TIERRA, 0)
caja("plaza", (26, 13, 0.1), (1.5, 2.0, -0.05), M_PISO, 0)
# espejo de agua frente a la casa, con borde de cuarzo
caja("agua", (70, 41, 0.06), (0.5, -24.8, -0.015), M_AGUA, 0)   # el agua llega hasta la cámara: no hay borde cercano
for nombre, tam, loc in (("borde_n", (70, 0.3, 0.1), (0.5, -4.35, -0.01)),):
    caja(nombre, tam, loc, M_CUARZO, 0.004)

# ---------- la casa ----------
caja("plinto", (22, 9.5, 0.55), (0, 1.2, 0.27), M_PIEDRA)
Z1, H1 = 0.55, 3.1                      # piso 1: caja de vidrio retranqueada
caja("piso1", (15.5, 7.2, 0.06), (-0.5, 1.4, Z1 + 0.03), M_CUARZO, 0)
caja("vidrio_f", (15.5, 0.04, H1), (-0.5, -2.2, Z1 + H1 / 2), M_VIDRIO, 0)
caja("vidrio_o", (0.04, 7.2, H1), (-8.25, 1.4, Z1 + H1 / 2), M_VIDRIO, 0)
caja("muro_nogal", (15.5, 0.25, H1), (-0.5, 4.9, Z1 + H1 / 2), M_NOGAL)
caja("nucleo_nogal", (3.2, 3.2, H1), (3.6, 2.9, Z1 + H1 / 2), M_NOGAL)
caja("isla_cuarzo", (4.2, 1.1, 0.95), (-3.2, 0.9, Z1 + 0.48), M_CUARZO)
caja("banca_piedra", (6.0, 0.7, 0.42), (-0.5, 4.3, Z1 + 0.21), M_PIEDRA)
for i, x in enumerate((-8.0, -3.0, 2.0, 7.0)):    # pilotis finos de acero
    caja(f"piloti{i}", (0.16, 0.16, H1), (x, -2.0, Z1 + H1 / 2), M_ACERO, 0.004)
# piso 2: volumen de piedra en voladizo sobre el agua
Z2, H2 = Z1 + H1, 3.3
VX0, VX1, VY = -9.5, 14.5, 1.3                      # volumen de 24 m, ventana corrida de -5.5 a 7.5
WX0, WX1, WZ0, WZ1 = -5.5, 7.5, 0.8, 2.3
caja("vol_bajo", (24, 8.2, WZ0), (2.5, VY, Z2 + WZ0 / 2), M_PIEDRA)
caja("vol_alto", (24, 8.2, H2 - WZ1), (2.5, VY, Z2 + (WZ1 + H2) / 2), M_PIEDRA)
caja("vol_izq", (WX0 - VX0, 8.2, WZ1 - WZ0), ((VX0 + WX0) / 2, VY, Z2 + (WZ0 + WZ1) / 2), M_PIEDRA)
caja("vol_der", (VX1 - WX1, 8.2, WZ1 - WZ0), ((VX1 + WX1) / 2, VY, Z2 + (WZ0 + WZ1) / 2), M_PIEDRA)
caja("vol_fondo", (WX1 - WX0, 7.4, WZ1 - WZ0), ((WX0 + WX1) / 2, VY + 0.4, Z2 + (WZ0 + WZ1) / 2), M_PIEDRA)
caja("sofito_nogal", (15.4, 7.0, 0.05), (-0.5, 1.4, Z2 - 0.02), M_NOGAL, 0)
# ventana corrida en la fachada del piso 2, con celosía de nogal y luz cálida detrás
LISTONES = []
for i in range(40):
    x = -5.35 + i * 0.32
    LISTONES.append(caja(f"liston{i}", (0.07, 0.14, 1.5), (x, -2.62, Z2 + 1.55), M_NOGAL, 0.003))
M_LUZ2, E_LUZ2 = emisivo("luz_piso2", (1.0, 0.62, 0.32), 0.0)
caja("luz_piso2", (12.9, 0.05, 1.48), (1.0, -2.3, Z2 + 1.55), M_LUZ2, 0)
# luz cálida del piso 1 (se enciende al final) + franja en el sofito
M_FRANJA, E_FRANJA = emisivo("franja", (1.0, 0.7, 0.42), 0.0)
caja("franja", (14.5, 0.08, 0.02), (-0.5, -1.6, Z2 - 0.05), M_FRANJA, 0)
LUCES_DENTRO = []
for x in (-5.5, -0.5, 4.5):
    bpy.ops.object.light_add(type="AREA", location=(x, 1.6, Z2 - 0.15)); l = bpy.context.object
    l.data.shape = "RECTANGLE"; l.data.size = 4.2; l.data.size_y = 5.0; l.data.color = (1.0, 0.7, 0.44); l.data.energy = 0
    LUCES_DENTRO.append(l)

# cerros oscuros al fondo: el horizonte deja de ser una línea recta
bpy.ops.mesh.primitive_grid_add(x_subdivisions=900, y_subdivisions=2, size=1, location=(0, 95, 0)); cerro = bpy.context.object
cerro.scale = (420, 16, 1); cerro.rotation_euler = (math.radians(90), 0, 0); bpy.ops.object.transform_apply(scale=True, rotation=True)
txc = bpy.data.textures.new("cerros", "CLOUDS"); txc.noise_scale = 1.4; txc.noise_depth = 1
bpy.ops.object.modifier_add(type="DISPLACE"); cerro.modifiers[-1].texture = txc; cerro.modifiers[-1].direction = "Z"; cerro.modifiers[-1].strength = 7
cerro.modifiers[-1].texture_coords = "GLOBAL"
bpy.ops.mesh.primitive_cube_add(location=(0, 96, -4)); base = bpy.context.object; base.scale = (220, 1, 6)
M_CERRO = plano_color("cerro", (0.0016, 0.0019, 0.0024), 1.0); next(n for n in M_CERRO.node_tree.nodes if n.type == "BSDF_PRINCIPLED").inputs["Specular IOR Level"].default_value = 0.0; cerro.data.materials.append(M_CERRO); base.data.materials.append(M_CERRO)

# ---------- cámara: se acerca y se corre a la derecha ----------
bpy.ops.object.camera_add(location=(-7.0, -37.0, 1.7)); cam = bpy.context.object; esc.camera = cam
cam.data.lens = 32
mira = bpy.data.objects.new("mira", None); esc.collection.objects.link(mira); mira.location = (-1.0, 0.0, 5.4)
tr = cam.constraints.new("TRACK_TO"); tr.target = mira; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
cam.keyframe_insert("location", frame=1); mira.keyframe_insert("location", frame=1)
cam.location = (2.5, -26.5, 1.25); cam.keyframe_insert("location", frame=N)
mira.location = (0.8, 0.0, 4.5); mira.keyframe_insert("location", frame=N)
for o in (cam, mira):
    for fc in o.animation_data.action.fcurves if hasattr(o.animation_data.action, "fcurves") else []:
        for k in fc.keyframe_points: k.interpolation = "SINE"


# ---------- la luna: dirección (azimut, elevación) por cuadro ----------
def suave(a, b, t):
    t = min(1.0, max(0.0, (t - a) / (b - a))); return t * t * (3 - 2 * t)


def dir_luna(f):
    t = suave(1, 92, f)
    az = math.radians(-8.5 - 8.5 * t)       # arriba a la izquierda de la casa, dentro del encuadre (la cámara gira a la izquierda)
    el = math.radians(8.0 + 13 * t)          # ya asoma sobre los cerros en el primer cuadro y sigue subiendo
    return Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))


DIST = 600.0
M_LUNA = bpy.data.materials.new("luna"); M_LUNA.use_nodes = True; nt = M_LUNA.node_tree
for n in list(nt.nodes):
    if n.type != "OUTPUT_MATERIAL": nt.nodes.remove(n)
geo = nt.nodes.new("ShaderNodeNewGeometry"); dot = nt.nodes.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
dot.inputs[1].default_value = (-0.95, 0.29, 0.12)        # el sol queda detrás de la luna y a la izquierda: solo brilla el borde izquierdo, una C
rmp = nt.nodes.new("ShaderNodeMapRange"); rmp.inputs["From Min"].default_value = 0.02; rmp.inputs["From Max"].default_value = 0.2
img = nt.nodes.new("ShaderNodeTexImage")
nasa = os.path.expanduser("~/Downloads/ale-dev-landing-v4/public/lab/v4/luna/luna-nasa-2k.jpg")
if os.path.exists(nasa): img.image = bpy.data.images.load(nasa)
mul = nt.nodes.new("ShaderNodeMixRGB"); mul.blend_type = "MULTIPLY"; mul.inputs["Fac"].default_value = 1.0
em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (0.92, 0.95, 1.0, 1)
fuerza = nt.nodes.new("ShaderNodeMath"); fuerza.operation = "MULTIPLY"; fuerza.inputs[1].default_value = 9.0
nt.links.new(geo.outputs["Normal"], dot.inputs[0]); nt.links.new(dot.outputs["Value"], rmp.inputs["Value"])
nt.links.new(img.outputs["Color"], mul.inputs["Color1"]); mul.inputs["Color2"].default_value = (1, 1, 1, 1)
nt.links.new(rmp.outputs["Result"], fuerza.inputs[0]); nt.links.new(fuerza.outputs[0], em.inputs["Strength"])
if img.image: nt.links.new(mul.outputs[0], em.inputs["Color"])
transp = nt.nodes.new("ShaderNodeBsdfTransparent"); mezcla = nt.nodes.new("ShaderNodeMixShader")
frente = nt.nodes.new("ShaderNodeMath"); frente.operation = "SUBTRACT"; frente.inputs[0].default_value = 1.0
nt.links.new(geo.outputs["Backfacing"], frente.inputs[1])   # la cara de atrás no se ve a través del lado oscuro
solo = nt.nodes.new("ShaderNodeMath"); solo.operation = "MULTIPLY"; nt.links.new(rmp.outputs["Result"], solo.inputs[0]); nt.links.new(frente.outputs[0], solo.inputs[1])
nt.links.new(solo.outputs[0], mezcla.inputs["Fac"]); nt.links.new(transp.outputs[0], mezcla.inputs[1]); nt.links.new(em.outputs[0], mezcla.inputs[2])
nt.links.new(mezcla.outputs[0], next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL").inputs[0])
bpy.ops.mesh.primitive_uv_sphere_add(radius=DIST * math.tan(math.radians(2.4)), segments=64, ring_count=32)
luna = bpy.context.object; luna.name = "luna"; luna.data.materials.append(M_LUNA)
luna.visible_shadow = False; luna.visible_glossy = True

# luz de la luna (contraluz, brillo en el agua) + relleno frío bajo desde el frente (cielo nocturno)
bpy.ops.object.light_add(type="SUN"); sol = bpy.context.object; sol.data.angle = math.radians(1.2); sol.data.color = (0.78, 0.85, 1.0)
bpy.ops.object.light_add(type="SUN"); relleno = bpy.context.object; relleno.data.angle = math.radians(8); relleno.data.color = (0.6, 0.7, 1.0)
relleno.rotation_euler = (math.radians(72), 0, math.radians(-38))
for f in range(1, N + 1, 4):
    d = dir_luna(f); t = suave(1, 92, f)
    luna.location = cam.location * 0 + d * DIST; luna.keyframe_insert("location", frame=f)
    sol.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler(); sol.keyframe_insert("rotation_euler", frame=f)
    sol.data.energy = 0.6 + 2.1 * t; sol.data.keyframe_insert("energy", frame=f)
    relleno.data.energy = 0.22 + 0.72 * t; relleno.data.keyframe_insert("energy", frame=f)

# las luces de adentro se encienden al final (88 → 112): primero la franja y el piso 1, luego el piso 2
for f, k in ((1, 0.0), (88, 0.0), (104, 1.0), (N, 1.0)):
    for l in LUCES_DENTRO: l.data.energy = 520 * k; l.data.keyframe_insert("energy", frame=f)
    E_FRANJA.inputs["Strength"].default_value = 18 * k; E_FRANJA.inputs["Strength"].keyframe_insert("default_value", frame=f)
for f, k in ((1, 0.0), (96, 0.0), (112, 1.0), (N, 1.0)):
    E_LUZ2.inputs["Strength"].default_value = 6 * k; E_LUZ2.inputs["Strength"].keyframe_insert("default_value", frame=f)

# ---------- cielo: degradado azul de noche + pocas estrellas ----------
mundo = bpy.data.worlds.new("noche"); esc.world = mundo; mundo.use_nodes = True; wn = mundo.node_tree.nodes; wl = mundo.node_tree.links
fondo = next(n for n in wn if n.type == "BACKGROUND")
tcw = wn.new("ShaderNodeTexCoord"); sep = wn.new("ShaderNodeSeparateXYZ"); wl.new(tcw.outputs["Generated"], sep.inputs[0])
cr = wn.new("ShaderNodeValToRGB"); cr.color_ramp.elements[0].position = 0.0; cr.color_ramp.elements[0].color = (0.016, 0.02, 0.045, 1)
cr.color_ramp.elements[1].position = 0.32; cr.color_ramp.elements[1].color = (0.0012, 0.0016, 0.0045, 1)
wl.new(sep.outputs["Z"], cr.inputs["Fac"])
vor = wn.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 150; vor.feature = "F1"
wl.new(tcw.outputs["Generated"], vor.inputs["Vector"])
pt = wn.new("ShaderNodeMapRange"); pt.inputs["From Min"].default_value = 0.06; pt.inputs["From Max"].default_value = 0.0
pt.inputs["To Min"].default_value = 0.0; pt.inputs["To Max"].default_value = 1.0
wl.new(vor.outputs["Distance"], pt.inputs["Value"])
rar = wn.new("ShaderNodeMath"); rar.operation = "GREATER_THAN"; rar.inputs[1].default_value = 0.975
wl.new(vor.outputs["Color"], rar.inputs[0])             # solo una de cada ~70 celdas tiene estrella
est = wn.new("ShaderNodeMath"); est.operation = "MULTIPLY"; wl.new(pt.outputs["Result"], est.inputs[0]); wl.new(rar.outputs[0], est.inputs[1])
alto = wn.new("ShaderNodeMath"); alto.operation = "GREATER_THAN"; alto.inputs[1].default_value = 0.1; wl.new(sep.outputs["Z"], alto.inputs[0])
est2 = wn.new("ShaderNodeMath"); est2.operation = "MULTIPLY"; wl.new(est.outputs[0], est2.inputs[0]); wl.new(alto.outputs[0], est2.inputs[1])
suma = wn.new("ShaderNodeMixRGB"); suma.blend_type = "ADD"; suma.inputs["Fac"].default_value = 1.0
wl.new(cr.outputs["Color"], suma.inputs["Color1"]); wl.new(est2.outputs[0], suma.inputs["Color2"])
wl.new(suma.outputs[0], fondo.inputs["Color"]); fondo.inputs["Strength"].default_value = 1.0

# ---------- anclas del plano y posición de la luna en pantalla ----------
ANCLAS = {"proyectos": (1.0, -2.98, Z2 + 1.55), "recorrido": (-6.0, -2.2, Z1 + 1.6), "formulario": (-3.2, 0.9, Z1 + 0.95),
          "aviso": (-0.5, -1.6, Z2 - 0.05), "respaldo": (9.5, -2.55, 0.3)}

esc.render.resolution_x = ANCHO; esc.render.resolution_y = round(ANCHO * 9 / 16)
datos = {}
for f in range(1, N + 1):
    esc.frame_set(f); fila = {}
    for nombre, p in ANCLAS.items():
        v = world_to_camera_view(esc, cam, Vector(p)); fila[nombre] = [round(v.x, 4), round(1 - v.y, 4)]
    v = world_to_camera_view(esc, cam, luna.matrix_world.translation); fila["luna"] = [round(v.x, 4), round(1 - v.y, 4)]
    datos[f] = fila
os.makedirs(SALIDA, exist_ok=True)
json.dump(datos, open(os.path.join(SALIDA, "datos.json"), "w"))

# ---------- render ----------
esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print("[casa] METAL no disponible:", e)
esc.cycles.use_denoising = True; esc.cycles.max_bounces = 6
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Medium High Contrast"
esc.view_settings.exposure = 0.6
esc.render.image_settings.file_format = "PNG"
lista = (range(*(lambda a, z: (a, z + 1))(*(int(v) for v in CUADROS.split("-")))) if "-" in CUADROS
         else [int(v) for v in CUADROS.split(",")])


def pasada_render():
    esc.cycles.samples = MUESTRAS
    for f in lista:
        esc.frame_set(f); esc.render.filepath = os.path.join(SALIDA, f"render-{f:03d}.png")
        bpy.ops.render.render(write_still=True); print(f"[casa] render {f}", flush=True)


def pasada_lineas():
    # misma vista que el cuadro final: todo transparente y solo las aristas en línea fina color cuarzo
    hold = bpy.data.materials.new("hold"); hold.use_nodes = True; h = hold.node_tree
    for n in list(h.nodes):
        if n.type != "OUTPUT_MATERIAL": h.nodes.remove(n)
    hn = h.nodes.new("ShaderNodeHoldout"); h.links.new(hn.outputs[0], next(n for n in h.nodes if n.type == "OUTPUT_MATERIAL").inputs[0])
    for o in list(esc.objects):
        if o.type == "MESH":
            if o.name in ("tierra", "luna") or o.name.startswith(("copa",)) or o.name.startswith("Ico"): o.hide_render = True; continue
            o.data.materials.clear(); o.data.materials.append(hold)
            for md in o.modifiers: md.show_render = False
    esc.render.film_transparent = True; esc.render.image_settings.color_mode = "RGBA"
    esc.cycles.samples = 1; esc.render.use_freestyle = True; esc.render.line_thickness_mode = "ABSOLUTE"; esc.render.line_thickness = 1.2
    vl = esc.view_layers[0]; vl.use_freestyle = True
    fs = vl.freestyle_settings; ls = fs.linesets[0] if fs.linesets else fs.linesets.new("lineas")
    ls.select_by_visibility = True; ls.select_silhouette = ls.select_border = ls.select_crease = True
    st = ls.linestyle or bpy.data.linestyles.new("plano"); ls.linestyle = st; st.color = (0.93, 0.92, 0.88); st.thickness = 1.2
    for f in lista:
        esc.frame_set(f); esc.render.filepath = os.path.join(SALIDA, f"lineas-{f:03d}.png")
        bpy.ops.render.render(write_still=True); print(f"[casa] lineas {f}", flush=True)


if PASADA == "render": pasada_render()
elif PASADA == "lineas": pasada_lineas()
print("[casa] TERMINADO")
