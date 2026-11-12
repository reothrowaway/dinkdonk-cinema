# Brief 96 - Lobby: claw machine replaces the arcade cabinet; the leftover page items as Blender layers (12 Nov 2026)

Owner, 12 Nov 2026 (with a screenshot of the ORBIT arcade cabinet next to the bench): "replace the arcade machine
with the claw machine". And, on the page-drawn items Brief 95 left for later: "yes render them".

Render agent: Claude Fable 5.2, high effort (Blender design work only; checks and page work are done by Opus 5.5).
Art rules (AGENTS.md hard rule 6): layout change -> labelled blockout first; then one styled draft; full renders on
the owner's word. **This brief is stage 1: one blockout image and a plan. Then stop.**

## Read first
`../AGENTS.md`, `NOTES-95.md` (the whole Brief 95 job: current scene `rerender95/lobby_draft32.blend` / its frozen
production scene, the bundle and `pack95.py`; the live base is now `out10r/`), `NOTES-94.md` and `out10p/props.json`
(the claw machine, jukebox and TV layer pack; the claw now stands behind the storefront glass at u 10.8-11.55,
v 8.13-8.88 with its player spot (11.76, 8.5)), `props/props_geom.json`, `PAGE-DRAWN-ITEMS.md` and NOTES-95 point 7
("Later, as small layer jobs ...").

## 1. Arcade -> claw machine
- Remove the ORBIT arcade cabinet (occluder `arcade`, its prop loops attract/play/hiscore; the page's ARCADE player
  spot (12.95, 7.85)). Put the "WIN A BUDDY" claw machine where the cabinet stands, facing the same way the
  cabinet's screen faces, so a player stands where the arcade player stood. The claw machine's approved look
  (draft 31) stays; only its place changes. Its old spot behind the storefront glass becomes plain floor again.
- This also ends the claw/glass problem of Brief 94 (it is no longer behind the glass): say so.
- Check the camera view: what the machine covers (bench, cat spot (12.55, 6.85), gnome spots, walker routes) and
  what covers it.
- Decide and say: the claw machine in the base render (like the arcade was) or still as a layer pack over it. The
  page animates its header chase lights; whichever way, those must stay separate on/off pieces.

## 2. The leftover page items (NOTES-95 point 7 "later")
Wet-floor sign sprite; Buddy plush and the canvasser's clipboard items; apartment windows lit/dark and neon
"tube off" states; shop door light; dog in the window and the snarkers; the police sedan's light bar; steam loops,
puddle splash sheets, inside-out umbrellas. For each: what it becomes (sprite, on/off layer, loop sheet), how big,
what the page then does differently. Group them into as few render items as possible.

## Deliverables (write only inside roxy3d/)
1. One blockout image `qa10/blockout96.png` (1280x720, fixed lobby camera, labelled boxes in the style of
   `qa10/blockout95.png`): the cabinet gone, the claw machine in its place, the freed spot behind the glass, the
   player spot. Nothing else changes in it.
2. `NOTES-96.md`: findings, and a plan for stage 2 (one styled draft with the claw machine in its new place) and
   stage 3 (a RunPod bundle for the multi-pod helper `cloud/cloud-render.sh multi` like Brief 95's, covering the
   claw move and all leftover items, with the item count and a GPU-time estimate), and what the page must do.
   End with a STATUS line.

## Rules
Write only inside `roxy3d/` (new folder `rerender96/`, the blockout, `NOTES-96.md`). Never modify live packs
(`out10*`), `qa11/`, existing drafts or .blend files, pages, or anything outside `roxy3d/`. Local RTX 3050, one
Blender job at a time (check `tasklist` for `blender.exe` first: another agent may be using Blender for a pack
step; wait for it). No cloud, no computer use, no commit. Then stop.
