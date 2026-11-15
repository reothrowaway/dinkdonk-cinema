# Brief 100: auditorium screen shots, twice as slow, simulator-ride motion

14 Nov 2026. Render agent: Claude Fable 5.2. Godot stage only. Changed: `godot-spike/shots_v99.gd`,
`main_aud99.gd`, `live_view_aud99.gd` (backups `*.pre-100.gd`), the three shot files in `godot-spike/assets_v99/`
(the 99c ones are in `assets_v99/pre-100/`). New: `assets_v99/unshaken/` (the same shots without the motion),
`qa_ride_v100.py`, `qa_ride_keys_v100.gd`, `checks_v100/`. No Cycles, no video, no cloud, no page change, no commit.
**No Godot window was opened: every run was `--headless`, and no still was rendered. I have not seen a single picture
of this; the motion is designed and checked by numbers only.**

## How to look at it

`roxy3d/godot-spike/run-live-aud.bat`, as before (1 / 2 / 3 play, Space replays, bar, Tab free fly, H, P).
- **B** = ride motion on/off (off = the plain eased paths).
- **The two keys right of P** (by position, any layout) or **numpad - / +** = weaker / stronger in 0.25 steps, 0 to 3.
  1 = as designed.
- The top line shows the strength and what the ride is doing at that moment (crouch, launch, air pocket, braking,
  arrived ...), so you can name a moment when you want it changed.

## 1. Twice as slow

T1 8.0 s (241 frames), T2 10.0 s (301), T3 11.0 s (331). Same eased paths, same shape; only `LENGTH` changed.
The first and last row of each shot are identical (difference 0) to the first and last row of the Brief 99 files.

## 2. The ride motion

The 99c float is gone. The camera is now a cabin on hydraulic legs, programmed the way those rides were: a few
keyframed axis moves per shot plus jolts at fixed times, on top of the unchanged path.

