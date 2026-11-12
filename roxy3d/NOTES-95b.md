# Brief 95b: lobby reflection flicker in out10r - fixed at the pack step, staged as out10r2

12 Nov 2026. Owner: "reflections are flickering all over the scene" (out10r, live since today). No GPU render, no
cloud. `out10r/` (live) untouched (its `light_loop.webm` still hashes `822cdae4...`, as its receipt says). Nothing
committed. Pages, `out10*` other than the new `out10r2/`, and everything outside `roxy3d/` unchanged.

## Cause (not render noise)

The 48 background phases are not noisy from phase to phase. Whole surfaces switch between **two fixed levels**, and
they switch exactly where the cloud job's **worker chunks** begin: phase 0 (a canary item) | 1-4 | 5-8 | ... | 45-47
(`CHUNK=4` in the five-pod run; `frames.json`: phases 1-4 = global items 9-12, and so on). Inside a chunk nothing
switches. So in some workers' renders a light was on, in others off. Examples (1x, luma 0-255, 9x9 box):

| Surface | levels | pattern over 48 phases |
|---|---|---|
| Brick band over the corridor + alley back wall (51,724 px two-level) | 14 / 29 | on 0-4, 9-20, 25-28 |
| Left block's brick band (35,021 px) | 10 / 30 | on 1-4, 9-12, 17-24, 29-36, 45-47 |
| NEXT SHOWING board and the four WC signs (12,921 px) | 40 / 57 | off only in 25-28 |
| Annex / record-shop roofs, bottom right (3,401 px) | 11 / 19 | on 1-4, 29-40, 45-47 |
| plus 10 smaller ones (roof copings, vents, a lit ledge, bottom-left roof puddles) | | |

Real animation does not do that: the bell / neon holds change every 12 phases (11|12, 23|24, 35|36, inside chunks),
rain drops are single phases, ripples and the hidden-city neon in the puddles change inside chunks. Which state
is "right" is not certain; the wet-wall reflection cards (`B95 wall reflection card ...`, light-linked to their
walls) are the likely switch (light linking or persistent data differing per worker), not proved. Played at 24 fps,
the 4-phase holds make whole walls blink at about 6 Hz: that is the flicker.

## What I changed (only the home pack step, new folder)

