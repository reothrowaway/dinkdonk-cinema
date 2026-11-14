# Notes 98 - Fly-through: depth of the opening frames (14 Nov 2026)

Brief: `BRIEF-98-flythrough-opening-depth.md`. Local RTX 3050 only, one Blender job at a time, no cloud, no commit.
New files only: `fly/depth98/` (scripts, new depth, checks, logs) and `fly/transition98/` (staging for the page agent).
Nothing in `fly/transition/`, `fly/transition97/`, `fly/v10/` (production blends, final result), packs, pages or
`shared/` was changed. `production_A.blend` was only opened, never saved.

## Cause (confirmed)

In global frames 1-87 the camera is **outside the sky dome** `P8 enclosing indigo cloud sky` (a 300-unit sphere around
the origin; frame 1 eye at about 19,000 units, frame 87 at 8.8 units outside its surface, frame 88 inside).
`build_port97.py` made the dome's outside face transparent to camera rays in the material
(`76 camera outside transparent | ...`: Backfacing x Is Camera Ray -> Transparent BSDF). The final's depth pass
(`render67.py`, state `depth`) keeps that object camera-visible: `see_through()` returns False on purpose for
`76 camera outside transparent` materials, and the pass runs with every bounce at 0 (transparent bounces too), so
the camera ray stops on the dome's outside and its position is written as the depth. Result: one curved surface
about 11 units past `near` and about 140 units in front of the lobby, which hid every chatter.

How it was confirmed:
- Ray casts from the frame 1, 20, 45, 70, 84 and 87 cameras: the first hit is the dome's outside face at the exact
  depth in the receipts (frame 1: 18836.4, receipts 18835.9-18838.7; frame 87: 8.82, receipts 8.69-8.93); the lobby
  comes about 140 units later. Frame 88: no dome hit in front, the lobby is the first hit.
- Reproduction: the same depth pass with the final's policy unchanged (dome seen) on frames 1, 87 and 88 gives the
  final's codes (frame 1: largest difference 1 code of 65534 on 1.4 % of pixels; 87 and 88: under 0.1 % of pixels
  over 10 codes, edge pixels; 4090 vs 3050). With only the dome added to the depth-pass exclusions, the lobby
  appears (below).

## What was re-rendered

- **Depth only, global frames 1-87** (part A frames 1-87), `fly/depth98/render98.py`: it uses `fly/v10/render67.py`'s
  own `Renderer` (same `production_A.blend`, camera rows, `camera()` / `phase()` / `state('depth')` / `shoot()`,
  same 16-bit code and PNG writer). The only change: the dome joins the depth-pass exclusion list (not seen by the
  camera in the depth pass; the colour state is untouched and colour is not rendered). Policy as Brief 78: opaque
  surfaces at the central pose, 0.01-frame shutter, glass / rain / water / transparent layers not seen, 1920x1080.
  The worker's probe passed (0 % of blocks over 25 %, mean difference 0.0).
- Output: `fly/depth98/out/00001_depth.png` ... `00087_depth.png` + `NNNNN.json` receipts (near, far, min/max z,
  valid fraction, seconds, policy "... sky dome not seen (Brief 98)").
- **near / far:** the camera's own clip range, as in the final's receipts (frame 1: 18824.57-19124.57; frame 87:
  0.05-295.49). The real lobby fits with wide margins in every frame: 139.8-144.3 units after `near`, 132.5-134.6
  units before `far`, no code within 535 codes of `far`. So the values are the same as before, and
  `transition-camera.json` comes out byte-identical to the live one.
- Frames 1094-1100 (flat, 0.36-0.59 units from the lens; flat from 1094, not 1096): **not the same bug, left alone.**
  The camera is inside the dome there; the hit is `Pass6 interior back 3` with material
  `67 absolute black vestibule depth`, the opaque black panel of the cut through the door (Brief 68). The picture is
  black there, so hiding the cards behind it is right.

## Checks (`fly/depth98/check98-depth.json`, `check98-video.json`)

New depth, frames 1-87:
- Span (max z - min z) 22.95-26.97 units (was 0.24-3.06); valid fraction 0.8468-0.9996, identical to the final's
  (frame 1: 0.9996; it falls with the sky entering the view, as from frame 88 on).
- **87 -> 88 join:** frame 87's surface points reprojected into frame 88's camera land on frame 88's (unchanged)
  depth with a median error of 0.005 units (90 % within 0.014), 99.3 % within 0.5 units. Same as inside the final
  (88 -> 89: 0.007; 89 -> 90: 0.005) and inside the new range (85 -> 86: 0.017; 86 -> 87: 0.011). Median lobby depth
  84-90: 215.9, 190.6, 168.9, 150.7 | 135.6, 123.1, 112.7 (smooth). The old 87 -> 88 pair was 143.5 units off.
