# Brief 94: lobby props (claw machine, jukebox, TV), LAYER RENDER for the page (owner approved)

Render agent: Claude Fable 5.2 at high effort (owner, 10 Nov 2026; see `../AGENTS.md`, "Who renders the art").

Owner, 10-11 Nov 2026, on draft 31 (`qa10/draft31-props.png`): go to the layer render. The second opinion
(`critique-93.md`) agrees: "good enough ... as it is". **The look of draft 31 is approved exactly as rendered. Do not
change any material, light, shape, position or size; the three optional touches in `critique-93.md` are NOT taken.**
This brief turns the three props into a small layer pack over the live lobby packs, the way Brief 86 did for the
"Dear Leader" poster (`out10l/`). Nothing in `out10/`, `out10m/`, `out10l/` or `out10mist/` is re-rendered or touched.

**This job runs in two stages. Do stage A now and stop. Stage B starts only on a message from Claude, which will say
where the production captures run (the local RTX 3050 or a rented RunPod GPU; the owner is deciding).**

## Inputs (read-only - never modify)
- The approved scene and draft: `props/props_draft93.blend` (collection `PROPS`, each object tagged `cloud_group`
  claw / jukebox / tv), `props/build_draft93.py`, `NOTES-93.md`, `NOTES-91.md` (its "Plan for the later layer render"
  is the plan for this brief; read it first), `props/props_geom.json` (boxes, standing spots, the TV's screen quad).
- How the poster's layers were made, and the format to copy: `BRIEF-86-leader-layer-render.md`, `NOTES-86.md`, the
  Brief 86 scripts in `leader/`, the pack `out10l/` (`leader.json`: `render_layers` with `name`, `file`, `file_2x`,
  `x`, `y`, `w`, `h`, `z_index`, `blend`, `kind`, `under`, the occluder fields; `checksums.json`, `validation.json`).
- The live pack's contract: `out10/manifest.json` (occluders and their depth slices, the storefront glass pieces
  `glass_right` and `wet_glass_right_00` with their z-indexes), `out10/full.png` + `@2x`, and `out10m/`, `out10l/`
  as they are drawn over it by `../lobby-qa.html` (`mergeMarquee`, `mergeLeader`: read them to see what the page does
  with `under`, `z_index`, `blend` and the 1x/2x files; do not edit the page).
- Page projection: floor point (u, v, z) -> stage px `[900 + (u - v) * 60, 350 + (u + v) * 30 - z]`, depth
  `1000 + round((u + v) * 100)`, `world = [u, -v, z_px / 73.48469228349535]`.

## The pack (new folder `out10p/`, staged; the page work comes later and is not part of this brief)
Native 3840x2160 camera borders, production samples and the pack's 2.5 px filter, the same seed, denoiser, glare and
view transform as the live pack (NOTES-86 lists them); 1x derived from 2x in linear light, as in Brief 86.

1. **Bodies.** Per prop straight-alpha RGBA pieces, split by the pack's depth bands so walkers sort correctly around
   them (plan values: claw 2893-3043, jukebox 2508-2606, TV 1847-1951; measure, do not trust). The palm must end up
   in front of the jukebox and the popcorn machine and menu board over the TV's corner exactly as in draft 31.
2. **Always-on light and shadow pieces.** What each prop's own lamps and emitters add to its surroundings (additive,
   `plus-lighter`), and its contact shadow (`source-over`), at the receivers' depths, as in Brief 86: the carpet under
   and in front of each prop, the bar end, the standee foot and the pot for the jukebox, worktop and wall for the TV,
   the carpet and the wet pavement outside for the claw machine.
3. **The claw machine and the storefront glass.** As planned in NOTES-91, point 4: the body is captured without the
   glass, and the page's own glass pieces draw over it. Give its pieces z-indexes below every glass piece that covers
   them, clamp where needed, and state the exact pixels and values. Then compare the claw under the pack's glass
   sprites with draft 31; if it comes out dimmer or flatter, lift the body's values so the composite matches the
   approved draft as closely as the sprites allow, and report the remaining difference.
