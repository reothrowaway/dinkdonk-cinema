# Brief 104: lobby lighting pass + bonsai fountain + lighter pack - stage 1, blockout and plan

17 Nov 2026. Render agent: Claude Fable 5.2. Stage 1 only: one blockout image and this plan. No styled draft, no
production render, no cloud, no page, pack or existing .blend touched.

![Blockout: fountain variants A and B, planned light sources](qa10/blockout104.png)

`qa10/blockout104.png` (1280 x 720): the whole fixed lobby camera in the Workbench clay look, the fountain as plain
cylinders in two variants (cyan **A**, orange **B**; dark = bowl, light tint = rock and tree, brown = plinth), flat
markers for the planned light sources, an enlarged panel of the snack bar's east end (lower left), a key (upper left)
and the two sizes (lower right). The street marquee is shown see-through so the floor behind the entrance can be read.
Nothing of the lobby is moved. I looked at the final image.

## Short answer

- **Snack bar:** counter u 5.6-11.6, v 4.0-4.61 (with its staff aisle and back bar: u 4.4-13.0, v 2.9-4.61).
- **A (recommended):** the fountain as built (28 cm bowl, 32.5 cm tall) on the lid of the glass candy case at the
  counter's east end, at (11.15, 4.30), 0.925 m up. **26 x 36 px at 1x stage** (bowl 24 px wide, 24 px rise): a
  handful of pixels. Fully visible, hides nothing, no page change.
- **B:** scaled x2.14 to a 60 cm bowl on a 45 cm plinth, 1.15 m to the tree top, on the floor at (12.45, 5.62) between
  the counter's east end, the standee and the bench. **55 x 109 px at 1x stage** (bowl 51 px, rise 84 px). Nothing in
  `out10s/manifest.json` is blocked, but there is no free floor by the snack bar: B stands on the dancers' way to the
  jukebox (a page route), hides about half of standee 1 and a chatter at one talk place.
- **Lighting:** the seven broad ceiling fills are the reason the interior is even (lobby floor median 68/255, only 2x
  between its dark and bright tenth; the restroom 2.5x). Plan: fills down to a faint ambient, 14 pools (6 exist), the
  snack bar as the brightest spot, neon and signs carrying the rest. The restroom's lights have their own receiver
  list and are not touched.
- **Lighter pack:** all 54 wet loops go (together they hold 16 pixels brighter than 8/255), the marquee's 188 light
  and shadow pieces, 5 poster and 4 prop light pieces are rendered into the scene pictures: about **250 blended
  pieces fewer** on the page.
- **Stage 3 estimate:** about 190 items, 1.5-2.3 GPU-hours on an RTX 4090 class card, about $2-4.

## What I found

### The snack bar (units: (u, v) tiles = m, z in m; scene `rerender96/lobby_draft34.blend`)

| What | u | v | z | Note |
|---|---|---|---|---|
| Counter (occluder `snack`) | 5.6-11.6 | 4.0-4.61 | top 0.599 | granite top; candy display in its front; pink edge strip |
| Candy case on the counter | 10.84-11.45 | 4.08-4.51 | 0.599-0.925 | glass case with a solid lid, 0.61 x 0.43 m |
| On the counter top | | | | napkins 5.79-6.02, straws 6.08-6.22, registers 6.39-6.81 / 7.99-8.41 / 9.59-10.01, cups 7.12-7.44, tip jar 8.57-8.73, popcorn tubs 10.24-10.46 |
| Staff aisle | 5.6-11.6 | 3.5-4.0 | | clerks at (6.6 / 8.2 / 9.8, 3.75) |
| Back wall with back bar (occluder `partition_right`) | 4.4-13.0 | 2.9-3.5 | wall top 1.22 | poppers, soda fountain, hot-dog grill, nacho warmer, three menu boards, TV at u 5.34-5.96 |
| Jukebox (props pack) | 11.68-12.18 | 3.4-3.88 | 0.93 | against the back wall, east of the counter |
| Palm | pot 12.3-12.8 | 3.4-3.9 | fronds to 1.52 | |
| Standee 1 | 12.15-12.67 | 4.92-5.14 | 1.25 | |
| Bench | 11.2-12.6 | 6.0-6.4 | 0.38 | |

Scale note: heights in this scene are squat. A chatter is 28 x 50 px = 0.68 m, the counter top is 0.6 m, the jukebox
0.93 m, the claw machine 1.25 m. So A (0.33 m) is half a chatter tall and B (1.15 m) is 1.7 chatters tall, nearly as
tall as the claw machine.

### The free floor around it

Held by the art pack (`out10s/manifest.json`, `out10ps/props.json`): snack customers at (6.6 / 8.2 / 9.8, 5.05),
clerks, ticket queue, wet-floor sign (10.2, 6.4), claw way in (12.95, 7.0)-(12.95, 8.5), four jukebox dance spots
(11.97, 4.14), (12.36, 4.26), (12.76, 4.5), (12.93, 4.18).
Held by the page only (`../lobby.html`, read on 17 Nov 2026): snack lines up to three deep (v 5.05-6.25), the walk
back from a register to (5.4, 5.2), talk spot (11.0, 5.35) with places 0.42 m round it, the dancers' way
(11.9, 5.65) -> (12.92, 5.65) -> east spots and (11.9, 5.65) -> (11.9, 4.85) -> west spots, cat spot (11.9, 4.35)
with its route down u 11.9 and along v 5.6, janitor spot (11.9, 5.6), gnome spots (12.6, 4.35), (10.6, 5.6).

- **West end** (podium, usher, gate, TV): full.
- **In front of the counter** (v 4.6-6.3): register lines, the walk back along v 5.05-5.2, the talk spot. A 0.6 m bowl
  fits only where the talk spot is.
- **East end** (u 11.6-13.0, v 3.9-4.9): the dance floor in front of the jukebox and the cat's spot.
- **Between counter end, standee and bench** (u 12.1-12.9, v 5.15-6.0): crossed by one line only, the dancers' east
  leg along v 5.65. This is where B stands.
- **On the counter top:** free stretches at u 6.81-7.12, 7.44-7.99, 8.73-9.59, 10.01-10.24, 10.46-10.84 (0.6 m deep).
  The two wide ones sit right above a waiting customer's name tag (a customer at register r covers the counter at
  u = r - 0.72); the one beside the candy case is half hidden by the case. The case's lid is clear of all of that.

### The two options (ray casts against the scene, `lobby104/blockout104_geom.json`)

| | A: tabletop size on the candy case | B: floor-standing by the counter's east end |
|---|---|---|
| Place | (11.15, 4.30), base at 0.925 m; lid free round the bowl 0.17 / 0.16 / 0.08 / 0.07 m | (12.45, 5.62) on the floor |
| Size | bowl 0.28 m, top 0.325 m above the lid (1.25 m above the floor) | bowl 0.60 m (x2.143), plinth 0.50 x 0.45 m, top 1.146 m |
| Stage px at 1x | box 26 x 36 (x 1298-1324, y 715-752); bowl 24 wide, rise 24; in the 1280 picture 17 x 24 | box 55 x 109 (x 1283-1337, y 794-903); bowl 51 wide, rise 84; in the 1280 picture 36 x 72 |
| Seen by the camera | 100% clear | 93% clear, 7% behind the bench's east end |
| What it covers | the case's lid, the lower part of the nacho warmer on the back bar | carpet (58%), standee 1 (about 18% of B's box: the standee's left half), the counter's lower east corner (about 19%) |
| Chatters hidden by it | none at any spot or route measured | talk place (11.42, 4.93): 0% -> 84%; janitor at (11.9, 5.6): 5% -> 68%; dancers' west leg: 27% -> 76% on average; cat route: 9% -> 28% |
| Routes and spots | none touched | the dancers' east leg runs through the bowl (0.27 m inside); 0.25 m to the janitor / cat corner; 0.18 m to the standee, 0.08 m to the bench; no spot or route of the art packs closer than 0.86 m |
| Page work | none: A is part of the `snack` picture, nobody ever stands behind it | new depth piece `fountain`; `goDance` sends the two east dancers the west way (behind the standee) or the leg moves; optional small water loop |
| Reads as | a small blue-lit accent on the snack bar; detail only when the director zooms in (48 x 72 px in the 2x art) | a landmark, taller than every chatter |

Pros of A: the approved piece at its real size, on the snack bar itself, nothing hidden, nothing to change for
walkers, its blue glow lights the dark east end of the counter. Con: small.
Pros of B: clearly visible at 1x. Cons: no clean place (above), hides the standee and people behind it, looks
oversized against 0.68 m chatters, one more depth piece, and at x2.14 the approved model's fine detail (needles,
foam beads) is shown larger than it was approved.

Looked at and dropped for B (measured, not in the image): in front of the counter at (11.25, 4.97): hides no route
of the manifest and no walker behind it, but covers 24% candy display plus counter top and case, and takes the talk
spot's place; in front of the jukebox or palm: the dance floor, and it would hide the jukebox.

**Recommended: A.** Open detail for the draft, not a third variant: if A reads too small, the lid takes a bowl up
to 0.40 m (x1.43, 34 px wide) without any other change.

## The lighting today, measured

Floor brightness in `out10s/lit_bg.png` (luma 0-255, floor points on a 5 cm grid):

| Floor | Mean | Dark tenth | Bright tenth | Ratio |
|---|---:|---:|---:|---:|
| Lobby (u 5-12.8, v 4.8-8.8) | 67 | 45 | 93 | 2.1 |
| Strip in front of the snack bar | 87 | 65 | 105 | 1.6 |
| Corridor (v 0.3-1.4) | 74 | 56 | 91 | 1.6 |
| Restroom | 57 | 31 | 77 | 2.5 |
| Sidewalk in front of the glass | 33 | 20 | 47 | 2.4 |

About 40 lights lie over the cinema's footprint. Seven broad area lights at ceiling height carry the even wash, all linked
to the receiver list "D12 unchanged cinema receivers outside restroom":

| Light | Now | Plan (start value, tuned on coarse previews) |
|---|---:|---:|
| Large soft cinema key (8 m, blue-violet) | 266 W | about 40 W |
| P10 auditorium facade fill (7 m) | 200 W | about 35 W |
| Corridor right fill (6 m, blue) | 125 W | about 25 W |
| Corridor left blue fill (4 m) | 100 W | about 25 W |
| D12 retained D11 ceiling contribution | 100 W | about 20 W |
| Warm lobby pool (4.5 m) | 99 W | about 25 W |
| Concession warm ceiling bounce (3 m) | 78 W | about 45 W |

