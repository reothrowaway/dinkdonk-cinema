# Brief 62: fly-through v4, door-led opening

6 Nov 2026. Delivered one local Blender 5.2.3 Workbench preview: **640 x 360, 30 fps, silent**, with part/frame labels and the original 14 lobby + 6 auditorium scale cards.

## Deliverables

- [Full preview](fly/v4_flythrough_AB.mp4): **665 frames / 22.166667 seconds**. A remains 425 frames; B remains 240 frames.
- [Camera path](fly/v4_camera_path.json): same `dinkdonk.flythrough.camera.v1` structure and matrix conventions as v3, with optional `look_at_target_world` on the changed opening frames.
- [Bus path](fly/v4_bus_path.json): same `dinkdonk.flythrough.bus.v1` format; all 425 A-frame positions, headings and speeds.
- [Working lobby copy](fly/v4_blockout_A.blend), v4-prefixed scripts, PNGs and verification receipts remain in `fly/`.

## Final timing

| Part A frames | Timing and framing |
|---|---|
| 1-15 | Exact source orthographic hold, unchanged framing. Bus absent. |
| 16-55 | Diagonal travel toward the entrance, overlapping descent, rotation and zoom. The aim moves from the original optical-axis ground intersection toward the entrance paving. The entrance remains visible in the upper part of the A40 and A55 probes. |
| 56-78 | Brief close paving handoff. The camera reaches straight down and changes projection at **A72**. The switch is on the flat top of `Wet paving slab.045`, directly outside the entrance. |
| 79-125 | Continue forward and lift the target. The bus punctuates the lower-left foreground around **A84-88**, clearing by A90. The entrance threshold starts returning around A86 and is visible at A90; the full upright entrance framing follows as the tilt rises. |
| 126-150 | Finish the tilt to the lowered entry view. |
| 151-194 | Blend position, aim and their derivatives into the original route. **A194 onward is the original v3 camera record, unchanged.** |
| 195-425; B1-240 | Preserve v3 entry/interior route, doors, curtains, exposure, dark cut, and all of B. |

The handoff moved from the suggested A165 to **A194**, without changing the movie duration or any downstream frame timing. V3's A165 camera sits in the road, behind the chosen paving patch; returning to it would make this camera retreat from the entrance. A194 is still outside the front opening and permits a forward join before entry. The original 1.15-unit lower camera height is reached by A72 and retained through the lobby route.

The camera uses **one C2 piecewise quintic position spline and one C2 piecewise quintic target spline**. Target knots sample a continuous authored aim at each frame with shared derivatives. The right axis keeps the same heading through the vertical tangent; there is no look-at roll flip. The switch retains **0.474342 source units/s** of camera travel, rather than stopping for the projection change. The endpoint derivatives match the existing route. Internal position/velocity/acceleration join residuals are recorded in `v4_validation.json` (largest position residual below 2e-14 units).

## Projection handoff

At **A72 (2.366667 s)**, ORTHO changes to PERSP at the same camera pose. The matched paving footprint is **0.4 source units wide**, with a **103.5 mm** perspective lens at 1.15 units above the z=0 paving. Lens/ground-scale derivatives are matched through the handoff. The lens opens to 12 mm by A90 for the reveal, then returns smoothly to the original 23 mm by A130.

A 121-point ground grid differs by at most **0.003768 preview pixels** between the two same-pose projections. A 273-ray viewport grid hits only the same flat paving slab, with sampled heights within 3e-7 of z=0; no sampled curb, facade or raised foreground object crosses the switch. This is a sampled geometric check, not a guarantee about every subpixel rain fleck. The switch image was also inspected visually.

V3's identical-camera Workbench specular suppression is retimed: fade out over A46-66, off through A78, restore by A102. The same-pose ORTHO/PERSP image difference is **0.002959/255 mean RGB**, with maximum single-channel difference **36.000/255**. This controlled comparison excludes motion between adjacent delivered frames. The saved blend stores the camera and rigs; `v4_build.py render` applies the recorded lighting mix.

## Bus and preservation of the entry

The original teal-and-cream d.gg bus remains on lane **v=11**, with the original geometry and rolling wheels. It now travels at **11.5 source units/s** and reaches u=10.5 at A86. This is a short, close foreground punctuation in the stylized preview.

