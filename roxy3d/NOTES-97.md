# Brief 97: fly-through refresh, Godot stage

13 Nov 2026. Render agent: Claude Fable 5.2. Godot stage only: the live viewer now shows the lobby and the auditorium
as they are today. No Cycles render, no video, no cloud, no commit. Live packs, pages, `fly/transition/`, the 7 Nov
Godot version and every existing .blend are untouched (sources opened read-only; their file times are unchanged).

## How to open it

- **New version: double-click `roxy3d/godot-spike/run-live.bat`.** The HUD starts with "v97 (13 Nov)". Keys as
  before: Tab = route / free fly, Space = pause, Left/Right = 2 s back/forward, Home = start, drag the bar to scrub.
- The version of 7 Nov: `roxy3d/godot-spike/run-live-7nov.bat` (the old `run-live.bat`, unchanged).
- The route is now **53.3 s** (1,600 frames); it was 50.1 s (1,504). Everything up to the cut at 36.7 s is where it
  was; everything after the door of the auditorium is 3.2 s later.
- Two switches for comparing (add after `--mode=live` in the .bat): `--shell=0` shows the corridor as the live still
  has it (one wall, no ceiling); `--wetwalls=0` shows dry walls and roofs.

## What changed in the scenes

New production scenes in `fly/v9/` (the v7 fly-through scenes plus everything the art changed since), exported to
`godot-spike/assets_v97_A/` and `assets_v97_B/`.

**Lobby** (`fly/v9/production_A.blend`, from `rerender96/lobby_draft34.blend`): 632 objects added, 87 moved, 53
switched off, 4 reshaped, 470 materials replaced by today's.
- Street marquee over the entrance (canopy, bulbs, soffit lights, the two letter boards).
- "Dear Leader" poster with its picture light, jukebox, breaking-news TV on the snack bar.
- Claw machine where the ORBIT arcade cabinet stood; the cabinet is off.
- DELIVERIES gate at the head of the alley, EXIT door to its right, shorter annex; no "ABSOLUTE CINEMA" lettering.
- Baked page items: far skyline windows and aircraft lamp, two searchlight units, poll projector and screen case,
  bridge-out board, Dogtober poster (the Blue Hour art it replaces is off).
