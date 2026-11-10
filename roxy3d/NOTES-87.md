# Brief 87 - auditorium entrance corridor layout blockout

10 Nov 2026. One 1920x1080 Workbench still from the unchanged production camera. Layout only, ready for owner review.

![Corridor blockout](qa11/corridor/blockout.png)

## Delivered

- `qa11/corridor/blockout.png`: whole auditorium, flat-colored corridor boxes, dotted entry route and five arrow labels. No people, poster artwork, styled materials or new scene lights.
- `qa11/corridor/corridor_geom.json`: all eight boxes, world/page bounds and corners, sizes in meters, checked stage projections, floor outline and frame-clipped outline, three poster quads, two light positions, extended route, source hashes and geometry/visibility/preservation checks.
- `qa11/corridor/corridor_blockout.blend`: production-scene copy with eight boxes in `CORRIDOR`; the five labels and route annotations are in `BLOCKOUT_LABELS`. The original hall geometry, material assignments and camera are retained. Workbench uses the hall materials' existing diffuse colors as object display colors; this is preview shading, not new hall styling.
- `qa11/corridor/build_corridor.py`: reproducible builder. `inspect_scene.py`, `scene_inspection.json` and `build.log` retain the read-only entrance inspection and build evidence.

## Layout and limits

The corridor is straight, centered on **u=1.45**, extending toward larger v. Its clear floor is **2.20 m wide**, u=0.35..2.55, at z=0. It joins the outside face of the rear wall at **v=14.94** and continues to **v=24.00**, a total **9.06 m**. The existing first arrival point v=15.12 lies 0.18 m inside this floor. The 0.10 m slab extends downward; nothing raises the entrance floor.

The actual door frame opening is **1.341 m**, its clear aperture **1.207 m**, and the tunnel **2.35 m** wide. The chosen 2.20 m clear corridor gives about 0.50 m extra clearance on either side of the clear door aperture, while staying within the existing tunnel's outer width. The floor touches the hall at its outside rear face; it does not penetrate the hall, rear wall or plinth.

The **far wall is 2.60 m high and 0.16 m thick**, u=0.19..0.35. The near side is fully open, with no kerb or ceiling. Three plain cyan **0.70 x 1.00 m** portrait boxes sit on the visible face, centered at v=16.15, 18.25 and 20.35, with bottoms 1.10 m above the floor. Two amber **0.14 x 0.22 m** light boxes sit between them at v=17.20 and 19.30, center height 1.83 m. These are placeholders, not illuminated fixtures. The 1.20 m runner is a flat red box, its top 3 mm above the floor.

**The far end runs out of the frame.** No far-end doorway is added: its forward lintel/jambs would risk covering walkers from this camera. The left edge crops the floor progressively: the far edge reaches it at v=21.3275, the centerline at v=22.4275, and the open near edge at v=23.5275. The image therefore shows **7.4875 m of centerline from the floor join**, or **7.3075 m beyond the old spawn**. The visible far wall spans about 6.38 m. All three posters and both light boxes remain in frame. Width and camera framing limit how much can be shown; extending the off-screen geometry does not reveal more corridor.

The new route starts at **[1.45,24,0]**, stage **[-66.716,909.876]**, entirely off-screen. Extra points are `[1.45,22.5,0]`, `[1.45,20.5,0]`, `[1.45,18.5,0]`, `[1.45,16.5,0]`, then the original `[1.45,15.12,0]` and the untouched entrance/tunnel route. The page-sized walker first enters at the left edge; its full width is in frame by v=21.8725. Nobody waits in the corridor. These are exported route suggestions only; no page or live layout was changed.

## Checks

