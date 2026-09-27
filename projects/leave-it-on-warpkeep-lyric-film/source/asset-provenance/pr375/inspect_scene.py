import bpy, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/pr375/castle.glb'))
bpy.ops.object.camera_add(location=(0,11.5,37))
cam=bpy.context.object
# glTF Y-up becomes Blender Z-up, front +Z becomes -Y.
cam.location=(0,-37,11.5)
cam.rotation_euler=(Vector((0,0,6))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO';cam.data.ortho_scale=26
bpy.context.scene.camera=cam
for loc,power,size in [((-16,-20,28),2400,12),((20,-6,18),1600,14),((0,20,24),2800,10)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,5))-o.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.render.engine='BLENDER_EEVEE';s.render.resolution_x=1000;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.world=bpy.data.worlds.new('World');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.18,.23,.26,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55
s.view_settings.view_transform='AgX';s.render.filepath=str(OUT/'castle-front-inspection.png');bpy.ops.render.render(write_still=True)
cam.location=(28,-34,24);cam.rotation_euler=(Vector((0,0,6))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=31;s.render.filepath=str(OUT/'castle-three-quarter-inspection.png');bpy.ops.render.render(write_still=True)
