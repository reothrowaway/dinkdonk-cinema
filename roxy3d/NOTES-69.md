# Brief 69: Godot lobby spike

7 Nov 2026. **The isolated spike is complete. Godot is useful for faster
iteration, but this conversion does not match the Cycles finish yet.**
The geometry, camera route, bus encounter, neon and basic night palette carry
over. Wet reflections, indirect lighting, transparency and fine weather detail
need a focused material/lighting pass before replacing any approved art.

## Deliverables

- [Live Cycles left / Godot right](godot-spike/compare_still.png), 3840x1136
  including labels; both images retain their native 1920x1080 pixels.
- [10-second fly-through MP4](godot-spike/flythrough_piece_1080p30.mp4),
  **1920x1080, 30 fps, 300 frames, H.264, silent**, 10,493,451 bytes.
- [Three matching moments](godot-spike/compare_frames.png), Cycles left /
  Godot right, native panels with labels.
- [Native Godot still](godot-spike/godot_still.png),
  [motion inspection sheet](godot-spike/motion_contact.png),
  [project and reproduction instructions](godot-spike/README.md).
- [Measured summary](godot-spike/summary.json),
  [full decode verification](godot-spike/verification.json),
  [artifact checksums](godot-spike/SHA256SUMS).

The film covers **v7 A300-A599**, including the dive, passing bus and street
glide toward the entrance. It stops before entering the lobby. A350 and A599
are compared with the nearest original production poses, A354 and A537;
A519 uses the exact v7 proof from Brief 68. The old production bus and weather
timing differ from v7. Labels and `comparison.json` make that distinction;
these are not same-numbered old/new frames or isolated renderer error tests.

## What was converted

`export_lobby.py` is the single reproducible export script. It opens
`fly/v7/production_A.blend` read-only, evaluates the geometry at A519, exports
ordinary glTF 2.0, and copies the corrected camera, bus and mapping JSON.
No source blend is saved. Export took **6.71 seconds** locally.

The export contains **7,000 evaluated geometry objects, 3,068,025 triangles,
990 mesh batches, 552 materials and 13 packed artwork textures**. The geometry
buffer is 294,530,400 bytes. Render-hidden/ray-only helpers and the old airborne
water systems are excluded; `export-report.json` lists exclusions. Text/curves
become evaluated meshes. Existing UVs and corner normals are retained. Bus and
wheel groups remain separately movable. Other geometry/animation is frozen at
the A519 snapshot, including legacy surface water geometry and neon states.

**No Cycles texture baking was done.** For a bounded spike, the script preserves
simple shader colors/metalness/roughness/emission and extracts existing packed
artwork byte for byte. Godot shaders approximate brickwork, asphalt and moving
ripple normals. That is much quicker than unwrapping/baking hundreds of
procedural materials, but loses the source's detailed wet-layer masks,
weathering, microstructure and some transparency behavior. It is a deliberate
conversion shortcut, not evidence that Godot cannot represent those details.

The project uses the installed **Godot 4.7.2, Vulkan Forward+, RTX 3050 6GB
Laptop GPU**. AgX with fixed exposure and contrast, glow, volumetric fog, SSAO,
SSIL, SSR and three static reflection probes are enabled. Source light positions
and colors are reused; area lights become spot approximations. Seven key lights
cast shadows; small local fills approximate missing emission/bounce lighting.
No baked GI is present. Godot's AgX contrast setting is not a verified match for
Blender's AgX Medium High Contrast look.

There are **13,200 persistent GPU rain particles** in three world-space fields
outside the dry cutaway lobby. Particle identities and trajectories are stable;
the analytic shader fades them out around top/bottom resets and starts fully
populated. Camera movement does not relocate an emitter. Roof collisions,
runoff, crowns and splash interaction have not been recreated. Still/contact
inspection and full-file decode do not establish perceptual absence of every
temporal artifact; native-player review remains open below.

## Camera and shutter

