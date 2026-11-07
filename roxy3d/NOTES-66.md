# Brief 66: fly-through render speed study

7 Nov 2026 (started 6 Nov). Local RTX 3050 6GB Laptop GPU, Blender 5.2.3 LTS
`e13b728c6880`. **Use the optimized Cycles preset for the next production setup.**
It preserves the scene and changes only the lobby's adaptive threshold from .02
to .04 outside the opening hold. The four moving lobby checks save
**23.3-32.5%**. The historically calibrated
4090 estimate is **3.95 render hours**, compared
with **5.22 hours** actually recorded for Brief 65.
This is a six-view study, not a new full-film or 4090 benchmark.

All six comparison images are linked in the timing table. Each contains three
640x360 image panels, reference Cycles | optimized Cycles | Eevee, plus a 60-pixel
label band. Native images, depth files, reusable scene copies and drivers are in
`fly/speed/`. No production asset or live page was changed.

## Measurement and profiling

Reference look: the completed cloud frames in
`fly/prod/cloud-result/flythrough65/frames/`, including global frame 01625 for
B0525. Fresh local production baselines use the same source copies, camera/phase
driver, AgX Medium High Contrast, 1920x1080 at 100%, shutter and output pipeline.
Cycles times include evaluation, rendering, compositing, native color, 16-bit
depth conversion and writes; process startup and loading the blend are excluded.
Eevee times include color output only; probe baking is reported separately.

The interior baseline A0800 took 71.66 s: 1.49 s Python setup, 8.91 s sync before
sampling, 57.80 s sampling, .995 s post-sample render work, and about 2.47 s in
remaining output/bookkeeping. Sampling accounts for about 81% of this frame;
at A0650 it accounts for about 86%. See [phase receipts](fly/speed/phase-summary.json).

One feature changes per diagnostic, reloading the production copy between
variants. A0800 and A0650 cover interior and entrance; A0350 covers the dive and
motion blur. First-frame A650/A350 controls are 83.64/69.11 s; warm controls are
80.55/67.42 s. Timing comparisons match these cache states. Closing repeats were
71.52 s at A0800 and 80.75 s at A0650, within 0.3% of the opening controls. These
are single-pass toggles, not statistical confidence intervals; tiny savings are
not a sound reason to remove a scene feature.

RGB MAE below is mean absolute difference across all native display-RGB8 pixels,
without alignment or exposure compensation, against the fresh local baseline.
Low whole-frame error can conceal the loss of a small feature such as rain.

