# Brief 101: auditorium screen shots, Cycles port + local draft

14 Nov 2026. Render agent: Claude Opus 5.5. The three approved Godot shots (Briefs 99/100, the glide at strength 2) are
ported into a copy of the house-lights-down draft-14 scene and rendered as a full-length local draft. The final bundle is
sealed but not run. Everything is new and inside `roxy3d/aud101/` (plus this file). No cloud, no RunPod, no download, no
commit. `qa11/`, `out10*`, `fly/transition*`, `godot-spike/assets_v99/`, pages, `shared/` and every existing .blend are
untouched. The source scene was opened and saved under a new name, and its SHA-256 is unchanged. No window was opened:
Blender ran with `-b` only, Godot was not started, and videos were checked by decoding frames with ffmpeg.

## The draft for the owner

| File | Shot | Length | Size |
|---|---|---|---|
| `aud101/draft/t1_draft.mp4` | T1: Film framing -> screen fills the frame | 8.0 s, 241 frames | 0.66 MB |
| `aud101/draft/t2_draft.mp4` | T2: full screen -> hold pose | 10.0 s, 301 frames | 0.58 MB |
| `aud101/draft/t3_draft.mp4` | T3: hold pose -> default view | 11.0 s, 331 frames | 1.26 MB |

Video settings: H.264, 960x540, 30 fps (every frame was rendered), CRF 16. Render settings: Cycles at 24 max / 8 min samples,
threshold 0.05, OptiX denoiser, 1.25-frame motion blur. The draft uses the same scene, lights and materials as the final.
The PNG frames are in `aud101/draft/frames/` (00001-00873, one global timeline). The RTX 3050 took 66.8 min (4.6 s per frame).

What you will see: the room is dark on purpose (lights down). The screen is the page's chroma green. The frames are
dark because of the lights-down art; the screen fills the frame at the end of T1 and the start of T2. Things to look at:
- **T2, 6.4 to 7.5 s:** the camera passes low over the back rows, and the seat backs cover the bottom edge of the screen
  (at most 4.3 % of the screen, frames 193-226 of T2). This is the approved path; Godot measured 0.83 m clearance there.
- **T3, last 8 frames:** the screen fades from green to the plate's dark screen, because the last frame is a byte copy of
  the dim plate (see "Exact frames").
- T1 banks up to 12.6 degrees and leaves the frame edge by up to 155 px. T3 banks up to 8.8 degrees. Both are the
  approved glide at strength 2.

## What was built (`aud101/`)

- **`aud101.blend`** (`build101.py`). It is a copy of `qa11/corridor/corridor_full90_dim.blend`.
  - Whole hall plus corridor in one view layer (the Brief 90 holdout layer is off), film opaque.
  - House lights down as saved. Doors shut: the 102 leaves are at their saved closed pose, and nothing else is animated.
  - Three cameras, each with one action: `B101 T1 shot`, `T2`, `T3`. They are keyed from the rows on one timeline:
    T1 1-241, T2 242-542, T3 543-873. Timeline markers bind the cameras.
  - Per row: `matrix_world`, PERSP lens or ORTHO scale, clip planes, camera type. Sensor 36 x 20.25 mm, horizontal fit.
  - 30 fps, 1920x1080, motion blur on with the rows' 1.25-frame shutter (centred).
  - Final samples are the fly-through final's: 64 max / 16 min, threshold 0.03, OptiX denoiser.
  - `check_blend101.py` checked the camera actions against `camera_path.json` on all 873 frames. Largest differences:
    matrix 4.7e-7, lens 5.6e-8 relative, ortho scale 9.5e-7, clip planes 5.6e-8 relative. No camera-type mismatch.
- **World.** The saved Brief 90 scene keeps the lit world ambient, which was meant for the corridor layer. I rendered T3's
  end pose both ways and compared it with the dim plate:
  - the draft-13 lights-down world (seen by the camera, lights nothing): mean difference 0.378, blocks 0.074;
  - the corridor's world ambient: 0.415 and 0.133.
  I took the draft-13 lights-down world (`WORLD=A`).
- **The screen.** In the Film phase, `auditorium.html` draws `#screenpoly` in `#00ff00` on top of everything (z-index
  70000). OBS's corner pin covers it, or the page uses black when the bridge is linked.
  - In the scene the screen quad is black and camera-only: diffuse, glossy, transmission, volume and shadow visibility
    are all off. It lights nothing, reflects nowhere and casts no shadow.
  - The screen writes an AOV (`b101_screen`). The renderer lays exact `#00ff00` over its coverage, with motion blur.
  - Inside the screen the pixels are exactly (0, 255, 0).
