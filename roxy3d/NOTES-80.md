# Brief 80: styled street marquee draft

9 Nov 2026. One fixed-camera, **1280 x 720** draft for owner review:

![Styled marquee draft](qa10/draft25-marquee.png)

## Delivered files

- `qa10/draft25-marquee.png`: the single presentation image, with all marquee bulbs on, two lines of sample text, and one current-scene weather frame.
- `marquee/marquee_draft.blend`: a copy of the frozen production scene, with the new canopy in collection `MARQUEE`. The existing camera, architecture and production lighting are retained.
- `marquee/build_marquee_draft.py`, `marquee/make_text80.ps1`: model/material/light builder and separate 2D sample lettering. `marquee/runtime80/` contains local copies of the production helpers and read-only source inputs so their working paths stay inside the allowed directory.
- `marquee/face_quads80.json`: street and end panel corners, in world meters and the 1920 x 1080 logical stage. These are the **inset panel** corners, distinct from the approved outside box corners.
- `marquee/build80.json`, `marquee/render80.json`, `marquee/verification80.json`: dimensions, settings, timings, input preservation and saved-file checks. `marquee/render80_history.json` retains timing for the two intermediate lighting/material corrections.

## Layout and styling

The approved blockout B envelope is unchanged: **u 7.2..11.8, v 9.0..10.2**, width **4.6 m**, projection **1.2 m**, and fascia height **1.0 m**. The soffit is at **2.0548497 m**, exactly flush with the existing entrance header; the roof lip is at **3.0548497 m**. The entire new mesh envelope, including the bulbs and trim, fits those same bounds. No risers were reintroduced.

The housing has a plain inset roof, a shallow lip, dark plum painted metal, and thin dark-red bands above and below both letterboards. The street panel is **4.42 x 0.66 m** and the end panel is **1.02 x 0.66 m**, inset 55 mm from the envelope face. Fine cream retaining tracks give the panels the construction of a changeable-letter board. The soffit has three actual apertures with recessed diffusers and dark brass bezels.

All **60 bulbs** are on: **24 per row** across the street face and **six per row** along the end. Their globe material is copied from `D13 marquee bulb 00`, with its full-on strength restored. Their 50 mm diameter and 62.5 mm projection-axis dimension match the DINK DONK sign's bulbs. Each globe and its corresponding point light has a chase-group tag for the later animation.

The initial render exposed missing light-receiver membership: the new roof was nearly black. The final copy gives the canopy the existing entrance header's receiver memberships, plus the existing exterior/roof receiver memberships. A second material adjustment reduced the roof's broad glossy highlight so the paint stays dark. Existing lamp powers, positions and colors were not changed. The draft was replaced at the same filename; no alternate or comparison image is delivered.

Material values below are **scene-linear RGB**, not sRGB hex colors.

| Material or light | Values |
|---|---|
| Plum housing | Base `(0.028, 0.014, 0.035)`; roughness 0.34; metallic 0.38; coat 0.40 |
| Plain wet roof | Base `(0.022, 0.012, 0.028)`; roughness 0.42; metallic 0.02; coat 0.035; specular IOR level 0.10 |
| Dark-red trim | Base `(0.15, 0.013, 0.023)`; roughness 0.32; metallic 0.25; coat 0.35 |
| Cream opal panels | Base `(0.82, 0.70, 0.46)`; emission `(1, 0.82, 0.56)` at **0.95**; roughness 0.32; subsurface weight 0.08, scale 0.012 m |
| Retaining tracks | Base `(0.64, 0.52, 0.32)`; same warm emission color at 0.62 |
| Amber globes | Base/emission `(1, 0.50, 0.19)`; emission **2.2**; roughness 0.24; inherited coat 0.25 and coat roughness 0.035 |
| Bulb spill lights | **0.06 W each**, RGB `(1, 0.54, 0.23)`, radius 0.024 m |
| Soffit downlights | **3 x 12 W**, RGB `(1, 0.70, 0.40)`; 0.15 x 0.15 m area; spread 104 degrees |
| Recessed diffuser | Base/emission `(0.95, 0.68, 0.37)`; emission 1.4 |

The sample reads **NOW SHOWING · WHIPLASH / SCREEN 1 · DOORS OPEN**. It is rendered as a flat Bahnschrift letter mask, projected onto the street panel's stage quad with supersampled coverage, then composited onto the beauty. There are **no text objects or baked text textures in the marquee scene**. The end panel remains blank. This is a draft placeholder for the page's later text overlay; its letters do not cast shadows or appear in ray-traced reflections.

## Render and verification

Cycles **OptiX on the local RTX 3050 6 GB**, adaptive **256 max / 64 min samples**, threshold **0.01**, seed **1701**, OptiX denoising. AgX Medium High Contrast, exposure **+0.25**, and the frozen production HDR glare chain are retained. The requested still is rendered directly at 1280 x 720 with the established 1.5 px draft filter; no live-resolution asset is changed. Later layer production must use the native 3840 x 2160 grid and its 2.5 px filter.

