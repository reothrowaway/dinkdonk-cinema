# Brief 67: fly-through v7 fixes and draft/final bundle

7 Nov 2026. **Local fixes, checks and the portable bundle are complete. No pod
was started and no full-length film was rendered locally.**

- [Bundle](cloud/roxy-cloud-bundle-67.tar.gz): **34,952,521 bytes**, 27 regular
  members, every member read back and hashed.
- [SHA-256](cloud/roxy-cloud-bundle-67.tar.gz.sha256):
  `8f2be0d6357f9a25bf379cf463440682902ecc6bc55cf9c4c1bc1e19ef20d3a2`.
- [Working scenes, scripts and README](fly/v7/README.md),
  [camera path](fly/v7/camera_path.json), [bus path](fly/v7/bus_path.json),
  [verification](fly/v7/verification.json).
- New length: **1,504 frames at 30 fps = 50.133 s**, A1100 + B404; **4.033 s
  shorter** than 1,625 frames / 54.167 s. Draft: **752 frames at 15 fps**, same
  duration. The opening exact camera hold is A1-15; final exact hold is
  B375-404, global 1475-1504.

## The six fixes

### 1. Camera speed oscillation

`motion67.py` measures the approved path densely and inverts cumulative arc
length. The long-lens opening has one broad acceleration/deceleration envelope;
the dive joins a constant-speed street/lobby route. A410-1099 measures
**1.586824-1.587997 units/s**, a **0.074%** range instead of the repeated old
0.8-2.2 swings. B30-215 measures **2.009692-2.009935 units/s**, a **0.012%**
range. The short screen bend measures 1.882575-1.901091 units/s, **0.974%**.

The route's old tiny endpoint reversal (Y .34375 back to .32) is removed inside
the dark A vestibule. The inherited very tight screen-side B bend is rounded
between the same approach/pullback endpoints and tangents. Its XY route remains
the same tour; this is a local smoothing correction, not a new room layout.
The bus still moves at 4 units/s, with its near-miss aligned to the original
dive-bottom route point. Doors, curtains, exposure and wheels are retimed too.

The shortened pullback is faster: the checker reports maximum aim rates of
**36.8 degrees/s in A and 65.6 degrees/s in B**. Review that new pace in the pod
draft. The high-altitude position speeds are equivalent long-lens camera
coordinates, not literal drone speeds.

### 2. Outdoor rain glitches

Inspected old full-resolution consecutive frames A480-483 and A580-583, plus
their unscaled crops:
[bus sequence](fly/v7/qa/old_consecutive_480-483_native_crops.png),
[facade sequence](fly/v7/qa/old_consecutive_580-583_native_crops.png).
The causes are deterministic lifetime/geometry discontinuities, not fresh
random seeds every frame:

- The old crown/drip GN system adds/removes selected instances. Its count goes
  **348 -> 343 -> 341 -> 347** at frames 480, 480.25, 480.5 and 481. That
  changes geometry identity during a shutter interval and explains the
  `Topology differs` warning.
- Falling-drop centers reset from below the ground to the top of the rain
  volume. Their old scale envelope is zero before the reset but starts growing
  immediately after it. **87-117 drops** cross a reset in the sampled 1.25-frame
  shutters. Motion interpolation can connect those remote positions while one
  end is already visible, producing an incorrect long streak.
- Micro impacts were updated once at the central frame, so they did not have
  actual subframe deformation motion.

Now falling rain is one realized GN mesh with two staggered pools. Exactly one
pool supplies each visible original trajectory, preserving active density.
Every identity resets only while invisible, with at least **25.06 frames of
inactive margin** around the reset. Crown/drop/ring slots persist, grow from
zero and shrink to zero; instances are realized in stable order. Micro impacts
are evaluated from Scene Time at shutter subframes. Pours retain their stable
topology. All four water systems have deformation blur enabled.

Eleven integer/fractional checks found constant geometry:

| System | Vertices | Polygons |
|---|---:|---:|
| Falling rain | 82,880 | 62,160 |
| Edge drips, crowns, rings | 135,054 | 135,792 |
| Gutter/AC pours | 1,584 | 1,548 |
| Micro impacts | 102,198 | 136,264 |

