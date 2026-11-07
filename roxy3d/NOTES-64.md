# Brief 64: fly-through v6 - slower swoop, continuous scale

6 Nov 2026. One local Blender 5.2.3 Workbench preview, **640 x 360, 30 fps, silent**, with frame labels and the original 14 lobby + 6 auditorium scale cards.

- [Full preview](fly/v6_flythrough_AB.mp4): **1625 frames / 54.167 seconds**.
- [Camera path](fly/v6_camera_path.json) and [bus path](fly/v6_bus_path.json), retaining the earlier camera-v1 and bus-v1 schemas.
- [Apparent-scale plot](fly/v6_apparent_scale.png) and [per-frame scale data](fly/v6_apparent_scale.json).
- Reproducible working copies: `fly/v6_blockout_A.blend`, `fly/v6_blockout_B.blend`; scripts, PNGs and verification receipts use the `v6_` prefix.

## Timing

The result exceeds the rough 35-45-second suggestion to honor the requested low-level travel and turn limits while keeping the accepted left arc, street path, lobby S-route and auditorium tour. The 4-5-second street-glide suggestion cannot cover this accepted street path at 2-2.5 units/s. B also needs longer than 12 seconds to slow both its floor route and rising pullback.

| Stage | Frames | Duration |
|---|---|---:|
| Exact opening hold | A1-15 | 0.500 s |
| Pull back in ORTHO | A16-106 | 3.033 s |
| Matched perspective switch, left arc to crest | A107-191 | 2.833 s |
| Single dive to bus pass | A192-462 | 9.033 s |
| Level glide and entrance turn | A463-739 | 9.233 s |
| Lobby S-route and Screen 1 entry | A740-1100 | 12.033 s |
| Auditorium route, pullback and exact final hold | B1-525 | 17.500 s |

Part A totals 36.667 s; B totals 17.500 s. The final B496-525 hold remains exactly one second. The hard cut remains A1100 -> B1 inside the dark doorway. Stage boundaries use the nearest output frame; continuous fractional boundaries are in `v6_design.json` and `v6_time_maps.json`.

## Bounce diagnosis and correction

The measured v5A projection has multiple apparent-size reversals, not just a single switch-frame positional mismatch. Its orthographic scale curve slows almost to rest at A45; the new perspective arc starts at rest at A46, pulls out again, and then its independent radial/lens/aim curves produce further shrink/grow changes during the dive. The fast street-to-entrance yaw is another large sudden movement. The orange curve in the delivered plot is calculated from the actual v5A exported matrices.

V6 uses one continuous projected-size envelope across the projection change: shrink from the exact hold, pass the switch with nonzero scale velocity, reach one minimum, then grow through the dive bottom. The distant camera radius decreases monotonically after the switch. The far orbit and optical axis use the same angular curves. Small camera shift corrections stabilize the projected centroid against floating-point errors at the equivalent long-lens distance; these corrections are included in the matrices and shift_x/shift_y fields.

The plot measures RMS pixel radius of eight fixed cinema-envelope corners around their projected centroid. It starts at 171.682858 px and reaches its only minimum, 120.178141 px, at A191. Every moving-frame difference before that minimum is negative and every difference afterward through the dive bottom is positive. This is a measured geometric size metric, not a claim that width and height separately remain monotone while the building rotates. The JSON includes width, height and corner projections for every A frame. It flags corners that have passed behind the camera after entry; a whole-building size is then no longer meaningful.

## Projection handoff

First perspective frame: **A107**, 3.533 s. The mathematical switch occurs at fractional output frame 106.632345. It retains the switch-while-small concept and does not crossfade or freeze the shot.

- Same-time ORTHO/PERSP position mismatch across 36,341 visible model bounding-box corners: **0.106682 px maximum**, 0.023875 px RMS at 640 x 360.
- Projected motion-rate mismatch: **0.130357 px/s maximum**, 0.062154 px/s RMS.
- Cinema-size rates either side: -10.265319 and -10.213295 px/s; difference **0.052024 px/s**.
- Same-pose unmasked Workbench image difference, labels excluded: 0.556602/255 mean RGB. View-dependent studio shading is not pixel-identical between projection types.

Rate checks use one-sided 0.1-route-parameter differences converted by the continuous retiming derivative. The model-corner sample includes occluded surfaces but is not every vertex or rain particle. Do not interpolate world transforms across either camera-type change; the distant poses are equivalent-projection representations.

## Speed and turn comparison

| Part | Peak metric | V5A | V6 |
|---|---|---:|---:|
| A | Travel at street/lobby height (units/s) | 15.164 at A138 | 2.269 at A532 |
| A | Full camera turn rate (degrees/s) | 163.292 at A227 | 18.344 at A935 |
| A | Angular acceleration (degrees/s^2) | 546.499 at A235 | 56.272 at A1008 |
| B | Travel at street/lobby height (units/s) | 17.363 at B161 | 2.275 at B373 |
| B | Full camera turn rate (degrees/s) | 50.438 at B171 | 18.339 at B413 |
| B | Angular acceleration (degrees/s^2) | 117.199 at B132 | 39.063 at B250 |

