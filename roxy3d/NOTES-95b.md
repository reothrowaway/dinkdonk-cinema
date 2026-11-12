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

STATUS (95b): DONE - CAUSE FOUND (PER-WORKER ON/OFF LIGHT SWITCHES AT THE CLOUD JOB'S 4-ITEM CHUNK BOUNDARIES, NOT RENDER NOISE); out10r2 STAGED FROM THE SAME 49 PHASES WITHOUT A RENDER (14 SWITCHES REMOVED, REAL BELL NEON, RAIN AND RIPPLES KEPT; 896 CHECKS PASS; VP9 1x/2x, 144 FRAMES, 24 FPS); WALL FLICKER 0.70 -> 0.15 AND 0.31 -> 0.06, WHOLE FRAME 0.43 -> 0.22; PAGE LOADS IT WITH NO ERRORS; WET GLASS LOOPS STILL FLICKER (NOT IN SCOPE); out10r AND PAGES UNCHANGED; NOT PROMOTED; STOP.

---

## Brief 95c (12 Nov 2026): the wet highlight loops, staged as out10r3

The coordinator copied out10r2's 20 changed files + `checksums.json` into the live `out10r/` (backup in
`standby/backups/2026-11-12-r95/out10r.before-r2/`). This follow-up fixes the occluders' wet highlight loops
(`prop_loops wet_*`) the same way. No render, no cloud; `out10r/`, pages and everything outside `roxy3d/` untouched.

