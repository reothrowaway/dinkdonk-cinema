# Brief 91: lobby props (claw machine, jukebox, TV), styled draft 30

10 Nov 2026. Render agent: Claude Fable 5.2. One **1280 x 720** final-quality still from the unchanged production
camera with its weather frame and **three natively rendered 3x insets** (one per prop), each with a thin connector.
No labels. Nothing in `out10/`, `out10m/`, `out10l/` or `out10mist/` was re-rendered or touched.

![Lobby props draft 30](qa10/draft30-props.png)

Base scene: **`leader/leader_draft29.blend`** (the fallback was not used), opened read-only; its SHA-256 is unchanged
(`8c02b0b2…26cf`). Positions and sizes are the approved Brief 89 boxes. I looked at the finished still, at stream
size and enlarged, before writing this.

## Short answer

All three read as what they are, at stream size and in their insets, and they sit in the lobby's own colours. The
**lettering is only readable in the insets** (and would be on the page's 2x art); at 1280 px the claw machine's
header and the jukebox window are bright signs without legible words. Nothing of the new props is blown out. What
falls short is listed per prop and again under "Falls short / not checked".

| Prop | Approved box | Built (measured from the saved file) |
|---|---|---|
| Claw machine | u 10.80-11.55, v 8.13-8.88, 0-1.25 m | u 10.80-11.55, v 8.13-8.88, 0-1.25 m |
| Jukebox | u 11.68-12.18, v 3.40-3.88, 0-0.93 m | u 11.68-12.18, v 3.40-3.874, 0-0.93 m |
| TV set | u 5.34-5.96, v 3.13-3.55, 0.50-0.97 m | u 5.34-5.96, v 3.135-3.552, 0.50-0.97 m |
| TV shelf | u 5.32-5.98, v 3.13-3.57, 0.47-0.50 m | the same |

The TV's screen quad projects onto the stage quad in `props_geom.json` with **0.000 px** error; the curved glass
stays behind that plane (v <= 3.551). **One addition outside the boxes:** a small black bracket under the west end
of the TV shelf (u 5.335-5.36, v 3.13-3.44, z 0.26-0.47), so the board reads as a wall shelf where it overhangs the
back bar. It is dark and mostly hidden; it can be deleted without touching anything else (`P91 tv shelf bracket`).

## What each prop looks like

**Claw machine "WIN A BUDDY" (seen through the tinted storefront glass).** A dark laminate base (the arcade
cabinet's own enamel) with a teal light line under the glass, a control deck on the play side (red joystick ball,
one lit amber button), a coin door with a red slot, a prize door, and a Buddy face painted on the south side. On top
a glass box in a satin aluminium frame with a pale liner at the back, **36 round blue plush Buddies** (light blue
head, darker hair cap with a tuft, navy button eyes, pink cheeks) and a chrome three-prong claw on a cable. The
header is a dark box with two backlit magenta faces and **28 amber bulbs**, all on. From the camera the two visible
faces read as one band: **WIN A**, a small Buddy sign, then **BUDDY** and two stars.
- Through the glass: the lit box with the blue heap, the teal line, the pink header and its bulbs **do read at
  stream size**; the words do not (cap height 0.12 m is about 6 px in the 1280 still, 9 px on the 1920 stage). In
  the inset the words, the plush faces and the claw are clear.
- The storefront frame crosses it as the blockout said: one mullion runs down between "WIN A" and the Buddy sign,
  the transom and the second mullion cross the right half of the east header (the stars), and the storefront's own
  header clips that face's top right corner. I laid the two words out in the parts no frame member crosses
  (WIN A: 0.385 m wide on the south face; BUDDY: squeezed to 0.35 m on the east face).
- The claw hangs low and close to the south pane. Higher or deeper in the box the camera, looking down, sees only
  the header in front of it. It is small (about 7 stage px) and chrome, so it shows in the inset, not at stream size.
- The marquee's east end and its bulbs sit directly above it in the frame; next to the arcade cabinet it looks like
  a second machine of the same family (dark body, lit trim), brighter than the arcade because of the lit box.

**Jukebox "JAMS".** A dark cherry-lacquer body with a half-round top (arch radius 0.25 m), a pink tube around the
front and a teal tube inside it over the upper half, an amber dome with a black record and pink label, a brass-framed
title window with glowing **JAMS**, a row of cream selection keys, a dark speaker cloth behind seven brass bars and
a nickel kick plate. Pink and teal light falls on the carpet in front (two patches about half a metre deep).
- Next to its neighbours: the arch outlines it against the dark bar end; the palm's fronds overlap its top right and
  the pot stands beside it, as in the blockout. Its side is almost black and merges with the bar cabinet behind it;
  only the arch and the top's sheen separate it. It is small in the frame (front face 20 px wide at 1280): it reads as a
  jukebox by its shape and glow; "JAMS" is clear in the inset and a bright amber window at stream size.
- The tubes are deliberately below the lobby's own neon (2.1 and 1.4 against 5.0 and 4.0): pink stays pink, the
  teal turns pale at its core. No white clipping.

**Breaking-news TV.** A putty-beige CRT set with a tapered darker back on a dark walnut shelf: bezel, slightly
bulged dark glass with a faint blue glow, two knobs, a red power light, a small badge. The draft's sample picture
(dark blue backdrop, red block "BREAKING / NEWS", gold bell) is a **2D overlay on the screen quad**, not part of the
scene. At stream size it is a small beige set with a blue-and-red picture beside the first popcorn machine; the words
are readable in the inset only. I stacked the two words because one line would be about 3 px per letter even at 3x.
The picture is flat by design (no reflection, no glare); the page draws the real one.

## Materials and lights

Colors are scene-linear RGB; emission is Principled emission strength. Existing lobby materials are reused
untouched: `black enamel` (claw base, header box), `brushed nickel`, `red enamel`, `warm brass`, `ink`. The lettering
uses the Impact font already packed in the base scene. For scale: the lobby's pink neon is strength 5.0, cyan 4.0,
`warm light` 4.0; the arcade's screen light is a 6 W point lamp; the floor "action pools" are 90 W spots.

| Part | Values |
|---|---|
| Claw frame / claw | aluminium (0.55, 0.57, 0.60), metallic 0.92, roughness 0.30 / chrome (0.90, 0.92, 0.94), metallic 1, roughness 0.18 |
| Claw showcase glass | transparent with a 9% mirror reflection (roughness 0.03); liner (0.62, 0.70, 0.78), felt floor (0.10, 0.16, 0.30) |
| Claw teal line | (0.13, 1.0, 0.85) x 3.0, 7 mm tube |
| Claw header | face (0.42, 0.012, 0.11) x 1.0; lettering and stars (1.0, 0.80, 0.42) x 3.4; Buddy sign 2.4 (face), 1.6 (hair), 2.2 (cheeks) |
| Claw chase bulbs | 28 spheres, 15 mm radius, (1.0, 0.42, 0.10) x 7.0, four groups with their own materials (`chase_group` 0-3) |
| Claw button / coin slot | (1.0, 0.58, 0.2) x 3.0 / (1.0, 0.05, 0.03) x 2.5 |
| Plush Buddies | head (0.20, 0.42, 0.92), hair (0.030, 0.13, 0.60), eyes (0.008, 0.020, 0.10), cheeks (0.95, 0.10, 0.13); roughness 0.5-0.9; radius 58-69 mm |
| **Claw showcase light** | area lamp **4 W**, (0.72, 0.88, 1.0), 0.46 x 0.56 m, spread 150 degrees, at z 0.963 m, straight down |
| Jukebox body | lacquer (0.070, 0.018, 0.016), roughness 0.26, coat 0.55 |
| Jukebox tubes | pink (1.0, 0.085, 0.37) x **2.1**, 13 mm; teal (0.13, 1.0, 0.85) x **1.4**, 10 mm |
| Jukebox dome / record | glass (1.0, 0.50, 0.16) x 0.85; vinyl (0.006, 0.006, 0.008) roughness 0.22; label pink x 1.0 |
| Jukebox title window | glass (0.60, 0.26, 0.06) x 0.40; JAMS (1.0, 0.84, 0.50) x 3.2, cap height 0.10 m, 0.248 m wide; keys (1.0, 0.86, 0.62) x 1.1 |
| **Jukebox floor light** | two spot lamps 0.30 m above the floor, 3 cm in front of the box, aimed at the carpet 0.5 m in front: pink **11 W** and teal **9 W**, cone 115 degrees, blend 0.9 |
| TV body / shelf | beige (0.50, 0.44, 0.33) roughness 0.48; back (0.36, 0.31, 0.23); walnut (0.060, 0.028, 0.018), coat 0.25 |
| TV glass | (0.010, 0.013, 0.022), roughness 0.07, coat 0.6, emission (0.10, 0.26, 1.0) x **0.32**; 14 mm bulge; power light red x 3.0 |
| **TV glow** | area lamp **0.45 W**, (0.22, 0.46, 1.0), 0.40 x 0.26 m, 5 cm in front of the screen, facing the lobby |
| TV sample picture | `props/tv_sample91.bgra` (400 x 288, made by `make_tv_sample91.ps1`), mapped onto the quad at 92% over the rendered glass, values x 0.93, 8 x 8 samples per pixel, slight tube curvature and darker corners |

The jukebox spots are higher than I first set them (2.2 W and 1.6 W showed almost nothing): the carpet is dark and
purple, so pink shows as magenta and teal as a blue-green patch. They reach the carpet in front, the foot of the
standee and the pot's side, not the room. The claw's light stays inside its box apart from a faint wash on the
carpet next to it. All four lamps are hidden from the camera themselves. The new meshes are linked to the same two
light-receiver collections as the arcade cabinet, so the lobby's linked lights fall on them.

**Blown-out check** (pixels with all channels >= 250): claw machine **0** in its inset and 0 in the full frame;
jukebox **0**; TV **0**. The claw inset contains 129 such pixels, all in the existing street-marquee bulbs at its
top. Inset 99th percentiles (R/G/B): claw 247/226/220, jukebox 248/228/224, TV 221/214/207.

## Render and composition

Local **RTX 3050 6 GB Laptop GPU**, Blender 5.2.3, Cycles OptiX, adaptive **256 max / 64 min samples**, threshold
0.01, seed 1701, OptiX denoising, Blackman-Harris 1.5 px, no motion blur, inherited AgX Medium High Contrast,
exposure +0.25, wet materials, reflections and the production glare graph, as in drafts 27-29. Sequence: beauty
through the glare graph, the Brief 80 street-board text overlay (verbatim), the TV sample overlay, then the
phase-zero weather frame composited over it.

Insets: the camera never moves. The grid is **3840 x 2160** (3x); each inset is a padded camera border rendered
with the same samples, denoiser, materials and weather, cut out and placed **without resampling**. Glare for an
inset runs on the full 3x canvas so its size matches the still; the marquee's bulb halo is rebuilt natively on that
grid from the same 60 bulb centres instead of being stretched.

| Inset | Crop in the still (x, y, w, h) | Size and place |
|---|---|---|
| Claw machine | 672, 546, 68, 100 | 204 x 300 at (10, 408), lower left |
| Jukebox | 894, 486, 60, 80 | 180 x 240 at (1090, 470), lower right |
| TV | 664, 350, 56, 56 | 168 x 168 at (12, 12), upper left |

| Accepted capture | Seconds |
|---|---:|
| Full-scene beauty | 72.92 |
| Full-scene weather | 13.22 |
| Claw inset, beauty + weather | 32.22 + 6.42 |
| Jukebox inset, beauty + weather | 16.01 + 6.28 |
| TV inset, beauty + weather | 17.45 + 8.05 |
| **Total rendering** | **172.57 (2.9 min)** |

The accepted run took **252 s** in all (build 23 s, hashing, glare display 9 s, composite). Before it: one read-only
scene survey, four coarse tuning passes of the three inset regions (35-70 s of rendering each, kept outside the
repo and deleted), and **one superseded full run** (207 s of rendering, 381 s in all) that I replaced after looking
at it: the jukebox's floor light was too weak and its body too black. Saved-file verification: a separate run, all
checks pass. I waited once for another agent's Blender job; no two jobs ran together. No cloud.

Final PNG SHA-256: `08f71ccca938819c2132ea7e5550ae8ce3f669c6f90393a4d45cee2dfea59643`.
Saved blend SHA-256: `675f7c5c2fc6f16a9edaccca3291ad61a69b16c827f6663e79c98484be9112c9`.

## Files

- `qa10/draft30-props.png`: the only image.
- `props/props_draft.blend`: the working scene; **87 objects (83 meshes/curves/text, 4 lamps) in collection
  `PROPS`**, named `P91 claw …`, `P91 jukebox …`, `P91 tv …`, each with `cloud_group` = `claw`, `jukebox` or `tv`.
  Everything else in the scene is identical to draft 29's file (object transforms, mesh data, material assignments,
  visibility, lamps, camera, world, compositor).
