# Brief 101 - Auditorium screen shots: Blender/Cycles port + local draft (14 Nov 2026)

The owner approved the three auditorium shots in Godot (Brief 99, 100 and the "glide", strength 2; read `NOTES-99.md`,
`NOTES-100.md` and the bottom of `NOTES-godot.md`) and said: "Yes, start the port". As agreed for every Godot round
(`godot-spike/WORKFLOW.md`, "Godot is the draft, Cycles is the final"): port to Blender, render with Cycles.

**This brief: the port and a cheap full-length local draft for the owner.** The final render (local or RunPod) only on
the owner's word; prepare the bundle so it is ready. Render agent: Claude Opus 5.5, high effort (a port with no new look).

## Inputs (read only)
- Camera: `godot-spike/assets_v99/t1_camera_path.json` (8.0 s, 241 frames), `t2_camera_path.json` (10.0 s, 301),
  `t3_camera_path.json` (11.0 s, 331), 30 fps, the `dinkdonk.flythrough.camera.v1` format (Blender coordinates,
  row-major `matrix_world`, PERSP/ORTHO rows, long-lens rows at T1's start and T3's end, `shutter_frames`). The glide
  is already baked in. `assets_v99/unshaken/` = the same without it (reference only).
- Scene: the house-lights-down auditorium of draft 14 = `qa11/corridor/corridor_full90_dim.blend` (draft-13 dim +
  the corridor, `NOTES-90.md`). Work on a copy in a new folder, e.g. `aud101/`.
- Plates: `qa11/cinema_draft_14_dim.png` / `@2x` (default view, lights down); the screen layout
  `qa11/cinema_layout_14.json` ("screen" corners).
- Tooling to reuse: the fly-through port and bundle of Brief 97 (`fly/v10/`: `build_port97.py`, `bundle97.py`,
  `build_transition97.py`, README; `NOTES-97.md` lessons: whole state per render, probe per worker, light-linking
  count, two-worker match), the multi-pod helper (`cloud/cloud-multi.sh`, Brief 75), `tools/qa-fly/` checks
  (camera path, flash scan).

## Do
1. **Port.** Build `aud101/aud101.blend` from the dim scene copy with three camera actions (one per shot) from the JSON
   rows, exactly (PERSP lens / ORTHO scale per row, clip planes, sensor), the shot length and fps, and the motion
   blur the fly-through final uses (shutter from the rows). House lights down for every frame, doors shut.
2. **The screen.** In the live show OBS pins the film onto the screen. Render the screen surface as the page shows it
   in the Film phase (find what `auditorium.html` draws there: the green the corner-pin covers) and make sure it
   lights nothing. Also write, for every frame of every shot, the four screen corners in 1920x1080 pixels
   (`aud101/t1|t2|t3_screen_corners.json`, computed from the camera rows and `cinema_layout_14.json`), so OBS can pin
   the film during the moves; T1's last frame must give the four frame corners (screen fills the frame).
3. **Exact frames.** T3's last frame = byte copy of `cinema_draft_14_dim.png`. T1's first frame = the page's Film
   framing of the dim plate (`auditorium.html` `screenShot()`: centre of the screen polygon's bounding box, zoom
   min(1920/w, 1080/h) * 0.94; from the `@2x` plate), handing over to the render in a few frames as the Godot viewer
   does (8). Check the render at those poses against the plates and report the difference.
4. **Depth for the chatters.** As the fly-through's final (Brief 78 policy, Brief 97 bundle): per frame, the depth of
   the opaque surfaces at the central pose without shutter, glass/transparent layers left out, packed the way the
   page's transition player reads it. Plus the **T2 hold plate**: T2's last pose as a clean still (color + depth),
   which the page will hold with the chatters drawn in. In the draft only for a few frames to prove it works.
5. **Local draft (the owner's review):** all three shots, full length, half resolution (960x540), low samples,
   denoised, motion blur on. Encode `aud101/draft/t1|t2|t3_draft.mp4` (H.264, under 30 MB each). Run the flash scan
   and the camera-path checks on it (`flythrough-qa-before-final`: brightness jumps, grey/black flashes, speed).
6. **Final bundle, not run:** a cloud bundle for the multi-pod helper (draft and final modes, 1920x1080, final
   samples, depth) with an estimate of GPU hours and cost, plus a local-only estimate on the RTX 3050.

## Write
`NOTES-101.md`: what was built, the draft files, check results (numbers), plate differences, the bundle and
estimates, what needs the owner (the final's go and budget), what is not verified. End with a STATUS line.

## Rules
- **No visible windows** on the owner's screen (owner, 14 Nov): Blender only with `-b`, Godot only `--headless`, no
  media players, no computer use; check videos by decoding frames.
- Check that no other Blender/Godot GPU job runs before rendering (`tasklist`); one job at a time on the RTX 3050.
- Write only inside `roxy3d/` (new files and folders). Never modify `qa11/` files, `out10*`, `fly/transition*`,
  `godot-spike/assets_v99/`, pages, `shared/`, or any existing .blend (copy it).
- No cloud, no RunPod spend, no downloads, no commit. Then stop.
