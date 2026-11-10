# Brief 89: lobby props (claw machine, jukebox, breaking-news TV), placement blockout

10 Nov 2026. One **1280 x 720 Workbench placement still** from the unchanged production camera: three plain boxes
(claw machine cyan, jukebox pink, TV orange with a green screen face), yellow floor rings for the standing spots, one
short label with an arrow per prop and one **2.5x inset** (the claw machine behind the storefront glass). No artwork,
no materials, no Cycles render, nothing re-rendered in `out10/`, `out10m/`, `out10l/` or `out10mist/`.

![Lobby props blockout](props/blockout.png)

Base scene: `marquee/marquee_draft27.blend`, opened read-only (SHA-256 unchanged before and after). The Dear Leader
poster is not part of that scene, so it does not show in the still; none of the boxes shares stage pixels with the
poster's layers (`out10l/leader.json`).

## Short answer

**No place meets every limit for the claw machine and the jukebox.** The east half of the lobby is full: a floor-standing
box of jukebox or claw-machine size that stands in clear view there either covers something that must stay visible
(bench, standee, palm, snack bar) or sits on a listed standing spot. The still shows the best compromise for each; the TV fits
without a compromise on the listed limits. What is not met is listed per prop below and again under "Not satisfied".

| Prop | Box (u, v, height) | Size | Stage px (1920 x 1080) | Standing spot(s) |
|---|---|---|---|---|
| Claw machine | u 10.80-11.55, v 8.13-8.88, 0-1.25 m | 0.75 x 0.75 x 1.25 m | rect x 1015, y 826, 90 x 137; floor center (1060, 940) | (11.76, 8.50) = px (1096, 958) |
| Jukebox | u 11.68-12.18, v 3.40-3.88, 0-0.93 m | 0.50 x 0.48 x 0.93 m | rect x 1368, y 734, 59 x 98; floor center (1397, 817) | (11.97, 4.14), (12.36, 4.26), (12.76, 4.50), (12.93, 4.18) = px (1370, 833), (1386, 849), (1396, 868), (1425, 863) |
| TV | u 5.34-5.96, v 3.13-3.55, 0.50-0.97 m above the floor | 0.62 x 0.42 x 0.47 m | rect x 1007, y 533, 62 x 66 | none (nobody stands at it) |

Blender world = `[u, -v, z]`. The page formula matches the production camera to 0.00005 px at every box corner.
Full numbers (world boxes, footprints, hexagon outlines, depths, ray-cast results) are in `props/props_geom.json`.

**Why the boxes are lower than the brief's example (0.8 x 0.8 x 1.9 m):** the scene is a cutaway with squashed
heights. The arcade cabinet is 1.12 m tall, the walls are cut at 1.2 m, the storefront header sits at 1.92-2.06 m and
a chatter is 50 px = 0.68 m. A claw machine 12% taller than the arcade cabinet (the real ratio is about 1.9 : 1.75)
comes to 1.25 m. A 1.9 m box would reach the storefront header and stand above every wall.

## Claw machine "WIN A BUDDY"

**Where:** against the storefront glass, inside, between the entrance and the arcade cabinet (0.45 m west of the
cabinet). Play side is the east face (+u), the same way the arcade's screen faces; the player stands in the nook
between the two machines at (11.76, 8.50). Depth `1000 + round((u + v) * 100)`: 3006 at the center of the play
face, 3043 at the corner nearest the camera, 2893 at the far corner; the player stands at 3026.

**Why here:** it is the only floor next to the arcade cabinet that keeps every listed distance and covers no
existing prop. All of the brief's keep-clear items pass: talk spot (10.8, 7.2) 0.93 m (0.9 wanted), entrance path
0.90 m, arcade player's spot 1.43 m. Behind it the camera sees only carpet.

**What it costs (the compromise):**
- It is seen **through the tinted storefront glass** (occluder `glass_right`). 82% of its visible faces are behind
  glass, 18% are hidden: 17.6% by the storefront's frame (header, transom, two mullions, sill) and 0.45% by the end
  of the street marquee. The pack's glass sprite is 53-62% opaque near-black, so about 45% of the brightness behind
  it remains. The Workbench preview shows glass as a solid wall, so the still draws all glass see-through instead;
  the real thing will be dimmer than the cyan box suggests. Its player is seen through the same glass (14% of the
  figure behind the frame).
