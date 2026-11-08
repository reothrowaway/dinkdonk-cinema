# Screen-space smoothness of a fly-through camera path: projects a few scene points through each frame's camera
# (ortho or pinhole, as Godot/Blender use them) and prints how fast they move on screen. A shudder shows up as the
# speed going up and down (surge/brake) instead of one smooth rise and fall.
# Usage: python screenspeed.py camera_path.json [first_frame] [last_frame]   (part A frame numbers, 1-based)
import json, sys
import numpy as np

path = sys.argv[1]
f0 = int(sys.argv[2]) if len(sys.argv) > 2 else 1
f1 = int(sys.argv[3]) if len(sys.argv) > 3 else 300
A = json.load(open(path))['parts'][0]['frames']
f1 = min(f1, len(A))
pts = np.array([[5, -5, 0], [15, -10, 0], [10, -3, 4], [2, -12, 0]], float)   # lobby floor/wall points, Blender coords

def project(r):
    M = np.array(r['matrix_world'], float)
    pc = (pts - M[:3, 3]) @ M[:3, :3]          # camera-local; camera looks down -Z
    if r['camera_type'] == 'ORTHO':
        h = r['ortho_scale'] * 9 / 16 / 2
        x, y = pc[:, 0] / (h * 16 / 9), pc[:, 1] / h
    else:
        t = r['sensor_height_mm'] / (2 * r['lens_mm'])
        x, y = (pc[:, 0] / -pc[:, 2]) / (t * 16 / 9), (pc[:, 1] / -pc[:, 2]) / t
    return np.stack([(x + 1) * 960, (1 - y) * 540], 1)

S = np.array([project(A[i]) for i in range(f0 - 1, f1)])
speed = np.linalg.norm(np.diff(S, axis=0), axis=2).mean(1)        # px/frame between frame i and i+1
d = np.diff(speed)
flips = [f0 + 1 + i for i in range(1, len(d)) if d[i] * d[i - 1] < 0 and abs(d[i]) > 0.05]
print(f'frames {f0}-{f1}: screen speed min/max {speed.min():.2f}/{speed.max():.2f} px/frame')
print('speed turns (surge <-> brake) at frames:', flips or 'none')
for i in range(0, len(speed), 6):
    print(f'  frame {f0 + i:4d} ({(f0 + i - 1) / 30:5.2f} s): {speed[i]:6.2f} px/f  {A[f0 - 1 + i]["camera_type"]}')