Blender Z-up becomes Godot Y-up with `[x,y,z] -> [x,z,-y]`. Camera basis columns
receive the same conversion. Perspective FOV comes from the source sensor
height/lens; orthographic width becomes vertical height at 16:9. Translation
and quaternion interpolation drive the subframes. All six isometric mapping
landmarks agree with the recorded Blender projection within **0.123 pixels**
([camera check](godot-spike/projection-check.json)). No route change was made.
Only the requested segment and fixed isometric view were exercised; the distant
opening projection switch and auditorium handoff were not ported/tested.

Movie Maker runs at **120 fixed fps**. After 64 initialization frames it records
1,201 unique subframes, A299.5-A599.5. Every 30 fps output combines five midpoint
samples at `[-0.5,-0.25,0,+0.25,+0.5]` source-frame offsets: a **1.25-frame /
1/24-second box shutter** with overlapping adjacent exposures. The engine wrote
one extra frame while quitting; integration excludes it. All 1,266 raw PNGs and
the 300 integrated PNGs remain in the project evidence folders.

The averaging is **inverse-sRGB -> linear-display RGB average -> sRGB**.
Movie Maker has already applied AgX, so this is not Cycles' pre-tonemap HDR
radiance integration. It avoids gamma-dark averaging, but five samples produce
visible discrete trails on fast neon edges. More subframes or a compositor
accumulating HDR before tonemapping would be needed for a closer final blur.
The chosen temporal averaging method follows the brief; it does not claim
continuous-shutter or Cycles-equivalent quality.

## Measured speed

All timings below are local; no cloud resource was used or inspected.

| Stage | Measured time |
|---|---:|
| glTF export, separate preparation | 6.71 s |
| Entire Godot capture process, loading/warmup/PNG writes included | **413.96 s / 6 min 54 s** |
| Requested piece after initialization, subframes and writes included | 385.67 s |
| Godot-reported GPU rendering across all 1,266 recorded frames | 46.28 s; **36.56 ms/subframe** |
| Godot-reported CPU rendering | 3.58 s; 2.83 ms/subframe |
| Godot-reported PNG encoding | **348.02 s**; 274.90 ms/subframe |
| Five-sample averaging and integrated PNG writes | **186.66 s / 3 min 7 s** |
| H.264 MP4 encode | 14.17 s |
| Capture + averaging + encode | **614.79 s / 10 min 15 s** |

GPU/CPU/PNG rows are engine diagnostics within capture, not extra stages to add
to the capture total. Startup, warmup and remaining overhead explain the rest.
The integrated output averages **2.05 wall seconds per delivered frame** across
those three stages. The piece's unique subframes average **0.321 seconds each**
including capture writes; this is very different from the GPU-only 36.56 ms.
Image serialization and postprocessing are the main bottlenecks in this pipeline.

For **1,504 frames / 50.133 seconds**, the same workload would require 6,017
unique shutter samples. Scaling measured work and adding initialization once
gives **32 min 40 s for capture**, **16 min 47 s for averaging/encoding**, or
**49 min 27 s total**. Use **45-60 minutes** as a planning range for this exact
PNG pipeline. It is an exterior-based estimate, not a measurement of the full
route or an imported auditorium. Scene conversion and future quality changes
are additional. GPU-only arithmetic is about 3.7 minutes, not a deliverable
render-time promise.

For comparison, the brief reports **5.5 hours on a cloud RTX 4090** for the old
film. NOTES-67 projected **2.7-3.2 render hours / 3-4 hours overall** for optimized
v7, with local native exterior checks around **34-38 s per Cycles frame**.
Those are earlier results/projections, not new benchmarks. The Godot estimate
is substantially faster even on the laptop, but the image quality, hardware
and pipeline differ; this is not an equal-quality speedup claim.

## Appearance assessment and next work

**Successful:** the recognizable layout, sign artwork, small props, neon
silhouettes, camera composition and bus passage survive. The same camera can
be changed and viewed without waiting for Cycles. Night, warm windows and
cyan/pink accents read clearly. Native 1080p resolution is retained throughout.

**Worse in this spike:** street reflections are weaker and less coherent;
roof/ground puddle boundaries show hard polygonal edges; glass has large bright
specular hotspots; light distribution is flatter, with less soft shadowing and
bounce; surfaces lack the source weathering and normal detail. Neon intensity
and color balance differ, and the fast dive exposes five-sample blur trails.
Rain is simpler and lacks surface interaction. Some source lamps and all other
unported animation remain at the static export state. The still's whole-image
mean RGB difference is **23.53/255**, descriptive only, not an acceptance score.

