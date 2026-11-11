# Brief 94: lobby props layer render (claw machine, jukebox, TV)

Render agent: Claude Fable 5.2. Two stages; this file is filled in as they finish.

## Stage A (10 Nov 2026): capture job built and smoke-tested. No production render yet.

Everything is in `props/layer94/`; the full account is **`props/layer94/CAPTURES.md`**. Nothing else in the project
was written; `out10p/` and the check image do not exist yet.

- **Scene copy** `scene94.blend` (22.7 MB): `props_draft93.blend` saved with all 17 images and 9 fonts packed and
  no absolute path. Compared datablock by datablock with the source after saving: no difference (`job94.json`).
  The look of draft 31 is untouched.
- **Capture script** `capture94.py`: 30 captures as cropped borders of the production camera, to 32-bit EXR, with
  receipts and a manifest; any subset by name; samples, device and resolution are arguments; finished captures
  are skipped on a second run. Production settings are the defaults (native 3840 x 2160 grid, 256/64 adaptive
  samples, threshold 0.01, seed 1701, OptiX and its denoiser, Blackman-Harris 2.5 px).

  ```
  blender -b --factory-startup --python-exit-code 1 scene94.blend -P capture94.py -- --out out94
  ```
- **Captures** (borders in stage px): claw machine 12 in `870, 780, 420, 300`; jukebox 9 in `1220, 660, 320, 320`;
  TV 9 in `900, 500, 260, 190`. Per prop: the body alone (complete, and as the camera sees it), the full scene
  with everything on, with the prop's emitters off, and with the prop removed, and one pure-light capture on black
  per piece: claw always-on and four bulb groups; jukebox always-on, pink tube with pool, teal tube; TV power light
  and screen glow. The claw machine's captures are rendered without the storefront glass (the page draws it), plus
  one with the glass as the reference for the comparison with draft 31.
- **Smoke run** (16 samples, half resolution, RTX 3050): all 30 captures, exit code 0, 154.9 s of rendering, 218 s
  for the process. I looked at every result. Two things were wrong and are fixed: Blender's object holdout flag
  left grainy patches on glass objects (the script now uses the pack's own camera-holdout materials), and the first
  borders cut off light at an edge (all three widened and measured again).
- **Estimated production time on the RTX 3050: about 9 to 10 minutes of rendering** (range 8 to 15), from the smoke
  run's fixed cost per capture and the measured production borders of Briefs 86 and 93. Not measured.
- **Planned page elements: 18** (claw 9, jukebox 6, TV 3); up to 3 more if light or shadow on another sprite has
  to keep that sprite's depth, 2 fewer if the props share their under-walker shadow and light images.
- **For a cloud machine:** three files, 21.7 MiB (`scene94.blend`, `capture94.py`, `job94.json`) and Blender 5.2.3
  for Linux; it sends back the output folder (72 files, about 100-120 MB) and the log.
- **Found, for stage B:** the popcorn machine in front of the TV shares the worktop's pack slice
  (`partition_right_01`), so the TV piece has to carry the popcorn machine's pixels where they cover it (capture
  `tv_body_front`); the palm sorts by its slices (2594 and 2646), so the jukebox's front band is clamped below 2594.
- **Not proven:** a run under Linux (no Linux on this machine; portability was tested by running the copied folder
  from another place on Windows); OptiX on another GPU and driver; production time and memory; the border guard
  bands at production quality.

STATUS: STAGE A COMPLETE - CAPTURE JOB BUILT IN props/layer94/, ALL 30 CAPTURES SMOKE-RENDERED AND LOOKED AT, CAPTURES.md WRITTEN; NO PRODUCTION CAPTURE, NO out10p/, NO CHECK IMAGE; LINUX RUN NOT TESTED; WAITING FOR THE MESSAGE THAT SAYS WHERE THE PRODUCTION CAPTURES RUN; STOP.

## Stage B (11 Nov 2026): the pack `out10p/`, staged. No page, no live pack touched.