| Feature (frame) | Seconds saved | RGB MAE /255 | Visible change and decision |
|---|---:|---:|---|
| Fog removed; explicit transparent volume boundaries (A0650) | +6.14 | 0.227 | Very small local haze/noise change; keep original fog for the full route. |
| Fog removed; explicit transparent volume boundaries (A0800) | +3.41 | 0.118 | Same decision; second viewpoint. |
| Diffuse bounces 4 to 2 (A0800) | +1.26 | 0.070 | No obvious composition change; tiny indirect-light difference; gain too small to adopt. |
| Glossy bounces 6 to 2 (A0800) | +1.32 | 0.047 | Negligible visible difference at this angle; retain full reflection paths. |
| Transmission bounces 8 to 2 (A0650) | -0.45 | 0.015 | Almost unchanged; the facade uses transparent/glossy shading, not just transmission. |
| Transmission bounces 8 to 2 (A0800) | +0.92 | 0.015 | Same decision; second viewpoint. |
| Transparent bounces 24 to 8 (A0800) | +0.95 | 0.015 | Almost unchanged at the tested interior; no useful gain. |
| Total bounces 10 to 6 (A0800) | +0.53 | 0.024 | Almost unchanged; no useful gain. |
| Volume bounces 0 to 1 (A0650) | -0.93 | 0.023 | Slight scattering/noise change; slower. Production already uses zero. |
| Light tree off (A0650) | +16.79 | 1.704 | Different reflected-light/noise pattern around glass; retain tree for quality. |
| Light tree off (A0800) | +14.73 | 1.386 | Same decision; second viewpoint. |
| Emission sampling off on 262 candidate materials (A0650) | +16.77 | 1.417 | Visible emitters remain; indirect/neon reflection noise changes. Not selected. |
| Emission sampling off on 262 candidate materials (A0800) | +9.85 | 1.151 | Same decision; second viewpoint. |
| 78 small bulb point lights hidden (A0650) | +3.23 | 0.068 | Little visible change at these angles; retain spill lights for other viewpoints. |
| 78 small bulb point lights hidden (A0800) | +5.37 | 0.052 | Same decision; second viewpoint. |
| Glass/transmission BSDFs made opaque (A0650) | +1.19 | 0.100 | Small water/glass-highlight change; does not remove the separate facade shader. |
| Reflective storefront mesh hidden (A0650) | +16.56 | 8.264 | Large loss of blue glass/reflections; reject. |
| All 5180 falling drops hidden (A0650) | +0.99 | 0.068 | Falling streaks removed; low whole-frame error hides the lost weather detail. Reject. |
| All 5180 falling drops hidden (A0800) | +2.53 | 0.021 | Same decision; second viewpoint. |
| Half the falling drops hidden (A0650) | +1.52 | 0.053 | Thinner falling rain; negligible speed gain. Reject. |
| Two splash/crown systems hidden (A0650) | +7.03 | 0.061 | Localized splash loss; keep the weather systems. |
| Shutter 1.25 to .5 frames (A0350) | +1.85 | 4.309 | Much shorter light/building/rain streaks; reject. |
| Motion blur off (A0350) | +7.16 | 6.436 | Dive becomes sharp and rain becomes points; reject. |
| Object motion_steps property 1 to 2 (A0350) | -2.64 | 0.070 | Very similar blur; slower. Original property is already at its minimum. |
| Maximum samples 128 to 64 (A0650) | +27.67 | 1.684 | Night look retained; more fine noise/denoising change than the selected threshold. |
| Maximum samples 128 to 64 (A0800) | +25.13 | 1.121 | Same decision; second viewpoint. |
| Adaptive threshold .02 to .04 (A0800) | +22.43 | 0.606 | Night palette, reflections and blur retained; slight fine-detail/noise change. Selected. |
| Minimum samples 32 to 16 (A0800) | +0.95 | 0.074 | Very small noise change; little time saved. |
| OptiX to OpenImageDenoise (A0800) | +0.43 | 0.659 | Different smoothing around glass and texture; no useful speedup. |
| Denoising off (A0800) | +1.66 | 3.771 | Clearly visible grain across carpet, signs and walls; reject. |
| Persistent Data off (A0650) | -2.05 | 0.012 | Look unchanged; second frame slower. Keep enabled. |
| Persistent Data off (A0800) | +0.68 | 0.011 | Same decision; second viewpoint. |
| Tile size 2048 to 512 (A0800) | -5.99 | 0.011 | Look unchanged; slower. Keep 2048. |

The first `fog_off` attempt disconnected Volume without explicitly clearing the
material's surface, causing an unintended surface effect. Those results are
excluded above and superseded by `fog_clear`, which installs a transparent
boundary. Old images/logs remain as rejected evidence. The source has two active
volume-material families; the final optimized setup retains both.

[Machine-readable profile results](fly/speed/profile-summary.json) and
[full timing table](fly/speed/profile-summary.md) retain exact seconds and paths.
No merged-light redesign or exhaustive six-views-by-every-setting matrix was run;
those would consume the time allowance without improving this conservative choice.

## Optimized Cycles setup

- Lobby A16-1100: adaptive threshold **.04**, maximum **128**, minimum **32**.
- Opening A1-15: original threshold **.02**. All auditorium B frames retain their
  original settings; only B525 was checked here.
