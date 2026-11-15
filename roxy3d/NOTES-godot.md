
## 7 Nov 2026 - Godot route v3
- Camera/bus JSON in `godot-spike/assets_v2/` is now authoritative; edited by `route_v3.py`, previous paths/scripts saved in `route-v3-backup/`. Geometry export preserves those routes.
- Opening starts on the exact original orthographic pose, pulls back locally, and dissolves between same-pose projections at 2.8-3.8 s. Eye stays within 49.4 units of origin; distant-camera precision noise removed.
- Dive/street travel is 2.0995-2.1000 units/s from 9.0-20.86 s. Bus drives independently at 5.6 units/s from the start and meets the camera at 14.43 s; camera timing never follows the bus.
- Smoothed turn-rate banking reaches -11.88/+13.63 degrees; horizon counter-rolls into turns. Maximum adjacent roll change 0.637 degrees. Lobby speed eases to 1.073 units/s for the tight interior route.
- Re-ran `tools/qa-fly/campath.py`: part A min/median/max 0.01/2.10/17.85 units/s, no near-still stretches >=0.5 s. Four >15% swing flags are the planned pull-back/swoop and later lobby slowdown; none in the constant dive/street section. Part B remains unchanged. Full output: `godot-spike/route_v3_campath.txt`.
- Live viewer starts offscreen with `--mode=live --quit-after 70`, exit 0; starts at frame 1. HUD/scrubbing/free fly retained; dissolve sits below controls and hides during free fly. Existing certificate-store/texture cleanup messages remain.
- Delivered `godot-spike/route_v3_preview_540p.mp4`: full A1-A1100, 960x540, 30 fps, 36.67 s, single-sample quick preview. Capture 140.95 s + encode 16.28 s. Metadata and 15 selected decoded frames checked; dissolve boundary is clean. Existing frozen door state remains at the final handoff. No hash audit, full re-decode, 1080p final, protected-file changes, computer use, downloads or cloud.
STATUS: COMPLETE - GODOT ROUTE V3, INDEPENDENT BUS TIMING, BANKING, LIVE STARTUP CHECK AND FULL PART-A 540P PREVIEW DELIVERED; STOP.

## 7 Nov 2026 - Godot route v4 (live review only)
- Removed the projection dissolve/overlay entirely. `route_v4.py` edits the authoritative camera JSON; previous camera/bus paths and live scripts are in `godot-spike/route-v4-backup/`. Exact first isometric pose retained.
- Orthographic pull-back hands over at 3.0 s to a matched narrow frustum, then widens during flight. Godot rejects ordinary FOV values below 1 degree; `set_frustum` supports these optics. At handoff, near/far are 59890/60190 (ratio 1.005), tightly enclosing the scene. Actual Godot CPU projection QA: 7,410 visible static mesh-bound corners, max error 0.546 px at 1920x1080, fractional boundary motion <=0.346 px, no tested clipping. See `godot-spike/route_v4_projection_qa.json`; appearance is for live owner review.
- Opening heading is one smooth right turn, rejoining the accepted dive at 8.7 s. `tools/qa-fly/campath.py` now reports yaw-rate reversals with a 2 deg/s deadband and part-local times. Part A: NONE in 0-9 s; intentional later turns at 14.784 s (right->left, post-bus street turn), 26.359 s (left->right, lobby counterturn), 34.190 s (right->left, final screen alignment). Removed the tiny final yaw overshoot. Unchanged part B: 6.522 s (right->left). Times estimate zero crossing; report also lists deadband confirmation times.
- Banking remains smoothed: -10.57/+13.63 degrees, max adjacent change 0.500 degrees. Dive/street remains 2.0995-2.1000 units/s; independent 5.6 units/s bus and 14.43 s near miss unchanged. Path QA: four >15% speed swings in the pull-back/approach and lobby slowdown; none in the steady dive/street, no part-A near-still stretches. Part B's existing 0.93 s end hold remains. QA reports physical route-reference speed separately from optical-eye retreat: `godot-spike/route_v4_campath.txt`.
- Live viewer starts offscreen with `--mode=live --quit-after 180`, native 1920x1080 viewport, frame 1, exit 0. Route/scrub/free-fly hook retained; no script/FOV errors. Existing certificate-store/texture cleanup messages remain. No preview video, render capture, protected-file audit, computer use, downloads or cloud.
STATUS: COMPLETE - ROUTE V4 NO-FADE HANDOFF, SINGLE OPENING TURN, YAW QA AND OFFSCREEN LIVE STARTUP CHECKED; STOP.

