# Brief 61: fly-through v3

6 Nov 2026. Completed the selected top-down opening with a five-second descent, the original bus model, and rebuilt door motion. Local Blender 5.2.3 Workbench preview, 640 x 360, 30 fps, silent. The original 14 lobby and 6 auditorium scale cards remain.

## Deliverables

- [Full fly-through](fly/v3_flythrough_AB.mp4): **665 frames / 22.166667 seconds**. Part A: 425 frames / 14.166667 seconds. Part B: 240 frames / 8 seconds. One MP4 was made.
- [Camera path](fly/v3_camera_path.json): same `dinkdonk.flythrough.camera.v1` schema, complete per-frame matrices and projection/exposure values, with preview-lighting metadata.
- [Bus path](fly/v3_bus_path.json): all 425 part-A frames, world position, page u/v, heading and speed. The anchor is the original live-sprite vehicle center; local +X points forward.
- [Lobby working copy](fly/v3_blockout_A.blend) and [auditorium working copy](fly/v3_blockout_B.blend), plus v3-prefixed scripts, frame sequences and verification receipts in `fly/`.

## Smoother drop

A1..15 holds the original orthographic camera. The street pose is reached at A165: exactly **5 seconds after the A15 hold pose**, 1.5 seconds longer than v2. Rotation, zoom and descent overlap. Position and zoom use quintic Hermite curves with continuous velocity and acceleration at their internal joins. X, Y and Z move monotonically; there is no camera-position reversal. Heading changes gently from 135 to 130 degrees, removing v2's sideways yaw reversal.

The angular curves were sampled at 300 Hz; see `v3_motion_curves.json` and `v3_motion_curves.svg`. Downward pitch peaks at 49.63 degrees/s; the upward tilt peaks at **60.58 degrees/s**, versus about 105.7 degrees/s in v2. Maximum absolute pitch acceleration is 71.74 degrees/s². Yaw stays in one direction and peaks at 1.875 degrees/s. The single intended pitch turnaround occurs at the straight-down view, with eased zero velocity and acceleration; the tilt settles gently into the street pose.

A85 changes ORTHO to PERSP while looking straight down at asphalt. Camera position and zoom continue moving through this interval. The perspective focal length matches the instantaneous orthographic footprint, then eases with the descending camera to the existing 23 mm street view. This is not a projection crossfade.

At the same A85 pose, a 49-point asphalt grid differs by at most **0.000492 preview pixels** between the two projections. Workbench's view-dependent specular shading caused a 16.789/255 mean RGB jump. Easing the specular contribution out before the switch and back in afterward reduces that isolated same-pose difference to **0.073/255** (about 99.57% lower). Tiny local differences remain on raised flecks/decals; the maximum single-channel difference is 142/255, so this is not a claim of identical shading at every pixel. Motion between adjacent delivered frames is additional to this controlled same-pose measurement.

The specular contribution fades over A55..78, stays off through A90 and returns by A115. Identical-camera Workbench samples are mixed in display RGB; weights are stored in each affected camera record. The saved blend contains the baked camera and rigs; use `v3_build.py render` to reproduce this lighting compensation exactly.

## Bus near-miss

Appended the scene's **teal-and-cream d.gg bus from `roxy_vehicles_pass9.blend`**, the existing branded live-sprite rig. No substitute block was used. It travels along the actual +u lane, **v=11**, at a constant **4.7 source units/s**, with its tires on the measured asphalt plane. The original wheels roll at the corresponding rate. It starts outside the image, remains absent throughout A1..15, enters after the hold, crosses beneath the descending camera around A125..138, and clears the doorway view as the camera continues forward.

Closest camera-to-bus evaluated surface distance: **0.323474 source units at A138**. The roof and ventilation housing briefly fill much of the foreground. The path export covers the whole A sequence, including off-screen travel. There is no bus in B.

## Door entry and dark cut

Each complete leaf now belongs to its own jamb hinge. Its upholstery, plates, screws and trim keep constant local transforms: no scaling, shearing or independently interpolated component translations. Screen 1 opens outward because its existing shallow vestibule has narrow side-wall returns that intersect an inward-swinging leaf. Hinges are at the front edge of the jamb, y=-0.078. The original closed geometry is retained.

Screen 1 opens over A355..389 to 89 degrees, settles to 88 degrees by A399 and stays open. The camera passes through the center after the opening completes. The two existing curtain banks translate apart over A355..390 without stretching their folds. The source's flat under-door light-leak strip is hidden once the door opens; it represented the closed-door light leak and intersected the swinging leaves.

