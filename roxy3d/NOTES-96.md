# Brief 96: claw machine for the arcade cabinet; the leftover page items as Blender layers - stage 1, blockout and plan

12 Nov 2026. Render agent: Claude Fable 5.2. Stage 1: one blockout image and this plan. No production render, no
cloud, no page, pack or existing .blend touched.

**Updated the same evening.** The owner on the first blockout: "it should be facing to the lower left". The image is
now version 2 (play side toward the storefront glass, player between machine and glass), and stage 2 (draft 33) is
done: see the two sections at the end. The stage 1 text below is corrected where it named the direction or the
player spot; everything else in it stands.

![Blockout: the claw machine in the arcade cabinet's place](qa10/blockout96.png)

`qa10/blockout96.png` (1280 x 720): the new layout large, a small "today" panel and a key. Both panels are the same
crop of the fixed lobby camera (stage px x 930-1410, y 742-1078), Workbench clay look. Cyan = claw machine (the pale
panel is its play side), orange = arcade cabinet, yellow ring = player spot, yellow dashes = the way in, red dashes =
removed or old place, dashed box = a chatter at the player spot. I looked at the final image.

## Short answer

- **Where it goes.** The claw machine moves 1.15 m east and 0.63 m back (toward the bench): box u 11.95-12.70,
  v 7.50-8.25, 1.25 m tall (stage x 1122-1212, y 842-979), its east and north sides flush with the cabinet's.
  **Its play side (controls, coin door, prize door) faces +v, the storefront glass: lower left in the picture**
  (owner, 12 Nov 2026; the first blockout had it toward +u like the cabinet's screen). The player stands at
  (12.32, 8.5), between machine and glass, 0.25 m from the play side, drawn in front of the machine.
- **The player from the camera:** 0% clear, 86% seen through the storefront's last pane, 14% behind the glass frame;
  the same numbers as today's claw player. 0.70 m of floor between machine and glass.
- **What it covers.** Almost what the cabinet covers; it is 5 cm wider and deeper and 13 cm (10 px) taller, and the
  height is what shows: of a chatter on the bench 39% is hidden (30% today), at the talk ring's right place 89%
  (66%), at the Yee vs Pepe spot 45% (21%). Gnome spot (11.6, 7.6) is fully behind it (71% today). Cat spot
  (12.55, 6.85) stays fully in view; the routes keep their distance.
- **What it frees.** Behind the glass, cat spot (10.5, 7.9) goes from 100% hidden to 18%, gnome spot (10.55, 8.45)
  from 86% to 0%, the talk ring's left place from 100% to 13%.
- **What covers it.** 81% of it is in clear view, 14% (the west third of its south face) is seen through the
  storefront's last pane and 5% is behind the glass frame. The cabinet today: 86% / 9% / 5%.
- **Base or layer: base.** The claw machine is rendered into the main pack as its own depth piece (occluder `claw`),
  like the cabinet was. Its four header chase groups stay separate on/off light pieces. Reason below: the cabinet has
  to come out of the base pictures and all 48 loop phases anyway, and that is the expensive part.
- **Brief 94's glass problem ends.** The machine no longer stands behind the pane the page draws twice: no values
  lifted for two glass layers, no light pieces above the glass, no teal line across the player. The 14% at the
  glass's east end get one ordinary layer of glass, like the cabinet's edge today.
- **Leftover page items: 7 render items** (91 small captures) that become 28 small page pictures.
- **Stage 3 job: about 86 items, 1.1-1.5 GPU-hours** on a 4090-class card (50 of them are the background phases).

## What I found

### The two machines (measured in `rerender95/lobby_draft32.blend`; units: (u, v) tiles = m, z in m)

| | Box u | Box v | Height | Front | Player spot | Stage px |
|---|---|---|---|---|---|---|
| ORBIT arcade cabinet (group `arcade`, 41 objects) | 12.00-12.70 | 7.50-8.20 | 1.116 | screen on +u | (12.95, 7.85), 0.25 m from the screen | x 1128-1212, y 853-977 |
| Claw machine today (group `claw`, 45 objects) | 10.80-11.55 | 8.13-8.88 | 1.25 | +u | (11.76, 8.5), 0.21 m | x 1015-1105, y 826-963 |
| **Claw machine, new** | **11.95-12.70** | **7.50-8.25** | 1.25 | **+v** | (12.32, 8.5), 0.25 m | x 1122-1212, y 842-979 |

- The cabinet's group also holds its 27 screen pixels, the control shelf with sticks and buttons, two pink edge tubes
  and the ORBIT lettering. One light outside the group belongs to it: `Arcade screen spill` (6 W point light at the
  player spot). All of it goes.
- The machine has glass on two sides and closed walls on the other two. With the play side toward +v its body is
  mirrored so that the glass stays on the two sides the camera sees (see "Blockout, version 2").
- **Looked at and not taken:** the box 4 cm further east (u 11.99-12.74). It puts the machine past the cabinet's
  line on the camera's side of the bench (52% of a sitter hidden instead of 39%).
- In the live base `out10r` the props are switched off, so the old place behind the glass **is plain floor there
  already**; what shows the machine today is the layer pack `out10p` (6 pictures), which goes.

### What the camera sees (ray casts against the scene; `rerender96/blockout96_geom.json`)

The machine's three visible faces, 28 x 28 samples each, weighted by stage area:

| | Clear | Through the storefront glass | Hidden | Hidden by |
|---|---|---|---|---|
| Claw machine, new place | 81% | 14% | 5% | the glass frame |
| Arcade cabinet today (as a box) | 86% | 9% | 5% | the glass frame |
| Claw machine today | 0% | 82% | 18% | the glass frame, the marquee |

Per face: the front (+u) is 100% clear; the south face 57% clear, 34% through the glass, 9% behind the frame; the
top 90% clear. Behind it the machine covers lobby carpet and, with 3.1% of its area, the bench's near end (cabinet:
1.5%); no other depth piece.

How much of a 50 px chatter standing at a spot is hidden (56 samples per figure):

| Spot | Today | New | Hidden by, new |
|---|---:|---:|---|
| Player spot (12.32, 8.5) | 14% | 14% | glass frame; the other 86% is seen through the glass |
| On the bench (11.9, 6.66) | 30% | 39% | claw machine |
| Cat spot (12.55, 6.85) | 0% | 0% | |
| Gnome spot (11.6, 7.6) | 71% | 100% | claw machine |
| Gnome spot (12.2, 6.1) | 43% | 43% | the bench, unchanged |
| Talk spot (10.8, 7.2), centre | 43% | 54% | glass frame 38%, claw machine 16% |
| Talk ring, right place (11.22, 6.78) | 66% | 89% | claw machine |
| Talk ring, front place (11.22, 7.62) | 18% | 38% | claw machine 29%, glass frame 9% |
| Yee vs Pepe spot (10.95, 6.35) | 21% | 45% | claw machine |
| Freed: cat spot (10.5, 7.9) | 100% | 18% | glass frame |
| Freed: gnome spot (10.55, 8.45) | 86% | 0% | (seen through the glass) |
| Freed: talk ring, left place (10.38, 7.62) | 100% | 13% | glass frame |
| Freed: janitor spot (10.2, 7.0) | 63% | 39% | glass frame |

The increases are the machine's height: the cabinet's own box made 1.25 m tall gives the same 39% on the bench and
45% at the fight spot. Unchanged: wet-floor sign spot, the queue's second row, the old claw player spot.

Along the walker routes (a figure every 0.2 m, mean share hidden by anything, today -> new): to the machine round
its east side 41% -> 43% (most at (11.17, 6.85): 63% -> 88%; the last legs from (12.95, 7.0) 2%); to the bench
65% -> 70%; the cat's way to (12.55, 6.85) 39% -> 45%; the
cat's way to (10.5, 7.9) 70% -> 31%.

Plan distances from the machine's footprint (cabinet today in brackets): player spot 0.25 m, way in along u 12.95
0.25 (0.25), cat spot 0.65 (0.65), bench 1.10 (1.10), route to the machine 0.52 (0.52), route to the bench 0.80
(0.82), gnome spot (11.6, 7.6) 0.35 (0.40), talk spot 1.19 (1.24), storefront glass 0.70 (0.75).

### Base or layer: base

- **The cabinet must leave the base in any case.** In `out10r/bg.png` the cabinet's footprint is a black square, its
  shadow and the pool of its screen light lie on the carpet, and its two pink tubes are mirrored in the wet ground in
  front of the lobby's east corner (stage x 1165-1215, y 975-1055). Those mirror images move with the rain: in that
  patch 146 px are pink, and their red value swings by 20/255 on average (up to 78) over the loop (16 of the 48 phase
  pictures in `out10r_work/products/bg` compared). So they are in the light-loop video too, and a layer cannot take
  moving reflections out of a video: the background phases are rendered again, with or without the claw machine.
- With that render happening, the machine standing in the scene costs nothing extra and gives what a layer cannot:
  its real shadow on carpet and bench, its light in the base and in every loop phase, its header mirrored in the
  wet sidewalk, and ordinary depth sorting (one piece at about z 3020; the player at 3082 in front, a bench sitter
  at 2856 and the cat at 2940 behind), exactly as the cabinet has (z 3027).
- **The chase lights stay separate:** the base and the `claw` piece hold the machine with its steady lights (lit
  box, magenta header face, teal line, coin slot, button) and the four bulb groups dark. Four additive pieces
  `claw_chase_0..3` (bulbs, their glow, their reflection), made from pure-light captures as in Brief 94, sit just
  above the `claw` piece. All four on = the approved look. A chatter at the machine is drawn over them.
- **Lighter page:** today the corner costs 10 pictures (cabinet piece, its three screen loops, six claw layers; eight
  of them blended, one 370 x 253). New: the `claw` piece and four small blended chase pieces.
- `out10p` shrinks to jukebox and TV (10 pictures); that is a manifest edit, no rendering.
- Not chosen, a new claw layer pack over `out10r`: 12 crop captures (about 1 min of GPU) instead of 50 background
  phases, but the cabinet's footprint shadow, light pool and moving pink reflections stay in the base, and the solver's
  light pieces would again lie over chatters.

### The storefront glass (Brief 94)

At the old place 82% of the machine was seen through the glass, which the page draws twice; the body was lifted for
two glass layers and still came out up to 29/255 too light, and its light pieces sat above the glass (z 3190), over
the player. At the new place the machine stands at the glass's east end: 14% of it is seen through the last pane and
5% is behind the frame (cabinet today: 9% and 5%). That strip is drawn the ordinary way and comes out with one layer
of glass over it: the `claw` piece (about z 3020) sorts above the page's whole-glass copy (z 3000) and below the last
glass slice (z 3160), as the cabinet (z 3027) does today. The player (depth 3082) sorts the same way: one layer of
glass, as for today's claw player. Nothing is solved for the glass any more. The page drawing the right glass twice
remains a page matter for chatters further back behind it.

## The leftover page items (NOTES-95 point 7 "later")

Grouped by where they are rendered. Sizes are stage px at 1x; every picture also comes at 2x.

| # | Render item | Captures | What it becomes | Size | What the page does differently |
|---|---|---:|---|---|---|
| L1 | **Wet-floor sign**, in the lobby at (10.2, 6.4) | 3 (sign alone; floor with and without it) | 1 sprite with its contact shadow | about 26 x 34 | `.wetsign` CSS shape -> the sprite at the same spot and depth (z 2660); fades as now |
| L2 | **Carried things**: Buddy plush (one plush of the machine's heap), clipboard; item rig of `roxy_pass6.blend` like popcorn and soda | 2 | 2 item sprites in `items` | 18 x 18, 14 x 18 | `.buddy` and `.clip` CSS shapes -> `items.buddy`, `items.clipboard` through the page's own item placing |
| L3 | **The block across the street, states**: one crop (about stage x 60-420, y 240-760; set in stage 2 by how far the lights reach), each state on its own | 14: base; 6 window lights; pink neon and VIDEO RENTAL alone; 2 open doors; dog; snarkers and their glints | 13 overlays: 3 "dark" patches for the lit windows and 3 "lit" light pieces for the dark ones; 2 "tube off" patches with the sign's glow on wall and wet street removed; 2 open-door overlays (leaf, warm inside, light on the sidewalk); dog's head up; two snarkers; glints | windows 40 x 60 to 80 x 120 with their spill; neon about 110 x 200 and 140 x 220 with the street reflection; doors about 60 x 100; dog, snarkers about 32 x 32 | `.lwin` gradients, `.ldip` dark patches, `.doorlight`, `.wdog`, `.snark` CSS shapes -> the pictures; same clocks, classes and cues. Dog and snarkers slide behind the sill as now |
| L4 | **Police light bar** on both sedans (+u, the only way the page sends it); vehicle rig of `roxy_vehicles_pass9.blend` | 6: per sedan the bar alone, red light, blue light | per sedan 1 bar sprite and 2 additive light frames (bar glow, light on roof and wet road) | bar about 26 x 14; light about 200 x 120 | `.sirenbar` (two glowing blocks) -> the bar pinned to the sedan and the two light frames alternating at 2 Hz |
| L5 | **Steam loop**: one plume on black, looping | 48 frames | 1 additive loop sheet, 48 cells | 64 x 96 per cell | 15 `.puff` divs -> 5 sheet elements at the same five spots, scaled 0.5-1.1 and out of phase |
| L6 | **Puddle splash**: drops on arcs and the ring on the sidewalk, one-shot | 14 frames | 1 additive sheet like `tyre_spray` | 112 x 72 per cell | 10 `.drop` divs and the `.splash` ring per car -> 1 sheet element at the curb |
| L7 | **Inside-out umbrellas**: the four colors; umbrella builder of `render_characters_pass6.py` | 4 | 4 sprites, same cell and grip as `umbrella.open` | 88 x 80 | CSS flip (`.blown`) -> the inside-out picture for 1.3 s, still leaning in the gust |

- 7 render items, 91 captures, 28 pictures (each at 1x and 2x). All positions, clocks and cues stay the page's.
- States are taken from **pure-light captures** where only light changes (windows, neon, light bar), so they carry no
  render noise and can be added or subtracted; where shapes change (doors, dog, snarkers, sign) the state is rendered
  directly and cut out against the base crop with a soft edge.
- The "dark" window patches and "tube off" patches cover the moving wet highlights under them while shown, like the
  page's flat patches today.
- Not in this list because the brief does not name them: the TV flicker in the blue window, step splash rings,
  pigeons, newspaper, the nothing-burger cloche, door glow. The splash ring frames could serve the step rings later.
- L2, L4 and L7 extend the sprite sets made by the pass 5-9 scripts in their own small scenes
  (`render_items_pass7.py`, `vehicles_pass9.py`, `render_characters_pass6.py`). I have not opened or run those
  scenes in this stage.

## Plan

**Stage 2 - scene and one styled draft (local): done, see "Stage 2" at the end.**
The small items of L1-L7 (sign, single plush, clipboard, two open doors, dog, snarkers, light bar, plume, splash,
inside-out canopy) are **not modeled yet and not in the draft**: a draft is one still of the scene and they are
on-cue pictures. They are built with the stage 3 job. If the owner wants to see them before the paid render, that is
one extra contact-sheet image: his call, not made here.

**Stage 3 - RunPod bundle for `cloud/cloud-render.sh multi`, smoke-tested locally (no owner image).**
`rerender96/roxy-cloud-bundle-96.tar.gz`, built like Brief 95's (same helper contract, same render modules and
settings: 3840 x 2160 grid, 256/64 samples, threshold 0.01, seed 1701, OptiX denoiser; first items one of each kind).

| Items | Count | Seconds each (4090) | Note |
|---|---:|---:|---|
| Background phases (48 + wrap proof) and dry fallback | 50 | 60-85 | the cabinet out, the claw machine in; measured in Brief 95 |
| Depth pieces: `claw` (new, with positions), `bench`, `glass_right` (25 wet phases) | 27 | 11-15 | the two neighbors its light reaches |
| Mist maps (both passes) | 1 | 60-100 | the light map tints chatters there |
| Claw chase lights (4 pure-light crops, 2 check crops) | 1 | about 30 | |
| L1-L7 | 7 | 15-290, together 6-9 min | my estimate from Brief 94's crop captures (3-8 s each), not measured; L5 steam is the longest (48 volume frames) |
| **Total** | **86** | | **about 1.1-1.5 GPU-hours** |

- Everything else of the main pack (49 rain frames, 325 other occluder captures, doors, restroom light) is taken
  from the Brief 95 result, so **`rerender95/result95/` (801 MB) must be kept** until this pack is built.
- The smoke compares phase 0 of the other nearby pieces (`entrance_post_2`, `queue_back`, `snack`, `palm`) with
  their Brief 95 pictures; a piece that differs by more than render noise joins the job (a wet piece is 25 items,
  about 5 min).
- With 5 pods as in Brief 95: about 30-40 min including start-up, about $1.5-2 at that run's rates (5 A40 for 55 min
  were about $2.5-3 for 502 items; not a current quote). On the local RTX 3050 instead: about 8-10 h (backgrounds
  are 7.3x slower).