- It stands between the camera and the talk spot at (10.8, 7.2). Of the four ring positions the page uses there,
  **"left" (10.38, 7.62) becomes fully hidden**; the center goes from 43% hidden today to 52%, "front" from 14% to
  27%, "back" from 30% to 34%. (That spot is already half behind the arcade cabinet and behind the glass today.)
- Page spots that are not in the brief's list: the cat's spot at (10.5, 7.9) becomes fully hidden (0.38 m from the
  box); the janitor's spot (10.2, 7.0) goes from 39% to 66% hidden; the QA page's gnome spot (10.55, 8.45) is 0.25 m
  from the box and 86% hidden. These need moving on the page if this place is approved.
- For the later layer: the box spans depths 2893-3043 while the glass slices in front of it are at 3001, 3081 and
  3161, so the layer has to be cut or sorted so that `glass_right` always draws over it.

**Rejected:**
- South of the arcade cabinet (u 12.0-12.75, v 8.25-8.9): covers the cabinet's south face (the ORBIT lettering and
  the controls). Not allowed.
- North of the cabinet, between bench and arcade (u 12.0-12.75, v 6.65-7.4): clear view and a neat row of two
  machines, but it covers most of the bench and takes the page's cat spot and the corner of the arcade route.
- In the same row directly west of the cabinet (u 11.3-11.95, v 7.55-8.2): 0.6 m from the talk spot's center (0.9
  wanted), hides that spot completely, front crossed by the transom.
- East end of the glass strip, touching the cabinet (u 11.2-11.95): hides the talk spot's center 91% and "front"
  100%. Farther west (u 10.6-11.35): 4.5% under the marquee and against the entrance jamb.
- Anywhere in clear view in the east lobby (north of the bench, around the standee, in front of the snack bar):
  each position covers the standee, the palm, the bench or the snack bar, or sits on the talk spot (11.0, 5.35).

## Jukebox "JAMS"

**Where:** at the east end of the snack bar, in front of the snack bar's back wall, side by side with the palm pot
(0.12 m gap), front (+v) facing the open floor between snack bar, palm and standee. Depth: 2581 at the center of
the front, 2606 at the nearest corner, 2508 at the far corner. Four standing spots on that floor, all fully visible
(0% hidden, not behind glass), depths 2611, 2662, 2726, 2711.

