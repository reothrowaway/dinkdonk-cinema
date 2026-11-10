# Brief 93: lobby props, styled draft 31 (fixes to draft 30)

10 Nov 2026. Render agent: Claude Fable 5.2. One **1280 x 720** final-quality still, built exactly like draft 30
(same camera, samples, weather frame, the same three native 3x insets at the same places). Nothing outside
`props/` (new files, suffix 93), `qa10/draft31-props.png` and this file was written. I looked at the still at
stream size and in the insets before writing this.

![Lobby props draft 31](qa10/draft31-props.png)

`props/build_draft93.py` is `build_draft91.py` with only the changes below (50 lines replaced by 93; each spot is
marked "Brief 93"). Values are scene-linear RGB x emission strength.

## Changes (old -> new)

| # | Part | Draft 30 | Draft 31 |
|---|---|---|---|
| 1 | Claw header bulbs (28) | 7.0, radius 15 mm | **3.0, radius 10 mm** |
| 1 | Claw header sign face | (0.42, 0.012, 0.11) x 1.0 | same color **x 1.8** |
| 2 | Jukebox lacquer | (0.070, 0.018, 0.016) | **(0.17, 0.05, 0.035)**; roughness 0.26 and coat 0.55 unchanged |
| 2 | Jukebox edge strip | none | **28 mm brass band** (0.95, 0.66, 0.30), metallic 1, roughness 0.32, along the front edge of both sides and the arch; a flush inlay in the body's own surface (new material `P93 jukebox brass edge strip`, no new object) |
| 2 | Lacquer self-color (**not in the brief**) | none | emission **(0.19, 0.032, 0.050) x 0.20**, see below |
| 3 | JAMS lettering | (1.0, 0.84, 0.50) x 3.2 | **(1.0, 0.50, 0.10) x 0.90** |
| 3 | Title window glass | (0.60, 0.26, 0.06) x 0.40 | **(0.60, 0.22, 0.04) x 0.42** |
| 4 | Floor light | pink 11 W + teal 9 W spots, 0.30 m high, cone 115 degrees, blend 0.9 | **one pink spot 42 W**, at (12.03, 3.91, 0.80 m), aimed at the carpet at (12.20, 4.24), **cone 56 degrees**, blend 0.5; **teal spot dropped** |
| 5 | `P91 tv shelf bracket` | built | **deleted** (and its unused material) |

Kept as they were: header lettering, teal line, box light, plush heap, claw; jukebox tubes, dome, keys, grille;
everything of the TV. Collection `PROPS` now holds **85 objects** (82 meshes/curves/text, 3 lamps); names unchanged.

**Where I left the brief's numbers, and why (measured in coarse tuning passes):**
- **Body.** With the lighter lacquer alone the side stayed black: **7/1/0** (draft 30: 2/0/0). No lobby lamp
  reaches an east-facing surface there (the bar cabinet behind it is 0/0/0 in draft 29 too), so a lighter paint has
  nothing to reflect. I gave the lacquer a faint cherry self-color (emission 0.20). It is flat (no shading) and
  lights nothing else. `BODY_GLOW = 0` in the script switches it off; the alternative would be a small fill lamp.
- **Title window.** With "JAMS 1.8, glass 0.7" the window was still near-white at stream size (letters 233/223/211,
  window mean 211/184/156). AgX washes amber out above about 1.0, so the letters went to a deeper amber at 0.90 and
  the glass stayed dark (0.42) so JAMS still separates from its field.

## Measured at stream size (1280 px, outside the insets; `props/measure93.json`)

**1. Claw header against the marquee's bulbs.**

| | Draft 30 | Draft 31 |
|---|---|---|
| Header bulbs, mean at the 28 centres | 207/178/155 | **175/130/90** |
| Header bulbs, brightest eight | 248/215/190 | **214/166/123** |
| Street marquee, the 8 nearest bulb centres | 253/246/240 | 253/246/240 |
| Sign-face pixels that read pink (of 413) | 64 (15%), mean 150/42/77 | **102 (25%), mean 168/57/96** |
| Header pixels at bulb level (R >= 225, G >= 185) | 150 | 106 (the lettering) |

The header's top row is 7.4 px from the nearest marquee bulb. The dots are now small amber accents well below the
marquee's bulbs; the band reads as a pink sign with cream lettering. No blown-out pixel on it.

**3. Title window** (78 px): mean **204/150/95** (draft 30: 221/204/184), brightest pixel 227/182/136 (246/239/230),
near-white pixels (all channels >= 215) **0** (40), amber pixels (R - B >= 60) **78 of 78** (20).

**4. Floor pool** (against draft 29, the scene without props): **one connected pink patch, 811 px**, 37 x 27 px at
x 904-941, y 551-578, centre on the carpet at (u 12.25, v 4.25), mean 93/42/87, strongest pixel 118/54/102
(+59 red). **Blue-grey pixels: 0** (draft 30: 295, plus 130 pink in two pieces). It covers standing rings 1 and 2
(+51/+2/+21 and +45/+1/+17); rings 3 and 4 are outside it. Spill: front bar end **+1/0/0**, wet surface beyond the
lobby edge **+1/0/0**, standee board 0/0/0, carpet 0.85 m in front 0/0/0.