What I took from reading about the 80s/90s ride films (Star Tours, Back to the Future: The Ride, Showscan/Ridefilm):
- The motion base plays slow, large moves (below about 6 Hz), and the engine vibration is a separate, fine layer added
  on top (Trumbull's Ridefilm patent). So: big slow tilts + a small fast rumble, not one wobble.
- Pitch stands in for acceleration: nose up while it speeds up, nose down while it brakes. A tilt comes on quickly and
  then washes out.
- The moves are programmed frame by frame against the film, one motion beat per action beat: bumps are timed, not noise.
- The film's own camera line stays simple and smooth; the cabin adds the fast part. That is the split used here: the
  eased path is untouched, the ride layer sits on it.
- Hydraulics have weight: a cabin lurches when released and rocks a couple of times when it stops.

Sources: [fxguide, The Art of the Ride Film](https://www.fxguide.com/fxfeatured/the-art-of-the-ride-film-we-visit-6-killer-rides/),
[US 5,199,875 (Ridefilm, supplemental motion)](https://patents.google.com/patent/US5199875),
[Showscan](https://en.wikipedia.org/wiki/Showscan),
[Machine Design on ride motion profiles](https://www.machinedesign.com/automation-iiot/article/21828426/complex-motion-systems-spur-entertainment-industry).

The parts, in every shot: **crouch** (a small dip before it sets off, the engine rumble spooling up), **launch kick**,
**tilt while it speeds up**, **bank into the sideways sweep** with the nose leading, **timed bumps**, **tilt the other
way while it brakes** with the bank swinging back past level, **arrival thud**, then the cabin **rocks back past level
and bounces** (damped springs: nose 2.3 Hz, bank 1.8 Hz, heave 2.8 Hz) and is still. **Engine rumble** (7 to 12 Hz,
about 2 px at full thrust, 1.1 px on average) runs from the crouch to the thud and is cut there.

T2 and T3 travel backward, so their tilt is mirrored: nose **down** while they speed up, nose **up** while they brake.
Left/right of the bank follows the path: T1 sweeps left and banks left, T3 swings right and banks right.

All amounts below are pixels of the 1920x1080 picture. "Nose up 40 px" = the whole picture moves down 40 px.

### T1 (8.0 s): launch, sweep left, dock on the full screen

| Time | What |
|---|---|
| 0.00 - 0.30 s | Still (the plate handover). Rows 1 to 10 untouched |
| 0.30 - 0.95 s | Crouch: nose dips 7 px, the camera sinks 8 px, rumble spools up |
| 1.00 s | Launch kick (nose +14, camera +7 within a tenth of a second) |
| 1.0 - 1.9 s | Nose tips back to 41 px at 1.9 s, then washes out to 5 px by 4.1 s |
| 1.0 - 2.8 s | Banks left to 6.0 degrees at 2.8 s; the nose leads 15 px to the left at 2.1 s |
| 3.45 s | Air pocket: drops 13 px, nose 6 px down, the bank knocked back 1.2 degrees |
| 4.95 + 5.15 s | Double bump: up 10 px, then 5 px |
| 4.1 - 6.3 s | Braking: nose dips to 30 px at 6.3 s; the bank swings past level to 1.8 degrees right at 6.7 s |
| 7.15 s | Docking thud: the camera drops 9 px in a tenth of a second, the rumble cuts |
| 7.15 - 7.8 s | The nose rocks back past level: +7.7 px at 7.37 s, -3.3 at 7.6 s, +0.4 at 7.8 s |
| 7.93 - 8.00 s | Still. The last 3 rows are untouched: the full-screen cut is exact |

### T2 (10.0 s): reverse off the screen, glide back over the heads, park

| Time | What |
|---|---|
| 0.00 - 0.30 s | Still (the full screen, the cut). Rows 1 to 10 untouched |
| 0.30 - 1.00 s | Crouch: leans back, nose up 6 px, camera up 5 px |
| 1.05 s | Reverse-thrust kick (nose 10 px down, camera 5 px down) |
| 1.05 - 2.4 s | Nose tips down to 23 px at 2.4 s, washes out to 2 px by 4.9 s |
| 1.05 - 3.8 s | A small bank to the right, 2.0 degrees at 3.8 s (the shot goes almost straight back) |
| 3.6 s | Air pocket: drops 11 px. 5.4 s: bump, up 9 px with a 1 degree knock. 6.7 s: small bump, 6 px down |
| 4.9 - 7.9 s | Braking: nose lifts to 26 px at 7.8 s |
| 8.95 s | Parking thud: the camera drops 10 px, the rumble cuts |
| 8.95 - 9.6 s | The nose rocks: -6.9 px at 9.17 s, +3.2 at 9.4 s, -0.7 at 9.6 s |
| 9.80 - 10.00 s | Still: the hold pose, exactly. It stays still (nothing floats at the hold) |

### T3 (11.0 s): lift off, swing out to the right, settle on the default view

| Time | What |
|---|---|
| 0.00 - 0.30 s | Still (the hold). Rows 1 to 10 untouched |
| 0.30 - 1.00 s | Crouch: the camera sinks 8 px |
| 1.05 s | Lift-off kick: the camera pops up (12 px kick, 8 px held to 1.65 s), nose up 6 px at 1.5 s |
| 1.5 - 2.9 s | Nose tips down to 36 px at 2.9 s, washes out by 5.6 s; the nose leads 17 px to the right |
| 1.05 - 3.8 s | Banks right to 7.0 degrees at 3.8 s |
| 4.3 s | Air pocket: drops 13 px. 6.2 + 6.42 s: double bump, up 10 then 5 px. 7.7 s: small bump, 7 px down |
| 5.6 - 8.7 s | Braking: nose lifts to 33 px at 8.6 s; the bank swings past level to 2.0 degrees left at 9.1 s |
| 9.72 s | Arrival thud: the camera drops 10 px, the rumble cuts |
| 9.72 - 10.4 s | The nose rocks: -8.5 px at 9.93 s, +3.9 at 10.17 s, -0.7 at 10.37 s |
| 10.57 - 11.00 s | Still. The last 14 rows are untouched: the whole 8-frame plate handover is on a still camera |

### Numbers (strength 1, measured from the matrices of the shot files against the unshaken files)

| | T1 | T2 | T3 |
|---|---|---|---|
| Largest picture shift at the frame centre | 48 px at 1.8 s | 26 px at 7.8 s | 39 px at 2.9 s |
| Largest shift at a frame corner (bank included) | 148 px at 2.7 s | 54 px at 2.8 s | 167 px at 3.6 s |
| Peak bank | 6.0 deg left | 2.0 deg right | 7.0 deg right |
| Peak nose up / down | 41 / 30 px | 26 / 23 px | 33 / 36 px |
| Peak nose sideways | 15 px | 7 px | 17 px |
| Peak heave | 12 px (0.08 m) | 11 px (0.06 m) | 13 px (0.12 m, on the long lens) |
| Real camera pitch / yaw at the most | 0.60 / 0.20 deg | 0.55 / 0.15 deg | 0.67 / 0.32 deg |
| Fastest picture shift | 427 px/s (14 px in one frame, the launch kick) | 383 px/s (13 px, the air pocket) | 433 px/s (14 px, the air pocket) |
| Fastest bank | 20 deg/s | 24 deg/s | 30 deg/s (each for 2 to 3 frames, at a jolt) |
| Settle after the thud (to under 0.5 px and 0.03 deg) | 0.68 s | 0.72 s | 0.71 s |
| Still before the last frame | 0.17 s | 0.33 s | 0.57 s |
| Rumble | 2.2 px peak, 1.1 px rms, 0.05 deg | same | same |

The slow tilts stay under 0.7 degrees of real camera pitch; what reads is the bank, the kicks and the picture shifting
as one piece. Nothing slow keeps swaying (the slowest spring is 1.8 Hz and dies in two swings).

### How it is built (for the Cycles port)

- In `shots_v99.gd`: the program is the `RIDE` table at the top (per shot: keyframes for nose, lean, swing, heave in
  seconds; the jolt list; launch, arrive and still-from times). `apply_ride()` bakes it into `matrix_world` /
  `matrix_view` of each row; each moved row carries `brief100_ride` (nose up / nose left in px, bank in degrees,
  heave in px and meters, the pitch and yaw angles used, the rumble's share). Rows without it are unshaken rows.
- **Frame terms:** nose and swing turn the camera by px / 1920 x sensor / lens, so a long-lens row gets the same
  picture shift as a 50 mm row (at T1's start that is hundredths of a millidegree; a plain angle there would throw the
  picture off the screen). Bank is about the view axis, which is the same at any lens. Heave moves the camera by
  px / 1920 x the frame width at the pivot's depth.
- Deterministic: closed formulas of the shot time, no random numbers, no simulation state.
- `assets_v99/unshaken/t1|t2|t3_camera_path.json` are the same shots without the layer (written by the same export).
  The page work (film corners per frame) can use either; the corners must come from the file that is rendered.
- Each shot file's `godot_shot_v99.ride_motion` holds the program, the times and the units.

## 3. Checks (all headless; logs and results in `godot-spike/checks_v100/`)

| Check | Result |
|---|---|
| Exact frames: T1 first/last, T2 first/last, T3 first/last against the unshaken path (`qa_ride_v100.py`) | All six: difference 0.0 (matrix_world, matrix_view, projection, lens, clip planes). Joins T1 end = T2 start and T2 end = T3 start: 0.0. Also 0.0 against the Brief 99 files' first and last rows |
| Per-row record against the matrices | Agrees to 1e-10 px; the only translation is along the camera's up |
| Viewer camera at the ends (`qa_shots_v99.gd`, run headless) | Pass: T1 start 0.0003 px off the Film framing, T1 end corners 0.0002 px, T3 end 0.0001 px, T2 end = hold pose; keys 1/2/3, Space, arrows, Home, bar, H, Tab, P (to a test file) |
| `campath_v99.py` on the base motion (`assets_v99/unshaken/`) | T1, T2, T3 pass: no yaw reversal, no pitch reversal, no speed swing, frame width one way. Fastest turn 12.4 / 0.8 / 8.6 deg/s, fastest travel 3.85 / 0.97 / 8.27 u/s (half of Brief 99's, as expected) |
| Motion layer | The table above (`checks_v100/ride_qa.json`, every 0.23 s in `ride_table.txt`) |
| `qa_clearance_v99.py` (limit 0.30 m), on the files with the motion | Pass. T1 1.07 m to a row H seat back, 0.88 m to a stand-in. T2 0.73 m to a row I seat back, 0.60 m to a stand-in (the same as without the motion: the camera is level there). T3 and the hold pose 3.0 m |
| `qa_frames_v99.py` | T1 start, T1 end, joins, T3 end, handover steps (0.52 / 0.47 px): all pass. **It exits 1 on its Brief 99 rule "the screen never leaves the frame"**, as it did for 99c; see below |
| Ride keys (`qa_ride_keys_v100.gd`) | Pass: B off = the unshaken rows, on = back; the two keys by position and numpad - / + step 0.25, stop at 0 and 3; ends exact at strength 3 too; every pose finite; the HUD shows it |
| Viewer autoplay, headless, T1, T2, T3 once in real time | Exit 0 in 51 s, `AUTOPLAY_DONE`, no script error, no engine error or warning in any log. A plain start (180 frames) and the export also exit 0 |
| `--len=4,5,5.5` (the times scale with the length) | Ends exact, settles inside the shot |

**The screen's edge leaves the frame** (an edge of the film is cropped for a moment; the unshaken paths never do it):

| | Frames | Furthest | Where |
|---|---|---|---|
| T1 | 169 of 241 | 53 px | Bottom edge 1.4 - 4.6 s (up to 52 px at 2.6 s: nose tipped back + bank; the Film framing already fills 94% of the frame). Top edge 5.6 - 7.8 s (up to 53 px at 6.5 s: nose dipped while braking, the screen nearly fills the frame by then) |
| T2 | 106 of 301 | 35 px | Bottom edge 0.4 - 1.3 s (up to 10 px, the crouch). Top edge 1.4 - 3.9 s (up to 35 px at 2.4 s: nose tipped down, right after the full-screen cut) |
| T3 | 58 of 331 | 40 px | Top edge 2.5 - 4.4 s (up to 40 px at 3.4 s: nose tipped down + bank; the hold view has only 66 px above the screen) |

**None at the T1 cut:** the last 3 frames of T1 are the exact full-screen rows, and the 3 frames before them are
within 0.5 px. In T1's last second the screen fills 99 to 100% of the frame, so the arrival shows there as crop:
46 px at 7.0 s (still braking), 33 px just after the thud, 11 px at 7.5 s, under 3 px from 7.7 s. This is inherent to
any shake on a frame-filling screen; a lower strength reduces it in proportion, B removes it.

## Not done, not verified, to know

- **I never saw it.** No window, no stills. Whether it feels like the rides you mean, and whether strength 1 is the
  right amount, is yours to judge in the viewer. The keys go to 3x; tell me the strength you like, or the moment
  (the HUD names it) that should be stronger, weaker, earlier or gone, and I change the table.
- Real keyboard and mouse were not used; keys were tested by calling the key handler (the two keys by their physical
  position codes).
- The rumble is 7 to 12 Hz on a 30 fps picture: it should read as a fine tremor of about 2 px. Not seen; if it
  looks like flicker, it is one number (`RIDE_RUMBLE`).
- The thud comes while the eased path still creeps its last 1% (the path's ease-out has no hard stop): T1 at 7.15 s,
  T2 at 8.95 s, T3 at 9.72 s. Later would not leave room to settle inside the shot.
- The viewer's single-precision camera on the long-lens rows (T1's first second, T3's last): the baked angles there
  are tiny; I expect the same sub-pixel steps as the base path has (0.5 px), not measured in a picture.
- P in free fly rewrites the T2 and T3 files at the strength set at that moment (the file records it) and their
  unshaken copies.
- With `--len` shorter than the design lengths the program's first moves start before the 8-frame plate handover is over.
- One thing outside `roxy3d/`: I ran `git status` once (read only, to see what was open); git refreshed its own
  `.git/index` stat cache. Nothing was staged or committed.
- `run-aud99.ps1` and `qa_shots_v99.gd`'s header still describe a window placed off the desktop. I did not use that:
  `checks_v100/run-headless.sh` runs everything with `--headless`. `run-live-aud.bat`, `README.md` and `PROGRESS.md`
  are unchanged.
- Not done (as in Brief 99): Cycles port, film corners per frame, the hold view's plate with depth, chatters.
  The hold itself is still, so the page's hold plate needs no motion.

## Files

- Changed: `godot-spike/shots_v99.gd`, `main_aud99.gd` (`--ride=<strength>`, `--exportdir=`), `live_view_aud99.gd`;
  backups `shots_v99.pre-100.gd`, `main_aud99.pre-100.gd`, `live_view_aud99.pre-100.gd`.
- Shot files: `godot-spike/assets_v99/t1|t2|t3_camera_path.json` (with the motion), `assets_v99/unshaken/` (without),
  `assets_v99/pre-100/` (the 99c files). `hold_pose.json` unchanged.
- QA: `qa_ride_v100.py`, `qa_ride_keys_v100.gd`, `checks_v100/` (`ride_qa.json/.txt`, `ride_table.txt`,
  `campath_base.txt`, `clearance_qa.*`, `frames_qa.*`, `shots_qa.json`, `ride_keys_qa.json`, logs,
  `run-headless.sh`, `table.py`, `summ.py`; `v99c-results/` = the 99c results that the v99 scripts overwrote in
  `checks_v99/`).
- Untouched: every v97 Godot file, `run-live.bat`, `run-live-aud.bat`, `qa11/`, `out10*`, `fly/transition/`, pages,
  `shared/`, every .blend.

STATUS: GODOT STAGE COMPLETE - T1 8.0 S / T2 10.0 S / T3 11.0 S; 99C FLOAT REPLACED BY A SIMULATOR-RIDE LAYER BAKED INTO `assets_v99/t1|t2|t3_camera_path.json` (CROUCH, LAUNCH KICK, TILT WHILE SPEEDING UP, BANK 6.0 / 2.0 / 7.0 DEG, TIMED BUMPS, TILT WHILE BRAKING, ARRIVAL THUD + BOUNCE SETTLING IN 0.7 S, 2 PX RUMBLE); ALL SIX EXACT FRAMES IDENTICAL TO THE UNSHAKEN PATHS (DIFFERENCE 0); CAMPATH (BASE), CLEARANCE (NEAREST 0.60 M), KEYS AND HEADLESS AUTOPLAY PASS, EXIT 0; `qa_frames_v99.py` EXITS 1 ONLY ON "SCREEN LEAVES THE FRAME" (T1 169 FRAMES UP TO 53 PX, T2 106 / 35 PX, T3 58 / 40 PX; NONE AT THE T1 CUT); NOT VERIFIED: ANY PICTURE OF IT (NO WINDOW, NO STILLS), THE FEEL AND THE AMOUNT, REAL KEYBOARD; B = ON/OFF, TWO KEYS RIGHT OF P OR NUMPAD - / + = STRENGTH; NO CYCLES, NO CLOUD, NO COMMIT; STOP.
