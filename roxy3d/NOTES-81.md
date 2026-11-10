# Brief 81: street marquee, draft 26

9 Nov 2026. One final-quality **1280 x 720** still from the fixed production camera, with the same 2D sample lettering and one phase-zero weather frame as draft 25.

![Marquee draft 26](qa10/draft26-marquee.png)

## Delivered

- `qa10/draft26-marquee.png`: the single presentation still.
- `marquee/marquee_draft26.blend`: saved working scene, based on `marquee/marquee_draft.blend`. The draft 25 blend remains byte-identical.
- `marquee/build_marquee_draft26.py`: reproducible builder, render and composition script.
- `marquee/verify_draft81.py`: saved-file verification without another render.
- `marquee/build81.json`, `render81.json`, `verification81.json`: source hashes, unchanged-scene checks, settings, timings and final hashes. `render81_history.json` records the earlier completed render before the final light/roof adjustment.
- `marquee/runtime81/`: local copies of the same production helpers and source inputs, plus the two internal EXR buffers. Temporary PNG composition buffers are removed. No alternate image, close-up, clip or comparison is delivered.

## Four requested changes

Material colors below are scene-linear RGB. The existing canopy paint colors, all mesh geometry, the approved envelope, the 60 bulb positions and their chase-group tags are unchanged.

| Area | Final values and change from draft 25 |
|---|---|
| Warm pool | The three existing 150 x 150 mm soffit area lights increase from **12 W to 45 W each**. RGB stays `(1, 0.70, 0.40)`. Spread narrows from **104 to 86 degrees**, keeping the stronger contribution beneath the canopy. Light positions and recessed fixtures are unchanged. |
| Bulb cores | The existing warm globe color `(1, 0.50, 0.19)` is retained. Emission changes from uniform **2.2** to **2.8 at the silhouette / 7.0 at the facing core**, using `2.8 + 4.2 * abs(dot(true_normal, incoming))^3`. The original production glare chain supplies the small halos; its settings are unchanged. |
| Socket and trim spill | Each existing bulb point light increases from **0.06 W to 0.22 W**, keeping RGB `(1, 0.54, 0.23)` and 24 mm radius. Its center moves from 1 mm to **40 mm outward from the globe center**, just beyond the globe's 31.25 mm forward radius, so the opaque globe no longer encloses the light center. No globe or socket moves. |
| Both letterboards | Base color stays `(0.82, 0.70, 0.46)` and emission color stays `(1, 0.82, 0.56)`. Emission is **0.99**, multiplied by clean backlight variation **0.92..1.04**, an edge gain **0.80..1.00** over the inner 65 mm, and subtle seam gain **0.89..1.00**. The street face has three insert sections; the end has two. Their narrow joints taper across 10 mm. Existing 6 mm horizontal retaining tracks stay in place; their emission drops from **0.62 to 0.38** to make the construction faintly visible. No grime is added. |
| Wet roof | Base `(0.022, 0.012, 0.028)` and metallic **0.02** remain. Roughness varies **0.26..0.44**, coat weight **0.045..0.14**, specular IOR level **0.14**, coat roughness **0.075**, water-coat IOR **1.333**. World-position noise scale **2.1**, detail **2**, makes uneven wet patches. Fine noise scale **32**, detail **2**, drives a **0.00035 m** bump at strength **0.15**. All reflections come from the existing scene lights and surfaces; no painted reflection or new roof light is used. |

The first completed render used 65 W downlights and a wider wetness range. Inspection showed a stronger pool and more mottled roof than intended. The final render reduces the lights to 45 W and softens the roof variation, replacing the same requested draft filename.

The final still was opened at its delivered size. The warm pool retains wet paving joints and broken highlights, with a modest response in the entrance glazing. Bulbs stay separate dots. Both boards remain bright cream, with restrained tracks, seams and edge shading. The roof stays dark with a gentle uneven sheen.

## Text and scene preservation

