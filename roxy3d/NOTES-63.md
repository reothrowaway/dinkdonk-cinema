# Brief 63: fly-through v5 — pull back and swoop

6 Nov 2026. Three local Blender 5.2.3 Workbench previews, **640 × 360, 30 fps, silent**, with frame labels and scale cards. The owner’s sketch guides the leftward lift, street-level dive and lobby S-curve. These are preview renders for owner selection.

## Deliverables

| Variant | Full preview | Part A | Reused part B | Total |
|---|---|---:|---:|---:|
| V5A: Swoop + bus pass | [MP4](fly/v5A_flythrough_AB.mp4) | 475 frames / 15.833 s | 240 frames / 8 s | 23.833 s |
| V5B: Follow the bus | [MP4](fly/v5B_flythrough_AB.mp4) | 510 frames / 17.000 s | 240 frames / 8 s | 25.000 s |
| V5C: Follow a chatter card | [MP4](fly/v5C_flythrough_AB.mp4) | 540 frames / 18.000 s | 240 frames / 8 s | 26.000 s |

Per variant: `v5X_camera_path.json` retains the `dinkdonk.flythrough.camera.v1` format, complete A/B world/view/projection matrices and camera values. `v5X_bus_path.json` retains the bus-v1 schema and covers every A frame. [Chatter path](fly/v5C_chatter_path.json) exports feet position, page u/v, facing, matrix, size, speed and active state for every C frame. Working copies are `v5A_blockout.blend`, `v5B_blockout.blend`, and `v5C_blockout.blend`.

## Timing

Shared A1–15 is the exact source orthographic hold; the original v3 PNGs are reused. A16–45 changes only orthographic scale, from 22.62741661 to 28 (the cinema becomes about 19% smaller). **A46** switches to the matched long-lens perspective representation. A46–64 makes the outward arc toward screen-left, cresting at A59 with a further visible pullout. A65–148 dives along the street approach, reaching **1.15 source units** at A148. The camera never looks straight down.

The lens starts at 20,000 mm solely to make the projection handoff subpixel; it shortens during the visible orbit and dive, reaching 23 mm at A148. The far camera distance is an equivalent-projection device, not a claim of a physically scaled drone flight. The delivered lens values never increase between A46 and A148; the final curve check is in `v5_lens_verification.json`. No held-frame lens animation or projection crossfade is used. Do not interpolate world transforms across A45 → A46.

| Variant | Street / entrance | Lobby and finish |
|---|---|---|
| V5A | A149–240: level glide along the street and turn into the entrance. Bus clears ahead after the near miss. | A241–475: existing S-route to Screen 1, retimed from the earlier preview. |
| V5B | A149–202: chase and bus stop; A203–275: pass the stopped bus and peel toward the entrance. | A276–510: same lobby S-route and dark-doorway finish. |
| V5C | Same opening and entrance timing as A. The board is picked up at the entrance around A240. | A241–450: walk-paced follow through the lobby/hall; A451–485: board steps aside and camera releases its aim; A486–540: pass and enter Screen 1. |

V5C follows the approved S-route by distance: 14.946779 source units in 9.667 seconds, about **1.546 units/s** during the steady follow. One existing green 1.70 × 0.44 scale card is used; there are still 14 lobby cards, plus the unchanged six auditorium cards. It waits just inside the entrance and parks left in the hallway while the camera passes on the right. Its off-camera relocation at A180 is marked as a discontinuity; frame 179 is inactive. All 45 sampled points on the card are occluded by the facade at relocation. This is an explicitly requested placeholder, not simulated chat or a page implementation.

## Projection switch, atmosphere and motion

All variants switch at **A46 (1.500 s)**. Across **35,892 visible model bounding-box corners**, the same-pose ORTHO/PERSP mismatch is **0.273115 preview pixels maximum**, **0.086919 px RMS**. This conservative corner sample includes occluded surfaces; it is not an every-vertex/rain-particle guarantee. V5A’s unmasked same-pose image difference is **0.884538/255 mean RGB**, excluding labels. The controlled comparison excludes normal motion between consecutive movie frames.

The pullback reveals the finite exterior block and neighboring rooftops. It is limited to scale 28. A preview-only soft world-space edge-darkness matte, projected from the ground plane, fades the finite block edges toward the Workbench background during A16–135. It fades away for the close street view. Workbench cannot render the source volume fog/sky shaders correctly, so their solid surrogate surfaces remain hidden as in v1–v4. This matte is disclosed preview treatment, not a production fog validation or added city geometry.

