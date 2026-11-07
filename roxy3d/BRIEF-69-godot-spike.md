# Brief 69: Godot spike - can the lobby look right in Godot, and how fast is a fly-through?

Owner, 7 Nov 2026: we are moving the 3D work from Blender/Cycles to a game engine, because Cycles renders leave too
much dead time between versions (the fly-through took 5.5 h on a cloud 4090; even optimized ~3 h). Claude chose
**Godot 4** over UE5: scenes/materials/scripts are text files that Codex and Claude can read and edit, it is small,
runs well on this RTX 3050 6 GB laptop, and needs no account. This brief is a **short spike** to see if the look holds
up before we commit. Do not try to finish everything; get an honest answer.

Godot 4.7.2 (official, verified): `../tools/godot-4.7.2/Godot_v4.7.2-stable_win64_console.exe` (console build for
CLI; the non-console exe is the editor). Blender 5.2.3: `../tools/blender-5.2.3-windows-x64/blender.exe`.

## Inputs (read only)
- Lobby scene with the latest fixes: the v7 lobby blend in `fly/v7/` (see NOTES-67.md / NOTES-68.md for which file;
  falls back to `fly/prod/`). The look to match: `out10/full.png` (live lobby still, night) and the production
  fly-through frames in `fly/prod/cloud-result/flythrough65/frames/` (old route) and the v7 proofs in
  `fly/v7/qa68/`.
- The v7 camera path: `fly/v7/camera_path.json` (format in NOTES-65), bus path `fly/v7/bus_path.json`, mapping
  `fly/v7/mapping.json`.

## Do
1. **Export** the lobby (geometry, the bus) from Blender to glTF with a script. Procedural Cycles materials won't
   transfer: bake what matters (base color, roughness, emission; normal if cheap) to textures at sensible
   resolutions, or rebuild simple materials in Godot - your call, say which and why. Keep the export reproducible
   (one script).
2. **Godot project** in `godot-spike/` (Forward+ renderer). Rebuild the night look: emissive neon with glow/bloom,
   street lamps and lit windows as lights where it matters, volumetric fog, wet street (low roughness, SSR and/or
   reflection probes), falling rain (GPU particles as streaks, persistent, no popping), the AgX-like tonemap/exposure
   so it reads like the Cycles still.
3. **Still:** an orthographic camera reproducing the live isometric view (the same projection as `out10/full.png`;
   mapping in `fly/v7/mapping.json`; Blender Z-up -> Godot Y-up). Render it at 1920x1080 and make
   `godot-spike/compare_still.png`: live Cycles still | Godot, side by side.
4. **Fly-through piece:** animate the camera from `fly/v7/camera_path.json` (convert matrices; perspective lens/
   sensor -> Godot FOV; the opening ortho -> perspective part can be skipped) for about 10 seconds that include
   the dive, the bus near miss and the street glide to the doors (roughly A300-A600 of v7), with the bus driving
   along `bus_path.json`. Motion blur: Godot has no built-in camera motion blur; do it properly by rendering with
   Movie Maker mode at a higher fixed fps (for example 120) and averaging sub-frames down to 30 fps (about a
   1.25-frame shutter like Cycles), or a compositor-effect blur if that's cleaner - say which. Output
   `godot-spike/flythrough_piece_1080p30.mp4` (Blender's ffmpeg can encode PNGs if needed) and
   `godot-spike/compare_frames.png`: 3 matching moments, Cycles v7/production | Godot.
5. **Timing:** how long the Godot render of the piece took (per frame and total, including sub-frames), and an
   estimate for the full 50 s fly-through. Compare with Cycles.

## Deliver
`godot-spike/` (project, export script, outputs) and `NOTES-69.md`: what looks as good, what looks worse and why,
what it would take to get closer, render timings, how the work would be split from here (lobby, auditorium,
fly-through, possibly running the lobby live), and your recommendation. STATUS line, stop.

## Rules
Write only inside `roxy3d/godot-spike/` and `roxy3d/NOTES-69.md`. Never modify out10/, out10mist/, qa11/, fly/,
the source .blend files, any page, or the Godot/Blender installs. No downloads (no asset-library add-ons) - if
something would really need one, stop and say what. No cloud. A cloud render is running remotely; ignore it.
