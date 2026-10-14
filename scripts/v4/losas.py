# Muro de materiales (14-oct-2026): tres losas pulidas vistas de frente (piedra negra, nogal, cuarzo) para la sección
# que reemplaza la tira de letras. Cámara ortográfica: cada imagen ES la cara de la losa. Arriba se refleja una
# "ventana" de luz suave en el pulido, como una losa real en un estudio; la piedra y el cuarzo usan las texturas que
# eligió Alejo (mismo patrón), el nogal es procedural con la veta a lo largo.
# Uso: Blender -b -P scripts/v4/losas.py -- <carpeta_salida> [ancho=900] [muestras=96]
import bpy, math, os, sys

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SALIDA = os.path.abspath(ARGS[0] if ARGS else "/tmp/losas")
ANCHO = int(ARGS[1]) if len(ARGS) > 1 else 900
MUESTRAS = int(ARGS[2]) if len(ARGS) > 2 else 96
MAT = os.path.expanduser("~/CastilloStudio/marca/materiales-2026-10")


def nuevo_material(nombre):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    nodos = m.node_tree.nodes
    return m, nodos, m.node_tree.links, next(n for n in nodos if n.type == "BSDF_PRINCIPLED")


def con_imagen(nombre, archivo, escala_u, girar, rugosidad, capa, relieve):
    """Imagen sobre la cara (UV 0-1 en 1 × 2). `girar` pone la imagen apaisada a lo alto; `escala_u` recorta el ancho
    para que el píxel quede cuadrado (sin estirar el dibujo de la piedra)."""
    m, nodos, ln, b = nuevo_material(nombre)
    t = nodos.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(MAT, archivo)); t.interpolation = "Cubic"
    uv = nodos.new("ShaderNodeTexCoord"); mp = nodos.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (escala_u, 1, 1)
    if girar:
        mp.inputs["Rotation"].default_value = (0, 0, math.radians(90)); mp.inputs["Location"].default_value = (1, 0, 0)
    ln.new(uv.outputs["UV"], mp.inputs["Vector"]); ln.new(mp.outputs[0], t.inputs["Vector"]); ln.new(t.outputs["Color"], b.inputs["Base Color"])
    bmp = nodos.new("ShaderNodeBump"); bmp.inputs["Strength"].default_value = relieve; bmp.inputs["Distance"].default_value = 0.002
    ln.new(t.outputs["Color"], bmp.inputs["Height"]); ln.new(bmp.outputs[0], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = rugosidad
    b.inputs["Coat Weight"].default_value = capa; b.inputs["Coat Roughness"].default_value = 0.2
    return m


def nogal():
    """Chapa de nogal: veta fina y casi recta a lo alto (no ondas), manchas largas de color como la madera real,
    y poro abierto apenas visible bajo el barniz."""
    m, nodos, ln, b = nuevo_material("nogal")
    tc = nodos.new("ShaderNodeTexCoord")
    # la coordenada a lo ancho se tuerce poquito con un ruido de baja frecuencia: así la veta no es una regla
    ruido_lento = nodos.new("ShaderNodeTexNoise"); ruido_lento.inputs["Scale"].default_value = 0.9; ruido_lento.inputs["Detail"].default_value = 2
    tuerce = nodos.new("ShaderNodeVectorMath"); tuerce.operation = "MULTIPLY_ADD"
    tuerce.inputs[1].default_value = (0.14, 0.0, 0.0); ln.new(ruido_lento.outputs["Color"], tuerce.inputs[0]); ln.new(tc.outputs["Object"], tuerce.inputs[2])
    ln.new(tc.outputs["Object"], ruido_lento.inputs["Vector"])
    mp = nodos.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (11.0, 0.3, 11.0)
    ln.new(tuerce.outputs[0], mp.inputs["Vector"])
    veta = nodos.new("ShaderNodeTexWave"); veta.wave_type = "BANDS"; veta.bands_direction = "X"; veta.wave_profile = "SIN"
    veta.inputs["Scale"].default_value = 1.0; veta.inputs["Distortion"].default_value = 3.2; veta.inputs["Detail"].default_value = 5; veta.inputs["Detail Scale"].default_value = 1.8
    ln.new(mp.outputs[0], veta.inputs["Vector"])
    lineas = nodos.new("ShaderNodeValToRGB")          # cada banda: tardía (oscura, fina) y temprana (clara, ancha)
    lineas.color_ramp.elements[0].position = 0.0; lineas.color_ramp.elements[0].color = (0.03, 0.013, 0.006, 1)
    lineas.color_ramp.elements[1].position = 0.22; lineas.color_ramp.elements[1].color = (0.075, 0.036, 0.017, 1)
    fin = lineas.color_ramp.elements.new(1.0); fin.color = (0.095, 0.047, 0.023, 1)
    ln.new(veta.outputs["Fac"], lineas.inputs["Fac"])
    manchas = nodos.new("ShaderNodeTexNoise"); manchas.inputs["Scale"].default_value = 1.6; manchas.inputs["Detail"].default_value = 3
    mpm = nodos.new("ShaderNodeMapping"); mpm.inputs["Scale"].default_value = (2.5, 0.4, 2.5)
    ln.new(tc.outputs["Object"], mpm.inputs["Vector"]); ln.new(mpm.outputs[0], manchas.inputs["Vector"])
    tono = nodos.new("ShaderNodeMix"); tono.data_type = "RGBA"; tono.blend_type = "MULTIPLY"
    tono.inputs["Factor"].default_value = 1.0
    escala = nodos.new("ShaderNodeMapRange"); escala.inputs["To Min"].default_value = 0.55; escala.inputs["To Max"].default_value = 1.4
    ln.new(manchas.outputs["Fac"], escala.inputs["Value"])
    ln.new(lineas.outputs["Color"], tono.inputs[6]); ln.new(escala.outputs["Result"], tono.inputs[7])
    ln.new(tono.outputs[2], b.inputs["Base Color"])
    poro = nodos.new("ShaderNodeTexNoise"); poro.inputs["Scale"].default_value = 420; poro.inputs["Detail"].default_value = 1
    alto = nodos.new("ShaderNodeMath"); alto.operation = "MULTIPLY_ADD"; alto.inputs[1].default_value = 0.25
    ln.new(poro.outputs["Fac"], alto.inputs[0]); ln.new(veta.outputs["Fac"], alto.inputs[2])
    bmp = nodos.new("ShaderNodeBump"); bmp.inputs["Strength"].default_value = 0.06; bmp.inputs["Distance"].default_value = 0.001
    ln.new(alto.outputs[0], bmp.inputs["Height"]); ln.new(bmp.outputs[0], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = 0.32; b.inputs["Coat Weight"].default_value = 0.6; b.inputs["Coat Roughness"].default_value = 0.16
    return m


LOSAS = {
    "piedra": lambda: con_imagen("piedra", "piedra-2x.png", 0.73 * 0.5 / 0.5, False, 0.18, 0.85, 0.06),
    "nogal": nogal,
    "cuarzo": lambda: con_imagen("cuarzo", "cuarzo-2x.png", 1.0, True, 0.12, 0.7, 0.03),
}

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene
# la losa: plano de 1 × 2 parado de frente a la cámara (cara hacia -Y)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0)); losa = bpy.context.object
losa.scale = (1, 2, 1); losa.rotation_euler = (math.radians(90), 0, 0)
bpy.ops.object.transform_apply(scale=True)
mundo = bpy.data.worlds.new("estudio"); esc.world = mundo; mundo.use_nodes = True
next(n for n in mundo.node_tree.nodes if n.type == "BACKGROUND").inputs["Color"].default_value = (0.012, 0.012, 0.014, 1)
# luz pareja y suave desde arriba a la izquierda (el brillo del pulido lo pone la página, moviéndose con el scroll)
bpy.ops.object.light_add(type="AREA", location=(-2.0, -3.0, 2.6)); k = bpy.context.object
k.data.size = 4.0; k.data.energy = 260; k.data.color = (1.0, 0.95, 0.89)
k.rotation_euler = (math.radians(55), 0, math.radians(-35))
bpy.ops.object.light_add(type="AREA", location=(2.0, -3.0, -1.0)); f = bpy.context.object
f.data.size = 4.0; f.data.energy = 70; f.data.color = (0.9, 0.93, 1.0)
f.rotation_euler = (math.radians(105), 0, math.radians(35))
bpy.ops.object.camera_add(location=(0, -4, 0)); cam = bpy.context.object; esc.camera = cam
cam.rotation_euler = (math.radians(90), 0, 0); cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.0

esc.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"; prefs.get_devices()
    for d in prefs.devices: d.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print("[losas] METAL no disponible:", e)
esc.cycles.samples = MUESTRAS; esc.cycles.use_denoising = True
esc.view_settings.view_transform = "AgX"; esc.view_settings.look = "AgX - Medium High Contrast"
esc.render.resolution_x = ANCHO; esc.render.resolution_y = ANCHO * 2
esc.render.image_settings.file_format = "PNG"
os.makedirs(SALIDA, exist_ok=True)
for nombre, hacer in LOSAS.items():
    losa.data.materials.clear(); losa.data.materials.append(hacer())
    esc.render.filepath = os.path.join(SALIDA, f"losa-{nombre}.png")
    bpy.ops.render.render(write_still=True); print("[losas]", nombre, flush=True)
print("[losas] TERMINADO")
