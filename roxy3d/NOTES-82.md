# Brief 82: street marquee, draft 27

9 Nov 2026. One **1280 x 720** still from the fixed production camera, starting from the saved draft 26.

![Marquee draft 27](qa10/draft27-marquee.png)

## Delivered

- `qa10/draft27-marquee.png`: the single presentation still.
- `marquee/marquee_draft27.blend`: separate working scene, with the small bulb optical buffer packed inside it.
- `marquee/build_marquee_draft27.py`: reproducible builder, renderer and composition script.
- `marquee/verify_draft82.py`: saved-file and source-preservation verification, without another image export.
- `marquee/build82.json`, `render82.json`, `verification82.json`: settings, input hashes, timings and verification results. `render82_history.json` retains the earlier completed render's timing.

The older blends and draft images remain unchanged. Internal helpers and the beauty/weather EXR buffers are under `marquee/runtime82/`. Temporary PNG composition buffers are removed. No additional presentation image, close-up, comparison or clip is delivered.

## Changes and values

Colors below are scene-linear RGB.

| Detail | Final treatment |
|---|---|
| Bulb cores | Camera-visible emission is **8 at the edge to 26 at the facing core**, using `8 + 18 * abs(dot(true_normal, incoming))^3`. The original amber color `(1, 0.50, 0.19)` and globe geometry are retained. |
| Tight amber halos | A compact optical kernel is centered on each of the **60 actual projected globe centers**, added in linear HDR before the unchanged production glare/display chain. At 1280 x 720: Gaussian sigma **1.10 px**, support radius **3.10 px**, peak **0.85**, RGB **(1, 0.32, 0.055)**. The final 0.5 px of support fades smoothly to zero. Bulb spacing is at least approximately 7.5 px, leaving gaps between these kernels. This is a local optical effect, not additional scene illumination. |
| Both letterboards | Three horizontal retaining-lip bands follow world Z at **soffit height + 0.193, 0.483 and 0.803 m**, so they follow each board's perspective. Each has a **12 mm full-strength center**, easing back to the original board over **4 mm on each side**. Within the center, camera-visible base color and panel emission are multiplied by **0.29**. The rest of the original cream panel, seams and backlight variation remain. Existing physical 6 mm tracks retain their geometry; their visible base is **(0.23, 0.18, 0.11)** and emission is **0.18** in the original cream emission color. |
| Wet roof | The plum base **(0.022, 0.012, 0.028)** and metallic **0.02** remain. Two elongated water-film regions have world XY centers **(8.25, -9.53)** and **(10.12, -9.67)**, with elliptical radii **(0.82, 0.085)** and **(0.70, 0.065) m**. Their edges taper and have restrained noise breakup: scale **21**, detail **2**, gain **0.66..1.0**. Roughness ranges from **0.53 outside to 0.09 in the wet centers**; coat weight from **0.015 to 0.80**. Specular IOR level **0.10**, coat roughness **0.08**, water IOR **1.333**, anisotropy **0.62**, tangent along world X. The existing fine water-film normal is retained. The highlights are ray-traced reflections of the existing scene lights, with no new roof light or painted/emissive reflection. |

The initial completed render established the roof and tracks but still had weak halos at stream size. The final render adds the compact per-bulb optical term and replaces the same draft filename. The finished still was inspected at its delivered size: the bulbs remain separate bright dots with tight amber surrounds; the street and end tracks show through the cream board; two narrow reflections break up the dark roof.

## Approved appearance preserved

All marquee geometry, the envelope, paint colors, bulb positions/count/spacing and chase tags remain unchanged. All existing lights are unchanged, including the **three 45 W soffit lights at 86 degrees** and the **0.22 W bulb spill lights**.

The five changed materials use a camera-surface branch while keeping their exact draft-26 surfaces for secondary rays. This preserves the approved indirect illumination and warm pool while allowing stronger visible details. The camera roof branch still traces the existing lights and surroundings. Saved-file verification confirms the original secondary-ray shader graphs and unchanged housing/soffit materials.

