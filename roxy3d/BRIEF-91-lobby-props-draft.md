# Brief 91: lobby props (claw machine, jukebox, TV), styled DRAFT (one still)

Render agent: Claude Fable 5.2 at high effort (owner, 10 Nov 2026; see `../AGENTS.md`, "Who renders the art").

Owner, 10 Nov 2026, on the Brief 89 blockout (`props/blockout.png`): "All three as shown." He was told the
compromises (the claw machine stands behind the tinted storefront glass and hides part of one talk spot; the jukebox is
small and covers the end of the back bar) and chose all three at those places. **Positions and sizes are approved: do
not move or resize anything.** Now one styled draft at final quality. Later (separate brief, only when the owner says
so) the three become small layers over the live pack, like the poster pack `out10l/`. Nothing in `out10/`, `out10m/`,
`out10l/` or `out10mist/` is re-rendered.

## Inputs (read-only - never modify)
- Approved placement: `props/props_blockout.blend`, `props/build_props.py`, `props/props_geom.json`, `NOTES-89.md`.
  Claw machine: u 10.80..11.55, v 8.13..8.88, 1.25 m high, play side facing east (toward the arcade cabinet).
  Jukebox: u 11.68..12.18, v 3.40..3.88, 0.93 m high, front facing the open floor. TV: u 5.34..5.96, v 3.13..3.55,
  0.50..0.97 m above the floor on a small shelf on the snack bar's back wall, screen 0.50 x 0.36 m facing the lobby.
- Base scene: a copy of `leader/leader_draft29.blend` (the frozen out10 lobby with the street marquee and the "Dear
  Leader" poster, so the frame matches the lobby as it is being built). If it cannot be used, fall back to
  `marquee/marquee_draft27.blend` and say so. Production camera, lights, wet materials and render settings as in
  NOTES-82 / NOTES-85.
- Look references: the live frame `out10/full.png`; the lobby's own arcade cabinet (its materials, screen glow and
  marquee lettering are the model for the two new machines); the lobby's neon colours (pink, teal, amber); the DGG
  mascot "Buddy" as he is drawn in `ref/eatfresh-emote/` (the round blue character); how draft 29 was built and
  composited with its weather frame and inset: `leader/build_draft86.py`, `NOTES-85.md`.

Work in `props/`.

## Look (a late-90s cinema lobby; the three must look like they were always part of it)
1. **Claw machine, "WIN A BUDDY".** A 90s arcade claw cabinet: a dark laminate base with a control panel (joystick,
   one button) on the play side, a glass box on top with a metal frame, a lit header strip reading `WIN A BUDDY` in
   chunky arcade lettering, and inside the glass a heap of small round blue plush Buddies (simple spheres with a face
   decal are enough at this size) with a chrome claw hanging over them. A soft cool light inside the box so the
   plushies read; a few small amber chase bulbs on the header, all on in the draft. It is seen through the lobby's
   tinted storefront glass, so make sure the box and its header still read from the camera.
2. **Jukebox, "JAMS".** A floor-standing jukebox with a rounded top: dark body, a glowing arch around the front in the
   lobby's pink and teal, a small lit title window reading `JAMS`, a speaker grille below. Its glow should spill a
   little on the floor in front, where chatters will dance later. No blown-out highlights.
3. **Breaking-news TV.** A small beige or black CRT television on a wall shelf, with a slightly curved dark screen
   that has a faint blue glow. The page will draw the picture later; in the draft only, put a sample picture on the
   screen as a 2D overlay onto the screen quad from `props_geom.json` (the way the marquee's sample text was done): a
   red lower-third reading `BREAKING NEWS` with a tiny gold bell, over dark blue.
- Everything else in the frame stays as it is. The new lights must stay small: they may light the floor and wall
  right next to each prop, not the room.

## Deliverables
1. `qa10/draft30-props.png`: ONE still, 1280x720, the fixed production camera, final quality (production samples, wet
   materials, reflections, glare as in the live pack) with one composited weather frame, same as the earlier lobby
   drafts. Because each prop is small in this frame, put up to three magnified insets (one per prop, about 3x,
   rendered natively at that scale with the same final-quality settings, not upscaled) in empty corners of the same
   image, each with a thin line to its spot. No labels.
2. `props/props_draft.blend` and the script(s), with the three props and their lights in collection `PROPS`, ready
   for the later layer render.
3. `NOTES-91.md`: what you did, material and light values, render time, what each prop looks like through the glass
   or next to its neighbours, and a short plan with a time estimate for the later layer render (bodies, lights,
   shadows, how the claw machine is cut so the storefront glass draws over it, and which parts could later animate:
   the header chase, the jukebox arch, the TV picture).

## Rules
Write only inside `roxy3d/props/`, `roxy3d/qa10/draft30-props.png` and `roxy3d/NOTES-91.md`. Never modify out10/,
out10m/, out10l/, out10mist/, qa11/, marquee/, leader/, the source .blend files, or any page. No close-ups, clips,
comparisons or extra images beyond the insets inside the one still. No cloud; the local RTX 3050 only, one Blender job
at a time (check with `tasklist` that no `blender.exe` is running before each render and wait if one is). No computer
use. Do not commit or push. End with a STATUS line and stop.
