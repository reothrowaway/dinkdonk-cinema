# Brief 96: claw machine for the arcade cabinet; the leftover page items as Blender layers - stage 1, blockout and plan

12 Nov 2026. Render agent: Claude Fable 5.2. Stage 1: one blockout image and this plan. No production render, no
cloud, no page, pack or existing .blend touched.

**Updated the same evening.** The owner on the first blockout: "it should be facing to the lower left". The image is
now version 2 (play side toward the storefront glass, player between machine and glass), stage 2 (draft 33) is
done, and the cause of the Brief 95 loop flicker is found: see the three sections at the end. The stage 1 text below is corrected where it named the direction or the
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
- **Stage 3 job: about 86 items, 1.1-1.5 GPU-hours** on a 4090-class card (50 of them are the background phases)
  for the corner alone. **Revised at the end:** the light-linking repair (the cause of the Brief 95 flicker, found
  during stage 2) makes it about 288 items, 1.7-2.3 GPU-hours.

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

---

## Stage 2 (12 Nov 2026): draft 33, the claw machine in the cabinet's place

![Draft 33](qa10/draft33-claw.png)

`qa10/draft33-claw.png`: one still, 1280 x 720, fixed camera, weather frame 0, the draft settings of drafts 27-32
(256 max / 64 min samples, threshold 0.01, seed 1701, OptiX denoiser, Blackman-Harris 1.5 px, the scene's glare and
AgX look); marquee sample text and TV sample picture laid on in 2D as before. No critique (coordinator). I looked at
the final image and at an enlarged crop of the corner.

Scene: `rerender96/lobby_draft33.blend` (22.9 MB), built by `rerender96/build_draft33.py` from
`rerender95/lobby_draft32.blend` (opened read-only, hash unchanged). Numbers: `rerender96/build33.json`,
`render33.json`.

- **Cabinet out:** the 41 objects of group `arcade` and the light `Arcade screen spill` are switched off (not deleted).
- **Claw machine in:** its 45 objects now fill u 11.95-12.70, v 7.50-8.25. 11 header objects (box, two lit faces,
  WIN A, BUDDY, Buddy sign, stars, four bulb groups) are moved only; 33 body objects are mirrored across the
  machine's diagonal; the Buddy side art is turned onto its new face. After the move: controls at u 12.09-12.56 on
  the +v ledge, coin door and prize door on the +v face, glass on the +v and +u sides, closed walls on the two
  hidden sides. No material, light value or size changed.
- **What the picture shows:** WIN A on the lower-left header face and BUDDY with the stars on the lower-right one,
  as approved; the lit box with the plush behind glass on both visible sides; the control ledge with the stick and
  the red coin light on the lower-left (play) side; the teal line round both. The storefront's last post crosses
  the machine's left edge, as in the blockout.
- **Weak point: the machine's lower body is nearly black here.** At its old place the base was lit from the street
  through the glass; here that light does not reach, and the cabinet that stood here had its own pink edge tubes.
  The Buddy art on the lower-right side is in the picture but cannot be made out. I added no light (nothing was to
  be restyled). If the base should read, a small fill or lit art is a styling decision for the owner.
- **The old place** behind the glass is plain carpet; the cabinet's pink reflections in the wet ground are gone and
  the machine's header shows there instead.

### Region check

Draft 33 against draft 32 is not a fair comparison: draft 32 itself was one random lighting state (next section).
So the unchanged source scene was rendered once more the same way (outside the project, deleted) and draft 33
compared with that. Largest channel difference per pixel, 0-255:

| | Outside the corner (846,600 px) | Corner (draft px x 640-940, y 470-720) |
|---|---|---|
| Draft 33 against the unchanged scene, same process steps | mean 0.51, p99 4, 1,193 px over 24 | mean 11.4, p99 176 |
| The unchanged scene against the draft 32 picture | mean 2.52, p99 44, 32,530 px over 24 | mean 1.04 |

