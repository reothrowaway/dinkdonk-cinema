"""Open lobby_draft34.blend and run with Blender -b -P this_file -- output_folder."""
from pathlib import Path
from math import cos, sin, pi, sqrt, radians
import sys
import bpy
from mathutils import Vector


out = Path(sys.argv[sys.argv.index('--')+1]).resolve()
out.mkdir(exist_ok=True, parents=True)
lobby = bpy.context.scene
original = [o for o in lobby.objects if o.get('cloud_group') == 'claw']
old_heap = next(o for o in original if 'plush Buddy heap' in o.name)
bpy.context.preferences.filepaths.save_version = 0
master = bpy.data.collections.new('Buddy | 2026 seated heart plush')
master.asset_mark()

def cloth(name, color, pile=.3):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    nodes, links = m.node_tree.nodes, m.node_tree.links
    shader = nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = .86
    shader.inputs['Sheen Weight'].default_value = pile
    tex = nodes.new('ShaderNodeTexNoise')
    tex.inputs['Scale'].default_value = 140
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .14
    bump.inputs['Distance'].default_value = .001
    links.new(tex.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], shader.inputs['Normal'])
    return m

skin = cloth('Powder blue velour', (.51,.67,.90))
hair = cloth('Cornflower blue shag', (.057,.141,.46), .44)
body = cloth('Royal blue fleece', (.034,.075,.29))
pink = cloth('Rose cheek applique', (.92,.34,.43))
ink = cloth('Black embroidery', (.005,.004,.011), .08)
red = cloth('Cherry red heart cushion', (.71,.018,.032))
welt = cloth('Berry thread piping', (.36,.01,.024))
liner = cloth('Midnight blue display liner', (.038,.055,.10), .08)