**Why here:** it is the only spot with a wall behind, open floor in front and a clear view. All listed distances
pass (gnome spot (12.6, 4.35) 0.63 m; talk spot (11.0, 5.35) 1.62 m), and the page's cat spot (11.9, 4.35) is
0.47 m away. The front face is 99.6% visible; overall 90% of the box is visible, 10% is behind the palm (frond tips
over the top, the pot's edge in front of the side face). The pack already sorts it correctly: palm 2620 is in front
of the box's nearest corner 2606.

**What it costs (the compromise):**
- **Not flush to the wall:** the back stands 0.30 m in front of it (the gap cannot be seen from the camera). Flush
  to the wall (v 3.13-3.61) the palm hides 31% of it; 0.15 m off 24%, 0.25 m off 14%, here 10%, 0.35 m off 7%.
- It stands in the mouth of the clerks' aisle and **covers the east end of the back bar**: the bar's end panel and
  the last half meter of its worktop, including the last stack of cups and part of the second. Menu boards,
  registers and the customer counter are not covered. Strictly this breaks "do not cover the snack bar".
- It is small (0.50 m wide, 30 stage px): the nook between the bar's end (u 11.65) and the pot (u 12.30) is
  0.65 m, and the fronds overhang it from 0.95 m up, which limits the height to 0.93 m.
- The dancers' floor is the same 1.3 x 0.9 m patch that holds the cat's spot (11.9, 4.35) and the gnome's spot
  (12.6, 4.35): the box keeps its distance, the dancers will not. A figure at u - v between 7.0 and 7.85 there is
  behind the standee, so the four rings sit on the visible side of that line.

**Rejected:**
- Restroom side wall between the poster and the TICKETS sign (u 3.15-3.6, v 4.48-4.98): a real wall behind and all
  distances pass, but about a fifth of it sits behind the box-office corner, it is 0.4 m from the Dear Leader poster (it covers the
  poster if moved north), and the floor in front is the usher's gate approach.
- The glass strip next to the claw machine: no room for both, and dancers there are hidden by the claw machine or
  stand behind the dark glass. Back to the glass, the camera sees its back.
- Between bench and arcade: covers the bench. Against the snack counter's east end: sits on the cat's spot and
  covers the candy case. In front of or beside the standee: covers the standee or is hidden by it.
- Corridor back wall: the free stretches are 0.40-0.45 m (posters, standee, extinguisher), with talk spots in front.

## Breaking-news TV

**Where:** on the snack bar's back wall at its west end, on a small shelf over the free end of the back bar
worktop, between the SNACK BAR lettering and the first popcorn machine, under the left end of the POPCORN board.
Screen face toward the lobby (+v), 0.50 x 0.36 m.

**Screen quad in stage px (TL, TR, BR, BL):** (1010.88, 551.32), (1040.88, 566.32), (1040.88, 592.78),
(1010.88, 577.78). 30 px wide, 26.5 px vertical edges, depth 1895-1945 across the screen (box nearest corner 1951).

**Why here:** the screen is 100% visible and no figure at the usher's place, the clerks' places, the gate waiting
spots or the snack lines overlaps it. All listed distances pass (nearest: gate waiting spot (4.9, 4.6), 1.14 m).
It covers only wall (plaster, wainscot, brass rail, 0.6 m of the neon strip) and empty worktop; the SNACK BAR
lettering, the menu board and the popper stay free. Its east side face is partly behind the first popper.

**Limits:** it is **not above head height**. The wall is 1.2 m and the menu board takes the top 0.22 m, so the TV
sits at 0.50-0.97 m and stays clear of heads by position, behind the bar. The usher stands 0.25 m in front of its
left end; his 28 px figure ends 3 px left of the box, so a wide emote there can touch the box's left edge, not the
screen. The screen is small (the arcade's screen is 22 px). Turning the set 45 degrees toward the camera on its
bracket would make the screen 42 px wide and unskewed; not shown, a choice for the styled draft. For the layer: the
additive loops `menu_popcorn` (2075) and `popcorn_1` (1980) share pixels with the box's top right corner.

**Rejected:**
- East end of the back bar (u 10.7-11.5): three stacks of cups stand on the worktop there (u 10.89-11.37).
- Corridor back wall, high between screen 2 and 3 (u 9.65-10.4): it would cover the wall lamp, the bulbs of poster
  frame 2 or the LED sign; only 0.41 m stays clean.
- Restroom side wall between poster and TICKETS sign (v 4.44-5.0, z 0.72-1.17): it fits and is visible, but hangs
  0.4 m from the Dear Leader poster. Above the wall top: there is no wall above 1.2 m in the cutaway.

## Not satisfied (plainly)

1. Claw machine: no clear-view place by the arcade exists. Shown behind the dark storefront glass; it hides one of
   the four positions of the (10.8, 7.2) talk spot and the page's cat spot (10.5, 7.9).
2. Jukebox: stands 0.30 m off the wall, covers the east end of the back bar, 10% behind the palm, and its dancers
   share the floor with the cat's and the gnome's spots near (12.6, 4.35).
3. TV: not above head height; kept free of heads by standing behind the bar.

To get the claw machine or a larger jukebox into clear view, something existing has to move (the bench, the
cardboard standee or a talk spot). That is outside this brief.

## Measurements behind this

- **Marquee:** in draft 27 it is u 7.2-11.8, v 9.0-10.2, z 2.055-3.055 m. It hides the floor inside the polygon
  (3.46, 5.26), (8.06, 5.26), (9.28, 6.48), (9.28, 7.68), (4.68, 7.68), (3.46, 6.46) = stage (792, 612), (1068, 750),
  (1068, 823), (996, 859), (720, 721), (720, 648). The brief's line (895, 617)-(1063, 747) is close to the roof's
  rear edge, which really runs (792, 612)-(1068, 750). A point at height z is hidden when
  (u - 1.2247 z, v - 1.2247 z) falls inside.
- **Storefront glass:** floor with v > 6.48 and 1.6 < u - v < 4.0 is seen through `glass_right`.
- **Visibility:** 28 x 28 samples on each face the camera sees, rays toward the production camera through the
  evaluated meshes of the scene (rain and drip systems, sky and fog box left out); shares weighted by stage-pixel
  area. "Covers" is the first surface behind each sample.
- **Walkers:** no listed place or path touches a box. Nearest listed item per box: claw 0.90 m (entrance path),
  jukebox 0.63 m (gnome spot), TV 1.14 m (gate waiting spot). The routes read from `lobby-qa.html` (cat, janitor,
  arcade, bench, gate approach) do not cross a box either; nearest are the items named above. A route to the claw
  machine's spot does not exist yet; (11.75, 7.35) to (11.76, 8.50) passes between the two machines with 0.2 m on
  each side.

## Files (all in `props/`)

- `blockout.png`: the only image.
- `props_geom.json`: boxes, footprints, standing spots, depths, stage outlines, screen quad, what covers what,
  distances, the pack sprites that share pixels with each box.
- `props_blockout.blend`: the copy, with five box meshes and five rings in the collection `PROPS` (no materials).
- `build_props.py` (measure, build, render), `annotate_blockout.ps1` (labels and inset), `run_blender.ps1` (runner;
  caches in `props/cache/`; refuses to start while another Blender runs), `verify_props.py` + `verification.json`
  (saved copy against the JSON: all 10 checks pass), `inspect_props.py` + `inspection.json` + `lobby_objects.txt`
  (scene survey), `study/` (the floor-map and placement search used to find and rule out places), logs,
  `run_report.json`, `annot.json`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File props/run_blender.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File props/run_blender.ps1 -Script verify_props.py -Log verify.log
```

Preview only: sky sphere, fog box and the alley's steam card are hidden (they render as solid shapes), all glass is
drawn see-through, and camera visibility is restored for 31 objects that the draft-27 file kept in a pass state.
Camera, existing geometry and materials are untouched.

## Time

The Workbench render call takes **2.6 s**; the whole run (load, ray casts, save, render) **8.0 s**; annotation
about 1 s. The still was rendered **four times** while the places were tuned (first positions, final positions with
three rings, with four rings, final script); only the last one exists. I waited twice for another agent's Blender
job (Brief 90) to finish before starting mine. No Cycles, no cloud. For my own inspection I kept a copy and
a zoomed crop of the raw render and one crop of `out10/full@2x.png` outside the repo, and deleted them afterwards.

## Estimate for the next steps (local RTX 3050 6 GB, not benchmarked here)

- **Styled draft, all three props in one 1280 x 720 still:** about **1.5-2 minutes of rendering**, **3-4 minutes
  per run** with build and composite. Basis: draft 27 took 85 s beauty + 11 s weather (169 s for the run); the
  poster draft took 58 s + 8 s (175 s with its inset). Modelling the three props is extra.
- **Layer render, all three, static (body, light, shadow, depth slices at 1920 x 1080 and 2x):** about **6-10
  minutes of captures** and **30-45 minutes for the job** with slicing, packaging and checks. Basis: the poster's
  six cropped 4K captures took 113 s (19 minutes for the job). The three props are far apart, so they need three
  cropped capture sets, and the claw machine needs the extra cut against the glass slices. If full-frame light
  captures turn out to be needed, add about 20 minutes (590 s + 558 s for the marquee's pair).
- **Animated loops** (jukebox lights, claw marquee chase, TV flicker), if wanted: about 10-20 minutes of captures
  each, as cropped 48-phase sets.

Writes are confined to `roxy3d/props/` and this note. `PROGRESS.md` is unchanged because the brief's write list
excludes it. Nothing was committed.

STATUS: COMPLETE - ONE PROPS PLACEMENT BLOCKOUT, GEOMETRY EXPORT, WORKING BLEND AND SCRIPTS DELIVERED; TV MEETS THE LISTED LIMITS; CLAW MACHINE (BEHIND THE STOREFRONT GLASS, HIDES PART OF ONE TALK SPOT) AND JUKEBOX (OFF THE WALL, COVERS THE BACK BAR'S EAST END) ARE BEST COMPROMISES; READY FOR OWNER LAYOUT REVIEW; STOP.
