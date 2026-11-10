# Brief 79: street marquee layout blockout

9 Nov 2026. Delivered one **1280 x 720 Workbench still** from the unchanged production isometric camera. This is a layout proposal for owner review.

![Marquee blockout](marquee/blockout.png)

## Files

- [blockout.png](marquee/blockout.png): the only image; full scene, flat colored canopy, four short arrow labels.
- [marquee_geom.json](marquee/marquee_geom.json): eight box corners in Blender world meters; face and soffit corners in world and 1920 x 1080 stage coordinates; camera, dimensions, calibration and exact mockup differences.
- [marquee_blockout.blend](marquee/marquee_blockout.blend): copy of the frozen production scene. Six new objects in `MARQUEE`; camera-facing callouts in `MARQUEE_LABELS`.
- [build_marquee.py](marquee/build_marquee.py), [run_blender.ps1](marquee/run_blender.ps1): reproducible builder and local runner. Inspection and verification scripts/logs are also inside `marquee/`.
- [run_report.json](marquee/run_report.json), [verification.json](marquee/verification.json): timing, hashes, saved-copy checks and calibration results.

## Dimensions and placement

| Part | Chosen size or position |
|---|---|
| Main box | **4.6 m wide x 0.6 m projection x 1.0 m fascia height** |
| Soffit / roof | **3.1 m / 4.1 m** above sidewalk |
| Position in page coordinates | u = 7.2..11.8, v = 9.0..9.6 |
| Position in Blender world | X = 7.2..11.8, Y = -9.6..-9.0, Z = 3.1..4.1 |
| Street letterboard | Single uninterrupted 4.6 x 1.0 m rectangle, outward normal -Y |
| Visible end letterboard | 0.6 x 1.0 m rectangle, outward normal +X |
| Rear mounting risers | Two 0.12 x 0.12 m plain boxes at u = 8.4 and 10.6; rise **1.045 m** above the existing header |

The canopy is centered at u = 9.5, exactly over the existing 8.4..10.6 entrance opening. The source has an open entrance with a threshold and jambs, rather than closed glass door leaves. A 4.6 m width follows the mockup's 280 px-wide letterboard closely: the new face spans 276 horizontal stage pixels and extends 1.2 m beyond each jamb.

Two source-scene facts require a visible departure from L1:

1. **The sidewalk is only 1.5 m deep** from the glass plane at v = 9 to the curb at v = 10.5; the individual paving slabs start at v = 9.15. L1's 90 px outward offset implies roughly **1.5 m projection**, covering essentially the whole sidewalk. I shortened this to **0.6 m**, about 40% of the facade-to-curb width, to honor the brief's approximately one-third projection. It ends 0.9 m before the curb.
2. **The existing header is only 2.055 m high.** L1's painted fascia bottom corresponds to approximately 1.5-1.6 m above the sidewalk, too low for the specified 1.7 m walkers. I raised the soffit to **3.1 m**, giving 1.4 m clearance above a 1.7 m walker. Two simple rear risers bridge the gap to the existing jamb/header line, so the raised canopy is visibly connected. These are mounting placeholders for layout approval.

The source unit settings are METRIC with scale_length = 1. The surrounding cutaway is stylized; its existing header was not enlarged. No existing geometry was moved. The box clears the lamp, shelter and DINK DONK sign in both the source geometry and the inspected fixed-camera image. The lamp footprint ends around u = 5.145, over 2 m left of the canopy. A full source-object bounding-box check found no solid architecture or prop candidates intersecting the canopy; its six broad candidates are scene-spanning rain/drip/impact systems, recorded in the geometry JSON. This is a static layout check, not a future weather interaction test.

## Projection and mockup comparison

Reused Brief 59's mapping: `world = [u, -v, z_px / 73.48469228349535]`. Verified six known landmarks and all eight new box corners against the **original orthographic production camera**. Maximum axis difference from the page formula is **0.0000916 stage pixel**. Reopening the saved blend and projecting the actual face vertices reproduced the exported coordinates exactly.

The following are 1920 x 1080 stage coordinates, not 1280 x 720 preview pixels. L1 values come directly from its SVG construction in `concepts/improve/index.html`.

