# Brief 99: three auditorium screen transitions, Godot stage

14 Nov 2026. Render agent: Claude Fable 5.2. Godot stage only: three short camera moves in the auditorium, house
lights down, viewable in the live viewer. No Cycles render, no video, no cloud, no page change, no commit. Only new
files, all in `roxy3d/godot-spike/` (plus this file and a few lines in `NOTES-godot.md`). The v97 Godot files,
`run-live.bat`, `qa11/`, packs, pages and every .blend are untouched (file times checked).

## How to open it

- **Double-click `roxy3d/godot-spike/run-live-aud.bat`.** It opens on T1's first frame (the Film framing), paused.
- **1 / 2 / 3** play T1 / T2 / T3 from the start pose and hold on the end pose. **Space** replays the current shot.
- The bar along the bottom shows the current shot; drag it to scrub (it stays where you leave it). Left/Right = 0.5 s,
  Home = start of the shot.
- **H** = audience stand-ins on/off. **Tab** = free fly (right mouse to look, W A S D, Q/E, Shift, wheel = speed,
  **Z / X** = longer / wider lens).
- **P** in free fly saves the camera you are looking through as the new T2 hold pose. T2 and T3 use it at once
  (press 2 or 3). It is written to `godot-spike/assets_v99/hold_pose.json`, and the T2 and T3 camera files are
  rewritten. My pose is kept in `hold_pose_brief99.json`: copy it over `hold_pose.json` to get it back.
- The fly-through viewer is still `run-live.bat`, unchanged.
- Lengths: add `--len=4,5,5.5` (seconds for T1, T2, T3) after `--mode=live` in the .bat to try others; tell me the
  ones you want and I write them into the shot files.

## The three shots

| | Length | From | To |
|---|---|---|---|
| T1 | 4.0 s (121 frames) | Film framing: the default plate zoomed 2.248 about plate pixel 1288.8, 374.9 (what `screenShot()` gives) | Square-on, the screen filling the frame edge to edge |
| T2 | 5.0 s (151 frames) | Where T1 ends | Hold pose: low behind the back row, over the heads. The camera holds there |
| T3 | 5.5 s (166 frames) | Hold pose | Default auditorium pose (the plate, unzoomed), lights still down |

- **T1.** The camera looks at the centre of the screen the whole way (that point is the centre of the Film framing).
  One arc: 45 degrees of turn and 30 degrees of tilt come off together while the picture closes in on the screen and
  the perspective comes in (as in the fly-through's opening: the first frame is the orthographic plate, then a
  matched long lens far out, then the lens widens to 50 mm). It ends 12.43 m in front of the screen, at the screen's
  centre height (3.74 m), above rows G/H. The screen never leaves the frame on the way.
- **T2.** Straight back and slightly to the right over rows H and I: 5.1 m back, 1.1 m right, level; 3.6 degrees of
  turn, 1.8 degrees of tilt, same 50 mm lens. A slow pull-back (1.9 m/s at its fastest).
- **T3.** One arc up and out to the right about the middle of the house, while the lens goes long again: 41 degrees
  of turn, 28 of tilt, the picture widening from 7 to 32 units. The last frame is the orthographic plate pose. The
  zoom-out runs slightly ahead and the tilt slightly behind the turn, so the screen stays whole in the picture
  (with all three in step its top edge touched the frame's edge half-way).

All three ease in and out (no speed or turn at either end).

## The T2 hold pose I chose

| | |
|---|---|
| Position | u 10.5, v 17.5, height 3.75 m (Blender x 10.5, y -17.5, z 3.75) |
| Direction | 3.6 degrees left of straight at the screen wall, 1.8 degrees down, level horizon |
| Lens | 50 mm on a 36 mm sensor (39.6 degrees wide, 22.9 high) |
| Where that is | 2.6 m behind the line of the back wall (the set is cut away there), 3.15 m behind the heads of the last row, 1.57 m above row I's floor, 0.4 m above the stand-ins' heads; between seats 10.1 and 10.9 |
| In the picture | Screen from x 288 to 1654 (71% of the width) and y 66 to 845 (72% of the height); the heads make a line along the screen's bottom edge, the nearest ones overlap it a little; everything behind is the screen wall, no cut-away edge in view |

I tried eight poses (lens 40 to 50 mm, 1.7 to 3.2 m behind the last row, 3.45 to 3.75 m high). Closer and lower, the
two nearest heads became large blobs over the screen; 40 mm made the screen small (61%). Further back with 50 mm the
rows line up under the screen, because the sight line runs along the slope of the seats.

## What else is in the viewer

- **Scene:** `main_aud99.tscn` / `main_aud99.gd`: the v97 auditorium (`assets_v97_B/`) with a copy of the v97 look
  and light code. Keys and bar: `live_view_aud99.gd`. The shots are built in `shots_v99.gd` from a few numbers at the
  top of that file.
- **House lights down:** every light gets the factor of the dim render (seating pools 6%, sconces 3.5%, pleat washes
  2%, row fills 32%, floor fill 45%, cool edge 10%, screen ambient 0, sconce cores 4%, no world light); the tunnel,
  arrival and approach spills, step dots, EXIT signs and the corridor keep their power. Four Godot-only trims to meet
  the dim plate: the even hall fill at 10%, the mouth and arrival spills times 9, a faint glow on the two cut faces
  of the seat bank, and the surround color (the v97 value came out 12, 16, 21; the plate is 12, 14, 17).
- **Film placeholder:** a grey test picture (grid, circle, color and grey steps, "FILM") with a thin bright border
  and corner marks at the screen's edge. It is unshaded and lights nothing, as the dim art has no screen light.
- **Stand-ins:** 75 of the 135 seats, picked at random with a fixed seed. Plain grey head and torso, sized like the
  page's chatter envelope (0.49 to 1.17 m above the row's floor), so a head stands 0.33 m above its seat back.