These are comparable 30 Hz measurements from the actual delivered matrices. Travel uses Euclidean camera-center displacement; low level means both ends of the segment are at world Z <= 3. Full rotation uses a world-space rotation vector, including banking; angular acceleration is the difference of consecutive angular-velocity vectors. Projection-type discontinuities are excluded from travel.

Angular-acceleration 95th percentiles fall from 183.506 to 24.934 degrees/s^2 in A, and from 59.998 to 20.794 in B. C2 route/angle splines and smoothed variable retiming replace the abrupt transitions. B has a short C2 bridge through its former at-rest approach/pullback join. The route waypoints, tunnel, door, screen-side approach and final projection are retained. The bridge smooths the old stop; it is not a claim of byte-identical intermediate B transforms.

`v6_motion.json` also reports unfiltered high-altitude transform speeds. The very distant long-lens opening and final perspective-to-orthographic pullback produce huge coordinate speeds; they are projection devices, not a physically scaled drone trajectory. The 2-2.5-unit limit is applied to street/lobby-level travel as requested.

## Bus, doors, effects and endpoints

The same teal/cream d.gg bus is retimed to **4.0 source units/s** along lane v=11; its wheels roll by traveled distance. Closest camera-to-bus surface distance is **0.583061 units at A462**, at the dive bottom. The camera remains at 1.15-unit eye height through the street/lobby and covered auditorium tunnel, rising over the existing auditorium approach steps.

The rigid Screen 1 leaves, separating curtain banks, dark vestibule entry and B door-closing action are retimed with the camera. Light banking, the existing edge-darkness preview matte and four procedural refractive lens droplets are retained. The slow dive/bus passage uses four temporal camera/bus samples per frame with a 0.8-frame shutter. The saved blends contain the central camera and rigs; use the renderer for the accumulated motion blur and 2D droplets.

| Check | A | B |
|---|---:|---:|
| Camera-center geometry crossings | 0 | 0 |
| Closest door-leaf distance, source units | 0.351848 | 0.464813 |
| Minimum overhead clearance, source units | 0.333302 | 0.197219 |
| Endpoint landmark maximum axis error at 1920 x 1080 | 0.000184818 px | 0.000107066 px |

All camera segments were checked against evaluated visible geometry, excluding the discrete projection representation changes. Clearances refer to the camera center, not a human body. The exact 15 opening images and 30 final hold images are copied from the approved earlier previews, retaining their provenance labels. B495 also reuses v3 B210, the matched last perspective frame. Their picture differences and the final picture difference are zero. The earlier Workbench limitations remain: cutaway geometry, opaque preview glass and simplified lighting/weather, not production Cycles or live-chat acceptance.

## Render and delivery verification

The actual MP4 container is H.264/avc1, 640 x 360, exactly 30 fps, 1625 frames. **Every encoded frame was decoded and compared with its source PNG.** Maximum per-frame mean RGB error: 2.642470/255. Both sides of the dark cut measure 0.028422/255 and 0.028427/255 excluding labels. Selected rendered and decoded frames were visually inspected. This is not a claim of owner playback approval.

| Retained work | Rendered frames | Samples | Reused frames | Seconds |
|---|---:|---:|---:|---:|
| A Workbench | 1085 | 1720 | 15 | 5364.372 |
| B Workbench | 494 | 494 | 31 | 708.722 |
| MP4 encoding | 1625 | - | - | 9.904 |
| Full-frame decode/comparison | 1625 | - | - | 62.185 |

Render seconds include retained probes, temporal/lighting samples, compositing and PNG writes. Local render processes overlap; summed render seconds are not elapsed task time. Superseded probes, preparation, hashing and visual inspection are excluded.

Preservation check: **37,376 pre-existing files / 4,143,089,374 bytes, zero changed or missing files**. Earlier outputs, source blends, out10/, out10mist/, qa11/ and pages remain byte-identical. Writes stayed in `fly/` and this note. `PROGRESS.md` remains unchanged because this brief explicitly restricts write locations. No cloud, production render, live scene/page/server/OBS edit, commit or push.

Reproduce with `powershell -NoProfile -ExecutionPolicy Bypass -File fly/v6_run_blender.ps1 -ExtraArgs build -Log v6_build.log`; run `v6_stabilize.py` and `v6_refresh_export.py` through the wrapper, then `v6_render_A.py` and `v6_render_B.py`. Existing PNGs resume. The completed run used disjoint A shards via `v6_render_shard.py`; `v6_finalize.py merge` combines their receipts. Run `v6_video.py encode`, then `verify`; run the preservation check and finalizer only after all frames pass. All caches are under `fly/v6_cache/`.

STATUS: COMPLETE - ONE V6 AB PREVIEW, CAMERA/BUS PATHS, APPARENT-SCALE PLOT/JSON, MOTION/ENDPOINT/CLEARANCE/DECODE CHECKS AND NOTES DELIVERED; READY FOR OWNER REVIEW; NO PRODUCTION RENDER, CLOUD OR LIVE-ART CHANGE; STOP.
