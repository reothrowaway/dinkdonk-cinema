# Brief 62: fly-through v4 - door-led crane opening

Owner feedback on v3 (6 Nov 2026): "It needs to be smoother on the main pan. This is basically first going all in on
a piece of street, which doesn't make sense; it should start panning towards the door."

Codex's own read-only review agreed (`reviews/flythrough-v3-opening.md`): the move loses its destination (the
cinema is mostly gone by A40, A60-100 make pavement the subject, the entrance is readable again only around A140),
it reads as "look down, magnify street, look up" in separate stages, and the bus arrives too late to motivate the
drop. The owner chose that review's **option 1, door-led crane**. Build it.

Start from v3 (`fly/v3_*`, NOTES-61.md). Change only part A's opening (up to where it joins the existing route);
keep the hold, the lower camera, the route after the entrance, the doors and part B as in v3. New files get a `v4_`
prefix; keep earlier outputs untouched. Same preview style (640x360, 30 fps, frame label, scale cards).

## The move (frame numbers are part A, 30 fps; adjust if needed, report the final timing)
- **A1-15:** unchanged hold, exact match to the live isometric view.
- **A16-55:** travel diagonally toward the entrance straight away, overlapping descent, rotation and zoom; keep the
  doorway toward the upper center of the frame. The look-at target moves from the original view center toward the
  paving directly outside the entrance, never the middle of the road.
- **A56-78:** steepen toward 90 degrees down, tightening onto one flat patch of that approach paving right in front
  of the door. Make the projection switch around A72, with matched ground scale, at a moment when the frame holds no
  curb, facade edge or raised object. The doors leave the frame only briefly.
- **A79-125:** keep moving forward while the target lifts from the paving to the door's midpoint; the entrance is
  back in view by about A90.
- **A126-165:** finish the tilt and blend into the existing entry route.
- **Bus:** retime it so it crosses during the reveal as a punctuation (still a close pass, still a near miss), but
  never covers the entrance again once the doors are back.
- One continuous position spline and one target spline, with matched velocity and acceleration through every join.
  Ease out of the hold and into the entry; keep forward speed through the switch instead of easing each stage to a
  stop; keep the heading through straight-down so there is no roll flip.

## Deliverables (in `fly/`)
1. `v4_flythrough_AB.mp4` (full fly-through).
2. `v4_camera_path.json`, `v4_bus_path.json` (same formats as v3).
3. `../NOTES-62.md`: final timing per stage, where the switch happens and the ground-match error there, bus closest
   distance and frame, endpoint match results, angular velocity/acceleration peaks before and after (v3 vs v4),
   render times.

## Rules
Write only inside `roxy3d/fly/` and `roxy3d/NOTES-62.md`. Never modify out10/, out10mist/, qa11/, the source .blend
files or any page. Preview render only: no Cycles production render, no cloud, no extra clips. STATUS line, stop.