- **Frame 1 floor match** (11 page foot spots, world [u, -v, 0] through frame 1's view/projection): every spot lands
  on the lobby page's own isometric pixel (900 + 60(u-v), 350 + 30(u+v)) within 0.06 px. On 8 of them the depth at
  the foot is the floor at the foot's own depth (difference -0.001 to -0.079 units = 0.001-0.067 depth steps,
  tolerance 0.35): hangout 1 and 2, snack 1-3, both entrance sills, gnome spot 5. 3 are hidden by real geometry in
  front of them (ray casts): both ticket-queue spots (4.85, 7.4) and (4.85, 6.0) lie behind the street marquee board
  and roof (4.5 and 6.0 units in front), gnome spot 1 (12.2, 6.1) behind the bench seat (0.46). With the old depth all
  11 were hidden by 136-141 units.

Packed video `fly/transition98/transition.webm` (built by `fly/depth98/build_transition98.py`, a copy of
`build_transition97.py`: frames 1-87 take the new depth and receipts, everything else as before, same packing and VP9
settings `-crf 24 -b:v 0 -row-mt 1 -cpu-used 4 -deadline good -g 60`):
- 1920x1620 VP9, yuv420p, 30 fps, 53.333 s, 1,600 frames; a full decode gives no errors.
- Decoded frames 1, 20, 45, 70, 87, 88, 100, 600, 1300 against the source depth: coarse tile mean |difference|
  0.08-0.57 steps (99th percentile 1-5), "no surface" pixels agree on 99.4-99.99 %, depth decoded as the page does
  (coarse + fine fold): median error 0.024-0.049 steps, 95th percentile 0.12-0.40 steps; in units, median 0.03-0.04
  in frames 1-70, 0.12 at 87/88.
- Colour source: all 1,600 PNGs of the final match their receipts' SHA-256 (byte-identical input).
- Against the live `fly/transition/transition.webm`: decoded frames **181-1600 are bit-identical** (frame MD5s);
  frames 1-180 differ only by the re-encode (the depth tiles of 1-87 changed; colour 40-89 dB PSNR, mean 0-1.5 of
  255).
- `transition-camera.json`: 1,600 entries, same fields; byte-identical to the live one (near/far unchanged).

## Timings

- Depth re-render 1-87: 1,061 s wall (setup + probe 14 s, 87 depth passes 705 s = 7.1-8.6 s each, the rest scene
  updates per frame). Reproduction run (3 frames): 43 s. Ray-cast inspections: about 1 min each.
- Pack: 3 min 14 s. Checks: about 4 min.

## Files

- `fly/transition98/transition.webm`: 63,361,355 bytes, SHA-256
  `28a02dc21b27d001f21d1dc964cb831df26ce45c14ed6282801f0134718207d0`
- `fly/transition98/transition-camera.json`: 865,719 bytes, SHA-256
  `6d71ac421de183a4b52efbc0f76e6c6a55c31d83882dc75e15aa5f91627d22a2` (= live)
- `fly/depth98/`: `render98.py`, `build_transition98.py`, `check98.py`, `extract_ref98.py` (re-extracts the final's
  reference depth PNGs that `check98.py depth` reads; deleted after the checks), `inspect98*.py` (ray casts), logs,
  `out/` (the new depth, 57 MB; the pack script reads it).
- Temporaries deleted: reference PNGs, reproduction PNGs, render scratch.

## For the page agent

- Promotion is a copy of the two files in `fly/transition98/` over `fly/transition/` (the camera file is the same).
- Not checked: the page itself (the 1,600-frame video in lobby.html with real chat). In frame 1 people at the ticket
  window are hidden by the street marquee and someone on gnome spot 1 by the bench; that is the 3D geometry standing in
  front of them from this pose.
- `PROGRESS.md` was not edited (brief: new files only).

STATUS: DONE - CAUSE CONFIRMED (CAMERA OUTSIDE THE SKY DOME IN FRAMES 1-87; THE DOME'S CAMERA-TRANSPARENT OUTSIDE FACE WAS STILL HIT BY THE 0-BOUNCE DEPTH PASS); DEPTH OF GLOBAL FRAMES 1-87 RE-RENDERED LOCALLY WITH THE DOME NOT SEEN (SAME CAMERA, 1920x1080, BRIEF 78 POLICY, SAME CODE FORMAT, NEAR/FAR = CAMERA CLIP, UNCHANGED); 87->88 JOIN SMOOTH (0.005 UNITS MEDIAN); FRAME 1 FEET ON THE FLOOR WITHIN 0.08 UNITS AND 0.06 PX OF THE LOBBY POSE (3 OF 11 SPOTS BEHIND REAL MARQUEE/BENCH); FRAMES 1094-1100 = BLACK DOOR-CUT PANEL, NOT THE SAME BUG, UNCHANGED; STAGED fly/transition98/ (WEBM 28a02dc2..., CAMERA = LIVE), FRAMES 181-1600 BIT-IDENTICAL TO LIVE; NO PAGE TEST, NO PROMOTION, NO COMMIT; STOP.
