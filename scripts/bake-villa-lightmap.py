"""
Ronda 5 — el bake de luz de la Villa Savoye. Headless:
  /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/bake-villa-lightmap.py

Reproduce la luz de sceneSetup.ts (sol direccional calido en (26,34,16) +
HDRI de cielo) y hornea Diffuse Direct+Indirect SIN color de albedo, o sea
luz pura. Eso es lo que PCF nunca va a poder: rebotes globales. El resultado
entra en three como lightMap sobre el canal UV 1.
"""
import bpy, math, os, sys

RAIZ = os.getcwd()
GLB = os.path.join(RAIZ, "public/lab/villa-savoye/villa-export.glb")
HDR = os.path.join(RAIZ, "public/lab/villa-savoye/sky_1k.hdr")
SALIDA = os.path.join(RAIZ, "public/lab/villa-savoye/villa-lightmap.png")
RES = 2048
MUESTRAS = 256

# ── escena limpia ─────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene

# ── cielo: el mismo HDRI que alimenta el environment de three ────────────
mundo = bpy.data.worlds.new("cielo"); esc.world = mundo
mundo.use_nodes = True
nt = mundo.node_tree; nt.nodes.clear()
env = nt.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(HDR)
fondo = nt.nodes.new("ShaderNodeBackground")
fondo.inputs["Strength"].default_value = 0.85   # DIA.env
sal = nt.nodes.new("ShaderNodeOutputWorld")
nt.links.new(env.outputs["Color"], fondo.inputs["Color"])
nt.links.new(fondo.outputs["Background"], sal.inputs["Surface"])

# ── sol: misma dirección e intensidad relativa que el DirectionalLight ───
sol_data = bpy.data.lights.new("sol", type="SUN")
sol_data.energy = 3.6                    # 2.4 de three ≈ 3.6 W/m2 en Cycles
sol_data.color = (1.0, 0.957, 0.894)     # 0xfff4e4
sol_data.angle = math.radians(0.9)       # sombras con borde suave, no navaja
sol = bpy.data.objects.new("sol", sol_data)
esc.collection.objects.link(sol)
# three apunta desde (26,34,16) al origen: se replica con la rotación equivalente
import mathutils
d = mathutils.Vector((26, 16, 34))       # Y y Z van cambiados: three es Y-up, Blender Z-up
sol.rotation_euler = d.to_track_quat("Z", "Y").to_euler()

# ── el modelo ─────────────────────────────────────────────────────────────
bpy.ops.import_scene.gltf(filepath=GLB)
mallas = [o for o in esc.objects if o.type == "MESH"]
print(f"[bake] mallas importadas: {len(mallas)}")

# ── segundo UV 'lightmap' + textura destino por malla ────────────────────
img = bpy.data.images.new("lightmap", RES, RES, float_buffer=True)
for o in mallas:
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    if "lightmap" not in o.data.uv_layers:
        o.data.uv_layers.new(name="lightmap")
    o.data.uv_layers["lightmap"].active = True
    if not o.material_slots or not any(sl.material for sl in o.material_slots):
        base = bpy.data.materials.new(f"mat_{o.name}")
        base.use_nodes = True
        o.data.materials.append(base)
    for slot in o.material_slots:
        m = slot.material
        if not m: continue
        m.use_nodes = True
        nodo = m.node_tree.nodes.new("ShaderNodeTexImage")
        nodo.image = img
        nodo.select = True
        m.node_tree.nodes.active = nodo   # activo y SIN conectar: destino del bake

# Smart UV Project sobre todas a la vez, en el canal lightmap
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(island_margin=0.01, angle_limit=math.radians(66))
"""
Los dos pasos que faltaban y que son EL punto del lightmap:

  average_islands_scale — iguala la densidad de texel. Sin esto una pared de
  20 m y un florero ocupan islas del mismo tamano, o sea que el florero se
  lleva la resolucion que necesita la pared.

  pack_islands — reacomoda TODAS las islas de los 152 objetos en el 0-1.
  Sin esto quedan amontonadas en una esquina y el 85% de la textura es negro
  desperdiciado (verificado: el primer bake salio asi).
"""
bpy.ops.uv.select_all(action="SELECT")
bpy.ops.uv.average_islands_scale()
bpy.ops.uv.pack_islands(margin=0.004, rotate=True)
bpy.ops.object.mode_set(mode="OBJECT")
print("[bake] UVs de lightmap generados, densidad igualada y empacados")

# ── Cycles en GPU (M2 expone METAL) ──────────────────────────────────────
esc.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
try:
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d_ in prefs.devices: d_.use = True
    esc.cycles.device = "GPU"
except Exception as e:
    print(f"[bake] METAL no disponible, va por CPU: {e}")
    esc.cycles.device = "CPU"

esc.cycles.samples = MUESTRAS
esc.cycles.use_denoising = True
esc.cycles.denoiser = "OPENIMAGEDENOISE"

esc.render.bake.margin = 16
esc.render.bake.margin_type = "EXTEND"
esc.render.bake.use_selected_to_active = False
esc.render.bake.use_pass_direct = True
esc.render.bake.use_pass_indirect = True
esc.render.bake.use_pass_color = False   # sin albedo: LUZ pura

# El importador de glTF crea Empties para los nodos de jerarquia; el operador
# de bake aborta con "Object X is not a mesh" si alguno queda seleccionado.
bpy.ops.object.select_all(action="DESELECT")
solo_mallas = [o for o in esc.objects if o.type == "MESH"]
for o in solo_mallas:
    o.select_set(True)
bpy.context.view_layer.objects.active = solo_mallas[0]
print(f"[bake] seleccionadas {len(solo_mallas)} mallas (de {len(esc.objects)} objetos)")

print(f"[bake] horneando {MUESTRAS} muestras a {RES}²…")
bpy.ops.object.bake(type="DIFFUSE")

img.filepath_raw = SALIDA
img.file_format = "PNG"
img.save()
print(f"[bake] ✓ {SALIDA}")

"""
Y el GLB horneado. Es imprescindible: las UVs del lightmap se generaron ACA,
y la geometria procedural de villaModel.ts no tiene segundo canal UV, asi que
el lightmap solo se puede aplicar sobre esta malla. Este es el costo que el
plan advertia: se pasa de 'modelo procedural, cero assets' a servir un GLB.
La coreografia se re-atacha por nombre con villa-coreografia.json.
"""
GLB_OUT = os.path.join(RAIZ, "public/lab/villa-savoye/villa-baked.glb")
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=GLB_OUT,
    export_format="GLB",
    use_selection=True,
    export_apply=False,
    export_materials="NONE",   # los materiales los pone three; aca solo geometria+UVs
    export_texcoords=True,
    export_normals=True,
    export_yup=True,
)
print(f"[bake] ✓ {GLB_OUT}")
