# Brief 70: Godot look pass

7 Nov 2026. **Completed in the isolated Godot project.** The reported frozen
streaks are removed, the lighting is warmer, glass hotspots are suppressed,
and the street has stronger reflections and animated ripple normals. The same
10-second A300-A599 segment is delivered with ten-sample HDR motion blur.
This is an improvement pass, not a claim of Cycles visual parity.

## Deliverables

- [10-second 1080p30 MP4](godot-spike/flythrough_piece_v2_1080p30.mp4):
  1920x1080, H.264, 300 frames, 30 fps, silent.
- [Live Cycles still | Godot v2](godot-spike/compare_still_v2.png).
- [Three Cycles | Godot v2 moments](godot-spike/compare_frames_v2.png).
- [Bus-stop before/after crop](godot-spike/bus_stop_before_after_v2.png),
  A494 / output frame 195 / 6.47 seconds; identical crop at 2x enlargement.
- [Native still](godot-spike/godot_still_v2.png),
  [reproduction instructions](godot-spike/README.md),
  [timing summary](godot-spike/summary-v2.json),
  [checksums](godot-spike/SHA256SUMS-v2).

The three comparison moments remain A350, A519 and A599. A519 has the exact
v7 Cycles reference; the others use the same nearest original-production poses
as Brief 69 (A354 and A537). Old production bus/weather timing differs.
Labels preserve that distinction. Still panels retain their native pixels.

## What the stationary streaks were

The v1 export merged **`D5 metal and cap splash crowns`** and
**`D5 physical surface beads`** into glTF mesh **`Static_(0, 0)_0`**, material
0, **`D5 dielectric water beads`**. The bright cluster was surface-water
geometry, not the moving particle rain or a light object.

The read-only production-blend audit evaluated both meshes at A479, A494,
A509 and A519. Each object's world-position hash is identical at all four
times: 35,256 evaluated crown vertices and 66,740 bead vertices. At A494,
1,006 crown vertices and 1,298 bead vertices project into the reported crop.
Projection counts alone do not establish visibility, but the before/after
image confirms that removing this geometry clears the reported cluster.
See [source/export provenance](godot-spike/static-water-provenance-v2.json)
and [evaluated source evidence](godot-spike/water-source-audit-v2.json).

**Yes, the same static objects exist in `fly/v7/production_A.blend`.** They
could contribute to the earlier Cycles rain complaint; this does not prove
that they explain every artifact in the earlier film. No source blend was
changed or saved.

The v2 exporter removes 120 objects globally: these two scene-wide objects,
16 `Glass rain residue` objects, 70 `D6 shelter roof water bead` objects,
24 `D6 side glass bead` objects and eight `D6 shelter side runnel` objects.
The already-excluded airborne rain, micro-impact and stateless-drip systems
remain excluded. Falling rain stays as the existing 13,200 persistent GPU
particles, now updated at every subframe. Ground ripple normals animate from
the exact source timeline; roof/gutter runoff and glass-droplet simulation
have not been recreated. Static cubemaps exclude rain, the moving bus and
water surfaces, preventing frozen weather/vehicle reflections.

## Look and capture changes

- **Lighting/GI:** SDFGI with four cascades, 0.18-unit minimum cells,
  occlusion, 0.75 energy and restrained feedback; warmer ambient/key/bounce,
  reduced blue sky/corridor fills, fixed exposure and AgX. Emissive bulb
  geometry no longer blocks its own point lights. This restored the warm
  opposite-sidewalk pools. Higher-quality shadow filtering and less glossy
  paving reduce noisy tiny highlights. This is not a baked Cycles lightmap.
- **Wet street:** a 2048x512 world-space mask rasterizes the actual source
  depth/footprints of 52 road-water objects. Those duplicate water sheets are
  removed from the export and the mask controls the underlying ground's
  roughness/reflection response. Other pools retain `water_depth` in vertex
  colors. Ground normals are oriented upward, and deterministic expanding
  ripple normals disturb the reflections. SSR, four static probes and a
  **1920x1080 planar reflection** supply street reflections. The planar view
  updates with the camera/bus/rain and uses linear HDR output. No canvas or
  render resolution was reduced.
- **Glass:** a dark, low-opacity Fresnel material replaces non-emissive
  storefront/shelter glass. Lower specular response removes the large bright
  circular hotspots while retaining visibility through the panes. Glowing
  glass and sign components keep their emission.
- **Motion blur/output:** ten midpoint samples cover the same **1.25-frame
  shutter (1/24 second)**, offsets -0.5625 through +0.5625 in 0.125-frame steps.
  A GPU compositor sums scene-linear color into RGBA32F after transparency,
  before AgX/glow. Only the 300 completed images are read back and written.
  There is no subframe PNG sequence or Python averaging stage. Rain follows
  each analytic sample; temporal fog reprojection remains disabled.

