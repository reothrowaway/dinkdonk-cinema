# Brief 100 - Auditorium screen shots: twice as slow, simulator-ride motion (14 Nov 2026)

Follow-up to Brief 99 (read `NOTES-99.md` and the bottom of `NOTES-godot.md`: 99, 99b, 99c). The owner reviewed the
three shots in the viewer and said: "the animations are not it, have them be 2x slower and also actually have the
effect of those old simulator attraction thingies". Godot stage only: no Cycles, no video, no cloud, no page changes.

Render agent: Claude Fable 5.2, high effort (the owner asked for Fable by name).

## What exists now
- `godot-spike/run-live-aud.bat` -> `main_aud99.tscn` / `main_aud99.gd`, `live_view_aud99.gd`, `shots_v99.gd`.
- Shots T1 (4.0 s: zoomed Film shot -> screen fills the frame square-on, OBS cuts there), T2 (5.0 s: full screen ->
  over-the-heads hold pose), T3 (5.5 s: hold -> default auditorium view). Lights down throughout.
- 99c "spaceship bob" in `shots_v99.gd` `apply_bob()`: a smooth float + bank baked into the rows. The owner says it is
  not it. Replace it (keep a backup of the current file).

## Do
1. **Twice as slow:** T1 8.0 s, T2 10.0 s, T3 11.0 s (`LENGTH`; the eased base paths stay the same shape).
2. **Simulator-ride motion.** The owner means the old motion-simulator attractions (the 80s/90s ride films where the
   audience sits in a moving cabin or seats: Star Tours-style flights, Back to the Future: The Ride-style chases,
   fairground and arcade simulator pods). Research what makes their camera motion feel like that (web search is
   fine, read only, no downloads) and design it for these three shots. Expect things like: the camera behaves like a
   vehicle with weight: a little dip/anticipation before it sets off, pitching back as it speeds up and forward as it
   brakes, banking hard into turns, a fine engine rumble/vibration while it moves, a few bumps or jolts that are timed
   rather than random noise, and on arrival an overshoot with a bounce or two that settles. It must read as "we are
   riding in this", while the screen and the room stay readable (no nausea, no strobing).
   - It replaces 99c, it is not added on top. No endless float: every shot starts still and ends still. The T2 hold is
     still once it has settled (the owner disliked "bobbing forever").
   - **Exact frames stay exact:** T1 frame 1 (= the page's Film framing), T1's last frame (screen filling the frame, the
     OBS cut), T2's first and last frame, T3's first and last frame (= the default view) must be the same matrices as
     the unshaken paths. Any settle must finish inside the shot.
   - Deterministic and baked into the rows (`matrix_world`/`matrix_view`, a per-row record of what was added), so the
     shot files `assets_v99/t1|t2|t3_camera_path.json` carry it to Cycles. Mind the long-lens/orthographic rows at T1's
     start and T3's end: a rotation there is magnified enormously; size every offset in frame terms as 99c does.
   - Keep the viewer controls: B = motion layer on/off, the two keys right of P **by physical position** (the owner has
     a Spanish keyboard) or numpad - / + = weaker/stronger, strength 1 = as designed. HUD shows it.
3. Re-export the shot files and check.

## Checks (headless only)
- **Never open a visible Godot window** (owner, 14 Nov: "stop flashing the godot screen"). Run Godot only with
  `--headless` (export: `--headless --path . res://main_aud99.tscn --quit-after 10 -- --mode=live --export`; viewer:
  `--headless ... --quit-after 1500 -- --mode=live --autoplay=T1,T2,T3`). No rendered stills: the owner reviews live.
- Endpoints: compare the exact-frame matrices with the unshaken ones (must be equal).
- `campath_v99.py` (pass the three files as arguments; Blender's Python at
  `tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe -I` has numpy) on the base motion; report the motion layer
  separately: peak offsets in px, peak roll/pitch, rates, how long each settle takes.
- `qa_clearance_v99.py` (limit 0.30 m to seats and stand-ins), `qa_frames_v99.py` (report how far the screen edge
  leaves the frame and where; none at the T1 cut).
- The viewer autoplays all three shots headless, exit 0, no script errors.

## Write
`NOTES-100.md`: what the motion layer does per shot (timeline of dips, bumps, banks, settles with times), the
numbers, check results, what is not verified. A few lines in `NOTES-godot.md`. End with a STATUS line.

## Rules
Write only inside `roxy3d/` (back up `shots_v99.gd`, `main_aud99.gd`, `live_view_aud99.gd` before changing them; never
touch the v97 files, `qa11/`, `out10*`, `fly/transition/`, pages, `shared/`, .blend files). No visible windows, no
computer use, no cloud, no downloads, no commit. Then stop.