The production helper restores the original foreground visibility and the phase-zero sign/weather state, so this is the complete scene rather than the saved source's background-pass configuration. Existing wet materials, ripple geometry and reflections remain. A separate phase-zero rain frame uses the **new canopy as a holdout**, then composites over the beauty and sample lettering. Temporary PNG buffers are removed after composition; the two internal EXR render buffers remain under `marquee/runtime80/work/buffers/` for reproducibility.

Final local render: **75.10 s beauty + 10.72 s weather = 85.82 s**. Preparation, rendering, glare, lettering and composition took **112.62 s** for the final run. Including the two intermediate corrections, all three runs used **270.69 s of render time** and **355.78 s of build/render/composite time**; these totals exclude authoring and inspection. No cloud GPU was used.

The final image was opened and inspected at its delivered size. Both letter lines are legible; the long face and end panel have even warm illumination; the round bulbs remain distinct; the roof reads as dark plum with a restrained highlight; and the sidewalk/threshold pool retains wet paving detail. No broad white area is visible in the marquee or its new light pool. The elevated fixed camera naturally hides the soffit fixtures themselves; their illumination is visible below the canopy. The saved-file verification passed after the last render.

Final PNG SHA-256: `595a80b8f403364be6de96778a526461228f6c20e8e463c68f4fc29489b2e575`.

Reopening the delivered blend checks the original camera matrix and orthographic scale, the actual mesh envelope against blockout B, inset-panel projection, sample settings, absence of marquee text geometry, and the final image dimensions. The source blend, approved blockout blend/script/geometry, live reference frame/manifest and L1 reference have matching before/after SHA-256 hashes.

Reproduce locally from `roxy3d/`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File marquee/make_text80.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File marquee/run_blender.ps1 -Script build_marquee_draft.py -Log draft80.log
powershell -NoProfile -ExecutionPolicy Bypass -File marquee/run_blender.ps1 -Script verify_draft80.py -Log verify80.log
```

## Later layer-render plan — not run under this brief

1. **Native alpha beauty:** keep the production camera and 3840 x 2160 pixel grid; render the marquee with the existing environment retained for lighting, reflections and occlusion. Hold out non-marquee camera surfaces, then crop without changing projection. Preserve straight-alpha output and derive the 1920 x 1080 version from linear 2 x 2 reduction.
2. **Receiver light contribution:** with identical geometry, seed, camera and receiver materials, capture the affected sidewalk/threshold/road with the new emitters on and off. Subtract in scene-linear HDR to isolate the marquee's illumination. Use a separate canopy-absent baseline to measure the new geometry's shadowing; retain negative receiver changes in a local alpha/shadow correction rather than silently clipping them out of an additive pass. Existing `out10/` files stay untouched. Match the page's display-space `plus-lighter` contract after the approved glare and display transform.
3. **Depth ownership:** capture the marquee's world-position AOV and antialiased coverage in the same native exposure. Convert world X/-Y to u/v, apply the lobby's existing depth convention, and cut disjoint depth slices from that coverage. Split the receiver correction by its own ground depth, not the canopy's depth. Check that slices rebuild their parent exactly and that walkers can pass beneath/behind the fascia correctly. The exported face quads locate the later DOM/canvas text.
4. **Chase:** retain steady panel and downlight contributions, and render four independently isolated bulb-group contributions. In scene-linear space, combine those bases with the existing gentle four-group waveform `0.35 + 0.65 * (0.5 + 0.5*cos(2*pi*(t/2 - group/4)))`, then apply glare and the display transform for each phase. This gives **48 phases at 24 fps**, repeated three times into the page's **144-frame / 6-second** master loop. Use the same master clock and phase offset as the existing sign; the draft itself has no chase. Verify the 47-to-0 and 143-to-0 joins before packaging. If isolated bases fail to reproduce coupled glare/receiver appearance, use direct local captures for those phases.

**Local RTX 3050 planning estimate:** **15–30 minutes** for a static alpha/light/shadow/depth set, or approximately **45–90 minutes total** including the four-group chase bases, phase composition, encoding and validation. Both output resolutions should come from the native 4K captures. These are estimates, not measured marquee production runs: Brief 56 recorded about **423 seconds per full 4K background capture**, while this brief measures only a 720p complete beauty plus weather. Cropped receiver passes can be cheaper; VRAM pressure, thermal state and a fallback to direct phase captures can increase the time substantially. No full-resolution layer pack, loop, cloud job or page integration was started.

Writes are confined to `marquee/`, `qa10/draft25-marquee.png` and this note. `PROGRESS.md` is unchanged because the brief's explicit write allowlist excludes it. No live page, `out10/`, `out10mist/`, `qa11/`, original blend, server, OBS collection or Git publication was changed.

STATUS: COMPLETE - ONE STYLED MARQUEE DRAFT, WORKING BLEND, SCRIPTS, FACE QUADS AND LAYER-RENDER PLAN DELIVERED; READY FOR OWNER REVIEW; STOP.
