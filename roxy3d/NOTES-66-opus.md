# Brief 66 (independent Opus 5.5 run): cheaper fly-through renders

7 Nov 2026. Same brief as Codex, done separately in `fly/speed-opus/` (Codex's `fly/speed/` and
NOTES-66 were not opened). Local RTX 3050 6 GB laptop, Blender 5.2.3. No cloud, no full render,
nothing in `fly/prod/`, the cloud result, out10/, out10mist/, qa11/, source blends or pages changed:
the production blends were only opened read-only through `prod/render65.py` and never saved.

**Result in one line:** optimized Cycles renders lobby frames **2.3-2.5x faster** locally (auditorium
1.5x) with the look kept; modeled full run on one 4090 **~2.7 h instead of 5.2 h**. Eevee is 4-5x
faster than the reference locally but loses the wet night street, and on a 4090 it would only be
about as fast as optimized Cycles. **Recommendation: optimized Cycles.**

## Deliverables

- `fly/speed-opus/compare_A0001.png`, `_A0350`, `_A0650`, `_A0800`, `_A0850`, `_B0525`:
  reference Cycles (the pod frame) | optimized Cycles | Eevee, 640x360 each, labelled with seconds
  per frame (local 3050 as measured here; 4090 = measured pod time for the reference, model estimate
  for the optimized one).
- Scripts: `bench.py` (interleaved timing), `variants.py` (all toggles and the optimized setups),
  `eevee.py` (Eevee port), `compare.py`, `fit.js` (4090 model), `table.js`. Raw rows in
  `bench/*/results.jsonl` and `eevee/*/results.jsonl`, image diffs in `compare_report.json`.

## GPU contention and method

Codex's Blender was rendering only during my very first smoke render (GPU 99 % before I started;
that render took 51 s instead of 24 s and its OptiX BVH build was 10x slower, so it was discarded).
Every one of the **135 timed Cycles renders and all Eevee renders ran with no other blender.exe
process** (checked with tasklist before and after each render; nvidia-smi logged every 10 s).
Baselines were re-rendered after every two toggles; they stayed within 23.7-25.4 s (540p), so the
toggle numbers are clean. Times are relative to my own baselines from the same window.

Toggles were measured at 960x540 (50 %), persistent data off so each render does a full sync,
and split into **sync/CPU** (scene evaluation, object sync, BVH, light tree) and **sampling**
(Cycles "Sample n/m" span). Final ref/opt/Eevee renders are 1920x1080. Total local GPU time
about 80 minutes. Skipped: tile size (1080p is one 2048 tile on GPU, nothing to gain) and
denoiser off (not viable at lower samples).

## Where the time goes

Reference lobby frame, 1080p, local: **~57-77 s sampling + ~9-11 s CPU overhead** (render65 camera and
phase setup 1.3 s, depsgraph/motion steps 0.8-2 s, OptiX BVH 2.4 s even with persistent data, light
tree 0.5 s, compositing/glare 0.7 s, depth export + PNG 1.1 s). Auditorium B0525: 4.7 s sampling +
2.9 s overhead.

Fitting `4090 time = c * local overhead + local sampling / r` to the six test frames against the real
pod times gives **c = 0.70, r = 7.3**: on the 4090, sampling is 7.3x faster but CPU work only 1.4x.
So on the pod a lobby frame was ~7 s CPU + ~8-10 s GPU, and the CPU share grows as sampling is cut.
(The NOTES-65 projection ratio of 7.56x for the whole frame was too optimistic: measured whole-frame
3050/4090 ratios are 4.5-5.5x for the lobby and 3.3x for B525.)

## Profiling table

Seconds saved per frame at 540p (share of sampling time saved), estimated 4090 seconds saved per
lobby frame at 1080p (model), and mean absolute difference to the baseline image in /255
(A0800 / A0350 / B0525).