Closest evaluated camera-to-bus surface distance: **0.536806 source units at A82**. This is the closest whole-frame camera-center distance, not human-body clearance. The visible pass occurs a few frames after that closest off-axis point. An 11 x 11 grid of rays to the entrance over A90-194 finds **zero bus occlusions** after the entrance returns. The modified opening has **zero camera-centerline geometry crossings**.

The original rigid doors, curtain separation, vestibule darkness, later camera route and B scene are inherited directly from v3. Part B's original PNG sequence is reused, including its v3 provenance label; it was not rebuilt or re-rendered. All 240 B camera records are identical, and all A camera records from A194 onward are identical, including exposure and projection metadata. The baked working-camera transforms match the delivered JSON exactly in the recorded check.

## Endpoint matches and angular motion

| Check | Result |
|---|---:|
| A1 live-coordinate landmark error, maximum axis at 1920 x 1080 | 0.000184818 px |
| B240 live-coordinate landmark error, maximum axis at 1920 x 1080 | 0.000107066 px |
| A1-15 and A194-425 picture difference from corresponding v3 frames, labels excluded | 0.000000000/255 maximum mean RGB |
| Final B picture difference, labels excluded | 0.000000000/255 mean RGB |

Motion was sampled from analytical curves at **300 Hz**. The fair common comparison window below is **A15-194** for both versions; `v4_motion.json` also retains the original v3 A15-165 measurements.

| Peak metric | v3 | v4 |
|---|---:|---:|
| Rotation speed, degrees/s | 60.587 | 59.210 |
| Rotation acceleration, degrees/s² | 71.748 | 95.957 |
| Absolute pitch speed, degrees/s | 60.577 | 59.210 |
| Absolute pitch acceleration, degrees/s² | 71.741 | 95.957 |
| Absolute yaw speed, degrees/s | 11.087 | 11.087 |
| Absolute yaw acceleration, degrees/s² | 46.962 | 32.262 |

V4 lowers peak turn speed and keeps matched velocity and acceleration through its spline joins. Its shorter downward turn has a **higher peak angular acceleration** than v3. The result is not a reduction in every motion metric, and numerical continuity is not a claim of owner playback approval. The main compositional change is that the approach is led by the entrance, with the pavement-only interval moved to the entrance paving and shortened.

## Verification and times

The actual MP4 container is H.264 `avc1`, 640 x 360, 30 fps, 665 frames, 22.166667 seconds. **All 665 encoded frames were decoded and compared against their source PNGs**. Maximum per-frame mean RGB error is **3.157111/255**. Both sides of the dark cut measure **0.032480/255** and **0.032517/255** excluding labels. Selected decoded opening, bus, entry, cut and endpoint frames were inspected visually. No live page, real chat, or production-lighting acceptance is claimed by this offline Workbench preview.

| Retained work | Count | Seconds |
|---|---:|---:|
| A Workbench render, including lighting blends and PNG writes | 425 frames / 502 samples | 621.427 |
| B reused from v3 | 240 frames / 0 new renders | 0 |
| MP4 encode | 665 frames | 3.861 |
| Full decode and comparison | 665 frames | 28.448 |
| Geometry, switch and contract verification | opening plus whole A bus distance | 19.741 |

These render times count the retained final A sequence and exclude replaced exploratory probes, builds, preservation hashing and review time; they are not total task elapsed time.

Re-hashed **34,943 pre-existing files / 3,366,514,202 bytes**: **zero changed or missing files**. The receipt covers earlier fly-through outputs, source blends, live art packs and pages. Writes stayed in `fly/` and this note. `PROGRESS.md` was left unchanged because Brief 62 explicitly limits the write locations. No production render, cloud resource, OBS edit, server change, page change, commit or push was made.

Reproduce with `powershell -NoProfile -ExecutionPolicy Bypass -File fly/v4_run_blender.ps1 -ExtraArgs build`, then `fly/v4_finish.ps1` through the same PowerShell policy option. The latter validates, renders A, encodes the single AB movie and decodes all frames. Run `v4_preserve.py` and `v4_write_notes.py` afterward. `v4_build.py render` resumes existing frames; `reprobe` replaces them. All Blender caches are under `fly/v4_cache/`.

STATUS: COMPLETE - ONE V4 DOOR-LED FLY-THROUGH PREVIEW, CAMERA AND BUS PATHS, VERIFICATION AND NOTES DELIVERED; READY FOR OWNER REVIEW; NO PRODUCTION RENDER, CLOUD RUN OR LIVE-ART CHANGE; STOP.