def mesh(name, verts, faces, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    master.objects.link(obj)
    data.materials.append(mat)
    for face in data.polygons:
        face.use_smooth = True
    return obj

def rings_surface(name, rows, mat, reverse=False):
    n = len(rows[0])
    faces = []
    for j in range(len(rows)-1):
        for i in range(n):
            a = j*n+i
            b = j*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    faces.extend([tuple(reversed(range(n))), tuple(range(n*(len(rows)-1),n*len(rows)))])
    return mesh(name, [p for row in rows for p in row],
                [tuple(reversed(f)) for f in faces] if reverse else faces, mat)

def oval(name, center, radii, mat, tilt=0):
    rows = []
    for j in range(21):
        lat = -pi/2+.001+(pi-.002)*j/20
        ring = []
        for i in range(40):
            angle = 2*pi*i/40
            x = radii[0]*cos(lat)*cos(angle)
            z = radii[2]*sin(lat)
            ring.append((center[0]+x*cos(tilt)+z*sin(tilt),
                         center[1]+radii[1]*cos(lat)*sin(angle),
                         center[2]-x*sin(tilt)+z*cos(tilt)))
        rows.append(ring)
    return rings_surface(name, rows, mat)

def cord(name, points, width, mat, closed=False):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 3
    data.bevel_depth = width
    data.bevel_resolution = 3
    spline = data.splines.new('POLY')
    spline.points.add(len(points)-1)
    for pt, pos in zip(spline.points, points):
        pt.co = (*pos,1)
    spline.use_cyclic_u = closed
    obj = bpy.data.objects.new(name, data)
    master.objects.link(obj)
    data.materials.append(mat)
    return obj

oval('Seated body', (0,.015,.29), (.272,.219,.26), body)
oval('Soft oversized head', (0,0,.69), (.428,.324,.349), skin)
for sign, side in [(-1,'L'), (1,'R')]:
    oval('Foot '+side, (sign*.161,-.085,.105), (.116,.171,.106), body, sign*.11)
    oval('Arm '+side, (sign*.252,-.105,.311), (.100,.125,.149), body, -sign*.36)

def surface_y(x,z):
    return -.324*sqrt(max(.015, 1-(x/.428)**2-((z-.69)/.349)**2))

def patch(name, x, z, rx, rz, tilt, mat):
    rows = []
    for depth in [.001,.23,.49,.73,.92,1]:
        row = []
        for i in range(56):
            a = 2*pi*i/56
            dx, dz = rx*depth*cos(a), rz*depth*sin(a)
            xx, zz = x+dx*cos(tilt)-dz*sin(tilt), z+dx*sin(tilt)+dz*cos(tilt)
            row.append((xx,surface_y(xx,zz)-.003-.006*(1-depth**2),zz))
        rows.append(row)
    # Open appliques follow the face curvature, with the outer rim left on the fleece.
    n = len(rows[0])
    faces = [(j*n+i,(j+1)*n+i,(j+1)*n+(i+1)%n,j*n+(i+1)%n) for j in range(len(rows)-1) for i in range(n)]
    mesh(name,[p for row in rows for p in row],faces,mat)
    return rows[-1]

for sign, side in [(-1,'L'),(1,'R')]:
    patch('Embroidered eye '+side, sign*.192,.659,.031,.036,sign*-.09,ink)
    edge = patch('Pink cheek '+side, sign*.263,.565,.046,.065,sign*-.49,pink)
    cord('Cheek rolled edge '+side, edge,.0027,pink,True)
smile = []
for i in range(33):
    u = -1+2*i/32
    x, z = .086*u, .574+.035*(u*u)
    smile.append((x,surface_y(x,z)-.009,z))
cord('Embroidered smile', smile,.012,ink)
for p in [smile[0],smile[-1]]:
    oval('Rounded smile end',p,(.012,.010,.012),ink)

# The asymmetrical scallops follow the actual front photograph.
edge_keys = [(-pi,1.74),(-2.24,1.74),(-1.55,1.68),(-1.15,1.44),
             (-.67,1.25),(-.25,.91),(-.22,1.36),(.08,1.26),(.42,1.09),
             (.67,.89),(.95,1.24),(1.44,1.69),(2.15,1.72),(pi,1.74)]
def fringe(a):
    for (a0,v0),(a1,v1) in zip(edge_keys,edge_keys[1:]):
        if a<=a1:
            return v0+(v1-v0)*(a-a0)/(a1-a0)
    return edge_keys[-1][1]
# Explicit angles retain the pointed fringe tip.
angles = sorted(set([-pi + 2*pi*i/100 for i in range(100)] + [p[0] for p in edge_keys[:-1]]))
rows = []
for j in range(23):
    row = []
    for a in angles:
        phi = .001+(fringe(a)-.001)*j/22
        ripple = (sin(7*a+.6)+.35*sin(12*a))*sin(phi)**2*.006
        row.append(((.443+ripple)*sin(phi)*sin(a),-(.34+ripple)*sin(phi)*cos(a),.69+.367*cos(phi)))
    rows.append(row)
n=len(angles)
mesh('Swept hair with pointed fringe', [p for row in rows for p in row],
     [(j*n+i,(j+1)*n+i,(j+1)*n+(i+1)%n,j*n+(i+1)%n) for j in range(22) for i in range(n)],hair)
cord('Bound hairline', rows[-1], .0035, hair, True)
for sign, side in [(-1,'L'),(1,'R')]:
    tuft=[]
    for j in range(13):
        t=j/12
        r=.063*(1-t)**.48+.0008
        tuft.append([(sign*(.40+.065*t)+r*cos(2*pi*i/28),.021+r*sin(2*pi*i/28),.692+.136*t) for i in range(28)])
    rings_surface('Temple tuft '+side,tuft,hair)

# Fibres grow along the swept cap. One editable curve object shares all locks.
from random import Random
rng = Random(211)
fibres = bpy.data.curves.new('Brushed pile | strand paths','CURVE')
fibres.dimensions='3D'
fibres.bevel_depth=.0013
fibres.bevel_resolution=0
fibres.resolution_u=1
def hair_point(a,phi,lift):
    ripple=(sin(7*a+.6)+.35*sin(12*a))*sin(phi)**2*.006
    return ((.443+ripple+lift)*sin(phi)*sin(a),
            -(.34+ripple+lift)*sin(phi)*cos(a),.69+(.367+lift)*cos(phi))
for i in range(13500):
    a=rng.uniform(-pi,pi)
    phi=rng.uniform(.001,1.74)
    if phi>fringe(a)-.019 or rng.random()>sin(phi):
        continue
    length=rng.uniform(.022,.063)
    drift=rng.uniform(.013,.037)/max(.24,sin(phi))
    strand=fibres.splines.new('POLY')
    strand.points.add(2)
    for pt,step,r,lift in zip(strand.points,[0,.57,1],[.8,1,.13],[.0001,.0023,.0029]):
        pt.co=(*hair_point(a-drift*step,phi+length*step,lift),1)
        pt.radius=r
pile=bpy.data.objects.new('Directional short blue pile',fibres)
master.objects.link(pile)
fibres.materials.append(cloth('Blue pile tips',(.068,.159,.50),.25))
def heart_edge(a):
    # The official toy has a broad cushion with a shallow top cleft and a rounded base.
    segments = [((0,.088),(.048,.088),(.107,.13),(.177,.126)),
                ((.177,.126),(.245,.122),(.29,.065),(.281,.015)),
                ((.281,.015),(.275,-.045),(.190,-.108),(.100,-.145)),
                ((.100,-.145),(.061,-.163),(.030,-.174),(0,-.174))]
    turn = (a % (2*pi))/pi
    sign = 1 if turn <= 1 else -1
    u = min(turn,2-turn)*4
    index = min(int(u),3)
    t = u-index
    p = segments[index]
    weights = ((1-t)**3, 3*t*(1-t)**2, 3*t*t*(1-t), t**3)
    return (sign*sum(w*v[0] for w,v in zip(weights,p)),sum(w*v[1] for w,v in zip(weights,p)))
rows=[]
for scale, y in [(.003,-.113),(.68,-.145),(1,-.230),(.94,-.264),(.70,-.304),(.34,-.322),(.003,-.327)]:
    rows.append([(scale*heart_edge(2*pi*i/80)[0],y,.29+scale*heart_edge(2*pi*i/80)[1]) for i in range(80)])
rings_surface('Stuffed red heart',rows,red,True)
cord('Heart cushion seam',rows[2],.0045,welt,True)

cabinet = bpy.data.collections.new('WIN A BUDDY | cabinet in lobby coordinates')
# The source objects retain their global coordinates when linked to the study scene.
for o in original:
    if o != old_heap:
        cabinet.objects.link(o)
old_heap.hide_render=True
old_heap.hide_viewport=True
for obj_name in ['P91 claw box west wall','P91 claw box north wall']:
    obj=bpy.data.objects[obj_name]
    obj.data.materials[0]=liner
lamp = next(o for o in original if o.type=='LIGHT')
lamp.data.color=(1,.85,.70)
lamp.data.energy=6
# Keep the prong's drop zone clear. Every prize rests on the display floor.
seats=[(12.075,-8.008,.232,19),(12.289,-8.024,.235,45),(12.508,-8.005,.245,41),
       (12.136,-7.794,.256,30),(12.377,-7.801,.245,63),
       (12.065,-7.611,.215,82),(12.275,-7.601,.228,42),(12.529,-7.600,.209,150)]
for i,(x,y,scale,yaw) in enumerate(seats,1):
    doll=bpy.data.objects.new(f'Seated Buddy {i:02d}',None)
    doll.instance_type='COLLECTION'
    doll.instance_collection=master
    doll.empty_display_size=.10
    doll.location=(x,y,.506)
    doll.scale=(scale,)*3
    doll.rotation_euler.z=radians(yaw)
    doll['cloud_group']='claw'
    cabinet.objects.link(doll)
    lobby.collection.objects.link(doll)
    if lamp.light_linking.receiver_collection:
        lamp.light_linking.receiver_collection.objects.link(doll)

# Create an independent asset scene. Detach light linking on a copy of the fixture
# so saving this scene cannot import unrelated lobby receiver collections.
study=bpy.data.scenes.new('WIN A BUDDY | editable cabinet')
study.collection.children.link(cabinet)
cabinet.objects.unlink(lamp)
fixture=lamp.copy()
fixture.light_linking.receiver_collection=None
fixture.light_linking.blocker_collection=None
cabinet.objects.link(fixture)
stage=bpy.data.collections.new('Studio camera and lights')
study.collection.children.link(stage)
target=Vector((12.325,-7.875,.63))
def aim(obj,point):
    obj.rotation_euler=(point-obj.location).to_track_quat('-Z','Y').to_euler()
def camera(name, center, direction, scale):
    data=bpy.data.cameras.new(name)
    data.type='ORTHO'
    data.ortho_scale=scale
    cam=bpy.data.objects.new(name,data)
    stage.objects.link(cam)
    cam.location=center+direction.normalized()*7
    aim(cam,center)
    return cam
direction=lobby.camera.matrix_world.to_quaternion() @ Vector((0,0,1))
study.camera=camera('Cabinet | lobby angle',target,direction,1.85)
for name,offset,power,color,size in [
    ('Warm softbox',(.2,-2.9,2.9),115,(1,.86,.76),2.8),
    ('Cool rim',(2.6,.6,2.1),99,(.59,.76,1),2.1),
    ('Top bounce',(-2,1.5,3),75,(1,.78,.67),1.8)]:
    light=bpy.data.lights.new(name,'AREA')
    light.energy=power
    light.color=color
    light.shape='DISK'
    light.size=size
    obj=bpy.data.objects.new(name,light)
    stage.objects.link(obj)
    obj.location=target+Vector(offset)
    aim(obj,target)
study.world=bpy.data.worlds.new('Neutral charcoal studio')
study.world.color=(.065,.07,.088)
def settings(scene, samples, w, h):
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=samples
    scene.cycles.use_denoising=True
    scene.cycles.denoiser='OPENIMAGEDENOISE'
    scene.render.resolution_percentage=100
    scene.render.resolution_x=w
    scene.render.resolution_y=h
    scene.render.image_settings.file_format='PNG'
settings(study,42,640,640)
study.render.film_transparent=False
study.render.filepath='//machine-detail.png'
# Put the mesh collection in a second usable scene, centered at the origin.
portrait=bpy.data.scenes.new('Buddy plush | model studio')
portrait.collection.children.link(master)
portrait.world=study.world.copy()
portrait.world.color=(.18,.18,.18)
portrait.view_settings.exposure=.75
portrait_center=Vector((0,0,.51))
for original_light in stage.objects:
    if original_light.type=='LIGHT':
        duplicate=original_light.copy()
        portrait.collection.objects.link(duplicate)
        duplicate.data=original_light.data.copy()
        duplicate.data.energy*=1.65
        duplicate.location=original_light.location-target+portrait_center
        aim(duplicate,portrait_center)
port_cam=study.camera.copy()
port_cam.data=study.camera.data.copy()
portrait.collection.objects.link(port_cam)
portrait.camera=port_cam
port_cam.data.ortho_scale=1.31
def point_portrait(degrees):
    a=radians(degrees)
    port_cam.location=portrait_center+Vector((sin(a)*5,-cos(a)*5,.85))
    aim(port_cam,portrait_center)
point_portrait(0)
settings(portrait,40,360,360)
portrait.render.filepath='//buddy-front.png'
source_path=bpy.data.filepath
def render(scene, path):
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True,scene=scene.name)
render(study,out/'machine-detail.png')
for index,angle in enumerate([0,68,164]):
    point_portrait(angle)
    render(portrait,out/'buffers'/f'buddy-{index}.png')