To get closer, prioritize baking the hero materials' base color, roughness and
normals, then a static indirect-lighting/lightmap pass with calibrated dynamic
neon and lamp spill. Rebuild glass and puddle coverage deliberately instead of
flattening their Cycles node mixes. Tune probe placement and SSR against the
street view. Then increase blur sampling or integrate HDR and replace the slow
PNG capture/averaging path. Those are identifiable next steps, not completed
work or promises about the remaining effort.

| Workstream from here | Suggested scope |
|---|---|
| Lobby | Material bake/UV policy, indirect lighting, glass, puddles/rain, one approved isometric comparison |
| Auditorium | Separate import of the existing approved geometry; lit/dim lighting, screen and door behavior; preserve final camera/seat mapping |
| Fly-through | Shared camera/bus conversion, complete A/B handoff and opening/end projection transitions, animation parity, HDR shutter/output pipeline, full temporal review |
| Possible live lobby | Native Godot capture proof, real DGG relay/walkers and control integration, GPU/OBS coexistence at unchanged resolution |

Keep one shared owner for coordinate conventions, tonemapping and import policy
so the scenes do not drift apart. These are proposed responsibilities; no other
agent, auditorium conversion or integration task was launched here.

Live operation is **not established**: 36.56 ms average GPU time is roughly
27 frames/s of rendering throughput for this moving workload before OBS, and
this was an offline fixed-step capture. The current scene needs optimization
and an actual coexistence test, not a 60 fps claim. Forward+ is also not a
drop-in browser source: Godot's documented web renderer is Compatibility, with
different capabilities. A native capture path is the sensible first live
experiment. [Official renderer comparison](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html).

**Recommendation:** continue Godot for interactive look development and a
focused visual-parity pass. Keep the approved Cycles assets live. Do not treat
this first conversion as ready to replace them, and do not promise a browser
or 60 fps live migration from this measurement.

## Verification and boundaries

The MP4 decoded through Blender's FFmpeg reader for **all 300 frames** at
1920x1080. No adjacent integrated frames are byte-identical; selected decoded
frames differ from their source PNGs by at most **1.614/255 mean RGB**. The
native still, all three comparison rows, representative motion-blurred frames
and the sequential contact sheet were opened and inspected. There is no claim
that an uninterrupted native-player viewing was completed.

Native-player review was attempted but not available: the browser access host
was unavailable, automatic approval review rejected binding the existing Chrome
History window because it could expose unrelated private browsing data, and
VLC access was not approved. No approval or privacy barrier was bypassed. The
safe fallback was full-file decode plus image inspection. `review.html` is
provided for an owner-run playback review.

The current offline Godot runs still log a Windows root-certificate-store
access error and a seven-texture RID cleanup warning at shutdown. Capture
completed successfully with the actual GPU; no network operation was needed.
Logs retain those warnings and the corrected initial script/import errors.
This is not described as a warning-free engine session.

SHA-256 checks confirm the five supplied primary inputs are unchanged: the
v7 A blend, camera path, bus path, mapping, and live `out10/full.png`. Writes
were confined to `godot-spike/` and this note. PROGRESS.md was not edited because
the brief's narrower write allowlist takes precedence; this note records the
changes and reasons. Existing/concurrent repository edits were left alone.
No source/live art pack, page, shared file, install, server, OBS collection,
cloud job, git commit or push was changed by this task. No add-on or asset was
downloaded. Live chat/page/OBS integration was outside this spike and untested.

STATUS: COMPLETE - ISOLATED GODOT PROJECT, REPRODUCIBLE GLTF EXPORT, NATIVE STILL,
TWO COMPARISON SHEETS, 10-SECOND MOTION-BLURRED MP4, TIMINGS AND FULL DECODE
DELIVERED; VISUAL PARITY AND NATIVE-PLAYER/OBS ACCEPTANCE NOT CLAIMED; NO CLOUD
OR LIVE-ASSET CHANGE; STOP.