- **Screen corners for OBS** (`corners101.py`): `t1_screen_corners.json`, `t2_...`, `t3_...`.
  - Per frame: the four corners in 1920x1080 pixels at the central pose, projected with Blender's camera model from the
    rows and `cinema_layout_14.json` (`screen.corners_wall`). Each frame also records how far the screen leaves the frame.
  - T1's last frame gives (0,0) (1920,0) (1920,1080) (0,1080). Error 2.4e-13 px.
  - T1's first frame matches the page's zoomed corners to 0.0002 px. T3's last frame matches the layout corners to
    0.0001 px.
  - The Blender camera model agrees with the rows' own projection matrices to 0.00012 px at most.
- **Exact frames.**
  - Global frame 1 (`endpoints/t1_first_*.png`) is the page's Film framing of the dim plate. It follows `screenShot()`:
    the centre of the polygon's bounding box (1288.81, 374.95) and zoom 2.248437. It is sampled bilinear from
    `cinema_draft_14_dim@2x.png`, with the page's green polygon on top (8x8 anti-aliasing).
  - Global frame 873 (`endpoints/t3_last_final.png`) is a byte copy of `cinema_draft_14_dim.png` (SHA-256 checked).
    The draft and smoke versions are exact area reductions.
  - Handovers work as in the Godot viewer, over 8 frames: T1 frames 2-8 with weight 1 - smoothstep(1, 9, f), and T3
    frames 324-330 with weight smoothstep(323, 331, f), mixed in display space.
  - **One change from the viewer:** the approved glide moves the picture about 1.9 px per frame at both ends, so a
    fixed plate would leave a double image of up to 15 px. Here the plate follows the camera, using the affine move
    fitted to the screen corners. That move is exact to under 0.5 px on these near-orthographic long-lens frames.
    `HANDOVER_WARP=0` gives the fixed plate.
- **Depth for the chatters** (Brief 78 policy, as the Brief 97 bundle).
  - Final mode: a second 1-sample pass per frame at the central pose, with no shutter and see-through surfaces hidden.
    Saved as 16-bit PNG: z = near + code / 65534 * (far - near).
  - Draft: only for the plates and frames 120, 241, 400, 542 and 700. All other draft frames have first-hit depth.
  - `build_page101.py` packs results into the page's transition format: colour on top, two half-size depth tiles
    (coarse and fine), and a camera file. It makes one video per shot and decodes every frame back to check it.
- **T2 hold plate.** T2's last pose as a clean still, with no shutter and the green screen.
  - Final: 3840x2160 at the plates' quality (384 / 64 / 0.007). The 1x is the exact 2x2 reduction. Depth is 1920x1080.
    Corners and camera are in `hold_t2.json`.
  - Draft version: `draft/frames/00542_hold_t2*.png`.
  - Final-quality test still: `aud101/look/look_final_00542_hold_t2.png` (74 s on the 3050).

## Check results

