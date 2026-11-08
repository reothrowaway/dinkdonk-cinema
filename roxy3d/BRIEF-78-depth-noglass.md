# Brief 78: fly-through depth pass without glass and rain (local GPU, no colour)

Owner, 7 Nov 2026: the live page now draws the real chatters into the approved v8 fly-through (blockout:
`shared/transition-qa.js`, data built by `fly/transition/build_transition.py`). Occlusion uses the v8 final's depth
(`fly/v8/cloud-final-result/flythrough67-final/depth_pngs.tar.gz`). That depth is first-hit, so **glass counts as
a wall**: from the street, everyone inside the lobby disappears behind the front windows/doors, and the cashiers
disappear behind the ticket-window glass (frames ~420-700). Rain on the glass and falling drops add speckle.

Make a new depth pass, all 1504 frames, where only **opaque** things occlude. No colour render. Run it on the local
RTX 3050 (OptiX/CUDA or Workbench/EEVEE, whatever is fastest and exact). **No cloud, no RunPod.**

## Inputs (read-only - never modify)
- The v8 production scenes Brief 76 built (see `NOTES-76.md`, `fly/v8/README.md`, `fly/v8/build76.py`) and the
  approved paths `fly/v8/cloud-final-result/flythrough67-final/{camera_path,bus_path,car_path,frames}.json`.
- Existing depth for comparison: `fly/v8/cloud-final-result/flythrough67-final/depth_pngs.tar.gz`
  (contract in that folder's README: 16-bit camera Z, `z = near + code/65534*(far-near)`, 65535 = none,
  near/far per frame from `frames.json`).
- Blender: `../tools/blender-5.2.3-windows-x64/blender.exe`.

## What must be left out of the depth (camera rays pass through)
- All glass and see-through surfaces: lobby facade windows and glass doors, ticket-window glass, any glazing,
  glass rails/partitions, display-case glass, anything with transmission or alpha-blended transparency.
- Rain and water effects: falling drops, rain sheets/streaks, splash/mist/bead objects, fog and camera-only fog
  volumes, mist cards, wet-glass droplet layers.
- Pure light/glow cards (light beams, glow planes) if they are geometry.
List every excluded object/material by name in the notes, grouped by kind. If unsure about an object, say so.

## What must stay
Everything opaque, including the moving parts exactly as in the v8 final at each frame: screen 1 hinges/curtains
(`godot_animation_frame`), the bus and the blue `sedan_b` on their paths, doors. Same camera per frame as
`camera_path.json` (matrix, lens/ortho scale, shift, clip range), including the far long-lens opening frames, the
A106/107 and B495/496 representation switches and the final ortho hold 1475-1504. Central frame pose only (no
shutter / motion blur).

## Output contract (same as before, so the page tooling needs no change)
- `fly/v8-depth78/depth/NNNNN.png`, NNNNN = global frame 00001..01504, 1920x1080, 16-bit grayscale, no alpha.
  Code = round((z - near) / (far - near) * 65534) with near/far = that frame's clip range from `frames.json`;
  65535 = no surface. z = positive camera-space Z. Plain folder, **no tar** (the disk has ~6 GB free).
- `fly/v8-depth78/frames-depth78.json`: per frame near, far, valid fraction, min/max z.

## Steps
1. Build the depth scene/script in `fly/v8-depth78/`. Smoke-render frames 1, 421, 560, 640, 700, 760, 1000, 1101,
   1300, 1420, 1504.
2. Check each smoke frame against the old depth: on pixels where neither old nor new hit glass/rain, the codes
   must agree (report median and p99 |difference| in camera-Z units, and the % of pixels that changed). Pixels that
   got farther should be the removed glass/rain only. Make **one** diagnostic image, frame 560: changed pixels
   tinted over the old depth. No other images.
3. Measure seconds per frame; use as many parallel Blender processes as the 6 GB GPU and the CPU allow (scene sync
   is usually single-threaded). Report the estimate.
4. Start the full 1504-frame render as a **detached background job** (it must survive your session ending), writing
   `fly/v8-depth78/render.log`, resuming from existing frames if restarted, and `fly/v8-depth78/DONE` when all 1504
   frames exist and pass a decode check. Then write the notes and stop; do not wait hours for it.

## Rules
Write only inside `roxy3d/fly/v8-depth78/` and `roxy3d/NOTES-78.md`. Do **not** touch `roxy3d/cloud/` (another
job is changing it), the v8 sources, any page, art pack or the existing final. No colour renders, no videos, no
cloud. `../NOTES-78.md`: what you excluded, smoke-check numbers, speed, how to restart/resume the background job,
how to check progress. End with a STATUS line and stop.