Outside the corner draft 33 differs from the unchanged scene in two places only: the wet ground and roof east of
the lobby that mirror the machine (expected), and the left block's brick band with three vents and a roof edge
(more than 2,000 px over 8/255, not expected: the random lighting state again, see below). The lobby interior, the sign, the
marquee, the poster, jukebox and TV are equal within render noise.
The machine itself is stable: the corner rendered in three separate Blender processes differs in 6 of the machine's
5,520 px; what differs there between processes is outdoors (a sidewalk strip, the alley's wet ground, the annex roof).

### Runs (local RTX 3050, one Blender job at a time)

Files added in `rerender96/`: `build_draft33.py`, `run33.ps1` (runner; waits while another Blender runs),
`lobby_draft33.blend`, `build33.json`, `render33.json`, `runtime33/` (the draft runner's copy and caches, 52 MB),
`linktest96.py`, `linkcount96.py` and their logs (next section).

Final still: **64.3 s beauty + 9.1 s weather**, 90 s for the run. Before it one coarse crop of the corner (9 s) to
check the mirrored body; after it the comparison render of the unchanged scene (73 s). All crops and the comparison
picture were outside the project and are deleted. `build_draft33.py` got its check-only option `--reference` after
the draft was rendered; the part that builds and renders the draft is unchanged. The runner waited for the other
agent's Blender jobs each time; that agent's jobs twice started while mine was running (they do not wait).

---

## Why the Brief 95 loop flickered: light linking past Blender's limit (found 12 Nov 2026)

Asked by the coordinator after NOTES-95b: find why whole surfaces had a light on in some workers' renders and off in
others. **Found and reproduced locally. It is my Brief 95 scene, not the cloud helper.**

- **Cause.** Blender gives every object a "light set": the combination of light-linking lists that include it. A
  scene has room for **64** distinct combinations. The Brief 95 scene needs **89** (`rerender96/linkcount96.py`):
  the draft 31 scene had 8 receiver lists and 17 combinations; Brief 95 added 15 lists (7 roof reflection lists, 7
  wall reflection lists, 1 wet ground list) and their members cross with the old lists. The frozen production scene
  of Brief 95 needs 88. Objects whose combination gets no number fall back to the default set: they lose the linked
  lights meant for them and receive linked lights not meant for them. Blender says so in every log ("Maximum number
  of light linking sets (64) exceeded", 8 times in `rerender95/draft32.log`, 43 times in the Brief 95 smoke log).
  **I did not notice that line in Brief 95.**
- **Why it differs per worker.** The numbers are handed out in an order that changes from one Blender process to
  the next, so different objects fall back each time. Combinations shared by thousands of objects (the lobby
  interior) always get a number; the small ones (a wall's pieces, roof pieces, the NEXT SHOWING board, the WC signs,
  the paste-wall posters) are the ones that switch. That is the list in NOTES-95b.
- **Proof** (`rerender96/linktest96.py`: the same coarse crop of the left block's brick band and the corridor's
  left end, each run a new Blender process on the same file; `linktest_*.log`):
  - five processes, unchanged scene: at least three clearly different pictures. Two runs with identical steps
    differ in 13.8% of the crop's pixels by more than a quarter of their brightness; two others happened to match
    (0.08%). So it is the process, not what was rendered before it.
  - three processes with the count brought under the limit (trial, in memory: the seven wall lists merged into one
    and the seven roof lists into one, 89 -> 55 combinations), after different preceding captures: **0 pixels**
    differ by that measure, mean difference 0.02-0.04% of the level. The warning appears once, when the file is
    loaded, and not again after the merge (4-6 times in the unchanged runs).
- **What it means for the pictures made so far.** Draft 32 was one random state (posters on the paste wall yellow,
  board text amber; both live packs show them white). Every Brief 95 item was rendered in its worker's random state:
  the 48 background phases (repaired at the pack step in `out10r2`), and also the occluder pictures and their wet
  loops of the outdoor pieces (NOTES-95b saw it in `wet_glass_left_00-05`). Draft 33 above is one random state too,
  outdoors; its lobby interior is not affected.
- **The trial merge is not the fix.** It proves the mechanism, but it lets every wall card show in every wall and
  every roof's city copy in every roof, which changes the look (seen in the alley's wet ground and the annex roof).

### The repair (before the Brief 96 bundle is built)

1. **Scene.** Bring the count from 89 to at most 56 while each reflection card keeps its own surface: cut each of
   the 15 Brief 95 lists down to the surfaces that carry the reflection (the small detail objects with their odd
   old memberships are what multiplies the count), and where that is not enough, give a card a distance window
   instead of a list. `linkcount96.py` is the gate: the bundle builder refuses a scene over 60, and an item fails
   if Blender prints the warning.
2. **Run script.** Every item sets its whole state from the frozen plan at its start (visibility, holdout,
   switched-off objects, phase, material states, chase bulbs, light-linking lists by name) and takes nothing from
   the item before it. With the count under the limit the order of items no longer matters; this is the second lock.
3. **Smoke test, local and as the first items of the paid run.** The same background phase crop and one outdoor
   occluder capture are rendered in two separate worker processes after different preceding items and compared:
   0 pixels over a quarter of their brightness and a mean difference under 1% of the level, or the run stops.
4. **Look check.** With every link honored the outdoor wet surfaces show the designed state for the first time in
   one picture. Where `out10r2` settled on the other state, the new base will differ from it. One check still of
   the repaired scene belongs before the paid render (the owner's eye, his call whether as a draft).
5. **More to render.** Brief 95 pictures of outdoor pieces cannot be mixed with a repaired base. Besides the 50
   background phases, `claw`, `bench`, mist, chase lights and L1-L7, the outdoor depth pieces are rendered again:
   `street_lamp`, `bus_stop`, `glass_left`, `glass_right`, `entrance_post_1`, `entrance_post_2`, `entrance_header`,
   `entrance_neon`, `front_solid_wall` (25 phases each), `paste_wall`, `bridge_board`: 227 captures. The exact list
   comes from the scene (every piece that holds an object of a small combination). **Stage 3 then has about 288
   items, 1.7-2.3 GPU-hours on a 4090-class card, about $2-3** at the Brief 95 run's rates (not a current quote).
   Rain frames, doors, the restroom light and the indoor pieces are still taken from `rerender95/result95/`.

Not done here: the repair itself (it changes the scene behind the outdoor look and needs its own check still), the
exact list of pieces, a test on Linux or on a pod. Not checked: whether Blender's order also changes inside one
process when objects are hidden between captures (the three trial runs say it does not matter once the count fits).

Runs for this section: 12 short test renders (7-9 s each, coarse, crops only, written outside the project and
deleted) and one count run without rendering. Logs: `rerender96/linktest_*.log`, `linkcount.log`.

STATUS: STAGE 2 COMPLETE - BLOCKOUT VERSION 2 (qa10/blockout96.png: PLAY SIDE TO THE LOWER LEFT, PLAYER AT (12.32, 8.5) BETWEEN MACHINE AND GLASS, SEEN THROUGH THE LAST GLASS PANE) AND DRAFT 33 (qa10/draft33-claw.png FROM rerender96/lobby_draft33.blend: CABINET OFF, CLAW MACHINE IN ITS PLACE, BODY MIRRORED SO THE GLASS FACES THE CAMERA, LETTERING AS APPROVED) DELIVERED; THE MACHINE'S LOWER BODY IS NEARLY BLACK AT THIS PLACE (NO LIGHT ADDED); CAUSE OF THE BRIEF 95 FLICKER FOUND AND REPRODUCED: THE SCENE NEEDS 89 LIGHT-LINKING COMBINATIONS, BLENDER HAS 64, AND WHICH OBJECTS FALL BACK CHANGES PER PROCESS; REPAIR PLANNED FOR THE START OF STAGE 3, NOT DONE; STAGE 3 THEN ABOUT 288 ITEMS, 1.7-2.3 GPU-HOURS; NO CRITIQUE, NO PRODUCTION RENDER, NO CLOUD, NO LIVE PACK OR PAGE CHANGED; WAITING FOR THE OWNER ON DRAFT 33; STOP.

---

## Stage 3 (12-13 Nov 2026): light-linking repair, check still, production bundle

Owner through the coordinator: draft 33 and the layout are accepted, the machine's lower body stays dark as rendered;
go on without another stop. No cloud was contacted, nothing was committed, `out10r/` and `out10p/` were not written.

![Check still of the repaired scene](qa10/draft34-check.png)

### 1. Light-linking repair

`rerender96/relink96.py` made `lobby_draft34.blend` from `lobby_draft33.blend`: **89 -> 54 receiver combinations**
(Blender numbers 64). The production scene needs 53, counted with every leftover-item object switched on at once.

- Every Brief 95 reflection card keeps its own surface list. Objects left the lists in stages, smallest first, until
  the count fitted: small detail (under 0.1 m2) out of the Brief 95 lists: 1746 objects, 81 combinations left; flat object out of the wall lists: 141 objects, 72 combinations left; upright object out of the roof lists: 49 objects, 69 combinations left; detail under 0.5 m2 out of the Brief 95 lists: 503 objects, 58 combinations left; piece under 1.5 m2 out of the Brief 95 lists: 124 objects, 54 combinations left.
- "Flat object out of the wall lists" is a correction, not a loss: my Brief 95 lists were filled by position and had
  caught roof slabs and standing water in the wall lists. A wall card is for a wall.
- Water always stays in its roof or ground list. The 2,533 objects that left keep all their old lists (lit as in draft 31); they only
  stop mirroring the reflection-only cards.

| Brief 95 list | Objects before | Objects now |
|---|---:|---:|
| roof list: alley | 451 | 15 |
| roof list: annex roof | 54 | 9 |
| roof list: far roofs | 256 | 44 |
| roof list: left apartment roof | 182 | 13 |
| roof list: multiplex roof | 710 | 84 |
| roof list: record shop roof | 27 | 4 |
| roof list: right apartment roof | 90 | 17 |
| wall list: alley back wall | 46 | 5 |
| wall list: cinema front wall | 100 | 9 |
| wall list: left block side wall | 140 | 9 |
| wall list: left block street front | 186 | 6 |
| wall list: multiplex band over the corridor | 42 | 3 |
| wall list: record shop front | 21 | 2 |
| wall list: right block street front | 159 | 1 |
| wet ground | 495 | 121 |

**Gate:** `linkcount96.py` counts; `make_prod_scene96.py` refuses a scene over 60; `job96.py` counts again when a worker
opens the scene and stops over 60.
**Test (`linktest96.py`, the repaired scene, four separate Blender processes, different preceding captures: none, a
rain capture, the bench piece, the right glass):** 0 pixels differ by a quarter of their brightness, mean difference
0.03% of the level, no light-set warning in any log. Before the repair the same test gave three different pictures.

### 2. Check still

`qa10/draft34-check.png`, rendered by `rerender96/check34.py` exactly like draft 33 (63 s + 7 s weather). I looked at
it. It is the first picture in which every linked reflection is on at once: the roofs show their standing water and
ripples in all four corners, the brick bands carry their sheen, the NEXT SHOWING board and the paste-wall posters are
white (as in both live packs). Against draft 33 (one random state): outside the claw corner mean 2.532/255,
27,939 px over 24; inside the corner mean 1.621 (the wet ground east of the lobby). The lobby interior and
the claw machine are unchanged. No owner stop was asked for; the image is there to be looked at.

### 3. Every item sets its whole state; every worker proves its lighting

`job96.py` (the Brief 95 job, changed):
- **`reset_state()` at the start and the end of every item:** visibility, switched-off objects, materials, light
  energies, object positions, emission strengths, the steam clock, phase and visibility caches are put back to the
  state the scene was opened in, and every emitter's receiver list is checked against the frozen plan
  (401 emitters, in `production.json`). An item takes nothing from the item before it.
- **Probe:** each worker process renders one crop of the surfaces that switched in Brief 95 (left block's brick band,
  corridor band, NEXT SHOWING board; stage px 345, 135, 810 x 300) before its first item and compares it with
  `probe_reference.npz` in the bundle (rendered here at production settings, 26 s). More than 1% of the 16 px blocks
  off by a quarter, or a mean difference over 4%, and the worker stops with an error instead of rendering. Every
  receipt carries its worker's probe numbers; the helper's finalize and `pack96.py` refuse items of a failed probe.
- With the count under the limit the probe cannot fail for that reason any more; it is the second lock.

### 4. The bundle

- **`rerender96/roxy-cloud-bundle-96.tar.gz`**, **23,200,144 bytes (22.1 MiB)**, 32 members, all under `bundle/`,
  SHA-256 `2c9293f1b5a03ce64eb16479c0e593322362adb5c43ee426306cce1b3c67fb93` (also in the `.sha256` file beside it). The helper's own `validate_archive` accepts it.
- **316 independent items:** 49 background phases (48 + the wrap proof), 1 dry fallback, 257 depth-piece captures, 1 mist item, 1 chase-light
  item, 7 leftover-item render items. **Items 1-13 are one of each kind.**
- Depth pieces (257): `claw` 1 (new, with positions), `bench` 1; outdoors `street_lamp`, `bus_stop`, `glass_left`,
  `glass_right`, `entrance_post_1`, `entrance_post_2`, `entrance_header`, `entrance_neon`, `front_solid_wall` at 25
  phases each, `paste_wall` 1, `bridge_board` 1 (227); and four indoor pieces that hold objects of a rare combination
  and so could have rendered in a wrong state in Brief 95 (`risky96.py`): `partition_left` 25, `palm` 1,
  `restroom_side_wall` 1, `restroom_stall_4` 1 (28). That is 28 more than the 288 planned.
- Not rendered again, taken from the live pack: rain frames and video, the 48 door poses (their leaves hold no object
  of a rare combination), the restroom light, the other indoor pieces, vehicles, umbrellas, cat, janitor, items.
- Scene `pipe/scene.blend` (21.7 MB, 7,860 objects): `lobby_draft34.blend` made ready by `make_prod_scene96.py`: rain
  streaks removed, marquee, poster, jukebox and TV off (layer packs), **claw machine on as group `claw` with its four
  bulb groups dark**, arcade cabinet and its light off, 190 small objects of the leftover items built in and switched off.

Commands for Claude, from `roxy3d/` in Git Bash, **only with the owner's spend approval**; neither was run. GPUs:
4090-class or cheaper. `MAX_HOURS` is the money limit (hours per pod); the scripts refuse to start without it.

```bash
MAX_HOURS=0.5 bash rerender96/run96-test.sh      # one pod, items 1-13 at full quality
MAX_HOURS=1.25 bash rerender96/run96-final.sh    # five pods, all 316 items
```

The final one in full:

```bash
GPUS='NVIDIA GeForce RTX 4090,NVIDIA RTX 6000 Ada Generation,NVIDIA L40S,NVIDIA RTX A6000,NVIDIA A40,NVIDIA GeForce RTX 3090' \
PODS=5 WORKERS=auto MAX_WORKERS=4 FRAMES= FLY_MODE=final CHUNK=4 MAX_HOURS=<limit> BOOT_MIN=10 ESTIMATE_HOURS=0.7 \
ARCHIVE="$PWD/rerender96/roxy-cloud-bundle-96.tar.gz" MULTI_STATE="$PWD/cloud/cloud-state-96-final.json" \
OUTDIR="$PWD/rerender96/result96" bash cloud/cloud-render.sh multi
```

Then the pack, at home, no GPU (`roxy3d/out10s` and `roxy3d/out10ps` must not exist; `out10r_work/products` is needed
for one rain frame of the full still):

```bash
../tools/blender-5.2.3-windows-x64/blender.exe -b --factory-startup --python-exit-code 1 \
  --python rerender96/pack96.py -- rerender96/result96
```

### GPU time (RTX 4090 class; from the measured times of Briefs 56, 94 and 95, not a new benchmark)

| Item | Count | Seconds each | Note |
|---|---:|---:|---|
| Background phase, dry fallback | 50 | 60-85 | |
| Depth-piece capture | 257 | 11-15 | |
| Mist (both passes) | 1 | 60-100 | |
| Chase lights | 1 | 40-60 | 6 crops |
| L3 the block across the street | 1 | 150-210 | 14 crops |
| L5 steam | 1 | 200-340 | 48 volume frames |
| L1, L2, L4, L6, L7 | 5 | 15-100 | 3, 2, 6, 14 and 5 captures |
| Probe, once per worker process | 10-20 | about 10 | |

Sum: **about 2.0-2.6 GPU-hours** on one 4090 worker (the planned 1.7-2.3 plus the 28 indoor captures and the item
overheads). The only production-settings times measured for this job are the five items of section 5 on the RTX 3050. With five pods and several workers per GPU about 40-50 minutes of wall time including start-up; about
$2-3 at the Brief 95 run's rates (5 A40 for 55 min were about $2.5-3 for 502 items; not a current quote).

### 5. Local smoke (RTX 3050, one Blender job at a time)

`rerender96/local_check96.sh` runs the whole chain: scene, probe reference, seal, extract, smoke, compare, the
helper's checks, pack (`SKIP_SCENE=1` starts at the seal; the last seal was made that way, because only `job96.py`
and `pack96.py` had changed and the scene and its probe reference had not). The numbers below are from the last
seal. The smoke goes through the helper's real worker (`cloud/multi_blender.py`) on the extracted
copy of the sealed archive, `FRAMES=1-13`, `B96_SMOKE=1` (8 samples, same 4K grid, 4 of the 48 steam frames).

| Item | Render s | Whole item s |
|---|---:|---:|
| 1 background 000 | 23.8 | 51.1 |
| 2 fg claw 000 | 4.8 | 14.6 |
| 3 chase | 29.6 | 72.0 |
| 4 fg glass left 000 | 5.1 | 13.8 |
| 5 fg bench 000 | 4.6 | 12.6 |
| 6 item sign | 14.3 | 34.7 |
| 7 item carried | 9.1 | 30.0 |
| 8 item street | 93.8 | 219.4 |
| 9 item police | 30.3 | 91.6 |
| 10 item steam | 18.1 | 49.8 |
| 11 item splash | 63.3 | 169.7 |
| 12 item umbrella | 22.2 | 71.9 |
| 13 mist | 105.9 | 106.0 |

937 s for the thirteen items; exit 0. Worker 1's probe: 0.39% of the blocks off by a quarter, mean difference 3.1% (8 samples against the
256-sample reference; limits for a smoke 3% and 10%). The helper's own `verify_unpack` accepts the result archive.

**Two-worker test** (`compare_smoke96.py`): a second worker process rendered items 4 and 5 again as its first items
(worker 1 had rendered the background, the claw piece and the chase lights before them). Both probes passed.

| Item | Product | Mean difference /255 | p99 | Pixels off by a quarter |
|---|---|---:|---:|---:|
| fg bench 000 | fg/bench/f000.png | 0.046 | 1 | 0.000% |
| fg bench 000 | fg/bench/f000@2x.png | 0.056 | 1 | 0.000% |
| fg glass left 000 | fg/glass_left/f000.png | 0.037 | 1 | 0.000% |
| fg glass left 000 | fg/glass_left/f000@2x.png | 0.047 | 1 | 0.000% |

`glass_left` is one of the pieces whose wet loop switched in Brief 95.

**Five items at production settings** (256 samples, `smoke96.ps1 -Full`, same worker, same sealed archive; three more
worker processes):

| Item | Render s (RTX 3050) | Whole item s |
|---|---:|---:|
| 3 chase | 110 | 188 |
| 6 item sign | 18 | 72 |
| 7 item carried | 10 | 31 |
| 8 item street | 804 | 963 |
| 9 item police | 88 | 150 |

- Each of the three processes rendered the probe before its first item: **0 blocks off, mean difference at most
  0.005%** against the reference a fourth process had rendered. At equal settings the lighting state is the
  same in every process, to the last digit that matters. Before the repair this crop was the one that switched.
- I looked at all pictures of these items at production quality: the chase pieces are four small sets of bulbs
  (95 x 166, 90 x 44, 44 x 38, 68 x 41 px; all four added to the dark state against the direct capture of all four:
  mean 0.14/255); the sign has a clean contact shadow; the street patches lie on the
  new background without a visible edge; noise outside a patch's own area is 0.02-1.5/255 on average, so the
  production thresholds (12 and 3) hold.
- This run found a mistake of mine that the 8-sample smoke had hidden: the street states and the police road light
  were captured with the depth pieces in view, so at production thresholds the pink-neon patch grew over the bus
  shelter and its post, and the road pieces carried the lamp post and the lens. They are now captured as the
  background is (depth pieces out of the camera's sight, still shading and reflecting), sealed again, and the smoke
  chain and these runs were repeated with that seal.

### 6. Home pack step on the smoke result

`pack96.py --partial` built a test pack from the thirteen items (910 checks, failures: 0; it is in
`rerender96/smoke96/pack/`, not a pack to promote):
- `claw`: alpha from the render, one slice `claw_00` at z 3020; chase pieces at z 3021: `claw_chase_0` 122 x 166 at (1119, 860), `claw_chase_1` 136 x 166 at (1114, 860), `claw_chase_2` 114 x 165 at (1124, 861), `claw_chase_3` 153 x 165 at (1124, 861).
- `arcade`, its slice, `arcade_attract`, `arcade_play`, `arcade_hiscore` and the baked-sign entry are gone from the
  manifest and the folder.
- `out10ps/`: the props pack without the claw machine, 10 layers, byte for byte the Brief 94 files.
- The leftover items' pictures and manifest blocks (below).
The full pack needs the full render: base, loop, the 25-phase pieces, videos and full stills ran only as code taken
from `pack95.py`.

### 7. The leftover page items as built

| # | What came out | Pictures |
|---|---|---|
| L1 | `manifest.wet_floor_sign`: yellow A-frame with "!" and its contact shadow, 80 x 72 at stage (1088, 796), anchor [40.0, 52.0], z 2660 | 1 |
| L2 | `manifest.items.buddy` (18 x 18, the claw machine's plush: blue blob, darker cap, eyes, cheeks) and `.clipboard` (14 x 18), anchors as popcorn and soda | 2 |
| L3 | `manifest.street_states.overlays` (table below) | 13 |
| L4 | `manifest.police_bar.pieces` (table below); one bar for both sedans, placed by `dx, dy` from the road point under the car's centre | 5 |
| L5 | `manifest.steam`: 48-frame loop sheet 8 x 6, cell 64 x 96, anchor [32.0, 90.98916354320318] = the plume's foot, additive, 12 fps (4 s) | 1 |
| L6 | `manifest.puddle_splash`: 14-frame one-shot sheet 7 x 2, cell 160 x 112, anchor [40.0, 92.5] = the curb point, additive, 24 fps | 1 |
| L7 | `manifest.umbrella.inside_out[red, blue, yellow, black]`: same 88 x 80 cell and grip anchor as `open` | 4 |

That is 27 pictures (each at 1x and 2x) instead of the 28 planned: the police bar is one bar with two light frames each
for road and lens (5, not 6), the rest as planned.

Street overlays (places and sizes from the production-settings run):

| Name | Stage x, y | Size | Blend | What |
|---|---|---|---|---|
| `window_1_dark` | 178, 295 | 49 x 68 | source-over | apartment window 1 dark (the base shows it lit) |
| `window_2_dark` | 228, 321 | 50 x 67 | source-over | apartment window 2 dark (the base shows it lit) |
| `window_3_dark` | 115, 325 | 61 x 67 | source-over | apartment window 3 dark (the base shows it lit) |
| `window_4_lit` | 115, 270 | 61 x 67 | source-over | apartment window 4 lit (the base shows it dark) |
| `window_5_lit` | 178, 350 | 49 x 67 | source-over | apartment window 5 lit (the base shows it dark) |
| `window_6_lit` | 177, 405 | 55 x 65 | source-over | apartment window 6 lit (the base shows it dark) |
| `neon_pink_off` | 234, 365 | 186 x 310 | source-over | the pink script neon dark, with its light on the wall and the wet ground gone |
| `neon_video_off` | 60, 408 | 201 x 326 | source-over | the VIDEO RENTAL sign and its green tube dark, with their light on the sidewalk gone |
| `door_cabge_open` | 212, 501 | 127 x 164 | source-over | the greengrocer (CABGE) door open: lit doorway and warm light on the sidewalk |
| `door_noodles_open` | 289, 540 | 108 x 162 | source-over | the noodle shop door open: lit doorway and warm light on the sidewalk |
| `dog_up` | 239, 459 | 27 x 25 | source-over | the dog's head on the sill of the blue (TV) window |
| `snarkers_up` | 232, 399 | 39 x 39 | source-over | two figures with binoculars at the dark window above the blue one |
| `snarkers_glint` | 231, 403 | 35 x 34 | plus-lighter | the glints of the two binoculars (blink it over snarkers_up) |

Police pieces (sizes from the production-settings run):

| Name | Size | Blend | Layer | What |
|---|---|---|---|---|
| `bar` | 41 x 27 | source-over | above the sedan | the light bar on the roof, lenses dark |
| `red_road` | 300 x 174 | plus-lighter | under the sedan | light of the red lens on the wet road |
| `red_lens` | 56 x 51 | plus-lighter | above the sedan and the bar | the red lens lit, with its glow |
| `blue_road` | 291 x 151 | plus-lighter | under the sedan | light of the blue lens on the wet road |
| `blue_lens` | 56 x 53 | plus-lighter | above the sedan and the bar | the blue lens lit, with its glow |

How they are made: a state is rendered on its own in the same crop and the same way as the background (no depth
pieces in view), and its patch starts from clear changes inside the state's own area and grows through weaker change
that touches them, so render noise elsewhere never gets into a patch. Light pieces (chase, lens, road, glints) keep only what a 3 x 3 mean of the difference
confirms. Sprites (sign, plush, clipboard, bar, umbrellas) are rendered alone with nothing else in the camera's
sight. The umbrellas are brought to the mean color of the pack's open umbrella of the same color (gains of 0.64-0.90 per
channel, in the pack's `validation.json`); a normal red umbrella rendered beside them covers the pack's `red_open` silhouette to 99.5%.

Things to know:
- **The bus shelter stands in front of the noodle shop's door.** Its patch holds the lit doorway and the light on
  the sidewalk; on the page the shelter piece is drawn over it, so mostly the sidewalk light shows. The
  greengrocer's doorway is in the open.
- `neon_pink_off` holds the whole pink sign (blade, brackets, tubes dark), because that sign is the depth piece
  `entrance_neon`: the page hides that piece and its wet loops while the patch shows. The other depth pieces there
  (bus shelter) keep their pink tint for the length of the dip.
- A lit window that goes dark takes the lamp behind it with it.
- The police lamps sit over the two ends of the bar; from the middle of the roof the roof itself would shade the
  road for 1.5 m around the car. **`blue_road` has a bright glint** (peak 243/255, about 15 x 25 px): the blue lamp
  mirrored in the standing water in front of the car. `red_road` has none (peak 142). On the page the glint
  travels with the car. If it looks wrong there, the cure is a lower lamp or a cap in `item_police`; I left it as
  rendered.
- Steam and splash glow by themselves (no scene light), so they look the same at every spot.

### 8. What the page must do (complete list; also in `manifest.brief96.page_must`)

Packs:
1. Main art `out10s` (with its mist maps: `?artdir=out10s&mistdir=out10s`); props pack `out10ps` instead of `out10p`
   (jukebox and TV, 10 layers, no claw layers and no `props.claw`); `out10m` and `out10l` as they are.

Claw machine and arcade:
2. `claw` is an ordinary occluder with one slice. Push `manifest.claw.chase_layers` (4 pieces, plus-lighter, z just
   above the claw piece) into the occluder stack; drive them as `chase_0..3` as before (`manifest.claw.animated`).
3. Player spot from `manifest.claw.standing_spots_uv`: **(12.32, 8.5)**, depth 3082. Way in from
   `manifest.claw.way_in_uv`: the old first legs, then (12.95, 7.0), (12.95, 8.5), the spot; back the same way. The
   player faces the machine (up and to the right). `mergeProps` no longer finds a claw spot in the props pack.
4. Gone: occluder `arcade`, prop loops `arcade_attract`, `arcade_play`, `arcade_hiscore`, the `ARCADE` spot
   (12.95, 7.85), `arcadeBusy`, the arcade detour (whether those 7% of arrivals now play the claw machine is the
   page's call), `arcadeFlash` and `.arcadeglow`, the screen-loop switching, the HIGH SCORE and GAME OVER marks.
5. Gone: the glass rules for the claw machine (body below z 3000, light at z 3190) and the cat/gnome cut around the
   old place (10.9, 8.3); cat spot (10.5, 7.9) and gnome spot (10.55, 8.45) are in view again. Gnome spot
   (11.6, 7.6) is behind the machine: drop or move it. The cut around the jukebox stays.
6. Worth a look with real chat: the Yee vs Pepe spot (45% hidden) and the talk ring's right place (89%).

Leftover items (each replaces a page drawing; clocks, cues and positions stay the page's):
7. Wet-floor sign: `manifest.wet_floor_sign` at its `x, y` with its `z_index`, faded as now, instead of `.wetsign`.
8. Buddy plush and clipboard: `manifest.items.buddy` and `.clipboard` through the item placing, instead of `.buddy`
   and `.clip`.
9. Apartment windows: `window_1_dark` .. `window_3_dark` for the three lit windows, `window_4_lit` .. `window_6_lit`
   for the three dark ones, shown with the 1.8 s fade, instead of the `.lwin` gradients.
10. Neon dips: `neon_pink_off` and `neon_video_off` flashed with the dip timing, instead of the `.ldip` patches. For
    the pink one also hide the `entrance_neon` piece and its wet loops while it shows (the patch holds the dark sign).
11. Shop doors: `door_cabge_open`, `door_noodles_open` on the canvasser's cue, instead of `.doorlight`.
12. Dog: `dog_up` while a bus is near, instead of `.wdog`. Snarkers: `snarkers_up` hidden for 15 s of every 50,
    `snarkers_glint` (plus-lighter) blinking over it, instead of `.snark`.
13. All street overlays go in the ground layer: above the background and its light loop, below walkers and depth
    pieces (`manifest.street_states.layer`). They are pictures of the ground layer only, like the background.
14. Police light bar: `bar` above the sedan at P(car u, lane) + (dx, dy); `red_road` / `blue_road` (plus-lighter)
    in the ground layer under the sedan; `red_lens` / `blue_lens` (plus-lighter) above the bar; red and blue alternate every 0.25 s;
    instead of `.sirenbar`.
15. Steam: `manifest.steam` at the five spots (foot at the anchor), scaled 0.5-1.1, out of phase, 12 fps, instead of
    the 15 `.puff` divs.
16. Puddle splash: `manifest.puddle_splash` once per splash at P(u, 10.85), 24 fps, instead of the ten `.drop` divs
    and the ring.
17. Umbrellas in a gust: `manifest.umbrella.inside_out[color]` for 1.3 s instead of the CSS flip.

### Not verified

- A run under Linux and on a pod; several workers sharing one GPU with this scene.
- At production quality only the probe and five items were rendered (chase, sign, carried, street, police; items 3,
  6-9). Not at production quality: background, depth pieces, mist, steam, splash, umbrellas (8 samples only).
- The home step end to end (background, loop, 25-phase pieces, videos, full stills).
- The repaired look beyond the one check still: other loop phases, 4K.
- The page with any of this; how the patches meet the moving loop under them (they are phase 0); the pieces'
  brightness in OBS; the blue glint travelling with the police car.
- The mist height map still takes its roof list from the Brief 50 inventory (the annex roof 1.2 m too long, unseen).

### Files added in `rerender96/` for stage 3

`relink96.py` (+ `relink96.json`), `lobby_draft34.blend`, `check34.py` (+ `check34.json`), `risky96.py`
(+ `risky_groups96.json`), `probe96.py` (+ `probe96.json`), `make_prod_scene96.py` (+ `prod_scene96.json`),
`build_bundle96.py` (+ `bundle96.json`), `bundle96/bundle/` (the bundle's source: `job96.py`, `pipeline.py`,
`render67.py`, `run.sh`, `pack96.py`, `probe_reference.npz`, `pipe/`, `cache/`, `live/`), `pack96.py`,
`smoke96.ps1`, `compare_smoke96.py`, `local_check96.sh`, `run96-test.sh`, `run96-final.sh`, `smoke96/` (the smoke:
extracted bundle, the runs, unpacked results, test pack, logs, `compare96.json`, `full96.json`),
`roxy-cloud-bundle-96.tar.gz` and its `.sha256`.
`PROGRESS.md` is not in the write list and is unchanged.

STATUS: STAGE 3 COMPLETE - LIGHT LINKING REPAIRED (89 -> 54 COMBINATIONS, FOUR PROCESSES RENDER THE SAME PICTURE); CHECK STILL qa10/draft34-check.png; BUNDLE rerender96/roxy-cloud-bundle-96.tar.gz (22.1 MiB, 316 ITEMS) FITS THE MULTI-POD HELPER; EVERY ITEM RESETS ITS STATE AND EVERY WORKER PROVES ITS LIGHTING WITH A PROBE; THIRTEEN-ITEM LOCAL SMOKE THROUGH THE HELPER'S WORKER PASSED, TWO-WORKER TEST PASSED, FIVE ITEMS ALSO RENDERED AT PRODUCTION SETTINGS (PROBE IDENTICAL IN FOUR PROCESSES), HOME PACK STEP pack96.py RUN ON THE SMOKE RESULT (STAGES out10s/ AND out10ps/, NEVER out10r/); ABOUT 2.0-2.6 GPU-HOURS; LINUX, THE REST AT PRODUCTION QUALITY AND THE FULL HOME STEP NOT VERIFIED; NO FULL RENDER STARTED, NO CLOUD; STOP.
