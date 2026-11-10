# Brief 88 - styled auditorium entrance corridor

10 Nov 2026. One 1920x1080 still from the unchanged production camera, house lights up.

![Styled corridor draft](qa11/cinema_draft_14_corridor.png)

## Delivered

- `qa11/cinema_draft_14_corridor.png`: the single finished draft. SHA-256: `a58ad6f8196c2ad833a5786c81bf9b42314e69448f9f1c68257b9d282faf0ff3`.
- `qa11/corridor/corridor_draft.blend`: copied draft-13 scene, with all added geometry and lights under `CORRIDOR` (`CORRIDOR_GEOMETRY` and `CORRIDOR_LIGHTS`). GLORP artwork is packed. The original hall remains present and unchanged.
- `qa11/corridor/build_corridor_draft.py`, `run88.ps1`, `verify_saved88.py`: reproducible build, render, composition and saved-scene checks. `inspect_style.py` is the read-only source inspector.
- Numeric evidence: `draft88_data.json`, `verification88.json`, `preservation88_before.json`, `corridor_capture88.npz`, `render_history88.json`, `initial_render88.json`, and the task logs. The NPZ contains the native transparent capture, not another review image.

Reproduce from `roxy3d/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File qa11/corridor/run88.ps1 -Mode render
powershell -NoProfile -ExecutionPolicy Bypass -File qa11/corridor/run88.ps1 -Mode verify
```

`build` saves the scene without rendering; `package` repeats composition from the cached capture. The runner refuses to start while another Blender process exists. Temporary/config/CUDA/OptiX caches are directed inside `qa11/corridor/runtime88/`.

## Appearance and fixed layout

The approved 2.20 m clear floor, 9.06 m length, 2.60 m far wall, 1.20 m runner, three 0.70 x 1.00 m frames, and two fixture envelopes retain their approved bounds and positions. The near side stays open. The far end continues off the left edge, with no doorway or end wall.

The wall uses the lobby's original plum material, a dark plum wainscot up to 0.88 m, a restrained dull brass cap from 0.88 to 0.90 m, and a dark top cut. The floor uses the lobby's deep blue/teal inset carpet; a darker blue/plum runner leads to the unchanged padded entrance. There are no neon lines or picture lights.

The posters are copies of the lobby's actual artwork: THE BLUE HOUR, GLORP, and NIGHT FERRY, in that order toward larger v. The two filler posters retain the original printed geometry and lettering. All three have dull glazing and zero print emission. The small warm opal fixtures remain at v=17.20 and 19.30, center height 1.83 m.

Material base colors below are linear RGB shader values, not display hex colors. The imported wall/carpet procedural finishes remain in use; the runner uses one bounded fine-weave tint rather than multiplying the lobby's accumulated recoloring ramps.

| Surface | Base RGB | Roughness / other values |
|---|---|---|
| Plum plaster | 0.130, 0.062, 0.210 | 0.75; original lobby finish |
| Dark wainscot | 0.025, 0.013, 0.043 | 0.50; original lobby finish |
| Carpet | 0.034, 0.100, 0.120 | 0.96; weave bump strength 0.12, distance 0.0012 m |
| Darker runner | 0.026, 0.052, 0.077 | 0.98; weave noise scale 95, detail 3; tint range 0.85-1.15 times base |
| Dull brass cap/mounts | 0.420, 0.250, 0.085 | 0.76 |
| Charcoal metal frames | 0.035, 0.042, 0.052 | 0.74 |
| Opal face | 0.240, 0.140, 0.065 | 0.72; emission RGB 1.00, 0.58, 0.29; strength 0.12 |
| Poster prints/glass | Original artwork | Print roughness 0.80 GLORP / 0.88 filler art; emission 0; glass mixes 92% transparent with 8% rough surface, roughness 0.72 |

The two visible sconces each use a **3 W** warm point light, RGB **1.00, 0.58, 0.29**, radius **0.24 m**, at world X=0.64 m and Z=1.83 m. Three invisible lighting helpers keep the corridor legible: a **120 W, 2.00 x 9.06 m** overhead ambient area, RGB **0.48, 0.40, 0.65**, at `(1.45,-19.47,3.60)`; a **160 W, 1.00 x 9.06 m** reflected-fill area, RGB **0.58, 0.50, 0.75**, at `(2.50,-19.47,1.25)`, linked only to the lower wall; and a **0.18 W, 0.65 x 0.75 m** doorway-spill proxy, RGB **1.00, 0.63, 0.35**, at `(1.45,-14.96,1.40)`. These large soft areas are bounce-light controls, with no visible added fixtures. Every new light is linked exclusively to corridor receivers; original hall lighting and the world are unchanged.

Measured Rec.709 display luminance, in byte units out of 255:

| Sample | Mean | Median | 5th-95th percentile |
|---|---:|---:|---:|
| Corridor floor | 10.29 | 10.73 | 3.00-17.67 |
| Corridor wall, excluding poster rectangles | 11.42 | 9.50 | 1.14-27.61 |
| Lower wall | 9.29 | 8.22 | 1.14-20.43 |
| 146 centerline floor probes along the visible arrival route | 9.94 | 10.30 | 3.08-15.45 |
| Unchanged hall carpet / seat backs | 25.35 / 41.30 | - | Draft-13 measurements |

