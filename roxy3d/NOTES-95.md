# Brief 95: lobby re-render list - stage 1, blockout and plan

12 Nov 2026. Render agent: Claude Fable 5.2. Stage 1 only: one blockout image and this plan. No styled draft, no
production render, no cloud, no page or pack touched.

![Blockout: cargo gate, variants A and B](qa10/blockout95.png)

`qa10/blockout95.png` (1280 x 720): variants **A** and **B** side by side, a small "today" panel and a key. All three
panels are the same crop of the fixed lobby camera (stage px x 1100-1920, y 480-1080), Workbench clay look. Orange =
gate, green = EXIT door, yellow = delivery lane, purple = moved, red dashes = removed. I looked at the final image.

## Short answer

- **Point 3 has one cheap fix and one expensive one.** A (recommended): the gate moves 1.94 m left to the head of the
  alley, where the camera sees all of it and the alley is its lane from the street. B: the gate stays and the two
  buildings in front are cut back; that rebuilds the lower right corner of the picture.
- **Point 2** is one textured plane; removing it leaves the bare brick, the lamp and the small paint marks.
- The newest whole-lobby scene is `props/props_draft93.blend`; the live `out10/` base still matches it.
- Found on the way: the 58 wet-wall highlight loops of the live pack are almost empty (numbers under "Other findings").

## What I found

### Current source scene

`props/props_draft93.blend` (SHA-256 `09868390…`, draft 31) is the true current source of the whole lobby.
`props/layer94/scene94.blend` is the same scene with files packed (object-for-object equal). The chain, compared
object by object (`rerender95/compare95.json`): frozen Brief 56 production scene
`cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend` (7,038 objects, made `out10/`) -> `marquee_draft27`
(8,716) -> `leader_draft29` (8,724) -> `props_draft93` (8,809).

**The live base still matches.** Every one of the 7,038 objects of the frozen scene is in draft 31 with the same mesh,
position, materials and light values; no material was edited; camera, AgX look and world are equal. What differs is
what the draft runner adds at run time (1,435 rain streak objects, 78 sign bulbs carrying their chase materials, one
rain-impact mesh, visibility flags) plus the three additions: MARQUEE 243 objects, LEADER 8, PROPS 85. So `out10/` =
this scene without marquee, poster and props, which the page lays over it as `out10m`, `out10l`, `out10p`.
A new production still needs its own frozen scene and group list (`production.json`), as Brief 57 had.

### The gate, the door, the lettering

Units: (u, v) in tiles = m, z in m. The wall they sit on is the brick wall **behind** the alley, facing the street.

| What | u | v | z | Stage px |
|---|---|---|---|---|
| Brick wall behind the alley (`D3 cinema alley masonry return`) | 13.0-32.0 | face at -0.23, faces +v | 0-2.31, brick band above to 3.27 | frame ends on it at u 16.77 |
| DELIVERIES gate (shutter surround, 19 slats, lettering) | 15.02-16.65 | -0.22 to -0.10 | 0-1.61 | x 1807-1905, y 679-847 |
| EXIT door (reveal, leaf, push bar, lit sign) | 13.47-14.45 | -0.23 to -0.09 | 0-1.42, sign 1.50-1.70 | x 1722-1781 |
| ABSOLUTE CINEMA lettering (`D5 art cinema`, one plane) | 13.25-16.45 | -0.22 | 1.85-2.31 | x 1709-1901, y 571-701 |
| Alley floor | 13.06-15.0 | 0.02-9.12 | 0 | 1.94 m wide, curb cut to the sidewalk at v 9.1 |
| RECORDS & REPAIR annex (the building in front) | 15.0-17.5 | 0.5-6.5 | roof 0.79, parapet 0.86 | |
| its shop front | 15.0-17.5 | 6.45-9.10 | 0.83 | |
| Apartment block | 18.0-22.0 | -1.0-6.5 | roof 2.61, parapet 2.68 | |

Also on that wall, all staying: the bulkhead lamp (u 14.53-14.79, z 2.0, its 75 W light), the downpipe (u 14.75-14.88),
the paint tag "SLOW / 98" (u 13.11-13.52) and four faded hand marks (u 17.05-17.55, off frame). In the alley: dumpster
(u 13.80-14.36, v 6.20-7.40, in the middle), bottle bin, a pallet with a crate (u 14.44-14.99, v 0.85-1.82), the
annex's escape balcony 0.80 m up (v 2.85-4.05), a planter at the mouth. The cinema has no east wall (cutaway).

**The owner is right:** the gate faces the annex's north wall **0.60 m** away. Nothing wider than a person gets there.

### What the camera sees (ray casts against the scene, 24 x 24 samples; `rerender95/blockout95_geom.json`)