## 7 Nov 2026 - Godot route v5: doors and auditorium
- Handoff component QA (offscreen numeric statistics, frozen weather): sharp shadow-edge spikes plus a smaller broad GI/fog shift; SSR is not the main cause. Smooth shadow-opacity easing at 2.0-2.8 / 5.5-6.5 s reduces the sampled projection-switch peak from 93.6 to 31.9/255. Some GI/fog difference remains for live review / separate Cycles handling. No projection fade. Evidence: `godot-spike/handoff_v5_components.json`.
- Read-only v7 exports in `assets_v5_A/` and `assets_v5_B/`; previous paths/scripts in `route-v5-backup/`. Screen 1's two padded leaves and hardware rotate rigidly on their hinges; 19 curtain folds translate using v7 tracks mapped by `godot_animation_frame`. Opens 34.10-35.40 s to 88 degrees; camera crosses hinges at 36.27 s. Black backing is unshaded; final A center ray enters that black depth.
- Auditorium added: draft-13 room/seats/screen/stage curtain/padded tunnel, 37 approximated warm house/passage and broad fill lights. One 1,504-frame / 50.133 s live timeline; hard cut at global 1101 (36.667 s), inside darkness, with v7 exposure adaptation. Full scrub bar and free fly work across both rooms. Final 30 frames use the exact live auditorium plate; underlying camera is the exact orthographic endpoint, with 0.000173 px landmark error. Free fly hides the plate.
- Full `campath.py`: A's accepted dive/street remains 2.10 units/s; B tunnel remains 2.01, zero B speed-swing flags, one continuous height rise. Only near-still stretch is the final 0.93 s hold. Intentional yaw reversals on the FULL live clock: 14.784 s R->L, 26.359 s L->R, 34.190 s R->L, 43.189 s R->L (B-local 6.522 s); none in 0-9 s. B banking -3.35/+13.43 degrees, max adjacent change 0.469 degrees. Independent bus unchanged. `godot-spike/route_v5_campath.txt`.
- Projection, 404-frame B geometry visibility, door clearance/timing, rigid transforms, scene-cut/scrub/free-fly integration QA pass. Live starts offscreen with `--quit-after 180`, all 1,504 frames, exit 0 (17.02 s); no script errors. Existing certificate-store/texture cleanup messages remain. Updated `godot-spike/FINAL-CHECKLIST.md` for porting. No preview video, protected-file audit, computer use, downloads or cloud; appearance awaits owner live review.
STATUS: COMPLETE - V5 HANDOFF MITIGATION, RIGID DOORS/CURTAIN, A+B LIVE TIMELINE, QA AND FINAL PORT CHECKLIST UPDATED; STOP.


## 7 Nov 2026 - Opening-only v6 correction
- Changed only camera fields in A2-A180. Exact frame 1 preserved. Replaced the pull-back speed dip with one quadratic ease; the fly-in uses one shared progress for pose, retreat and distance-derived lens, with smooth endpoint velocity. Handoff stays at 3.0 s, max framing error 0.546 px, tight clips retained. Frame-181 velocity mismatch is 0.003% in the finite-difference check.
- Byte comparison PASS against `godot-spike/route-v6-backup/`: the entire 4,023,147-byte suffix from A181 onward (1,324 frames including B), frame 1, bus, door/curtain tracks, lighting and runtime scripts are identical. No renderer, viewer, door or lighting edits. Proof: `godot-spike/route_v6_scope_comparison.json`.
- Screen speed rises once to 33.77 px/frame at frame 140 (4.63 s), then falls smoothly through frame 181 (15.78). `campath.py`: no yaw reversals in 0-9 s, no new near-still stretches; only the unchanged final 0.93 s hold. Six reference-position speed-swing flags remain; projected speed has no surge/brake turns. Full QA: `godot-spike/route_v6_campath.txt`.
- Live starts offscreen with `--quit-after 180`, exit 0; existing certificate/texture cleanup messages only. Reproduction: `godot-spike/opening_v6.py --write`. No videos, audits, computer use, downloads or cloud.

Requested `screenspeed.py ...camera_path.json 1 200` output:

```text
frames 1-200: screen speed min/max 0.03/33.77 px/frame
speed turns (surge <-> brake) at frames: none
  frame    1 ( 0.00 s):   0.03 px/f  ORTHO
  frame    7 ( 0.20 s):   0.34 px/f  ORTHO
  frame   13 ( 0.40 s):   0.66 px/f  ORTHO
  frame   19 ( 0.60 s):   0.98 px/f  ORTHO
  frame   25 ( 0.80 s):   1.30 px/f  ORTHO
  frame   31 ( 1.00 s):   1.62 px/f  ORTHO
  frame   37 ( 1.20 s):   1.94 px/f  ORTHO
  frame   43 ( 1.40 s):   2.25 px/f  ORTHO
  frame   49 ( 1.60 s):   2.57 px/f  ORTHO
  frame   55 ( 1.80 s):   2.89 px/f  ORTHO
  frame   61 ( 2.00 s):   3.21 px/f  ORTHO
  frame   67 ( 2.20 s):   3.53 px/f  ORTHO
  frame   73 ( 2.40 s):   3.84 px/f  ORTHO
  frame   79 ( 2.60 s):   4.16 px/f  ORTHO
  frame   85 ( 2.80 s):   4.48 px/f  ORTHO
  frame   91 ( 3.00 s):   4.81 px/f  PERSP
  frame   97 ( 3.20 s):   6.83 px/f  PERSP
  frame  103 ( 3.40 s):  10.95 px/f  PERSP
  frame  109 ( 3.60 s):  16.12 px/f  PERSP
  frame  115 ( 3.80 s):  21.51 px/f  PERSP
  frame  121 ( 4.00 s):  26.40 px/f  PERSP
  frame  127 ( 4.20 s):  30.29 px/f  PERSP
  frame  133 ( 4.40 s):  32.81 px/f  PERSP
  frame  139 ( 4.60 s):  33.76 px/f  PERSP
  frame  145 ( 4.80 s):  33.14 px/f  PERSP
  frame  151 ( 5.00 s):  31.07 px/f  PERSP
  frame  157 ( 5.20 s):  27.87 px/f  PERSP
  frame  163 ( 5.40 s):  24.02 px/f  PERSP
  frame  169 ( 5.60 s):  20.15 px/f  PERSP
  frame  175 ( 5.80 s):  17.01 px/f  PERSP
  frame  181 ( 6.00 s):  15.78 px/f  PERSP
  frame  187 ( 6.20 s):  14.81 px/f  PERSP
  frame  193 ( 6.40 s):  12.94 px/f  PERSP
  frame  199 ( 6.60 s):  10.59 px/f  PERSP
```
STATUS: COMPLETE - OPENING-ONLY SCREEN-SPEED CORRECTION, BYTE COMPARISON AND LIVE STARTUP PASS; STOP.

## 13 Nov 2026 - Version 97: current lobby and auditorium (Brief 97)
- `run-live.bat` opens `main_v97.tscn`; the 7 Nov version is `run-live-7nov.bat` and none of its files changed. New scenes `fly/v9/production_{A,B}.blend` (v7 fly scenes + what the art changed since: marquee, poster, props, claw machine, gate, wet-wall materials; draft-14 corridor), exported to `assets_v97_A/`, `assets_v97_B/`.
- Route `assets_v97/camera_path.json` (`route_v97.py`): part A row for row the approved one; part B gets 120 new frames down the corridor and through the door, then the old B25-B404 96 frames later. 1,600 frames / 53.333 s. Exposure +1.5 stops in the corridor.
- Added for the flight only: corridor near wall, ceiling and door-wall lining, hidden from global frame 1260. Entrance leaves open at 38.1-39.1 s.
- `campath.py`: no new speed swing, no new yaw reversal (`route_v97_campath.txt`). Geometry, door and clearance QA pass (`route_v97_geometry_qa.json`, nearest new object 0.33 m). Timeline QA passes (`route_v97_integration_qa.json`). Live starts offscreen with `--quit-after 180`, exit 0; the whole route played once without script errors. Full notes: `NOTES-97.md`.
STATUS: COMPLETE - V97 SCENES, CORRIDOR ROUTE, QA AND OFFSCREEN LIVE START PASS; OWNER REVIEW IN THE LIVE VIEWER PENDING; STOP.