The sample remains **NOW SHOWING · WHIPLASH / SCREEN 1 · DOORS OPEN**. The original `text80.bgra`, `face_quads80.json` and verbatim draft-25 text-overlay function are reused. No text geometry or scene text texture is added; the end face stays blank.

Reopening both saved blends verifies the non-marquee scene, camera, world, exposure and phase-zero weather. The original production compositor is identical after removing the two explicitly added optical nodes. Input SHA-256 checks passed for the older drafts, builders, text inputs, production source blend and checked live-pack references.

The pool retains **zero all-channel white-clipped pixels** and the same per-channel 99th-percentile levels as draft 26: **202 / 186 / 174**. The newly rendered pool is not byte-identical: its mean absolute channel difference is **1.08 / 255**, with a 99th-percentile absolute difference of **8 / 255**. Lighting settings and secondary-ray surfaces are exact; small sampling/denoising differences remain in the rerender.

## Render and reproduction

Same full-beauty, HDR glare/display, exact 2D sample text, then phase-zero camera-holdout weather sequence as draft 26. The only composition addition is the compact bulb optical term before the existing glare. Local **RTX 3050 6 GB**, Cycles OptiX, adaptive **256 max / 64 min samples**, threshold **0.01**, seed **1701**, OptiX denoising, 1.5 px draft filter, AgX Medium High Contrast, exposure **+0.25**.

- Final rendering: **85.45 s beauty + 10.88 s weather = 96.33 s**.
- Final preparation, rendering and composition: **169.28 s**.
- Across the two completed renders: **205.04 s rendering**, **341.43 s preparation/rendering/composition**. Authoring, inspection and an aborted compositor-node setup attempt are excluded.
- Final saved-file verification: **passed**.

Final PNG SHA-256: `169f5a748870a1ef86da7fc0ccdc8c26751e2861027a7f79c8b9c21f00667444`.

Saved blend SHA-256: `d1ab12f036bea56fdb51360c6a42d10915fedbd1ebb9f6473901ef4b50126d64`.

From `roxy3d/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File marquee/run_blender.ps1 -Script build_marquee_draft27.py -Log draft82.log
powershell -NoProfile -ExecutionPolicy Bypass -File marquee/run_blender.ps1 -Script verify_draft82.py -Log verify82.log
```

## Later layer-render plan

NOTES-80/81's geometry, depth slices, steady receiver on/off passes, canopy-absent shadow baseline and four chase groups remain required. The approved warm pool still belongs in receiver passes at each receiver's own depth. Keep the new roof's actual reflections in the marquee beauty captures.

**New optical requirement:** regenerate the per-bulb kernel on the native **3840 x 2160** grid, scaling sigma to **3.30 px** and support radius to **9.30 px**. The packed buffer in this draft blend is specifically 1280 x 720; do not reuse it unscaled for production. Separate kernels by the existing four chase tags and multiply each by the same group waveform as its globe and spill light. Apply them in HDR before the retained glare/display transform, with enough crop padding for both the local kernel and the original glare. Preserve each bulb's visibility/occlusion when building isolated passes.

Animate both the new camera-core branch and the retained secondary-ray bulb emission branch, together with the spill lights; changing an unlinked default socket will not drive these linked shaders. Keep the existing 48-phase/24-fps chase and 144-frame/6-second master-loop contract, and compare reconstructed phases against direct captures before packaging. The earlier production time estimates remain unmeasured; no layer pack or chase loop was rendered here.

Writes stayed inside `marquee/`, `qa10/draft27-marquee.png` and this note. The explicit brief allowlist excludes `PROGRESS.md`, so this note records the work instead. No cloud job, source-pack edit, page/server/OBS change, commit or push was made.

STATUS: COMPLETE - ONE DRAFT 27 STILL, SEPARATE WORKING BLEND, SCRIPT AND VERIFIED NOTES DELIVERED; READY FOR OWNER REVIEW; STOP.
