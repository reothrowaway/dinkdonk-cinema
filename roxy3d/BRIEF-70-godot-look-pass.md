# Brief 70: Godot look pass + static rain-like things at the bus stop

Owner on the Godot spike (Brief 69, `godot-spike/`, NOTES-69.md), 7 Nov 2026: "I like the Godot thing, we should
keep improving it." Godot is now the main path for the 3D motion work. Keep working in `godot-spike/` (copy files
before big changes so the spike outputs stay comparable).

## 1. Static things at the bus stop (owner's report)
"From 6 to 7 seconds on the video, these static things right in front of the bus stop look like rain; could be lights,
could be something else, but they're still there." In `godot-spike/frames30/00180.png`-`00210.png` there is a cluster
of small bright streaks just right of the bus shelter, by the lamp post, that stay fixed in the world while the
camera moves. Likely static drip / splash / droplet geometry from the Blender scene (edge drips, impact crowns,
glass droplets, leftover static rain) exported into the glTF. Find exactly what they are (object names from the
export), then either animate them properly or remove them, so the only rain is the moving particle rain plus ground
splashes/ripples that animate. Check the whole 10 s piece for any other static rain-like objects. Say whether the same
objects exist in the Cycles production scene (they may also explain the owner's earlier "rain glitching" complaint
in the Cycles render).

## 2. Look pass (closer to the Cycles night look)
Compare against `out10/full.png` and the Cycles frames used in `godot-spike/compare_frames.png`.
- **Lighting:** warmer, softer, less flat and less blue. Match color temperature and exposure; use Godot's GI
  (SDFGI or VoxelGI or baked lightmaps, whichever looks best and stays fast) so light bounces and pools the way it
  does in Cycles.
- **Wet street:** the biggest loss. Strong wet reflections of neon, lamps and windows; real puddles (bake a puddle
  mask from the Blender scene if useful), animated rain ripples on the ground. Use SSR and reflection probes; keep it
  stable in motion (no flicker).
- **Glass:** remove the bright hotspots; glass should read like the Cycles storefront (dark, reflective, see-through).
- **Motion blur:** stronger and smoother, closer to the Cycles 1.25-frame shutter (the owner likes strong, explicit
  motion blur). Use more sub-frames (8-10 per frame). Make capture faster: accumulate sub-frames inside Godot and
  write only the final 30 fps frames instead of every sub-frame PNG, if possible.
- Keep what already works: geometry, camera alignment, signage, the bus route, the falling rain.

## Deliver (in `godot-spike/`)
- The same 10 s piece re-rendered: `flythrough_piece_v2_1080p30.mp4`.
- `compare_still_v2.png` (Cycles live still | Godot v2) and `compare_frames_v2.png` (the same 3 moments, Cycles |
  Godot v2), plus a before/after crop of the bus-stop area for item 1.
- Timing per frame and the projected time for the full 50 s.
- `../NOTES-70.md`: what the static things were and the fix, each look change, timings, what is still worse than
  Cycles. STATUS line, stop.

## Rules
Write only inside `roxy3d/godot-spike/` and `roxy3d/NOTES-70.md`. Never modify out10/, out10mist/, qa11/, fly/, the
source .blend files, any page, or the installs. **Do not use computer use or open other apps** (no browser, no Chrome
history, no media players); check videos by decoding frames. No downloads. No cloud (a Cycles render is running
remotely; ignore it).
