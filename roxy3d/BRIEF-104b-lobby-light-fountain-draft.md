# Brief 104b - Lobby: lighting pass + bonsai fountain, stage 2 (ONE styled draft still)

17 Nov 2026. Owner on blockout 104 (`qa10/blockout104.png`): **"A, on the counter"** - the approved Brief 103
fountain at its built size (scale 1) on the candy case at the snack bar's east end, (11.15, 4.30), as drawn in the
blockout. Render agent: Claude Fable 5.2, high effort.

## Do
Stage 2 exactly as planned in `NOTES-104.md`, "Stage 2 - ONE styled draft (local)", variant A only:
- `lobby104/build_draft35.py` makes `lobby104/lobby_draft35.blend` from `rerender96/lobby_draft34.blend` (opened
  read-only) with the lighting pass of NOTES-104 ("Planned light sources") and the fountain appended from
  `fountain/fountain103.blend` (read-only), look unchanged, front toward the camera.
- Lighting goal (owner, queue 78): darker overall, light from real sources (pools under lamps, sign and neon glow,
  the snack bar as the brightest spot), more contrast; the restroom look is the model and must not change; street,
  rain and street lights stay as they are.
- If the fountain reads as a meaningless speck at this size, you may use the 0.40 m bowl noted in NOTES-104 and say
  so; nothing else about it changes.

## Deliverable
ONE image `qa10/draft35-light-fountain.png`, 1280x720, fixed lobby camera, weather frame 0, the settings of drafts
27-34 as listed in NOTES-104. No insets, close-ups, crops, clips or comparison images. Run the checks NOTES-104 lists
(light-linking count at most 60 with no warning line; restroom region unchanged vs `qa10/draft34-check.png`; street
and roofs within noise except where wet ground mirrors the lobby) and report the numbers. Append a "Stage 2" section
to `NOTES-104.md` with what changed, light values, render time and the check numbers. End with a STATUS line.

## Rules
Write only inside `roxy3d/` (`lobby104/`, `qa10/draft35-light-fountain.png`, `NOTES-104.md`). Never modify `out10*`,
`qa11/`, pages, existing drafts or existing .blend files. Local RTX 3050, one Blender job at a time: check `tasklist`
for `blender.exe` and Godot before each render. Blender in background mode (`-b`) only; never a visible Blender or
Godot window. No cloud, no production render, no commit or push. Temporary images outside the project, deleted
after. Then stop.
