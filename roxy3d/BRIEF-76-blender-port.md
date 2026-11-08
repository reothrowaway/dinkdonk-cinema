# Brief 76: port the approved Godot fly-through to Blender (fly/v8) and build the Cycles final bundle

The owner approved the Godot draft on 7 Nov 2026 ("alright its good"). Port all of it to the Blender production
scene and build the final bundle. The render itself runs later on RunPod (5 pods, Brief 75 `multi` mode), only after
the owner OKs the spend. Read `godot-spike/FINAL-CHECKLIST.md` and `godot-spike/WORKFLOW.md` first.

## Build `fly/v8/` from `fly/v7/` (leave v7 untouched)
1. **Camera:** use `godot-spike/assets_v2/camera_path.json` exactly (1,504 frames, A 1-1100, cut at global 1101,
   B 1101-1504, 30 fps). It already contains the approved one-move dolly-zoom opening (`opening_v7.py`: far pinhole
   from frame 1, no ortho phase), the soft distance cap (~20,000 units max, `cap_distance.py`) and the smoothed B
   pull-back aim point. Per-frame matrix_world, lens_mm, sensor, clip_start/clip_end and camera_type. Do not
   re-time, re-smooth or re-derive it. Global 1475-1504 stays the exact ortho live-auditorium view.
2. **Bus:** `godot-spike/assets_v2/bus_path.json` (near miss 14.43 s).
3. **Oncoming car (new):** `godot-spike/assets_v2/car_path.json` - the street's blue sedan `sedan_b`
   (`build_vehicles.py`, see `godot-spike/export_car.py`), far lane, driving -u at 5 units/s, passing the camera at
   ~17.2 s. Rolling wheels (rotation from `distance_travelled`, radius 0.091), lit head/tail lamps; headlight
   light sources so it reads on the wet street. Real motion blur on it.
4. **Doors/curtain:** drive the Screen 1 hinge and curtain tracks from `godot_animation_frame` as in the checklist
   (opening starts 34.10 s, 88 degrees by 35.40 s, camera crosses hinges 36.27 s). Leaves rigid.
5. **Remove** the static `D5 metal and cap splash crowns` and `D5 physical surface beads`.
6. **Keep** everything else of v7: night look, falling rain fixes, original Cycles lights in lobby and auditorium
   (Godot's light conversions are approximations - do not copy them), the Opus speed preset, depth pass, the
   Brief 68 fog fix for the far camera, strong motion blur (1.25-frame shutter; may go up to 1.5 if it reads better
   - owner likes it explicit).

## Check locally before bundling (540p is fine)
- Render single frames: 1, 45, 90, 120, 150, 181 (opening), ~433 (bus), ~516 (car), ~1050 and ~1100 (door/cut),
  1250, 1440, 1474, 1475. None black or grey-flat; frame 1 matches the live lobby still (`out10/` base) and 1475
  the live auditorium still; nothing pops between 1474 and 1475 beyond ~1 px.
- Opening 1-181: the old ortho->pinhole switch at 3 s is gone. Render frames 80-100 in a row and confirm no
  brightness jump (shadows, fog, reflections) - the owner saw light change there before.
- `tools/qa-fly/campath.py` on the v8 camera_path.json (should equal Godot's: no yaw reversals 0-9 s).

## Bundle
`cloud/roxy-cloud-bundle-76.tar.gz` (final mode: 1920x1080, all 1,504 frames, 30 fps), working with both
`cloud-render.sh full` and the Brief 75 `multi` mode (shared queue, 5 pods). Smoke-test at tiny resolution locally
(a few frames from the opening, the car pass and B). Give Claude the exact `multi` command, checksum, and the
expected time/cost on 5 mixed GPUs. Do NOT start pods or call RunPod. Do not edit `cloud-render.sh` (Claude may be
using it); put adapters in new files.

## Rules (light)
Write only in `roxy3d/fly/v8/`, `roxy3d/cloud/` (new files) and `roxy3d/NOTES-76.md`. `godot-spike/` is read-only.
No hash audits, short notes, no computer use, no downloads, no cloud. End with a STATUS line.