- `props/build_draft91.py` (build, render, composite), `props/make_tv_sample91.ps1` + `props/tv_sample91.bgra` (the
  sample picture), `props/run91.ps1` (runner; waits while another Blender runs), `props/verify_draft91.py` +
  `props/verification91.json`, `props/inspect91.py` + `props/inspect91.json` (scene survey), `props/build91.json`,
  `props/render91.json`, logs, `props/runtime91/` (copied runtime helpers, receipts). The raw EXR buffers and the
  temporary PNG buffers were deleted.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File props/make_tv_sample91.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File props/run91.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File props/run91.ps1 -Script verify_draft91.py -Log verify91.log
```

## Falls short / not checked

1. **Lettering at stream size.** WIN A BUDDY, JAMS and BREAKING NEWS are readable in the insets only. Bigger
   letters need bigger props, which the approved sizes rule out.
2. **Claw machine behind the frame.** A mullion, the transom and the storefront header cross the header band; the
   east face's right half is mostly decoration for that reason. The claw is small and low.
3. **Jukebox body.** Its side merges with the dark bar behind it; a lighter or redder lacquer would separate it
   more but would no longer be a "dark body".
4. **TV bracket.** One small part outside the approved boxes (see the top); say so if it should go.
5. **Insets.** Light sources more than 36 px outside an inset's crop add no glare to it. The 1.5 px pixel filter on
   the 3x grid (as in drafts 28-29) is crisper than the production packs' 2.5 px at 4K. The claw inset covers about
   20 px of the bus shelter's left end and the jukebox inset the lower corner of the alley; those corners are not
   strictly empty. The TV's connector is long (from the upper left corner).
6. **Not checked:** the page (no browser, no real chat, no OBS), figures standing at the props, the pack's own
   glass sprite over the claw machine (the draft uses the scene's Cycles glass), any animation. No second-opinion
   critique was run. `PROGRESS.md` is unchanged because the brief's write list excludes it. Nothing was committed.

## Plan for the later layer render (separate brief, only when the owner says so)

Staged in its own folder (for example `out10p/`), like the poster pack `out10l/`; the live packs stay as they are.
Native 3840 x 2160 camera borders, production samples and the 2.5 px filter, 1x derived from 2x in linear light.

1. **Bodies.** Per prop one straight-RGBA capture of its `cloud_group`, everything else a camera holdout, with
   coverage and a world-position AOV. Split by `1000 + round((u + v) * 100)` in the pack's 0.25-tile bands: claw
   2893-3043, jukebox 2508-2606, TV 1847-1951. The palm (2620) then sorts in front of the jukebox by itself, and
   `popcorn_1` (1980) and `menu_popcorn` (2075) draw over the TV's corner as today.
2. **Lights.** Per prop a pure on/off pair of only its own lamps and emitting materials (black reference, same
   seed), added in linear light to the lamp-off scene before glare and AgX, as in Brief 86. That gives additive
   pieces at the receiver's depth: carpet under each prop, the bar end, the standee foot and the pot for the
   jukebox, worktop and wall for the TV, carpet and a little wet pavement outside for the claw machine.
3. **Shadows.** Prop-present against prop-absent on the receivers, kept where it exceeds 2/255 near the silhouette
   (contact shadow on carpet, bar end, worktop).
4. **Claw machine and the storefront glass.** The body is captured **without** the glass and the page's own glass
   pieces draw over it, exactly as they do over figures behind the glass. Its pieces therefore get z-indexes below
   every glass piece that covers them: below `glass_right` (3080) everywhere, and whatever part has its own depth
   above 3001 but lies under `wet_glass_right_00` (3001) is clamped to 3000. By my arithmetic that is a narrow
   vertical strip of the south face near its east end; the exact pixels come from the position AOV and the pack's
   slice footprints, not measured yet. No figure can stand between the south face and the glass (0.07 m gap), so
   the clamp cannot mis-sort a walker. The frame members stay in the occluder.
   To verify then: the claw under the pack's glass sprite (53-62% opaque) against this draft; if it comes out
   dimmer, lift the body's values and report what cannot be reached.
5. **Parts that could animate later.**
   - Header chase: the four bulb groups already have their own materials; four small additive on/off pieces, faded
     by the page like the marquee's chase.
   - Jukebox arch: pink and teal tube (each with its floor patch) as two additive pieces, so the page can pulse or
     alternate them; a travelling colour would need a 48-phase loop.
   - TV: the page draws into the screen quad from `props_geom.json`; the layer adds the dark glass under it, an
     additive screen-glow piece the page can flicker, and optionally a thin glass-sheen piece above the picture.

**Estimate (local RTX 3050, from today's timings):** today's final-quality borders took 16-32 s each at 3x. About
**23 cropped captures** (claw 10 with the four chase groups, jukebox 7 with the two tubes, TV 6) come to **8-12
minutes of rendering**, and **45-60 minutes for the job** with display preparation, slicing, the glass cut,
packaging, one check image and verification. A 48-phase jukebox loop would add 10-20 minutes. If full-frame light
captures turn out to be needed (they were not for the poster), add about 20 minutes.

STATUS: COMPLETE - ONE DRAFT 30 STILL WITH THREE NATIVE 3X INSETS, PROPS_DRAFT.BLEND (COLLECTION PROPS), SCRIPTS AND NOTES DELIVERED; PLACEMENT UNCHANGED AND VERIFIED; LETTERING READS IN THE INSETS ONLY; ONE SMALL SHELF BRACKET ADDED OUTSIDE THE BOXES; PAGE, FIGURES AND ANIMATION NOT CHECKED; READY FOR OWNER REVIEW; STOP.