The sample remains **NOW SHOWING · WHIPLASH / SCREEN 1 · DOORS OPEN**. The builder reads the original `text80.bgra` mask and `face_quads80.json`, and executes draft 25's `text_overlay` function verbatim. Font appearance, spacing, transform, supersampling, opacity and ink color are unchanged. The end face remains blank. Text is a 2D page-style overlay, with no text geometry, scene texture, ray-traced shadow or reflection.

Reopening both saved blends verified the non-marquee objects, their geometry/materials, existing lights, world, compositor, exposure, camera and orthographic scale. The deterministic weather curves have the same phase-zero geometry and materials; Blender may assign different numeric suffixes to their rebuilt object names. All marquee meshes retain the approved bounds: **u 7.2..11.8, v 9.0..10.2, z 2.0548497..3.0548497 m**. Both saved face projections match the original text quads.

The original draft 25 image, blend, builder, text mask, face quads, blockout geometry, NOTES-80, production source blend and checked live-pack reference files all retain their input SHA-256 hashes.

## Render and verification

Same pipeline as draft 25: complete beauty, approved HDR glare/display transform, exact 2D text, then one phase-zero rain frame with the canopy as a camera holdout. Cycles **OptiX on the local RTX 3050 6 GB**, adaptive **256 max / 64 min samples**, threshold **0.01**, seed **1701**, OptiX denoising, 1.5 px draft filter. AgX Medium High Contrast and exposure **+0.25** are retained.

- Final render: **79.84 s beauty + 11.45 s weather = 91.29 s**.
- Final preparation, rendering and composition: **136.38 s**.
- Across both completed runs: **180.39 s rendering**, **269.84 s build/render/composition**; authoring and inspection are excluded.
- Saved-file verification: **passed**. Final image is 1280 x 720. The projected local sidewalk-pool region has **zero all-channel white-clipped pixels**; its per-channel 99th percentile is **202 / 186 / 174** in the delivered 8-bit image.

Final PNG SHA-256: `53d822a2a851adf0e9cc76c682a1627cd45d8e041d488945dfbad77b13b1a0d9`.

Saved blend SHA-256: `ac01210a802920e41c6379fe99c9f7df3e8cd61a7756d52f316c5e6c6d16a9d6`.

Reproduce locally from `roxy3d/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File marquee/run_blender.ps1 -Script build_marquee_draft26.py -Log draft81.log
powershell -NoProfile -ExecutionPolicy Bypass -File marquee/run_blender.ps1 -Script verify_draft81.py -Log verify81.log
```

## Later layer-render plan

The pass structure in NOTES-80 remains appropriate. **The on/off receiver passes are required** for this brighter pool: an alpha canopy image alone cannot reproduce the new light on the wet sidewalk, threshold and entrance glass. Include those receivers and the nearby wet reflections; separate steady downlight/panel contribution from the four bulb chase groups. Retain the canopy-absent shadow baseline and preserve negative receiver changes in the local shadow/alpha correction. Receiver slices must use their own surface depth.

For chase, multiply the **output of the new bulb core shader** by the group waveform, and scale the corresponding 0.22 W spill lights by the same factor. Changing the Principled emission socket's default value will not animate it now that the socket is linked. The waveform, 48 phases at 24 fps, and repetition into the 144-frame / 6-second master loop remain as described in NOTES-80. Keep the new roof's reflected bulb contributions in the appropriate captures. Check the composed result after the unchanged glare transform; fall back to direct phase captures if isolated bases do not reproduce the coupled reflections/glare.

Production still requires the native **3840 x 2160** grid, existing depth contract and linear reduction for the smaller assets. NOTES-80's **15–30 minute static / 45–90 minute total-with-chase** local estimates remain unmeasured planning estimates; this brief only measures the single 720p still. No layer pack, chase loop or page integration was run.

Writes stayed inside `marquee/`, `qa10/draft26-marquee.png` and this note. `PROGRESS.md` was not edited because Brief 81's explicit write allowlist excludes it. No cloud job, source-pack modification, live-page change, server change, OBS edit, commit or push was made.

STATUS: COMPLETE - ONE DRAFT 26 STILL, SEPARATE WORKING BLEND, SCRIPT AND VERIFIED NOTES DELIVERED; READY FOR OWNER REVIEW; STOP.
