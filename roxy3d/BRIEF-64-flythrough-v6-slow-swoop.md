# Brief 64: fly-through v6 - V5A, slower and smoother, no bounce

Owner on v5 (6 Nov 2026): **V5A (swoop + bus pass) is the one.** Two problems:
1. "At first the camera does like a camera bounce effect, there's something off there."
2. "These movements are way too fast and sudden. It needs to be smoother, take your time; it does not need to be
   30 s max."

Likely cause of the bounce (check it): A16-45 zooms out in ortho, the projection switch at A46 does not carry the
apparent zoom/travel speed across (a hitch), A46-64 pulls out again to a crest at A59, and A65 drops into the dive:
three direction changes of apparent scale within ~4 s. Peak speeds are also high (earlier routes reached 4.5-6
source units/s; the dive covers its whole height in under 3 s).

Build v6 from `fly/v5A_*` (NOTES-63.md). Keep: the exact A1-15 hold, the pull back + switch-while-small idea, the arc
out to the left, the dive bottoming out at the bus pass, the glide into the entrance, the lobby S-route to Screen 1,
the door entry, part B's route and final match, the lower 1.15-unit eye height, light banking, motion blur and lens
drops. New files get a `v6_` prefix; keep earlier outputs untouched.

## Smoothness requirements
- **One pull back, one crest, one dive.** The on-screen size of the cinema must shrink smoothly to a single minimum
  and then grow; no plateau, no second pull out, no reversal. Make the apparent zoom speed continuous across the
  projection switch (match the screen-space scale rate and motion on both sides of the switch frame, not only the
  position). Plot the cinema's projected size per frame and attach it (`v6_apparent_scale.png` + JSON).
- **Much slower.** Rough targets, adjust if it looks better: hold 0.5 s; pull back 2.5-3 s; arc and crest 3 s;
  dive 4-5 s; level out with the bus pass and glide to the entrance 4-5 s; lobby S-route to Screen 1 about 10-12 s;
  part B about 12 s (retime B too with the same rules; keep its route, door and exact final match and hold).
  Total about 35-45 s is fine.
- **Limits:** peak travel speed at street/lobby level about 2-2.5 source units/s (walking is about 1.5); peak turn
  rate about 20 deg/s; no sudden angular acceleration; every stage eases into the next without stopping.
- **Bus pass** stays a near miss at the bottom of the dive; retime the bus so it meets the slower camera.
- Report the peak speeds, turn rates and angular accelerations of v5A vs v6.

## Deliverables (in `fly/`)
1. `v6_flythrough_AB.mp4`.
2. `v6_camera_path.json`, `v6_bus_path.json`, `v6_apparent_scale.png/.json`.
3. `../NOTES-64.md`: timing per stage, switch frame and mismatch, the bounce cause you found and how you fixed it,
   speed and turn-rate tables, endpoint match results, render times.

## Rules
Write only inside `roxy3d/fly/` and `roxy3d/NOTES-64.md`. Never modify out10/, out10mist/, qa11/, the source .blend
files or any page. Preview renders only (Workbench/Eevee, 640x360, 30 fps, frame label, scale cards): no Cycles
production render, no cloud, no extra clips. STATUS line, stop.