## 13 Nov 2026 - Version 97b: hall pan and hall brightness (owner feedback on the first capture)
- Owner: 43-49 s showed the same piece of screen; pan right to the audience first, then to the screen, then zoom out; and the hall was almost black. `route_v97.py`: between global 1272 and 1472 the look direction pans right to 110 degrees (peak 45.4 s, lens 7 degrees lower), then one left turn runs into the approved pull-back. Positions, speed, lens, length (1,600 frames) and part A are unchanged. Exposure stays +1.0 stop from the door to 48.0 s and is 0 by 49.7 s.
- `cinema_timeline_v97.gd`: one even, shadowless hall fill and the row fills at 0.08, tuned to the plate at the end pose (walls 25 against 24 of 255, seats 23-30 against 25-33, slab front 21 against 21; before 8, 4-39, 11).
- `campath.py`: still one yaw reversal in B (the pan's peak, 45.4 s), no speed swing added, turn max unchanged (65.6 deg/s, the pull-back). Geometry and timeline QA pass again. 720p capture for the owner: `concepts/fly/flythrough-v97b-godot-720p.mp4`.
STATUS: COMPLETE - V97B HALL PAN, HALL EXPOSURE AND PLATE MATCH; QA PASS; CAPTURE DELIVERED; STOP.

## 14 Nov 2026 - Version 99: three auditorium screen shots (Brief 99)
- New launcher `run-live-aud.bat` opens `main_aud99.tscn` (`main_aud99.gd`, `live_view_aud99.gd`, `shots_v99.gd`): the v97 auditorium with the house lights down (dim-render factors per light, tuned to `qa11/cinema_draft_14_dim.png` at the plate pose: seats 4.0-5.6 against 3.8-5.5 of 255, left wall 3.3 against 3.5, tunnel mouth 37 against 42, surround 13.8 against 13.7). `run-live.bat` and every v97 file are unchanged.
- Shots (`assets_v99/t1|t2|t3_camera_path.json`, same format as the route): T1 4.0 s from the page's Film framing (plate zoomed 2.248) to the screen filling the frame square-on (50 mm, 12.43 m from the screen); T2 5.0 s back to the hold pose u 10.5, v 17.5, 3.75 m high, 3.6 degrees left, 1.8 down, 50 mm (`assets_v99/hold_pose.json`; P in free fly overwrites it, `hold_pose_brief99.json` is the original); T3 5.5 s out to the default plate pose. Orthographic end frames with a matched long lens next to them, as in the fly-through.
- Keys: 1/2/3 play, Space replay, bar, Tab free fly (Z/X lens, P save hold pose), H grey audience stand-ins (75 of 135 seats). Placeholder film with a bright edge on the screen. The real dim plate shows on T1's first and T3's last frame (8-frame handover).
- Checks (`checks_v99/`): `campath_v99.py` no yaw reversal and no speed swing in any shot, fastest turn 24.8 / 1.5 / 17.1 deg/s; T1 start 0.0003 px, T1 end corners 0.0002 px, T3 end 0.0001 px; joins identical; clearance at least 0.60 m (`qa_clearance_v99.py`); `qa_shots_v99.gd` passes; live starts offscreen with `--quit-after`, exit 0, all three shots played once. Full notes: `NOTES-99.md`.
STATUS: COMPLETE - V99 AUDITORIUM SHOTS T1/T2/T3 IN THE LIVE VIEWER (`run-live-aud.bat`), LIGHTS DOWN, QA PASS, OFFSCREEN START EXIT 0; OWNER REVIEW IN THE VIEWER PENDING; CYCLES PORT AND PAGE WORK NOT STARTED; STOP.

## 14 Nov 2026 - Brief 99b: spaceship bob (owner: "i like it, just needs a lil bit of spaceship bobbing")
- `main_aud99.gd` / `live_view_aud99.gd` (backups `*.pre-bob.gd`): a float on top of the shot paths - heave 0.55% of
  the frame width (~11 px), sway 0.3% (~6 px), roll 0.5 deg; periods 3.6/1.9, 6.2 and 4.8/2.3 s. Envelope: T1
  sin^2 (still at the Film start and at the full-screen cut), T2 fades in and keeps floating at the hold, T3 fades out.
  The bob clock runs while playing and while holding at T2's end, so T3 continues it without a jump.
- Viewer: B bob on/off, [ / ] strength in 0.25 steps (HUD shows it); `--bob=<strength>` on the command line.
- Checks: T1 frame 1, T1 frame 121 and T3 frame 166 byte-identical with and without bob; live autoplay of T1-T3 exit 0.
- Not in the camera-path JSONs yet (the base paths are unchanged); bake it in for the Cycles port, and the page will
  need the same float on the T2 hold plate.
STATUS: COMPLETE - BOB IN THE VIEWER, PAGE-MATCHED FRAMES UNCHANGED; OWNER REVIEW PENDING; STOP.
- 14 Nov (later): owner: 4 was the max and still too low, "something like 10". Default strength now 10 (heave ~105 px,
  sway ~58 px, roll up to ~5 deg at the hold), keys step 1.0 up to 25; the keys work by position (two keys right of P,
  any layout) or numpad -/+. Page-matched frames still byte-identical; live autoplay exit 0.

## 14 Nov 2026 - Brief 99c: spaceship bob done properly (owner: the setting "was never intended to go that high",
## "it kinda keeps bobbing forever, should be done properly")
- The viewer overlay (99b) is gone (`main_aud99.bob1.gd`, `live_view_aud99.bob1.gd` keep it). The bob is now part of
  the camera paths in `shots_v99.gd` (`apply_bob`, backup `shots_v99.pre-bob.gd`): the camera floats like a hovering
  ship while it moves and banks into its turns, and settles when the move ends. Heave 4.5% / sway 2.2% of the frame
  width, bank 0.22 deg per deg/s of turn, wobble 1.2 deg; envelope T1 x(1-x)^3 (calm while docking onto the full
  screen), T2 (1-x)x^3 (calm while leaving it), T3 16x^2(1-x)^2. Strength 1 = as designed (keys 0-3, B off).
- Baked into `assets_v99/t1|t2|t3_camera_path.json` (rows carry `brief99_bob`), so the Cycles port gets it too.
- Checks (headless only, no window): all six start/end matrices identical to the unbobbed ones; peaks T1 63 px /
  4.2 deg, T2 74 px / 1.1 deg, T3 67 px / 3.7 deg; campath_v99 passes as before (base path); clearance T2 0.71 m
  seat / 0.52 m stand-in; qa_frames: the screen's edge leaves the frame by up to 36 px in 43 T1 / 19 T2 frames (the
  Film framing already fills 94% of the frame), none at the cut itself; live autoplay of T1-T3 exit 0.