| Check | Result |
|---|---|
| Camera path (`godot-spike/campath_v99.py` on the three shots; the ported rows are identical to them) | Pass for all three. No speed swing, no yaw or pitch reversal, zoom runs one way. Fastest turn: T1 11.7, T2 1.3, T3 9.2 deg/s. Speed peaks: 3.85, 0.97, 8.27 u/s |
| Flash scan (`tools/qa-fly/flash.py` on the 873 PNGs) | Largest frame-to-frame luminance step: T1 0.0061, T2 0.0058, T3 0.0062 (of 1). Largest one-frame spike 0.0021. Nothing near the 0.05 used for the fly-through. Grey share changes by at most 0.007 per frame; the grey is the steady cut-away surround |
| Same measures on the decoded H.264 videos | Luminance step at most 0.0061, spike at most 0.0013. Video against PNG: 0.4-1.3 of 255 mean |
| Black or grey flashes | None. Near-black share changes smoothly. Frames 241/242 are fully green by design (the cut) |
| Screen speed (corners) | At most 5.4 px per frame (T1), 2.3 (T2), 4.2 (T3). Largest jerk 0.08 px/frame³. Ends: about 1.4-2.0 px per frame (the approved glide's tilt term at the shot ends) |
| Corners against the rendered green (every draft frame) | Green outside the corner polygon grown by 2 px: 0 px in every frame. Not green inside the polygon shrunk by 2 px: T1 at most 49 px (motion-blurred edges). T2: the seat-back pass (up to 12,426 px of 960x540). T3: only the 8 handover frames, where the plate's screen is not green |
| Depth on the screen against the exact plane distance (frames 1, 120, 241, 400, 542, 700, 873 and the hold) | Median relative error 1.6e-5 to 7.5e-5. That is under half of one 16-bit depth step |
| Depth packed for the page (T1 115-125, T2 532-542, hold) | Round trip through VP9: median relative error at most 0.09 %, p99 2.0 % (edges). Validity mismatch at most 0.3 % |
| Light linking / probe | 16 combinations (limit 60). Probe reference written; every later probe matched (0.0 difference) |
| Helper smoke (`smoke101.py`, its own supervisor and worker code, 2 workers, 8 frames, both modes) | Pass. Plates at 1 and 873, probes passed in all processes, `verify_unpack` accepted the archive, the VP9 decodes (largest mean error 1.73 of 255), a resume changed nothing |
| Helper offline dry run (`DRY_RUN=1 multi.py multi`) | The bundle is accepted (873 frames). Synthetic stock only; no calls to RunPod |

## Plate differences (Cycles at the exact pose, final settings, against the page frames, outside the screen)

| | Mean abs RGB | Mean luminance | p99 | Pixels off by > 8 | 8x6 blocks, mean abs luminance |
|---|---|---|---|---|---|
| T1 first frame vs the page Film framing | 0.32 of 255 | +0.04 | 3 | 0.10 % | 0.04 (worst +0.29, lower left seats) |
| T3 last frame vs `cinema_draft_14_dim.png` | 0.38 of 255 | -0.06 | 3 | 0.13 % | 0.07 (worst -0.65, left edge) |

So the handover to and from the plates is a step under 1 of 255. In Godot it was 1-5 of 255.

## Final bundle (not run)

- **`aud101/roxy-cloud-bundle-101.tar.gz`**: 9,511,409 bytes, 21 members.
  SHA-256 `dece5cfde9adb7108095a7fc2db03d3cc4201209f50d389c9bf8cd3ce4ac649e`.
  - The helper's `validate_archive` accepts it. It uses the Brief 67 contract (`render67.py`, `pipeline.py`,
    `out10.tar.gz`).
  - Draft mode: 960x540, odd frames, 15 fps.
  - Final mode: 1920x1080, all 873 frames, 64/16/0.03 samples, shutter 1.25, opaque depth, and the T2 hold plate.
- **Commands.** Only with the owner's go and money limit; neither was run. From `roxy3d/` in Git Bash:
  `MAX_HOURS=0.75 bash aud101/run101-final.sh` (3 pods), or `MAX_HOURS=0.5 bash aud101/run101-draft.sh` (2 pods; not
  needed now that the local draft exists).
- **After the final, at home:** `build_page101.py --src aud101/cloud-final-result/aud101-final --label final` writes
  the page videos, camera files and hold-plate tiles into `aud101/page/final/` (staging only).

**Estimates (not quotes).** All are based on 5 final frames measured on the RTX 3050, plus the Brief 97 ratio (a 4090 pod
with 4 workers did those auditorium frames about 3x faster).
- **Cloud final, 3 pods:**
  - Rendering work: about 0.8 GPU-hours (4090 class), with each frame taking about 3.4 s.
  - With pod start-up, the hold still, packing and download: about 1.6-2.3 GPU-hours billed, and 35-45 min wall time.
  - **Cost: about $1.0-2.1** at $0.6-0.9 per GPU-hour. The worst case under the limit is 3 x 0.75 h, about $2.0.
  - For scale, the Brief 97 fly-through final (1,600 heavier frames, 5 pods) cost $3.06.
- **Cloud draft (if wanted):** about 0.5-0.8 GPU-hours, $0.3-0.7.
- **Local final on the RTX 3050:**
  - About 17 s per frame: 6-8 s colour, 3.8 s depth, and about 6 s of PNG and EXR handling.
  - 873 frames take about **4.2 h**. Add 74 s for the hold still and about 10 min for packing: **about 4.4 h** in all,
    as one Blender job.
  - The final result is about 0.6-0.9 GB.

## Needs the owner

1. **The final's go and budget**: cloud (about $1-2, `MAX_HOURS=0.75`, 3 pods) or local (about 4.4 h on the 3050).
2. **Seat backs over the screen in T2 (6.4-7.5 s).** Right now OBS pins the film by corners only, so the film would cover
   the seat backs in those 34 frames. Options:
   - key OBS on the exact green instead of pinning;
   - accept it;
   - raise T2's path a little in Godot.