| Street face corner | L1 x, y | Blockout x, y | New minus L1 dx, dy |
|---|---|---|---|
| TL | 690, 696 | 756.000, 552.713 | +66.000, -143.287 |
| TR | 970, 844 | 1032.000, 690.713 | +62.000, -153.287 |
| BR | 970, 910 | 1032.000, 764.197 | +62.000, -145.803 |
| BL | 690, 762 | 756.000, 626.197 | +66.000, -135.803 |

The face center moves **64 px right and 144.545 px up** because of the shorter projection and greater clearance. The horizontal width differs by just 4 px, but the silhouette is deliberately higher and shallower. L1 uses a slightly steeper painted facade slope; the new face follows the actual 0.5 production-camera slope.

Soffit stage corners, in rear-left, rear-right, front-right, front-left order: **(792.000, 608.197), (1068.000, 746.197), (1032.000, 764.197), (756.000, 626.197)**.

## Preview and checks

The canopy body/roof and risers are blue; both letterboard faces are amber; the soffit is green. The downward-facing soffit is naturally hidden by the closed box from this elevated camera. Its green clearance line and arrow identify its height without changing the camera or adding a second view. No new material datablocks, textures, bulbs or letterboard text were added. The existing scene is shown in subdued flat grayscale with cavity shading.

Workbench cannot reproduce the production glass transparency, neon emission, wet reflections or volumetric atmosphere. The enclosing sky sphere and fog box are hidden only in the working copy to avoid opaque preview occlusion; foreground camera visibility is restored from the frozen background-pass scene. Source geometry, transforms, shader materials and the production camera are retained. No beauty/weather render or extra image was made.

The single Workbench render call took **4.245 seconds**; scene preparation and save took **4.429 seconds**, with **8.906 seconds** inside the build run including input-hash verification. These figures exclude initial inspection and the later read-only verification run.

Checks passed after reopening the delivered blend: original camera transform/projection; 1280 x 720 preview; six `MARQUEE` objects; four annotation labels; single-quad letterboard and soffit; outward face normals; world and stage exports matching the actual saved meshes; exactly one PNG. The six read-only inputs (source blend, reference frame, manifest, mapping, L1 image and L1 source HTML) have identical before/after SHA-256 hashes. Visual inspection confirms readable labels and no cropped callouts.

Writes are confined to `marquee/` and this note. `PROGRESS.md` is intentionally unchanged because this brief's explicit write allowlist excludes it. No live page, source blend, art pack, server, OBS collection or cloud resource was changed.

## Later full-quality render estimate

Planning estimate for the **local RTX 3050 6 GB**, one static lighting state, production Cycles quality, alpha canopy + additive light contribution + depth/coverage slice:

| Output | Estimated render allowance |
|---|---|
| Native 1920 x 1080 set alone | **5-10 minutes** |
| Native 3840 x 2160 set, plus derived 1920 x 1080 files | **15-30 minutes total** |

The second route preserves the existing native-2x pipeline; both delivered sizes come from the same 4K captures. It is not the sum of two independently rendered sets. Approximate 4K budget: **1-3 min alpha**, **8-20 min light-on/light-off receiver captures**, **1-3 min depth/coverage**, plus setup/packing. Receiver differences would be temporary captures in the new marquee folder; no existing `out10` file needs replacement.

Basis: [NOTES-56.md](NOTES-56.md) records **14,390.53 s / 34 local background captures = 423.25 s per 4K frame**. Two full-scene light-difference captures at that historical rate alone take about **14.1 min**. Its smaller foreground captures on the RTX 4090 were around 8-10 s, suggesting a cheaper isolated alpha pass, but that is not a measured marquee rate on this laptop. The 1080p allowance assumes fewer shaded pixels with fixed setup costs. Materials, emissive bulbs, receiver isolation, sample convergence, thermals and VRAM will affect the actual time. Animation/chase sequences and styling work are excluded. No Cycles benchmark was run for this brief.

STATUS: COMPLETE - ONE MARQUEE LAYOUT BLOCKOUT, GEOMETRY EXPORT, WORKING BLEND AND SCRIPTS DELIVERED; READY FOR OWNER LAYOUT REVIEW; STOP.
