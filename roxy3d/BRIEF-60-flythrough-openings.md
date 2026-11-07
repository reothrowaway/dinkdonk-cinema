# Brief 60: fly-through blockout v2 - three openings + lower camera

Owner feedback on Brief 59 (6 Nov 2026): the route is good. Main problem: at the start, the change from the
isometric view to the perspective camera makes everything warp (the long-lens dolly zoom). Second: the fly-through
camera should be lower. The owner wants to see three different openings and pick one.

Work from Brief 59's files in `fly/` (blockout_A.blend, blockout_B.blend, build_flythrough.py, camera_path.json,
mapping.json). Keep Brief 59's outputs as they are; write new files with a `v2_` prefix. Same preview style as Brief
59 (640x360, 30 fps, Workbench or Eevee, part/frame label burned in, the 20 scale cards).

## 1. Lower camera (all three variants, part A and part B)
Bring the first-person eye height down to about **1.15 source units** (two thirds of 1.70; roughly chatter eye level).
At that height the camera should pass the Screen 1 door (1.55) and the auditorium tunnel soffit (1.347) **without
ducking**; remove the ducks and report the tightest overhead clearance. Keep the route itself (Screen 1, same path).

## 2. Three openings for part A
Each starts on the exact production isometric view (frame 1 matches out10 as in Brief 59, with the same short hold)
and ends at street level in front of the entrance, from where the rest of route A continues unchanged.
- **Variant 1, top-down drop:** while still an orthographic/isometric projection (no perspective change yet), the
  camera rotates to look straight down at the street in front of the entrance and zooms in (ortho scale only). Make
  the projection switch while looking straight down at the flat street, so the ground does not visibly warp. Then
  drop down and tilt up to face the doors at eye height.
- **Variant 2, flat zoom + quick swoop:** zoom straight in while still isometric (ortho scale only, no warp) until
  the entrance fills most of the frame. Then make the perspective change quickly, in about 0.5 s, during a fast
  swoop down to street level, with motion blur, so the warp reads as a short whoosh.
- **Variant 3, soft dissolve:** zoom straight in while still isometric until the entrance fills the frame; then a
  short (about 0.4-0.6 s) crossfade to a street-level perspective shot of the same doors, framed to match as well as
  possible. No dolly zoom at all.
Keep each opening short (aim for 3-4 s from the end of the hold to street level); total part A may change length,
say what it became. No sudden jerks; ease in and out.

## Deliverables (in `fly/`)
1. `v2_opening1_topdown_AB.mp4`, `v2_opening2_swoop_AB.mp4`, `v2_opening3_dissolve_AB.mp4`: each the full fly-through
   (its part A + the lowered part B, hard cut in the dark door as before). Render the lowered part B once and reuse it
   in all three.
2. `v2_camera_path_<variant>.json` for each variant (same format as camera_path.json; for variant 3 give both
   cameras over the crossfade and the blend weight per frame), and update the endpoint-match tables.
3. `../NOTES-60.md`: what changed, length of each variant, endpoint match results, clearance at the doors and tunnel,
   render times, and anything that looks wrong at the lower height.

## Rules
Write only inside `roxy3d/fly/` and `roxy3d/NOTES-60.md`. Never modify out10/, out10mist/, qa11/, the source .blend
files or any page. Preview renders only: no Cycles production render, no cloud, no other clips than the three
videos. End with a STATUS line and stop.