- Original OptiX GPU and OptiX denoising; light tree and emitter sampling enabled;
  Persistent Data enabled; tile size 2048; Blackman-Harris 1.5 px.
- Original A bounces: total10 / diffuse4 / glossy6 / transmission8 / transparent24 /
  volume0. Original B paths also remain unchanged.
- Original materials, light powers, all 143 lobby lights, fog, 5180 falling drops,
  splashes, glare, exposure, cameras and v6 timing. **Shutter 1.25 frames (1/24 s at
  30 fps)** and original object motion steps. Native resolution stays 1920x1080.

The .04 diagnostic was only 2.70 s slower than the 64-sample cap at A0800, with
about half its RGB error (.606 versus 1.121 /255). Retaining the 128 ceiling lets
the difficult regions continue sampling. The final setup does not stack light,
weather, bounce or denoiser changes whose combined behavior was not validated.

The six final images were inspected alongside the reference. The optimized set
retains the night palette, neon, reflective glass, wet highlights, rain and dive
streaks. Its remaining differences are mainly fine stochastic/denoising detail.
Temporal stability over the full route remains untested.

Opening versus live `out10/full.png`: **1.866008/255**,
versus Brief 65's 1.866009/255; the same tolerance to four decimals. B525 versus
live draft 13: **0.538801/255**, versus .538765/255 in
Brief 65. The unchanged endpoints do not represent a promised speedup.

## Final six-frame timings and reference error

| Frame | Fresh Cycles baseline, s | Optimized Cycles, s (saving) | Optimized RGB MAE /255 | Eevee, s | Eevee RGB MAE /255 |
|---|---:|---:|---:|---:|---:|
| [A0001](fly/speed/compare_A0001.png) | 70.10 | 70.34 (-0.3%) | 0.1377 | 89.17 | 11.3800 |
| [A0350](fly/speed/compare_A0350.png) | 67.42 | 51.70 (23.3%) | 0.4238 | 109.50 | 9.8793 |
| [A0650](fly/speed/compare_A0650.png) | 80.55 | 58.37 (27.5%) | 0.7636 | 117.23 | 15.1839 |
| [A0800](fly/speed/compare_A0800.png) | 71.66 | 51.15 (28.6%) | 0.6327 | 95.69 | 14.7889 |
| [A0850](fly/speed/compare_A0850.png) | 88.32 | 59.60 (32.5%) | 0.5507 | 83.79 | 13.6970 |
| [B0525](fly/speed/compare_B0525.png) | 7.60 | 7.64 (-0.5%) | 0.0049 | 4.31 | 3.3415 |

Errors in this table use the cloud Cycles images. The panels also label their
actual historical 4090 render time and the fresh local baseline, so a cloud time
cannot be mistaken for a local speedup. Fresh unmodified local/cloud differences
were .106-.138/255 for A and .0049/255 for B, giving context for hardware noise.

## Eevee conversion and look

The final preset uses **32 render samples**, full-resolution screen tracing
(resolution scale 1, quality .5, thickness .15, roughness cutoff .5), all three
ray-trace denoising stages, Fast GI at quality .5 / 2 rays / 8 steps, and 64 volume
samples with an 8-pixel froxel tile. Volumetric shadows are disabled. The original
fog is present, but its illumination is not equivalent to Cycles.

Motion blur retains the **1.25-frame shutter**, with **2 accumulation steps**
normally and **8 steps during A192-462**, plus a 512-pixel post-blur limit and
5% overscan. The extra dive check improved the stepped neon streaks at A350:
109.50 s for eight steps versus 104.92 s for four. Blur remains strong but does
not match Cycles' continuous highlight/rain integration exactly. Falling drops
and splashes are retained; some fine streaks are substantially less visible.