The compositor stage follows the installed engine's API and
[Godot's documented post-transparent callback](https://docs.godotengine.org/en/stable/classes/class_compositoreffect.html).
Ten samples improve bright-edge integration and trail continuity; the shutter
duration is unchanged. It is still discrete sampling, not continuous blur.

The authoritative final scene is `main_v2.tscn` / `main_v2.gd`. The original
scene, shaders, assets and v1 deliverables remain; pre-change scripts are in
`backup-69/`. The v1 render wrapper now explicitly selects `main.tscn`.
Intermediate trials are retained separately. The final movie uses only
`captures_v2/fly70deliver/`.

## Measured time

Installed Godot 4.7.2 Forward+, Vulkan, RTX 3050 6GB Laptop GPU; local runs.

| Stage | Time |
|---|---:|
| glTF export, one-time preparation | 9.68 s |
| Source puddle-mask bake, one-time preparation | 3.95 s |
| Entire final capture, load/warmup/shutdown included | **232.91 s / 3 min 53 s** |
| Measured piece, 3,000 subframes and final PNG writes | 222.65 s |
| GPU readback within capture | 13.61 s |
| PNG serialization within capture | 100.27 s |
| Main + planar viewport GPU diagnostic average | 39.54 ms/subframe |
| H.264 encode | 12.88 s |
| Capture + encode | **4 min 06 s** |
| Per delivered frame, capture + encode | **0.819 s** |

Readback, PNG and GPU diagnostics are parts of capture, not extra wall-time
stages to add. GPU work can overlap CPU work; viewport timing queries are
diagnostics, not independent total-throughput promises. Final capture includes
96 warmup frames. Artifacts record all 3,000 sampled source poses.

Linear scaling to **1,504 frames / 50.13 seconds**, with initialization once,
projects **19 min 51 s** for capture plus encoding.
Plan on roughly **18-25 minutes** for this exterior workload on this laptop.
The full route and auditorium were not rendered; scene complexity, temperature
and other GPU use can change that estimate. Export, look development, comparison
assembly and decode QA are separate. Brief 69's capture/averaging/encode was
10 min 15 s; this final pipeline is about
2.50x faster despite denser blur sampling and the added reflection view.

## What remains worse than Cycles

The street is more readable and reflective, but the planar reflection assumes
one road height. It does not reproduce full water depth, refraction, multiple
reflection bounces or every roof puddle. SSR/probe transitions and thin
specular edges remain raster-rendering limits; some paving/metal highlights
can still alias. The glass is an alpha approximation, not physical transmission.

Lighting is warmer and more localized, but the Cycles still has more natural
softness, weathering, material variation and neon balance. Regular procedural
brickwork and simplified roughness remain visible. Some roof-water boundaries
and fine prop details are still less convincing. Strong fast-motion neon can
retain discrete ten-sample edges. Surface splash geometry and runoff are absent;
animated ground ripple normals provide the surface interaction in this pass.

## Verification and boundaries

The delivered MP4 was decoded through Blender's FFmpeg reader for **all 300
frames**. All source frame hashes are unique; every decoded frame is native
1920x1080. Selected decoded/source comparisons have maximum mean RGB error
**1.407/255**. The ten-sample schedule was checked for every output frame.
The native still, three matched comparisons, whole-piece contact images and
6-7-second bus-stop sequence were inspected. This is decoded-frame inspection;
no browser or media-player playback was performed, and absolute perceptual
absence of every temporal artifact is not claimed.

All six camera landmarks retain the Brief 69 agreement, maximum **0.123 px**.
Hashes confirm the production blend, camera path, bus path, mapping and live
`out10/full.png` are unchanged. The four primary v1 deliverables also match
their original checksum manifest. Exported sign textures and camera/bus data
are retained byte for byte. No camera route, bus route or non-water geometry
was redesigned.

The engine still reports its pre-existing root-certificate-store error and
seven texture-RID cleanup warnings. Rendering completed with exit code 0;
no script/shader/capture error is hidden or claimed away. These offline runs
made no network requests. Logs and intermediate trials remain available.

Writes were confined to `godot-spike/` and this note. The narrower brief
allowlist takes precedence over the general PROGRESS.md instruction, so this
note records the work. No live pack/page, source blend, server, OBS collection,
install, cloud job, git commit or push was changed. No asset/tool download,
computer use, browser, media player or other agent was used.

STATUS: COMPLETE - V2 10-SECOND 1080P30 FILM, TWO COMPARISON SHEETS, BUS-STOP
BEFORE/AFTER, STATIC-WATER SOURCE IDENTIFICATION, GPU HDR SHUTTER CAPTURE,
TIMINGS AND FULL DECODE DELIVERED; CYCLES PARITY NOT CLAIMED; STOP.