- Production camera unchanged: rotation 60/0/45 degrees, ortho scale 32, k=0.7071067811875, Ox=890, Oy=370. Every box corner and the route probes were projected through Blender's actual camera and compared with the page formula. Maximum axis discrepancy **0.000207 px**.
- Coordinates are explicit: Blender world **X=u meters, Y=-v meters, Z=height meters**. The page's third coordinate is **zpx_world**, using **73.48469228349535 units per meter**. Page `z` is not a height in meters.
- Zero conservative box-bound intersections with the existing rendered hall meshes (10 micrometer tolerance). No hall object needed to move.
- **9,150 evaluated-geometry BVH rays**, 183 positions along v=15.12..24, found zero obstructions for both a 1.70 m tall / 0.60 m wide vertical envelope and the actual page's 45*k high / 66.6*k wide camera-facing sprite envelope. Both are tested because the page sprite height is not physically 1.70 m at the scene's meter scale. The existing 102 door-leaf objects were temporarily posed at their existing 79-degree open position for this entry check, then restored exactly before saving or rendering.
- A further **360 rays** check the 0.18 m floor-to-door transition against the new corridor alone, with zero obstructions. The existing door keeps its natural closed/open occlusion during that transition.
- **961 rays** across the unchanged entrance frame found zero coverage by new corridor geometry. The door remains visible in the still. These are geometric checks, not a real-chat page test; there are no synthetic walkers or chat floods.
- All **3,024 original objects** retain their checked geometry, transforms, visibility, modifiers and material slots. The camera is unchanged. Both source blends, the draft-13 builder, source PNG and layout retain their SHA-256 hashes. **33,729 protected art files** outside the corridor folder retain size and nanosecond mtime.
- Visually inspected the final whole image: five legible labels with leaders clear of their own text, three poster boxes, two light boxes, an open near edge, the unobstructed entrance, and the runner leading into it.

Blender 5.2.3 LTS, local Workbench. Final render **1.52 seconds**; final build/check/save/render **8.54 seconds**. Two quick Workbench passes wrote the same `blockout.png` (about 3.08 seconds total rendering); the second only corrected label-leader placement. One final image is delivered. An earlier pre-render check correctly exposed the closed production door as an obstruction; the entry check now uses its existing open pose. No Cycles/full-quality render, extra image, close-up, comparison or cloud job was made.

## Later styled draft and full set - estimate only

After layout approval, allow **30-60 minutes** to style the corridor in copied lit/dim scenes: muted lobby-purple wall/carpet, three poster frames/art surfaces, two very dim fixtures, and lighting kept below the auditorium. Keep this corridor as entry circulation. Deliver one 1920x1080 styled still from this same camera; budget **roughly 1-2 minutes of local RTX 3050 rendering**, with setup/review time additional. These are estimates, not benchmarks of the styled corridor.

Only after the owner approves the styled draft and authorizes the full set, stage native **3840x2160 lit + dim beauties**, matching 1080p reductions, corridor-aware depth slices in both states/scales, updated route data, and regenerated page bands in a separate pack. Reuse the draft-13 depth key convention and validate identical lit/dim alpha, reconstruction and screen/camera preservation. Draft 13 recorded 565 seconds of rendering on the RTX 3050; budget **10-15 minutes of rendering** for the expanded set, and **20-40 additional minutes** for adapting/staging the scripts, packaging and checking it (roughly 30-60 minutes total once the styled scenes are approved).

**Plan to re-render the entrance door sheets in lit and dim**, using the same five canonical open poses, frame rectangle, timing and closed endpoints. The geometry/animation does not need redesign, but added corridor surfaces and illumination can affect door shading and pixels revealed around the moving leaves. Reuse masks/rectangles only if the staged reconstruction and occlusion checks prove them unchanged; do not assume the current sprite bytes remain valid. Draft 13's ten cropped door-pose renders totaled about 17 seconds, already within the full-set budget above. This blockout's foreground label/route collection must be excluded from those styled/production captures.

All work stayed inside `qa11/corridor/` plus this report. The brief's narrower write allowlist takes precedence over the general request to append `PROGRESS.md`; no progress log, source art, live file, page, server, OBS collection or shared file was edited. No commit or push.

STATUS: BRIEF 87 BLOCKOUT DELIVERED AND CHECKED; READY FOR OWNER LAYOUT REVIEW; NO STYLED OR FULL RENDER STARTED; STOP.