The restroom has its own light ("P10 restroom soft ceiling", 44 W, receiver list "D12 restroom warm light
receivers"): untouched. Local lights that already make pools: six spots "Pass4 action pool" (78-90 W) at the gate,
the two ticket windows and the three registers; two corridor and two junction sconces; popper lamps; the jukebox's
pink floor spill; claw showcase light.

### Planned light sources (the markers in the blockout)

Target: lobby floor outside the pools at about the sidewalk's level (median 35-40 instead of 68), pools and the
snack bar strip at today's 90-105, so the ratio goes from 2 to about 4-5. Final count and strengths are tuned in the
draft; the blockout shows the candidates.

| Marker | What | State |
|---|---|---|
| 1-6 | pools at the usher gate (3.7, 3.7), ticket windows (4.85, 6.0), (4.85, 7.4), registers (6.6 / 8.2 / 9.8, 5.05) | exist, kept |
| 7 | entrance, inside the doors (9.5, 8.35) | new |
| 8 | ticket line, middle of the rope lane (7.2, 7.4) | new |
| 9 | talk spot by the bench (10.8, 7.2) | new |
| 10-12 | in front of the three screen doors (4.8 / 8.2 / 11.2, 0.8) | new |
| 13 | corridor junction (1.4, 1.4) | new |
| 14 | narrow accent on the fountain (A or B) | new |
| S1 | three backlit menu boards, a wash down onto the back bar | boards exist; wash new |
| S2 | poppers, soda fountain, hot-dog grill, nacho warmer: warm task light | lamps exist, raised |
| S3 | candy display in the counter front (new cool strip inside), pink counter edge, candy case: glow onto the floor | edge exists; strip new |
| a, b, c | pink perimeter neon and cyan low tube in the corridor, pink junction neon | exist |
| d | base strips: cyan on the box-office wall, pink on the snack bar wall | exist, raised |
| e | TICKETS amber lightboard and the desk's cyan edge | exist, raised |
| f | warm bulb frames round the three posters | page chase stays; small warm spill lights new |
| g | amber LED signs over the doors | page text stays; faint amber spill new |
| h | four wall sconces | exist |
| i, j, k | NEXT SHOWING board, green EXIT sign, WC sign | exist; spill for the board new |
| l, m, n | claw machine, jukebox, TV | exist |
| o, p, q | entrance post lamps, "Dear Leader" picture light, usher podium lamp | exist |

Rules for the pass:
- **Animated emitters keep their strength** (the "Loop neon" tubes a and b, door leaks, popper and menu loops, chase
  bulbs). New brightness comes from steady sources. Then every additive sheet the page plays stays valid and the
  occluders' own loops stay as empty as they are today.
- **Every new light uses an existing receiver list** (the "outside restroom" list), so no direct light reaches the
  restroom and the light-linking count stays at 54.
- The claw machine's lower body stays dark (owner, 12 Nov 2026). The street's own lights are not touched.

## Plan for stages 2-3

**Approvals, three in all:** (1) A or B, now; (2) the styled draft; (3) the go for the full render and the money limit.

### Stage 2 - ONE styled draft (local)

`lobby104/build_draft35.py` copies `rerender96/lobby_draft34.blend` (opened read-only) to
`lobby104/lobby_draft35.blend` and makes, all in a collection `B104`:
- the lighting pass above;
- the fountain: collection `FOUNTAIN` appended from `fountain/fountain103.blend` (read-only), placed by its root,
  front toward the camera, look unchanged; A at scale 1 on the candy case, or B at x2.143 on a new plain cast-stone
  plinth (its blue LED and basin glow scaled with the area); its objects join the same receiver lists as the object
  they stand on;
- nothing else: marquee, poster, jukebox and TV are in this scene already.

Deliverable: `qa10/draft35-light-fountain.png`, 1280 x 720, fixed camera, weather frame 0, the settings of drafts
27-34 (256 / 64 samples, threshold 0.01, seed 1701, OptiX denoiser, Blackman-Harris 1.5 px, the scene's glare and AgX
look), marquee sample text and TV sample picture laid on in 2D as before. No insets, no close-ups.
Before it goes to the owner: light-linking count (`rerender96/linkcount96.py`, at most 60, no warning line in the
log); region check against `qa10/draft34-check.png` (restroom: mean under 0.5/255, 99th percentile under 3; street
and roofs: within noise except where the wet ground mirrors the lobby); the second-opinion critique (Opus 5.5).
Time on the local RTX 3050: about 65-80 s per final still plus 8 s weather (draft 34: 63 s + 7 s); about ten coarse
tuning passes at 36 s each, outside the project, deleted. About 10-15 minutes of GPU in all.

### Stage 3 - the full pack (only on the owner's word)

A new pack folder (say `out10t/`, tested with `?artdir=out10t&mistdir=out10t`), built like Brief 96: frozen
production scene, bundle for the multi-pod helper, eight to thirteen canary items first, pack step at home.

**Rendered again**

| Pictures | Items | Why |
|---|---:|---|
| `base` / `bg`, `lit_bg`, `lit_bg_dry`, `full`, both `light_loop` videos | 50 (48 phases, wrap proof, dry) | the interior light is in every one; base and loop are made from the same 48 phases |
| All 40 occluders with their slices, plus `jukebox` (new piece) and `fountain` (B only) | about 60 captures | 29 indoor pieces, one capture each; 9 outdoor wet pieces at three phases (their minimum, so no rain glint is frozen), 2 outdoor static; outdoor ones are needed because the marquee's light and shadow go into them |
| Door sheets: three screen doors and the restroom entry | 64 poses | they show the corridor |
| Restroom light states (`wc_vacant`, `wc_occupied`) | 2 | corridor side |
| Mist maps (catch, height, rim, light) | 1 | read the scene's light |
| Animated light pieces, solved again under the new light: claw chase (4), jukebox tubes (3), TV glow (1), marquee chase (60 sheets from 4 groups) | 3 | additive pieces are solved after the display transform, so they depend on what lies under them |
| Wet-floor sign sprite | 1 | it stands in the lobby's light |
| Optional, B only: a small water loop of the falls (one additive sheet, 48 cells) | 1 | A is too small to need it |

About **190 items** (Brief 96 had 316, Brief 95 had 502). The big drop is in the occluder captures: without wet loops
a piece needs one capture instead of 25.

**Carried over byte-identical from `out10s`** (not rendered): vehicles with lamp variants and tyre spray, umbrellas,
cat, janitor, items (popcorn, soda, Buddy, clipboard), rain frames and `rain_fg.webm`, steam and splash sheets, police
bar, street-state patches, ad overlays, popcorn, soda-logo, TICKETS-letter and poster-bulb loops (their emitters do
not change), the marquee's 24 body slices (after one probe capture agrees within 2/255). Checked at pack time and
carried over if they agree within 2/255, otherwise the new render is used: the four stall door sheets and the pieces
that lie wholly inside the restroom (stalls 1-4, sinks, dryer).

**Point 6: how the pack gets lighter**

| Today | Pieces | In the new pack |
|---|---:|---|
| Wet loops (`wet_*` in `prop_loops`) | 54 | 0. Measured today (`qa-night/tools/loopstats.mjs`, 1x): 10 never pass 2/255, 38 more never pass 8/255; over all 54, 16 pixels ever pass 8/255 (brightest: `wet_entrance_header_01` 117/255 on 6 px, `wet_glass_right_02` 96/255 on 4 px). The smoke test renders phases 0 and 12 of the four indoor parents under the new light; if more than a few pixels pass 8/255, that parent keeps one merged sheet. |
| Marquee light and shadow (`out10m/merged2`) | 188 (97 shadow, 89 light, 2 under the walkers; the page loads about 182) | 0. The marquee is in the scene for every capture as a caster the camera does not see, bulbs at their 0.35 base as in Brief 83; its body slices and chase sheets stay layers. |
| "Dear Leader" poster (`out10l`) | 5 light and shadow + body | light and shadow in the scene pictures; the body stays one piece if the page keeps `?leader=0`, else it is rendered into the wall too. |
| Jukebox and TV (`out10ps`) | 10 | 4 animated ones stay (two pink tube pieces, teal tube, TV glow). The jukebox becomes a depth piece of the main pack like the claw machine; the TV body is part of the back wall picture. |

About 250 blended pieces fewer (54 + 188 + 5 + 4). The perf session measured 0.21 core (about 19% at 30 fps) for the
first two rows. Not folded: the marquee's 60 chase sheets (they animate); merging them per parent picture is a
further page-side lever, not measured.

**The page contract changes. What the page must do** (lobby session, in `lobby-qa.html` first):
- load the new pack and its smaller props pack; do not load `out10m/merged*.json` light and shadow pieces, the
  `out10l` light and shadow pieces, or the jukebox / TV light and shadow pieces when the manifest says they are baked
  (`brief104.baked`); keep bodies, chase and tube pieces;
- `jukebox` is an ordinary occluder with slices, its tubes are plus-lighter layers just above it (as the claw's chase
  layers since Brief 96);
- `?marquee=0`, `?leader=0` and `?props=0` can still hide bodies and animated light, but the baked light and shadow
  stay in the picture: a decision for the owner or the lobby session (the only alternative is to keep those pieces
  and lose the saving);
- wet loops missing from the manifest are simply not there to load;
- fountain A: nothing. Fountain B: occluder `fountain` (footprint u 12.15-12.75, v 5.32-5.92, 84 px), the dancers'
  east leg changed, the optional water loop;
- to check with real chat: the nine chatter looks (`lookAt`) and the page-drawn glows (door glow, LED signs,
  projector beam, auras) were tuned for the bright lobby and may need a touch.

**Layer packs under the new light:** `out10m`: body carried over, light and shadow replaced by the scene render,
chase solved again. `out10l`: solved again inside the scene render. `out10ps`: solved again (smaller). `out10p` is not
loaded since Brief 96 and is not touched. None of the old light pieces can stay as they are: additive light solved
over the bright base comes out too weak over a darker one, and their shadows are ratios against the old light.

### Estimates

GPU time at production settings on an RTX 4090 class card (from the measured times of Briefs 56, 94, 95 and 96, not a
new benchmark):

| Item | Count | Seconds each |
|---|---:|---:|
| Background phase, dry fallback | 50 | 60-85, plus up to 20% for the marquee and the new lights being on |
| Occluder capture | about 60 | 11-15 |
| Door pose | 64 | 9-12 |
| Restroom light, mist, three chase / tube items, sign, water loop | 9 | 15-340 |
| Probe, once per worker process | 10-20 | about 10 |

Sum: **about 1.5-2.3 GPU-hours** on one 4090 worker. With five pods and several workers per GPU (Brief 77 runner)
about 30-45 minutes of wall time including start-up. **About $2-4** including the canary test run, at the rates of
the Brief 95 and 96 runs (not a current quote; the owner names the limit). Local RTX 3050 instead: 7.3x slower on
backgrounds, 5-6x on crops: about 8-11 hours, resumable per item, no OBS or perf work on the PC meanwhile.
Home pack step: 10-20 minutes, no GPU (two VP9 encodes).

## Risks

- **The light loop is the exact complement of the base.** All 48 phases and the dry fallback are rendered together
  under the new light; nothing of the old base or loop can be mixed in. The pack step asserts it as in Brief 96.
- **Light-linking limit (64 combinations; the scene needs 54, the gate is 60).** New lights reuse existing receiver
  lists and the fountain's objects copy the memberships of the object they stand on, so the count should not move;
  `linkcount96.py` is run on the draft scene, the bundle builder refuses a scene over 60, a worker stops on the
  warning line, and each worker renders the probe crop before its first item.
- **The restroom must not change.** No new light lists the restroom; bounce light can still reach it over the cut
  walls. Gate: the region check on the draft. Fallback: the restroom's pixels and pieces are carried over from the
  live pack by the world-position masks.
- **"The street stays as it is"** holds for its lights and materials, but the wet sidewalk and the glass mirror the
  lobby, so those reflections get darker with it, and pixels far from the lobby move by sampling noise (new lights
  change the light sampling). Gate at pack time: outside the cinema, mean difference to `out10s` under 1/255, 99th
  percentile under 4, else stop. Fallback if the owner wants the street pixel-equal: keep outdoor pixels of all
  phases from the Brief 96 products through a mask (the seam runs along the storefront and wall tops; not built).
- **The fountain's water and glass at 4K:** thin glass falls, refracting water and an emitter under glass on a prop
  that is 48 x 72 px in the 2x art (A) invite fireflies and denoiser smear. It belongs to an occluder picture, so
  it cannot flicker in the loop. Guard: one native 4K probe crop in the smoke test; if it is dirty, the falls
  become a plain transparent-plus-glow material (same look at this size).
- **Occluders without loops under more neon.** If the pass leaned on the pulsing tubes, the pieces would stand still
  in a pulsing room; the rule above (animated emitters keep their strength) and the two-phase smoke check cover it.
- **Darker lobby, same chatters.** The page lights chatters itself; between the pools they may read too bright or too
  flat. A real-chat check by the lobby session, not something the render can fix.
- **Baked marquee, poster and prop light** takes the three "off" switches' full effect away (above).
- **B only:** covers the standee and people behind it; the model is shown at 2.1 times the approved size.
- Cost and loss on the cloud as in the earlier runs: credit named first, canary items first, pods deleted after.

## Files and runs

`lobby104/`: `build_blockout104.py` (layout, ray casts, one Workbench frame; `--analyze` measures only, `--b-at u/v`
measures B elsewhere), `annotate104.ps1` (composes the one image, deletes the temp frame), `run104.ps1` (runner:
background mode only, refuses to start beside another Blender or Godot), `blockout104.blend` (collection "B104": five
cylinders; collection "B104 light markers": 59 empties at the planned sources), `blockout104_geom.json`,
`annot104.json`, `run_report.json`, `inspect104.py` -> `inspection104.json` (every light, emitter and object near the
snack bar), logs, and the two reference screenshots that were there.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File lobby104/run104.ps1 -ExtraArgs "--raw,<temp folder outside the project>"
```

Workbench only: 3 s for the frame, 11 s per run. Blender ran seven times in background mode, one at a time, `tasklist`
checked before each (no other Blender or Godot was running): one read-only survey, four measure-only runs (three of
them trial places for B), two that rendered; only the last image exists. The temp frame and my inspection previews
were outside the project and are deleted. Two read-only measurements without Blender: `loopstats.mjs` on `out10s`
and the floor brightness table. No Cycles, no cloud, no Godot.
`rerender96/lobby_draft34.blend`, `fountain/fountain103.blend`, `out10s/manifest.json` and `out10ps/props.json` hash
the same before and after. `PROGRESS.md` is not in the write list and is unchanged. Nothing committed.

Not checked: the fountain model inside the lobby scene (stage 2); how it looks under the lobby's light; the page
with any of this; the per-item times with the marquee and the new lights on (known after the canary items).

STATUS: STAGE 1 COMPLETE - ONE BLOCKOUT IMAGE qa10/blockout104.png (FOUNTAIN VARIANTS A AND B BY THE SNACK BAR, 14 POOL MARKERS, SNACK BAR AND NEON / SIGN MARKERS) AND THE PLAN FOR STAGES 2-3 DELIVERED; RECOMMENDED: A (TABLETOP SIZE ON THE CANDY CASE, 26 x 36 PX AT 1X); B (55 x 109 PX) HAS NO FREE FLOOR BY THE SNACK BAR WITHOUT A PAGE ROUTE CHANGE; STAGE 3 ABOUT 190 ITEMS, 1.5-2.3 GPU-HOURS, ABOUT $2-4; NO STYLED DRAFT, NO PRODUCTION RENDER, NO CLOUD, NO LIVE PACK, PAGE OR EXISTING BLEND CHANGED; WAITING FOR THE OWNER'S CHOICE A OR B; STOP.

---

# Stage 2 (Brief 104b, 17 Nov 2026): the lighting pass and fountain A, styled draft 35

Render agent: Claude Fable 5.2. Owner on the blockout: "A, on the counter". One styled draft still, the checks, this
section. No production render, no cloud, no page, pack, earlier draft or existing .blend touched.

![Draft 35: lighting pass and the bonsai fountain on the candy case](qa10/draft35-light-fountain.png)

`qa10/draft35-light-fountain.png` (1280 x 720, fixed camera, weather frame 0, settings of drafts 27-34). Scene:
`lobby104/lobby_draft35.blend`, built by `lobby104/build_draft35.py` from `rerender96/lobby_draft34.blend`. I looked at
the final image.

## Short answer

- **Darker, with contrast:** the lobby floor between the pools went from 46 to 27 (median luma, 0-255), the pool
  centres are at 81-121 (were 83-96; the junction 62, was 56), the lobby floor's bright tenth to dark tenth went from 2.3x to 4.5x, the
  corridor from 1.6x to 2.2x. The strip in front of the snack bar is the brightest floor (mean 81 -> 86).
- **Fountain:** variant A on the candy case at (11.15, 4.30), **with the 0.40 m bowl (x1.43), not the built 0.28 m**.
  At the built size it was 17 x 24 px here and read as a small potted plant. Now 42 x 44 px with the tree's spread
  (bowl about 23 px wide, 0.46 m tall). Materials and its blue LED unchanged.
- **Render time:** 65.0 s + 7.8 s weather = 72.8 s on the RTX 3050 (whole run with build and checks 95 s).
- **Checks:** light linking 57 combinations (limit 64, gate 60), no warning line. Restroom against draft 34: mean
  0.95, 99th percentile 5: **over the stage 1 gate (0.5 / 3)**, at the level of the untouched street (0.74 / 5.9).
  Street and roofs: mean 0.68, 99th percentile 6.

## What changed in the light

| What | Before | Now |
|---|---|---|
| Large soft cinema key | 266 W | 50 W for the interior |
| P10 auditorium facade fill | 200 W | 35 W for the interior |
| Corridor right fill | 125 W | 25 W for the interior |
| Warm lobby pool | 99 W | 25 W for the interior |
| Concession warm ceiling bounce | 78 W | 45 W for the interior |
| Corridor left blue fill, D12 retained D11 ceiling contribution (both hang over the restroom) | 100 W each | **kept at 100 W** (plan: 25 / 20 W) |
| Six existing pools (gate, two ticket windows, three registers) | 78-90 W | 140-162 W (x1.8; plan: kept) |
| New pools 7 entrance, 8 ticket line, 9 talk spot | | 115 / 105 / 105 W, warm spots like the existing ones |
| New pools 10-12 in front of the screen doors, 13 junction | | 80 W each, 45 W |
| Snack bar: pendant strip over the counter (5.6 m) | | 80 W warm |
| Snack bar: wash under the three menu boards (S1) | | 10 W each |
| Snack bar: task lights on soda fountain, grill, nacho warmer (S2) | | 3 W each |
| Snack bar: cool strip inside the candy display, pink counter edge glow on the floor (S3) | | 12 W, 10 W |
| Four steady base strips and edgings (cyan box-office wall, pink back wall, counter edge, ticket desk edge) | emission 0.36 / 0.45 | x3 (1.08 / 1.35), plus spills of 5 / 6 / 4 W |
| TICKETS lightboard, three poster frames, three LED signs | | spills of 6 W, 2.5 W each, 1.5 W each |
| Accent on the fountain (marker 14) | | 30 W narrow spot from the camera's side |

27 new lights, 814 W, all on the existing "outside restroom" receiver list; five faint fill copies on a new list
(below). Restroom lights, street lights, neon tubes, door leaks, popper lamps, menu paper, chase bulbs and every
other animated emitter: not touched.

Floor brightness, draft 34 -> draft 35 (luma 0-255, floor pixels by world position):

| Floor | Mean | Median | Dark tenth | Bright tenth | Ratio |
|---|---|---|---|---|---|
| Lobby (u 5-12.8, v 4.8-8.8) | 70.7 -> 63.8 | 74.9 -> 59.4 | 41.4 -> 24.2 | 95.4 -> 107.7 | 2.3 -> 4.45 |
| Strip in front of the snack bar | 80.7 -> 86.2 | 82.9 -> 89.3 | 61.2 -> 53.8 | 96.6 -> 115.4 | 1.58 -> 2.14 |
| Lobby away from the pools | 44.5 -> 28.3 | 45.8 -> 27.0 | | | |
| Corridor | 75.0 -> 60.0 | 75.2 -> 54.6 | 56.3 -> 40.1 | 92.3 -> 88.4 | 1.64 -> 2.2 |
| Restroom | 47.0 -> 46.7 | 47.4 -> 47.2 | 28.9 -> 28.9 | 62.6 -> 62.4 | |
| Sidewalk in front of the glass | 111.1 -> 110.9 | 112.7 -> 112.2 | 36.5 -> 36.2 | 181.9 -> 182.0 | |

Pool centres (mean within 0.35 m): gate 83 -> 81, registers 93 -> 104 / 121 / 106, entrance 86 -> 92, screen doors
87 / 96 / 85 -> 90 / 92 / 88, junction 56 -> 62.

## Three things the previews showed, and what I did

1. **The fills also light the street side.** The marquee's top (its sheen is the key light's reflection), the front
   and alley faces, the bus stop and the sidewalk are on the same receiver list as the interior. With the fills
   simply turned down, the marquee's top lost 13-22 luma. Fix: the "outside restroom" list is split in two new
   lists. "B104 street side keeps the old fill" (375 objects: marquee 180, glass fronts 52, bus stop 39, front wall,
   entrance, 84 others) keeps the five fill lights unchanged; "B104 interior gets the faint fill" (2,373 objects)
   gets faint copies of them. After that the marquee's top differs by 0.0. This costs three light-linking
   combinations: **57 instead of 54**. My stage 1 rule "every new light uses an existing list" does not hold for
   these five copies.
2. **Two lights in the same place lose light to each other.** First try was a second light with the missing watts
   at each fill's place for the street side. Measured: 133 W + 133 W in one place lit far less than one 266 W light
   (lobby floor 40.8 against 45.9). A reflected ray finds only one of two lights that lie in one plane. So no object
   may receive two lights from the same place; the split lists make sure of that. This matters for stage 3 too.
3. **The restroom gets bounce light from the fills above it.** With all seven fills down, the restroom lost about 2%
   (mean luma -0.9). With the two fills that hang over it kept at 100 W the loss is -0.2. The price: the west
   corridor, the junction and the box-office side keep today's soft fill.

## Fountain

`fountain/fountain103.blend`, collection FOUNTAIN, appended (file read-only, hash unchanged). Root at (11.15, 4.30)
on the lid of `P10 candy case lid` (0.925 m), turned 21 degrees so the lobby camera sees the side draft 103 showed,
scale 1.43: bowl 0.40 m, 0.46 m tall, top at 1.39 m. The bowl stands inside the lid (0.61 x 0.43 m); the tree's
spread overhangs it. Ten meshes and the LED, group `snack`, on the receiver lists of the lid. Its LED's watts are
scaled with the area so the glow on the prop is the same. Draft box x 853-895, y 464-508. The waterfall itself is
not readable at this size; tree, rocks and the blue basin are.

## Checks

| Check | Result | Gate |
|---|---|---|
| Light-linking combinations (`rerender96/linkcount96.py` on `lobby_draft35.blend`) | 57, 25 lists | at most 60 (limit 64): met |
| "Maximum number of light linking sets" in `draft35.log`, `linkcount35.log` | 0 lines | none: met |
| Restroom against `qa10/draft34-check.png` (35,723 px) | mean 0.95, p99 5, max 31; mean luma -0.20 | mean under 0.5, p99 under 3: **not met** |
| Street and buildings (259,113 px) | mean 0.74, p99 5.9, max 35 | within noise |
| Roofs and everything above 2.3 m (342,965 px) | mean 0.63, p99 6, max 78 | within noise, one line (below) |
| Street and roofs together | mean 0.68, p99 6; mean luma -0.10 | |
| Wet ground beside the cinema (53,559 px) | mean 1.82, p99 13 | mirrors the lobby: expected |
| Read-only inputs (draft 34 scene, fountain file, draft 34 image, both manifests) | hashes equal before and after | met |

Unit: largest channel difference per pixel, 0-255. Regions come from one ray per pixel against the scene
(`lobby104/regions35.npz`).

Reading them: street more than 3 m from the cinema, which nothing here can reach, shows mean 0.49 and p99 3 from
sampling noise alone (new lights change which samples are drawn). The restroom's 0.95 / 5 is that noise plus a
real -0.2 of luma (0.5%). The stage 1 gate was set tighter than the noise. The one real difference above 2.3 m is the
top edge of the corridor's back wall above the pink neon (a cut wall's cap, an interior piece): about 5 luma darker.

## What fell short or differs from the plan

- Restroom gate not met (above). I see no change in the picture; the number is what it is.
- Fountain at x1.43, not at the built size.
- Two fills kept at 100 W; six existing pools raised (the plan said kept), because without the fills their centres
  would have dropped.
- Floor between the pools is 27, darker than the 35-40 the plan aimed at. Pools 81-121 (plan 90-105).
- 57 light-linking combinations, not 54.
- No spill for the NEXT SHOWING board: no object by that name found; its own glow is unchanged.
- TICKETS board, menu boards and popper lamps are not raised themselves (the page animates loops over them); they
  got spills or washes instead.
- By the street-side rule (object centre beyond u 12.95 or v 8.95) six palm fronds and one box-office wall piece
  keep the old fill.
- The lobby scene renders with caustics on and exposure 0.25; the fountain was approved with caustics off and
  exposure 0. Its materials are unchanged, so its glow shows about a fifth brighter here.
- 14 coarse tuning frames instead of about ten (34 s each); one of my own Blender jobs stopped by its PID (a region
  pass that was too slow, rewritten).
- Not done by me: the second-opinion critique; any page check; the 2x size; phases other than 0.

## For stage 3 (not started)

- The split lists and the "no two lights in one place" rule go into the production scene as they are.
- The fountain is part of the `snack` picture: no page change. A native 4K probe of it is still to do.
- The marquee's top agrees with today's, so its body slices can still be carried over after the probe.
- Chatters between the pools stand on a floor at 27 instead of 46: the page's own chatter light needs a look with
  real chat.

## Files and runs

`lobby104/`: `build_draft35.py` (build, render, checks; `--test`, `--params`, `--plain`, `--check-only`),
`lobby_draft35.blend`, `build35.json` (every light and value), `render35.json`, `check35.json`, `regions35.npz`,
`draft35.log`, `linkcount35.log`, `test35.log`, `inspect35.py`, `inspect35b.py`, `inspect35c.py` (read-only surveys),
`runtime35/` (copies of the render helpers, caches). Runner: `run104.ps1`, background mode only.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File lobby104/run104.ps1 -Script build_draft35.py -Log draft35.log
```

Blender ran 22 times in background mode, one at a time, `tasklist` checked before each (no other Blender or Godot was
running): 14 coarse tuning frames, 2 starts that failed on a typo before loading anything, 4 read-only surveys, the
link count, the final. About 9 minutes of GPU. Tuning frames, crops and difference maps were outside the project and
are deleted; the linear render buffers are deleted. No Godot, no cloud. `PROGRESS.md` not written by me. Nothing committed.

STATUS: STAGE 2 COMPLETE - ONE STYLED DRAFT qa10/draft35-light-fountain.png (LIGHTING PASS: FIVE FILLS DOWN FOR THE INTERIOR, 13 POOLS, SNACK BAR SOURCES, STRIPS AND SIGN SPILLS; FOUNTAIN A ON THE CANDY CASE WITH THE 0.40 M BOWL) FROM lobby104/lobby_draft35.blend; 72.8 S; LIGHT LINKING 57 OF 64, NO WARNING LINE; RESTROOM MEAN 0.95 / P99 5 AGAINST DRAFT 34 (STAGE 1 GATE 0.5 / 3 NOT MET, AT THE NOISE LEVEL OF THE UNTOUCHED STREET); STREET AND ROOFS MEAN 0.68 / P99 6; TWO FILLS OVER THE RESTROOM KEPT, SIX EXISTING POOLS RAISED; NO CRITIQUE, NO PRODUCTION RENDER, NO CLOUD, NO LIVE PACK, PAGE OR EXISTING BLEND CHANGED; WAITING FOR THE OWNER ON DRAFT 35; STOP.


---

# Stage 2b (draft 36, Brief 104c, 17 Nov 2026): the "gamer lobby", lighting cranked up

Render agent: Claude Fable 5.2. Owner on draft 35: "too subtle ... crank it up. It really needs to be noticeable";
the dark look becomes a second lobby option beside the normal one. One styled draft still, the checks, this section.
No production render, no cloud, no page, pack, earlier draft or existing .blend touched (draft 35 included).

![Draft 36: the gamer lobby](qa10/draft36-gamer-lobby.png)

`qa10/draft36-gamer-lobby.png` (1280 x 720, fixed camera, weather frame 0, settings of drafts 27-35). Scene:
`lobby104/lobby_draft36.blend`, built by `lobby104/build_draft36.py` from `lobby104/lobby_draft35.blend`. I looked at the
final image and at enlarged parts of it.

## Short answer

- **The interior is lit by its own sources now.** No ceiling or sky fill reaches it any more, except one faint floor
  fill of 22 W. Lobby floor between the pools: 31.5 -> **17.6** (median luma, 0-255). Register pools: 106-123 ->
  **145-148**. Pool to floor: 3.4x -> **8.3x**. Bright tenth to dark tenth of the whole lobby floor (close to stage 2's
  measure, which gave 4.45 for draft 35): 4.3x -> 12.1x.
- **Walls are darker than the restroom:** corridor back wall median 21.5, darkest tenth 4.8 (restroom: median 36).
- **Light-linking:** 58 combinations (limit 64, gate 60), no warning line.
- **Restroom against draft 34, blurred:** mean 0.64, 99th percentile 1.72, largest 2.45 (two finished drafts against
  each other: 0.23 / 1.33 / 3.36). Not exact, not visible.
- **Street and roofs against draft 34:** mean 0.76, 99th percentile 7; blurred mean 0.22. Within noise except two
  places beside the cinema that were lit from inside (below).
- **Render time:** 66.8 s + 7.8 s weather = 74.6 s on the RTX 3050 (whole run with build and checks 102 s).

## What changed against draft 35

1. **Fills off for the interior.** Draft 35 still had four broad lights on the interior that I had not counted as
   fills: the roof moon fill (700 W), the cool street sky light (450 W) and the two 100 W fills over the restroom.
   All four, and the five of draft 35, now light the street side only (list "B104 street side keeps the old fill",
   unchanged there). The four faint interior copies are removed; the fifth is re-shaped into the one floor fill
   (rectangle over the whole footprint, straight down, spread 70 degrees, blue-violet, 22 W).
2. **Restroom kept by restroom-only lights.** The fills never lit the restroom directly (it is not on their list);
   they lit it by bounce. So there is nothing to copy one to one. Four small lights on the existing restroom list put
   the lost bounce back: one from above (1.6 W, blue-green), two at the entry wall (1.2 W and 0.08 W), one at the
   south end (0.3 W). 3.2 W in all; the restroom's own light (44 W) is untouched.
3. **Pools.** The seven pools without a fixture from draft 35 are removed. The three register pools and the two
   ticket-window pools are tighter (46 degrees instead of 65, with an edge) and stronger (460 W warm white and
   220 W; were 162 W). New light leans from things in the picture:
   - four wall sconces: a cone down (110 W, junction 50 W) and a cone up (30 W / 12 W) each;
   - LED signs over the screen doors: 1.5 -> 8 W each, narrow, straight down the door;
   - entrance: one warm spot from the marquee side through the doors (130 W);
   - claw machine: showcase light 4 -> 10 W, two cool spills from its glass (60 W west, 36 W toward the bench);
   - jukebox: pink floor pool 42 -> 110 W; TICKETS board spill 6 -> 8 W.
4. **Neon washes (steady, the animated tubes keep their own strength):** pink along the perimeter neon down the back
   wall (40 W, grazing), cyan under the low tube (8 W on the wall foot, 5 W out onto the floor), pink at the
   junction (5 W). Pink counter edge and base strip: emission 1.35 -> 2.0, floor glow 10 -> 45 W, strip spill 6 -> 14 W.
5. **Snack bar:** menu-board washes 10 -> 60 W each and thrown forward onto the counter; pendant strip 80 -> 30 W;
   task lights 3 -> 5 W; candy strip 12 -> 7 W and warmer.
6. **Box office:** teal edging and base strip x3 -> x2 of the live value (emission 1.08 -> 0.72), their spills 5 / 4 ->
   3.5 / 3 W. Its flat fill is gone with the two fills over the restroom.
7. **Fountain:** the camera-side accent is replaced by a narrow spot from the picture's left (60 W, 26 degrees,
   grazing the front) and a blue point light at the bowl's foot (1.5 W). Both light only the fountain and the candy
   case lid (new list "B104c fountain accent receivers", 11 objects). Fountain, size and place unchanged.

