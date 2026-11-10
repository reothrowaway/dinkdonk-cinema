# Brief 87: auditorium entrance corridor, layout BLOCKOUT (one still)

Owner, 9-10 Nov 2026 (queue item 63, picked from the mockup `../concepts/improve2/drafts/A8.png`): the auditorium should
show the corridor that leads into it, "the hole that leads into the cinema". Today chatters appear outside the rear
entrance door out of nowhere, in the black void at the bottom left of the frame. His brief for the look, for later:
**dim, less lit than the hall, the same purple look as the cinema lobby, maybe posters on the walls, some really dim
lights.** The mockup's corridor was too bright (pink neon line, bright posters); ignore its styling.

How it is used (owner, 9 Nov): the corridor is **only a way in**. Chatters on their way to a seat walk through it and
in at the door. Nobody waits or stands in it.

This brief is only the **layout blockout**: plain labelled boxes from the fixed auditorium camera, so the owner can
approve where the corridor runs, how long and wide it is, and what stands in it. No materials, no lights, no posters'
artwork, no final-quality render.

## Inputs (read-only - never modify)
- Auditorium production scene: `roxy_cinema_draft13.blend` (lit) and `roxy_cinema_draft13_dim.blend`, the build script
  that made them (`build_cinema_draft13.py` if present, else the newest `build_cinema_draft*.py`), the live frame
  `qa11/cinema_draft_13.png` (1920x1080) and `qa11/cinema_layout_13.json`.
- Page projection (auditorium stage 1920x1080), from the layout's `camera`: floor point (u, v, z) -> stage px
  `P = [Ox + (u - v) * 60 * k, Oy + ((u + v) * 30 - z) * k]` with k = 0.7071067811875, Ox = 890, Oy = 370.
- The entrance: `walk_route.rear_portal_to_cross_aisle` in the layout. Its first point `[1.45, 15.12, 0]` is where a
  chatter appears today, just outside the entrance door (stage px about 310, 722); the route then goes in through
  the door (`page_layers.entrance_door`, a 16-frame sprite sheet at x 247, y 539) and the tunnel under the seats
  (`tunnel` in the layout: clear u 0.30..2.65). The door, the tunnel and everything inside the hall stay as they are.
- The mockup, for the idea only: `../concepts/improve2/drafts/A8.png`.
- How the earlier auditorium blockouts were made: `build_cinema_draft6_blockout.py`, `qa11/CINEMA-DRAFT-05.md`, `-06.md`.

Work in a new folder `qa11/corridor/`, on a copy of the scene.

## The corridor (boxes only)
- A straight corridor **outside** the entrance door, continuing the walk route's line: floor at z = 0, centred on
  u = 1.45, running from the door (v about 15.1) away from the hall toward larger v (down-left in the frame), as far
  as it can go and still read: at least 5 m, to the frame's edge if that looks right. Width about the door's opening
  plus a margin (1.8-2.4 m); use what the door and tunnel really need and say so.
- The camera looks at it from the same side as the hall, so the wall on the far side (smaller u) is the one that
  shows: a full-height wall (about 2.6 m) along that side. The near side (larger u) must not hide the walkers: leave it
  open, or a knee-high cutaway kerb like the hall's own cut walls. No ceiling. At the far end either a doorway (plain
  box frame, as if it led to the lobby) or let the corridor run out of the frame; show whichever reads better and say
  which.
- On the far wall, as plain flat boxes: three poster frames (portrait, about 0.7 x 1.0 m) spaced along it, and two or
  three small wall lights between them (they will be the "really dim lights"). A floor runner (carpet strip) down the
  middle as a flat box of another colour.
- Nothing may cover the entrance door or change the hall. Check that a walker (about 1.7 m tall, 45 * k stage px) on
  the route is visible along the whole corridor from the camera, and that the corridor does not collide with the
  hall's outer walls, the plinth or anything else in the scene. Report what part of the corridor the frame shows.

## Deliverables (all in `qa11/corridor/`)
1. `blockout.png`: ONE still, 1920x1080 from the production camera (same framing as `cinema_draft_13.png`), fast
   preview render (Workbench or Eevee) of the whole scene with the corridor as plain flat-coloured boxes: floor one
   colour, runner a second, far wall a third, poster frames a fourth, lights a fifth, far-end doorway a sixth. Burn in
   4-5 short labels with arrows (for example "corridor 2.0 m wide x 6.2 m long", "far wall 2.6 m", "3 poster frames",
   "walk route", "to the lobby"). Nothing else in the image.
2. `corridor_geom.json`: every box in Blender world coordinates and in page (u, v, z) units, sizes in metres, the walk
   route's new start point (the far end of the corridor) and the extra route points in the layout's `[u, v, z]` form,
   and the corridor's outline, the poster frames' quads and the lights' positions in **stage pixels (1920x1080)**,
   checked against the production camera.
3. `corridor_blockout.blend` (the copy, with the boxes in their own collection `CORRIDOR`) and the script you used.
4. `../../NOTES-87.md`: what you did, sizes chosen and why, what limits them, anything that had to move, how much of
   the corridor the frame shows, render time, and a short plan with a time estimate for the later styled draft and
   full set on the local RTX 3050 (lit + dim versions, depth slices for the page, whether the entrance door sheet has
   to be re-rendered).

## Rules
Write only inside `roxy3d/qa11/corridor/` and `roxy3d/NOTES-87.md`. Never modify the source .blend files, any other
file in `qa11/`, `out10/`, `out10m/`, `out10l/`, `out10mist/`, or any page. No final-quality renders, no cloud, no extra
images, close-ups or comparisons beyond `blockout.png`. No computer use. End with a STATUS line and stop.