No topology warnings occurred in the accepted renders or either bundled smoke
run. [Rain before/after, bus](fly/v7/qa/rain_before_after_bus.png) and
[facade](fly/v7/qa/rain_before_after_facade.png) are **old left / new right**,
native crops. They compare nearby source poses; bus position and weather phase
also change with retiming. They are not pixel-isolated feature toggles.
[New bus sequence](fly/v7/qa/rain_after_519-521.png) and
[new facade sequence](fly/v7/qa/rain_after_658-659.png) retain falling streaks.
Low-sample denoising/glass sparkle still needs full-motion review in the pod draft.

### 3. Brown-grey panel behind Screen 1

Ray tracing identified **`Pass6 interior back 3`**, whose material was named
`61 unlit-looking black vestibule backing` but still reflected brown light.
The v7 copy assigns an actual zero-output black surface to that backing.
Door leaves and parted curtains remain.
[Before / after](fly/v7/qa/door_before_after.png): old A1052 left, new A1079 right.
The doorway now leads into dark depth; A1079 and A1085 were checked at 540p.

### 4. Staircase camera height

The three short step-following Z rises are replaced by one monotone Hermite
height curve through the tunnel and landing, continuing into the pullback.
There is no dip at the old approach/pullback join. The original lower entrance
eye height and exact final pose remain. The checker finds **one rising stretch**
(global 1168-1473), instead of four separated rises.

### 5. Long blank-screen view

The old source interval B245-391 now takes **1.316831 seconds**. The camera
starts the turn and rising pullback much sooner. There is no extra static
screen hold. The original route and camera aim stay coupled, including through
the distant dolly/lens part of the pullback.

### 6. Grey dropout and final switch

The old distant camera's narrow central-frame clip interval did not contain
the complete shutter motion. Widening the clips restored the room but exposed
another problem: Cycles' shutter transforms were moving a distant camera while
its focal length was effectively central-frame, creating false zoom blur.
An old-frame no-blur control showed the expected auditorium composition.

V7 sweeps the clip envelope over adjacent samples and normalizes far shutter
poses to the central focal length, preserving their projected scene scale.
Fractional long-lens poses interpolate in normalized camera space. The last
perspective frame holds its same-side endpoint during the shutter instead of
extrapolating through the ORTHO representation jump.

[Before / after](fly/v7/qa/final_before_after.png): old global 1590 left,
new B374 right. [B371-375 sequence](fly/v7/qa/final_switch_sequence.png) shows
the room throughout. Last perspective -> first rendered ORTHO differs by
**0.538666/255 mean RGB at 540p**; last perspective -> the exact reduced endpoint
plate differs by **0.938556/255**. Every one of the **404 B poses** has room hits
in the nine-ray camera visibility check. These are geometry plus selected-frame
checks, not a claim that the unrendered complete movie has been watched.

## Required camera checker

Executed with the supplied Blender Python:

```powershell
& ../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe tools/qa-fly/campath.py fly/v7/camera_path.json fly/v7/motion.npy
```

[Full output](fly/v7/campath.txt), [supplemental measurements](fly/v7/qa/geometry.json):

```text
frames: 1504
representation switches at global frames: [106, 1474]
A speed min/median/max: 0.00/1.59/21709.74; turn max 36.8 deg/s
A speed swings >15%: 2 [(206, 12347.69, 21709.74), (396, 21709.74, 1.59)]
B speed min/median/max: 0.00/2.01/117598.29; turn max 65.6 deg/s
B speed swings >15%: 0
B height: 1 separate rising stretch
near-still stretches: [(1, 106, 3.5), (1475, 1503, 0.93)]
```

The two A entries are the deliberate optical-swoop acceleration and its
deceleration into the physical glide; they are not recurring swings inside
that glide. The checker measures position and aim, **not orthographic scale**,
so it incorrectly classifies the visible A16-106 pullback as near-still.
Only A1-15 is held; the scale changes throughout A16-106. The final reported
.93 seconds excludes the final sample, as the checker measures frame intervals.
There is no additional near-still stretch exceeding the intended screen beat.