27 new lights (753 W, 3.2 W of them restroom-only); 12 lights of draft 35 removed, 24 retuned, 4 fills re-linked, 4
emissive trims changed. Not touched: geometry,
camera, street, rain, street lights, billboards, DINK DONK sign, the restroom's lights, every animated emitter.

## Luma (0-255), draft 35 -> draft 36

| What | Draft 35 | Draft 36 |
|---|---:|---:|
| Register pools, centres | 106 / 123 / 109 | **146 / 145 / 148** |
| Screen-door pools, centres (brightest point) | 102 / 104 / 100 (122) | 88 / 89 / 88 (116) |
| Corridor sconce pools on the floor | 42 / 42 | 78 / 82 |
| Junction sconce pools | 30 / 36 | 48 / 48 |
| Jukebox pink pool, centre (brightest point) | 52 (95) | 66 (114) |
| Entrance pool, brightest point (behind the front glass) | 145 | 130 |
| Usher gate pool (light unchanged) | 82 | 63 |
| Lobby floor between the pools, median (mean) | 31.5 (34.0) | **17.6** (20.8) |
| Darkest walkway spot in view (east end of the snack bar) | 41.9 | **14.9** |
| Other walkway spots: lobby east of centre; corridor, six places; junction | 50.6; 42-57; 63.4 | 24.0; 17.3-24.0; 19.4 |
| Corridor back wall below the neon, median (darkest tenth) | 25.8 (7.2) | **21.5 (4.8)** |
| Junction west wall, median (darkest tenth) | 26.8 (7.4) | 20.2 (3.6) |
| Wall above the pink neon, median | 20.3 | 18.9 |
| Wall tops in the lobby (z 1.2 m), median | 84.8 | 29.5 |
| Floor strip in front of the snack bar, mean (bright tenth) | 86.2 (115) | 91.8 (146) |
| Snack bar counter top, median | 164 | 118 |
| Snack bar, back wall to counter front, mean (bright tenth) | 111 (197) | 110 (209) |
| Pool to floor (register pools' median / floor between) | 3.4x | **8.3x** |
| Lobby floor, bright tenth / dark tenth | 4.3x | 12.1x |
| Restroom, all pixels, median (floor median) | 35.6 (47.2) | 35.9 (45.9) |
| Sidewalk in front of the glass, mean | 110.6 | 110.7 |

Pool centre = mean within 0.30 m; walkway spot = mean within 0.25 m at places between the pools. Floor pixels come
from the per-pixel regions of draft 35 (`regions35.npz`; the geometry is the same). The ticket-window pools and the
claw machine's pool are hidden from the fixed camera (marquee, front glass), so they have no number. Floor behind
the tinted front glass (about v over 6.7) reads darker in the picture than it is: the darkest hundredth of all lobby
floor pixels is 1.2 (corner behind the claw machine), which is not a walkway.

## Checks

| Check | Result | Reference or gate |
|---|---|---|
| Light-linking combinations (`rerender96/linkcount96.py` on `lobby_draft36.blend`) | **58**, 26 lists | at most 60 (limit 64): met |
| "Maximum number of light linking sets" in `draft36.log`, `linkcount36.log` | 0 lines | none: met |
| Restroom against draft 34, blurred (Gaussian sigma 7 px), 2 px inside the region's edge (33,125 px) | mean **0.64**, p99 **1.72**, max 2.45; signed mean +0.03 / +0.19 / +0.08 (r, g, b) | draft 35 against 34: 0.23 / 1.33 / 3.36 |
| Same, whole region with its edge pixels (35,723 px) | mean 0.77, p99 4.45, max 6.5 | draft 35 against 34: 0.27 / 1.75 / 4.71 |
| Restroom, unblurred, 2 px inside the edge | mean 1.45, p99 6 | draft 35 against 34: 0.87 / 4 |
| Street and roofs against draft 34 (548,324 px) | mean 0.76, p99 7; blurred mean 0.22, p99 3.2 | draft 35 against 34: 0.59 / 5; 0.13 / 1.5 |
| Street and roofs against draft 35 | mean 0.69, p99 6; blurred mean 0.15, p99 1.7 | |
| Wet ground beside the cinema against draft 34 (53,559 px) | mean 3.4, p99 46 | mirrors the lobby: expected |
| Cinema walls above 2.3 m (interior pieces) against draft 34 | mean 3.3, p99 65, mean luma -1.6 | darker on purpose |
| Read-only inputs (drafts 34 and 35 scenes and images, regions, manifests) | hashes equal before and after | met |

Unit: largest channel difference per pixel, 0-255. Reading them:
- **Restroom edge pixels.** The partition between restroom and box office is an interior wall; its top went from
  light lilac (182) to dark (30). The restroom pixels that touch it carry part of that through the pixel filter (up
  to 109). That is the wall, not the restroom, so the honest number is the one 2 px inside the edge.
- **Restroom inside.** Largest blurred differences: +2 on the lower west wall, -2.5 (blue) on one wall top. What is
  left is a pattern mismatch between real bounce and four lights, plus noise: the restroom is noisier per pixel than
  before (1.45 against 0.87).
- **Street.** The largest blurred differences are two places that were lit from inside: the ground just east of
  the corridor's end (u 13.2-14.5, v 0.8-2.9) is 6-17 darker, and the wet corner at the bottom edge of the picture
  is 5-9 bluer (it mirrors the claw machine's brighter showcase). Away from the cinema: noise.
- The door recesses behind the corridor's back wall (450 px) were counted as street in stage 2. They are interior
  pieces and are listed apart now (15 mean against draft 34).

## What fell short or differs from the brief

- **Restroom not "exactly as it is":** blurred mean 0.64 against a noise level of 0.23. And the split is not a copy
  of the two fills (they do not light the restroom directly) but four small restroom-only lights.
- **8.3x holds for the register pools only.** Screen doors 5.0x, sconce pools 4.5x, jukebox 3.8x (saturated pink
  reads low in luma), usher gate 3.6x.
- **Walkway spots are 15-24, not 14-18 everywhere:** the darkest in view is 14.9; the corridor sits at 17-24 because
  the pink neon and the cyan tube light it along its whole length.
- **Usher gate pool unchanged and soft.** It is not linked and touches the restroom's entry, so I left it alone. The
  four sconces' own point lights also stay as they are: raised, they warmed the restroom's upper walls (the new cones
  are extra lights for the interior only).
- **Counter top darker** (median 164 -> 118) with the pendant strip down; the back bar and the floor strip are
  brighter. The snack bar is still the brightest interior spot.
- **Three pools hardly show in this still:** entrance, ticket windows and the claw machine's spill lie behind the
  marquee or the tinted front glass.
- **Fountain:** lip and a pale streak of the falls show, blue at the foot; at 42 x 44 px it still reads as a bonsai
  in a glowing bowl first. Not checked at 2x.
- **"B95 purple lobby light on the sidewalk"** (19 W, a street-side stand-in for the old lobby's glow) is left as it
  is, because the street was to stay. With the dark lobby it has no source any more. For the owner to decide.
- **Light-linking 58, not 57:** one new list for the fountain accent. Two left to the gate.
- **The final still was rendered three times** (restroom lights tuned between them); each replaced the one before,
  only the last exists. 12 coarse tuning frames (36-54 s each).
- No spill for the NEXT SHOWING board (no such object, as in stage 2). Emission of the animated tubes, TICKETS
  board, menu boards and bulbs unchanged.
- Not done by me: the second-opinion critique; any page check; the 2x size; phases other than 0.

## For stage 3 (not started)

- The gamer lobby would be its own pack beside the normal one; draft 35 stays the candidate for the normal lobby's
  lighting pass, or is dropped. Owner's call.
- The restroom-only lights and the fountain list go into the production scene as they are; 58 combinations.
- The floor fill is not in the place of any other light (moved and re-shaped), so the "no two lights in one place"
  rule of stage 2 still holds.
- Chatters between the pools stand on a floor at 15-24: the page's own chatter light needs a look with real chat.

## Files and runs

`lobby104/`: `build_draft36.py` (build, render, checks; `--test`, `--params`, `--crop`, `--diffmap`, `--check-only`),
`lobby_draft36.blend`, `build36.json` (every light and value), `render36.json`, `check36.json` (all numbers above, with
draft 35 measured the same way), `draft36.log`, `linkcount36.log`, `test36.log`, `check36.log` (an earlier check-only
pass), `inspect36.py` (read-only survey of draft 35), `runtime36/` (copies of the render helpers, caches).

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File lobby104/run104.ps1 -Script build_draft36.py -Log draft36.log
```

Blender ran 20 times in background mode, one at a time, `tasklist` checked before each (no other Blender or Godot was
running): 1 read-only survey, 12 tuning starts (one stopped on my typo after its frame), 3 final renders, 3
check-only passes, the link count. About 12 minutes of GPU. Tuning frames, enlarged parts and difference maps were
outside the project and are deleted; the linear render buffers are deleted. No Godot, no cloud. `PROGRESS.md` not
written by me. Nothing committed.

STATUS: STAGE 2B COMPLETE - ONE STYLED DRAFT qa10/draft36-gamer-lobby.png (GAMER LOBBY: ALL FILLS OFF FOR THE INTERIOR EXCEPT ONE 22 W FLOOR FILL, POOLS FROM VISIBLE SOURCES, NEON WASHES, FOUNTAIN ACCENT) FROM lobby104/lobby_draft36.blend; 74.6 S; REGISTER POOLS 145-148, LOBBY FLOOR BETWEEN 17.6, DARKEST WALKWAY SPOT 14.9, CORRIDOR WALL 21.5, POOL TO FLOOR 8.3X (DRAFT 35: 3.4X); LIGHT LINKING 58 OF 64, NO WARNING LINE; RESTROOM BLURRED DIFF AGAINST DRAFT 34 MEAN 0.64 / P99 1.72 (NOISE LEVEL 0.23 / 1.33: NOT EXACT); STREET AND ROOFS MEAN 0.76 / P99 7; NO CRITIQUE, NO PRODUCTION RENDER, NO CLOUD, NO LIVE PACK, PAGE OR EXISTING BLEND CHANGED; WAITING FOR THE OWNER ON DRAFT 36; STOP.


---

# Stage 2c (draft 37, Brief 104d, 17 Nov 2026): the gamer lobby in magenta and cyan

Render agent: Claude Fable 5.2. Owner on draft 36: "37 it is" - magenta / cyan pools and all six points of
`reviews/review-104-draft36.md`. One styled draft still, the checks, this section. No production render, no cloud, no
page, pack, earlier draft or existing .blend touched (drafts 35 and 36 included; hashes equal before and after).

![Draft 37: the gamer lobby in magenta and cyan](qa10/draft37-gamer-lobby.png)

`qa10/draft37-gamer-lobby.png` (1280 x 720, fixed camera, weather frame 0, settings of drafts 27-36). Scene:
`lobby104/lobby_draft37.blend`, built by `lobby104/build_draft37.py` from `lobby104/lobby_draft36.blend`. I looked at the
final image and at enlarged parts of it.

## Short answer

- **Colour:** magenta on the lobby side (the three register pools and the two ticket-window pools), cyan in the
  corridor (the four sconces: cone down, cone up, the glow on the wall, the diffuser). Pink and cyan neon washes x1.5.
- **Register pools** lie across the counter's front edge now: counter-top half 148-154, front edge 159-162, floor
  half 136-141 (draft 36: 146-148, all on the floor, warm white).
- **Walker floor:** darkest walkway spot 14.9 -> **20.4**; the strip (720,530)-(800,600) has its dark tenth at 21.6
  (was 16.5); lobby floor between the pools, median 17.6 -> 22.1.
- **Pool to floor:** 8.3x -> **6.1x** (register floor halves against the floor between). The floor came up by a
  quarter and half of each pool is on the counter now.
- **Light-linking:** 59 combinations (limit 64, gate 60), 28 lists, no warning line.
- **Restroom against draft 34, blurred:** mean 0.63, 99th percentile 1.58, largest 1.90 (draft 36: 0.64 / 1.72 /
  2.45). Against draft 36: 0.23 / 1.32 / 1.73.
- **Street and roofs against draft 34:** mean 0.77, 99th percentile 7; blurred 0.18 / 2.26 (draft 36: 0.76 / 7;
  0.22 / 3.18). Within noise.
- **Render time:** 88.4 s + 13.9 s weather = 102.3 s on the RTX 3050 (draft 36: 74.6 s; whole run 198 s).
- **Not met:** the corridor's walls are a little lighter than in draft 36 (median 21.5 -> 25.6), and the corridor
  floor sits well above the 20-22 floor (walkway spots 21.6-32.8). See "What fell short".

## The colours

| What | Light colour (r, g, b) | Reads in the picture as |
|---|---|---|
| Register pools, ticket-window pools | magenta (1.0, 0.13, 0.64) | pool on the carpet (203, 117, 193), on the counter (192, 137, 170) |
| Sconce cones | cyan (0.05, 0.72, 1.0) | blue-cyan pools on the corridor floor |
| Sconce glow on the wall, sconce diffusers | (0.10, 0.74, 1.0), (0.16, 0.80, 1.0) | cyan lamp with a blue halo on the plaster |
| Walkway fill, lobby / corridor | violet (0.62, 0.30, 1.0) / blue (0.22, 0.62, 1.0) | hardly a colour of their own |
| Neon washes (unchanged colours) | pink (1.0, 0.085, 0.37), teal (0.13, 1.0, 0.85) | pink top edge, teal foot of the back wall |
| Picture lights | warm white (1.0, 0.775, 0.525), spill (1.0, 0.86, 0.72) | lit poster with a pale patch on the floor |

Left warm on purpose: the entrance light (it comes from the marquee's bulbs), the amber pools under the LED signs
at the screen doors, the menu boards. The claw machine was cool and the jukebox pink already.

## What changed against draft 36

1. **Register pools (point 2).** The three spots moved from over the floor (v 5.05, straight down) to under the
   pendant line over the counter (v 4.30, z 1.40) and are aimed forward at the floor 0.65 m in front. Cone 44 degrees,
   460 -> 1,000 W, magenta. Each lights its register and the front half of the counter top, drops over the edge and
   ends as a half ellipse on the floor.
2. **Sconces (point 1).** Cones cyan, 110 -> 80 W down and 30 -> 28 W up (junction 50 / 12 W as before; cyan carries
   more luma per watt). The diffusers are cyan (their own copy of the lamp material). The sconces' own warm point
   lights (15 W, 9 W) are split by receiver: the originals keep lighting everything except the interior list and the
   corridor's wall pieces (so the restroom, the street side and the roof billboard have them as before); cyan copies
   in the same place light the interior list and those wall pieces. Two new lists, one new combination.
3. **Neon washes (point 1), x1.5:** pink perimeter 40 -> 60 W, junction pink 5 -> 7.5 W, cyan under the low tube
   8 -> 12 W and 5 -> 7.5 W, pink strip on the snack bar's back wall 14 -> 21 W, cyan strip at the box office 3.5 ->
   5.25 W. Tubes and trims themselves unchanged.
4. **Walker floor (point 3).** Two fills straight down with a spread of 30 degrees, hung at 2.25 m: violet over the
   lobby floor (u 5.2-12.9, v 4.7-8.85; 16 W) and blue over the corridor (3 W; kept 0.9 m off the back wall and the
   west wall). The 22 W floor fill of draft 36 is unchanged.
5. **Picture lights (point 4).** For each of the three poster frames: a 5 W strip above the frame down the picture
   and the wall, and a 3.5 W spill from the picture's face down onto the floor in front. Small ones for the two other
   flat page drawings in the dark junction (list below). The bulb frames' own 2.5 W spills are unchanged.
6. **Fountain (point 5).** The blue point light left the bowl's foot and sits under the water now (free water on the
   camera's side of the rock, found by ray casts), 1.5 -> 0.16 W. The rock's grey ramp is x1.25. A narrow kicker
   (4.5 degrees, 110 W, cool white) from the front puts the highlight on the falls. Size, place, the other materials
   and the grazing accent of draft 36 are unchanged.
7. **Soda box (point 6).** The near-white box at (800, 420) is no emitter: it is the nickel top of the soda
   fountain, 8 cm under the menu-board wash (60 W). The soda fountain got its own darker copy of the shared nickel
   (base colour x0.18). Pixel box 794-807 x 413-427: mean 233.8 -> 191.7 (-18%); the top by position: 242.4 -> 203.5
   (-16%). The wash, the task light and the shared material are unchanged.
8. **Restroom.** One more restroom-only light (0.2 W, warm, high at the junction end): the warm bounce its upper
   walls had from the junction sconces' cones, which are cyan now.

18 new lights (208 W; 110 W of them the fountain's kicker), 26 lights retuned or moved, 4 re-linked, 6 materials changed (four
diffusers, the soda fountain's nickel, the rock). Not touched: geometry, camera, street, sign, marquee, rain, street
lights, billboards, the "B95 purple lobby light on the sidewalk", the restroom's lights, every animated emitter.

## Page-drawn items and their light (point 4)

Looked through `out10s/manifest.json` (with `brief96.page_must`), `out10ps/props.json` and `PAGE-DRAWN-ITEMS.md`.

Got a picture light:
- **Film posters beside screen doors 3, 4, 5** (`manifest.poster_frames`; the page's `.poster`). Frame 127 / 139 /
  118 with the blank stock in it (was 60 / 90 / 41), floor in front 56 / 68 / 48 (was 44 / 62 / 32), wall round the
  frame 34 / 40 / 18 (was 32 / 38 / 16).
- **"The J6 Video" poster** on the junction's west wall (page `.pst`; a dark poster): 1.2 W + 1.0 W.
- **NEXT SHOWING board** on the back wall in the junction (page `.nb`, white text on near black): 2.0 W + 1.5 W, cool
  white. Stage 2 did not find it; the object is "D3 double programme board".

Have a light already, nothing added:
- LED door signs (`manifest.led_signs`): amber spills of 8 W each (draft 36). "Dear Leader" poster (`out10l`): its
  own picture light. TV picture (`out10ps`): its screen glow, and it stands in the lit snack bar. Slop menu lines: on
  the backlit menu boards. "Dogtober 7th": printed in the render since Brief 95; the page's copy is hidden.

No light from me, for the page or the pack to solve:
- **Poll screen and its picture** (page `.pscr`): it is down only during a poll; a baked spill would be there all the
  time. It needs its own light layer, or the page's beam is enough.
- **Wet-floor sign** (`manifest.wet_floor_sign`, spot (10.2, 6.4)): a sprite rendered for the bright lobby. It stands
  on the strip that came up to 21-29; it would need a second render for this pack, not a pool without a lamp.
- **Sprites and emotes that move:** carried items (`manifest.items`: popcorn, soda, ticket, stub, caps, Buddy,
  clipboard), cat, 3D janitor, gnome, Aristortle, jannies, staff and the chatters. They take the page's scene light
  (`out10mist/light.png`), which has to be made for this pack.
- **Door animations and the claw machine's chase layers:** render layers, rendered again with the pack.
- Everything on the street (marquee text, billboards and shelter ad, street states, police bar, steam, splashes,
  umbrellas) and the restroom's WC light: unchanged places.

## Luma (0-255), draft 36 -> draft 37

| What | Draft 36 | Draft 37 |
|---|---:|---:|
| Register pools: counter-top half | 77 / 87 / 97 (no pool there) | **148 / 152 / 154** |
| Register pools: counter front edge | 81 / 88 / 97 | **159 / 160 / 162** |
| Register pools: floor half (the old centre) | 146 / 145 / 148 | **141 / 136 / 141** |
| Register pools: brightest point (the registers) | 183 / 183 / 190 | 195 / 199 / 211 |
| Sconce pools on the corridor floor | 78 / 82 | 71 / 78 |
| Junction sconce pools | 48 / 48 | 52 / 53 |
| Screen-door pools | 88 / 89 / 88 | 92 / 93 / 92 |
| Jukebox pool; entrance, brightest point; usher gate | 66; 130; 63 | 67; 133; 63 |
| Lobby floor between the pools, median (mean) | 17.6 (20.8) | **22.1** (24.4) |
| Darkest walkway spot in view (east end of the snack bar) | 14.9 | **20.4** |
| Strip (720,530)-(800,600), floor: median; dark tenth; darkest twentieth | 22.6; 16.5; 15.8 | 28.6; **21.6**; 20.8 |
| The critique's points (760,560); (620,560), mean of 5 x 5 px | 16.3; 18.2 | 21.6; 21.9 |
| Other walkway spots: lobby east of centre; corridor, six places; junction | 24.0; 17.3-24.0; 19.4 | 28.8; 21.6-32.8; 26.8 |
| Corridor floor: median; dark tenth | 37.8; 17.8 | 46.3; 24.2 |
| Corridor back wall below the neon, median (darkest tenth) | 21.5 (4.8) | **25.6 (6.3)** |
| Junction west wall, median (darkest tenth) | 20.2 (3.6) | 24.3 (5.5) |
| Wall above the pink neon, median; wall tops in the lobby, median | 18.9; 29.5 | 18.9; 29.8 |
| Snack bar counter top, median | 118 | 141 |
| Snack bar, back wall to counter front, mean (bright tenth) | 110 (209) | 109 (209) |
| Floor strip in front of the snack bar, mean (bright tenth) | 91.8 (146) | 84.8 (142) |
| Soda fountain top, pixel box (by position) | 233.8 (242.4) | 191.7 (203.5) |
| Pool to floor (register floor halves, median / floor between) | 8.3x | **6.1x** |
| Fountain: pixels at 200 or more; brightest; case lid round the bowl (r, g, b) | 4; 213; (43, 47, 48) | 10; 243; (44, 41, 37) |
| Restroom, all pixels, median (floor median) | 35.9 (45.9) | 36.0 (45.9) |
| Sidewalk in front of the glass, mean | 110.7 | 110.7 |

Measured as in stage 2b (pool centre = mean within 0.30 m; walkway spot = mean within 0.25 m; floor pixels from
`regions35.npz`), draft 36 measured again by the same code. Counter front edge = the counter top's last 17 cm, 0.6 m
wide at each register. With the front edge as the pool's centre the ratio is 7.2x. The point (900, 300) named in the
critique is on the back wall (z 1.75), not on the floor: 16.6 -> 21.1.

## Checks

| Check | Result | Reference or gate |
|---|---|---|
| Light-linking combinations (`rerender96/linkcount96.py` on `lobby_draft37.blend`) | **59**, 28 lists | at most 60 (limit 64): met, one left |
| "Maximum number of light linking sets" in `draft37.log`, `linkcount37.log` | 0 lines | none: met |
| Restroom against draft 34, blurred (sigma 7 px), 2 px inside the region's edge (33,125 px) | mean **0.63**, p99 **1.58**, max 1.90; signed mean +0.13 / +0.29 / +0.23 (r, g, b) | draft 36: 0.64 / 1.72 / 2.45; draft 35: 0.23 / 1.33 / 3.36 |
| Same against draft 36 | mean 0.23, p99 1.32, max 1.73 | |
| Restroom, unblurred, 2 px inside the edge, against draft 34 | mean 1.46, p99 6 | draft 36: 1.45 / 6 |
| Street and roofs against draft 34 (548,324 px) | mean 0.77, p99 7; blurred mean 0.18, p99 2.26 | draft 36: 0.76 / 7; 0.22 / 3.18 |
| Street and roofs against draft 36 | mean 0.67, p99 6; blurred mean 0.16, p99 1.75 | |
| Wet ground beside the cinema against draft 34 (53,559 px) | mean 3.5, p99 47 | mirrors the lobby: expected (draft 36: 3.4 / 46) |
| Read-only inputs (scenes and images of drafts 34-36, fountain file, regions, manifests) | hashes equal before and after | met |

Unit: largest channel difference per pixel, 0-255. Largest blurred street difference against draft 36: the ground
just east of the corridor's end (u 13.2-13.8, v 0.7-1.7), 6-13 lighter. Draft 36 had made it 6-17 darker; it is lit
from inside. Against draft 34 it is 4-9 off now. The roof billboard differs from draft 36 by 2-4 (noise).

## Three things I found on the way

1. **The plaster of the corridor's walls is on no receiver list.** The back wall, the junction's west wall, the door
   jambs, lintels and recess pieces (91 objects) take unlinked lights only. So the pink and cyan washes and the
   sconce cones of draft 36, which are linked to the interior list, light the frames, signs and standees on the wall
   but never the plaster. In draft 37 only the sconces' cyan glow reaches the plaster (the two new lists). Putting the
   wall pieces on the interior list would give the walls the full washes and cones: more colour, lighter walls, the
   60th combination. Not done; owner's call.
2. **A light inside another light's plane loses light.** The first final had the register spots at z 1.62, inside
   the rectangle of the pendant strip, and the walkway fills at 1.10 m, between the floor and every lamp above. The
   three register pools came out unequal at equal watts (166 / 132 / 137; equal again at 950 W). Same family as stage
   2's "two lights in one place". With the spots 0.22 m under the strip and the fills above every other interior
   light the three pools are equal (141 / 136 / 141). I did not separate the two causes. For stage 3: no light in
   another light's plane, none between a surface and the lights it should see.
3. **The sconces' own point lights reach the roof billboard** over the wall tops. In the first final I had kept the
   warm originals for the restroom only; the WCAT billboard lost 17 of red. Hence the list that excludes only the
   interior pieces.

## What fell short or differs from the brief

- **Walls not "as dark as draft 36":** corridor back wall median 21.5 -> 25.6, junction west wall 20.2 -> 24.3;
  wall above the neon and wall tops unchanged. On a tuning frame with the washes at draft 36's strength the back wall
  was at 25.0 against 26.4 with them, so the x1.5 washes are about 1.4 of it. The rest I did not take apart; the
  candidates are bounce from the brighter corridor floor, the lit poster frames and the cyan halos.
- **Corridor floor is above the 20-22 floor:** walkway spots 21.6-32.8 (were 17.3-24.0). The cyan pools, the
  picture spills and the amber door pools now follow each other along the back wall. The lobby is where it should be
  (20.4-28.8).
- **Pool centres at 150-170 hold for the counter half only** (148-162); the floor halves are 136-141. More watts
  would take the registers further toward white (they are at 195-211).
- **Pool to floor fell from 8.3x to 6.1x.**
- **Soda box:** not an emission change (there is none); its nickel is darker. The brightest tenth of the top still
  clips at 255.
- **Fountain:** the highlight on the falls is about 2 px wide and 4-5 px tall; the blue is in the water, the lid
  round the bowl is neutral. It still reads as a bonsai on a pale rock first. The blue light is both moved and
  weaker (0.16 W). Not checked at 2x.
- **Picture lights light the blank stock** in the frames and, at the junction, the render's filler poster and the
  board's baked WHIPLASH art; the page covers them. Whether a real poster at full brightness still jumps out is a
  page check; the page-side dim (60-70%) of the critique stays open.
- **Light-linking 59, not 58:** two new lists for the sconces' glow. One left to the gate.
- **Restroom not exact,** as in draft 36 (0.63 against a noise level of 0.23), with one more restroom-only light.
- **Render time 102 s** (was 75 s).
- **The final still was rendered three times** (findings 2 and 3 above, then the wall pieces and a calmer
  corridor); each replaced the one before, only the last exists. 9 coarse tuning frames (45-75 s each).
- Ticket-window pools are magenta but hidden by the marquee in this view. The "B95 purple lobby light on the
  sidewalk" is kept. No spill for the poll screen. Emission of the animated tubes, boards and bulbs unchanged.
- Not done by me: the second-opinion critique; any page check; the 2x size; phases other than 0.

## For stage 3 (not started)

- The two findings above (wall plaster on no list; no light in another light's plane) are decisions before the
  production scene.
- The restroom-only lights (five now), the fountain list and the two sconce lists go in as they are: 59
  combinations.
- Page for this pack: its own scene-light map, chatter light on a floor at 20-33, the posters' brightness, the
  wet-floor sign and item sprites for the dark lobby.

## Files and runs

`lobby104/`: `build_draft37.py` (build, render, checks; `--test`, `--params`, `--crop`, `--diffmap`, `--check-only`),
`lobby_draft37.blend`, `build37.json` (every light and value, the 91 wall pieces), `render37.json`, `check37.json` (all
numbers above, with draft 36 measured the same way), `draft37.log`, `linkcount37.log`, `test37.log` (the last tuning
pass), `inspect37.py` and `inspect37.log` (read-only survey of draft 36), `runtime37/` (copies of the render helpers,
caches).

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File lobby104/run104.ps1 -Script build_draft37.py -Log draft37.log
```

Blender ran 23 times in background mode, one at a time, `tasklist` checked before each (no other Blender or Godot was
running): 2 read-only surveys, 9 tuning frames, 3 final renders, the link count, 3 read-only queries of the saved
scene, 5 starts of a small helper that enlarged parts of a frame (no scene loaded). About 13 minutes of GPU. Tuning
frames, enlarged parts and difference maps were outside the project and are deleted; the linear render buffers are
deleted. No Godot, no cloud. `PROGRESS.md` not written by me. Nothing committed.

STATUS: STAGE 2C COMPLETE - ONE STYLED DRAFT qa10/draft37-gamer-lobby.png (GAMER LOBBY IN MAGENTA AND CYAN: MAGENTA REGISTER POOLS ACROSS THE COUNTER EDGE, CYAN SCONCES, NEON WASHES X1.5, WALKWAY FILLS, PICTURE LIGHTS FOR THE THREE POSTER FRAMES, THE J6 POSTER AND THE NEXT SHOWING BOARD, FOUNTAIN, SODA FOUNTAIN TOP) FROM lobby104/lobby_draft37.blend; 102.3 S; REGISTER POOLS 148-154 ON THE COUNTER, 159-162 AT ITS EDGE, 136-141 ON THE FLOOR; LOBBY FLOOR BETWEEN 22.1, DARKEST WALKWAY SPOT 20.4; POOL TO FLOOR 6.1X (DRAFT 36: 8.3X); CORRIDOR WALL 25.6 (DRAFT 36: 21.5, NOT AS DARK); SNACK BAR MEAN 109, COUNTER TOP 141; LIGHT LINKING 59 OF 64, NO WARNING LINE; RESTROOM BLURRED DIFF AGAINST DRAFT 34 MEAN 0.63 / P99 1.58 (DRAFT 36: 0.64 / 1.72); STREET AND ROOFS MEAN 0.77 / P99 7; NO CRITIQUE, NO PRODUCTION RENDER, NO CLOUD, NO LIVE PACK, PAGE OR EXISTING BLEND CHANGED; WAITING FOR THE OWNER ON DRAFT 37; STOP.


---

# Stage 3 prep (Brief 104e, 17 Nov 2026): production scene, bundle, local smoke, pack step. No cloud.

Render agent: Claude Fable 5.2. Owner on draft 37: "alrighty go ahead". Everything below is local; no pod was started,
`runpodctl`, `cloud-render.sh` and the two run scripts were never run. No live pack, page, `cloud/` file, draft or
existing .blend was written (hashes of drafts 34-37 and the four live manifests equal before and after; no file in
`out10s`, `out10ps`, `out10m`, `out10l`, `out10mist`, `qa11` is newer than this job). The owner cut the local smoke
short ("cut it short"): only the 8-sample smoke ran, no item at production settings.

## Short answer

- **Bundle:** `lobby104/roxy-cloud-bundle-104.tar.gz`, 31,253,902 bytes (29.8 MiB), 27 members, SHA-256
  `06392349cdd05a3fa501c5e627432d21bf2ce8184aeb6db096c2c3a13bfb4b69`. The helper's `validate_archive` accepts it.
- **172 items:** background 49 (48 phases + wrap proof), dry 1, depth pieces 63, door poses 48, restroom light 2,
  claw chase 1, jukebox tubes 1, TV glow 1, marquee 1, poster body 1, scene-light map 1, sprites 2, mist 1.
  Items 1-23 are the canary (one of each kind).
- **Smoke:** items 1-23 at 8 samples through the helper's own worker, 811 s on the RTX 3050, exit 0, every probe
  passed, the helper's `verify_unpack` accepts the result. `pack104.py` on it: 1,901 checks, 0 failures (a partial
  test pack in a scratch folder, deleted; its manifests are in `lobby104/smoke104/pack-proof/`).
- **Estimate:** 2.0-3.0 GPU-hours on an RTX 4090 class card; on 5 pods 25-40 minutes with 4090s, 45-65 minutes with
  A40s; final $1.6-3.3, canary $0.2-0.4. **$6 is enough.** Caps: test `MAX_HOURS=0.5` (worst $0.45), final
  `MAX_HOURS=1.2` (worst $5.34), together $5.79.
- **Found on the way:** `out10s/occ_bridge_board.png` and its slices are black in the live pack (mean 0.1/255;
  `out10r`: 19/12/4). The board's objects carry group "background" in the draft scenes; Brief 95 set their group in
  its production scene, Brief 96 did not. This scene sets it again; `out10s` is not touched.

## Production scene (`lobby104/make_prod_scene104.py` -> `bundle104/bundle/pipe/scene.blend`, 31.1 MB, 7,771 objects)

From `lobby_draft37.blend`, read-only. Report: `lobby104/prod_scene104.json`.

- Rain streaks of the draft runner removed (1,435); what Briefs 95 and 96 switched off stays off (53 objects);
  Brief 104 hid no geometry (compared with draft 34).
- **Marquee:** in the scene for every capture, its 180 meshes out of the camera's sight (caster), its 63 lights on.
  The 60 bulbs are in four chase groups (16 / 15 / 14 / 15) with a level node each, at the 0.35 base; spill lights
  at 0.35. The bulb-halo compositor node is removed as in Briefs 83, 95 and 96.
- **"Dear Leader" poster:** 7 meshes out of the camera's sight, picture light on; its body is an item of its own.
- **Jukebox:** depth piece `jukebox` (26 objects), both tubes at 0 and the pink floor pool (110 W) off: they are
  light pieces. **TV:** its 12 meshes are in group `partition_right`, screen glow and glow lamp off (light piece).
  **Claw machine:** as Brief 96, four chase groups dark.
- **From the critique** (production scene only):
  - Fountain rock: grey ramp x1.3. Kicker: cone 4.5 -> 3.5 degrees, turned 1.9 degrees onto the upper 55% of the
    falls. By ray casts the kicker never touched the bowl: in draft 37 its cone landed 36% on the falls, 30% on the
    small pools, 28% on the rock; now 45% falls, 45% rock, 5% pools. One native 4K crop at 256 samples (outside the
    project, deleted): clean, no fireflies, the streak sits on the upper falls.
  - Register pools: cone 44 -> 50 degrees. Measured on coarse crops: between the registers the floor rises from 61
    to 72; nothing else moves. **The dark band at the kick panel stays:** it is the counter's own shadow (spot at
    v 4.30 over a counter edge at v 4.61: the floor is unlit to v 4.71 and fully lit from v 4.98; luma 32 -> 124
    over the first 0.2 m in every variant). Aiming 0.15 m closer did not change it either and dimmed the pool's far
    end (122 -> 106), so I took the wider cone. Closing the band needs the spots above the counter's front edge:
    not done, beyond the brief.
  - Wall plaster stays off the interior list. No light was added, so "no light inside another light's plane" holds
    as in draft 37.
- **Light linking: 59 combinations** (gate 60, limit 64), also with every item object on. Draft 37 uses nested
  lists and "exclude" links; the count, the item objects' memberships and the job's check follow that.
- Sprite models built in, switched off: wet-floor sign, Buddy plush, clipboard (Brief 96 builders, now on the
  bench's lists), and grey-card (18%) copies of the five interior floors for the scene-light map.

## The job (`bundle104/bundle/job104.py`: the Brief 96 job, changed)

| Kind | Items | What |
|---|---:|---|
| `background`, `dry` | 50 | 48 phases, wrap proof, dry fallback |
| `fg` | 63 | all 40 depth pieces and `jukebox`: 9 outdoor wet pieces at phases 0 / 16 / 32, the 4 indoor ones at the two neon states (0 / 12), 28 once; `jukebox`, `partition_right`, `snack` with positions (new shape) |
| `door` | 48 | 8 doors x 6 poses (the stall doors too: compared at pack time) |
| `wc` | 2 | vacant, occupied |
| `chase`, `tubes`, `tvglow` | 3 | claw chase groups (4), jukebox pink tube with pool and teal tube, TV glow |
| `marquee` | 1 | body probe, and the 48 chase phases on everything the marquee lights |
| `leader` | 1 | the poster's body |
| `floorlight` | 1 | the light on the interior floors on a grey card (`light_floor.png`) |
| `item` | 2 | wet-floor sign; Buddy plush and clipboard |
| `mist` | 1 | catch, height, rim, light |

- **Light pieces** are solved as Brief 94 did: one capture of the scene with the piece dark, one capture of the
  piece's own light alone on black (a x1 factor in front of all 325 emitting sockets, set to 0 for the others;
  all lamps at 0); piece = display(dark + own light) - display(dark). No noise threshold is needed.
- **Marquee chase:** phase f = base (bulbs at 0.35) + sum over the groups of (level - 0.35) / 0.65 x own light, 48
  display pairs. These are the receivers (ground, glass, entrance pieces); the marquee itself is not in view.
- Two locks as Brief 96: the linking count when the scene is opened, and a probe crop per worker process against
  `probe_reference.npz` (rendered here at production settings, 37 s).
- `do_fg` now stops on an empty depth piece (what happened to the bridge board in Brief 96).

## Packs (`lobby104/pack104.py`, at home, no GPU; not part of the bundle)

`out10t/` (base, seeded from `out10s`), `out10tps/` (jukebox tubes, TV glow), `out10tm/` (marquee), `out10tl/`
(poster). The last two are new names: the baked marquee and poster need their own fragments.

- Base, lit, dry, both light loops as Brief 96 (loop = exact complement). Depth pieces: unchanged shapes keep the
  live alpha and slice masks; `jukebox` (z 2557, one slice), `partition_right` (+509 px) and `snack` (+328 px)
  take alpha and slices from the render (same slice names and z).
- **No wet loops:** the 54 `wet_*` entries and files go. Per wet piece the pack measures how far its captures are
  apart (3 x 3 mean of the spread at 8/255). An indoor piece with more than 24 such pixels gets one merged
  two-state sheet (2 frames, 2 fps). Decided by the canary's items 2-9 at production quality, without a new bundle.
- **Carried over after comparison** (mean and 99th percentile of the 5 x 5 mean within 2/255), else the new render:
  the six pieces inside the restroom, the four stall door sheets, the two restroom light states.
- **Marquee pack:** the 24 body slices of `out10m` with their own 48 light and shadow pieces (`merged2`, "on":
  `marquee_body_*`) laid in (mean change of a slice 0.35/255, alpha unchanged); the 23 body chase sheets byte for
  byte; receiver chase sheets solved again: one per depth slice they fall on, the ground part in 240 px tiles
  under the walkers, pieces that never pass 2/255 left out (smoke: 7 sheets; `out10m` has 37). The body probe is
  a gate (mean <= 2, p99 <= 12 against `out10m/body.png`); `--accept-marquee-body` passes it by hand.
- **Poster pack:** one piece, the body (59 x 112 at 839, 455, z 1675 as before). **Props pack:** `tv_glow`,
  `jukebox_tube_pink`, `jukebox_tube_teal`, and a `_front` part for what falls on pieces in front of the jukebox
  (smoke: 4 layers; `out10ps` has 10).
- **Scene-light map** `light_floor.png` (+@2x, `manifest.scene_light`): the light on the interior floors on an 18%
  grey card, alpha = interior floor. It carries the magenta and cyan pools. `light.png` keeps its contract (the
  mist pass: rain-catching surfaces only, zero indoors): the page's mist and rain shaders read it.
- Sprites: the sign and the two item sprites are replaced if they differ by more than 2/255
  (`--keep-item-sprites` keeps the live Buddy and clipboard).
- Gate "the street stays": phase 0 against `out10s/lit_bg.png` on street and roofs, without the area the marquee
  lights (its light and shadow are new in the picture) and without the bridge board: mean under 1, 99th percentile
  of the 5 x 5 mean under 4, else the pack stops as failed.
- Checks at the end: every referenced file, slices rebuild parents, live alpha kept, no black piece, sheet sizes,
  391 carried-over files byte-identical, body chase sheets byte-identical, base + loop phase 0 = lit background,
  videos decode, the live packs untouched.

**Carried over byte-identical from `out10s`:** vehicles with lamp variants, tyre spray, umbrellas, cat, janitor,
items (popcorn, soda, stub, ticket, caps, wet print), `rain_fg.webm`, steam and splash sheets, police bar,
street-state patches, the popcorn / menu / soda / TICKETS / poster-bulb loops. From `out10m`: body chase sheets.

## Local smoke (RTX 3050, 8 samples, `smoke104.ps1`, the helper's worker on the extracted sealed archive)

| # | Item | Render s | Item s | # | Item | Render s | Item s |
|---:|---|---:|---:|---:|---|---:|---:|
| 1 | background 000 | 33.9 | 65.1 | 13 | door screen_1 pose 3 | 6.4 | 16.3 |
| 2-9 | fg boxoffice, partition_left, partition_right, snack at 0 and 12 | 5.8-6.7 | 14.5-16.9 | 14 | wc occupied | 5.6 | 15.1 |
| 10 | fg jukebox | 5.8 | 14.8 | 15 | chase | 30.1 | 80.8 |
| 11 | fg glass_left 000 | 6.2 | 15.3 | 16 | tubes | 21.3 | 52.4 |
| 12 | fg bench | 5.9 | 14.9 | 17 | tvglow | 12.3 | 32.6 |
| 18 | marquee (4 of 48 phases) | 55.0 | 124.1 | 21 | item sign | 18.8 | 42.0 |
| 19 | leader | 6.4 | 16.1 | 22 | item carried | 11.8 | 35.3 |
| 20 | floorlight | 12.5 | 27.1 | 23 | mist | 134.7 | 134.8 |

811 s, exit 0. Probe of the worker: 0.88% of the blocks off by a quarter, mean difference 4.2% (8 samples against
the 256-sample reference; smoke limits 3% and 10%). I looked at the background, the snack piece with the fountain
and the scene-light map: right shapes, right colours, 8-sample grain.

Pack on the smoke result (`--rehearse`: missing background phases filled with phase 0 so the base, loop, video
and still code runs): 1,901 checks, 0 failures, 164 s. Numbers that only production quality can settle:
- indoor wet question at 8 samples: 0 / 36 / 10 / 56 pixels over 8/255 (partition_left, partition_right, boxoffice,
  snack). Noise at this quality; not a result.
- marquee body probe at 8 samples: mean 4.9, p99 60 against `out10m`. Not a result either, but it may also fail at
  production quality (the entrance light is new, the capture is not Brief 83's). Then the pack stops on that check
  until someone has looked; there is no re-coloured body.
- street gate at 8 samples: mean 2.3, 99th percentile 10.7.
- sign and item sprites: 32 / 90 / 79 apart from the live ones (the rig spot is dark now): replaced.

Not covered by the smoke: `dry`; outdoor pieces at phases 16 / 32 and 32 of the 41 depth pieces, among them
`bridge_board` with its group set again; 7 of 8 doors and 5 of 6 poses; `wc_vacant`; 44 of the 48 marquee phases.
Not exercised in the pack: a complete (not partial) run, the carry-over comparisons for doors and restroom
pieces, a merged wet sheet.

## Estimate (from these times and the measured ones of Briefs 56, 94, 95, 96; not a benchmark at production settings)

This scene is heavier than Brief 96's: the probe crop took 37 s here against 26 s, the draft still 88 s against 63-67 s.

| Item | Count | Seconds each on an RTX 4090 class card |
|---|---:|---:|
| Background phase, dry | 50 | 85-120 |
| Depth-piece capture | 63 | 15-21 |
| Door pose, restroom light | 50 | 12-17 |
| Chase, tubes, TV glow | 3 | 60-120 |
| Marquee (6 captures, 98 display passes) | 1 | 240-420 |
| Poster, scene-light map, sign, carried | 4 | 20-90 |
| Mist | 1 | 80-140 |
| Scene load and probe, per worker process | about 20 | 60-80 |

**2.0-3.0 GPU-hours.** Cross-check: Brief 96's 316 items took 3.6 pod-hours on five A40s (50 minutes); this job's
mix comes to about 3.9-5.5 A40 pod-hours. Wall time on 5 pods with several workers each: **25-40 minutes on 4090s,
45-65 minutes on A40s** (what RunPod had on 12-13 Nov). **Final $1.6-3.3, canary $0.2-0.4** at the rates of those
runs ($0.44-0.69 per pod-hour; not a current quote). $6 is enough.

Commands for Claude, from `roxy3d/` in Git Bash, **only with the owner's spend approval**; neither was run. Both
refuse to start without `MAX_HOURS` (hours per pod, the money limit) and check the bundle's SHA-256 first.

```bash
MAX_HOURS=0.5 bash lobby104/run104-test.sh       # one pod, items 1-23 at full quality; worst case $0.45
MAX_HOURS=1.2 bash lobby104/run104-final.sh      # five pods, all 172 items; worst case $5.34
```

Worst case together $5.79 (pods running to their cap at $0.89/h, the dearest GPU of the list on 12 Nov). GPUs:
4090, A6000, A40, 3090. The helper's own guard wants at least $5 of credit on the account at each start. On A40s
the final's cap of 72 minutes is not far above the slow end of the estimate; a run stopped at the cap keeps its
finished items and is resumed with `MULTI_RESUME=1`, which would need a new limit from the owner.

After the canary (scratch folder outside the packs), then after the final (`out10t`, `out10tps`, `out10tm`,
`out10tl` must not exist):

```bash
../tools/blender-5.2.3-windows-x64/blender.exe -b --factory-startup --python-exit-code 1 --python lobby104/pack104.py -- lobby104/result104-test <scratch>/out10t --partial
../tools/blender-5.2.3-windows-x64/blender.exe -b --factory-startup --python-exit-code 1 --python lobby104/pack104.py -- lobby104/result104
```

What to read in the canary's `validation.json`: `wet.pieces` (merged sheets or none), `marquee_pack.
body_probe_against_out10m`, `street_gate`, the piece timings in `frames.json`, and the pictures of items 8 (fountain
at 4K), 15-18 (light pieces) and 20 (scene-light map).

## What the page must do (complete list in `manifest.brief104.page_must`)

1. `?artdir=out10t&mistdir=out10t`, with `out10tps`, `out10tm`, `out10tl` instead of `out10ps`, `out10m`, `out10l`.
2. Marquee: `out10tm/marquee.json` only; no `merged.json` / `merged2.json`. `marquee_chase_under_*` under every
   walker (z 5), `marquee_chase_on_<slice>` just above that slice.
3. Poster: one piece, the body. Jukebox: an ordinary occluder; its tubes are the plus-lighter layers of the props
   pack. TV: only `tv_glow` is left; the picture goes above it as before.
4. `?marquee=0`, `?leader=0`, `?props=0` still hide bodies and animated light; the baked light and shadow stay, and
   `?props=0` cannot hide jukebox or TV any more.
5. Wet loops: none (or the merged sheets the manifest lists: 2 frames, 2 fps).
6. Chatter light indoors from `manifest.scene_light` (`light_floor.png`): a magenta / cyan rim or a 15-20% lift;
   check with `?everyone=1`. Outdoors `light.png` as before.
7. Open from the critiques: dim pasted film posters to 60-70%; the carried items that cannot be rendered again stay
   as bright as they are.

## What fell short or differs from the plan

- **Nothing was rendered at production settings** except the probe reference and two tuning crops; the smoke was
  cut short on the owner's word. The canary run covers it.
- **Kick-panel band not closed** (above). **Kicker:** it was on the falls already; narrowed, not moved off a bowl.
- **Marquee:** the bulbs' glow that spills past the canopy's edge (Brief 83's kernels, a few pixels) is in no
  picture of this pack while the bulbs sit at their base; the body chase sheets still carry it. Receiver chase is
  solved without those kernels. If the body probe fails, a person decides.
- **`light.png` does not carry the interior pools**, by its contract; `light_floor.png` does. The page has to read
  the new map: a page change the brief did not name.
- **Item sprites:** only Buddy and clipboard can be rendered again (the models of popcorn, soda, stub, ticket, caps
  and wet print are not in the scene). In the dark lobby the two come out 80-90/255 darker than the live ones.
- 172 items, not about 190. Two more pack folders than the brief names (`out10tm`, `out10tl`).
- The "street stays" gate leaves out the marquee's area; the plan's gate could not hold there once the marquee
  is baked.
- The smoke's test pack is not kept (scratch folder outside the project, deleted): only its manifests, validation
  and checksums in `smoke104/pack-proof/`, written before two last small edits of `pack104.py` (restroom-light
  mask, `--keep-item-sprites`), which were not run again.
- Under Linux and on a pod nothing ran. Several workers on one GPU with this scene: not tried.

## Files and runs

`lobby104/`: `make_prod_scene104.py` (+ `prod_scene104.json`, `.log`), `build_bundle104.py` (+ `bundle104.json`),
`bundle104/bundle/` (source of the archive: `job104.py`, `pipeline.py`, `render67.py`, `run.sh`,
`probe_reference.npz`, `pipe/`, `cache/`, `live/`), `roxy-cloud-bundle-104.tar.gz` and `.sha256`, `pack104.py`,
`run104-test.sh`, `run104-final.sh`, `smoke104.ps1`, `blender104.ps1` (runner: background mode only, refuses beside
another Blender or Godot), `local_check104.sh` (the whole chain; written, not run as one), `smoke104/` (extracted
bundle, the run, the unpacked result, logs, `pack-proof/`), `inputs104.sha256`.

Blender ran 11 times in background mode, one at a time, `tasklist` checked before each (no other Blender or Godot
was running): 1 read-only survey, 1 tuning run (4 coarse register crops, 2 native fountain crops), 4 scene builds
(two stopped on my own checks before saving), the probe reference, the smoke, the pack step 3 times (one stopped
on my typo before loading). About 20 minutes of GPU. The survey, tuning crops and the test pack were outside the
project and are deleted. No Godot, no cloud. `PROGRESS.md` not written by me. Nothing committed.

STATUS: STAGE 3 PREP COMPLETE - PRODUCTION SCENE (DRAFT 37 + ROCK X1.3, KICKER ON THE UPPER FALLS, REGISTER CONES 50 DEG; MARQUEE AND POSTER AS UNSEEN CASTERS, JUKEBOX A DEPTH PIECE, TV IN THE BACK WALL; LIGHT LINKING 59 OF 64); BUNDLE lobby104/roxy-cloud-bundle-104.tar.gz (29.8 MiB, 172 ITEMS, CANARY = ITEMS 1-23) FITS THE MULTI-POD HELPER; run104-test.sh AND run104-final.sh REFUSE WITHOUT MAX_HOURS; 23-ITEM SMOKE AT 8 SAMPLES THROUGH THE HELPER'S WORKER PASSED (811 S, COLLECTION CHECK OK); pack104.py RUN ON IT INTO A SCRATCH FOLDER (1,901 CHECKS, 0 FAILURES, PARTIAL); ESTIMATE 2.0-3.0 GPU-HOURS, 25-65 MIN ON 5 PODS, $1.8-3.7 WITH THE CANARY, $6 ENOUGH (TEST MAX_HOURS=0.5, FINAL MAX_HOURS=1.2, WORST CASE $5.79); NOTHING AT PRODUCTION SETTINGS LOCALLY (SMOKE CUT SHORT): WET-LOOP QUESTION, MARQUEE BODY PROBE AND STREET GATE ARE SETTLED BY THE CANARY; KICK-PANEL BAND NOT CLOSED (COUNTER SHADOW); FOUND: out10s bridge_board PIECE IS BLACK IN THE LIVE PACK; NO CLOUD, NO LIVE PACK, PAGE, cloud/ FILE, DRAFT OR EXISTING BLEND CHANGED, NOTHING COMMITTED; STOP.

# Stage 3 fix (paste_wall), 17 Nov 2026 (Claude Opus 5.5, local only)

No RunPod call, no pod. No `cloud/` file, `cloud-render.sh`, pack, page or existing .blend changed. Blender in
background mode only, one job at a time (tasklist clear before each): 2 read-only scene inspections, 1 render.

**Cause.** Not a lost group. `paste_wall` has one object, `P9 ad blank paste_wall`, with `cloud_group` set, visible,
not switched off. The camera never sees it: it sits behind its own ad glass and frame and the CABGE shop front
(timber bay, display window, door) built in front of it. Ray casts from the poster toward the camera: 864 of 864 hit
a camera-visible background object first (`fix104/inspect_paste104.json`). So the piece is empty, and has been since
`out10`: `occ_paste_wall.png` (67 x 74) is alpha 0 everywhere in `out10`, `out10i`, `out10r`, `out10s` (only `out9`
had pixels). The new guard in `job104.do_fg` ("depth piece ... is empty", added for the bridge board) stops on it.
Item 98 (`fg_entrance_neon_000`) is not broken: with CHUNK=2 it shares chunk `000048` with item 97, and the worker
stops at 97 before it reaches 98.

**Fix** (`lobby104/fix104/patch_paste104.py`, loaded as the first `--python` script before `cloud/multi_blender.py`):
in memory, for group `paste_wall` only, `do_fg` runs without that guard; same capture, products and paths. The
bundle, scene and `job104.py` are byte-identical (extracted sealed archive in `fix104/bundle`, `BUNDLE-SHA256SUMS`
check passes), so the receipts carry the job's own signature (`2a69b9c4...`). Each receipt has an extra `fix104` note.
No fixed .blend is needed: the scene is right. `pack104.py` keeps the live alpha for unchanged pieces, so the new
pack's `occ_paste_wall` is all zero, as in `out10s`.

**Render** (`fix104/render_fix104.ps1`: RTX 3050, 256 samples, native 4K grid, the helper's worker, FRAMES=97-98,
CHUNK=2) into `lobby104/fix104/run/test-frames/`, 72 s, exit 0. Probe passed (0 blocks over 25%, mean difference
0.006%). The worker's own `finalize` accepted both (`fix104/run/queue/SUCCESS.json`).
- 97 `fg_paste_wall_000`: 67 x 74 and 134 x 148, alpha 0 everywhere (linear alpha max 0.0); `out10s`: the same.
- 98 `fg_entrance_neon_000`: 101 x 141 / 202 x 282; alpha IoU with `out10s/occ_entrance_neon` 0.999 (1x) / 0.998
  (2x), 6,823 vs 6,825 px; mean luma on solid pixels 33.7 vs 33.0.

**What a valid item is on the volume** (`multi_queue.py`, `multi_blender.py`, `job104.py`): `frames/NNNNN.json`
(global_frame, resolution [1920,1080], signature, item key, products with hashes, probe passed), `frames/NNNNN.png`
and `NNNNN_depth.png` (their hashes in the receipt), every listed file under `frames/products/`; then
`queue/receipts/NNNNN.json` and the chunk in `queue/done/`. A worker finalizes when `pending/` and `claims/` are
empty, checks all 172 again and writes `SUCCESS.json`; it never renders an item whose receipt is valid.

**Injection is sound.** `lobby104/inject104.py` checks the two items at home, uploads one tar to a pod that has the
volume, installs the files beside their targets with hash checks (receipts last), writes the two queue receipts and
moves chunk `000048` to `done/` under the queue's own locks, then verifies all 172 as `valid()` and `finalize()` do.
It refuses if `SUCCESS.json` exists, a worker reported in the last 10 minutes, pod receipt 96 has another
signature, or a target exists with other content. Rehearsed on a fake 172-item run folder in a scratch folder
(deleted): "FINALIZE READY: yes", a second run changes nothing, then `cloud/multi_blender.py` (plain Python, no
Blender) finalized it (172 items, 0 rendered) and `multi.verify_unpack` accepted the archive.

```bash
# from roxy3d/, Git Bash. Needs a running pod with SSH and the network volume bhsspa7zho (EU-RO-1) mounted; a CPU pod is enough
../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe lobby104/inject104.py --pod <POD_ID>      # must end "FINALIZE READY: yes"
# then (delete the inject pod first if the helper does not know it):
MULTI_RESUME=1 FRAMES= MULTI_STATE="$PWD/cloud/cloud-state-104-final.json" OUTDIR="$PWD/lobby104/result104" \
  bash cloud/cloud-render.sh multi 2>&1 | tee lobby104/run104-resume.log
```

The resume starts a reader, then one GPU pod (the top-up rule takes 1 above 75% done; needs $5 of credit). Its worker
renders nothing, finalizes and writes `SUCCESS.json`. The helper downloads, checks and unpacks into
`lobby104/result104`, then deletes the pods and the volume.

**If injection is refused:** copy the run's `frames/` folder home from a pod with the volume, add the two items
from `fix104/run/test-frames/`, run `pipeline.finalize` of `fix104/bundle` on it, `multi.verify_unpack` into
`lobby104/result104`, then `multi-cleanup`.

STATUS: STAGE 3 FIX READY - CAUSE: paste_wall's only object is hidden behind the CABGE shop front (piece empty since out10, also in out10s), job104's new empty-piece guard stops on it; item 98 only shares its chunk; ITEMS 97-98 RENDERED AT HOME AT PRODUCTION SETTINGS THROUGH THE HELPER'S WORKER WITH AN IN-MEMORY PATCH (paste_wall empty as in out10s; entrance_neon IoU 0.999 with out10s); lobby104/inject104.py WRITTEN AND REHEARSED (FINALIZE READY, WORKER FINALIZE AND verify_unpack PASS ON A FAKE RUN); NOT RUN AGAINST RUNPOD; NOTHING COMMITTED.
