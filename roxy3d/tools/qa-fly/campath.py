import json, sys, numpy as np
d = json.load(open(sys.argv[1]))
def frames(o, out):
    if isinstance(o, dict):
        if 'global_frame' in o and 'matrix_world' in o: out.append(o); return out
        for v in o.values(): frames(v, out)
    elif isinstance(o, list):
        for v in o: frames(v, out)
    return out
fr = sorted({f['global_frame']: f for f in frames(d, [])}.values(), key=lambda f: f['global_frame'])
print('frames:', len(fr))
fps = 30
M = np.array([f['matrix_world'] for f in fr], float)
pos = M[:, :3, 3]; fwd = -M[:, :3, 2]
part = ['A' if f['global_frame'] <= 1100 else 'B' for f in fr]
typ = [f['camera_type'] for f in fr]
lens = np.array([f['lens_mm'] for f in fr])
step = np.linalg.norm(np.diff(pos, axis=0), axis=1) * fps          # units/s between frames
ang = np.degrees(np.arccos(np.clip((fwd[1:] * fwd[:-1]).sum(1), -1, 1))) * fps  # deg/s
# ignore representation switches (ortho<->persp or huge jumps)
bad = np.array([typ[i] != typ[i+1] for i in range(len(step))])
print('representation switches at global frames:', [fr[i]['global_frame'] for i in np.where(bad)[0]])
sp = np.where(bad, np.nan, step)
# smooth tiny noise, then look for speed oscillation: local maxima/minima pairs with >15% swing in moving stretches
def report(lo, hi, name):
    s = sp[lo:hi]; a = ang[lo:hi]
    ok = ~np.isnan(s)
    print(f'\n== {name} frames {lo+1}-{hi+1}: speed min/median/max {np.nanmin(s):.2f}/{np.nanmedian(s):.2f}/{np.nanmax(s):.2f} u/s, turn max {np.nanmax(a):.1f} deg/s')
    ext = []
    for i in range(1, len(s) - 1):
        if not (ok[i-1] and ok[i] and ok[i+1]): continue
        if (s[i] > s[i-1] and s[i] >= s[i+1]) or (s[i] < s[i-1] and s[i] <= s[i+1]): ext.append(i)
    swings = []
    for j in range(1, len(ext)):
        a1, b1 = s[ext[j-1]], s[ext[j]]
        m = max(a1, b1)
        if m > 0.3 and abs(a1 - b1) / m > 0.15: swings.append((lo + ext[j] + 1, round(a1, 2), round(b1, 2)))
    print(f'  speed swings >15%: {len(swings)}', swings[:12], '...' if len(swings) > 12 else '')
    return s
report(0, 1099, 'part A')
report(1100, len(sp), 'part B')
# part B camera height: staircase = alternating flat and rising stretches
zb = pos[1100:, 2]; dz = np.diff(zb) * fps
rising = dz > 0.02; flat = np.abs(dz) < 0.005
runs = []; cur = None
for i, (r, f) in enumerate(zip(rising, flat)):
    k = 'up' if r else ('flat' if f else 'other')
    if cur and cur[0] == k: cur[2] = i
    else:
        cur = [k, i, i]; runs.append(cur)
seq = [(k, a + 1101, b + 1101) for k, a, b in runs if b - a >= 2]
ups = [r for r in seq if r[0] == 'up']
print(f'\n== part B height: {len(ups)} separate rising stretches (staircase if several, separated by flats)')
print('  ', seq[:20])
# dwell: stretches where the camera barely moves or turns (excluding first/last 1 s holds)
still = (np.nan_to_num(sp, nan=99) < 0.15) & (ang < 2)
runs = []; start = None
for i, v in enumerate(still):
    if v and start is None: start = i
    if (not v or i == len(still) - 1) and start is not None:
        if i - start >= 15: runs.append((fr[start]['global_frame'], fr[i]['global_frame'], round((i - start) / fps, 2)))
        start = None
print('\n== near-still stretches >= 0.5 s (start, end, seconds):', runs)
np.save(sys.argv[2], np.stack([np.r_[sp, np.nan], np.r_[ang, np.nan], pos[:, 2]], 1))
