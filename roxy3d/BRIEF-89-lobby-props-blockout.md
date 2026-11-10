# Brief 89: lobby props (claw machine, jukebox, TV), placement BLOCKOUT (one still)

Render agent: Claude Fable 5.2 at high effort (owner, 10 Nov 2026; see `../AGENTS.md`, "Who renders the art").

Owner, 9-10 Nov 2026 (queue item 64, `memes/LIFE-IDEAS.md`: L24, L23, L18): the lobby should get three new props that
chatters and the page can play with. They need rendered art, so this starts as a placement blockout. Later each
becomes a small layer over the live pack, the way the "Dear Leader" poster did (`out10l/`, Briefs 84-86, NOTES-84/86).
Nothing in `out10/`, `out10m/`, `out10l/` or `out10mist/` is re-rendered.

The three props:
1. **Claw machine, "WIN A BUDDY"** (L24): a 90s arcade claw cabinet full of small blue Buddy plushies (the DGG mascot),
   with a lit marquee strip. Later the page lets chatters play it, so it needs a clear standing spot in front.
2. **Jukebox, "JAMS"** (L23): a floor-standing jukebox (rounded top, lit front). Later chatters wearing dance emotes
   gather next to it, so it needs free floor for three or four figures around it.
3. **Breaking-news TV** (L18): a small CRT television on a wall bracket (or on a shelf), screen facing the camera.
   Later the page draws a red BREAKING NEWS chyron on the screen, so report the screen's quad.

## Inputs (read-only - never modify)
- Base scene: a copy of `marquee/marquee_draft27.blend` (the frozen out10 lobby plus the approved street marquee).
  If it cannot be used, `cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend`, and say so.
- Live frame and contract: `out10/full.png`, `out10/full@2x.png`, `out10/manifest.json` (occluders with their depth
  slices, `prop_loops`, `staff_positions`, `customer_positions`).
- Page projection (lobby stage 1920x1080): floor point (u, v, z) -> stage px `P = [900 + (u - v) * 60, 350 + (u + v) * 30 - z]`;
  `world = [u, -v, z_px / 73.48469228349535]` (1 tile = 1 m), as verified in NOTES-79 and NOTES-84.
- How the last placement blockout was done: `BRIEF-84-leader-poster-blockout.md`, `NOTES-84.md`, `leader/build_leader.py`,
  `leader/annotate_blockout.ps1`.

Work in a new folder `props/`.

## What limits the placement (measure in the scene; these are the page's numbers)
- **The marquee hides floor.** From the fixed camera the street marquee's roof covers the lobby floor between the box
  office and the entrance; roughly, floor points whose stage position lies left of the line from (895, 617) to
  (1063, 747) and under the roof are not seen. Nothing may be placed where the camera cannot see it.
- **Where people walk and stand** (keep clear, with 0.4 m to spare): the entrance path u 9.1..9.9 from v 9.45 to 8.6;
  the rope queue lane u 5.2..9.25, v 7.15..7.65 and its second row at v 8.25; the ticket windows at (4.85, 7.4) and
  (4.85, 6.0); the three snack registers at (6.6, 5.05), (8.2, 5.05), (9.8, 5.05) and the lines in front of them down
  to v about 6.3; the usher's gate at (3.7, 3.7) with its waiting spots (4.9, 4.6), (4.55, 4.95), (5.6, 5.0),
  (5.9, 5.45); the talk spots (radius 0.5) at (10.8, 7.2), (11.0, 5.35) and (5.9, 8.35); the arcade player's spot
  (12.95, 7.85); the route hub (8.6, 6.6); the cat's and the gnome's spots near (12.2, 6.1) and (12.6, 4.35).
- **What is already there:** the arcade cabinet (stage rect 1120, 844, 101 x 141), the bench (1180, 830, 124 x 94),
  the palm (1386, 698), the standees, the snack bar and its back wall with the three menu boards, the corridor's
  bench, fountain and bin. Do not move or cover them.
- The claw machine belongs with the arcade cabinet (an arcade corner). The jukebox wants a wall behind it and open
  floor in front. The TV wants a wall or the snack bar's back wall, high enough that heads do not cover it, and not
  on the wall with the roll-up poll screen (corridor back wall, u 0.1..3.98).
- If there is no place for one of them that meets all this, say so and show the best compromise; do not drop it
  silently.

## Deliverables (all in `props/`)
1. `blockout.png`: ONE still, 1280x720 from the production camera (same framing as the lobby drafts), fast preview
   render (Workbench or Eevee) of the whole scene with the three props as plain flat-coloured boxes (one colour each;
   the claw machine's glass box, the jukebox's body, the TV's body with its screen face in a second colour). Burn in
   one short label with an arrow per prop, with its size (for example "claw machine 0.8 x 0.8 x 1.9 m"), and mark each
   prop's standing spot on the floor with a small ring. One magnified inset (about 2.5x) of the busiest area is
   allowed, as in Brief 84. Nothing else in the image.
2. `props_geom.json`: per prop the box in Blender world coordinates and in page (u, v, z) units, its footprint on the
   floor, the standing spot(s) in (u, v), the depth value `1000 + round((u + v) * 100)` at its front, the stage-pixel
   outline (1920x1080), which existing occluders cover it or are covered by it, and for the TV the screen quad in
   stage pixels.
3. `props_blockout.blend` (the copy, boxes in their own collection `PROPS`) and the script you used.
4. `../NOTES-89.md`: what you did, why each spot, what you rejected, what each prop hides or is hidden by, a check
   that a walker on the listed routes does not pass through a prop, render time, and an estimate for the later styled
   draft and layer render of all three on the local RTX 3050.

## Rules
Write only inside `roxy3d/props/` and `roxy3d/NOTES-89.md`. Never modify out10/, out10m/, out10l/, out10mist/, qa11/,
marquee/, leader/, the source .blend files, or any page. No final-quality renders, no cloud, no extra images,
close-ups or comparisons beyond `blockout.png` (its one inset is the only magnified view). One Blender job at a time on
this machine: check that no other Blender is running before you render. No computer use. End with a STATUS line and
stop.
