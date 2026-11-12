# Brief 95 - Lobby re-render list: stage 1, blockout and plan (11-12 Nov 2026)

Owner, 12 Nov 2026: "do all the blender stuff" (the list in `PAGE-DRAWN-ITEMS.md`, section "For the next Blender
re-render", plus the page-drawn items in its tables), done by the render agent (Claude Fable 5.2, high effort).
Art rules (AGENTS.md hard rule 6): layout changes start as a labelled blockout; styled drafts only after the owner
approves the layout; one still per draft; full renders only on the owner's word; never redo what he approved.

**This brief is stage 1 only: one blockout image and a written plan. No styled draft, no production render.**

## Read first
- `../AGENTS.md`, `PAGE-DRAWN-ITEMS.md` (the whole file: the tables are the "web graphics to Blender" items, the
  section "For the next Blender re-render" the owner's new points), `QUEUE-owner.md` items 73-74.
- How the live lobby pack was made and what its contract is: `out10/manifest.json` (occluders with `footprint`,
  `height_px`, `depth_slices` and `polygon_px`; `light_loop`, `lit_bg_dry`, `prop_loops`), the notes of the last
  full lobby render (find them: `NOTES-PASS10.md`, the Brief 57 production bundle under `cloud/`, PROGRESS.md around
  2-3 Nov), and the layer packs drawn over it: `out10m/` (marquee, Brief 83), `out10l/` (poster, Brief 86),
  `out10p/` (props, Brief 94, `NOTES-94.md`).
- The newest lobby scene: find it (`props/props_draft93.blend` holds draft 31 = the live look with the props; the
  marquee and poster scenes are `marquee/marquee_draft27.blend` and `leader/leader_draft29.blend`). Say which file is
  the true current source of the whole lobby and whether the live `out10/` base still matches it.
- Projection: floor (u, v, z_px) -> stage px `[900 + (u - v) * 60, 350 + (u + v) * 30 - z_px]`, depth
  `1000 + round((u + v) * 100)`, Blender world `[u, -v, z_px / 73.48469228349535]`.

## The owner's points
1. **Wet reflections everywhere it is wet.** The street has rich baked reflections; outside walls, roofs, ledges,
   sidewalks by the walls and the alley have almost none. Same wet, reflective look as the street.
2. **Remove the "ABSOLUTE CINEMA" lettering** on the brick wall right of the cinema (above the EXIT door and the
   DELIVERIES roller gate). It makes no sense there.
3. **The cargo bay (DELIVERIES gate) has a building in front of it.** Free its approach: move the gate, or the
   building, or open a lane, so a delivery could reach it. Layout change.
4. **Walls' top faces in the occluder pictures** (the wall pictures hold only the face; emotes behind a wall show
   over its top; the page covers the thin walls for now with `walltops`, not the snack bar's back wall).
5. **Claw machine behind the glass** (`NOTES-94.md`): its darkest parts too light under the page's two glass
   layers; its light pieces sit above the glass and cross a chatter standing at it.
6. **Lighter lobby** (from the other session's load study, PROGRESS "11 Nov 2026 (18:20)"): the marquee's light and
   shadow rendered into the wall/floor pictures they fall on, and the 58 wet-wall highlight loops as a few larger
   pictures, so the page blends far fewer pieces.
7. **Page-drawn items to make in Blender** (tables in `PAGE-DRAWN-ITEMS.md`): propose which ones are worth it now
   and which should stay page-drawn (live text, changing states).

## Deliverables (write only inside roxy3d/)
1. **One blockout image** `qa10/blockout95.png`, 1280x720, the fixed lobby camera, plain labelled boxes in the
   Workbench/clay look of `props/blockout.png`: the area right of the cinema with the DELIVERIES gate, the EXIT door,
   the building in front, the wall where the lettering is; show the proposed change for point 3 (and, if you see
   more than one honest option, at most two variants side by side in the same image, labelled A and B), and mark the
   lettering of point 2 as removed. Nothing else changes in the picture.
2. **`NOTES-95.md`**: what you found (current source scene, the gate/building geometry with (u, v) boxes, what is
   visible from the camera), the options for point 3 with their costs, and a **plan for stages 2-4** covering all
   seven points: what changes in the scene, which pictures of the live pack each change touches (base, lit, light
   loop, wet loops, occluders and slices, out10m/out10l/out10p), whether the page contract changes, what the
   owner would be shown as the one styled draft, an estimate of render time on the local RTX 3050 and on a RunPod
   RTX 4090 for the full pack, and the risks (the live loop is the exact complement of the base; packs over it).
   Group the work so the owner approves in few steps. End with a STATUS line.

## Rules
Write only inside `roxy3d/` (new files: the blockout image, its .blend and script under a new `rerender95/` folder,
`NOTES-95.md`). Never modify the live packs (`out10*`), `qa11/`, existing drafts, existing .blend files, any page,
or anything outside `roxy3d/`. Local RTX 3050, one Blender job at a time (check `tasklist` for `blender.exe` first);
no cloud. No computer use. No commit or push. Temporary images outside the project, deleted after. Then stop.
