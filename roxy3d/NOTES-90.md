# Brief 90 - auditorium entrance corridor, full set for the page (draft 14)

10 Nov 2026. Render agent: Claude Fable 5.2. The approved styled corridor (`qa11/cinema_draft_14_corridor.png`, owner:
"Keep draft 14") is now a full page set, draft **14**, next to the live draft 13. No draft 13 file was touched and no
page was edited: `auditorium.html` keeps loading draft 13 until the owner promotes 14.

The two stills to look at: `qa11/cinema_draft_14.png` (house lights up) and `qa11/cinema_draft_14_dim.png`
(lights down).

## Result in short

| Item | Result |
|---|---|
| Lit background | Pixel-identical to the approved draft over the whole 1920x1080 frame (0 changed pixels); 0 changed pixels against draft 13 outside the corridor. No render was needed. |
| Lights-down background | Draft 13's dim hall with the corridor keeping its look: mean change against the lit corridor 0.54 byte (mean luminance -0.41 of 255). 0 changed pixels against draft 13 dim outside the corridor. |
| Depth slices | No new slices: nothing in the corridor is ever in front of a walker. 19 draft-13 slices (`depth_071`..`depth_089`) got draft-14 copies with refreshed colour, same alpha, same rectangles. The other 140 are referenced from draft 13. |
| Door sheets | New for both states (a thin strip of corridor floor lies inside the door cutout). Same geometry, 16 frames, 4 columns, 18 fps, hold frames 5..10, frame rectangle and alpha. |
| Door cutouts | Unchanged: the draft-13 files are reused (referenced from layout 14). |
| Layout | `cinema_layout_14.json`: 264 changed values against layout 13, all listed below; everything else identical. |
| Rendering | 15 small border renders of the corridor layer only, 59.5 s in total on the local RTX 3050. The hall was never re-rendered. |
| Not done | No page test: the page needs the changes in "What the page must change" first. |

## Files delivered

All inside `qa11/`. 261 files, 111.3 MB. Every file with size and SHA-256 is in `qa11/corridor/validation90.json`
(`delivered_files`); the main ones:

| File | Bytes | SHA-256 |
|---|---:|---|
| `cinema_draft_14.png` (1920x1080, RGB) | 1,290,029 | `bcc0372fdeb8f7e7ca57c4725b1518a0b4b2e529cc803b8020e149ecfd5a8024` |
| `cinema_draft_14@2x.png` (3840x2160, RGBA) | 6,110,167 | `b27c1538fc04d53e856498acf5f6abd47bf77cee60b3159dd3d9322c09c50e46` |
| `cinema_draft_14_dim.png` | 939,957 | `d90d33ae0fe5feb38e7bec56b7c61dec4caff2f4d8713b4e4d4d23a7467e0c45` |
| `cinema_draft_14_dim@2x.png` | 4,765,256 | `cca221a6bc382169851984eebd6f143b96407ded98bcbd2b20a44bf58fdddf5d` |
| `cinema_layout_14.json` | 3,252,741 | `2fcdf1c9ab8e12f95c3d77f8014b848e0cb4bf3dc8e0d5ea1ef63b97c2708a44` |
| `draft14/door_entrance.png` (804x868) | 321,913 | `5ea0e06fdd7e2383568e5f2edc280cd2a463b2ae53eb6b031e054561888f86f9` |
| `draft14/door_entrance@2x.png` (1608x1736) | 1,218,247 | `721e4a01280a372f69cc3f326349fe0eaa89e5fe9c17040e8c4d006556bd8bcc` |
| `draft14_dim/door_entrance.png` | 244,011 | `1a12fa166b803a973ae46a05c8350b319a2d59f6b013ff201630e9df8685a203` |
| `draft14_dim/door_entrance@2x.png` | 963,496 | `1a64ee28d3f10a2a4fcb2d6fb3963fbe934cc23240101d142671d37e5c53fef3` |

| Folder | Files | Bytes | What |
|---|---:|---:|---|
| `draft14/slices/` | 38 | 54,363,011 | `depth_071`..`depth_089`, 1x and 2x, lit |
| `draft14_dim/slices/` | 38 | 36,227,519 | the same slices, lights down |
| `draft14_bands/` | 88 | 887,013 | the 44 band pieces (1x and 2x) whose pixels changed, lit |
| `draft14_dim_bands/` | 88 | 667,727 | the same 44 pieces, lights down |

