# Brief 61: fly-through blockout v3 - smoother top-down drop, bus near-miss, clean door entry

Owner feedback on Brief 60 (6 Nov 2026): **opening 1 (top-down drop) is the one.** Three changes:
1. "It should simulate that first drop into the street a little bit better: smoother camera work, not as wonky and
   sudden as now."
2. "Maybe when zooming in it barely misses a bus that goes through the street; that adds more character."
3. "The cinema door animation is omega scuffed."

Build v3 from Brief 60's variant 1 (`fly/v2_blockout_A1.blend`, `v2_build.py`) and the lowered part B
(`v2_blockout_B.blend`). Keep everything after the lobby entrance as in v2 unless listed here. New files get a `v3_`
prefix; keep v1/v2 outputs untouched. Same preview style (640x360, 30 fps, Workbench or Eevee, frame label, cards).

## 1. Smoother drop
- Make the opening one continuous, physical-feeling crane move. Today the rotation to straight down, the zoom and
  the drop read as separate jerky stages. Blend them: the rotation, the zoom-in and the start of the descent overlap,
  with long eases and no change of direction mid-move. Look at the camera's angular velocity and acceleration curves
  and remove spikes and reversals.
- It may take a little longer: about 4.5-5 s from the end of the hold to street level instead of 3.5 s.
- Keep the projection switch while looking straight down at flat ground (that's why the owner chose this one),
  but hide it inside the smooth motion. Report and minimize the shading jump Codex noted at the switch.
- The tilt up from straight down to facing the doors should feel like a camera operator's move: ease in, a slight
  settle at the end, no snap.

## 2. Bus near-miss
- A bus drives along the street in front of the cinema during the drop. The camera comes down just past it, close
  enough to feel like a near miss (the bus passes right under or beside the lens, filling part of the frame for a
  moment), then the bus drives on out of frame while the camera continues to the doors.
- Use the scene's own bus model if there is one (check the vehicle assets used for the live bus sprites);
  otherwise a simple bus-sized block in the bus color, and say so.
- The bus must not be visible during the opening hold (frames 1-15 must still match the live page exactly); it
  enters from off-screen after the hold. Drive it along the real lane at a plausible speed with its wheels on the
  road.

## 3. Door entry (Screen 1, end of part A, and the auditorium entrance at the start of B)
Today the padded door leaves end up pressed against the camera, their texture stretched and smeared, and then the
camera flies into a wall of folded curtain. Fix it:
- The Screen 1 doors open properly before the camera gets there: each leaf swings on its own hinge at the jamb,
  smoothly with an ease and a small settle, fully open and out of the way with no intersections and no stretched
  textures (rotate the leaves; do not scale or deform them). The camera passes through the middle with clear space
  on both sides.
- Behind the door, don't fly into the curtain face: either the curtain parts as the camera comes through, or the
  camera goes into the dark gap beside it. The frame should go to black smoothly (no flat surface rushing at the
  lens) for the hard cut to part B.
- Part B: if the auditorium door is animated at the start, make it equally clean. No clipping, no stretched leaves.
- Report the closest distance between the camera and any door leaf.

## Deliverables (in `fly/`)
1. `v3_flythrough_AB.mp4`: full fly-through.
2. `v3_camera_path.json` (same format), plus the bus's path per frame (position, heading) in the same file or
   `v3_bus_path.json`, since the page may later need to know where the bus is.
3. `../NOTES-61.md`: what changed, new lengths, endpoint match results, door clearances, render times.

## Rules
Write only inside `roxy3d/fly/` and `roxy3d/NOTES-61.md`. Never modify out10/, out10mist/, qa11/, the source .blend
files or any page. Preview render only: no Cycles production render, no cloud, no extra clips. STATUS line, stop.