**Same cause.** Each wet group was rendered as 24 occluder items (phases 0, 2, ... 46), claimed four at a time
(chunk = (global item - 1) // 4 from `frames.json`; for every wet group the 24 phases fall in six chunks of four).
Two-level patterns inside the groups' alpha (40+ px), and which are constant in every chunk:

| Group | Worker switch (24 phases) | px | levels off / on | target |
|---|---|---|---|---|
| glass_left | `000000001111000000001111` | 3,777 | 17.3 / 42.0 | time average 0.33 (draft 32 unclear: 34.2) |
| glass_right | `111111100000000111111110` | 250 | 11.6 / 18.2 | on (draft 32) |
| partition_right | `000000000000001111000000`, `111111111111110000111111` | 59, 43 | 62-64 / 68-70 | on (draft 32) |
| front_solid_wall | `110000111111111111111111` | 80 | 39.2 / 44.9 | time average 0.83 |

The other 9 wet groups have no switch and are untouched. glass_right also has one real (non-aligned) pattern, kept and
guarded.

**What changed.** `rerender95b/pack95c.py`, same method as pack95b (per switch near its pixels: step c = mean(on) -
mean(off), set to the target where clear; then flat-inside-every-chunk pixels to their median), applied to the 24
phases at 1x and 2x of the four groups (glass_left: 4,720 px changed at 1x, 20,639 at 2x). Then exactly pack95's
build: occluder picture = per-channel minimum (live alpha; RGB zeroed under per-phase alpha 0 for the Brief 95 shape
groups, as pack95 did), slices cut by the live slice alphas, wet sheets = phase - parent (48 frames, 8 x 6), full
stills and ad overlays by pack95's own code. **Proof that the script builds what pack95 built:** `--reproduce`
rebuilds all 13 wet groups without correction and got 250 of 250 files byte-identical to out10r. Checks on out10r3:
1,277, 0 failures (alpha of every occluder equal to out10r, slices disjoint and rebuilding their parents at 1x and 2x,
sheet sizes, referenced files). The light loop and base are not touched (they are the out10r2 files).

**Numbers** (wet sheets, 1x, 48 frames cyclic, mean |frame(i+1) - frame(i)| over the sheet; mean / max / peak value;
`rerender95b/wetloops95c.json`):

| Sheet | out10 | out10r | out10r3 |
|---|---|---|---|
| wet_glass_left_00 | 0.011 / 0.040 / 9 | 0.026 / 0.225 / 35 | 0.012 / 0.064 / 3 |
| wet_glass_left_01 | 0.012 / 0.043 / 11 | 0.036 / 0.337 / 100 | 0.012 / 0.053 / 9 |
| wet_glass_left_02 | 0.011 / 0.040 / 15 | 0.049 / 0.504 / 115 | 0.011 / 0.049 / 5 |
| wet_glass_left_03 | 0.013 / 0.045 / 12 | 0.084 / 0.898 / 129 | 0.015 / 0.067 / 9 |
| wet_glass_left_04 | 0.018 / 0.055 / 9 | 0.117 / 1.238 / 123 | 0.021 / 0.088 / 3 |
| wet_glass_left_05 | 0.019 / 0.060 / 16 | 0.118 / 1.250 / 91 | 0.024 / 0.116 / 12 |
| wet_glass_right_02 | 0.022 / 0.061 / 93 | 0.044 / 0.264 / 97 | 0.031 / 0.115 / 97 |
| wet_partition_right_08 | 0.004 / 0.031 / 4 | 0.011 / 0.124 / 8 | 0.010 / 0.106 / 8 |
| wet_front_solid_wall_03 | 0.011 / 0.064 / 3 | 0.022 / 0.128 / 5 | 0.022 / 0.125 / 3 |
| All sheets, pixel-weighted mean step | 0.007 (58 sheets) | 0.019 (54) | **0.009** (54) |
| Largest max step of any sheet | 0.182 | 1.250 | **0.202** (wet_snack_05, no switch, unchanged) |

The bright glass reflection (peak 91-129 in out10r, on in 2 of 6 chunks) is now a steady part of the glass picture at a
third of its strength; what still moves in the sheets is the rain on the glass (peaks 3-12, like out10's 9-16).

**Page check.** Headless Edge, real chat, `lobby-qa.html?everyone=1&director=0&artdir=out10r3&mistdir=out10r3`, six
shots about 0.8 s apart: the page loads out10r3 (light loop and rain playing), no page errors (favicon 404 only).
Shot-to-shot change on the left storefront glass 4.5-4.8 and right glass 4.8-5.3 over the first four steps (rain
overlay, chatters); the last step was a camera move of the shared room. The same burst on out10r was zoomed in by
the shared room (again not comparable), so there is no page-level A/B; the figures above are from the pack files.

**Not checked:** OBS; hosted edition and zip; the slices of the four groups in motion on the page at a fixed camera;
the switch targets chosen by time average (glass_left 0.33, front_solid_wall 0.83) against the owner's eye.

**Files to copy from `out10r3/` into `out10r/`** (after backing up `out10r/`): 103 files - these 102, plus
`checksums.json`. Nothing is removed. (Machine-readable: `out10r3_work/pack95c-report.json` -> `differs_from_out10r`.)

- `manifest.json`, `validation.json`, `checksums.json`
- `full.png`, `full@2x.png`, `ads/shelter.png`, `ads/shelter@2x.png`
- `occ_glass_left`, `occ_glass_right`, `occ_partition_right`, `occ_front_solid_wall` - each `.png` and `@2x.png` (8)
- `slices/occ_glass_left_00` ... `_05` (6), `slices/occ_glass_right_00` ... `_02` (3),
  `slices/occ_partition_right_00` ... `_08` (9), `slices/occ_front_solid_wall_00` ... `_03` (4) - each `.png` and
  `@2x.png` (44)
- `prop_loops/wet_glass_left_00` ... `_05` (6), `prop_loops/wet_glass_right_00` ... `_02` (3),
  `prop_loops/wet_partition_right_00` ... `_08` (9), `prop_loops/wet_front_solid_wall_00` ... `_03` (4) - each `.png`
  and `@2x.png` (44)

```powershell
$r = Get-Content roxy3d\out10r3_work\pack95c-report.json -Raw | ConvertFrom-Json
foreach ($f in @($r.differs_from_out10r) + 'checksums.json') { Copy-Item "roxy3d\out10r3\$f" "roxy3d\out10r\$f" -Force }
```

Files: `rerender95b/pack95c.py` (+ `pack95c.log`; `--reproduce`, `--diagnose`), `rerender95b/wetloops95b.py` (now lists
every sheet) + `wetloops95c.json`, `out10r3/` (808 files), `out10r3_work/` (0.1 MB, the report). Blender ran one job at
a time; I waited while the rerender96 agent's jobs ran. `PROGRESS.md` not updated.

STATUS (95c): DONE - THE WET GLASS / WALL LOOPS SWITCHED AT WORKER CHUNKS TOO (4 OF 13 WET GROUPS); REBUILT WITHOUT A RENDER BY THE SAME METHOD, SCRIPT PROVEN BYTE-EXACT AGAINST pack95 (250/250); out10r3 STAGED, 1,277 CHECKS PASS; wet_glass_left MAX STEP 1.25 -> 0.12 (out10 0.06), ALL SHEETS 0.019 -> 0.009 (out10 0.007); PAGE LOADS IT WITH NO ERRORS; 103 FILES TO COPY INTO out10r LISTED; out10r AND PAGES UNCHANGED; NOT PROMOTED; STOP.
