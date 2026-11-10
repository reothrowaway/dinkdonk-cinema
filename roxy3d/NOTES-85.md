# Brief 85: Our Dear Leader poster, styled draft 28

10 Nov 2026. Delivered one **1280 x 720** final-quality still from the unchanged production camera, with one **natively rendered 4x inset** and a thin connector. No labels.

![Leader poster draft 28](qa10/draft28-leader.png)

The approved artwork is a matte printed sheet in a thin black-brown frame, with a small brass picture light. Its red, gold and cream remain readable against the purple partition. The finished still was opened and visually inspected, including the inset, frame edges and light wash. No glass was added.

## Files and preservation

- `qa10/draft28-leader.png`: the only presentation image.
- `leader/leader_draft.blend`: the separate working scene. All seven approved meshes and the new area lamp are in **LEADER**. The poster texture is packed inside the blend, byte-identical to `leader/poster.png`.
- `leader/build_draft85.py`: reproducible scene builder, final-quality renderer and single-image compositor.
- `leader/verify_draft85.py`: reopens the saved blend and checks the geometry, scene, artwork bytes, native inset and original input hashes without rendering another image.
- `leader/build85.json`, `leader/render85.json`, `leader/verification85.json`: settings, timings and verification results. Original input hashes and the frozen source-scene snapshot are in `leader/input_hashes85.json` and `leader/baseline85.json`.
- Internal runtime copies, raw EXR buffers, receipts, logs and caches remain under `leader/`. All four temporary PNG composition buffers were deleted.

The base is **`marquee/marquee_draft27.blend`**; the fallback scene was not used. Saved-file verification confirms that every existing scene object's mesh/curve geometry, transforms, material assignments and recorded visibility, all existing material node inputs/links, existing lamp values, the camera, world, view transform and compositor match the frozen source. The older runtime's constructor would reset retired D13 marquee bulbs, so the new wrapper initializes pass bookkeeping directly and preserves the saved phase-zero scene instead. Two initial preservation checks stopped before any render; the accepted run passes the exact-scene check.

The approved Brief 84 meshes and transforms are exact, including the **0.66 x 0.99 m** poster face, **0.72 x 1.05 m** frame envelope, **X = 3.146** face plane and **0.085 m** face-bottom clearance. The four rails retain their 3 cm border and depth. Small bevel modifiers finish their edges inside that envelope; the source vertices are unchanged. The brass bar and bracket retain their approved size and location. The face retains its old blockout object name for geometry matching, but now has the finished paper material and full artwork UVs.

All **33,718** inventoried read-only inputs retain their SHA-256 hashes, including the approved blockout, artwork PNG/HTML, marquee source scene and the contents of `out10/`, `out10m/`, `out10mist/` and `qa11/`. Writes are confined to `leader/`, the requested draft PNG and this note. This note is the change log because the brief's explicit write allowlist excludes `PROGRESS.md`. No page, live pack, server, OBS setting, source blend, cloud resource or Git history was changed.

## Materials and light

Colors below are scene-linear RGB unless specified otherwise.

| Part | Values |
|---|---|
| Printed paper | Direct **sRGB** `poster.png` texture into Principled Base Color; full UV extent 0..1, no crop, color adjustment or extra artwork. Roughness **0.73**, Specular IOR Level **0.22**, Sheen Weight **0.045**, Sheen Roughness **0.80**. Emission **0**. Linear texture interpolation. |
| Thin dark frame | Base **(0.012, 0.008, 0.006)**, metallic **0**, roughness **0.31**, coat weight **0.18**, coat roughness **0.25**. Edge bevel **1.5 mm**, 3 segments. |
| Brass bar and bracket | Base **(0.32, 0.205, 0.080)**, metallic **0.78**, roughness **0.33**, emission **0**. Edge bevel **1 mm**, 3 segments. |
| Picture-light lamp | One rectangular area lamp, **2 W**, color **(1.0, 0.775, 0.525)**, aperture **0.42 x 0.038 m**, spread **100 degrees**. World position **(3.278, -3.66, 1.142)**, aimed at **(3.146, -3.66, 0.38)**. A warm downward wash with restrained wall/floor spill. Existing recorded sconce lamps are **9 or 15 W** and remain unchanged. |

The new meshes receive the existing linked lights through the supporting wall's receiver collections. The new lamp adds its own illumination normally. There is no emissive paper, painted illumination or opaque glass reflection over the picture.

The inset's face covers **19,176** interior test pixels. It has **zero all-channel white-clipped pixels** at the >=250/255 threshold; its RGB 99th percentiles are **244 / 212 / 199**, and channel maxima are **252 / 226 / 213**. These measurements supplement the visual inspection; they are not an on-stream acceptance test.

## Render and composition

Local **NVIDIA GeForce RTX 3050 6 GB Laptop GPU**, Blender **5.2.3 LTS**, Cycles **OptiX**, adaptive **256 max / 64 min samples**, threshold **0.01**, seed **1701**, OptiX denoising, Blackman-Harris **1.5 px**, no motion blur. Inherited **AgX Medium High Contrast**, exposure **+0.25**, wet materials, reflections and production glare are retained.