## Look, settings and timing

Final: **1920x1080, 30 fps, 64 max / 16 min samples, .03 threshold, OptiX
denoising, persistent data**. Lobby light tree off and fog camera-rays-only,
matching Opus optA; auditorium keeps optB's original light-tree behavior.
Original bounces, lights, wet materials, glare, AgX Medium High Contrast and
**1.25-frame shutter** remain. Draft overrides only resolution/stride/sampling:
**960x540, odd global frames, 15 fps, 24 max / 8 min, .05 threshold**.
Both keep the original 1/24-second exposure; draft does not double the shutter.

Native old/new look comparisons:
[opening](fly/v7/qa/look_A0001_old-left_new-right.png),
[bus](fly/v7/qa/look_A0519_old-left_new-right.png),
[facade](fly/v7/qa/look_A0658_old-left_new-right.png).
The night palette, neon, wet reflections and falling rain remain. Whole-frame
RGB differences are **2.05/255, 5.73/255 and about 5/255** respectively. The two
moving comparisons include the retimed bus, weather and fractional camera pose;
they do not measure sampling alone. Glass remains grainier at draft quality.
Exact values and measured per-frame times are in
[comparison.json](fly/v7/qa/comparison.json).

The seven accepted 540p A frames average **11.32 s** locally (9.96-12.93 s);
eight accepted B frames average **3.80 s** (2.79-5.00 s). Native 1080p A1 and
A519 took **35.99 s and 33.85 s**. A658's initial 42.85-second timing overlapped
another local test and was excluded from clean timing conclusions; the clean
isolated repeat took **38.39 s**, recorded in `tests/opt1080_clean/A0658.json`.

For **one RTX 4090**, plan on roughly **0.9-1.2 render hours for the draft** and
**2.7-3.2 render hours for the final**. Allow **1.25-1.75 hours draft / 3-4 hours
final** for startup, encoding, verification and transfer. These are planning
ranges using NOTES-66-opus's historical CPU/GPU calibration (CPU .70, sampling
7.3x faster) and these local frame times; no new 4090 benchmark or cloud price
was obtained. Interior viewpoints, hardware load and storage can change them.

Final PNG endpoints are byte-identical to the original production render:
A1 and B's 30-frame final hold reuse the original first/last color and depth
plates. Both endpoint world matrices match exactly. Draft plates are 2x area
reductions; depth uses nearest source pixels. This is exact matching to the
Brief 65 production endpoints, not a new claim of pixel identity to the layered
live lobby composite. [Endpoint provenance](fly/v7/endpoints/provenance.json).

## Bundle, smoke, resume and preservation

The same archive handles both modes; final needs no rebuild. Completed color,
depth and hash receipt sets are written directly to the mounted network volume
as each frame finishes. `FRAMES=start-end` stays inclusive in global 30 Hz frame
numbers; draft selects odd indices within each range. Different mode/build
identities prevent cross-resolution resume. Finalization refuses missing or
corrupt pairs, encodes silent VP9 and packages depth plus metadata.

The extracted sealed archive completed **eight 160x90 / 4-sample smoke frames
in each mode**, both scene loads, camera/depth output, exact endpoints, VP9
encoding at **15 and 30 fps**, all-eight-frame decode comparisons and archive
read-back. Maximum decoded mean RGB error: **2.365047/255** in each mode.
Both repeat runs skipped all eight verified pairs and reused their package.
Draft split selection 1-700 / 701-1504 covers 350 + 402 = 752 images without
overlap; final covers 700 + 804 = 1,504. Live multi-pod execution remains untested.

The actual bundle modes were also exercised with bounded `FRAMES` ranges:
draft 519-521 selected **only 519 and 521 at 960x540 / 24 samples**, then skipped
both on resume; final 1474-1475 produced **1920x1080 / 64-sample final-mode
output**, including the exact endpoint plate. Both exited with `SPLIT_DONE`
without rendering other frames. These are isolated range checks, not full runs.

