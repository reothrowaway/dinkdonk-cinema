# Brief 59: fly-through route blockout

6 Nov 2026. Delivered the requested 12 s lobby + 8 s auditorium preview, using the supplied Blender 5.2.3 locally. This is a route/timing blockout, ready for owner review; no production render or live integration is implied.

## Deliverables

- [Combined preview](fly/blockout_AB.mp4): 600 frames, **20.000 s**.
- [Lobby A](fly/blockout_A.mp4): 360 frames, **12.000 s**.
- [Auditorium B](fly/blockout_B.mp4): 240 frames, **8.000 s**.
- All three are H.264 MP4, **640 x 360, 30 fps**, silent. The part and local frame number are burned into corners.
- [Working lobby](fly/blockout_A.blend) and [working auditorium](fly/blockout_B.blend): animated cameras, source cameras retained, baked smooth routes, non-rendering route curves, door animation and 20 upright scale cards.
- [camera_path.json](fly/camera_path.json): every frame's world, view and projection matrices; type, lens, sensor, shift, clipping, ortho scale, time, resolution and preview exposure. Row-major matrices / column vectors, camera local -Z forward and +Y up.
- [mapping.json](fly/mapping.json): page/layout -> world and inverse at known height, both projections, reference landmarks and numeric verification. [Delivery hashes](fly/delivery_sha256.json).
- Scripts and evidence are in `fly/`: `build_flythrough.py`, `run_blender.ps1`, `export_metadata.py`, `encode_videos.py`, `validate_route.py`, `verify_videos.py`, `verify_preservation.py`, `write_notes.py`, plus inspection/review helpers and logs. PNG sequences are retained for reproducibility and inspection; exactly three MP4s were made.

## Route and choice of door

**Screen 1**: the auditorium's current padded entrance was imported from the lobby's Screen 1 design, and it is the first screen reached through the ticket-checking gap. This is a practical default, not a claim about the owner's observed viewing history.

A holds the initial view for 15 frames, then changes from the long-lens isometric approximation to the street camera by frame 100. It enters through the existing front opening at u=8.4..10.6, v=9, passes the open end of the ticket queue and snack counter, crosses toward the ticket counter, passes the u≈3.7 ticket-checking gap, follows the hallway and enters Screen 1 at u=4.8. The front opening has no closed glass door leaf to animate. Screen 1 uses the scene's own `anim_pivot`, `closed_matrix` and ±79-degree rig; it opens over A294..326. A ends at (u=4.8, v=-0.32, height=1.25), before the existing velvet curtain, not through the curtain/back wall.

B starts inside the padded rear entrance (u=1.45, v=14.55). It follows the actual covered tunnel, leaves at the sectional mouth, rises along the open approach, moves to the front of the seating near the screen, then turns and pulls back into the exact source isometric projection. B211..240 is a one-second static hold. The auditorium door closes behind the camera and is closed in the last view. A360 -> B1 is the only scene cut, in darkness. Exposure dips are preview-only doorway adaptation, stored in the camera export.

Positions use timed cubic Hermite splines with continuous velocity; the dolly stages use a quintic ease. Authored yaw/pitch curves keep the horizon level. Maximum measured optical turn rates are **34.1 degrees/s** (A) and **49.7 degrees/s** (B). The travel sections peak at 4.48 and 5.49 source units/s respectively: this is an 8-second auditorium flight, not a walking-speed tour.

There are **14 lobby cards + 6 auditorium seat cards**, each exactly 1.70 source-world units tall and 0.44 wide. Their rotations are baked to face the moving camera while remaining upright, including parallel facing for the final orthographic hold. They are colored scale boards only.

## Endpoint match and mapping

A frame 1 uses **50,000 mm perspective**, placed far back on the original optical axis. Its calibrated reference plane preserves the ortho framing. Maximum landmark axis error is **0.12254 px at 1920 x 1080**, or 0.04085 preview pixels.

