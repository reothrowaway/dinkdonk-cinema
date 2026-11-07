# Brief 60: three openings and lower fly-through camera

6 Nov 2026. Delivered three complete local Workbench previews for owner selection. All are H.264 MP4, **640 x 360, 30 fps, silent**, with part/frame labels and the original **14 lobby + 6 auditorium scale cards**. The cards remain 1.70 source units tall.

## Videos and timing

| Opening | Full video | Part A | Shared part B | Total |
|---|---|---:|---:|---:|
| 1. Top-down drop | [v2_opening1_topdown_AB.mp4](fly/v2_opening1_topdown_AB.mp4) | 380 frames / 12.667 s | 240 frames / 8.000 s | **620 frames / 20.667 s** |
| 2. Flat zoom + quick swoop | [v2_opening2_swoop_AB.mp4](fly/v2_opening2_swoop_AB.mp4) | 380 frames / 12.667 s | 240 frames / 8.000 s | **620 frames / 20.667 s** |
| 3. Soft dissolve | [v2_opening3_dissolve_AB.mp4](fly/v2_opening3_dissolve_AB.mp4) | 380 frames / 12.667 s | 240 frames / 8.000 s | **620 frames / 20.667 s** |

Each holds the exact production orthographic camera at A1..15. Each reaches the same street pose at A120: **3.5 seconds after the end-of-hold pose**. A120..380 is Brief 59's A100..360 with a 20-frame offset and a constant 1.15-unit camera height. The XY path, viewing angles, Screen 1 choice, and door timing relative to travel are retained. Part A is 0.667 seconds longer than Brief 59.

1. **Top-down:** rotate and zoom in true ORTHO through A72. The final overhead frame is centered over flat asphalt, with its entire footprint inside the street. A73 changes projection at the same camera position and orientation; a 23 mm lens matches the 3.6-unit orthographic footprint on the measured street plane. Then descend and tilt toward the doors, easing to the common street pose at A120. No long-lens opening.
2. **Swoop:** retain the original isometric orientation while zooming/recentering through A105, then make the projection change and descent over A105..120 (**0.5 seconds**). A105..119 uses **8 temporal camera samples per frame, 0.9-frame shutter**, accumulated in display RGB. This is rendered camera motion blur in the Workbench preview, not a directional blur applied to a still. The intentionally fast perspective change remains visible as a short whoosh; it is not a slow dolly zoom.
3. **Dissolve:** the same orthographic zoom, followed by a **0.5-second crossfade** over A105..120. Both views target the same doorway, with an eased blend. The second shot is the fixed street camera with a constant 23 mm lens. There is **no dolly zoom**. Different projections cannot make all door corners and foreground cards coincide, so some double edges during the blend are expected.

The lowered B sequence is rendered once as `v2_frames_B/` and used by all three encodes. The common A route is also reused byte-for-byte. A380 -> B1 (combined frames 380 -> 381) remains the hard cut inside the dark doorway. B211..240 holds the exact production auditorium orthographic camera.

## Camera exports and endpoint matches

- [Top-down camera path](fly/v2_camera_path_opening1_topdown.json)
- [Swoop camera path](fly/v2_camera_path_opening2_swoop.json)
- [Dissolve camera path](fly/v2_camera_path_opening3_dissolve.json)
- [Updated mapping](fly/v2_mapping.json) and [all endpoint-match tables](fly/v2_endpoint_matches.md)