The helper needed a small compatibility change: forward `FLY_MODE` to the pod,
and let peek read the new result prefix and 540p frames with an optional
destination. **`cloud/cloud-render.sh.pre67` is its exact pre-edit backup.**
[Diff and guard proof](fly/v7/qa/helper.diff), [verification](fly/v7/qa/helper.json).
Reversing only those edits reconstructs the prior helper. Credit guard,
watchdog behavior, failure handling and never-delete-an-unreachable-pod logic
remain unchanged. The bundled watchdog is byte-identical to Brief 65.
Bash syntax, Python compilation and Unix SHA256SUMS checks passed.

Preservation: **34,562 protected files / 9,014,100,896 bytes**, no unauthorized
change or missing file. This covers production inputs/results, speed studies,
out10/, out10mist/, qa11/, source blends and pages. The sole authorized protected
change is the helper, with its backup verified. `PROGRESS.md` is unchanged
because this brief explicitly restricts writes; this note records the work.
No server, OBS, live art, source scene, commit or push changed.

## Exact commands for Claude — not executed here

Run each normal helper job separately from `standby`; do not run two local
helpers concurrently because they share the full-mode state file.

Draft:

```bash
cd /c/Users/maxsp/Desktop/Angelthump_H264_4K/standby
FLY_MODE=draft \
ARCHIVE="$PWD/roxy3d/cloud/roxy-cloud-bundle-67.tar.gz" \
OUTDIR=roxy3d/fly/v7/cloud-draft-result \
GPUS="NVIDIA GeForce RTX 4090" \
bash roxy3d/cloud/cloud-render.sh full
```

Final, after draft review and owner authorization:

```bash
cd /c/Users/maxsp/Desktop/Angelthump_H264_4K/standby
FLY_MODE=final \
ARCHIVE="$PWD/roxy3d/cloud/roxy-cloud-bundle-67.tar.gz" \
OUTDIR=roxy3d/fly/v7/cloud-final-result \
GPUS="NVIDIA GeForce RTX 4090" \
bash roxy3d/cloud/cloud-render.sh full
```

For the final, enlarge **this run's newly created volume** to 20 GB in a second
terminal after its fresh state file is written, as in Brief 65:

```bash
./tools/runpodctl/runpodctl.exe network-volume update \
  "$(node -e 'console.log(JSON.parse(require("fs").readFileSync("roxy3d/cloud/cloud-state-full.json","utf8")).volume)')" \
  --size 20
```

Peek without touching the old production result:

```bash
PEEK_DEST="$PWD/roxy3d/fly/v7/peek" bash roxy3d/cloud/cloud-render.sh peek 6
```

On already provisioned workers sharing a volume, with the normal watchdog
environment supplied by the launcher, use disjoint ranges. For example:

```bash
cd /workspace/bundle
FLY_MODE=draft FRAMES=1-700 bash run.sh full       # worker 1
FLY_MODE=draft FRAMES=701-1504 bash run.sh full    # worker 2
# After both RANGE_COMPLETE messages, on one coordinator:
unset FRAMES
FLY_MODE=draft bash run.sh finalize
# Use FLY_MODE=final for the final; same archive and range syntax.
```

Rerunning the same command resumes verified pairs. Normal helper launches copy
the final transport archive to `/vol/results` and fetch it automatically.
Manual split workers require the same coordinator publication/cleanup steps
documented in NOTES-65; do not delete an unreachable worker. Result payloads are
`flythrough67-draft/` and `flythrough67-final/`. The draft video is
`flythrough_draft_540p15.webm`; final is `flythrough_1080p30.webm`.

STATUS: COMPLETE — SIX FIXES, CAMERA/BUS PATHS, REQUIRED QA, LOCAL TEST CROPS,
DUAL-MODE BUNDLE/CHECKSUM, TWO SMOKE/RESUME RUNS AND HANDOFF DELIVERED; FULL-MOTION
REVIEW AWAITS THE POD DRAFT; NO POD OR FULL-LENGTH LOCAL RENDER; STOP.