All 260 PNGs passed a container check (signature, chunk CRCs, 8-bit, non-interlaced, inflated size). Backgrounds keep
draft 13's formats: 1x RGB, 2x RGBA with alpha 255.

Work files and evidence are in `qa11/corridor/`: `full90.py` (all Blender steps), `run90.sh` (runner, caches in
`runtime90/`, refuses to start while a `blender.exe` exists), `make_layout90.mjs`, `validate90.mjs`,
`corridor_full90_dim.blend` (the lights-down corridor scene), the numeric captures (`capture90_*.npz`,
`door_caps90_*.npz`), the per-step JSON (`lit_compose90`, `dim_build90`, `poses90_lit`, `poses90_dim`, `package90`,
`depth90`, `layout90`) and `validation90.json`, which gathers them. No review image, crop or comparison was written.

Reproduce from Git Bash (one Blender job at a time):

```bash
cd roxy3d/qa11/corridor
bash run90.sh full90.py lit-compose      # no render
bash run90.sh full90.py dim-build        # builds the dim corridor scene, 2 renders
bash run90.sh full90.py poses-lit        # 7 renders
bash run90.sh full90.py poses-dim B      # 6 renders
bash run90.sh full90.py package B        # no render, about 19 minutes (PNG compression)
bash run90.sh full90.py depth            # no render
node make_layout90.mjs prepare
(cd ../.. && LAYOUT=corridor/band90_layout.json node tools/band-slices.mjs qa11 64)
node make_layout90.mjs finish
node validate90.mjs
```

## How it was made

Brief 88's method, unchanged: the hall plate is never re-rendered. The scene has a `CORRIDOR_LAYER` view layer in
which every hall collection is a holdout, so a render gives the corridor alone over transparency. Its straight RGBA
display bytes are laid over the existing draft-13 4K background (`(src*a + dst*(255-a) + 127) // 255`), and the 1x
file is the exact 2x2 area reduction `(sum + 2) // 4` that draft 13 used. Where the corridor has no coverage the
bytes are draft 13's.

Production settings (checked by assertion before every render): Blender 5.2.3 LTS, Cycles OptiX on the NVIDIA GeForce
RTX 3050 6GB Laptop GPU, CPU device off, no cloud; native 3840x2160 grid, the production camera; adaptive 64-384
samples, threshold 0.007, seed 341997, filter 1.5, OptiX denoiser, AgX / Medium High Contrast, exposure 0.

Render borders (4K px, 24 px of padding, no crop, so nothing depends on how Blender rounds a border): the corridor
region x 0..754, y 1087..1882, and the door frame rectangle x 470..920, y 1054..1536.

### 1. Lit background

No render. The cached Brief 88 capture (`corridor_capture88.npz`, the very bytes the approved draft was made from)
was composited over `cinema_draft_13@2x.png` again.

| Comparison | Pixels | Changed | Max RGB-byte change |
|---|---:|---:|---:|
| 1x against draft 13, outside the corridor's support | 2,002,749 | 0 | 0 |
| 1x against the approved draft, inside the support | 70,851 | 0 | 0 |
| 1x against the approved draft, whole frame | 2,073,600 | 0 | 0 |
| 2x against draft 13 @2x, outside the support | 8,012,460 | 0 | 0 |

The support is the 70,851 pixels (281,940 at 4K) where the corridor capture has any coverage; bounding box x 0..365,
y 555..929 in stage px.

### 2. Lights-down background - what I did

The corridor was built into the draft-13 lights-down scene (`roxy_cinema_draft13_dim.blend`) with Brief 88's own
`build()` code, only the source scene and output paths redirected. All 57 corridor objects (geometry, materials,
lights) have the same signature as in the approved scene `corridor_draft.blend`. **The corridor's own lights are
unchanged**: two 3 W sconces, the 120 W ambient, the 160 W lower-wall fill, the 0.18 W doorway spill.

What differs between the lit and the lights-down hall in draft 13: the 37 hall lamps (sum 5,493 W lit, 1,848 W down),
the sconce-core emission (0.8 down to 0.032) and the world, which lights nothing in the lights-down scene. All 37
hall lamps are light-linked to hall collections, so they never light the corridor directly; what reaches it is their
bounce, and the world's ambient.

I rendered both readings and delivered **B**:

| Corridor against the lit draft 14, 1x, inside the support | A: draft-13 dim world (no world light) | **B: world ambient kept (delivered)** | Two renders of the same lit scene |
|---|---:|---:|---:|
| Mean absolute RGB-byte difference | 1.30 | **0.54** | 0.047 |
| Mean luminance change (of 255) | -1.12 | **-0.41** | 0.000 |
| Max RGB-byte difference, all support pixels | 13 | **13** | 1 |
| Max on fully covered pixels | 9 | **8** | - |
| Pixels differing by more than 4 | 1,129 | **430** | 0 |
| Floor mean luminance (lit 10.29) | 9.35 | **10.10** | - |
| Wall without posters (lit 11.42) | 10.22 | **10.78** | - |
| Lower wall (lit 9.29) | 7.92 | **8.12** | - |
| Posters (lit 20.38) | 18.38 | **20.00** | - |
| Floor within 1.56 m of the door (lit 4.04) | 3.24 | **3.74** | - |

B is the lit scene with only the hall's own lamps and sconce cores at their lights-down values: exactly "only what
the hall's own light really contributes may change". The world ambient is not a hall lamp, and it is part of the
approved look (taking it away, A, darkens the floor by 9%), so B keeps it. What remains in B is the lost bounce of
the hall lamps, largest on the dark lower wall (-1.2 of 255). For scale: the hall's whole-frame mean luminance goes
from 17.67 to 8.89 between the two draft-13 stills. The largest single differences (9..13 bytes, 16 pixels) are
corridor edge pixels where the lit and dim hall plates show through partial coverage.

The lights-down composite uses the lit capture's alpha bytes, so lit and dim coverage are identical (the dim render's
own alpha differed on 295 pixels by at most 8 bytes: noise). Outside the support the lights-down background equals
`cinema_draft_13_dim` exactly: 0 changed pixels of 2,002,749 at 1x and of 8,012,460 at 2x.

If the owner prefers A, `capture90_dimA.npz` is kept: `poses-dim A` (6 renders, about 18 s) and `package A` redo it.

To look at in the dim still: the padded door and the hall's rear wall go dark while the corridor beside them stays
lit. The corridor lights are linked to the corridor only, as in the approved lit draft, so they do not light the door.

### 3. Depth - no new slices, 19 refreshed ones

**No corridor depth slices are needed.** The near side is open (no wall, kerb, ceiling or end wall), the wall with
the posters and sconces is on the far side, behind every walker, and the floor is flat. Checked with rays against the
real scene geometry and the page's own key (`u + v + zpx / 90`): 2,414 walker positions (the whole extended entrance
route every 0.05, every row's legroom line, all 135 seats seated at 1.2x, both stair aisles, the row branches, the
cross aisle) with a generous sprite box (half-width 40k instead of 33.3k, 45k tall times the seated scale, plus 25k
of hop). **Pixels where corridor geometry is in front of a walker: 0.** The only corridor pixels nearer than a walker
are floor pixels below its foot line, where its shadow is drawn; with no corridor slices the shadow is never clipped.
The corridor's first-hit key runs from 15.30 to 26.06 (z-index 2530..3606).

**Nothing else covers a corridor walker.** Page-size sprite on the centreline, fraction not covered:

| v | Rays, door closed | Layers, door closed | Rays, door open | Layers, door playing |
|---:|---:|---:|---:|---:|
| 22 .. 15.4 (12 positions) | 1.000 | 1.000 | 1.000 | 1.000 |
| 15.3 | 0.980 | 1.000 | 1.000 | 1.000 |
| 15.2 | 0.871 | 0.914 | 1.000 | 1.000 |
| 15.12 (door wait point) | 0.738 | 0.740 | 1.000 | 1.000 |
| 14.9 (inside, draft-13 route) | 0.349 | 0.340 | 1.000 | 1.000 |

So the corridor is clear, and within about 0.3 m of the closed door the camera-facing sprite pokes into the door
plane and the door's slices (`depth_085`..`087`) start to cover it, exactly as in draft 13 at its spawn point. That is
why the wait point stays where it was: the door has to be playing (cutout active) before a walker comes closer than
about v 15.3.

**Why 19 slices were refreshed.** The corridor's far wall and floor edge now cover a little of the hall's rear-left
outside wall: 2,651 fully covered pixels have hall geometry behind the corridor (none the other way round). Those
hall pixels sit in `depth_071`..`depth_089` (z-index 2450..2750). The page shows a slice piece whenever a walker or
the moving door is behind it, and the piece would then paint draft-13 pixels over the corridor. So these 19 slices
have draft-14 copies: same name, rectangle, z-index, key range and **alpha bytes**; RGB taken from the draft-14
backgrounds (lit and dim), the way draft 13 built its slices. Keeping the alpha is right because the corridor there
is in front of that hall geometry, so anything the slice covered is still covered.