4. **Pieces the page will animate later** (separate additive on/off pieces; with all of them on, the composite must
   equal draft 31):
   - Claw header chase: the four bulb groups, each one piece (bulbs plus what they add nearby).
   - Jukebox: the pink tube with its floor pool as one piece; the teal tube as one piece.
   - TV: the body shows the dark glass WITHOUT the sample picture (the page draws the picture into the screen quad);
     one additive screen-glow piece the page can flicker. Put the screen quad (stage px, TL TR BR BL) in the manifest.
5. **Keep the element count low.** In OBS every blended page element costs frames, whatever its size (the street
   marquee showed that). Merge always-on pieces that share a depth and a blend mode into one image. Aim for about
   20 page elements or fewer for all three props together and state the final count per prop.
6. **Manifest** `out10p/props.json`, schema `dinkdonk.props.layers.v1`, the same top-level fields and `render_layers`
   fields as `out10l/leader.json`, plus per layer `prop` (claw / jukebox / tv) and, for the animated pieces,
   `anim` (`chase_0`..`chase_3`, `tube_pink`, `tube_teal`, `tv_glow`); plus per prop its box, its standing spots in
   (u, v) and its front depth from `props_geom.json`, and `tv.screen_quad`. `checksums.json` (SHA-256 of every pack
   file) and `validation.json` as in `out10l/`.

## Stage A (now): build the capture job, prove it, stop
- Build the job in `props/layer94/`: a working copy of the scene and one capture script that lists every capture
  (name, objects shown, holdouts, lamps and emitters on or off, border, passes) and renders any subset by name to
  EXR in a given output folder. **The job must be self-contained and portable:** relative paths only, every texture
  and font packed in the scene copy, no Windows-only calls, so that the same folder runs unchanged under Blender
  5.2.3 on Linux with `blender -b <scene> -P <script> -- <args>`. Sample count, device (OptiX with a CUDA and CPU
  fallback) and the capture subset are arguments.
- **Smoke run on the local GPU:** every capture once at low samples (about 16) and half resolution, to prove the
  list, the borders, the holdouts and the on/off pairs. Look at the results; fix what is wrong. This is the only
  rendering in stage A.
- Write `props/layer94/CAPTURES.md`: the capture list with borders, what each is for, the measured smoke time per
  capture and the estimated production time on the RTX 3050; the list of files a cloud machine would need (with
  sizes), the exact command line, and the list of files it must send back.
- **Then stop** with a STATUS line saying stage A is complete. Do not render production captures yet.

## Stage B (only on Claude's message)
- Production captures (where the message says; if they ran elsewhere, the EXRs will be in the folder the message
  names: verify the list, sizes and that each is the capture it claims to be before using them).
- Display preparation, slicing by depth, the glass cut, merging, 1x from 2x, the pack in `out10p/`, manifest,
  checksums, validation.
- **Acceptance:** rebuild the page's composite in a script (the live `out10/full` frame with the `out10m` and
  `out10l` layers and then `out10p`'s layers in z order with their blend modes, all animated pieces on, the sample
  BREAKING NEWS picture from `props/tv_sample91.bgra` drawn into the screen quad) and compare it with draft 31's full
  frame at stream size: report the difference inside each prop's region and in the rest of the frame.
- ONE check image `qa10/props-layer-check.png` (1920x1080: that composite, no insets, no labels).
- `NOTES-94.md`: the captures and times, every pack file with size and what it is, the element count per prop, the
  glass cut with numbers, the acceptance differences, what the page must do to use the pack (loading order against
  `out10m`/`out10l`, the animated pieces and their on/off meaning, the TV quad, anything about the claw and the
  glass), and what was not checked.

## Rules
Write only inside `roxy3d/props/layer94/`, `roxy3d/out10p/` (stage B), `roxy3d/qa10/props-layer-check.png` (stage B)
and `roxy3d/NOTES-94.md`. Never modify `props/props_draft93.blend`, the earlier Brief 89-93 files, the drafts, out10/,
out10m/, out10l/, out10mist/, qa11/, marquee/, leader/, style/, the source .blend files, or any page. No other
images in the project (tuning crops go in a temp folder outside the project and are deleted). No cloud from your
side: you never rent, start or contact a cloud machine; if the captures run in the cloud, Claude does that. Local
RTX 3050, one Blender job at a time (check with `tasklist` that no `blender.exe` is running before each render and
wait if one is). No computer use. Do not commit or push. End each stage with a STATUS line and stop.