![Layer check: full frame from the packs, all animated pieces on](qa10/props-layer-check.png)

**16 page elements** (claw machine 6, jukebox 7, TV 3), each at 1x and native 2x: 35 files, 661,227 bytes. With every
animated piece on, the page stack shows draft 31; with all of them off, the three props with only their always-on
lights. Jukebox and TV match their captures inside the old gates (mean <= 2, p99 <= 12 of 255). **The claw machine
does not fully:** behind the page's storefront glass its darkest parts stay lighter than in draft 31 (numbers
below), so `validation.json` says `passed: false`, `render_and_packaging_passed: true`. I looked at the check image
and at enlarged crops of the three props next to draft 31 before writing this. The look was not restyled; the
optional touches of critique-93 are not in.

### Captures (rendered by Claude on RunPod, verified here)

RTX 4090, Linux, Blender 5.2.3, OptiX, production defaults, all 30 captures in one run: **139.5 s of rendering,
167.0 s for the run** (claw 63.5 s, jukebox 40.7 s, TV 35.4 s; full scenes 4.8-7.7 s each, bodies and light
captures 3.1-5.1 s). `props/layer94/stageb/verify_captures94.py` (result in `verify_captures94.json`), no problem found:

- 72 files as CAPTURES.md lists them (30 `.exr`, 11 `.pos.exr`, 30 receipts, manifest), 111.9 MB; every SHA-256
  equals its receipt; scene `bc403c8c…`, script `cfc43ea8…`, grid 3840 x 2160, 256/64 samples, seed 1701, filter
  2.5, OptiX device and denoiser, one machine, nothing skipped; sizes 840 x 600, 640 x 640, 520 x 380; the three
  black references are exactly 0; object and emitter counts equal the smoke run's; bodies have alpha, scenes are opaque.
- **Linux against Windows.** I rendered four captures again on the local RTX 3050 (`claw_body`, `claw_on`,
  `jukebox_on`, `tv_on`; 10.5, 44.2, 29.4, 17.2 s, as stage A estimated) into a temp folder and compared: mean
  difference 0.10-0.28% of the level, 0 to 17 pixels per capture that differ visibly, alpha equal. They were used
  for this comparison only and are deleted; **every piece comes from the one cloud run.**
- **The "Image … not available. Keeping packed image" lines** appear for all 16 packed textures that carry a stored
  path, not only three: Blender looks for the old path once, does not find it and keeps the packed data. No pink
  or wrong texture: the three full scenes agree with the local render (above), and the direct captures, shown
  through the approved glare and AgX, lie on draft 31's native insets with a median difference of 0.8-1.0 code
  values (lettering in Impact, JAMS, the snack signs and the standee are the same). The other 26 captures were not
  rendered twice; their sums agree with the full captures (next point).
- `dark + sum of light captures` against the direct full capture, linear: 0.89% (claw, no glass), 0.55% (jukebox),
  0.21% (TV) of the mean level.
- Guard bands at production quality (outer 8 px, before the fade): the props' own light is at most 0.8 / 0.35 /
  0.48 code values (claw / jukebox / TV), no kept geometry change reaches a border. No border had to be widened.

### How the pieces were made (scripts in `props/layer94/stageb/`)

1. `linear94.py`: per prop the states in linear light: prop absent, present with its lights off, + always-on
   lights, + each animated group in turn. On/off differences come from the pure-light captures, so they carry no
   render noise. The claw's states are put behind the storefront glass with the glass's measured transmission
   (0.515 / 0.522 / 0.528, fitted on the plush and lettering, r² 0.98) plus its reflections, so that "everything on"
   is the direct with-glass capture.
2. `display94.py` (Blender compositor only, 46 displays, 82 s): the scene's own glare graph and AgX Medium High
   Contrast +0.25 at 16 bits, each crop laid into a full stage canvas because the glare sizes are relative to the
   frame; 1x from the 2 x 2 mean in linear light. The marquee's separate 720p bulb-halo image is bypassed, as in Brief 86.