`rerender95b/pack95b.py` (Blender's Python, no rendering) builds `out10r2/` from the same 96 phase products pack95
unpacked (`out10r_work/products/bg`, each checked against the result's `frames.json` hashes):

1. Find the two-level patterns (pixels that sit on exactly two levels share a 48-bit on/off signature; 21 patterns
   with 150+ px). 14 change only at chunk boundaries = worker switches (removed); 7 do not = real (kept: bell neon x2,
   bottom-left roof puddles x3, two rain/ripple patterns).
2. Per switch, largest first, only within 24 px of its own two-level pixels and never within 2 px of a real pattern:
   step c = mean(on phases) - mean(off phases) per pixel and channel; where the luma step is clear (|c| >= 0.75, t >= 5)
   the pixel is set to the target state in every phase: x - c (s(t) - target).
3. Pixels flat inside every four-phase chunk but stepping between chunks (several switches on one pixel, e.g. the lit
   ledge under the left block's roof) take their 48-phase median.
4. Then exactly as pack95: base = per-channel minimum, loop = phase - base (asserted exact complement), lit_bg =
   corrected phase 0, full stills and ad overlays by pack95's own `production.full_stills_ads`, both videos by its
   `video.encode_and_validate` (VP9, crf 4, 144 frames, 24 fps, 1920x1080 and 3840x2160, decoded black check).

Target state per switch: the state draft 32 shows (one local render, the approved look) where it tells clearly
(9 of 14, incl. the corridor band = on, the bottom-right roofs = off); otherwise the time average of the two states
(left block's brick band 56% on, NEXT SHOWING board / WC signs 92% on, two small ones). Full list with levels in
`out10r2/manifest.json` -> `brief95b.switch_targets`; one line per switch in `pack95b.py` would change a target.

Changed pixels: 292,645 at 1x (14%), 1,232,544 at 2x. Files that differ from out10r: `base`, `bg`, `lit_bg`, `full`
(1x, 2x), 8 ad overlays, `light_loop.webm` (9,003,817 B), `light_loop_2x.webm` (30,857,643 B), `manifest.json`
(`asset_pack_revision` brief95b-stabilised-loop, `brief95b`, `brief95` kept so the page treats it as the Brief 95
pack), `validation.json`, `checksums.json`. The other 787 files are out10r byte for byte. Checks: 896, 0 failures
(base + loop phase 0 = lit_bg at 1x and 2x, no clipping in any phase, video contract equal to out10r's, all
referenced files present, decode check passed).

Tried and dropped: (a) one joint least-squares fit of all patterns per pixel - near-collinear patterns gave huge
offsetting terms and touched 1.4 M pixels (stopped, deleted); (b) an "area gate" that also corrected rippled pixels
where the step averaged over a 9x9 box was clear - it made rippled roofs and puddles worse (roof top-left 0.36 ->
0.40, street-puddle max step 1.9 -> 2.7); off in the script, kept for the record.

## Numbers

Decoded `light_loop.webm` (1x) + base, frames 0-47, box-downscaled to 480x270, mean |frame(i+1) - frame(i)|, 8-bit.
"first 20" = the 19 steps of frames 0-19 (mean / max), as in the owner's measurement. Regions in stage px.
`rerender95b/measure95b.json`.

| Region (x0,y0-x1,y1) | out10 | out10r | out10r2 |
|---|---|---|---|
| Roof top-left (100,40-700,300) | 0.05 / 0.08 | 0.71 / 2.61 | **0.36 / 0.80** |
| Walls, left block (80,250-360,560) | 0.08 / 0.12 | 0.70 / 2.31 | **0.15 / 0.18** |
| Alley wall (1690,560-1900,800) | 0.06 / 0.09 | 0.31 / 2.42 | **0.06 / 0.11** |
| Roofs bottom right (1600,800-1920,1080) | 0.02 / 0.04 | 0.07 / 0.11 | 0.07 / 0.10 |
| Street (0,560-560,1080) | 0.33 / 0.41 | 0.62 / 1.77 | **0.53 / 1.02** |
| Lobby interior (600,520-1400,900) | 0.02 / 0.06 | 0.04 / 0.11 | 0.04 / 0.11 |
| DINK DONK sign (1160,30-1700,420) | 0.09 / 1.15 | 0.35 / 2.28 | **0.11 / 1.14** |
| Whole frame | 0.12 / 0.25 | 0.43 / 1.61 | **0.22 / 0.41** |

Real animation still moves (street puddles: ripples and drops; my numbers differ a little from the owner's because the
regions are mine):

| Puddle area | out10 | out10r | out10r2 |
|---|---|---|---|
| Street puddle left (100,660-280,780) | 1.12 / 1.42 | 1.14 / 1.45 | 1.13 / 1.43 |
| Street puddle middle (480,880-680,1010) | 1.54 / 1.81 | 1.57 / 1.91 | 1.56 / 1.91 |
| Puddles bottom right (1420,860-1620,990) | 0.40 / 0.48 | 1.76 / 3.27 | 1.65 / 2.55 |

The bell neon keeps its 12-phase on/off (sign max step 1.14, as out10's 1.15); in the phases, the pepe neon still goes
21 <-> 102 and roof-puddle ripples are unchanged pixel for pixel where no switch was found.

Region-mean luma per phase (spatial averaging cancels ripples, a switch survives; range over 48 phases):
walls left block 2.10 -> 0.13, alley wall 2.29 -> 0.24, roof top-left 2.55 -> 0.59, whole frame 1.13 -> 0.29.

## Page check

Headless Edge (own `rerender95b/burst95b.mjs`, the launch of `qa-night/tools/snap.mjs`), 1920x1080, real chat,
`lobby-qa.html?everyone=1&director=0&artdir=out10r2&mistdir=out10r2`, 25 s wait, six screenshots (one every 0.8 s;
a 1080p capture takes that long, so not "a fraction of a second" apart). The page loads `out10r2/light_loop.webm`
and plays it; Brief 95's page switches are on (keyed on `manifest.brief95`). Shot-to-shot change: alley wall
0.8-0.9, corridor band 2.6-3.5, left block 3.8-4.5 (rain overlay and chatters; one 14.4 = a chat bubble opening over
the wall). By eye: walls steady, puddles rippling, bell neon on. **No page errors** (only a favicon 404). The same
burst on out10r was not comparable: the shared room's camera was zoomed in during it (`director=0` did not stop that).

## Not checked / not done

- **The occluders' wet highlight loops** (`prop_loops wet_*`, built by pack95 from the occluder items, also rendered
  in chunks) flicker too, mainly the left storefront glass: `wet_glass_left_00-05` max step 0.23-1.25 (out10: <= 0.06),
  all 54 sheets pixel-weighted 0.019 (out10 0.007). `out10r2` carries them unchanged from out10r. Same method could
  fix them (a follow-up; `rerender95b/wetloops95b.py` measures them).
- Rippled roofs still have some worker switching hidden under the ripples (roof top-left 0.36 vs 0.05 in out10, partly
  the new roof puddles' real ripples, which out10 did not have); a cleaner fix there needs the switch made consistent
  in a render.
- Which switch state is the intended one (draft 32 decided 9 of 14; the rest are time averages, e.g. the left block's
  brick band sits at about half its sheen, the NEXT SHOWING board and WC signs at 92%).
- The cause in the render setup (light linking vs persistent data per worker) - not proved; a future multi-pod render
  of this scene would switch again.
- OBS, the hosted edition, the zip; a real-OBS look at 30 fps; the out10r page with a fixed camera for a page-level A/B.
- `PROGRESS.md` not updated (not in this job's write list).

## Files

`rerender95b/`: `pack95b.py` (the pack step; `--diagnose` prints the patterns only), `pack95b.log`, `measure95b.py`
(+ `measure95b.json`), `regionseries95b.py`, `analyze95b.py`, `discover95b.py`, `series95b.py`, `draftcmp95b.py`,
`chunkres95b.py`, `wetloops95b.py` (+ `wetloops95b.json`), `burst95b.mjs`, `shotdiff95b.py`. `out10r2/` (the pack,
807 files), `out10r2_work/` (393 MB: loop frames, receipts, `pack95b-report.json`; can be deleted after promotion).

To use it: test with `?artdir=out10r2&mistdir=out10r2` (both are needed: without `mistdir` the page falls back to
`out10mist`). To make it live without page changes: back up `out10r/`, then copy the 20 changed files plus
`checksums.json` from `out10r2/` into `out10r/` (same names; mist maps and everything else are identical), then
redeploy the hosted edition and rebuild the zip as usual.

STATUS: DONE - CAUSE FOUND (PER-WORKER ON/OFF LIGHT SWITCHES AT THE CLOUD JOB'S 4-ITEM CHUNK BOUNDARIES, NOT RENDER NOISE); out10r2 STAGED FROM THE SAME 49 PHASES WITHOUT A RENDER (14 SWITCHES REMOVED, REAL BELL NEON, RAIN AND RIPPLES KEPT; 896 CHECKS PASS; VP9 1x/2x, 144 FRAMES, 24 FPS); WALL FLICKER 0.70 -> 0.15 AND 0.31 -> 0.06, WHOLE FRAME 0.43 -> 0.22; PAGE LOADS IT WITH NO ERRORS; WET GLASS LOOPS STILL FLICKER (NOT IN SCOPE); out10r AND PAGES UNCHANGED; NOT PROMOTED; STOP.
