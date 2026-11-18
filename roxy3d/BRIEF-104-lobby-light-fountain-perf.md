# Brief 104 - Lobby: lighting pass + bonsai fountain + lighter pack, stage 1 (blockout and plan)

17 Nov 2026. Owner (QUEUE-owner.md items 78, 83, 84): ONE lobby render that combines
(a) the **lighting pass** of item 78, (b) the **bonsai fountain** of Brief 103 (draft 1 approved) placed **by the
snack bar** (item 83), and (c) the **art-side perf saving** of NOTES-95 point 6.
Render agent: Claude Fable 5.2, high effort. Art rules (AGENTS.md hard rule 6): layout changes start as a labelled
blockout; styled drafts only after the owner approves the layout; one still per draft; full renders only on the
owner's word; never redo what he approved.

**This brief is stage 1 only: one blockout image and a written plan. No styled draft, no production render.**

## Read first
- `../AGENTS.md`, `QUEUE-owner.md` items 78, 83, 84; `NOTES-95.md` ("Other findings", point 6, and stage 3 "What this
  pack is"), `NOTES-96.md` (the current production scene and bundle), `NOTES-103.md` + `BRIEF-103-*.md` (the fountain).
- PROGRESS.md around "13 Nov" for the perf numbers: without the 54 wet loops + 95 marquee shadow pieces + 87 marquee
  light pieces the lobby needs ~19% less CPU at 30 fps. Point 6 = render the marquee's light and shadow into the
  wall/floor pictures they fall on, and drop or flatten the wet-wall loops (most never pass 2-8/255).
- Live look: `out10s/` (base, Brief 96) with `out10ps/`, `out10m/` (marquee), `out10l/` (poster), `out10p/` (props).
  Newest scene: `rerender96/lobby_draft34.blend` (prod copy `rerender96/pipe/scene.blend` via `make_prod_scene96.py`).
  Open existing .blend files read-only; save new ones under `lobby104/`.
- Projection: floor (u, v, z_px) -> stage px `[900 + (u - v) * 60, 350 + (u + v) * 30 - z_px]`, depth
  `1000 + round((u + v) * 100)`, Blender world `[u, -v, z_px / 73.48469228349535]`.
- Image-search refs (owner's rule: search his exact wording first): `lobby104/ref-google-lighting.jpg`
  ("cinema lobby lighting": dark ceilings and floors, pools from downlights, the concession counter as the brightest
  spot, warm bulb frames round posters) and `lobby104/ref-google-bonsai-fountain.jpg` ("bonsai fountain": tabletop
  rockery fountains, and 24-inch cast-stone garden versions of the same design that stand on the floor).

## What the owner wants
1. **Lighting (item 78):** zoomed in, the interior looks samey and washed because it is lit evenly and brightly. The
   restroom looks better: more darkness and a few light spots. Darker overall, light from real sources (pools under
   lamps, sign and neon glow, the snack bar), more contrast. The street, rain and reflections stay as they are.
2. **Fountain (item 83):** the approved Brief 103 fountain (`fountain/fountain103.blend`, collection `FOUNTAIN`, root
   empty `FOUNTAIN_root`; the look is approved, do not redesign it) goes by the snack bar.
3. **Lighter pack (point 6):** fewer blended pieces on the page, same look.

## Deliverables (write only inside roxy3d/)
1. **One blockout image** `qa10/blockout104.png`, 1280x720, the fixed lobby camera, plain labelled boxes in the
   Workbench/clay look of `props/blockout.png` / `qa10/blockout96.png`, over the lobby's existing geometry:
   - The fountain by the snack bar as a box (bowl + tree height), in **two variants side by side, labelled A and B**:
     **A** the tabletop size (28 cm bowl, as built) on the snack bar counter or a ledge next to it; **B** scaled up to
     the floor-standing cast-stone size (about 60 cm bowl on a low plinth, about 1.1-1.3 m to the tree top) on the
     floor beside the snack bar where it blocks no walker route, queue spot or staff spot in `out10s/manifest.json`.
     Give each its stage-pixel size in the label (at 1x A is likely only a handful of pixels: say so).
   - Small labelled markers (dots or cones, no styling) for the **planned light sources** of the lighting pass:
     each downlight pool, the snack bar, the signs and neon that will carry the light. Keep it readable.
   - Nothing else changes in the picture.
2. **`NOTES-104.md`**: where the snack bar is ((u, v) box), the free floor around it (routes and spots), the two
   fountain options with pros and cons (visibility from the camera, occlusion, walkers), and a **plan for stages 2-3**:
   - stage 2 = ONE styled draft still (1280x720, fixed camera, final quality, one weather frame) with the new lighting
     and the fountain in the chosen place;
   - stage 3 = the full pack: which pictures change (with the lighting change it is likely all of base, lit, light
     loop, occluders, slices, wet loops, mist light map; say what can be carried over byte-identical: vehicles,
     umbrellas, cat, janitor, items, doors?), how point 6 is done (marquee light/shadow and, if sensible, the poster
     and props' light/shadow folded into the scene pictures; which wet loops are dropped or merged; how many blended
     pieces the page loses), whether the page contract changes and what the page must do, and whether `out10m`,
     `out10l`, `out10p`, `out10ps` must be solved again under the new light (they hold light that matches the old
     look);
   - estimates: render items, GPU-hours on a RunPod RTX 4090 at several workers per GPU, a rough dollar range, and
     the local RTX 3050 time for the draft;
   - risks (the light loop is the exact complement of the base; the Brief 96 light-linking limit of 64 combinations;
     the fountain's water/glass under 4K denoising; restroom look must not change).
   End with a STATUS line.

## Rules
Write only inside `roxy3d/` (new files: the blockout image, its .blend and script under `lobby104/`, `NOTES-104.md`).
Never modify the live packs (`out10*`), `qa11/`, existing drafts, existing .blend files, any page, or anything
outside `roxy3d/`. Local RTX 3050, one Blender job at a time: check `tasklist` for `blender.exe` and Godot first.
Always run Blender in background mode (`-b`); never open a visible Blender or Godot window. No cloud. No computer
use. No commit or push. Temporary images outside the project, deleted after. Then stop.