The floor is about 41% of the hall carpet's mean luminance. The runner and lower wall retain detail while the corridor recedes from the room. The maximum RGB channel byte anywhere in the corridor capture support is 167/255, so no highlights clip. Whole-frame visual inspection confirmed the three framed posters, small warm sconces, open near edge, continuing off-screen route and unobstructed entrance. No synthetic chatter or test figure was added.

## Render and exact hall preservation

Blender **5.2.3 LTS**, local **NVIDIA GeForce RTX 3050 6GB Laptop GPU**, Cycles **OptiX**, CPU render device disabled. Draft-13 production settings are retained: native **3840x2160**, adaptive **64-384** samples, threshold **0.007**, seed **341997**, filter size **1.5**, OptiX GPU denoising, **AgX / Medium High Contrast**, exposure 0.

The dedicated `CORRIDOR_LAYER` makes the original hall collections holdouts while retaining their geometry. It captures only the visible corridor over transparency. The script composites its straight RGBA display bytes over the existing native `cinema_draft_13@2x.png`, then performs the same exact integer 2x2 display-byte area reduction as draft 13. Thus the delivered hall uses the approved original pixels, avoiding stochastic re-render changes. The saved blend renders the transparent corridor layer; the script performs the final plate composition.

- Corridor capture support: **70,851** pixels at 1080p, contained within the independently projected approved solid-box envelopes plus a 2 px filter allowance.
- Outside that support: **2,002,749 pixels**, **0 changed pixels**, **0 maximum RGB-byte change**, **0 mean absolute RGB-byte change** against `cinema_draft_13.png`.
- Screen interior and tested closed entrance-leaf interior: **0 changed pixels**.
- All **3,024 original hall objects** match the pre-build signature after reloading the saved blend: geometry, transforms, material slots, visibility and light state/linking.
- All **52 new geometry objects** fit entirely within the eight approved blockout box envelopes. They add no obstruction volume beyond the envelopes checked in Brief 87. This is containment-based inheritance of its visibility checks, not a new live-walker test.
- **14 source files** retain SHA-256; **33,729 protected art files** retain size and nanosecond mtime.

The final native corridor render took **13.668 seconds**; source build/save took **1.469 seconds** inside Blender after initial preservation setup. Four successive captures replaced the same output while correcting dark values, an imported-artwork transform offset, and the runner tint. Total measured rendering across those iterations: **61.968 seconds**. There is one delivered still, no alternate image, crop, clip, comparison, cloud job or full page-layer set.

## Later full set - plan and local estimate only

**Use separate corridor layers over the live draft-13 art. A new full hall render is unnecessary for this design.** The lit still demonstrates exact reuse of the hall plate. For production, keep lit/dim hall beauties, slices and bands byte-exact, render corridor RGB/coverage at native 4K, and stage composited lit/dim backgrounds plus corridor-only occlusion slices in a new pack. Matching 1080p files should use the established exact reduction. Any later request for corridor light to alter the hall would change that conclusion.

1. Build the lights-down corridor from this same geometry and the dim source context. Retain the warm wayfinding sconces, lower the broad ambient/fill, and inspect floor/emote contrast. Render its RGB separately; reuse verified lit coverage so lit/dim alpha is identical.
2. Capture first-hit corridor depth using draft 13's `key = u + v + zpx_world / 90` and `z_index = 1000 + round(key * 100)`. The solid geometry spans approximately key **15.13-26.55**, already inside draft 13's 0-38 coverage range. Keep the existing edge cuts (maximum width 0.25), adding corridor-only slices for the wall, frames, sconces, floor/runner where their depth can cover walkers. Do not put the entire wall at one depth. Expect roughly 50 populated bins / about two batches at ten RGB AOVs per batch; determine exact counts from native first-hit coverage. Generate paired scales/states, validate reconstruction and identical alpha, then trim/band those new slices. Reuse existing hall masks/RGB unchanged.
3. Extend the arrival route using `corridor_geom.json`, beginning off-screen at `[1.45,24,0]` and connecting through the approved points to the original `[1.45,15.12,0]`. Page/layout edits belong to that later brief.
4. **Regenerate the entrance-door sheets for both states.** Preserve the existing geometry, five canonical open poses, 16-frame timing, frame rectangle and endpoints. New corridor pixels can appear within the replacement/cutout area during opening, so the existing sheets are not accepted unchanged. Prefer compositing fresh pose-specific corridor captures with the cached draft-13 hall/door pose patches; fall back to cropped door-region renders. Verify every pose against the new background and slices, and retain the existing cutout only if reconstruction proves it valid. No new full-frame hall render is needed for this step.

Based on the measured 13.7-second native layer capture, budget **3-6 minutes of local RTX 3050 rendering** for lit/dim, depth batches and cropped door-pose work, plus **45-75 minutes** to adapt the capture/packaging, compose the paired assets, validate seams/alpha/depth, and inspect them. These are estimates, not a completed full-set benchmark. Live real-chat page acceptance is additional owner/page-side work. No lit/dim set, depth slice, door sheet or page change was made in this brief.

All task writes stayed within the brief's allowlist. Its narrower scope excludes `PROGRESS.md`, so this report records the work instead. No live page, server, OBS collection, source scene, art pack or prior blockout was edited. No commit or push.

STATUS: BRIEF 88 STYLED CORRIDOR DRAFT DELIVERED AND VERIFIED; HALL PIXELS OUTSIDE CORRIDOR CHANGE BY EXACTLY ZERO; LOCAL GPU ONLY; FULL SET NOT STARTED; STOP.