| | Gate in view | Ground 0-1 m in front in view | Clear depth in front | EXIT door in view |
|---|---|---|---|---|
| Today | 43% (apartment roof hides 27%, annex 21%, parapets 8%) | 0% | 0.60 m | 93% |
| A | 100% | 82% (the rest is behind the pallet's crate) | 9.2 m, the whole alley | 55%, its sign in full |
| B | 100% | 100% (1-2 m in front: 42%) | 2.9 m | 100% |

Two rules of this camera decide everything here: the frame's right edge is u - v = 17 (the gate's right end is about
10 px inside it), and the apartment block (2.7 m tall, the camera looks down at 30 degrees) hides the wall where
`h + 0.8165 x (18 - u) < 2.71` and **nearly all ground east of u 14.68**. Only the head of the alley (u 13.06-14.7) shows
wall and ground in full.

## Point 3: the options

**A - the gate moves to the head of the alley (recommended).**
- Gate, same size (1.63 x 1.61 m), to u 13.08-14.71 (stage x 1691-1789, y 621-788), DELIVERIES above it. It lands in
  the pool of the existing lamp. The alley is its lane: 1.94 m wide, straight from the curb cut (a sedan sprite is
  0.84 m wide, the bus 1.07 m).
- The EXIT door takes the wall right of the downpipe, u 15.02-16.00, seen over the roofs like the gate today (55%,
  sign in full). The annex's north end goes back 1.2 m (v 0.5 -> 1.7) so the door has a 1.9 m landing.
- Dumpster and bottle bin move 0.60 m to the annex wall (clear lane 1.34 m). Lamp, downpipe, paint tag, pallet stay.
- Cost: small. About 40 objects move (gate 21, door 6, dumpster and bin 10), 15 annex roof pieces are trimmed. Changed picture area: about stage
  x 1690-1920, y 560-870, plus the dumpster. No occluder, no walker route, no page-measured item is in that area.
- Open detail for the draft: the door could instead stay unseen behind the annex or get a canopy; not layout.

**B - the gate stays, the buildings move back.**
- Annex rear 2.3 m removed (v 0.5 -> 2.8), apartment block cut from v -1.0 to 4.5: it keeps its street-side 2 m with
  the facade, windows and fire escape. A loading yard 2.9 m deep opens in front of the gate, entered from the alley.
- Why so much goes: to show ground in front of the gate, the tall block has to end 3.3 m "in front" of it.
- Cost: large. 184 objects go (skylight with its warm light, vent, 22 window sets on the side faces, roof dressing),
  8 big pieces are cut, and a new yard needs floor, dressing and light. The lower right corner of the picture
  (about stage x 1600-1920, y 600-1000) is rebuilt; risk that the approved night look of that corner changes.

**Looked at and dropped** (not in the image): gate stays and only the annex's rear goes (free on the plan, but the
picture stays as today: ground hidden, 43% of the gate); a lane cut through the annex (same reason); the EXIT door on
the cinema's east side (there is no wall). Render cost is the same for A and B: both sit in the background, which
points 1 and 6 re-render anyway.

## Other findings (for points 1, 4, 5, 6)

- **Point 1, why only the street shines.** All outdoor materials share one wet-layer node group (inputs porosity and
  exposure). The street has more than that: 126 thin water-film pieces, ponds, curb flow, ripple normals, and 31
  reflection-only "catcher" lights placed where the ground mirrors them into the camera. Walls have none of it
  (masonry: porosity 0.38, roughness 0.84-0.88, so wet brick only darkens) and nothing bright stands where a wall
  mirrors; roofs have ripples but few catchers. So the fix is surfaces and things to reflect, not one slider.
- **Point 4, why wall tops are missing.** The cut-top pieces of several walls are in the `background` group, not in
  their wall's group (`D3 restroom entrance cut core/finish`, `D3 street wall cut core/finish`, ...), so the occluder
  render holds them out. Fix: assign each cap to its wall's group; the slicing already works by surface position.
- **Point 6, the 58 wet-wall loops are almost empty** (`rerender95/wetloops95.json`, 1x sheets, all 48 frames): of
  803,594 px, **418 px** ever change by more than 2/255 and **27 px** by more than 8/255; 24 loops never exceed 2/255;
  the brightest loops are a few glints on `glass_right`, `entrance_header` and `glass_left`. The page could drop
  them today with no visible loss (a page decision, not made here; worth one A/B screenshot).
- **Point 5.** The page draws the right storefront glass twice (whole copy + slices), so 17.6% of what is behind
  gets through; the claw machine was solved for that (NOTES-94). The clean fix is one glass layer and all claw
  pieces under it.

## Plan for stages 2-4 (all seven points)