3. `page94.py` + `pack94.py` (53 s): the page's stack is rebuilt from `out10`, `out10m` (merged set), `out10l` the
   way `lobby-qa.html` orders it, and each piece is solved against it: the body through whatever the page draws
   over it, the contact shadow as black with alpha, what is still missing as light on top.
4. `verify94.py` (11 s, `verify94.json`, passed): reads the pack back from disk: checksums, sizes, formats, the
   manifest, all 20 state composites against their targets, the check image rebuilt byte for byte, live packs unchanged.

### The 16 elements (`out10p/props.json`, `render_layers`, in z order)

Rect = x, y, w, h in stage px. No layer is `under`. "above" = the existing slice it sits just over.

| Layer | Prop | anim | z | Blend | Rect | Bytes 1x / 2x | What |
|---|---|---|---:|---|---|---:|---|
| `tv_body` | tv | | 1904 | source-over | 945, 538, 140, 106 | 11,516 / 37,056 | TV and shelf with the dark glass, the popcorn machine pixels in front of it, contact shadow on wall, worktop and podium. Above `partition_right_01` (1903) |
| `tv_light` | tv | | 2044 | plus-lighter | 958, 511, 123, 113 | 3,988 / 12,764 | Always on: the small brightenings the set causes around it (wall above it, podium edge, beside the popcorn machine) |
| `tv_glow` | tv | `tv_glow` | 2044 | plus-lighter | 936, 549, 108, 105 | 2,065 / 5,774 | The blue of the tube inside the screen quad and its light on shelf, worktop, wall |
| `jukebox_body` | jukebox | | 2542 | source-over | 1330, 737, 174, 175 | 16,083 / 51,970 | Jukebox, tubes dark, with its shadow on the carpet and the bar cabinet. Above `partition_right_07` (2477) and `snack_05` (2541), below the palm (2594) |
| `jukebox_light` | jukebox | | 2595 | plus-lighter | 1312, 728, 183, 200 | 8,169 / 25,785 | Always on: glow of dome, JAMS, keys and lacquer on carpet and pot, the jukebox's reflection in the wet floor |
| `jukebox_tube_pink` | jukebox | `tube_pink` | 2595 | plus-lighter | 1310, 746, 170, 183 | 10,683 / 32,490 | Pink tube, its glow on the body, the pink pool on the carpet |
| `jukebox_tube_teal` | jukebox | `tube_teal` | 2595 | plus-lighter | 1314, 746, 123, 178 | 2,974 / 8,901 | Teal tube and its glow |
| `jukebox_shadow_over` | jukebox | | 2647 | source-over | 1393, 739, 102, 104 | 5,638 / 19,391 | Black: the jukebox's shadow on the wall panel right of the palm (`partition_right_08`, 2572) and on the pot (palm 2594, 2646) |
| `jukebox_light_front` | jukebox | | 2647 | plus-lighter | 1397, 740, 87, 99 | 1,791 / 5,437 | Always on: the part of `jukebox_light` on the shadowed wall panel (its brass rail) and the pot; it has to come after the shadow |
| `jukebox_tube_pink_front` | jukebox | `tube_pink` | 2765 | plus-lighter | 1315, 758, 122, 119 | 662 / 1,640 | The part of the pink light that lies on the pot's front and the standee's foot (at most 28/255) |
| `claw_body` | claw | | 2951 | source-over | 901, 823, 371, 257 | 26,481 / 89,725 | Claw machine, bulbs dark, values lifted for the page's glass, with its shadow on the carpet. Below every storefront glass piece |
| `claw_light` | claw | | 3190 | plus-lighter | 902, 827, 370, 253 | 38,965 / 128,937 | Always on: what the glass sprites cannot let through (lit box, plush, header face, lettering, teal line), the box light on carpet, arcade side and wet pavement |
| `claw_chase_0` .. `claw_chase_3` | claw | `chase_0` .. `chase_3` | 3190 | plus-lighter | 1012, 847, 93, 209 / 1017, 849, 92, 207 / 1024, 853, 68, 206 / 1031, 853, 62, 211 | 1,262 / 3,442; 1,530 / 4,154; 1,239 / 3,370; 1,103 / 2,983 | One header bulb group each: its bulbs, their glow, their reflection on the wet pavement |