- **Plates:** T1's first frame and T3's last frame show the real dim plate (2x art), placed exactly as the page
  places it, with the screen cut out so the 3D placeholder shows where the page pins the film. The plate hands over
  to the 3D room in 8 frames (0.27 s). The stand-ins are not in the plate, so they appear and vanish in that handover.
  `--plates=0` after `--mode=live` switches the plates off.
- **Shot files:** `assets_v99/t1_camera_path.json`, `t2_...`, `t3_...`, same format as `assets_v97/camera_path.json`
  (Blender coordinates, 30 fps, matrix, lens, clip planes per frame).

## Checks run

| Check | Result |
|---|---|
| Camera path (`campath_v99.py`, the measures of `campath.py`) | T1, T2, T3: no yaw reversal, no pitch reversal, no speed swing, frame width one way. Fastest turn: T1 24.8, T2 1.5, T3 17.1 degrees per second |
| T1 start against the Film framing (6 plate landmarks moved by the page's zoom) | 0.0003 px (shot file and viewer camera) |
| T1 end: screen corners against frame corners | 0.0000 px in the shot file, 0.0002 px in the viewer's camera |
| T1 end == T2 start, T2 end == T3 start == hold pose | Identical rows (difference 0); identical viewer camera |
| T3 end against the default plate (6 landmarks) | 0.0001 px; row equal to the v97 end pose |
| Step from the orthographic first/last frame to its long-lens neighbour | 0.52 px (T1), 0.47 px (T3) at most inside the frame |
| Screen in the frame | Never cut off in any of the 438 frames |
| Clearance, lens to anything (1.11 million triangles, stand-ins; 4 samples per frame) | T1 1.12 m (a row H seat back), stand-in 0.89 m. T2 0.73 m (a row I seat back), stand-in 0.60 m. T3 and the hold pose 3.0 m. Limit 0.30 m |
| Viewer test (`qa_shots_v99.gd`, offscreen) | Pass: 1/2/3 play from the start and hold on the end, Space, arrows, Home, bar, H, Tab, P (to a test file) |
| Viewer started offscreen | 180 frames, exit 0. All three shots played once in real time (21 s), exit 0, no script error, no engine error or warning in any log. The launcher's engine binary also starts the scene, exit 0 |

`campath.py` itself cannot read a single shot (it expects the fly-through's 1,100 part-A frames), so
`campath_v99.py` applies the same measures to one shot file.

**Look against the dim plate** (mean brightness of 255; stand-ins off):

| T3 end, default pose | Plate | Godot |
|---|---|---|
| Left wall | 3.5 | 3.3 |
| Seats, middle | 4.3 | 5.6 |
| Seats, lower right | 5.5 | 5.5 |
| Seats, rear left | 4.5 | 4.0 |
| Seats, front | 3.8 | 4.3 |
| Cut face, right | 6.8 | 6.2 |
| Cut face, front | 5.2 to 12.5 | 7.9 to 11.1 |
| Tunnel mouth | 42.2 | 37.1 |
| Front floor | 4.2 | 4.1 |
| Screen wall beside the screen | 0.0 | 1.6 |
| Corridor wall, floor | 16.0, 14.5 | 15.5, 14.3 |
| Surround | 13.7 | 13.8 |

| T1 start, Film framing | Plate | Godot |
|---|---|---|
| Wall left of the screen | 0.2 | 2.7 |
| Seats, lower left | 3.9 | 4.8 |
| Floor in front | 0.7 | 1.1 |
| Wall right of the screen | 0.0 | 1.4 |
| Surround | 13.7 | 13.8 |

So the handover to and from the plate is a step of 1 to 3 of 255, 5 at the tunnel mouth. The screen wall is black in
the plate and very dark grey in Godot (the even fill reaches it).

## Not done, not verified, to know

- **I did not see the viewer in a window.** All runs were offscreen. Keys were tested by calling the key handler, not
  with a real keyboard. Mouse look, W A S D and Z / X in free fly were not exercised by the test (look and movement
  are the v97 code; Z / X is new).
- The picture is dark on purpose: lights down, and the film does not light the room (the dim art has no screen
  light). In the hold view you see the screen, the head silhouettes and faint purple seat backs.
- The hold pose stands outside the back wall line. The set has no rear wall, so nothing is in the way, here or in
  Cycles.
- In T1 and T3 the open sides and the missing ceiling of the cut-away show as the dark surround, as in the
  fly-through's hall pan.
- The page's own film effects (projector beam, dust, glow around the screen) are not in the viewer.
- The spill, cut-face and surround trims are Godot only. Cycles has its own dim lights.
- `godot-spike/README.md` and `PROGRESS.md` are not updated (I was to write new files only).

## Left for the Cycles final and the page

1. **Port.** The three shot files go into the dim scene (`qa11/corridor/corridor_full90_dim.blend` made
   `cinema_draft_14_dim.png`) as the fly-through's path went into `fly/v10`. First frame of T1 = the plate crop the
   page shows (zoom 2.248, from the 2x art, slightly enlarged); last frame of T3 = the dim plate, byte copy.
2. **The film during the moves.** The page pins the film with the screen's four corners. In these shots the corners
   move every frame, so the page (or OBS) needs them per frame. They follow from the shot files
   (`qa_frames_v99.py` computes them).
3. **T2 hold view on the page.** The streamer stays on it, with chatters moving. It needs its own dim plate from the
   hold pose with depth for the chatters (and seat positions in that view), as the fly-through has its depth. Not
   part of this brief.
4. **Chatters during the moves** need the camera per frame and depth per frame, as in the fly-through.
5. **Lengths and the hold pose** are yours to tune; the Cycles port should wait for both.
6. T1 ends on "screen fills the frame" for the cut to the fullscreen movie scene, and T2 starts there: the cut
   points in OBS are frame 121 of T1 and frame 1 of T2.

## Files (all new, in `godot-spike/`)

`run-live-aud.bat`, `main_aud99.tscn`, `main_aud99.gd`, `live_view_aud99.gd`, `shots_v99.gd`,
`assets_v99/` (`t1_`, `t2_`, `t3_camera_path.json`, `hold_pose.json`, `hold_pose_brief99.json`, `standins.json`,
`default_pose.json` and `verification_points.json` (copied rows of the v97 files), `plate_dim.png`,
`plate_dim@2x.png`, `cinema_layout_14.json` (byte copies from `qa11/`)),
QA: `run-aud99.ps1`, `campath_v99.py`, `qa_frames_v99.py`, `qa_clearance_v99.py`, `gltf_tris_v99.py`,
`qa_shots_v99.gd`, results in `checks_v99/` (`campath.txt`, `frames_qa.json`, `clearance_qa.json`, `shots_qa.json`,
`plate_match.txt`, four comparison stills, logs).
About 60 stills I looked at while working are deleted (you review in the viewer).

STATUS: GODOT STAGE COMPLETE - `godot-spike/run-live-aud.bat` OPENS THE THREE AUDITORIUM SHOTS, LIGHTS DOWN (1/2/3 PLAY, SPACE REPLAY, BAR, TAB FREE FLY, H STAND-INS, P SAVES THE HOLD POSE); T1 4.0 S FILM FRAMING -> SCREEN FILLS THE FRAME (CORNER ERROR 0.0002 PX), T2 5.0 S -> HOLD POSE u 10.5 / v 17.5 / 3.75 M, 50 MM, T3 5.5 S -> DEFAULT POSE; SHOT FILES `assets_v99/t1|t2|t3_camera_path.json`; CAMERA-PATH, START/END, CLEARANCE (NEAREST 0.60 M) AND VIEWER QA PASS, VIEWER STARTS OFFSCREEN AND PLAYS ALL THREE, EXIT 0; `run-live.bat` AND ALL v97 FILES UNTOUCHED; NOT VERIFIED: THE VIEWER IN A REAL WINDOW, REAL KEYBOARD AND MOUSE INPUT; NOT DONE: CYCLES PORT, FILM CORNERS PER FRAME AND THE HOLD VIEW'S PLATE WITH DEPTH FOR THE PAGE; NO CLOUD, NO VIDEO, NO COMMIT; STOP.
