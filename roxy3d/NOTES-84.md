# Brief 84: Dear Leader poster placement blockout

10 Nov 2026. One **1280 x 720 Workbench placement still**, from the unchanged production camera, with one **3x inset** and four arrow labels. The panel is blank: orange face, blue frame, yellow picture-light bar and bracket.

![Poster placement blockout](leader/blockout.png)

## Placement and the limiting measurement

The actual wall is much shorter than the brief's estimated poster height. `D7 restroom aligned partition return` is **1.197528 m high**, at X = 2.9..3.1, Y = -4.4..-3.08. The cap starts at Z = 1.197528 m and finishes at 1.223384 m. A 1.2-1.3 m poster cannot fit below it with a frame and picture light. A bottom edge at 1.1 m would leave less than 0.10 m for the entire panel.

I kept the requested wall and used almost its full height:

| Part | Size or position in source-world meters |
|---|---|
| Blank poster face | **0.66 wide x 0.99 tall**, exactly 2:3 |
| Outside of frame | **0.72 wide x 1.05 tall**, 0.03-deep rails, 0.03 border |
| Frame / face bottom above floor | **0.055 / 0.085** |
| Frame / face top | **1.105 / 1.075** |
| Frame back / front | X = **3.115 / 3.145**; front is 4.5 cm proud of the wall |
| Face plane | X = **3.146**, facing +X into the lobby |
| Frame extent along wall | v = **3.30..4.02**, or Blender Y = -4.02..-3.30 |
| Picture-light bar | **0.44 long x 0.05 projection x 0.025 tall**, Z = 1.145..1.170 |
| Picture-light bracket | One small plain box reaching X = 3.275 from the wall |

This leaves **0.22 m** to the wall's end corner, **0.38 m** to the return's join at v = 4.4, and **1.03 m** along the wall to the TICKETS housing at v = 5.05. The frame clears the cap underside by **9.25 cm**; the light clears it by **2.75 cm**. The TICKETS housing itself remains unchanged. The low bottom edge is the consequence of fitting a tall portrait panel under this short cutaway wall, rather than a normal eye-level mounting height.

**Readability limit:** the face is only **39.6 stage pixels wide**, just below the brief's approximately 40 px threshold. The outside frame is 43.2 px wide. Enlarging the face to 0.8-0.9 m at 2:3 would require 1.2-1.35 m of face height alone, exceeding this wall before adding its frame or light. This is the best-fit placement proposal with small clearances; the one inset makes its size reviewable. No alternate wall or layout was substituted.

## Camera visibility, projection and depth

The entire face is geometrically visible from the fixed production camera. **26,136 area-uniform face samples** were tested with camera-parallel rays against **57 evaluated source-geometry candidates**. All samples were unobstructed, even treating glazing as opaque geometry. **No existing occluder covers the chosen face.** In particular, the `boxoffice` counter and glazing clear it in this camera view. The supporting `restroom_side_wall` is behind it.

Face corners below are **1920 x 1080 lobby stage pixels**, in TL, TR, BR, BL order. The wall recedes upward to the right, so the top-right corner has the smaller y coordinate.

| Corner | Blender world X, Y, Z | Stage x, y |
|---|---|---|
| TL | 3.146, -3.990, 1.075 | **849.360, 485.084** |
| TR | 3.146, -3.330, 1.075 | **888.960, 465.284** |
| BR | 3.146, -3.330, 0.085 | **888.960, 538.034** |
| BL | 3.146, -3.990, 0.085 | **849.360, 557.834** |

The visible geometric face has **39.6 px horizontal width**, **72.750 px vertical edges**, and a **39.6 x 92.550 px axis-aligned bounding box** including the sloped edges. In the 1280 x 720 still, its horizontal width is **26.4 px**. Preview outlines and the light near the top corner consume a few raster edge pixels; they do not change the exported face geometry. The saved-mesh projection and the final image's panel location are both checked in `leader/verification.json`.

Reused `world = [u, -v, z_px / 73.48469228349535]`. Six known landmarks match the page formula to a maximum axis error of **0.0000916 stage pixel**. New panel corners agree to **0.0000539 stage pixel**. Reopening the delivered blend reproduces the exported stage coordinates exactly; saved float geometry differs from the Python literals by less than 0.0000001 m.

