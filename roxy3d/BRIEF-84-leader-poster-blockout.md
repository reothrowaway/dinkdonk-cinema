# Brief 84: "Our Dear Leader" poster by the box office, placement BLOCKOUT (one still)

Owner, 10 Nov 2026 (queue items 65 L38 and 68): the lobby gets a propaganda poster of the community's "Dear Leader"
(Destiny, the face of the WEOW emote), "done really nicely, like old soviet iconography ... and on blender fully baked
in". He picked the place: **by the box office**. Later it will be designed as a proper poster, modelled in the lobby
scene and rendered at full quality in Cycles as its **own layer** over the existing pack (like the street marquee,
`out10m/`). Nothing in `out10/` gets re-rendered.

This brief is only the **placement blockout**: plain flat boxes from the fixed lobby camera, so the owner can approve
where it hangs and how big it is. No artwork, no materials, no final-quality render.

## Inputs (read-only - never modify)
- Lobby production scene: `cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend` (frozen out10 scene; its
  camera is the production iso camera). Reference frames: `out10/full.png`, `out10/full@2x.png`, `out10/manifest.json`.
- Page projection (lobby stage 1920x1080): floor point (u, v, z) -> stage px `P = [900 + (u - v) * 60, 350 + (u + v) * 30 - z]`.
  Brief 59/79 mapping, reuse it if it holds: `world = [u, -v, z_px / 73.48469228349535]` (1 tile = 1 m).
- How Brief 79 did the same job for the marquee: `BRIEF-79-marquee-blockout.md`, `NOTES-79.md`, `marquee/build_marquee.py`.

Work in a new folder `leader/`, on a copy of the scene.

## The wall
The partition wall behind the box office that carries the long cream **TICKETS** sign (in the pack it is the occluder
`occ_restroom_side_wall`: the lobby-facing side of the restroom's side wall, at constant u, running along v). To the
right of the TICKETS sign the wall has a plain stretch that ends at the corner by the usher's gate. In stage pixels
that free stretch is about x 826..900, y 440..560 (its top edge slopes; measure it in the scene, do not trust these
numbers). The page currently draws a small placeholder there, 0.6 m wide x 0.63 m tall, top-left at stage px (838, 496).

## The poster (boxes only)
- One flat portrait-format panel on that free stretch, flush on the wall (a few cm proud of it), facing the lobby.
  Soviet posters are tall: aim for a width:height of about 2:3. Make it **as large as the free stretch allows** with a
  sensible margin: clear of the TICKETS sign, the wall's top cap, the wall's end corner and the box-office counter and
  glass below. From the placeholder I expect roughly 0.8-0.9 m x 1.2-1.3 m; use what the scene really allows and say so.
- A thin frame (one colour) around a poster face (a second colour), and one small picture light above it (a third
  colour): a short bar on a bracket, so the final poster is lit and reads in the dim lobby.
- Chatters (about 1.7 m tall, 50 stage px) stand and walk in front of this wall, and the box office is in front of
  its lower part. Check what the camera really sees of the panel and report the visible part in stage px.
- If the free stretch is too small for a poster that reads (under about 40 stage px wide), say so and show the best
  fit anyway; do not move it to another wall.

## Deliverables (all in `leader/`)
1. `blockout.png`: ONE still, 1280x720 from the production camera (same framing as the lobby drafts), fast preview
   render (Workbench or Eevee) of the whole scene with the poster as plain flat-coloured boxes. Because the poster is
   small in the full frame, put ONE magnified inset of the wall (about 3x) in an empty corner of the same image, with
   a thin line to the spot. Burn in 3-4 short labels with arrows (for example "poster face 0.85 x 1.25 m",
   "bottom edge 1.1 m above the floor", "picture light"). Nothing else in the image.
2. `leader_geom.json`: the panel in Blender world coordinates (frame and face corners), its size in metres, and the
   four corners of the poster face in **lobby stage pixels (1920x1080)**, checked against the production camera; the
   depth value `1000 + round((u + v) * 100)` at the panel; which existing occluders cover part of it.
3. `leader_blockout.blend` (the copy, with the boxes in their own collection `LEADER`) and the script you used.
4. `../NOTES-84.md`: what you did, the size chosen and why, what limits it, how much of it the camera sees, render
   time, and an estimate of the later full-quality layer render (alpha + light + depth slice at 1920x1080 and 2x) on
   the local RTX 3050.

## Rules
Write only inside `roxy3d/leader/` and `roxy3d/NOTES-84.md`. Never modify out10/, out10m/, out10mist/, qa11/, marquee/,
the source .blend files, or any page. No final-quality renders, no cloud, no extra images, close-ups or comparisons
beyond `blockout.png` (the one inset inside it is the only magnified view). No computer use. End with a STATUS line
and stop.