3. **T3's last 8 frames:** the screen fades from green to the plate's dark screen, because the last frame must be a byte
   copy of the plate. The film covers the screen, so this only shows if OBS stops pinning at the cut. If you prefer the
   screen to stay green until the end, the last frame cannot be a byte copy.

## Not verified, not done, to know

- **Nothing was rendered on a cloud GPU.** The probe reference comes from the RTX 3050. Brief 96/97 showed other GPUs pass
  within the limits; if one did not, workers stop in their first minute.
- Not checked in the page or in OBS:
  - the corner files driving a real corner pin;
  - the packed videos in the page's transition player (the page is untouched; there is no player for these shots yet);
  - the hold plate with chatters drawn in.
- The page's own Film effects (projector beam, dust, glow around the screen) are not in the render. The T1 plate is the
  page's art and green polygon only.
- The T1 plate uses bilinear sampling from the @2x art, with no rounding of zoom or translation. The page rounds zoom to 4
  decimals and translation to 0.01 px, a difference under 0.02 px. The browser's own resampling may differ slightly.
- Seat positions in the hold view (which the page needs for chatters) are not made. That is outside this brief.
- `PROGRESS.md` and `README.md` were not updated, because I could only write new files.
- Leftovers that can be deleted: `aud101/smoke101/` (31 MB of smoke copies), `aud101/upload101/` (the unpacked bundle,
  11 MB), and `aud101/cache$v/` (an OptiX cache under a mis-escaped name, the same as `fly/v10/`).

## Files (all in `roxy3d/aud101/`)

- **Scene and inputs:** `aud101.blend`, `camera_path.json` (873 rows, the approved rows plus `global_frame`),
  `t1|t2|t3_screen_corners.json`, `endpoints/` (plates and `provenance.json`), `probe_reference.npz`.
- **Scripts:**
  - `build101.py`, `corners101.py`, `make_plates101.py`, `render67.py` (renderer), `pipeline.py`, `bundle101.py`;
  - `draft101.py`, `look101.py`, `probe101.py`, `platecheck101.py`, `encode101.py`, `qa101.py`, `check_blend101.py`,
    `smoke101.py`, `build_page101.py`;
  - `rb.sh` (Blender runner: `-b` only, refuses if Blender or Godot is running), `run101-draft.sh` and
    `run101-final.sh` (not run), `run.sh` and `watchdog.sh` (copies), `README.md`.
- **Results:**
  - `draft/` (3 mp4 files, 873 frames with receipts, hold draft);
  - `look/` (5 final-quality timing frames and the hold still);
  - `page/draft-test*/` (depth packing proof);
  - `checks/` (`corners101.json`, `platecheck101.json` and the world test, `qa101.json`, `flash_png.json`,
    `flash_no_screen.json`, `corners_vs_green_inner.json`, `t2_seat_occlusion.json`, `check_blend101.json`,
    `smoke101.json`, `encode101.json`, contact sheets);
  - `logs/`, `build101.json`, `bundle101.json`, `roxy-cloud-bundle-101.tar.gz` and its `.sha256`.

STATUS: PORT AND LOCAL DRAFT COMPLETE - aud101/aud101.blend (DIM DRAFT-14 SCENE COPY, THREE CAMERA ACTIONS FROM THE APPROVED ROWS, ERROR UNDER 1E-6, SHUTTER 1.25, LIGHTS DOWN, DOORS SHUT, GREEN #00FF00 SCREEN THAT LIGHTS NOTHING); DRAFTS aud101/draft/t1|t2|t3_draft.mp4 (960x540 30 FPS, 8/10/11 S); PER-FRAME OBS CORNERS (T1 END = FRAME CORNERS, 2E-13 PX); PLATES: T1 FIRST = PAGE FILM FRAMING, T3 LAST = BYTE COPY, CYCLES VS PLATES 0.32 / 0.38 OF 255; FLASH SCAN CLEAN (MAX STEP 0.006), CAMPATH PASS; DEPTH PROVEN ON 7 FRAMES + HOLD; HELPER SMOKE BOTH MODES PASS; BUNDLE aud101/roxy-cloud-bundle-101.tar.gz (SHA-256 dece5cfd...649e) READY, NOT RUN; ESTIMATE CLOUD FINAL ~$1.0-2.1 (1.6-2.3 GPU-H), LOCAL ~4.4 H; NEEDS THE OWNER: FINAL GO + BUDGET, SEAT BACKS OVER THE SCREEN IN T2 6.4-7.5 S, T3 SCREEN FADE; NO CLOUD, NO COMMIT; STOP.