**2. Body:** east side above the pot **45/8/13** (draft 30: 2/0/0); top of the arch 155/131/139 (122/118/130).

**Blown-out check** (all channels >= 250): jukebox **0** (stream size and inset), TV **0**, claw machine **0** inside
its silhouette. The claw inset holds 129 such pixels and its stream-size crop 9, exactly as in draft 30: all are
within 1.35 px of a street-marquee bulb centre (existing art). Inset 99th percentiles: claw 234/226/220, jukebox
248/217/215, TV 221/214/207.

## Verification (`props/verification93.json`, all pass)

- Base scene: every existing object, the camera and the compositor are identical to `leader/leader_draft29.blend`.
- Approved boxes: claw u 10.80-11.55, v 8.13-8.88, 0-1.25 m; jukebox u 11.68-12.18, v 3.40-3.874, 0-0.93 m; TV
  u 5.34-5.96, v 3.135-3.552, 0.50-0.97 m; shelf u 5.32-5.98, v 3.13-3.57, 0.47-0.50 m. All inside, and the claw
  and jukebox bounds are **equal to draft 30's**. With the bracket gone nothing of the TV lies outside its boxes.
- Against `props_draft.blend` (Brief 91), object by object (geometry, materials, lamps): 75 objects identical;
  removed `P91 tv shelf bracket` and `P91 jukebox teal floor spill`; changed only the four bulb groups, the two
  header faces, the jukebox body, title glass, JAMS and the pink lamp. **All 13 TV objects are identical**; screen
  quad error 0.000 px.
- TV pixels, draft 31 against draft 30: mean difference 0.18 levels at stream size and 0.11 in the inset, 7 and 8
  scattered pixels differ by more than 4 (render noise). Rest of the frame: mean 0.23 levels; the only cluster is the
  claw header's reflection on the wet pavement (up to 13 levels).
- Read-only inputs re-hashed after the render, unchanged: `qa10/draft30-props.png` `08f71ccc…9643`,
  `props_draft.blend` `675f7c5c…12c9`, `build_draft91.py`, `tv_sample91.bgra`, `leader_draft29.blend`.

## Render

Local RTX 3050 6 GB, Cycles OptiX, adaptive 256/64 samples, threshold 0.01, seed 1701, as draft 30.

| Capture | Seconds |
|---|---:|
| Full-scene beauty + weather | 59.61 + 7.99 |
| Claw inset, beauty + weather | 23.17 + 7.01 |
| Jukebox inset, beauty + weather | 16.02 + 6.68 |
| TV inset, beauty + weather | 14.29 + 5.97 |
| **Total rendering** | **140.73 (2.3 min)** |

The run took 221 s in all. **One full run**, no superseded one. Before it: six coarse tuning passes of the claw
inset and a wider jukebox-and-floor region (58-85 s each, written outside the repo and deleted). No other Blender
job was running; no cloud. PNG `9df02895…0277`, blend `09868390…b72d`.

Files: `qa10/draft31-props.png`; `props/props_draft93.blend`, `build_draft93.py`, `run93.ps1`, `verify_draft93.py`
+ `verification93.json`, `measure93.py` + `measure93.json`, `build93.json`, `render93.json`, logs, `runtime93/`
(runtime copies, receipts). Raw EXR buffers and tuning crops are deleted.

## Falls short / not checked

1. **Body self-color** is outside the brief's listed values (see above): say so if a fill lamp or a black side is
   preferred. For the layer render it belongs to the body capture, not to the light pieces.
2. **The crown of the arch** still carries a lilac sheen close to the worktop's (155/131/139 against 146/128/123);
   the cherry shows on the shoulders and the side (the worktop value is one sample from a tuning pass). The brass strip reads as a pale gold band on the arch; down the
   east edge it is a dark seam, because nothing lights it.
3. **JAMS in the inset** is amber on amber: readable, but softer than draft 30's white letters.
4. **Key strip** under the window (unchanged, cream 1.1) is now the lightest line on the jukebox front
   (brightest 214/206/197, one pixel high at stream size). Not listed, so not touched.
5. **Claw lettering** (unchanged, 3.4) is still the brightest part of the header; the pink shows at the ends,
   round the Buddy sign and between the words.
6. **Pool** reaches two of the four standing rings.
7. **Not checked:** the page, real chat, figures at the props, the pack's glass sprite, animation. No second-opinion
   critique was run. `PROGRESS.md` is unchanged (not in the write list). Nothing committed.

STATUS: COMPLETE - DRAFT 31 STILL WITH THE SAME THREE INSETS, PROPS_DRAFT93.BLEND (COLLECTION PROPS), SCRIPTS AND NOTES DELIVERED; FIVE POINTS DONE; PLACEMENT AND TV VERIFIED UNCHANGED; TWO DEPARTURES FROM THE BRIEF'S NUMBERS (BODY SELF-COLOUR, DEEPER AMBER TITLE WINDOW) FLAGGED; PAGE AND FIGURES NOT CHECKED; READY FOR OWNER REVIEW; STOP.
