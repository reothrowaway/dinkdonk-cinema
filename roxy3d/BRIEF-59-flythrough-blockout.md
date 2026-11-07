# Brief 59: lobby -> auditorium fly-through, route BLOCKOUT (preview only)

Owner, 6 Nov 2026: the switch from the lobby to the auditorium should be a camera fly-through. Start in the fixed
isometric lobby view, change smoothly into a first-person camera, fly through the street, through the glass doors,
across the lobby, through the hallway, into one of the screen doors. Inside the auditorium, go through the entrance
tunnel and up near the screen, then pull back out into the auditorium's fixed isometric view and stay there. It is
rendered in Blender from the real scenes. Later the live page draws the real chatters into it (not your job here).

This brief is only the **route blockout**: a fast low-res preview so the owner can judge the path and timing.
No final-quality render, no Cycles production settings, no cloud, no changes to any live art.

## Inputs (read-only - never modify)
- Lobby: `cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend` (frozen production scene of out10; its
  camera is the production iso camera). Reference frame: `out10/full.png` (+ `out10/manifest.json`).
- Auditorium: `roxy_cinema_draft13.blend` (draft 13 camera = the live auditorium view). Reference frame:
  `qa11/cinema_draft_13.png`; layout `qa11/cinema_layout_13.json`.
- Page projection (for the mapping deliverable): `../lobby.html` stage is 1920x1080, floor plan point (u,v,z) ->
  stage px `P = [900 + (u - v) * 60, 350 + (u + v) * 30 - z]`; the auditorium uses the layout JSON.

Work on copies in a new folder `fly/` (copy whatever the blends need so textures/packed paths still resolve; report
missing files).

## Camera
- **Part A, lobby (about 12 s).** Frame 1 must match the production iso camera: use a perspective camera with a very
  long lens placed far back along the same view axis so it reproduces the ortho framing; check against
  `out10/full.png` and report the pixel offset of a few known points. Then dolly-zoom (lens shortens while the
  camera moves in) into a first-person camera at about eye height (~1.7 m), down to the street in front of the
  entrance, through the glass entrance doors (if they are closed in the scene, open them the way the scene's door
  rig does, or fly through an existing opening), across the lobby past the box office and snack bar, through the
  hallway, and into the screen door the owner will most likely use (pick one, say which and why). End inside the
  door, in darkness.
- **Part B, auditorium (about 8 s).** Start in the dark at the entrance (padded entrance / tunnel), come through
  the tunnel into the room, move toward the screen, then turn and pull back with the reverse dolly-zoom so the last
  frame matches the draft 13 iso camera exactly (check against `qa11/cinema_draft_13.png`, report offsets).
- Smooth splines with eased speed, no sudden turns (it must be comfortable to watch on stream). 30 fps.

## Placeholders
Put about 20 simple upright placeholder cards (flat colored boards ~1.7 m tall, facing the camera) at typical
places: box office queue, snack bar, lobby floor, hallway, a few seats in the auditorium. They only show scale;
the real chatters come later from the page.

## Deliverables (all in `fly/`)
1. `blockout_A.mp4`, `blockout_B.mp4` and `blockout_AB.mp4` (A then B, hard cut in the dark door): 640x360,
   30 fps, fast preview render (Workbench or Eevee), with the frame number and part burned in a corner.
2. `camera_path.json`: for every frame of A and B, the camera world matrix, lens, sensor, clip range, plus the
   render resolution it was made for.
3. `mapping.json`: how page coordinates map to Blender world coordinates, for both scenes (lobby floor (u,v,z) ->
   world, auditorium layout points -> world), verified on a few points.
4. The two working .blend files with the cameras and paths, and the script(s) you used.
5. `../NOTES-59.md`: what you did, the door chosen, frame-1 / last-frame match results, anything in the scenes that
   looks unfinished from street level or first person (missing back faces, low-res textures, empty interiors),
   render time, and what a full-quality render would cost in time on the RTX 3050 vs a cloud 4090.

## Rules
Write only inside `roxy3d/fly/` and `roxy3d/NOTES-59.md`. Never modify out10/, out10mist/, qa11/, the source
.blend files, or any page. No final-quality or full-resolution renders, no cloud, no extra clips beyond the three
blockout videos. End with a STATUS line and stop.