- Home step `rerender96/pack96.py` (no GPU): seeds a new staged pack from the live one, rebuilds base, lit, dry,
  light loop, `claw`, `bench`, `glass_right` with slices and wet loops, mist maps, full stills; removes `arcade` and
  its three loops; adds the chase pieces, the new sprites and sheets, the state overlays; writes the manifest with
  `brief96.page_must`, validation and checksums. `out10p` is staged again without its claw layers.
- **Depends on the loop repair now under way (`out10r2`):** the 50 new background phases go through the same loop
  build. If that repair ends in re-rendering the phases, both changes should be one job: decide before the scene is
  frozen.

**What the page must do (lobby session, `lobby-qa.html` first).**
1. Load the new pack; `claw` is an ordinary occluder with slices. `arcade`, `arcade_attract`, `arcade_play` and
   `arcade_hiscore` no longer exist. `out10p` holds only jukebox and TV.
2. The four chase pieces come from the main manifest (plus-lighter, just above `claw`); same on/off control as now.
   The glass rules for the claw machine go (body below z 3000, light at z 3190).
3. Claw player spot = (12.32, 8.5). Way in: the arcade's route, extended round the machine's east side
   (..., (8.2, 6.6), (12.95, 7.0), (12.95, 8.5), the spot), and back the same way; the old straight line down to the
   spot would cross the machine. The player faces the machine (up and to the right in the picture).
   The arcade detour, its busy flag, `arcadeFlash`, the screen-loop switching and the HIGH SCORE / GAME OVER marks go;
   whether the 7% of arrivals who went to the cabinet now go to the claw machine is the page's call.