The full still uses the same sequence as draft 27: beauty through the source glare/display graph, the verbatim approved street-letterboard text overlay, then one matching phase-zero weather frame composited source-over with camera holdouts. Nothing is animated or flooded with synthetic chat.

For the one inset, the camera and its orthographic scale never move. The render grid is **5120 x 2880**, exactly 4x the draft grid. A padded camera border corresponding to draft coordinates **[515, 252, 134, 166]** produces a native **536 x 664** buffer with the same samples, denoiser, materials and phase-zero weather. After glare and weather composition, **[555, 292, 54, 86]** is extracted at that density and inserted **without any resampling** as **216 x 344 px** at **[16, 12]** in the dark upper-left corner, outside the cinema interior. The padding preserves nearby glare context. The draft-sized marquee bulb-kernel addition is bypassed only for this padded wall crop, which contains no marquee bulbs; the original production glare nodes remain. The saved blend retains the complete original compositor.

| Accepted capture | Seconds |
|---|---:|
| Full-scene beauty | 59.63 |
| Matching full-scene weather | 8.02 |
| Native 4x inset beauty, padded border | 24.26 |
| Matching native inset weather | 6.34 |
| **Total rendering/export** | **98.25** |

Accepted preparation, original-file hashing, build, rendering and composition: **174.26 s**. Separate saved-file verification: **24.29 s**. Authoring, inspection and the two pre-render preservation stops are excluded. Exactly one accepted full beauty/weather pair and one native inset beauty/weather pair were rendered; no additional presentation image or clip was made.

Final PNG SHA-256: `b34efdf6d1b66ce20f2e80236c1fc7c42d9d7120cb340fda9b4735af7d54774f`.

Saved blend SHA-256: `184302f6c2f87ec17fe9721bf6ceadcceeecf58d818f860c895f5b39c42daf0c`.

From `roxy3d/`, using the existing local runner:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File leader/run_blender.ps1 -Script build_draft85.py -Log draft85.log
powershell -NoProfile -ExecutionPolicy Bypass -File leader/run_blender.ps1 -Script verify_draft85.py -Log verify85.log
```

## Later separate layer render, only after owner authorization

1. Stage a new fragment in its own folder. Render the **LEADER body as straight RGBA**, retaining the scene's indirect illumination and all existing objects as camera holdouts. Existing peers, including box-office geometry, must remain capable of occluding it. Capture coverage and a world-position AOV for the visible leader surface. Keep non-leader AOVs zero so filtered edge positions cannot mix with the wall behind the poster.
2. Capture receivers with identical geometry, camera, seed and existing lights, first with the **picture lamp on**, then with **only that lamp off**. Their scene-linear difference isolates its actual light contribution, including the warm wall/floor wash and reflections. Retain a matched **LEADER-absent baseline** to capture any frame/bracket shadow or occlusion correction against the existing packs. Apply the approved display/glare transform before solving browser additive light and any necessary negative correction; an AgX-transformed difference cannot be substituted for a linear-light difference. Render these as internal comparison passes only; do not replace or re-render the live pack's assets.
3. Capture actual receiver positions and ownership too. Split the poster/frame/bar and the receiver corrections by **1000 + round((world X - world Y) * 100)**, using the existing **0.25-tile depth-band** convention. The face spans approximately **1648..1714**, with center **1681**; assigning all of it center depth would be wrong. Keep light on the supporting wall or floor at that receiver's depth. Use existing receiver-parent ownership to place a correction immediately above its receiver where required. Disjoint slices must reconstruct their parent exactly. This lets walkers in front cover the low poster while keeping box-office pieces in front wherever their actual geometry/depth requires it.
4. Work natively at **3840 x 2160**, derive the 1920 x 1080 partner with coverage-aware reduction, and check reconstruction against a direct capture before packaging. Keep 1x coordinates logical. Include hashes and fragment metadata. Browser/real-chat/OBS acceptance and promotion remain later tasks; this brief supplies no runtime layer pack.

**Local estimate: allow 30-40 minutes** for a conservative native-4K static layer job with body/coverage/depth, lamp-on/off receiver captures, a geometry-absent baseline, display preparation, slicing and verification; both 1x and 2x come from those captures. This is a planning estimate, not a benchmark of those future passes. Brief 83 on the same RTX 3050 measured **33.25 s** for an isolated native body, **590.02 / 557.65 s** for full-scene lit/off receivers and **541.34 s** for its geometry-absent baseline: about **28.7 minutes** of capture time before packaging. Tight native-grid receiver borders may reduce this substantially, but their final support must be measured first. No cloud or later-layer render was started.

STATUS: COMPLETE - ONE DRAFT 28 STILL WITH ONE NATIVE 4X INSET, SEPARATE LEADER BLEND, SCRIPTS AND VERIFIED NOTES DELIVERED; READY FOR OWNER REVIEW; STOP.
