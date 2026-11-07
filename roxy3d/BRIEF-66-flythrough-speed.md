# Brief 66: make the fly-through cheaper to render - Cycles profiling + Eevee test

The first fly-through render (Brief 65, `fly/prod/`, NOTES-65.md) is done: 1,625 frames at 1080p30, ~5.5 h on one
RTX 4090, $4.95. Lobby frames took 13-17 s each, auditorium frames 4-7 s. The owner: "this one will not be the last
for sure" and wants both speed-ups explored. Local work on this PC only (RTX 3050): no cloud, no full render.

Use the same 5 look-check frames as Brief 65 (A0001, A0350, A0650, A0850, B0525) plus one heavy lobby-interior frame
(around A0800) as the test set. Current renders of these exist in `fly/prod/` (lookcheck_*) and the pod output
`fly/prod/cloud-result/flythrough65/frames/` (use those as the reference look). Work on copies in `fly/speed/`; never
change `fly/prod/` or the result.

## Part 1 - Cycles profiling
1. Measure where the time goes on the test frames: toggle one feature at a time and time each (volume fog, the
   number of light bounces per type, the light tree / many-light sampling, the small emitters (bulbs, neon, windows),
   glass/transmission, the falling-rain particles and splash crowns, motion blur shutter and steps, samples /
   adaptive threshold / denoiser, persistent data, tile size). Report a table: feature -> seconds saved -> visible
   change.
2. Build one **optimized Cycles setup** that keeps the look (night mood, neon glow, wet reflections, falling rain
   with streaks, strong motion blur, frame 1 still matching the live lobby within the same tolerance as Brief 65).
   Typical candidates: fog only where it shows, fewer bounces, merged or cheaper small lights, fewer samples with
   stronger denoising, rain cost trimmed. Render the test set with it; report time per frame and the difference
   to the reference frames (mean RGB, and look at them).
3. Estimate the full 1,625-frame time on a 4090 with the optimized setup (use the 3050 -> 4090 ratio from NOTES-65).

## Part 2 - Eevee test
1. Make an Eevee (Blender 5.2) version of the same production scenes with the closest look you can get: night
   lighting, bloom/glare like the Cycles glare, screen-space reflections or raytracing for the wet street and glass,
   volumetrics for the fog, motion blur as strong as the Cycles one, the falling rain.
2. Render the same test set; report time per frame and the difference to the Cycles reference, and say honestly
   what Eevee loses (reflections, glass, fog, neon glow, shadows).
3. Because Eevee frames won't match the live Cycles stills exactly, propose how to hide that at both ends (for
   example a short crossfade from the live lobby still / into the live auditorium still, and how many frames).
   Estimate the full 1,625-frame time locally on the 3050 and on a 4090.

## Deliverables (in `fly/speed/`)
- For each test frame one comparison image `compare_<frame>.png`: reference Cycles | optimized Cycles | Eevee,
  side by side at 640x360 each, labelled with the render time per frame.
- `../NOTES-66.md`: the profiling table, the optimized Cycles settings, the Eevee settings, timings and full-render
  estimates for both, look differences, the crossfade proposal, and your recommendation. STATUS line, stop.

## Rules
Write only inside `roxy3d/fly/speed/` and `roxy3d/NOTES-66.md`. Never modify `fly/prod/`, the cloud result,
out10/, out10mist/, qa11/, the source .blend files or any page. No cloud, no pod, no full-length render; keep the
total local GPU time reasonable (under about 2 hours) and say what you skipped if needed.
