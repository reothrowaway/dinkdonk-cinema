
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