4. Spots: cat spot (10.5, 7.9) and gnome spot (10.55, 8.45) are in view again (drop the cut around the old place);
   gnome spot (11.6, 7.6) is behind the machine: drop or move it. The cut around the jukebox stays.
5. Worth a look with real chat: the Yee vs Pepe spot and the talk ring's right place, half behind the machine.
6. L1-L7: each page drawing listed above is replaced by its picture; nothing else changes.

## Risks and open points

- **Taller machine.** 10 px more of whatever stands behind it on the camera line is hidden (bench sitter, talk
  ring, fight spot). The look of the machine is approved, so its size stays; moving spots is the page's remedy.
- **Approved looks around the corner** (bench, carpet, glass, wet sidewalk) change only by the machine's own light and
  shadow; guarded by the region check in stage 2.
- **Base and loop are one set:** all 48 phases, base, lit, dry and full are rendered and packed together, as in
  Brief 95. The wet-roof flicker the owner saw is being repaired by another agent by rebuilding the loop (`out10r2`);
  I have not looked into its cause. Whatever that repair needs applies to these 50 phases too.
- **Layer packs over the new base:** `out10m` and `out10l` are untouched; jukebox and TV pieces were solved against
  `out10` and have not been checked in detail over `out10r` (PROGRESS, 12 Nov).
