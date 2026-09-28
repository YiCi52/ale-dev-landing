"""
La toma del rincón (28-sep-2026): llegando por la rampa al solárium, a la altura de los ojos, mirando la ventana
de la pantalla curva — el final del recorrido de Le Corbusier. Se activa con VILLA_CAM=rincon.
Los acabados ya no son de esta toma: viven en villa_acabados.py y aplican a toda la casa.
Aquí queda lo de la cámara: lente, profundidad de campo, retoque del compositor y muestreo.
"""
import bpy, mathutils, os


def camara(cam, cam_d, esc, cubierta):
    """De pie en el tramo este de la rampa a la cubierta, 0,6 m antes de la boca, mirando la ventana."""
    z_cam = 1.9
    piso = 4.985 + (z_cam + 6.08) / 8.58 * 1.675           # superficie del tramo en ese punto
    cam.location = (0.66, z_cam, piso + 1.6)
    mira = mathutils.Vector((-0.52, 8.3, cubierta + 1.45))
    cam.rotation_euler = (mira - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam_d.type = "PERSP"; cam_d.lens = 26; cam_d.shift_y = 0.02
    cam_d.dof.use_dof = True; cam_d.dof.focus_distance = (mira - cam.location).length; cam_d.dof.aperture_fstop = 5.6
    esc.render.resolution_x, esc.render.resolution_y = 1920, 1080


def retoque(esc):
    """Retoque del compositor (Blender 5): un brillo suave, un pelo de aberración de lente y viñeta."""
    try:
        ng = bpy.data.node_groups.new("retoque", "CompositorNodeTree"); esc.compositing_node_group = ng
        ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        rl = ng.nodes.new("CompositorNodeRLayers"); sal = ng.nodes.new("NodeGroupOutput")
        gl = ng.nodes.new("CompositorNodeGlare")
        for tipo in ("Bloom", "Fog Glow"):
            try: gl.inputs["Type"].default_value = tipo; break
            except Exception: pass
        gl.inputs["Threshold"].default_value = 1.0; gl.inputs["Strength"].default_value = 0.35; gl.inputs["Size"].default_value = 0.6
        ld = ng.nodes.new("CompositorNodeLensdist"); ld.inputs["Dispersion"].default_value = 0.012
        ng.links.new(rl.outputs["Image"], gl.inputs["Image"]); ng.links.new(gl.outputs["Image"], ld.inputs["Image"])
        el = ng.nodes.new("CompositorNodeEllipseMask"); el.inputs["Size"].default_value = (0.95, 0.95)
        bl = ng.nodes.new("CompositorNodeBlur"); bl.inputs["Size"].default_value = (300, 300)
        ng.links.new(el.outputs["Mask"], bl.inputs["Image"])
        rango = ng.nodes.new("ShaderNodeMapRange"); rango.inputs["To Min"].default_value = 0.72
        ng.links.new(bl.outputs["Image"], rango.inputs["Value"])
        mx = ng.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"
        mx.inputs["Factor"].default_value = 1.0
        ng.links.new(ld.outputs["Image"], mx.inputs[6]); ng.links.new(rango.outputs["Result"], mx.inputs[7])
        ng.links.new(mx.outputs[2], sal.inputs[0])
        print("[lookdev] retoque del compositor: brillo + aberración + viñeta")
    except Exception as e:
        print("[lookdev] retoque NO aplicado:", e)


def aplicar(esc, cam, cam_d, cubierta):
    camara(cam, cam_d, esc, cubierta); retoque(esc)
    esc.view_settings.exposure = float(os.environ.get("VILLA_EXPO", "0.1"))   # el blanco no se quema
    esc.cycles.use_adaptive_sampling = True
    esc.cycles.sample_clamp_indirect = 8.0
    esc.cycles.max_bounces = 8
    print("[lookdev] rincón listo: rampa → ventana del solárium")