Checks, all four sets (lit and dim, 1x and 2x), all 159 slices: visible slice pixels that differ from the background
0; background plus slices reconstruction, max RGB difference 0; lit and dim alpha identical.

Bands: `tools/band-slices.mjs` (64 px, default gap) on the 19 slices gave 458 pieces with exactly draft 13's
rectangles; every slice rebuilds exactly from its pieces. 414 pieces are pixel-identical to draft 13's in all four
images and keep their draft-13 files; the 44 that changed are in `draft14_bands/` and `draft14_dim_bands/`. Layout 14
still has 159 slices and 2,332 pieces per state.

Not refreshed, on purpose: 140 slices whose rectangles overlap the corridor region only with alpha 0. Their hidden
RGB there is still draft 13's (123,847 such pixels at 1x lit). It is never drawn.

### 4. Entrance door sheets

New for both states. 629 corridor pixels at 4K (164 at 1x) lie inside the door's cutout polygon: the strip of
corridor floor along the threshold. The sheets were made as Brief 88 planned: each pose's frame is the draft-13 frame
with a pose-specific corridor capture laid over it (leaves posed with draft 12's `pose()`, 79 degrees, the same five
openings), the closed frames 0 and 15 are the new background itself, and the 1x sheet is the 2x2 reduction.

| Check | Lit 1x | Lit 2x | Dim 1x | Dim 2x |
|---|---|---|---|---|
| Sheet / cell px | 804x868 / 201x217 | 1608x1736 / 402x434 | 804x868 / 201x217 | 1608x1736 / 402x434 |
| Frame 0 = frame 15 | yes | yes | yes | yes |
| Closed frame = new background (whole cell) | exact | exact | exact | exact |
| Held-open frames 5..10 identical | yes | yes | yes | yes |
| Frames f and 15-f identical | yes | yes | yes | yes |
| Alpha bytes = draft-13 sheet = static cutout | yes | yes | yes | yes |
| Visible pixels changed against draft 13, per frame | 135..139 | 547..552 | 126..131 | 527..533 |
| Largest visible change (RGB bytes) | 11 | 13 | 4 | 5 |

Every changed pixel lies under corridor coverage. The corridor inside the cutout differs between poses by noise only
(mean 0.15..0.40 byte against the closed capture; the closed pose rendered twice differs by 0.16).

**Static cutouts: reused.** Door geometry, swept envelope and slice alpha are unchanged, so the cutout is the same
polygon with the same bytes; the list of slices it masks (`depth_079`..`depth_099`) was recomputed and is still
exact. Layout 14 points at `draft13/door_static_cutout(@2x).png` (and `draft13_dim/...` in the field the page does
not read).

### 5. `cinema_layout_14.json` against layout 13

Written with the same serializer as layout 13 (which round-trips byte for byte), so no number changed its spelling.
35 of 37 top-level keys are identical (rows, seats, stairs, screen, camera, tunnel, litter and the rest); a new
`corridor` key is appended. 264 changed values:

| Path | Layout 13 | Layout 14 |
|---|---|---|
| `page_layers.image`, `image_2x` | `cinema_draft_13.png`, `@2x` | `cinema_draft_14.png`, `@2x` |
| `page_layers.dim.image`, `image_2x` | `cinema_draft_13_dim.png`, `@2x` | `cinema_draft_14_dim.png`, `@2x` |
| `page_layers.entrance_door.file`, `file_2x` | `draft13/door_entrance...` | `draft14/door_entrance...` |
| `page_layers.dim.door_file`, `door_file_2x` | `draft13_dim/door_entrance...` | `draft14_dim/door_entrance...` |
| 19 lit + 19 dim slices: `file`, `file_2x` (76 values) | `draft13(_dim)/slices/...` | `draft14(_dim)/slices/...` |
| 44 lit + 44 dim pieces: `file`, `file_2x` (176 values) | `draft13(_dim)_bands/...` | `draft14(_dim)_bands/...` |
| `walk_route.rear_portal_to_cross_aisle` | 20 points from `[1.45, 15.12, 0]` | 25 points: `[1.45, 24, 0]`, `[1.45, 22.5, 0]`, `[1.45, 20.5, 0]`, `[1.45, 18.5, 0]`, `[1.45, 16.5, 0]`, then the old 20 unchanged |
| `page_layers.spawn.point` | `[1.45, 15.12, 0]` | `[1.45, 24, 0]` |
| `page_layers.spawn.door_wait_point` | absent | `[1.45, 15.12, 0]` |
| `corridor` | absent | new object |