Shadows use a **1536 MB pool**, 1 shadow ray and 6 shadow steps. All lights remain;
shadow casting alone is disabled on the 78 small marquee bulb point lights.
The first 512 MB trial exhausted the shadow buffer and was rejected. Increasing
the pool removed that error. A heavier 64-sample/four-step prototype still took
174.34 s at A1 and 232.94 s at A650, so it offered no useful speed advantage.
The final logs contain no shadow-buffer exhaustion.

Lobby diffuse probes are 10x8x4 and 12x6x4, with 256 bake samples, surfel density
10 and capture distance 8. Two sphere probes provide offscreen fallback. The
street plane sits at (4,-13,.08), scale (22,4,1), clip offset .005 and influence
.8; flat ground is excluded from its own planar capture. Raising/narrowing the
plane and fixing self-capture restored some wet highlights. The A bake took
137.17 s and was reused. The final auditorium has a 12x12x6 volume probe centered
at (8.75,-7.45,3.5), scale (9,7.75,3.75), plus a sphere probe. Its final bake took
1.94 s after caches were warm; the earlier auditorium bake took 5.72 s. This
coverage change slightly reduced B525 error from 3.431 to 3.342/255.

Visual review of all six panels:

- **A1/A350:** recognizable neon and night palette, but much weaker and less
  continuous wet reflections. Exterior faces lose indirect light and become
  nearly black. More distinct ghosting remains around fast-moving neon.
- **A650:** the entrance glazing is darker/bluer, with reduced warm reflection
  and a different fine-noise pattern. The street plane restores cyan highlights
  but does not reproduce the full wet surface response.
- **A800/A850:** upper walls and posters lose substantial illumination; counter
  glass, popcorn cases and contact shadows differ. Emissive tubes stay bright,
  while their surrounding light and reflected glow do not match.
- **B525:** the room remains recognizable and renders quickly, but upholstery,
  carpet, side-wall light falloff and occlusion are darker/different. It is not
  an exact live-still match.

The interior's apparent framing difference was checked: central camera matrices
are identical, and an edge-gradient scale sweep peaks at exactly 1.000 (correlation
.954 at A800). The difference is predominantly lighting/material response, not
a resized image. The A1, improved A350 and corrected B525 accepted trials were
copied into the final set byte for byte, with provenance in their JSON receipts;
their measured times were not charged twice to the render ledger. Older versions
remain in `eevee_previous/`.


The conversion retains native resolution, source AgX/exposure, production glare,
camera/phase driver, original fog materials and falling rain. It uses baked
diffuse probes with emission/indirect/world capture, sphere reflection fallbacks,
and a street plane probe. Screen ray tracing stays at full image resolution.
See `eevee/settings_A.json`, `settings_B.json` and `eevee-jobs.json` for exact
settings, probe positions, bake times and targeted shadow exceptions.

