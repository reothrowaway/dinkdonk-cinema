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
  (0 to 7 degrees) leads into the old path; from 40.7 s on it is the old route, 96 frames later.
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
10. Unchanged from 7 Nov and not looked at: the hall in Godot is darker than the plate on walls and carpet (8 against
    24 and 14 against 30 of 255), so the switch to the plate at 52.3 s shows a step. Cycles does not have this.

## Files

`fly/v9/`: `prep97.py` (what the art changed, per object), `build97.py`, `production_A.blend`, `production_B.blend`,
`delta_*.blend/json`, `build_*.json`, `linkcount_v9.json`, `rb.sh` (runner).
`godot-spike/`: `export_scenes_v97.py`, `assets_v97/`, `assets_v97_A/`, `assets_v97_B/`, `route_v97.py`,
`main_v97.gd/.tscn`, `cinema_timeline_v97.gd`, `live_view_v97.gd`, `brick_v97.gdshader`,
`rain_process_v97.gdshader`, `qa_geometry_v97.py`, `qa_timeline_v97.gd`, `run-route-v97.ps1`, `run-live.bat` (new),
`run-live-7nov.bat` (old), `route_v97_*` (QA results). README, `FINAL-CHECKLIST.md` and `NOTES-godot.md` updated.

STATUS: GODOT STAGE COMPLETE - `godot-spike/run-live.bat` OPENS THE NEW VERSION (CURRENT LOBBY: MARQUEE, POSTER, PROPS, CLAW MACHINE, GATE, WET WALLS; DRAFT-14 AUDITORIUM ENTERED DOWN ITS CORRIDOR AND THROUGH THE DOOR); 7 NOV VERSION KEPT AS `run-live-7nov.bat`; ROUTE 1,600 FRAMES / 53.3 S, PART A UNCHANGED, 120 NEW CORRIDOR FRAMES IN PART B; CAMERA-PATH, GEOMETRY AND TIMELINE QA PASS, LIVE VIEWER STARTS OFFSCREEN; ADDED ON MY OWN AND WAITING FOR THE OWNER'S OK: FLY-ONLY CORRIDOR SHELL (NEAR WALL, CEILING, DOOR-WALL LINING) AND A 1.5-STOP EXPOSURE LIFT IN THE CORRIDOR; NOT DONE: CYCLES PORT AND RENDER (NOTHING IN fly/v9 RENDERED IN CYCLES), MARQUEE TEXT, NEW transition.webm; NO CLOUD, NO VIDEO, NO COMMIT; STOP.
