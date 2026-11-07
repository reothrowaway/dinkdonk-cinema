# Brief 63: fly-through v5 - pull back and swoop (three variants)

Owner on v4 (6 Nov 2026): "Nah man, that is actually even worse." All top-down/drop openings are out. The owner
drew the move they want: `fly/owner-sketch-swoop.png`. Reading of the sketch: the camera **lifts up and out to the
left first**, then comes down in **one big dive** to street level, **bottoming out right next to the bus**, glides
level along the street **into the entrance**, then follows an **S-curve through the lobby** to the screen door
(arrow at the back right).

Why v1-v4 warped: the framing was held still while the lens changed (a dolly zoom). New rule: **never lock the
framing while the lens changes.** Change the projection only while the scene is small on screen, then change the lens
only during real, visible camera travel, where it reads as a normal camera move.

## Shared opening (all variants)
- **A1-15:** the exact live isometric hold, unchanged.
- **Pull back:** a short orthographic zoom-out (ortho scale only) so the lobby shrinks and more of the rainy night
  block shows. While the scene is small, switch to a long-lens perspective camera that matches the framing; report
  the pixel mismatch at the switch (it should be tiny because the scene is small). Optionally crossfade over a few
  frames if that hides a residual difference.
- **Swoop:** rise in an arc out to the left, then dive along the sketched curve down to street level, with the lens
  shortening gradually during the flight (never while the framing is held). Bottom out at about the 1.15-unit eye
  height used since v2.
- Check what the pull back reveals: if the modeled block ends or the sky sphere/fog shows edges, keep the pull back
  smaller or hide the edge with fog/darkness, and say what you did.

## Drone feel (all variants)
Bank (roll) a few degrees into turns, small overshoot-and-settle at direction changes, never perfectly linear speed.
Preview motion blur (temporal samples as in v2) on the fast parts of the dive. A few raindrops on the lens during
the dive (a simple 2D overlay in the preview is fine; say how you did it).

## Variants
- **V5A, swoop + bus pass:** the dive bottoms out right as the d.gg bus passes (near miss at the lowest point, as in
  the sketch), then the camera levels out and glides along the street into the entrance, then the existing lobby
  route (S-curve to Screen 1).
- **V5B, follow the bus:** the dive ends behind the bus and chases it along the street; the bus pulls up at the bus
  shelter (where the live bus stops); the camera peels off toward the entrance and continues the lobby route.
- **V5C, follow a chatter:** the V5A opening; at the entrance the camera picks up one scale card (a stand-in for a
  live chatter) walking in at walking speed and tails it through the doors, across the lobby and down the hallway on
  the S-curve, then passes it and enters Screen 1. Export that card's path per frame (the page will later put a
  real chatter there).
Part A may get longer; aim for about 14-18 s total for part A. Part B unchanged (reuse v3/v4's B frames).

## Deliverables (in `fly/`)
1. `v5A_flythrough_AB.mp4`, `v5B_flythrough_AB.mp4`, `v5C_flythrough_AB.mp4`.
2. `v5X_camera_path.json` per variant (same format), `v5X_bus_path.json`, and `v5C_chatter_path.json`.
3. `../NOTES-63.md`: per variant the timing per stage, the switch frame and mismatch, what the pull back reveals and
   how edges were handled, bus/chatter closest distances, endpoint match results, render times.

## Rules
Write only inside `roxy3d/fly/` and `roxy3d/NOTES-63.md`. Never modify out10/, out10mist/, qa11/, the source .blend
files or any page. Preview renders only (Workbench/Eevee, 640x360, 30 fps, frame label, scale cards): no Cycles
production render, no cloud, no extra clips. STATUS line, stop.