The face center is `(u, v) = (3.146, 3.66)`, so **1000 + round((u + v) * 100) = 1681**. Across its width it spans **1648..1714**; corner depths and both frame planes are exported. A later production layer must use the actual varying depth, rather than assign the center depth to every pixel, to stack correctly against walkers and existing wall slices.

Walkers can hide a substantial lower part because the panel is so low. Using the brief's **50 stage px** page-sprite height, a walker at the mounting floor anchor would overlap about **43.754 px** of the face's 72.750 px vertical centerline, leaving about **28.996 px** above its head. Moving walkers will change the overlap with position and emote width. This is an analytical projection check; no fake chatter, stand-in sprite or synthetic flood was created. The source metric scale and sprite scale differ: a literal 1.7 source-world m projects to 124.924 vertical px, so I used the supplied 50 px for the page-walker calculation.

## Files and reproduction

- `leader/blockout.png`: the only image, full camera view plus one magnified inset and four short labels.
- `leader/leader_geom.json`: face and frame world corners, stage corners, sizes, source measurements, camera calibration, varying depth and static occlusion results.
- `leader/leader_blockout.blend`: source-scene copy with all seven new plain mesh objects in **LEADER**. No poster texture, new shader material or actual light source was added.
- `leader/build_leader.py`: self-contained measurement, build and Workbench render script.
- `leader/annotate_blockout.ps1`: adds the one inset and labels to the same PNG using Windows drawing APIs. Explicit pixel rectangles preserve the production framing regardless of PNG DPI metadata.
- `leader/run_blender.ps1`: local runner; keeps temporary files, Blender configuration and caches inside `leader/cache/`, then annotates the builder's one output automatically.
- `leader/verify_leader.py`, `leader/verification.json`: saved-copy, camera, raster-location, dimensions, one-image and input-hash checks. Inspection scripts, JSON and logs also stay in `leader/`.

Run from `roxy3d/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File leader/run_blender.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File leader/run_blender.ps1 -Script verify_leader.py -Log verify.log
```

Workbench shows flat grayscale context and does not reproduce production emission, glass transparency, wet reflections or fog. Only the copied scene's sky sphere and atmospheric volume are hidden for this opaque preview, and its foreground camera visibility is restored from the frozen background-pass state. The production camera, existing geometry, transforms and shader materials are retained. The inset is a crop of the same render, not a second camera render.

The preview render takes approximately **2.3 seconds**, with approximately **4 seconds** for loading, measurement, ray checks, packing and saving. Exact final-run figures are in `leader/run_report.json`; annotation and the separate read-only verification are additional. No Cycles benchmark or final-quality capture was run.

The source blend, both reference frames, manifest and mapping retain their original SHA-256 hashes. Writes are confined to `leader/` and this note. This note is the change log; the brief's explicit write allowlist excludes `PROGRESS.md`. Existing live pages, production packs, source blends and the server were not edited. No cloud resources were used.

## Later local full-quality layer estimate

Planning allowance on the **RTX 3050 6 GB**, for one static poster/light state with alpha, receiver-light difference and depth/coverage:

| Output route | Estimated local render allowance |
|---|---|
| Native 1920 x 1080 alone | **5-10 minutes** |
| Native 3840 x 2160, with 1920 x 1080 derived from it | **20-30 minutes total** |

The second route preserves native 2x sharpness and yields both sizes from the same captures. Basis: the measured Brief 83 local marquee run records **33.25 s** for its isolated alpha/depth body, **590.02 s** for its full-scene lit state and **557.65 s** for emitter-off receivers. Two comparable full-scene 4K receiver captures alone would take about **19.1 minutes**. A poster's isolated alpha/depth work should be much smaller; the allowance adds setup and convergence margin. Tight receiver crops could reduce the time but were not benchmarked here. Sampling, receiver scope, thermals and the later poster/light design can change these figures. Artwork creation, animation, packaging and owner acceptance are excluded; nothing in `out10/` needs a replacement render for this separate layer.

STATUS: COMPLETE - ONE POSTER PLACEMENT BLOCKOUT, GEOMETRY EXPORT, WORKING BLEND AND SCRIPTS DELIVERED; 39.6 PX FACE READABILITY LIMIT FLAGGED; READY FOR OWNER LAYOUT REVIEW; STOP.