- Wet walls, roofs, ledges and alley: all materials are today's (wall sheen, full rain on the roofs, six new roof
  puddles). The reflection cards and their light linking are in the scene; it needs 54 light-linking combinations,
  the same as draft 34 (Blender's limit is 64).
- Kept from the fly-through scene: bus, falling rain, Screen 1 doors and curtain, the black vestibule, hidden drips.

**Auditorium** (`fly/v9/production_B.blend`, from `qa11/corridor/corridor_draft.blend`): the 57 corridor objects of
draft 14 (floor, runner, far wall, three posters, two sconces, five lights). End plate = `qa11/cinema_draft_14.png`.
- **Fly-only shell, new, 12 plain pieces:** the corridor set has one wall and no ceiling, because it was built for
  the fixed camera. Flown through, it looked like a wall standing in the dark. I added a near wall (mirror of the far
  wall, no posters), a ceiling, and a corridor-colored lining on the door wall. They are hidden from 42.0 s on, while
  the camera looks the other way, so the pull-back shows the corridor exactly as the live still does.
- The entrance leaves now open for the camera (38.1 to 39.1 s) and close behind it (shut again at 44.0 s). Before,
  the route started inside the open door.

**In Godot** (`main_v97.gd`, `cinema_timeline_v97.gd`, copies of the 7 Nov scripts; look settings unchanged):
- Wet walls and roofs as a gentle gloss with darker, streaked brick. A stronger setting darkened the brick and
  mirrored the soft fill lights as white and pink discs, so I took it back.
- No rain under the marquee canopy.
- The corridor has its own lights, set so the 3D corridor meets the plate at the end (wall 17 of 255 against 17,
  floor 15 against 15).

## What changed in the route

`godot-spike/assets_v97/camera_path.json`, written by `route_v97.py`; the approved `assets_v2/` path is not touched.
- **Part A (0 to 36.7 s): row for row the approved route.** Nothing new is in the way: the marquee's underside is
  0.9 m above the lens, the claw machine more than 2 m to the side. The closest new thing is the poster's picture light,
  0.33 m at 32.7 s (the Screen 1 leaves pass at 0.35 m in the approved route).
- **Part B: 120 new frames (4 s) down the corridor**, straight along its center at eye height 1.15 m, from v 21.4 to
  the door. They replace the old first 24 frames (a start from standstill just inside the door). Speed goes from the
  lobby's 1.07 to the tunnel's 2.01 units/s in the dark and stays there through the door. One slow right turn
  (0 to 7 degrees) leads into the old path; from 40.7 s on it is the old route, 96 frames later (97b, at the
  end of this file, changes where the camera looks in the hall).
- **Exposure:** the corridor is dim by design, so the picture is 1.5 stops brighter in it and comes back down
  through the door (39.7 to 40.7 s). One number in `route_v97.py` (`LIFT`); 0 turns it off.
- Bus and car paths are byte copies.

## What to look at (scrub bar)

| Time | What |
|---|---|
| 0.0 s | First frame against the live lobby: marquee, claw machine, gate and EXIT door, poster, jukebox, TV, skyline |
| 5 to 9 s | Dive: wet roofs, skyline windows behind the left block |
| 18 to 21 s | Along the street: the marquee from below and in front (its letter boards are blank), wet walls |
| 21.3 s | Under the canopy: soffit lights, no rain; claw machine and jukebox through the glass |
| 24 s | Lobby: "Dear Leader" poster and the TV ahead |
| 31.0 to 32.7 s | The poster and its picture light pass close on the left |
| 36.7 to 37.6 s | Cut in the dark, fade-in in the corridor |
| 37.6 to 40.1 s | Corridor: posters, sconce, the new near wall and ceiling; the leaves open at 38.1 s |
| 40.1 s | Through the door (exposure settles by 40.7 s) |
| 50 to 52.3 s | Pull-back: the corridor comes in at the left edge |
| 52.3 s | Switch to the live draft-14 plate (hold to 53.3 s) |

## Checks run

- `tools/qa-fly/campath.py` (`godot-spike/route_v97_campath.txt`): part A as on 7 Nov; part B has no new speed swing
  and no new yaw reversal. The one B reversal is the approved one, now at 46.4 s. One near-still stretch: the end hold.
- `qa_geometry_v97.py` (ray casts in the Blender scenes): no B frame looks into nothing (500 of 500); both doors are
  fully open before the camera crosses them; nearest distance to anything new or moved 0.33 m (A), 0.46 m (B).
- `qa_timeline_v97.gd` (offscreen): 1,600 frames, cut at 1101, plate from 1571, shell hidden from 1260, door timing,
  scrub bar and free fly in both rooms. First frame within 0.2 px of the live lobby landmarks, last frame within
  0.0002 px of the auditorium's.
- Live viewer started offscreen: 180 frames, exit 0; and the whole route once in real time, no script error (68.9 s
  for 1,700 frames; the 7 Nov version 67.6 s, so the frame rate is about the same). The 7 Nov version still starts.
- I looked at about 40 offscreen stills along the route while working and deleted them (you review in the viewer).

## Not done, left for the Cycles final

1. **The port.** `fly/v9/` holds the scenes on their animation clocks. Still to do, as Brief 76 did for v8: put in the
   camera, bus and car paths and the exposure curve, the sedan, the sky fix, the two frozen splash objects, then the
   bundle, the RunPod render, `campath.py` and `flash.py`, and a new `transition.webm`. The page plays 3.2 s more.
2. **Nothing in `fly/v9/` has been rendered in Cycles.** The merge is checked by counts and light-linking numbers,
   not by a picture.
3. **Marquee text.** The boards are blank: the page writes the text live. Blank, a fixed text, or text laid on by the
   page is your call. The other live items (LED signs, film posters, TV picture, poll, searchlight beams) are absent
   as before.
4. **Mirrored city lights on the wet walls and roofs** are Cycles only (reflection cards). Godot shows the gloss.
5. **Rain under the canopy** has to be cut out of the Cycles rain too.
6. **Fly-only shell and exposure lift** are my additions; they need your OK. In Cycles the ceiling must not shade
   the corridor's overhead light (already set in the scene).
7. **First and last frame of the final.** v8 used `out10/full.png` as its first frame. The live lobby is now the
   base plus the marquee, poster and props layers, so the final needs a composed first plate or a fresh render.
8. **Chatters in the fly-through** need the camera file and depth of the new render.
9. Not merged: the lobby's changed glare group (the fly renderer has its own). Marquee and claw bulbs stand still.
10. The step at the switch to the plate (52.3 s) was large on 7 Nov and in the first v97; 97b below reduces it.

## Files

`fly/v9/`: `prep97.py` (what the art changed, per object), `build97.py`, `production_A.blend`, `production_B.blend`,
`delta_*.blend/json`, `build_*.json`, `linkcount_v9.json`, `rb.sh` (runner).
`godot-spike/`: `export_scenes_v97.py`, `assets_v97/`, `assets_v97_A/`, `assets_v97_B/`, `route_v97.py`,
`main_v97.gd/.tscn`, `cinema_timeline_v97.gd`, `live_view_v97.gd`, `brick_v97.gdshader`,
`rain_process_v97.gdshader`, `qa_geometry_v97.py`, `qa_timeline_v97.gd`, `run-route-v97.ps1`, `run-live.bat` (new),
`run-live-7nov.bat` (old), `route_v97_*` (QA results). README, `FINAL-CHECKLIST.md` and `NOTES-godot.md` updated.

STATUS: GODOT STAGE COMPLETE - `godot-spike/run-live.bat` OPENS THE NEW VERSION (CURRENT LOBBY: MARQUEE, POSTER, PROPS, CLAW MACHINE, GATE, WET WALLS; DRAFT-14 AUDITORIUM ENTERED DOWN ITS CORRIDOR AND THROUGH THE DOOR); 7 NOV VERSION KEPT AS `run-live-7nov.bat`; ROUTE 1,600 FRAMES / 53.3 S, PART A UNCHANGED, 120 NEW CORRIDOR FRAMES IN PART B; CAMERA-PATH, GEOMETRY AND TIMELINE QA PASS, LIVE VIEWER STARTS OFFSCREEN; ADDED ON MY OWN AND WAITING FOR THE OWNER'S OK: FLY-ONLY CORRIDOR SHELL (NEAR WALL, CEILING, DOOR-WALL LINING) AND A 1.5-STOP EXPOSURE LIFT IN THE CORRIDOR; NOT DONE: CYCLES PORT AND RENDER (NOTHING IN fly/v9 RENDERED IN CYCLES), MARQUEE TEXT, NEW transition.webm; NO CLOUD, NO VIDEO, NO COMMIT; STOP.

## Version 97b (13 Nov 2026, afternoon): hall pan and hall brightness

Owner, after the first 720p capture: "from 43 up to 49 seconds, it kinda shows the same piece of screen ... first
panning to the right to partially show the audience and then finally towards the screen to finally do the final zoom
out"; and the hall was almost black at 46 to 48 s.

**Capture: `standby/concepts/fly/flythrough-v97b-godot-720p.mp4`** (1280x720, 30 fps, 1,600 frames, 53.3 s, 17.7 MB;
made the same way as the first one). The live viewer (`run-live.bat`) shows the same version.

**The pan** (`route_v97.py`, `PAN`): only where the camera looks changes. Its path, speed, lens, part A, the corridor
and the length (53.3 s) are as before, and the end is the same exact draft-14 pose and plate.

| Time | What |
|---|---|
| 42.4 s | Leaving the tunnel, the camera starts to pan right |
| 43.5 to 44.5 s | The seat bank comes in from the right (first its dark side, then the rows) |
| 45.4 s | Furthest right: 110 degrees from the screen wall, looking across and slightly back at the seat rows |
| 45.4 to 49.0 s | One left turn: screen back in the picture from 46.1 s, filling it at 47.2 to 48.5 s |
| 48.2 s | The approved zoom-out begins; from 49.2 s the camera is the approved one again |
| 52.3 s | Draft-14 plate |

- The lens comes down 7 degrees with the pan (the approved route looks up at the screen there; the seats sit lower).
- The camera banks into the pan like the rest of the route: up to 8 degrees right, then left into the zoom-out.
- `campath.py`: part B still has one yaw reversal, now the pan's far point at 45.4 s (it was the 46.4 s one). No speed
  swing added. Fastest turn of the pan 48 deg/s; the route's fastest is still the zoom-out (66 deg/s).
- Geometry QA (500 B frames, doors, clearance) and timeline QA pass again.

**Brightness in the hall:**
- Exposure (`HALL_LIFT`): the picture stays 1.0 stop up from the door through the tunnel and the hall, and is back at
  0 between 48.0 and 49.7 s, before the zoom-out reaches the end pose. The corridor's 1.5 stops are unchanged.
- The Godot hall itself (`cinema_timeline_v97.gd`): the Cycles hall is lit by broad soft lights; as Godot spots they
  gave one bright patch in the middle of the seats and black walls. One even, shadowless fill for the hall replaces
  most of the row fills. Measured at the end pose against the plate, of 255:

| | Plate | Before | Now |
|---|---|---|---|
| Left wall | 24 | 8 | 25 |
| Seats, middle | 30 | 39 | 30 |
| Seats, lower right | 33 | 10 | 28 |
| Seats, rear left | 25 | 4 | 23 |
| Seats, front | 30 | 14 | 28 |
| Front of the seat bank | 21 | 11 | 21 |
| Screen | 39 | 38 | 40 |

  So the step at 52.3 s is much smaller. The seats are a little redder than in the plate (41, 25, 50 against 35, 26, 48).
  `--hallfill=0` after `--mode=live` switches the fill off.

**Not done or to know:**
- The pan looks over the cutaway: beyond the seats there is no right wall and no ceiling, so the background is the
  dark navy surround. In the live picture those sides are cut away too.
- The seats are empty. Chatters in the fly-through come from the page (item 8 above).
- At 43.5 s the dark side of the seat bank fills the right half of the picture for about half a second.
- The even fill and the lower row-fill gain are Godot only; Cycles keeps its own lights. Whether the Cycles hall needs
  the exposure lift has to be judged there.
- The 1,600 capture frames are kept in `godot-spike/captures_v2/v97b/` (1.5 GB); delete them when not needed.
- The 7 Nov version and `assets_v2/` are untouched.

STATUS: 97B COMPLETE - HALL PAN (RIGHT ACROSS THE SEAT ROWS 42.4-45.4 S, ONE LEFT TURN TO THE SCREEN AND INTO THE UNCHANGED ZOOM-OUT, END POSE AND PLATE EXACT), HALL EXPOSURE +1.0 STOP UNTIL 48.0 S, GODOT HALL FILL TUNED TO THE PLATE (WALLS 25 AGAINST 24, WERE 8); LENGTH STILL 1,600 FRAMES / 53.3 S, PART A UNCHANGED; CAMERA-PATH, GEOMETRY AND TIMELINE QA PASS; CAPTURE `concepts/fly/flythrough-v97b-godot-720p.mp4`; CORRIDOR SHELL AND CORRIDOR LIFT AS BEFORE (OWNER UNDECIDED); NO CYCLES RENDER, NO CLOUD, NO COMMIT; STOP.

## Cycles stage (13 Nov 2026, evening): port, bundle, local smoke. No cloud run.

Owner, 13 Nov 2026: route 97b "Looks good"; corridor shell and corridor exposure lift "Keep both"; marquee boards
"DINK DONK CINEMAS" / "MOVIE NIGHT"; final 1080p, 30 fps. Everything below is in `fly/v10/`. Nothing was rented, nothing
committed; `fly/v9/`, `fly/v8/`, `cloud/`, live packs, pages and `fly/transition/` are untouched.

### The bundle

- **`fly/v10/roxy-cloud-bundle-97.tar.gz`**, 35,019,071 bytes (33.4 MiB), 22 members, SHA-256
  `587e24c32631d62e6e6c126077cdeb99753ab54b7fe0ce5a686ed4143098c4a7`. The helper's own `validate_archive` accepts it.
- **1,600 frames**, 30 fps, 53.3 s. A 1-1100, B 1101-1600, last 30 = the draft-14 plate.
- Two modes, one bundle:

| | Draft | Final |
|---|---|---|
| Size | 960 x 540 | 1920 x 1080 |
| Frames | every other one (800), 15 fps video | all 1,600, 30 fps video |
| Samples | 24 max / 8 min | the scenes' own: 64 max / 16 min |
| Shutter (motion blur) | 1.25 frames | 1.25 frames |
| Depth | first hit of the color render | opaque depth for the chatters (second 1-sample pass) |

Same scenes, lights, materials and denoiser in both: the draft shows the real look.

### Commands (from `roxy3d/` in Git Bash, only with the owner's spend approval; neither was run)

```bash
MAX_HOURS=0.6 bash fly/v10/run97-draft.sh    # 2 pods, result in fly/v10/cloud-draft-result/
MAX_HOURS=1   bash fly/v10/run97-final.sh    # 5 pods, result in fly/v10/cloud-final-result/
```

In full (final; the draft differs in `PODS=2 FLY_MODE=draft ESTIMATE_HOURS=0.5`, state and output names):

```bash
GPUS='NVIDIA GeForce RTX 4090,NVIDIA RTX A6000,NVIDIA A40,NVIDIA GeForce RTX 3090' \
PODS=5 WORKERS=auto MAX_WORKERS=4 FRAMES= FLY_MODE=final CHUNK=8 MAX_HOURS=<limit> BOOT_MIN=10 ESTIMATE_HOURS=0.75 \
ARCHIVE="$PWD/fly/v10/roxy-cloud-bundle-97.tar.gz" MULTI_STATE="$PWD/cloud/cloud-state-97-final.json" \
OUTDIR="$PWD/fly/v10/cloud-final-result" bash cloud/cloud-render.sh multi
```

`MAX_HOURS` is the money limit (hours per pod); the scripts refuse to start without it. The helper also wants a
balance of at least $5 (draft) or $6.36 (final) before it starts; that is a reserve, not a charge.
After the final, at home, no GPU:
`../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe fly/v10/build_transition97.py` writes
`fly/transition97/transition.webm` and `transition-camera.json` (staging; same format as `fly/transition/`).

### GPU time and money (estimates, not quotes)

Basis: the v8 final (1,504 frames at these samples on five 4090s) cost about $2.20, and its receipts hold every
frame's time. v10 has 6% more frames, 5% more objects and the depth pass (about a fifth on top, measured here).

| | GPU-hours (4090 class) | At $0.6-0.9 per GPU-hour | Wall time |
|---|---|---|---|
| Draft, 2 pods | 0.6-1.0 | $0.4-0.9 | 20-30 min |
| Final, 5 pods | 2.5-3.5 | $1.5-3.2 | 35-50 min |

Worst case by the limits above: draft 2 x 0.6 h, final 5 x 1 h. Pod start-up, probe, encode and download are in the
numbers; the draft is mostly that overhead.

### What the port did (`build_port97.py`, as Brief 76 did for v8)

- Camera, bus and car paths: byte copies of the approved Godot inputs. `campath.py` on `fly/v10/camera_path.json`
  (`fly/v10/campath.txt`): as the 97b check (three intended reversals in A, one in B at 45.4 s, no new speed swing).
- Every animation on the route's clock; exposure keyed: corridor +1.5 stops, hall +1.0 stop, 0 before the end pose.
- Corridor shell with its hide time (B 160) and the entrance leaves come from `fly/v9`; checked in Cycles stills.
- The two frozen splash objects removed, sky-dome fix, bus, blue sedan: as in v8.
- **Marquee text:** two letter meshes on the street board, laid out as the page does (line 1 on the middle track,
  44 px against 30 px, the page's two ink colors). The page's font, Oswald, is not on this PC and I may not download
  it; the letters are Bahnschrift (Windows), thickened and fitted to Oswald's line widths and cap heights. See below.
- **No rain under the canopy:** drops and ground impacts inside the canopy's footprint get scale 0 (nothing is
  deleted, so the rain keeps its motion blur).
- **Hall fill: not needed.** In Cycles the hall has its real lights; with the +1.0 stop the seats read well in the
  pan (I looked at five stills). The Godot-only fill was not ported.
- **First plate, how:** `out10s/full.png`, then every piece of the marquee, poster and props packs
  (`out10m`, `out10l`, `out10ps`: 308 pieces) at its place, depth and blend as their manifests say; after each piece
  the base pack's own depth slices that stand in front of it are drawn again, as the page stacks them. The board text
  is laid on in the page's colors with the letter shapes of the scene's text, so frame 1 and frame 2 agree. Not in the
  plate: what the page animates or writes live (chase bulbs, light loop, rain video, TV picture, LED signs).
- **End plate:** `qa11/cinema_draft_14.png`, byte copy. The depth of the first frame and the last 30 is rendered.
- **Depth for the chatters:** the final writes, for every frame, the depth of the opaque surfaces at the central
  pose without shutter, with glass, rain, water and transparent layers left out (the Brief 78 policy; before, this
  was a separate 3-hour job at home). `build_transition97.py` packs it into the page's two depth tiles; tried on four
  real final frames: 1920 x 1620 VP9, camera file with 1,600 entries and the same fields as the live one.

### Brief 96 lessons, as built

1. **Light linking:** lobby 54 combinations, auditorium 16 (limit 64). Every worker counts again when it opens a
   scene and stops over 60.
2. **Whole state per render:** size, samples, bounces, shutter, which objects the camera sees, camera, animated
   lights and tube circuits are written for every render; nothing is taken from the frame before.
3. **Probe:** every worker process renders one 320 x 180 picture of the whole scene before its first frame (lobby:
   first pose; auditorium: end pose) and compares it block by block with the reference in the bundle. A worker that
   differs stops. Packaging refuses a frame whose worker has no passed probe.
4. **Two-worker match test** (`match97.json`): frames A560 and B262 at final settings from two separate processes,
   one of them after another frame with both passes. Color differs by 0.013 and 0.003 of 255 on average (largest 2),
   no pixel by a quarter of its brightness; the depth is identical.

### Local checks (RTX 3050, one job at a time)

- Smoke through the helper's own supervisor and worker code, two workers, eight tiny frames, both modes
  (`smoke97.json`): pass. Both workers rendered both scenes, four probes passed each time, plates on frames 1, 1571
  and 1600, the video decodes, a second start changes nothing.
- Four frames (1360-1363) at the real final settings through the same worker code with the helper's `FRAMES` test
  contract (`test_range97-1360-1363.json`): pass.
- 15 look stills at draft settings and 6 at final settings (two of those are the plates) (`fly/v10/lookcheck/`): first pose, street with the
  marquee text, under the canopy, bus, sedan, poster, Screen 1 doors, corridor, entrance door, hall pan, end pose.
- Times here: draft 8.2-8.7 s per lobby frame and 2.3-2.7 s per auditorium frame; final 31 s + 6 s depth and
  6-9 s + 2 s.

### Not verified

- **No Linux or cloud run of this bundle.** The probe reference was made on the RTX 3050. Another GPU model should
  give the same picture within the limits (2% of blocks, 6% mean), as it did in Brief 96, but that is not tested. If
  it fails, every worker stops in its first minute, so it costs pod start-up only.
- The whole length was not rendered anywhere, so `flash.py` has nothing to scan yet: run it on the draft.
- The page side (a 53.3 s video, new camera file) is not touched.

### Needs the owner

1. The go for the draft and for the final, each with its `MAX_HOURS`.
2. **Board font.** Bahnschrift stands in for Oswald. If that is fine, nothing to do. If it should be Oswald, I need
   your OK to download the font (free license); then the port, plates and bundle are rebuilt in about 15 minutes.
3. Marquee and claw-machine bulbs stand still in the video (the page chases them). Say if they should chase.

### Left in `fly/v10/` that can be deleted

A safety check stopped my clean-up, so these are still there: `smoke97/` (164 MB of unpacked test copies),
`match_a/`, `match_b/`, the contact sheets in `lookcheck/`, the stray empty folder `cache$v`, and in
`fly/transition97/` a 4-frame test video with a test camera file (the script overwrites the camera file after the
final).

STATUS: CYCLES STAGE READY, NOT RENDERED - fly/v10 PORTED FROM fly/v9 + ROUTE 97B (PATHS BYTE-IDENTICAL, EXPOSURE CURVE, SHELL, DOORS, MARQUEE TEXT, DRY CANOPY, SPLASH AND SKY FIXES); BUNDLE fly/v10/roxy-cloud-bundle-97.tar.gz (33.4 MiB, SHA-256 587e24c3...98c4a7, 1,600 FRAMES, DRAFT AND FINAL) FITS THE MULTI-POD HELPER; LIGHT LINKING 54 / 16 OF 64, WHOLE STATE PER RENDER, PROBE PER WORKER, TWO-WORKER MATCH TEST PASSED; LOCAL SMOKE OF BOTH MODES AND FOUR REAL FINAL FRAMES THROUGH THE HELPER'S WORKER PASSED; FINAL ALSO WRITES THE CHATTERS' DEPTH; ESTIMATE DRAFT 0.6-1.0 GPU-H ($0.4-0.9), FINAL 2.5-3.5 GPU-H ($1.5-3.2); HALL FILL NOT NEEDED IN CYCLES; BOARD FONT IS A STAND-IN (OSWALD NOT ON THIS PC); NO LINUX OR CLOUD RUN, NO FULL-LENGTH RENDER; NO COMMIT; WAITING FOR THE OWNER'S SPEND APPROVAL; STOP.