| Lobby landmark | Reference x, y at 1920 x 1080 | Offset dx, dy in pixels |
|---|---:|---:|
| front entrance left sill | 864.00, 872.00 | -0.10651, +0.01659 |
| front entrance right sill | 996.00, 938.00 | -0.09061, +0.04086 |
| screen 1 lintel left | 1155.00, 363.50 | -0.12005, +0.00213 |
| screen 1 lintel right | 1221.00, 396.50 | -0.12254, -0.00496 |
| box-office partition rear | 810.00, 481.00 | -0.08572, -0.01544 |
| snack partition end | 1506.00, 739.00 | -0.04232, +0.00017 |

B's final hold restores the source camera transform/projection to floating-point precision: **ORTHO, scale 32**, original view axis and location. Maximum landmark axis error is **0.000161 px**.

| Auditorium landmark | Reference x, y at 1920 x 1080 | Offset dx, dy in pixels |
|---|---:|---:|
| screen TL | 1098.92, 149.19 | +0.00004, -0.00011 |
| screen TR | 1478.69, 339.08 | +0.00016, -0.00009 |
| screen BR | 1478.69, 600.71 | +0.00016, -0.00009 |
| screen BL | 1098.92, 410.82 | +0.00004, -0.00011 |
| rear entrance floor | 319.36, 716.84 | +0.00006, -0.00011 |
| front aisle | 861.36, 514.78 | +0.00005, -0.00011 |

B210 reaches the 50,000 mm perspective limit; B211 switches to the source orthographic representation with a maximum geometric landmark difference from the source of 0.11566 px at B210. **Do not interpolate the world matrices across B210 -> B211**: the large camera-position change is a projection representation change, visually subpixel at these landmarks. Cards use orthographic facing at the hold to avoid a target-position swivel.

These are geometric matches against the production pack's landmark coordinate contract, checked alongside `out10/full.png` and `qa11/cinema_draft_13.png`. They are not claims that Workbench lighting/material pixels equal the Cycles beauty. Reprojecting the landmarks using only the exported JSON matrices independently gives maximum errors 0.12248 px / 0.00011 px.

Both scenes use `world = (u, -v, zpx / 73.48469228349535)`. Lobby stage pixels are `[900+60(u-v), 350+30(u+v)-zpx]`. Auditorium stage pixels are `[890+60k(u-v), 370+k(30(u+v)-zpx_world)]`, k=sqrt(0.5). The auditorium's row/step heights and screen `corners_wall` supply the required z. A page pixel alone does not determine a unique 3D point. During flight, project world coordinates through the per-frame matrices; fixed isometric depth sorting is insufficient. The brief's live-chat/page implementation is not part of this delivery.

## First-person limits found in the source scenes

- The sources are stylized isometric cutaways, with no physical-building scale contract. The ordinary lobby camera is at 1.70 source units, but Screen 1's modeled doorway is only about **1.55** units high. It ducks to **1.25** for that door.
- The auditorium tunnel's minimum soffit is **99 / 73.48469 = 1.347** units. The camera ducks to roughly **1.16**, then rises to about 1.70 above the front landing. The tightest evaluated overhead camera clearance is **0.197 units**. The geometry was not resized to disguise this. A production 1.7 m eye-height interpretation needs a deliberate scale or geometry decision.
- The lobby has no modeled ceiling over its public floor; ticket/snack partitions are low cutaway walls. First-person shots expose their tops, rooftop structures and the missing enclosure. The auditorium is likewise an open section: the pullback leaves through the open room top/side. These views need art direction before a realistic full-quality pass.
- The lobby screen doorway leads to a shallow dark vestibule with folds and a back panel, not the complete auditorium. The hard cut is inside that vestibule. The two scenes use separate origins; no continuous shared building has been fabricated.
- All 15 lobby file images and 9 external fonts are packed. No missing dependencies or linked libraries were found. Auditorium geometry uses built-in fonts and no external image textures. The packed EatFresh and wcat images are only **32 x 32**; their close-range detail is limited even though the main poster images are larger.
- Workbench deliberately shows simple studio/material colors. Glass appears opaque, volume fog cannot be evaluated, and wet reflections, neon emission, production rain/light loops and Cycles light linking are not reproduced. The fog volume and enclosing sky sphere are hidden only in the working preview copy because Workbench treats them as solid surfaces. Raster shadows are disabled to avoid preview shadow artifacts; cavity shading remains. This is not final lighting/material QA.
- No camera-centreline crossing of visible geometry was found in the final route. That test excludes the equivalent-projection switch and does not certify a human body's clearance or that every reverse face/material will hold up in a production render.