Blender documents that [plane probes require screen tracing and cannot capture
reflections or volumetrics](https://docs.blender.org/manual/en/latest/render/eevee/light_probes/plane.html).
Its [Eevee motion blur](https://docs.blender.org/manual/id/5.2/render/eevee/render_settings/motion_blur.html)
combines accumulation and post-processing; equal shutter duration does not make
it optically identical to Cycles. Probe bakes also do not reproduce continuously
changing indirect illumination from animated emitters. These are reasons to
judge the delivered images rather than assume engine parity.

Eevee here exports beauty only. It does not provide the production camera-Z
grayscale16 depth contract. Adopting it for the overlay pipeline would require a
separate depth solution, which was outside this study.

## Full-length estimates: 1625 frames at 1080p30

All estimates are render-only. Startup, encoding, validation, transfer and any
billing overhead are excluded. No cloud resource was started.

| Projection | Optimized Cycles | Eevee |
|---|---:|---:|
| Local 3050, sparse sample-rate model | 18.91 h | 30.90 h |
| 4090, requested NOTES-65 ratio 7.5605x | 2.50 h | 4.09 h |

That simple model is `1100 * mean(five A check times) + 525 * B525 time`, divided
by 3600, then by 7.5605 for the 4090 row. It is sparse: A1 overweights an unchanged
hold, while B525 underrepresents the moving auditorium. The original 4090 B525
took 2.44 s but the whole B average was 4.34 s. Do not treat the sample-only totals
as precise scheduling forecasts.

For Cycles, the more useful historical calibration applies the mean of the four
measured moving-A optimized/baseline fractions to actual cloud A frame times,
retains the first 15 A frames and leaves B unchanged. This gives
**3.95 h**, with a **3.75-4.17 h**
sensitivity range using the best/worst measured A fractions. The old cloud run
actually spent 4.5888 h on A and .6334 h on B. This range describes the sampled
fractions, not a guarantee for every viewpoint or a new 4090 measurement.

There is **no measured Eevee 3050-to-4090 ratio**. Applying the current Cycles
ratios instead of the old 7.5605x factor gives **6.50 h**
as another Eevee hardware-scaling scenario. Treat these scenarios as low-confidence
planning numbers: Eevee's probe, shadow, draw-call and blur costs need not scale
like Cycles. The measured local Eevee results are the stronger evidence here.
[Exact formulas and values](fly/speed/estimates.json).

## Endpoint crossfades and recommendation

If an Eevee version is used later, fade from the live lobby composite over
**A1-12 (12 frames, .4 s)**, entirely inside the existing A1-15 camera hold.
Fade into the live auditorium still over **B508-525 (18 frames, .6 s)**, entirely
inside B496-525. Use smoothstep alpha `3t*t - 2t*t*t`, aligned images and matched
display/color handling. Keep the v6 route, 1625-frame length and dark A/B handoff.
These fades hide endpoint discontinuities; they cannot restore missing reflections
or fix mid-flight shading. No fade or new clip was rendered in this study.

Recommend the adaptive-threshold Cycles preset. It delivers a measured saving
without changing the scene's defining features and preserves the live endpoints.
Eevee remains an alternate-look experiment; its losses and the local timing
tradeoff do not justify replacing this production path. Before a future full
animation, temporal noise and Eevee probe/blur behavior still require motion QA;
this brief explicitly authorized still tests only.

## Scope, reproducibility and preservation

Run the local wrapper from `roxy3d`; [README](fly/speed/README.md) lists the scripts.
`optimized-jobs.json` and `eevee-jobs.json` are the final six-view job definitions.
Use their Python drivers, not bare animation rendering of the saved blends:
the drivers apply the original camera/subframe/phase logic and endpoint policy.
Existing valid receipts are skipped. The cumulative render guard is intentionally
bounded for this study, not a full-production scheduler.

All writes are under `fly/speed/`, except this requested report. Cache/temp paths
were redirected there. **40,946 protected files** were rehashed
against the initial snapshot with no change or missing file, including production
inputs/results, live packs, source blends and pages. Input copies match their
production originals byte for byte. All final frame cameras, resolutions, shutter
values and PNG checksums passed [delivery verification](fly/speed/delivery-verification.json).
[Preservation result](fly/speed/preservation.json).

The ledger accounts for **95.3 minutes** of local render/bake
wall time, including rejected trials and conservative interrupted-run reserves;
this is not a claim of GPU-busy utilization. An unrelated Blender job overlapped
an early baseline, so that timing was discarded, our interrupted work was charged,
and clean baselines were rerun after it finished. No other process was terminated.
No independent agent report was used. Final timings have no detected concurrent
Blender job. The existing crown-topology motion-blur warnings are inherited from
Brief 65; falling-drop motion blur remains enabled. The unused HIP initialization
warning does not change the selected NVIDIA OptiX device.

No cloud, full animation, browser-page change, live-pack promotion, commit or push.
Skipped: exhaustive parameter grid, full-route temporal playback, moving-B quality
sampling, new 4090 measurements, custom merged-light redesign and Eevee depth.

STATUS: COMPLETE - local speed study, six comparison images and report delivered; stopped before any full render or production change.