- **Not verified in this stage:** the machine's look at the new place (stage 2), any Cycles render, the old asset
  scenes for L2, L4, L7, how the open doors, dog and snarkers read at 2-4x zoom, the page.

## Files and runs

`rerender96/`: `build_blockout96.py` (measurements, two Workbench frames, working copy), `annotate96.ps1` (composes
the one image, deletes the temp frames), `run96.ps1` (runner; waits for or refuses to start beside another Blender),
`blockout96.blend` (collection "B96": box, front panel, player ring; the `arcade` and `claw` groups hidden, not
deleted; state in the scene property `brief96_state`), `blockout96_geom.json`, `annot96.json`, `run_report.json`,
`build.log`, `cache/` (Blender's own temp and config files).

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File rerender96/run96.ps1 -ExtraArgs "--raw,<temp folder outside the project>"
```

Workbench only: 3.8 s and 2.9 s for the two frames (3840 x 2160), 33 s for the build run. Blender ran twice, one
job at a time: a measure-only run (it still counted an unseen reflection card of Brief 95 as a blocker and used the
placement that was dropped; its log is deleted) and the build run that measured again and rendered. Another agent's
Blender (the pack step for `out10r2`) was running in between; the runner waited for it both times, and one wait ran
out after 8 minutes without starting anything. The two temp frames and one inspection crop of `out10r` were outside
the project and are deleted. No Cycles, no cloud.
`rerender95/lobby_draft32.blend` (SHA-256 `f5bb4cd5...`), `out10r/manifest.json` and `out10p/props.json` hash the same
before and after. This job wrote only `rerender96/`, `qa10/blockout96.png` and this file; `out10r2/` was not touched.
`PROGRESS.md` is not in the write list and is unchanged. Nothing committed.

Stage 1 status line as first delivered (the direction was corrected afterwards, see below):

STATUS: STAGE 1 COMPLETE - ONE BLOCKOUT IMAGE qa10/blockout96.png (CLAW MACHINE IN THE ARCADE CABINET'S PLACE, FRONT AND BACK FLUSH WITH IT, PLAYER SPOT (12.95, 7.85) KEPT, OLD PLACE BEHIND THE GLASS FREE) AND THE PLAN FOR STAGES 2-3 DELIVERED; DECISION: CLAW MACHINE IN THE BASE RENDER AS ITS OWN DEPTH PIECE, FOUR CHASE GROUPS AS SEPARATE LIGHT PIECES; LEFTOVER PAGE ITEMS = 7 RENDER ITEMS; STAGE 3 JOB ABOUT 86 ITEMS, 1.1-1.5 GPU-HOURS; NO STYLED DRAFT, NO CYCLES RENDER, NO CLOUD, NO LIVE PACK, PAGE OR EXISTING BLEND CHANGED; WAITING FOR THE OWNER'S OK ON THE BLOCKOUT; STOP.

---

## Blockout, version 2 (12 Nov 2026): play side to the lower left

Owner on the first blockout (12 Nov 2026): "it should be facing to the lower left". `qa10/blockout96.png` is replaced
by version 2: same style, same crop, the "today" panel kept. I looked at the final image.

- **Same place, other direction.** The box is unchanged (u 11.95-12.70, v 7.50-8.25). The play side faces +v: the
  storefront glass, lower left in the picture.
- **Player spot (12.32, 8.5):** centred on the controls, 0.25 m from the play side, 0.45 m from the glass; stage
  (1129, 975), depth 3082.
- **How the player looks from the camera** (50 px chatter, 56 samples): **0% clear, 86% seen through the storefront's
  last glass pane, 14% behind the glass frame.** These are exactly the numbers of today's claw player at (11.76, 8.5).
  Nothing else stands in front. Further east along the face a chatter gets partly clear of the glass's end, at
  (12.45, 8.5) 29% clear / 57% glass / 14% frame and at (12.55, 8.5) 57% / 29% / 14%, but is then cut by the end of the
  glass and stands off the controls. I kept the centred spot.
- **Floor between machine and glass: 0.70 m** (v 8.25 to 8.95). Wide enough: the player stands at the same v (8.5)
  as today's claw player, who also has the glass 0.45 m behind.
- **Way in.** The old claw route came straight down in v at the player's u; here that line crosses the machine.
  Proposed: the arcade's route extended round the east side, ..., (12.95, 7.0), (12.95, 8.5), (12.32, 8.5), and back
  the same way. On those last legs a chatter is in view (2% hidden on average) and passes 0.25 m from the machine's
  east side. The other way round, (11.6, 7.0), (11.6, 8.5), is 46% hidden on average and fully hidden behind the
  machine for a stretch.
- **Glass layering: nothing new.** The machine's own share behind the glass is unchanged (14% and 5%). The player
  (3082) and the `claw` piece (about 3020) both sort above the page's whole-glass copy (z 3000) and below the last
  glass slice (z 3160): one layer of glass over each, the player in front of the machine and of its chase pieces.
- **Covered spots: unchanged**, because the box is the same (bench, talk ring, fight spot, gnome spot (11.6, 7.6) as
  in the table above). The arcade's old player spot (12.95, 7.85) becomes a point on the way in.
- **What the turn does to the model.** The machine has glass on two sides and closed walls on the other two. A plain
  quarter turn would bring a closed wall round to the camera. So in the scene the header keeps its orientation
  (WIN A on the lower-left face, BUDDY on the lower-right face, the bulbs in their order) and the body below it is
  mirrored across its diagonal: play side and art side change places, the glass stays on the two sides the camera
  sees. The Buddy art is turned onto its new face, not mirrored. No part is restyled or resized.
- **Plan.** Stage 3 keeps its 86 items; `glass_right` stays in the job (the lit box and the teal line now face the
  glass from 0.7 m). Page: player spot, way in and facing as above.

Runs for version 2: one Blender run (measurements and two Workbench frames, 3-4 s each); the runner waited for the
other agent's Blender first. Temp frames deleted.