Unchanged on purpose: the static cutout paths, every slice and piece rectangle, name and z-index,
`spawn.wait_uvzpx`, `spawn.wait_seconds`, `walk_route.passage_to_back_row` (not read by the page; it still starts at
the door) and all provenance fields (`brief`, `image`, `render`, ...), which still describe draft 13.

`corridor` holds: `floor_outline_uvz` / `_stage_px` / `_in_frame_stage_px`, `clear_u` [0.35, 2.55], `clear_v`
[14.94, 24], `centre_u` 1.45, `visible_v` (far edge to v 21.33, centreline to 22.43, near edge to 23.53, a whole
sprite in frame to 21.87), `far_wall`, `near_side`, `runner_u`, `posters` (title, quad in uvz and stage px, TL TR BR
BL), `sconces` (centre and face quad in stage px), `route` (the five new points, `door_wait_point`,
`door_wait_route_index` 5), `art` (support box and pixel count), `depth` and `lights_down` notes.

Every picture the layout names exists (9,976 paths: 260 draft 14, 9,716 draft 13); no draft-14 file on disk is
unnamed.

## What the page must change to use draft 14

Line numbers are `auditorium.html` as of 10 Nov 2026 (3,113 lines). With the page unchanged and `?draft=14`, the art
loads and draws correctly, but walkers behave wrongly in the corridor for the reasons below.

1. **Door wait point** (`spawn()` ~1361-1385, `addJanny` ~1490, the re-entry at ~1719, the usher at ~1788). Today a
   newcomer is placed at route point 0, `playDoor()` runs at once and they wait `DOOR_WAIT` there. Point 0 is now
   `[1.45, 24, 0]`, off-screen (stage x -67), 8.88 m from the door: 6.6 s of walking at 1.35 m/s, while the sheet is
   over after 16/18 = 0.89 s. The page has to let them walk and play the door (and hold for `DOOR_WAIT`) when they
   reach `page_layers.spawn.door_wait_point` = route index 5 (`corridor.route.door_wait_route_index`). The door must
   be playing before a walker is closer than about v 15.3, or the closed door's slices clip the sprite (table above).
2. **Tunnel test** (`step()` ~2260): `u < 2.9 && v > 8.8 && z < 10` is true for the whole corridor, so corridor
   walkers would count as unseen: no name, speech held, status "tunnel", and a director follow would frame the tunnel
   mouth `[2.1, 9.4, 8]` (~2386). It needs an upper bound at the door, for example `v < 14.9` (`tunnel.covered_v` is
   [9.4, 14.9], the door plane 14.868). Side effect to decide: `w.seen` then turns true in the corridor first, so the
   name timer and the janny's "on duty" float (~2261) fire there instead of at the tunnel mouth.
3. **Warm-up of the entrance** (`entryAhead()` ~884-892) takes route point 0 as the place where someone appears; that
   is now off-screen. It should use the door wait point, and the arrival there is about 6.6 s after the spawn.
4. **People leaving** (`janLeave` ~1524, `usherLeave` ~1847, house-out and kicks): the reversed route now ends at
   v 24, so they walk out along the corridor and off the left edge. No door plays for leavers today; in draft 13 they
   vanished just outside. Now they would be seen walking through a closed door, so the door should play when a leaver
   reaches the inside of it (route index 7, `[1.45, 14.55, 0]`, or index 6).
5. **Spawn gap** (`spawn()` ~1364): the "nobody within `WALK_GAP` of the spawn point" test now runs at the off-screen
   start. That works as it is; walkers then queue along the corridor behind one waiting at the door.
6. **Lights down.** No change to the crossfade: same file roles, dim twins matched by name and index, identical lit
   and dim alpha, and the corridor differs by under 1 byte on average between the two states, so nothing moves in it
   during the fade. One thing to decide: `.lights-down .w .em { filter: brightness(.5) }` (line 60) also darkens
   walkers in the corridor, which stays lit; the page may want to exempt walkers with v >= 14.94. The fallback
   without dim art (`lights-flat`, `brightness(.45)` on `#bg`) would darken the corridor too, but draft 14 has dim
   art.