**Recommended shape: fold marquee, poster and props into the one scene render** (they are in draft 31 already). Then
the base, lit and loop pictures and the wall slices hold their light and shadow (the perf session's ask), and only
what animates stays as separate pieces. The careful alternative (keep `out10m/l/p`, solve them again over the new
base) needs no page change and saves no load.

| Point | Change in the scene | Pictures it touches | Page contract |
|---|---|---|---|
| 1 Wet look | New wet variants for outside walls, ledges, roofs, sidewalks by the walls, alley (film, streaks, puddles on roofs and ledges); catchers for walls and roofs. Street materials untouched | `base`/`bg`, `lit_bg`, `lit_bg_dry`, `full`, both `light_loop`s; outdoor occluders and slices (`bus_stop`, `front_solid_wall`, `glass_left/right`, `entrance_*`, `street_lamp`, `paste_wall`); their wet loops; `out10mist/light` | none; the page's own wet effects (`#wetfx` purple light, streaks) must go off with the new pack or they double |
| 2 Lettering | Delete `D5 art cinema` | background pictures and loop in stage x 1709-1901, y 571-701 | none |
| 3 Gate (A) | Gate, door, annex end, dumpster as in the blockout | background pictures and loop in x 1690-1920, y 560-870; `out10mist` catch/height/rim/light there | none |
| 4 Wall tops | Caps into their wall's group (the walls the page patches today and `partition_right`; confirmed per wall in stage 2) | those occluders and slices (alpha grows by the top band, rects may grow), their wet loops, base under them | `walltops` off for the new pack; J6 poster cut measured again |
| 5 Claw / glass | Claw machine as a group behind one glass | `glass_right` + slices, claw pieces (was `out10p`) | right storefront drawn once; claw light below the glass |
| 6 Lighter lobby | Marquee (and poster, props) rendered in the scene; wet highlights only where they move | base, lit, loop, every slice under the marquee light; `out10m` shrinks to body + 4 chase groups (89 light + 97 shadow pieces gone); wet loops 58 -> at most 13 (one per wet parent) or one additive video | marquee/poster/prop merges read the new pack; form of the wet highlights to agree with the perf session before stage 3 |
| 7 Page items | see list below | base; a few new small occluders and on/off layers | each baked item's page drawing off for the new pack |

**Point 7, what is worth making in Blender now:** the sidewalk's purple light and the puddle streaks (they *are*
point 1); far skyline, city haze, aircraft lamp (static background); "Dogtober 7th" poster printed on its frame;
blank faces for the NEXT SHOWING board and the two slop menu strips (cleaner than covering baked text); searchlight
housings on the roof; poll projector with bracket, the poll screen's case, the "bridge out" board with legs,
beacons and ground light (bodies and on/off light layers; texts and cloth stay live); wet-floor sign sprite.
**Later, as small layer jobs after the base is final** (they are cut from it): apartment windows lit/dark, neon
"tube off" variants, shop door light, dog and snarkers, Buddy plush and clipboard items, police sedan, steam
loops, splash sheets, inside-out umbrellas. **Stay page-drawn:** all live text and pictures (marquee text, LED signs,
film posters, poll picture, TV picture, J6 stickers: its frame's place is a layout question of its own), emote
figures (jannies, staff, turtle, canvasser, gnome), floating marks, auras, light and reflections on chatters,
searchlight beams, pigeons, newspaper, door glow, bell rings. The auditorium's items are a separate job.

**Stage 2 - scene and one styled draft (local).** Copy draft 31 to `rerender95/`, make points 1-7 in it, render
**one** still: `qa10/draft32-rerender.png`, 1280 x 720, fixed camera, weather frame, no insets. It shows the wet
walls, roofs and alley, the bare wall, the gate, the baked items. Before it goes to the owner: a region check that
the street, the sign, the marquee, the poster, the props and the interior equal draft 31, and the second-opinion
critique. Render: about 1-1.5 min per still on the RTX 3050 (draft 31: 60 s + 8 s weather), 3-4 min per run;
the work is the modeling.

**Stage 3 - production job, smoke-tested (local, no owner image).** New frozen scene and group list (marquee,
poster, props, new items as groups; caps in wall groups), capture plan for the animated pieces, the wet-highlight
form, manifest in the existing schema, contract checks (slices rebuild their parents; loop = exact complement of
the base; decode check). Smoke at tiny size plus one native 4K probe frame to measure the new wet look's cost.
About 15-25 min of GPU.

**Stage 4 - full render, only on the owner's word.** Staged as `out10r/` (test: `?artdir=out10r&mistdir=out10r`),
verified at home, one check image; nothing promoted by the render agent.
- **RunPod RTX 4090:** the last full pack took **2.9 h** (10,472 s: backgrounds 58 min, foreground 84, weather 15,
  doors 10). This one adds the folded groups and animated captures (+10-15 min) and wetter, noisier surfaces
  (+10-30%, known after the stage 3 probe): **about 3.3-4.2 h of rendering, 4-5 billed hours**, about $4-6 at the
  rates of the earlier runs ($0.89-1.19/h; not a current quote). The Brief 77 multi-worker runner may shorten it;
  not measured for this pack.
- **Local RTX 3050:** measured 7.3x slower on 4K backgrounds (423 s against 58 s) and 5-6x on crops (Brief 94):
  **about 20-27 h** of continuous rendering, resumable per capture; no OBS or perf work on the PC meanwhile.

**Approvals, three in all:** (1) A or B, now; (2) the styled draft; (3) the go for the full render and where.

## Risks

- **The loop is the exact complement of the base.** Any outdoor change means base, lit, dry, full and all 48 loop
  phases at both sizes are rendered together; old and new cannot be mixed.
- **Packs over the base.** `out10m`, `out10l`, `out10p` were solved against today's pixels; over a new base they
  show seams unless folded in or solved again. Folding means page work in `lobby-qa.html` by the lobby session.
- **Approved looks** (sign draft 23, marquee 27, poster 29, props 31, street, interior) must come out unchanged;
  new catchers can leak into the street's reflections. Guard: object/material comparison (`inspect95.py`) and a
  region comparison against draft 31.
- **Wetter walls** mean more glossy noise: fireflies, denoiser smear, loop flicker (Brief 45). Check in the probe.
- **Wall tops and single glass** change how walkers sort and look at walls and behind the right storefront; needs
  a real-chat check by the lobby session.
- **Page items placed in stage px** (apartment windows, neon dips, door lights, posters, slop lines, steam): none
  lies in variant A's area; the steam puff at (1650, 905) sits on the part of the annex roof that stays in both variants.
- **Mist and chatter light** read `out10mist`; it has to be rendered with the pack.
- Cost and loss on the cloud (run notes of 2-3 Nov): results on a network volume, watchdog, credit named first.

## Files and time

`rerender95/`: `build_blockout95.py` (boxes, measurements, three Workbench frames), `annotate95.ps1` (composes the
one image, deletes the temp frames), `run95.ps1` (runner; refuses to start beside another Blender), `blockout95.blend`
(collection "B95 A" shown, "B95 B" hidden; what each variant hides or moves is in the scene property
`brief95_state`), `blockout95_geom.json`, `annot95.json`, `run_report.json`; surveys: `inspect95.py` ->
`inspection95.json`, `compare95.json`; `inspect_wet95.py` -> `wet95.json`; `wetloops95.ps1` -> `wetloops95.json`; logs.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File rerender95/run95.ps1 -ExtraArgs "--raw,<temp folder outside the project>"
```

Workbench only: 2-3 s per frame, 66 s per run with the ray casts. Blender ran nine times, one at a time, no other
Blender was running: four read-only survey runs (one failed on a script error, one repeated with more fields) and
five blockout runs (one measure-only, one stopped on a wrong argument, three that rendered); only the last image exists. The three
temp frames and my inspection crops were outside the project and are deleted. No Cycles, no cloud.
`props_draft93.blend`, `out10/full.png` and `out10/manifest.json` hash the same before and after; since the start,
nothing changed in `out10*`, `qa11/`, `props/`, `marquee/`, `leader/` or `cloud/brief57/`. `PROGRESS.md` is not
in the write list and is unchanged. (`../lobby-qa.html` changed during this run; not by this job.) Nothing committed.

Not checked: variant B's yard beyond box level; the EXIT door's new place with light; whether a van sprite exists;
the page with any of this.

STATUS: STAGE 1 COMPLETE - ONE BLOCKOUT IMAGE qa10/blockout95.png (VARIANTS A AND B, "TODAY" FOR REFERENCE, LETTERING MARKED REMOVED) AND THE PLAN FOR STAGES 2-4 DELIVERED; RECOMMENDED: A (GATE TO THE HEAD OF THE ALLEY); NO STYLED DRAFT, NO PRODUCTION RENDER, NO CLOUD, NO LIVE PACK, PAGE OR EXISTING BLEND CHANGED; WAITING FOR THE OWNER'S CHOICE A OR B; STOP.

---

## Stage 2 (12 Nov 2026): the seven points in one scene, styled draft 32

Owner chose **A** (12 Nov 2026). Later the same day: "just go full do it, no need for my feedback" and "skip the
critique", so no critique was run on this draft and the work goes straight on to stage 3.

![Draft 32](qa10/draft32-rerender.png)

`qa10/draft32-rerender.png`: one still, 1280 x 720, fixed camera, weather frame 0, the draft settings of drafts 27-31
(256 max / 64 min samples, threshold 0.01, seed 1701, OptiX denoiser, Blackman-Harris 1.5 px, the scene's glare and
AgX look). The street marquee's sample text and the TV's sample picture are laid on in 2D as in draft 31 (the page
draws them). I looked at the final image and at enlarged crops of the left block, the corridor's left end, the alley
and the right roofs while tuning.

Scene: `rerender95/lobby_draft32.blend` (22.9 MB), built by `rerender95/build_draft32.py` from
`props/props_draft93.blend` (opened read-only, hash unchanged). Everything added is in the collection `B95` (296
objects); every changed or added object carries a `brief95` note. Numbers: `rerender95/build32.json`.

### What changed, per point

1. **Wet reflections everywhere it is wet** (in the draft; it is the largest visible change).
   - **Walls:** a running-water sheen was added to the shared wet-layer node group (new input "Wall Sheen", default
     0, so every other material renders as before). It acts on vertical outdoor faces only: a glossy film in
     vertical streaks with a fine drop bump. Switched on for 85 outdoor masonry, metal, wood and fabric materials;
     not for glass, signs, prints, the bus shelter, the street lamp or the entrance (they keep their look).
   - **What the walls mirror:** a wet wall mirrors what stands in front of it, and there the scene is dark. Seven
     walls the camera sees (alley back wall, the brick band over the corridor, the left block's street front and
     side wall, the cinema's front wall, the right block's and the record shop's fronts) each got an unseen card of
     city lights 1 m in front, in the wall's mirror direction; it shows only in that wall's reflection.
   - **Roofs, ledges, alley:** 17 materials that were set as sheltered (roof felt, parapets, copings, sills, the
     alley's asphalt) now get the full rain exposure the street has. Six new sheets of standing water on the roofs
     that had none (right apartment roof, annex roof, the three far roofs).
   - **Reflections for them:** the street mirrors a "hidden city" of neon and windows; its distance filter kept it
     out of every roof. Each roof level and the alley now has its own copy (7 copies, 210 cards), placed so the
     reflection crosses as much haze as the street's does, and linked to that surface only.
   - **The street itself is not touched:** its materials, films, ponds and its hidden city are as in draft 31.
   - **The page's wet-street lights (L4), now real:** the purple light out of the glass front onto the sidewalk
     (one 19 W area light, on the ground only), the long reflections under the street lamp, the video store sign
     and the cinema's corner (three unseen lit strips mirrored by the wet ground), and the pink neon's light
     running down its wall (5 W).
2. **ABSOLUTE CINEMA lettering:** the plane `D5 art cinema` is off. Bare wet brick, lamp and paint tag remain.
3. **Cargo gate, variant A:** the gate (21 objects) moved 1.94 m to the head of the alley; the EXIT door (6 objects)
   1.55 m to the right of the downpipe; the annex's north end is 1.2 m shorter (block, roof and two parapets
   shortened; north parapet, copings, puddle, moss and debris moved back with it) with asphalt in the new landing;
   dumpster and bottle bin 0.60 m to the annex wall.
4. **Wall tops:** the cut-top pieces of `partition_right` (snack bar's back wall), `restroom_entry_wall` and
   `front_solid_wall` (9 objects) moved from the `background` group to their wall's group. Nothing to see in a
   still; it decides which picture owns the top in the pack. The other walls have no separate cap piece
   (`partition_left`, `restroom_side_wall` already hold theirs); checked per wall in stage 3 on the alpha.
5. **Claw machine behind the glass:** no scene change. The scene already has the machine behind one pane (what the
   draft shows); the fix is in how the pack is cut and how the page draws the right glass (stage 3).
6. **Lighter lobby:** no scene change. Marquee, poster and props are in this scene, so the production pictures
   carry their light and shadow; what the pack delivers is stage 3.
7. **Page-drawn items made in Blender now** (static only):
   - far skyline: 30 warm windows on the far blocks in the top left corner, and the red aircraft lamp on a mast at
     the left roof's far corner (stage 506, 3; the page blinks its dot at 506, 18);
   - "Dogtober 7th" printed on the corridor's right-hand frame (texture `rerender95/dogtober32.png`, drawn from the
     page's own poster by `make_dogtober32.ps1`); the filler "The Blue Hour" art is off;
   - two searchlight units on the cut top of the corridor's back wall. Lenses at stage (943.5, 176) and
     (1052, 230.5); the page's beam feet are at (940, 212) and (1050, 252), so the beams move up 22-36 px;
   - the poll projector with wall plate and arm (the page's box: u 0.10-0.55, v 2.08-2.42), lens at stage (803, 283);
   - the poll screen's case: a tube with end caps on two arms, u 0.06-4.03, 0.45 m in front of the back wall;
   - the "bridge out" board on the far sidewalk: legs, feet, frame, black panel, two unlit amber beacons
     (panel at stage 307-389 x 818-897).

### What the page keeps drawing (live text and changing states)

Marquee text, LED door signs, film posters, NEXT SHOWING text, slop menu lines, TV picture, poll picture and cloth,
the projector's lamp, vent glow and beam, the bridge board's dot text, beacon blink and ground glow, the searchlight
beams and their foot glow, the aircraft lamp's blink, the J6 poster with its stickers, apartment window switching,
neon dips, steam, gnome, wet-floor sign, all emote figures, floating marks, auras, light and reflections on chatters.
When the new pack is loaded the page must switch off what is now baked: `#wetfx` (purple light, four streaks), the
skyline rectangles, the Dogtober poster div, the projector body, the poll screen case, the board's legs, panel and
beacon housings; and move the two beam feet.

### Not done, and why

- **City haze** (the warm gradient along the top edge): it is a flat screen gradient, not an object; baking it would
  change nothing to see and tie it to the base-plus-loop sums. It stays with the page.
- **Blank NEXT SHOWING board and blank slop menu strips:** the page shows the baked texts most of the time and only
  covers them now and then; a blank board would be empty the rest of the time. Needs a page decision first.
- **J6 poster:** its frame's place (half behind the projector) is a layout question of its own; stickers are live.
- **Wet-floor sign, Buddy plush, clipboard, window overlays, neon "off" variants, police sedan, steam and splash
  loops:** sprites and overlays that appear on cue; they are cut from the final base, after it (later layer jobs).
- **Blockout for the new props:** the searchlights, projector, case and board stand where the page already draws
  them, so no new blockout was made.
- **Second-opinion critique:** skipped on the owner's word.
- **Not checked:** a pixel comparison against draft 31 outside the changed areas (by eye the lobby interior, the
  sign, the marquee, the poster and the props read the same); the look at 4K; any loop phase other than 0; the page.

### Render time and runs (local RTX 3050, one Blender job at a time, no other Blender running)

Final still: **63.9 s beauty + 8.4 s weather**, 96 s for the whole run with build and save. Before it: two probe
runs (ray casts, no render), one coarse crop of the alley (8 s) and four coarse full-frame tuning passes (36 s each,
threshold 0.04), written outside the project and deleted. No cloud. Nothing committed. Live packs, pages and existing
.blend files untouched.

STATUS: STAGE 2 COMPLETE - DRAFT 32 (qa10/draft32-rerender.png) RENDERED FROM rerender95/lobby_draft32.blend WITH ALL SEVEN POINTS: WET WALLS, ROOFS, LEDGES AND ALLEY WITH THEIR OWN REFLECTIONS; LETTERING REMOVED; GATE AT THE HEAD OF THE ALLEY; WALL TOPS IN THEIR GROUPS; SIX PAGE ITEMS BAKED; POINTS 5 AND 6 NEED NO SCENE CHANGE; NO CRITIQUE (OWNER); GOING ON TO STAGE 3.

---

## Stage 3 (12 Nov 2026): the production job as a multi-pod bundle, smoke-tested locally

Plan change on the way (coordinator, 12 Nov): the full render runs on RunPod with the multi-pod helper
(`cloud/cloud-render.sh multi`), started by Claude; this job never contacts the cloud. So stage 3 is a portable,
chunkable bundle that fits that helper as it is, a local smoke of a few items, and the home step that builds the pack.
**No full render was started.**

### The bundle

- **`rerender95/roxy-cloud-bundle-95.tar.gz`**, **22,739,564 bytes (21.7 MiB)**, 27 members, all under `bundle/`,
  SHA-256 `27eab818406746221bfc169383c6202d999e8a37997ac92a261afbf7755aae0f` (also in the `.sha256` file beside it).
  Everything packed and relative; Blender 5.2.3 Linux, OptiX. The helper's own `validate_archive` accepts it.
- **502 independent items** ("frames" to the helper): 49 background phases (48 + the wrap proof), 1 dry fallback,
  49 rain frames, 352 occluder captures (13 wet groups x 25 phases, 26 static groups, the new `bridge_board`),
  48 door poses, 2 restroom light states, 1 mist item (both passes; the second needs the first's data).
  A worker can claim any of them; nothing waits on another item. **Items 1-8 are one of each kind**, so a broken
  kind fails in the first minutes of a paid run.
- Each item renders one capture with the live pack's settings (3840 x 2160 grid, 256/64 samples, threshold 0.01,
  seed 1701, OptiX denoiser, Blackman-Harris 2.5 px), turns it into the finished 2x and 1x display pictures with the
  scene's glare and AgX look ("products"), writes a receipt with every product's SHA-256, and deletes its linear
  buffer. The render modules are the Brief 56/57 production's, byte for byte (`bundle95.json` lists the hashes).
- Scene: `pipe/scene.blend` (22.4 MB) = draft 32's scene made ready by `make_prod_scene95.py`: the draft runner's
  rain removed (the production renderer adds its own, same seed), stage 2's switched-off objects kept off, wall caps
  in their walls' groups, `bridge_board` as a new group.

### What this pack is, and what it is not

**It is the main lobby pack in the live contract** (same manifest schema, placements, loop timing, alpha and slice
ownership of every unchanged group). **Marquee, "Dear Leader" poster and the three props are switched off in it and
stay the layer packs `out10m`, `out10l`, `out10p` over it**, exactly as over the live base. Reasons: the three props
have states the page switches, the marquee's chase and halo were built as layers with their own solver, and folding
them in needs page work that nobody has agreed yet; this way the page contract stays, and their additive light and
alpha pieces still sit correctly over the new base.
Consequences, plainly:
- **Point 6 (lighter lobby) is only half in:** wet highlight loops that never exceed 2/255 are left out of the new
  manifest (in the live pack 24 of the 58 are like that; how many it is with the new wet look shows at pack time). The marquee's light and shadow baked into the wall and floor pictures is **not** in
  this pack; it needs the folded design plus page work (a later job).
- **Point 5 (claw machine behind the glass) is not in this pack:** it is fixed when `out10p` is solved again for one
  glass layer (Brief 94's solver has the switch) together with the page drawing the right glass once.
- Points 1, 2, 3, 4 and the baked page items of point 7 are in.

### How it fits the helper (nothing in `cloud/` was changed)

`pipeline.py`, `render67.py`, `camera_path.json` (`total_frames` 502), `bundle-manifest.json`, `BUNDLE-SHA256SUMS`
are the names the helper and its worker (`cloud/multi_blender.py`) use. One helper "frame" = one item. The result
archive follows the helper's collection check: `out10/frames.json` (item list, product hashes), `out10/frames/`
(small previews; `peek` shows them), `out10/products.tar` (all products and receipts), and two things that exist
only for that check: `out10/depth_pngs.tar.gz` (2 x 2 placeholders) and `out10/helper-contract-clip.webm` (the live
rain loop; the check wants exactly one VP9 file). Not supported: `FLY_MODE=draft` and the helper's fly-through smoke
selection (frames 1, 185, ... 1101); test with `FRAMES=a-b`. `bash run.sh full|smoke|preflight` is the single-machine
entry, as in earlier bundles.

Commands for Claude, from `roxy3d/` in Git Bash, **only with the owner's spend approval**; neither was run.

One-pod test at full quality, the eight canary items (about 5 minutes of rendering after start-up):

```bash
PODS=1 WORKERS=auto MAX_WORKERS=4 FRAMES=1-8 FLY_MODE=final CHUNK=1 \
MAX_HOURS=0.4 BOOT_MIN=10 ESTIMATE_HOURS=0.4 \
ARCHIVE="$PWD/rerender95/roxy-cloud-bundle-95.tar.gz" \
MULTI_STATE="$PWD/cloud/cloud-state-95-test.json" \
OUTDIR="$PWD/rerender95/result95-test" \
bash cloud/cloud-render.sh multi
```

Five-pod final:

```bash
PODS=5 WORKERS=auto MAX_WORKERS=4 FRAMES= FLY_MODE=final CHUNK=4 \
MAX_HOURS=1.5 BOOT_MIN=10 ESTIMATE_HOURS=0.75 \
ARCHIVE="$PWD/rerender95/roxy-cloud-bundle-95.tar.gz" \
MULTI_STATE="$PWD/cloud/cloud-state-95-final.json" \
OUTDIR="$PWD/rerender95/result95" \
bash cloud/cloud-render.sh multi
```

Then the pack, at home, no GPU (about 10-20 minutes, mostly the three VP9 encodes; `roxy3d/out10r` must not exist):

```bash
../tools/blender-5.2.3-windows-x64/blender.exe -b --factory-startup --python-exit-code 1 \
  --python rerender95/pack95.py -- rerender95/result95
```

`pack95.py` checks every product hash, seeds `out10r/` with a copy of the live pack (so vehicles, umbrellas, cat,
janitor, items and interior prop loops stay byte for byte), builds base, lit, dry and the light-loop frames (asserting
the loop is the exact complement of the base), the occluders with their slices and wet loops, door sheets, restroom
light, the eight mist maps (at the pack root; test with `?artdir=out10r&mistdir=out10r`), full stills, ad overlays
and the three videos, then writes `manifest.json` (with `brief95.page_must`), `validation.json` and `checksums.json`.
It refuses a result that is not the complete, full-quality job.

### GPU time per item at production settings (RTX 4090; from the Brief 56 run's measured times, not a new benchmark)

| Item | Count | Seconds each | Note |
|---|---:|---:|---|
| Background phase, dry fallback | 50 | 60-85 | 58 s measured for the capture; + two glare displays; + the wetter surfaces |
| Rain frame | 49 | 15-20 | 15.2 s measured |
| Occluder capture | 352 | 11-15 | 10.7-14 s measured |
| Door pose | 48 | 9-12 | 9 s measured |
| Restroom light state | 2 | 13-16 | |
| Mist (both passes) | 1 | 60-100 | 99 s for the stage in Brief 56 |

Sum: **about 2.5-3.3 GPU-hours** on one 4090 worker; the wetter look's extra cost (+10-30%, my estimate) is only
measured by the one-pod test. With five pods and several workers per GPU: roughly 35-50 minutes of wall time
including start-up. About $4-7 at the rates of the earlier runs (not a current quote).

### Local smoke (RTX 3050, one Blender job at a time, no other Blender running)

Run through the helper's real worker (`cloud/multi_blender.py`: queue, claims, receipts, finalize) with
`FRAMES=1-8` and `B95_SMOKE=1` (8 samples; same 4K grid): `rerender95/smoke95.ps1`.

| Item | Render s | Whole item s |
|---|---:|---:|
| 1 background phase 0 | 26.1 | 40.3 |
| 2 rain frame 0 | 8.3 | 14.9 |
| 3 podium (unchanged, static) | 5.3 | 10.6 |
| 4 restroom_entry_wall (wall top, with positions) | 5.4 | 12.0 |
| 5 bridge_board (new group, with positions) | 5.5 | 10.8 |
| 6 door screen_1, pose 0 | 5.6 | 12.3 |
| 7 restroom light "occupied" | 5.4 | 11.2 |
| 8 mist, both passes (its own 16 and 32 samples) | 115.5 | 115.7 |

232 s for the run; exit 0; result archive 23.9 MB. The helper's own `verify_unpack` accepts the archive and unpacks
it. I looked at the background product: no marquee, poster or props, the gate at the head of the alley, the wet
look, the baked items, occluders held out. The run was done three times: the first stopped in the mist item (it
needs its visibility list beside it; fixed, and the two passes made one item), the second passed, the third is the
final build (with the buffer clean-up) and is the one reported.

**Home step on the smoke result** (`pack95.py --partial`, 11 s): `podium` rebuilt with the live alpha;
`restroom_entry_wall` got its alpha from the render, **1,439 more 1x pixels than the live picture: the wall top**
(I looked at the picture: the top face is in it), cut into 3 slices by the rendered positions; `bridge_board` 2
slices; the eight mist maps copied; 821 checks, no failure.

### Not verified

- A run under Linux and on a pod (no Linux here); several workers sharing one GPU with this scene at 4K (it fits in
  6 GB here with one worker); the wetter look's render time at 256 samples.
- The home step end to end: the background, light-loop, rain, door, video and full-still parts ran only as code
  taken from the live pack's driver; they need the full set of items. The wrap proofs (phase 144 against 0) are
  recorded by the pack step, not gated.
- The mist height map takes its roof list from the Brief 50 inventory: the annex roof is listed 1.2 m longer than
  it now is (a strip nobody sees from the camera).
- The page with the new pack; the layer packs over the new base (by reasoning only).

### What the page must do with `out10r` (also in `manifest.brief95.page_must`)

Load it with `?artdir=out10r&mistdir=out10r`. Switch off `#wetfx` (purple sidewalk light and the four streaks), the
skyline rectangles, the Dogtober poster div, the projector body, the poll screen case and the bridge board's legs,
panel and beacon housings; move the two searchlight beam feet to stage (943.5, 176) and (1052, 230.5); switch off
`walltops` for `restroom_entry_wall` and `front_solid_wall`; treat `bridge_board` as an occluder like the others.
Nothing else in the contract changes. Wet loops missing from the manifest are simply not there to load.

### Files (all in `rerender95/`)

`make_prod_scene95.py` (+ `prod_scene95.json`), `build_bundle95.py` (+ `bundle95.json`), `bundle95/bundle/` (the
bundle's source: `job95.py`, `pipeline.py`, `render67.py`, `run.sh`, `pipe/`, `cache/`, `live/`), `pack95.py`,
`smoke95.ps1`, `smoke95/` (the smoke run: `run/`, `unpacked/`, logs), `progress.log`. `PROGRESS.md` is unchanged
(not in this job's write list). Nothing committed; no live pack, page or existing .blend changed; no cloud.

STATUS: STAGE 3 COMPLETE - BUNDLE rerender95/roxy-cloud-bundle-95.tar.gz (21.7 MiB, 502 ITEMS) FITS THE MULTI-POD HELPER UNCHANGED; EIGHT-ITEM LOCAL SMOKE THROUGH THE HELPER'S WORKER PASSED AND ITS RESULT PASSES THE HELPER'S COLLECTION CHECK; HOME PACK STEP pack95.py WRITTEN AND RUN ON THE SMOKE RESULT (WALL TOP IN THE OCCLUDER PICTURE); MAIN PACK ONLY: MARQUEE, POSTER AND PROPS STAY LAYER PACKS, SO POINT 5 AND THE MARQUEE PART OF POINT 6 ARE NOT IN IT; LINUX, MULTI-WORKER AND THE FULL HOME STEP NOT VERIFIED; NO FULL RENDER STARTED; STOP.
