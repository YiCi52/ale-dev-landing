# Propuesta de protagonista del hero v4 (13-oct-2026): EL UMBRAL. Un portal monolítico de piedra negra, por dentro forrado
# en nogal con luz cálida que sale, y un escalón de cuarzo. Los tres materiales en una sola pieza; la entrada al estudio.
# Uso: Blender -b -P scripts/v4/umbral.py -- <salida.png> [muestras=64] [ancho=1600]
import bpy, math, os, sys

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SALIDA = os.path.abspath(ARGS[0] if ARGS else "/tmp/umbral.png")
MUESTRAS = int(ARGS[1]) if len(ARGS) > 1 else 64
ANCHO = int(ARGS[2]) if len(ARGS) > 2 else 1600
MAT = os.path.expanduser("~/CastilloStudio/marca/materiales-2026-10")

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene


def material(nombre):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links, next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def imagen(nombre, archivo, escala, rug, capa):
    m, nodos, ln, b = material(nombre)
    t = nodos.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(MAT, archivo)); t.projection = "BOX"
    tc = nodos.new("ShaderNodeTexCoord"); mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (escala,) * 3
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], t.inputs["Vector"]); ln.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rug; b.inputs["Coat Weight"].default_value = capa
    return m


def nogal():
    m, nodos, ln, b = material("nogal")
    tc = nodos.new("ShaderNodeTexCoord"); mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (2.0, 2.0, 22)
    w = nodos.new("ShaderNodeTexWave"); w.wave_type = "BANDS"; w.bands_direction = "Z"
    w.inputs["Distortion"].default_value = 4.5; w.inputs["Detail"].default_value = 6
    r = nodos.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (0.016, 0.007, 0.0035, 1); r.color_ramp.elements[1].color = (0.09, 0.044, 0.022, 1)
    ln.new(tc.outputs["Object"], mp.inputs["Vector"]); ln.new(mp.outputs[0], w.inputs["Vector"])
    ln.new(w.outputs["Fac"], r.inputs["Fac"]); ln.new(r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.35; b.inputs["Coat Weight"].default_value = 0.5
    return m


def caja(nombre, tam, loc, m):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.name = nombre
    o.scale = tuple(v / 2 for v in tam); o.data.materials.append(m)
    bpy.ops.object.modifier_add(type="BEVEL"); o.modifiers[-1].width = 0.01; o.modifiers[-1].segments = 2
    return o


piedra = imagen("piedra", "piedra-2x.png", 0.6, 0.22, 0.8)
cuarzo = imagen("cuarzo", "cuarzo-2x.png", 0.7, 0.1, 0.6)
madera = nogal()
# piso de piedra pulida (refleja la luz que sale del umbral)
piso_m = imagen("piso", "piedra-2x.png", 0.12, 0.12, 0.9)
caja("piso", (40, 40, 0.2), (0, 0, -0.1), piso_m)
# el monolito: dos jambas y un dintel de piedra, profundo
H, ANCHO_V, PROF = 3.2, 1.3, 1.6
caja("jamba_i", (0.55, PROF, H), (-(ANCHO_V / 2 + 0.275), 0, H / 2), piedra)
caja("jamba_d", (0.55, PROF, H), ((ANCHO_V / 2 + 0.275), 0, H / 2), piedra)
caja("dintel", (ANCHO_V + 1.1, PROF, 0.6), (0, 0, H + 0.3), piedra)
# forro interior de nogal y escalón de cuarzo
caja("forro_i", (0.04, PROF, H), (-ANCHO_V / 2 + 0.02, 0, H / 2), madera)
caja("forro_d", (0.04, PROF, H), (ANCHO_V / 2 - 0.02, 0, H / 2), madera)
caja("forro_s", (ANCHO_V, PROF, 0.04), (0, 0, H - 0.02), madera)
caja("escalon", (ANCHO_V + 1.6, 0.9, 0.14), (0, -1.15, 0.07), cuarzo)
# luz cálida que sale de adentro (como un estudio iluminado al fondo)
bpy.ops.object.light_add(type="AREA", location=(0, 1.2, H / 2)); l = bpy.context.object
l.data.shape = "RECTANGLE"; l.data.size = ANCHO_V; l.data.size_y = H; l.data.energy = 900; l.data.color = (1.0, 0.72, 0.46)
l.rotation_euler = (math.radians(90), 0, 0)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.85, H / 2)); fondo = bpy.context.object
fondo.scale = (ANCHO_V, H, 1); fondo.rotation_euler = (math.radians(90), 0, 0)   # tras rotar, la Y local es la altura
mf, nodos, ln, _ = material("resplandor")
for n in list(nodos):
    if n.type != "OUTPUT_MATERIAL": nodos.remove(n)
e = nodos.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (1.0, 0.66, 0.38, 1); e.inputs["Strength"].default_value = 3.5
ln.new(e.outputs[0], next(n for n in nodos if n.type == "OUTPUT_MATERIAL").inputs[0]); fondo.data.materials.append(mf)
# luz de luna fría y rasante desde un lado, para que la piedra tenga volumen
bpy.ops.object.light_add(type="AREA", location=(-5, -4, 5)); k = bpy.context.object
k.data.size = 4; k.data.energy = 260; k.data.color = (0.75, 0.82, 1.0); k.rotation_euler = (math.radians(55), 0, math.radians(-50))
mundo = bpy.data.worlds.new("noche"); esc.world = mundo; mundo.use_nodes = True
next(n for n in mundo.node_tree.nodes if n.type == "BACKGROUND").inputs["Color"].default_value = (0.004, 0.0045, 0.006, 1)
bpy.ops.object.camera_add(location=(2.2, -11.5, 1.9)); cam = bpy.context.object; esc.camera = cam
cam.data.lens = 38; cam.rotation_euler = (math.radians(87), 0, math.radians(10.5))

esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception:
    pass
esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Medium High Contrast"
esc.render.resolution_x = ANCHO; esc.render.resolution_y = round(ANCHO * 9 / 16)
esc.render.filepath = SALIDA; esc.render.image_settings.file_format = "PNG"
bpy.ops.render.render(write_still=True)
print("[umbral] listo", SALIDA)
