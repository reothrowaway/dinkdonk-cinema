# Brief 104d - "Gamer lobby": draft 37 (ONE styled draft still)

17 Nov 2026. Render agent: Claude Fable 5.2, high effort. Builds on draft 36 (`lobby104/lobby_draft36.blend`,
`qa10/draft36-gamer-lobby.png`, NOTES-104 "Stage 2b"). Owner on draft 36: **"37 it is"** - magenta/cyan pools and
all six points of `reviews/review-104-draft36.md`. (Queue 90: this is a second lobby option beside the normal one;
the fountain and all Brief 104 content exist only in this pack.)

## Do
Make `lobby104/lobby_draft37.blend` from `lobby_draft36.blend` (keep 36 unchanged) and render ONE still:
1. **Colour, the "gamer" part.** Tint the interior key light: register pools and sconce cones toward magenta / cyan
   (a deliberate mix, e.g. magenta on the lobby side, cyan in the corridor; your call, keep it readable), pushed
   clearly further than trims. Pink and cyan neon washes about 1.5x stronger so the walls carry coloured gradients.
   Street, sign, marquee and rain unchanged.
2. **Snack bar pools:** re-aim the three register pools so each straddles the counter's front edge (half on the
   counter top, half on the floor) and reads as coming from the menu/pendant line; centres about 150-170, not white.
3. **Walker floor:** walkable floor bottoms out at about 20-22 luma (0-255), mainly the strip (720,530)-(800,600) and
   the corridor floor (coords in the 1280x720 still). Walls stay as dark as draft 36.
4. **Poster frames:** the page pastes real film posters at full brightness into the bulb frames beside the screen
   doors (about (815-850,300-345), (950-985,345-395), (1070-1105,395-450)). Add a small picture-light spill on the wall
   and floor in front of each frame so a bright poster is explained. Do the same for any other page-drawn bright item
   you find in `out10s/manifest.json` / `manifest.brief96.page_must` that now sits in a dark area; list them.
5. **Fountain:** halve the blue foot light or move it inside the basin so only the water glows; rock one grey step
   lighter; put the grazing spot's highlight on the falls (a 2-3 px white streak at 1x). Size unchanged (0.40 m bowl).
6. **Soda / menu box** near-white at about (800,420): about -15% emission.
- Keep: restroom, street, rain, street lights, the purple sidewalk glow (B95), billboards, DINK DONK sign, layout.

## Deliverable
ONE image `qa10/draft37-gamer-lobby.png`, 1280x720, fixed lobby camera, weather frame 0, same render settings as
drafts 35-36. No insets, crops, close-ups, clips or comparisons. Report: light-linking count (no warning line); restroom
blurred diff vs draft 34; street/roofs within noise; luma of pool centres, floor median and darkest walkable spot,
walls, snack bar; pool-to-floor ratio; the colours used. Append "Stage 2c (draft 37)" to `NOTES-104.md`. STATUS line.

## Rules
Write only inside `roxy3d/` (`lobby104/`, `qa10/draft37-gamer-lobby.png`, `NOTES-104.md`). Never modify `out10*`,
`qa11/`, pages, existing drafts or existing .blend files (35 and 36 included). Local RTX 3050, one Blender job at a
time: check `tasklist` for `blender.exe` and Godot before each render. Blender in background mode (`-b`) only; never a
visible Blender or Godot window. No cloud, no production render, no commit or push. Temporary images outside the
project, deleted after. Then stop.