STATUS: COMPLETE - BOB BAKED INTO THE SHOTS, SETTLES ON ARRIVAL; OWNER REVIEW PENDING; STOP.

## 14 Nov 2026 - Brief 100: shots twice as slow, simulator-ride motion (owner: "the animations are not it, have them
## be 2x slower and also actually have the effect of those old simulator attraction thingies")
- Lengths: T1 8.0 s (241 frames), T2 10.0 s (301), T3 11.0 s (331); same eased paths (`LENGTH` in `shots_v99.gd`).
- The 99c bob is replaced (backups `shots_v99.pre-100.gd`, `main_aud99.pre-100.gd`, `live_view_aud99.pre-100.gd`; the
  99c shot files are in `assets_v99/pre-100/`). The camera is now a cabin on hydraulic legs with a programmed ride
  (`RIDE` table in `shots_v99.gd`, `apply_ride`): crouch 0.3-1.0 s, launch kick, nose tips back while it speeds up
  and dips while it brakes (mirrored in T2/T3, which travel backward), bank into the sideways sweep (T1 6.0 deg left,
  T2 2.0 right, T3 7.0 right), 3 to 5 timed bumps per shot, arrival thud (T1 7.15 s, T2 8.95 s, T3 9.72 s) with a
  damped bounce that settles in 0.7 s, engine rumble about 2 px from crouch to thud. Sized in frame terms (px of a
  1920 frame -> angle by the row's lens), deterministic, baked into `matrix_world`/`matrix_view`, per row
  `brief100_ride`. `assets_v99/unshaken/` has the same shots without it.
- Viewer: B = ride motion on/off, the two keys right of P (by position) or numpad - / + = strength 0 to 3 in 0.25
  steps, 1 = as designed; the HUD shows the strength and the ride's current phase. `--ride=<x>` on the command line.
- Checks (`checks_v100/`, all `--headless`, no window, no stills): the six exact frames and both joins identical to
  the unshaken paths (0.0) and to Brief 99's end rows; peaks T1 48 px / 6.0 deg, T2 26 px / 2.0 deg, T3 39 px / 7.0
  deg, largest step 14 px in one frame (a kick); `campath_v99.py` passes on the base paths (12.4 / 0.8 / 8.6 deg/s);
  clearance T2 0.73 m seat / 0.60 m stand-in; keys QA and `qa_shots_v99.gd` pass; autoplay T1-T3 exit 0. `qa_frames_v99.py`
  exits 1 only on "the screen leaves the frame": T1 169 frames up to 53 px, T2 106 / 35 px, T3 58 / 40 px, none at
  the T1 cut (last 3 rows exact). Full notes: `NOTES-100.md`.
- Headless runs: `checks_v100/run-headless.sh <label> <quit-after> [args]`. Do not use `run-aud99.ps1` for checks any
  more: it opens a window off the desktop.
STATUS: COMPLETE - T1/T2/T3 AT 8/10/11 S WITH THE SIMULATOR-RIDE LAYER BAKED INTO THE SHOT FILES, EXACT FRAMES UNCHANGED, HEADLESS QA PASS (qa_frames: SCREEN EDGE LEAVES THE FRAME BY UP TO 53 PX, REPORTED); NOT SEEN IN A PICTURE BY THE RENDER AGENT; OWNER REVIEW IN THE VIEWER PENDING; STOP.

## 14 Nov 2026 - Brief 100b: no more tremor (owner: "it looks like the cameraman has parkinsons")
- `shots_v99.gd` (before: `shots_v99.pre-100b.gd`, files `assets_v99/pre-100b/`): engine rumble off (7-12 Hz read as a
  shaking hand at 30 fps); jolts 1.1 Hz, damping 0.6, eased in over 0.25 s (were 2.8-3.6 Hz, damping 0.33, snapping in
  within one frame); arrival springs 0.9-1.2 Hz, damping 0.5-0.55 (were 1.8-2.8 Hz, 0.25-0.28); the doubled and small
  bumps dropped (T1, T2, T3 keep launch, air pocket, one bump, arrival thud). Program keyframes unchanged.
- Measured on the picture centre: jerk 12-17 -> 1.7-2.3 px/frame^2, biggest frame step 13-15 -> 5-7 px, peak offset
  unchanged (45 / 24 / 38 px). Ends exact; campath pass; clearance 0.74 m seat / 0.60 m stand-in; headless autoplay exit 0.
STATUS: COMPLETE - RIDE LAYER SMOOTHED; OWNER REVIEW PENDING; STOP.

## 14 Nov 2026 - Glide: the lobby's way (owner: still jerky; "how did the lobby animation do the head bobbing, do the same")
- Cause found: the Brief 100 ride keyframes eased every axis to a full stop at each key (stop-start steps), plus
  jolts. The lobby fly-through has no jolts or springs: turn-rate banking (14 deg * tanh(0.65 * rate / 14 deg),
  Gaussian-smoothed, faded) and smooth swooping paths.
- `shots_v99.gd` `apply_glide()` replaces `apply_ride()` in build_all (ride code kept; before: `shots_v99.pre-glide.gd`,
  files `assets_v99/pre-glide/`): the lobby bank (sigma 9 frames, 0.8 s fades), one slow swoop locked on the pivot
  (3.5% of the frame width; T1/T3 dip then rise, T2 rise then settle), nose up/down with the eased path's
  acceleration (22 px). Strength keys and B unchanged.
- Measured: centre jerk 1.7-2.3 -> 0.01-0.02 px/frame^2, frame step 5-7 -> 0.7-0.9 px, bank acceleration
  97-123 -> 0-6 deg/s^2; bank T1 6.3 / T2 0.4 / T3 4.4 deg. Ends exact; campath pass; clearance 0.80 m seat /
  0.71 m stand-in; headless autoplay exit 0.
STATUS: COMPLETE - GLIDE LIKE THE LOBBY; OWNER REVIEW PENDING; STOP.

## 14 Nov 2026 - APPROVED: glide at strength 2 (owner: "lets go with this with the bob setting on 2")
- `RIDE_STRENGTH` default 2.0 (viewer B restores 2), baked into `assets_v99/t1|t2|t3_camera_path.json`: bank T1 12.6 /
  T2 0.9 / T3 8.8 deg, swoop up to 0.59 / 0.54 / 1.21 m, tilt 44 px. Ends exact; campath pass; clearance 0.83 m seat /
  0.81 m stand-in; headless autoplay exit 0. Lengths 8 / 10 / 11 s, lights down, T2 hold pose `assets_v99/hold_pose.json`.
- Next (needs the owner's go): Blender/Cycles port of the three shots, per-frame film corners for OBS, a dim T2 hold
  plate with depth for the chatters, then page/control buttons.
STATUS: GODOT STAGE APPROVED; STOP.