7. **Door cutout.** Nothing to change: same file, rectangle, polygon and slice list.
8. **Depth.** Nothing to change: no new slice names; the layout mixes draft-13 and draft-14 files, which the loader
   takes as given.
9. **Promotion** (only when the owner says so): test with `auditorium-qa.html?draft=14&everyone=1`; then the default
   `'13'` in the `DRAFT` line, the files to track with the README recipe (`package/art.js` reads them from the
   layout: 261 draft-14 files, 111 MB, plus the 9,758 draft-13 files still referenced, 503 MB). `standby-server.js`
   (174), `web/server.js` (87), `shared/room.js` and `shared/transition.js` (667) name `cinema_layout_13.json`
   directly; they read rows and seats, which are identical in layout 14, so they keep working either way.

## Render times

| Pass | Seconds |
|---|---:|
| dim corridor layer, variant A (not delivered) | 8.74 |
| dim corridor layer, variant B | 7.67 |
| lit corridor layer re-render (validation only) | 7.42 |
| lit door rectangle, pose 0 (check only) | 3.05 |
| lit door rectangle, poses 1..5 | 3.18, 2.98, 2.89, 2.91, 3.09 |
| dim door rectangle, pose 0 (check only) | 3.38 |
| dim door rectangle, poses 1..5 | 2.99, 2.78, 2.82, 2.75, 2.79 |
| **Total, 15 passes** | **59.45** |

11 of the 15 passes feed delivered files (36.9 s); 4 are checks. The lit re-render inside the border differs from the
approved capture by at most 3 bytes at 4K (mean 0.05) with identical alpha, which shows the pipeline reproduces the
approved render. Building the dim corridor scene took 1.5 s. Outside Blender's renderer: the packaging step took
1,130 s (almost all of it PNG compression of the 76 slice files), the depth check 6.5 s.

## Preservation

- 33,729 protected art files (everything in `qa11/` outside `corridor/`, `out10/`, `out10m/`, `out10l/`,
  `out10mist/`; 10,033 of them draft 13) have the size and nanosecond mtime recorded before Brief 88: 0 changed, 0
  missing.
- 14 source files (both draft-13 blends, builders, draft-13 backgrounds, layout 13, the lobby scene) keep their
  SHA-256. `qa11/cinema_draft_14_corridor.png` is still `a58ad6f8...faf0ff3`; `corridor_draft.blend` was opened
  read-only and keeps its hash.
- New files in `qa11/` outside `corridor/`: exactly the 261 delivered ones.
- No page, shared script, server file, `AGENTS.md`, log or doc was written. No commit, no push, no cloud, no GUI
  automation. Before each Blender run `tasklist` showed no other `blender.exe`.

## Not checked, and limits

- **No page run.** Nothing was loaded in a browser; draft 14 has not been seen with real chat. The depth and door
  statements are computed from the scene and the delivered files with the page's formulas.
- **The lights-down reading (B) is my choice** of the two the brief allows; the numbers for A are above.
- **The fly-through video** (lobby to auditorium) was rendered with the draft-13 hall. I did not compare its last
  frame with draft 14; if it ends on the cinema view, the corridor would appear at the cut.
- Hall light that falls onto the corridor floor while the door is open cannot be shown: the door sheet only draws
  inside its cutout. Measured over the corridor in the door rectangle, an open door changes it by at most 4 bytes at
  4K (mean 0.14), so nothing visible is lost.
- The corridor's bounce onto the hall (door face, rear wall) is not in the hall plate, as in the approved draft.
- Inherited from draft 13: the fixed-z door sheet, and the sprite poking into the door plane at the wait point.

STATUS: BRIEF 90 DRAFT 14 FULL SET DELIVERED AND VERIFIED (LIT BACKGROUND = APPROVED DRAFT, 0 CHANGED PIXELS; DRAFT 13 UNTOUCHED; LIGHTS-DOWN CORRIDOR KEEPS ITS LOOK, VARIANT B; NO NEW DEPTH SLICES, 19 REFRESHED; DOOR SHEETS NEW, CUTOUTS REUSED; LAYOUT 14 WRITTEN); LOCAL GPU ONLY, 59.5 S OF RENDERING; PAGE NOT EDITED AND NOT TESTED; STOP.