Exports retain `dinkdonk.flythrough.camera.v1`, the two-part structure, row-major world/view/projection matrices, per-frame lens/projection/clipping/exposure, and source camera data. All 620 frames are present in each export. In variant 3, every A105..120 record includes **both complete camera records, both compositing weights, and `crossfade.blend_weight`** (the street shot's contribution). Project overlays through each camera separately and composite by those weights. The single outer matrix is not a representation of the blended image. The swoop also records its shutter sampling.

All three A1 endpoints use the source **ORTHO** transform and scale 22.62741661, replacing Brief 59's 50,000 mm approximation. Maximum landmark axis error is **0.000229 px at 1920 x 1080**.

| Landmark | Reference x, y | Offset dx, dy (px) |
|---|---:|---:|
| front entrance left sill | 864.00, 872.00 | +0.000149, -0.000111 |
| front entrance right sill | 996.00, 938.00 | +0.000137, -0.000099 |
| screen 1 lintel left | 1155.00, 363.50 | +0.000229, -0.000189 |
| screen 1 lintel right | 1221.00, 396.50 | +0.000137, -0.000135 |
| box-office partition rear | 810.00, 481.00 | +0.000114, -0.000123 |
| snack partition end | 1506.00, 739.00 | +0.000137, -0.000122 |

Shared B240 restores ORTHO scale 32. Maximum landmark axis error is **0.000161 px**.

| Landmark | Reference x, y | Offset dx, dy (px) |
|---|---:|---:|
| screen TL | 1098.92, 149.19 | +0.000043, -0.000115 |
| screen TR | 1478.69, 339.08 | +0.000161, -0.000091 |
| screen BR | 1478.69, 600.71 | +0.000161, -0.000088 |
| screen BL | 1098.92, 410.82 | +0.000043, -0.000112 |
| rear entrance floor | 319.36, 716.84 | +0.000063, -0.000110 |
| front aisle | 861.36, 514.78 | +0.000053, -0.000109 |

Independent projection using only exported matrices gives maximum errors **0.000185 px / 0.000107 px** for A/B. The top-down ground-plane grid changes by at most **0.000152 preview pixels** at A72 -> A73. The Workbench samples show a visible shading change at that projection switch even though the asphalt geometry stays aligned. These are geometric checks against the production coordinate contract, not pixel matches to the Cycles beauty.

B retains Brief 59's final perspective-to-orthographic representation change at B210 -> B211. Do not interpolate the large world-position change across that boundary. Variant 2's short opening projection change and variant 3's crossfade likewise need their explicit projection/compositing treatment.

## Lower height and clearances

Camera height is **1.15 source units** across the lobby and through the covered auditorium tunnel. The auditorium camera rises smoothly over the existing 8/16/24-pixel approach steps, then stays at 1.15 + 24/73.48469 = **1.476599 world Z** on the front landing. There is no lowered-head key or dip at either door or under the tunnel.

| Location | Clearance above camera | Evidence |
|---|---:|---|
| Front entrance, center vertical probe | 0.768767 units | Evaluated source geometry at u=9.5, v=9 |
| Screen 1, nominal 1.55-unit opening | About 0.40 units | Nominal opening minus 1.15 |
| Screen 1, actual tightest lintel along route | **0.333302 units** | A366, `Pass6 lintel 3`; underside Z=1.483302 |
| Auditorium rear door, center vertical probe | 0.755159 units | Evaluated open-door geometry at u=1.45, v=14.868 |
| Auditorium tunnel, tightest overall overhead gap | **0.197219 units** | B49, `Tunnel ROOF - foreground occluder`; soffit Z=1.347219 |

These are source-unit **camera-center** clearances, not a body-volume or real building safety certification. The unchanged fly-through still travels faster than a walk. Maximum travel speeds are 4.48 units/s in A and 5.95 in B. Eased opening rotations peak around 105.7 degrees/s (top-down) and 91.5 degrees/s (swoop); the common lobby route keeps Brief 59's 34.1 degrees/s maximum.

## Appearance at the lower height

- Queue ropes, counter fronts and the unchanged tall scale cards occupy more of the lobby view. The camera still avoids them. The cards are scale references, not fake chatters.
- The tunnel roof fills more of the upper frame. The approach reveals the existing accessibility seats and stair/rail faces more prominently. Near the screen, seat backs appear at the bottom of the shot. At B99, the unchanged route passes only **0.321 units above a Row B seat back**; there is no camera collision, but this is visibly a camera flight rather than a body-clear walking tour.
- The source cutaway still has no enclosed lobby ceiling, and Workbench still makes the glass opaque. Rooftops/open room edges, simplified lighting, and limited source poster detail remain preview limitations. No geometry was enlarged or remodeled to hide them.
- The top-down version briefly looks only at the street; the swoop intentionally compresses the perspective change into a whoosh; the dissolve trades continuous travel for a brief overlay of the two door views. These are the requested alternatives for owner selection.

## Verification and render time

- Evaluated all saved camera frames against visible geometry: **zero camera-centerline crossings**. Discrete projection representations and the dissolve are not treated as physical travel segments. Checked finite/invertible matrices, original XY route, the exact initial hold, both-camera dissolve records, and shared B data. Evidence: `v2_validation.json`, `v2_contract_verification.json`.
- Independently parsed all three actual MP4 containers: H.264 `avc1`, 640 x 360, 30 fps, 620 frames and 20.666667 seconds each. Decoded and compared **132 selected encoded frames**, including the openings, transition endpoints, route, both sides of the dark cut and final hold. Maximum sample mean RGB error: **2.972/255**. This is sampled decode verification plus visual inspection of selected frames, not a claim of watching or decoding every encoded frame. Evidence: `v2_video_verification.json`, `v2_decoded/`.
- Both sides of each doorway cut are near black. The shared B final hold is unchanged apart from its frame label; measured picture difference B211 -> B240 is 0.000000/255. All three common A source sequences match byte-for-byte from A120 onward.
- Re-hashed **32,586 pre-existing files / 2,634,998,621 bytes**: zero changed or missing files. Includes Brief 59's outputs, source blends, live art packs and starting top-level pages. No page, live art, server, OBS collection or cloud resource was changed. `PROGRESS.md` was left alone because Brief 60 restricts writes to `fly/` and this note.

| Retained render work | Unique output frames rendered | Workbench samples | Render loop seconds | Frames reused |
|---|---:|---:|---:|---:|
| A1 | 380 | 380 | 471.45 | 0 |
| A2 | 104 | 209 | 298.41 | 276 |
| A3 | 15 | 29 | 51.00 | 365 |
| B | 240 | 240 | 187.10 | 0 |

The three encodes took **10.97 s**; sampled video/container verification took **7.16 s**. Render timings include retained frame rendering, temporal accumulation and PNG writes, including retained probes. They exclude superseded samples used to correct framing/camera evaluation, builds, hashing and visual inspection; they are not total task elapsed time.

The `v2_blockout_A1/A2/A3/B.blend` files preserve the baked central cameras and original geometry. Variant 2's shutter samples and variant 3's two-view dissolve are generated by `v2_build.py`, not by simply rendering the saved blend's single active camera. Reproduce with `v2_run_blender.ps1` and `v2_build.py` (`build`, `export`, `render A1/A2/A3/B`), then `v2_encode_verify.py` (`encode`, `verify`). Existing frame files are resumed; regenerate changed frames explicitly with `reprobe`. All new files and caches use a `v2_` prefix.

STATUS: COMPLETE - THREE FULL PREVIEW VIDEOS, LOWERED SHARED B, CAMERA EXPORTS, ENDPOINT/CLEARANCE CHECKS AND NOTES DELIVERED; READY FOR OWNER OPENING SELECTION; NO PRODUCTION RENDER, CLOUD RUN OR LIVE-ART CHANGE; STOP.