Other pack files: `props.json` 23,443 (manifest: schema `dinkdonk.props.layers.v1`, the layers, per prop box,
standing spots, front depth and z values, `tv.screen_quad`, the animation and glass notes, draw notes),
`validation.json` 64,757 (every number in this note), `checksums.json` 5,059 (SHA-256 of the other 34 files).
`parents` is empty: no piece is cut into slices.

### Where this leaves the plan (stage A planned 18: 9 / 6 / 3)

- **One body piece per prop, not 2-3 depth bands.** Measured with the position captures: every floor position
  within 1.5 tiles (0.05 grid, outside the prop's box + 0.15) with a 44 x 64 sprite: claw 5 of 2,099 positions
  sort wrongly, jukebox 6 of 1,391, TV 19 of 1,098, all grazing a corner by at most 9.5 / 10 / 13.5 px; every
  named spot is right (claw: standing spot 3026 in front, gnome 2900, cat, talk ring behind; jukebox: four standing
  spots 2611-2726, gnome, cat in front; TV: usher 1910, clerk in front). Bands would do worse: a band of the claw at
  its own depth (up to 3041) would be drawn over the walker at the machine (3026).
  The z values: claw **2951** (it must be below 3000 anyway, see glass), jukebox **2542** (palm 2594 and 2646 stay
  in front, as in draft 31), TV **1904** (forced: the worktop and the popcorn machine in front of the TV are one
  slice, 1903, so the TV piece sits just above it and carries the popcorn machine's pixels; `popcorn_1` 1980 and
  `menu_popcorn` 2075 draw over it as before).
- **No `under` layers.** Contact shadows are fused into the bodies (Brief 86 did that for the wall shadow); light
  pieces sit above the sprites they fall on, because a light piece under the walkers would be hidden by every
  sprite it lights. The one shadow that lies on sprites in front of the jukebox got its own image.
- **Jukebox light at 2595 with two small "front" pieces.** At 2765 (above everything it touches) the tubes and
  the pool were drawn across a walker standing at the jukebox. At 2595 a walker covers them, and only what falls
  on the pot's front and the standee's foot is in `…_front`. `tube_pink` therefore has two layers.

### The claw machine and the glass, with numbers

- The page draws the right storefront twice below z 3000: `lobby-qa.html` (setupArt) puts the whole
  `occ_glass_right` under its slices at the lowest slice z (3000) and then the slices (3000, 3080, 3160). The
  panes are 58% opaque, so **17.6% of a value under them reaches the screen** (41.9% with one layer). The body is
  solved for that stack. `out10/full.png` has the glass once.
- Cut: `claw_body` is one piece at 2951, under the whole-glass copy and all three slices. Of its 9,855 stage px,
  4,499 lie under slice 00 (z 3000), 4,337 under slice 01, 482 under the frame of slice 02. 40.6% of the body has
  its own depth at or above 3000 (to 3041), 1,615 px of them under slice 00: all of that is drawn at 2951. No walker
  can stand where that matters (0.07 m to the glass; the walker at the machine is in front of it).
- Lift: 5,081 of the 10,336 body pixels reach 255 in the body image and still come out too dark under the glass;
  the missing light is in `claw_light` and the four chase pieces, **above the glass at z 3190** (just over the
  marquee's last shadow pin, 3189). Under the glass the header bulbs would reach about 45/255 against 175-214 in
  draft 31. This departs from "claw pieces below the glass": the body is below, its light is not.
- Remaining difference: black under two glass layers is still lighter than draft 31's darkest claw parts. 787 px
  of the claw stay more than 8/255 too light (2,682 more than 2), worst 28.6. A black piece above the glass would
  fix it and black out any walker in front, so there is none.
- If the page ever draws that glass once, the claw comes out brighter by 21.8 on average (median 32, to 52). Then
  set `GLASS_LAYERS_THE_PAGE_DRAWS = 1` in `pack94.py` and build again (one minute, no rendering).

### Acceptance against draft 31

Composite: `out10/full` with the `out10m` and `out10l` layers as in Brief 86, then the page stack's change from
`out10p` (z order, blend modes, 8-bit), all animated pieces on, the sample picture from `props/tv_sample91.bgra`
in the screen quad; reduced to 1280 x 720 by exact area filter. Draft 31's three insets and connectors are left out.
Absolute differences in code values, mean / median / p95 / p99. "Capture" = the same frame with the direct full
captures put in instead of the pack: what the pack can reach at best against a 1280 px render with its own rain.

| Where | Pack | Capture | Without the pack |
|---|---|---|---|
| Claw region (580-860, 520-720) | 5.03 / 1.56 / 17.6 / 63.8 | 4.99 / 1.44 / 17.4 / 63.7 | 8.47 / 1.89 / 37.3 / 124.1 |
| Claw silhouette only | 7.24 / 4.44 / 24.0 / 36.7 | 6.65 / 3.89 / 22.8 / 34.9 | |
| Jukebox region (813-1027, 440-654) | 2.28 / 1.00 / 8.3 / 19.2 | 2.26 / 1.00 / 8.3 / 19.1 | 5.12 / 1.22 / 17.4 / 84.4 |
| Jukebox silhouette only | 4.05 / 1.00 / 20.3 / 35.7 | 3.99 / 1.00 / 20.4 / 35.6 | |
| TV region (600-774, 333-460) | 3.16 / 1.33 / 12.6 / 27.3 | 3.15 / 1.22 / 12.6 / 27.3 | 6.82 / 1.56 / 26.7 / 113.7 |
| TV silhouette only | 3.08 / 1.22 / 12.8 / 27.6 | 3.06 / 1.22 / 12.5 / 27.4 | |
| **Rest of the frame** | 2.46 / 0.67 / 9.8 / 31.3 | | the same: the pack changes 0 px there |

The rest-of-frame difference is what the live pack and a 1280 px draft differ by anyway (rain, pixel filter, the
sample text on the marquee boards: 2.25 without the boards). The claw region contains the marquee's end with
that text. At the native grid, the 2x composite against draft 31's three insets: claw 6.54 / 3.0, jukebox 2.98 / 1.0,
TV 2.48 / 1.0 (mean / median).

Against the solver's own targets (1x, mean / p99 / max): claw body 0.78 / 10.8 / 23.0, receivers 0.17 / 1.1 / 30.8;
jukebox body 0.37 / 1.5 / 9.2, receivers 0.11 / 1.1 / 32.9; TV body 0.33 / 1.1 / 2.2, receivers 0.07 / 0.8 / 9.6
(the maxima are single pixels at edges, except on the claw). Against the direct captures, gates mean <= 2 and
p99 <= 12: jukebox 0.55 / 3.0 and TV 0.40 / 1.5 pass at both sizes; **claw body 1.64 / 15.0 (1x), 1.82 / 16.9 (2x): the
p99 fails**, for the reason above. Left out as too small for an image of their own: the claw's shadow on the arcade
cabinet's side (4-8/255) and the TV's on the popcorn machine's east half and the counter (135 px, at most 6).

### What the page must do

1. **Load** `roxy3d/out10p/props.json` after `mergeMarquee` and `mergeLeader` and push every `render_layers` entry
   into `m.occluders` with its path under `../out10p/` (`file`, `file_2x`), as `mergeLeader` does for its pinned
   pieces. There is no `under` layer. Coming after out10, out10m and out10l matters: at equal z the later element
   is on top. `blend: "plus-lighter"` as for the marquee light. Keep the 1x/2x choice of the other packs.
2. **Animated pieces** are the layers with `anim`; keep their elements. On = shown (opacity 1), off = hidden;
   opacity in between scales the light. `props.<prop>.animated` lists the layers per name.
   - `chase_0` .. `chase_3`: one claw header bulb group each (bulbs, glow, pavement reflection). Each is what
     its group adds on top of the lower-numbered ones; the bulbs do not overlap, so any combination is right to
     within their faint shared glow.
   - `tube_pink`: **two layers** (`jukebox_tube_pink`, `jukebox_tube_pink_front`), switch them together. Off = tube dark, no pool.
   - `tube_teal`: what the teal tube adds on top of the pink one.
   - `tv_glow`: the picture tube's blue and its light around. Off = dead screen.
   - **The always-on base holds none of them**: all seven layers hidden = bulbs dark, tubes dark, no pool, dark
     screen. All shown = draft 31.
3. **TV picture**: `tv.screen_quad` (stage px, TL TR BR BL) = (1010.88, 551.32), (1040.88, 566.32), (1040.88, 592.78),
   (1010.88, 577.78). `tv_body` shows dark glass there (about 32/30/42). `tv_glow` adds about 27/72/127 inside
   the quad, so **draw the picture above `tv_glow` (z over 2044)**, or it turns blue; draft 31 drew it at 92%. No
   walker can overlap the screen.
4. **Standing spots** (u, v; walker z): claw (11.76, 8.5) 3026; jukebox (11.97, 4.14) 2611, (12.36, 4.26) 2662,
   (12.76, 4.5) 2726, (12.93, 4.18) 2711; TV none. All are in front of their body piece. At the jukebox the
   walkers cover tubes and pool (the pool does not tint them). At the claw machine `claw_light` (3190) is drawn
   over the walker: a 44 x 64 sprite there gets the teal line and the coin slot across it (363 of 2,816 px above
   8/255, mean 4-8). That walker is also seen through one glass layer while the machine is under two; that is
   the page's existing behavior at z 3000.
5. **Glass**: keep drawing the right storefront as today (whole copy at 3000 plus slices). `claw_body` alone looks
   blown out; it must never be shown without the glass over it, and never at z 3000 or above. `claw_light` and
   the chase pieces also lie over walkers on the sidewalk in front of that window (z up to 3190).
6. Not in the tracked set yet: `out10p/` is not in `.gitignore`'s exceptions, `package/art.js` or the web edition.

### Not checked

The page itself, real chat, OBS and frame times; walkers at the props (only computed); the animation in motion;
other cells of the wet-glass, popcorn and marquee loops than the first; the background as base + light-loop video
(the solve used `lit_bg`) and the `full` fallback; zoom levels between 1x and 2x; sprites wider than 44-64 px. No
second-opinion critique was run (none was asked for a layer render). `PROGRESS.md` is unchanged (not in the write
list). Nothing committed. `props/layer94/stageb/work/` keeps the linear and display arrays (292 MB, local only) so
the pack can be solved again without Blender.

```
py=../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe          # from roxy3d/
$py -B props/layer94/stageb/verify_captures94.py
$py -B props/layer94/stageb/linear94.py
../tools/blender-5.2.3-windows-x64/blender.exe -b --factory-startup --python-exit-code 1 props/layer94/scene94.blend -P props/layer94/stageb/display94.py
$py -B props/layer94/stageb/pack94.py --build
$py -B props/layer94/stageb/verify94.py
```

STATUS: STAGE B COMPLETE - out10p/ STAGED WITH 16 ELEMENTS (CLAW 6, JUKEBOX 7, TV 3), MANIFEST, CHECKSUMS, VALIDATION AND ONE CHECK IMAGE; ALL ON = DRAFT 31 WITHIN THE CAPTURES' OWN DIFFERENCE FOR JUKEBOX AND TV; CLAW MACHINE'S DARKEST PARTS STAY UP TO 29/255 TOO LIGHT UNDER THE PAGE'S DOUBLE GLASS AND ITS LIGHT PIECES SIT ABOVE THE GLASS (validation.json passed: false); PAGE, REAL CHAT AND OBS NOT CHECKED; NOTHING PROMOTED OR COMMITTED; STOP.