The vestibule's wet-looking backing material is replaced with matte black in the working copy. Workbench specular contribution eases out over A350..386 so the backing reads as a dark gap, followed by the exposure fade over A394..418. The camera ends before the rear backing; no curtain face or lit flat panel rushes into the lens. A425 -> B1 remains the hard cut in darkness.

B uses the same rigid hinge method. Its leaves start at 88 degrees, remain open through B30, then ease closed by B76 behind the camera. The final closed doorway is preserved.

| Clearance | Closest distance | Frame |
|---|---:|---:|
| Screen 1 camera to leaf | **0.340243** | A397 |
| Auditorium camera to leaf | **0.467660** | B9 |
| Lobby minimum overhead | 0.333302 | A411 |
| Auditorium minimum overhead | 0.197219 | B49 |

Distances are in the source scene's stylized units and measure the camera center, not a human body or a real building scale. Evaluated triangle checks covered every frame A355..425 and B1..76: **zero leaf-to-leaf or visible leaf-to-trim/wall/curtain intersections**. All 665 camera frames were checked: **zero camera-centerline geometry crossings**. The existing B210 -> B211 projection-representation change is excluded from physical swept-segment testing.

## Endpoint and route checks

A1 uses the exact source ORTHO camera, scale 22.62741661. Independent JSON projection gives maximum landmark error **0.000185 px at 1920 x 1080**. Each of the first 15 rendered pictures matches its corresponding v2 frame within 0.000014/255 mean RGB, excluding the updated labels. Existing source-scene animation continues during the camera hold. This also verifies that the bus does not appear in the opening hold.

B211..240 holds the original ORTHO camera, scale 32. Maximum independently projected landmark error is **0.000107 px**. Final picture difference from v2 is 0.000000/255 mean RGB excluding labels.

These are geometric matches to the live page coordinate contract and image comparisons to the earlier Workbench preview. Workbench studio lighting/materials are not pixel-identical to the production Cycles beauty, rain or live chat.

From A165 onward, every camera world/projection matrix equals v2 A120 onward, shifted by 45 frames. Every B camera world/projection matrix is unchanged from v2. The 1.15-unit lobby/tunnel height, raised auditorium approach and original cards are retained. Only the requested doors, curtain/darkness treatment and earlier exterior bus differ. Do not interpolate world positions across B210 -> B211.

## Verification and render times

The actual MP4 container is H.264 `avc1`, 640 x 360, 30 fps, 665 frames and 22.166667 seconds. **All 665 encoded frames were decoded and compared against their rendered sources**; maximum per-frame mean RGB error was 2.937/255. Both sides of the dark cut measure 0.0375/255 and 0.0375/255 mean RGB excluding labels. Selected decoded frames were inspected visually across the opening, bus pass, doors, auditorium and endpoint; numerical decoding is not a claim of owner playback approval.

| Retained render work | Frames | Workbench samples | Render-loop seconds |
|---|---:|---:|---:|
| A | 425 | 506 | 620.79 |
| B | 240 | 240 | 138.21 |

Encoding took **3.75 s**; full-frame decode/comparison took **24.31 s**. Render times include retained check frames, lighting-sample compositing and PNG writes. They exclude replaced exploratory frames, builds, geometry checks, hashing and visual inspection; they are not total task elapsed time.

Re-hashed **34,160 pre-existing files / 3,146,171,242 bytes**: zero changed or missing files. This covers v1/v2 outputs, protected source blends, live art and starting pages. Writes stayed in `fly/` plus this note. `PROGRESS.md` was not edited because Brief 61 explicitly restricts the write locations. No page, OBS collection, server, cloud resource or production art was changed.

Reproduce with `v3_run_blender.ps1` and `v3_build.py`: `build A`, `build B`, `export`, then `render A` and `render B`; use `v3_encode_verify.py encode` and `verify` afterward. Use the wrapper through PowerShell with `-ExecutionPolicy Bypass` if local script execution is restricted. Existing v3 frames resume; use `reprobe` to explicitly regenerate changed frames. All new caches use `v3_cache/`.

STATUS: COMPLETE - ONE V3 FLY-THROUGH PREVIEW, CAMERA AND BUS PATHS, RIGID DOORS, CLEARANCE/ENDPOINT VERIFICATION AND NOTES DELIVERED; READY FOR OWNER REVIEW; NO PRODUCTION RENDER, CLOUD RUN OR LIVE-ART CHANGE; STOP.