| Toggle | A0350 saved | A0800 saved | B0525 saved | Est. 4090 s/frame | Image diff /255 | Visible change |
|---|---:|---:|---:|---:|---|---|
| Fog volumes off | 1.6 (11%) | 2.4 (11%) | - | 1.2 | 0.22 / 0.23 | loses distant haze, mood flatter |
| Fog seen by camera rays only | 1.6 (6%) | 1.4 (7%) | - | 0.9 | 0.21 / 0.16 | none visible |
| Bounces 6/2/3/4/8 (from 10/4/6/8/24) | -0.2 (0%) | 1.0 (0%) | 0.2 (1%) | 0.3 | 0.09 / 0.03 / 0.00 | none, no gain |
| Diffuse bounces 1 | 0.1 (1%) | 0.6 (2%) | - | 0.2 | 0.31 / 0.06 | slightly darker corners |
| Caustics off | 0.3 (1%) | 0.6 (3%) | 0.4 (1%) | 0.3 | 0.89 / 0.28 / 0.14 | fewer glints in glass |
| Indirect clamp 10 | 0.0 | 0.1 | - | 0.0 | 0.02 | none, no gain |
| Light tree off | 3.8 (22%) | 4.0 (24%) | 0.0 (B slower) | 2.2 | 1.53 / 0.84 / 0.34 | no visible change after denoise |
| Emission sampling off (all emitters) | 4.1 (25%) | 2.7 (15%) | 0.4 (19%) | 1.9 | 1.25 / 0.71 / 0.34 | **speckle on the glass counter**, rejected |
| Small point lights (<5 W) off | 0.4 (3%) | 1.1 (8%) | 0.0 | 0.4 | 0.51 / 0.19 / 0.00 | loses marquee/local spill, rejected |
| Glass transmission off | 0.4 (0%) | 0.5 (0%) | - | 0.3 | 0.64 / 0.25 | glass opaque; glass is cheap |
| Falling rain hidden | 1.4 (1%) | 1.4 (1%) | - | 0.9 | 0.02 / 0.09 | rain gone (cost is CPU sync) |
| Splash crowns/pours/micro impacts off | 1.3 (5%) | 2.1 (10%) | - | 1.0 | 0.39 / 0.09 | loses wet ground life, rejected |
| Motion blur off | 3.0 (10%) | 2.7 (12%) | 0.1 | 1.7 | 2.82 / 5.70 | no streaks, rejected |
| Deformation blur off / static objects no blur | ~0 | ~0 | ~0 | 0.0 | 0.01 | none, no gain |
| Volume step rate 4 | 0.0 | 0.1 | - | 0.0 | 0.01 | none, no gain (homogeneous fog) |
| 64 max / 16 min samples | 5.9 (39%) | 6.3 (43%) | 0.3 (28%) | 3.3 | 1.49 / 1.45 / 0.36 | none visible after denoise |
| Adaptive threshold .05 | 4.7 (31%) | 6.5 (44%) | 0.2 (17%) | 3.1 | 0.91 / 0.59 / 0.13 | none visible |
| Glare compositor off | 0 | 0 | - | 0 | 31-63 | loses all neon glow; glare is free |
| **Rain as one geometry-nodes object** (1080p, A0350) | 2.9 total, sync 7.2 -> 4.9 s | | | 0.8-2.0 | **0.01** | identical (positions match to 1e-6) |
| **Persistent data on** (A795-800 sequence) | 1.3 s sync per frame | | | | 0 | production already uses it |

Combinations at 540p (A0350 / A0800): rain GN + light tree off + 64 samples: -57 % / -60 % sampling;
+ threshold .03 + fog camera-only (= **optA**): **-62 % / -64 % sampling, -12.7 / -13.1 s per frame**.

## Optimized Cycles setup

Lobby (A), applied in memory by `variants.py` `optA`:

- Falling rain: the 5,180 driver-animated drop objects (20,720 Python drivers) are disabled and replaced
  by **one geometry-nodes object**: the same 5,180 points with per-drop base/top/height/phase/speed/
  radius/length attributes, Scene Time drives the same fall and scale envelope, instances of the same
  drop mesh are realized into one 41,440-vertex mesh; Cycles deformation blur makes the streaks. Same
  material, same light-receiver collections, no shadow. Image difference 0.01/255.
- **Light tree off** (lobby only; it made the auditorium slower).
- **Samples 64 max / 16 min, adaptive threshold .03** (was 128 / 32 / .02); OptiX denoiser with
  albedo + normal unchanged.
- Fog volume and steam plume visible to **camera rays only** (not in reflections, refraction,
  indirect, shadow).
- Unchanged: bounces, caustics, all lights and emitters, glass, wet materials, crowns and ripples,
  shutter 1.25 frames, glare compositor, AgX Medium High Contrast, exposure, persistent data, depth.

Auditorium (B), `optB`: samples 64 / 16, threshold .03; nothing else.

| Frame | Ref local s | Opt local s | Local speed-up | 4090 ref s (pod, measured) | 4090 opt s (model) | Opt vs pod frame, mean abs /255 | Luma |
|---|---:|---:|---:|---:|---:|---:|---:|
| A0001 | 70.8 | 29.1 | 2.4x | 16.8 | 7.2 | 1.83 | 0.991 |
| A0350 | 68.2 | 29.2 | 2.3x | 14.3 | 7.3 | 1.37 | 0.987 |
| A0650 | 81.0 | 33.7 | 2.4x | 16.7 | 8.7 | 2.38 | 0.976 |
| A0800 | 69.5 | 28.9 | 2.4x | 14.9 | 7.7 | 1.98 | 0.988 |
| A0850 | 88.5 | 36.3 | 2.4x | 16.9 | 8.6 | 1.77 | 0.988 |
| B0525 | 8.1 | 5.5 | 1.5x | 2.4 | 1.9 | 0.32 | 1.000 |

Local times are persistent-data-off single frames (production with persistent data is ~1.3 s less per
lobby frame). My local reference renders match the pod frames to 0.11-0.14/255, so the comparison is
like for like. **Frame 1 vs the live lobby `out10/full.png`: 2.49/255 optimized** (reference 1.87/255,
same Brief 65 metric); B0525 vs `qa11/cinema_draft_13.png`: 0.57/255 (reference 0.54). Looking at full
frames and 1:1 crops: same night mood, neon glow, wet reflections and headlight hot spots; rain streaks
still visible, slightly fainter in the crop; a little more sparkle in the popcorn-machine glass; about
1-2 % darker overall from denoising fewer samples.

**Full 1,625 frames on one 4090 (model): A 2.29 h + B 0.45 h = ~2.7 h render** (pod run 6 Nov: 5.22 h
measured render time). At the historical $0.89/h that is ~$2.45 instead of ~$4.65 render-only, before
startup/transfer. Locally on the 3050: ~10 h (reference ~23 h), so an overnight run at home is possible.

Risks not covered by stills: fewer samples with a fixed seed can flicker or "crawl" in motion, mostly on
glass and wet ground. Before the next production run, render a 3 s test clip (for example A790-A880)
with optA and look at it in motion.

Further, untested: on the 4090, CPU sync is now about 45 % of an optimized lobby frame. Running two
Blender workers on the same 4090 (one syncs while the other samples; VRAM is no problem on 24 GB) could
give another ~1.3-1.6x. The remaining fixed costs are the per-frame OptiX BVH build (2.4 s locally even
with persistent data) and the depth export (~1 s).

## Eevee test

Eevee (Blender 5.2, `eevee.py` preset `final`), same production scenes, same render65 camera/phase/depth
path, rain as the geometry-nodes object: TAA 24 samples, motion blur 4 steps, shutter 1.25 frames,
max blur 96 px; screen-space ray tracing at half resolution, max roughness .6, denoise on; horizon-scan
GI (quarter resolution, distance 10); shadows on, shadow resolution scale .5; volumetrics 8 px tiles,
32 samples, volumetric shadows, range .1-220; screen-space refraction on glass/water materials; the
same glare compositor for neon glow. Shader compile once per process: ~18 s (A), 6 s (B).

