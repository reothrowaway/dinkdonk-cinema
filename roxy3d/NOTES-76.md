# Brief 76 — approved Godot route port

7 Nov 2026. Built **fly/v8/** from read-only v7. Camera, bus and car JSON are
**byte-identical to the current approved Godot inputs**: 1,504 frames, 30 fps,
cut at 1101, final ortho hold 1475–1504. No route edits. Added procedural blue
`sedan_b`, distance/.091 wheel rotation, emissive lamps, two real headlights,
tail spills and rigid-object motion blur. Screen 1 hinges/curtains exactly
follow v7 at `godot_animation_frame`; hinge scales remain 1. Removed the two
named static D5 water objects. Retained original Cycles lights/palette, rain,
camera-only fog, Opus preset and 1.25-frame shutter.

The new approved clip slab admits the exterior of the enclosing sky sphere.
V8 makes **only its outside face transparent to camera rays**, preserving the
inner/reflected sky and all camera data. This fixes the otherwise black far
opening. Inherited endpoint substitution now uses the actual live still colors
(`out10/full.png`, `qa11/cinema_draft_13.png`), byte-exact at final resolution.
Frame 1 gets freshly rendered pinhole depth; old ortho depth is not reused there.

Local checks:

- **35 actual 540p renders**, endpoint substitution disabled: all requested
  singles, contiguous 80–100, plus car frame 500 just before it passes beneath
  the camera at ~516. Visually checked the [landmarks](fly/v8/check540/landmarks.png),
  [opening strip](fly/v8/check540/opening80-100.png) and car/door controls.
  No unexpected black/flat frame; 1100 is intentionally dark.
- Opening 80–100: no brightness jump; mean luma changes gradually, largest
  adjacent change **0.589/255**. Actual 1474→1475 image MAE **0.813/255** at 540p.
  Approved perspective→ortho landmark displacement is **1.25 px median,
  1.55 px maximum at 1080p**, slightly above 1 px; retained exactly as approved.
- [campath output](fly/v8/campath.txt): **no yaw reversals in 0–9 s**. Intended
  global reversals: **14.784, 26.359, 34.190, 43.189 s**. Only near-still stretch:
  final hold 1475–1503. Speed flags: A161/271/715 and B1461 (virtual optical
  pullback); approved data retained. [Port/image checks](fly/v8/verification76.json).
- Extracted bundle passed legacy **10-frame** and unchanged Brief 75 **two-worker,
  8-frame** smokes, both final/draft: 160x90, 4 samples, VP9 30/15 fps. Every smoke
  frame decoded; worst mean RGB error **3.778/255**. Color/depth archives verified;
  resume preserved PNG bytes/mtimes and reused packages. Python/Bash syntax,
  packed dependencies and Unix bundle checksum check passed.
  [Smoke results](fly/v8/smoke76.json).

Bundle: **cloud/roxy-cloud-bundle-76.tar.gz**, **33,205,252 bytes**, 28 members,
all read back. Default final: **1920x1080 / 1,504 frames / 30 fps**.
Legacy `full` and Brief 75 `multi` contracts retained; existing cloud helpers unchanged.

```text
SHA-256  5aea4002af53c9a5597a0ad46a73ca8db34c154e85fb70f432687f23368744dd
```

Future command, **from roxy3d in Git Bash, only after owner spend approval**:

```bash
PODS=5 FLY_MODE=final \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-76.tar.gz" \
OUTDIR="$PWD/fly/v8/cloud-final-result" \
bash cloud/cloud-render.sh multi
```

Planning estimate from Brief 75: **0.5–0.9 h rendering, 0.8–1.5 h overall;
about $4–8 plus storage**, including a small car overhead allowance. Assumes
3.5–5.5 combined 4090-equivalents and $0.90–1.25/GPU-hour; not a current price
quote or v8 cloud benchmark. Local Windows/OptiX checks only; no new Linux/NFS
or mixed physical GPU validation. Run the full-output flash check after the final.

Writes only in v8, the three new Brief 76 cloud files, and this note. Godot, v7,
source/live art and pages untouched. No audits, downloads, cloud calls, pods,
full final render, computer use, commit or push.

STATUS: COMPLETE — V8 PORT, SEALED FINAL BUNDLE AND LOCAL LEGACY/MULTI SMOKES READY; NO PODS OR SPEND; STOP.
