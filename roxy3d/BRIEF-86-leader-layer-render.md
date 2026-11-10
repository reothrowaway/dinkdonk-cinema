# Brief 86: "Dear Leader" poster, FULL layer render (owner approved)

Owner, 10 Nov 2026, on draft 29 (`qa10/draft29-leader.png`): "Yes, render layer". This is the full-quality render of
the approved poster as its **own small layer set over the live pack**. Nothing in `out10/`, `out10m/` or `out10mist/`
is re-rendered or changed. Render on the **local RTX 3050** (no cloud).

## Inputs (read-only)
- Approved look: `leader/leader_draft29.blend` (draft 29: the poster reading DEAR LEADER, thin black-brown frame, brass
  picture light, 2 W warm area lamp), `leader/build_draft86.py` (the script that made it; it is `build_draft85.py` with
  new output names), `leader/poster.png` (the approved artwork, do not change it), `NOTES-84.md`, `NOTES-85.md` (your
  own layer-render plan), `leader/leader_geom.json`.
- Live pack contract: `out10/manifest.json` (projection, depth convention, occluders and their `depth_slices`),
  `../docs/art-pipeline.md`, `../docs/lobby.md`.
- How the marquee layer is drawn today and what it cost: `NOTES-83.md`, `out10m/marquee.json`, `out10m/merged.json`,
  `marquee/merge_layers.mjs`, and `PROGRESS.md` entries of 10 Nov 2026 about the marquee ("lighter layers", the perf
  session's measurements). Lesson from there: **every blended image element costs frames in OBS; the number of pieces
  matters more than their pixels.** This pack must be lean.

## Second opinion on draft 29 (taken into this brief)
- Taken: the layer set must carry the frame's contact shadow, the fixture's shadow and the lamp's soft spill on the
  wall and floor, so the poster keeps its mounting depth in the composite with no rectangular patch or halo.
- Taken lightly: the picture light's wash may be a touch stronger near the top with a soft fall-off downward, as long
  as the result still matches draft 29 at stream size (the owner approved that look). No other look changes.

## Production settings
Same as the live pack and the marquee pack (NOTES-56, NOTES-83): native 3840x2160 grid, production camera, 256 max /
64 min samples, 0.01 adaptive threshold, seed 1701, OptiX denoise, Blackman-Harris 2.5, the existing AgX look and
glare chain. 1x files come from linear 2x2 reduction of the native 2x captures. Crop every layer to its bounding box
plus a little padding; never change the projection. Use render borders: only the region around the wall needs
rendering.

## Deliverables: staging pack `out10l/` (new folder)
Every image at 1x and @2x, all rects and z in 1920x1080 logical pixels, same conventions as `out10/`. Aim for
**at most 6 image elements in total** on the page (fewer is better); say what you ended up with.
1. **Body** (poster sheet, frame, brass bar and bracket): straight-alpha PNG. The poster hangs on the wall that the
   pack draws as the occluder `occ_restroom_side_wall` (its `depth_slices` are in `out10/manifest.json`); that wall
   sprite is drawn above the background, so the body must be drawn **above the wall slice it lies on** and **below
   any walker standing in front of the wall**. Give each body piece the z of the wall slice under it plus 1 (state
   which slice), and split the body only where the wall's own slices split it. Check with the page's walker depth
   `1000 + round((u + v) * 100)` for a walker standing 0.3 to 1.0 m in front of the wall (u 3.45..4.15, v 3.2..4.1)
   that such a walker sorts above every body piece, and report the numbers.
2. **Light** (the picture lamp's contribution only: the wash on the poster is already in the body; this is the spill
   on the wall, the cap and the floor): RGB on black for `plus-lighter`, from a lamp-on minus lamp-off difference with
   identical seed. Light that lies on the floor or on background art goes into ONE image drawn under all walkers
   (z-index 5, like `out10m/merged/under_light`); light that lies on the wall occluder goes into ONE piece pinned
   above that wall slice (same rule as the body). Leave out anything that never exceeds 2/255 and list it.
3. **Shadow** (contact shadow of the frame and fixture on the wall, any darkening on the floor): straight-alpha black,
   source-over, drawn before the matching light; only if it is visibly needed. Say so either way.
4. `leader.json`: a manifest fragment in the same schema style as `out10m/marquee.json` / `merged.json`: for every
   element `file`, `file_2x`, `x`, `y`, `w`, `h`, `z_index`, `blend`, and for pinned pieces the occluder file and
   slice they sit on. Also the poster face's four corners in stage px (`face_quad`) so the page can aim the camera
   at it.
5. `checksums.json` (`{file, bytes, sha256}` for every file) and `validation.json` (the composite check below passed;
   pieces rebuild their parents exactly; the walker-depth check).
6. ONE check image `qa10/leader-layer-check.png`, 1280x720: the live look (`out10/full.png` plus the marquee layers
   the way `qa10/marquee-layer-check.png` was made) with the new layers composited the way the page will, and one
   4x inset of the wall cut from the 2x composite. It is there to be compared with draft 29. No other images.
7. `NOTES-86.md`: what you rendered, settings, per-pass times, total time, the file list with sizes, how each element
   is meant to be drawn in the page (z, blend), the count of elements, and anything the page must handle.

## Rules
Write only inside `roxy3d/out10l/`, `roxy3d/leader/`, `roxy3d/qa10/leader-layer-check.png` and `roxy3d/NOTES-86.md`.
Never modify out10/, out10m/, out10mist/, qa11/, marquee/, the source .blend files, `leader/poster.png`,
`leader/leader_draft29.blend`, or any page. No cloud. Use the local GPU only, one Blender job at a time (it is a 6 GB
laptop GPU). No computer use. End with a STATUS line and stop.