point_portrait(0)
portrait.render.filepath='//buddy-front.png'

# Render paired camera crops in the actual lobby for a weather-preserving delta.
settings(lobby,64,1280,720)
lobby.cycles.seed=1701
lobby.cycles.use_adaptive_sampling=False
lobby.render.use_compositing=False
lobby.render.use_border=True
lobby.render.use_crop_to_border=True
for o in lobby.objects:
    if o.name.startswith('Cloud periodic rain'):
        o.hide_render=True
# Pixel-aligned 128 x 128 crop encloses the cabinet in the 1280 x 720 weather still.
x0,y0,w,h=720,536,128,128
for key,value in [('min_x',x0/1280),('max_x',(x0+w)/1280),('min_y',(720-y0-h)/720),('max_y',(720-y0)/720)]:
    setattr(lobby.render,'border_'+key,value)
scratch=out/'buffers'
scratch.mkdir(exist_ok=True)
render(lobby,scratch/'new.png')
# Reopen the input without saving any changes for the baseline, using identical settings.
bpy.context.window.scene=study
bpy.data.scenes.remove(lobby)
for remaining in list(bpy.data.scenes):
    if remaining not in (study,portrait):
        bpy.data.scenes.remove(remaining)
bpy.data.orphans_purge(do_recursive=True)
study.render.filepath='//machine-detail.png'
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(out/'buddy-claw.blend'),compress=True)
bpy.ops.wm.open_mainfile(filepath=source_path)
base=bpy.context.scene
settings(base,64,1280,720)
base.cycles.seed=1701
base.cycles.use_adaptive_sampling=False
base.render.use_compositing=False
base.render.use_border=True
base.render.use_crop_to_border=True
for o in base.objects:
    if o.name.startswith('Cloud periodic rain'):
        o.hide_render=True
for key,value in [('min_x',x0/1280),('max_x',(x0+w)/1280),('min_y',(720-y0-h)/720),('max_y',(720-y0)/720)]:
    setattr(base.render,'border_'+key,value)
render(base,scratch/'original.png')