## Verification and time

- 600 camera records checked for finite matrices, valid clipping and invertibility. All route frames checked against evaluated geometry: zero crossings. Evidence: `route_validation.json`, `verification.json`.
- Real MP4 containers independently parsed: H.264 `avc1`, 640 x 360, exact frame counts, 30 fps and 12/8/20-second durations. **32 selected encoded frames** decoded through Blender's FFmpeg, including both sides of the cut and the endpoint hold, and compared with the rendered sources. Maximum sample mean RGB error: **2.969/255**. This is sampled decode QA, not a claim of decoding every encoded frame. Evidence: `video_verification.json`, `decoded/`.
- Dark-cut picture means excluding the burned-in labels: **0.0106/255** at AB360 and **0.0105/255** at AB361.
- Source protection: **31,903 files / 2,412,887,133 bytes** re-hashed with SHA-256; zero changed or missing files. Includes both input blends, all starting files in out10/, out10mist/, qa11/, and the top-level pages. No server, OBS collection or live page was changed. No cloud resource was started. `PROGRESS.md` was left alone because this brief restricts writes to `fly/` and this note.

| Retained preview work | Frames | Render-call seconds | Loop wall seconds |
|---|---:|---:|---:|
| A, Workbench | 360 | 446.15 | 455.65 |
| B, Workbench | 240 | 134.01 | 136.37 |

The three MP4 encodes took **7.06 s** in total; sampled decode/container verification took **1.43 s**. Retained-frame totals include the final B probes reused unchanged in the delivered sequence. They exclude replaced exploratory captures, scene preparation, source hashing and visual inspection; they are not total task elapsed time.

## Full-quality planning estimate, not a new benchmark

Assume **600 unique native 3840 x 2160 Cycles frames**, then downsample to 1920 x 1080 like the live art, with the current production sample quality and no reuse of static-camera sprite slices.

| Hardware | Planning allowance for the full 20 seconds |
|---|---:|
| Local RTX 3050 6 GB laptop | **about 40-65 hours** |
| Cloud RTX 4090 | **about 6-10 render hours**, plus provisioning/transfer |

Evidence: [NOTES-56.md](NOTES-56.md) records 14,390.53 seconds for 34 local background captures (**423.25 s/frame**) and 2,743.11 seconds for 49 RTX 4090 captures (**55.98 s/frame**). Repeating those wide-view rates for A alone gives **42.3 h vs 5.6 h**. [Draft 13's report](qa11/CINEMA-DRAFT-13.md) records 37.45 s for a 4K dim beauty and about 81-92 s for lit beauty-plus-coverage batches on the laptop; B adds roughly 2.5-6 hours at those reference rates. The broad allowances account for changing viewpoints, foreground geometry, shader/volume costs and laptop thermals. The lobby ratio is not a measured auditorium speedup. No fly-through Cycles frame was benchmarked and no current cloud price is quoted. Close views may be faster or slower; the estimates should be refined only after route approval with an authorized representative quality sample.

To reproduce: invoke `fly/run_blender.ps1` with `-Script build_flythrough.py -ExtraArgs @('build','A')` (and B), then `render` for each part; use the export, encode and verification scripts afterward. The renderer resumes existing frame PNGs: if changing a route, move/remove that part's generated frame sequence inside `fly/` before rendering again. All caches are directed under `fly/cache/`.

STATUS: COMPLETE — THREE ROUTE BLOCKOUT VIDEOS, TWO WORKING BLENDS, CAMERA/MAPPING EXPORTS AND VERIFICATION DELIVERED; READY FOR OWNER ROUTE REVIEW; NO FULL-QUALITY RENDER, CLOUD RUN OR LIVE-ART CHANGE; STOP.