Tight near/far clipping around the distant scene removes depth-buffer flicker during the long-lens flight. Banking reaches about five degrees, with small roll overshoot/settle around the bottom and entrance turn. Position, direction and lens are eased and speed varies during the exterior flight. A108–155 uses **eight temporal camera/bus samples per frame with a 0.8-frame shutter**, accumulated in display RGB. A90–195 adds four small procedural 2D lens droplets: offset-image refraction, pale elliptical rims, slight slip and eased fade. The saved blend contains the central baked camera; reproduce these preview effects with the renderer script.

## Clearances and endpoint checks

| Variant | Closest camera–bus surface | Closest camera–door leaf | Closest camera–chatter card |
|---|---|---|---|
| V5A | 0.583061 at A148 | 0.340243 at A447 | — |
| V5B | 0.626355 at A194 | 0.340243 at A482 | — |
| V5C | 0.583061 at A148 | 0.340680 at A514 | 0.797993 at A474 |

V5A and V5C put the closest bus encounter exactly at the dive bottom, A148. Both use the source teal/cream d.gg bus on lane v=11 at 7.8 units/s. V5B uses the same bus model, begins its chase behind it, and stops the bus at the **live manifest’s u=0.16, v=11 shelter stop at A202**. Wheels rotate by actual traveled distance and stop with the bus. No bus is added to part B.

Every A-frame camera segment was checked against evaluated visible geometry: **zero crossings** in all three variants. The C card’s active center path also has zero crossings. Discrete projection changes are excluded from physical segment tests. These are source-unit camera/card-center checks, not body-volume or physical-building clearance claims. The rigid Screen 1 hinges, separating curtain banks and dark vestibule treatment are retained and retimed; no source doorway was enlarged.

Each opening retains the live-coordinate endpoint to **0.000184818 px maximum axis error at 1920×1080**. Each final auditorium endpoint is **0.000107066 px**. All 240 B camera records are unchanged except their global sequence indices, and all B PNGs are reused directly from v3. B210 → B211 retains the earlier projection representation change; do not interpolate its world transforms.

## Verification and rendering

All three actual MP4 containers were checked as H.264/avc1, 640×360, exactly 30 fps and the frame counts above. **Every encoded frame was decoded and compared with its source PNG.** Selected encoded frames were visually inspected across the opening, near miss/chase, entrance, chatter follow/pass, doors, dark cut and final hold. This does not claim owner playback approval or production/live-chat acceptance.

| Variant | New rendered A frames | Temporal/lighting samples | Reused A frames | Retained render seconds | Max decoded mean RGB error /255 |
|---|---:|---:|---:|---:|---:|
| V5A | 460 | 831 | 15 | 2253.74 | 2.642917 |
| V5B | 269 | 605 | 241 | 1649.94 | 2.641516 |
| V5C | 361 | 401 | 179 | 1185.72 | 2.642917 |

V5C reuses V5A’s first 179 pictures. V5B A285–510 reuses V5A A250–475’s interior picture phase, with new B-local labels. The camera and door path there are identical; three independently rendered interior checks differed by at most 0.011529/255 mean RGB from source animation phase, so the shared span deliberately uses A’s phase throughout. Original hold and shared B imagery keep their v3 provenance labels; C’s shared opening keeps the V5A label.

Retained render times include the final probes, temporal/lighting compositing and PNG writes, exclude superseded probes/builds/review, and overlap across local processes. They are not total elapsed task time. Part B required **zero new renders**. Per-video encode and full-decode timings are in `v5X_encoding.json` and `v5X_video_verification.json`.

Preservation: re-hashed **35,470 pre-existing files / 3,530,645,217 bytes**, with **zero changed or missing files**. Earlier previews, protected source blends, live packs and pages remain byte-identical. `v5_delivery_sha256.json` covers the final deliverables. All writes stayed in `fly/` plus this note. `PROGRESS.md` was left unchanged because Brief 63 restricts write locations. No page, server, OBS collection, cloud resource, production pack, commit or push was changed.

Reproduce with `powershell -NoProfile -ExecutionPolicy Bypass -File fly/v5_run_blender.ps1 -ExtraArgs build`, then `fly/v5_finish.ps1 -Tag A`, `-Tag B`, and `-Tag C` through the same policy option. A must render before the shared spans of B/C; their renderer waits for A receipts if running concurrently. Finish with the bundled Python running `fly/v5_finalize.py`. Existing final PNGs resume; `reprobe <variant> <frames...>` explicitly regenerates frames. Caches stay in `fly/v5_cache/`.

STATUS: COMPLETE — THREE V5 AB PREVIEWS, CAMERA/BUS/CHATTER PATHS, ENDPOINT/CLEARANCE/ENCODE VERIFICATION AND NOTES DELIVERED; READY FOR OWNER REVIEW; NO PRODUCTION RENDER, CLOUD RUN OR LIVE-ART CHANGE; STOP.
