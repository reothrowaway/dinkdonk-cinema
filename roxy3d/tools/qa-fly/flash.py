import bpy, numpy as np, os, sys, json, time
d, out = sys.argv[sys.argv.index('--') + 1:][:2]
names = sorted(n for n in os.listdir(d) if n[:-4].isdigit() and n.endswith('.png'))
rows = []; prev = None; t0 = time.time()
for n in names:
    im = bpy.data.images.load(os.path.join(d, n))
    w, h = im.size
    px = np.empty(w * h * 4, np.float32); im.pixels.foreach_get(px)
    bpy.data.images.remove(im)
    a = px.reshape(h, w, 4)[::8, ::8, :3]
    luma = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    sat = a.max(2) - a.min(2)
    grey = float(((sat < 0.03) & (luma > 0.05) & (luma < 0.6)).mean())
    diff = float(np.abs(a - prev).mean()) if prev is not None else 0.0
    rows.append({'f': int(n[:-4]), 'luma': float(luma.mean()), 'sat': float(sat.mean()), 'grey': grey, 'diff': diff})
    prev = a
json.dump(rows, open(out, 'w'))
print('done', len(rows), 'frames in', round(time.time() - t0), 's')