Profiling (A0800, 540p): 32 -> 8 TAA samples halved the time; shadow resolution scale .5 halved it again
(143 shadowed lights); motion blur steps, ray tracing, horizon scan and volumes cost little. With
12k objects Eevee is draw-call and shadow bound, not pixel bound.

| Frame | Eevee local s | vs ref local | vs opt local | Eevee vs pod frame, mean abs /255 | Luma vs ref |
|---|---:|---:|---:|---:|---:|
| A0001 | 17.4 | 4.1x faster | 1.7x | 11.69 | 0.69 |
| A0350 | 17.9 | 3.8x | 1.6x | 10.49 | 0.59 |
| A0650 | 17.0 | 4.8x | 2.0x | 15.17 | 0.72 |
| A0800 | 14.5 | 4.8x | 2.0x | 15.27 | 0.83 |
| A0850 | 13.5 | 6.6x | 2.7x | 14.06 | 0.83 |
| B0525 | 3.9 | 2.1x | 1.4x | 3.23 | 0.84 |

What Eevee loses (seen in the compare images and 1:1 crops):

- **Exterior lighting:** facades and street lit by emissive windows/signs go nearly black (emitters do
  not light the scene without baked probes); overall 17-41 % darker.
- **Wet street:** headlight and lamp reflections in the puddles are mostly gone; the car headlight hot
  spot disappears.
- **Rain:** the sub-pixel drops do not show as streaks at 24 samples / 4 steps.
- Interior lobby and auditorium are closest: neon glow (compositor glare) and layout match, but upper
  walls are darker and cooler (no multi-bounce light), glass counter more saturated, shadows a bit
  harder. Fog is there but coarser.
- Frame 1 vs live lobby: **11.35/255** (reference 1.87), B0525 vs live auditorium 3.42/255.

Hiding the ends with crossfades: the camera holds still for A1-A15 and only zooms slowly until about
A90; part B ends with a static hold B497-B525 after the long-lens switch at B496. So: render A1-A45 in
optimized Cycles and crossfade Cycles -> Eevee over **A16-A45 (30 frames, 1 s)**; at the end crossfade
Eevee -> one optimized Cycles still of the hold over **B497-B511 (15 frames, 0.5 s)** and hold the
Cycles still to B525 (B has no animation). Extra cost about 46 Cycles frames (~6 min on a 4090). A
global grade (gain about 1.2-1.4) would shrink the jump, but the missing reflections and rain in the
street part cannot be faded away.

Full 1,625 frames with Eevee: **~5.7 h on the 3050** (measured per-frame times, scaled to all frames);
on a 4090 **~1.9-2.7 h** (not measured: assumes the GPU part runs 2.5-5x faster and CPU overhead as
for Cycles), i.e. roughly the same as optimized Cycles at ~2.7 h.

## Recommendation

Use **optimized Cycles (optA/optB)** for the next fly-through: about half the 4090 time and cost, look
kept within Brief 65 tolerance, no crossfade tricks. First check a 3 s motion clip for flicker, then
consider two workers per GPU. Eevee is not worth it for this scene: on a 4090 it saves little or
nothing against optimized Cycles and loses the rainy wet street that makes the lobby. Its only edge is
a free local render (~5.7 h vs ~10 h optimized Cycles on the 3050).

STATUS: COMPLETE - PROFILING, OPTIMIZED CYCLES, EEVEE TEST, SIX COMPARISONS AND ESTIMATES DELIVERED IN
fly/speed-opus/; NO PROD/SOURCE/PAGE CHANGE, NO CLOUD, NO FULL RENDER; STOP.
