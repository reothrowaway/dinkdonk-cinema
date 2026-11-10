# Brief 90: auditorium entrance corridor, FULL SET for the page (owner approved)

Render agent: Claude Fable 5.2 at high effort (owner, 10 Nov 2026; see `../AGENTS.md`, "Who renders the art").

Owner, 10 Nov 2026, on the styled corridor draft `qa11/cinema_draft_14_corridor.png`: "Keep draft 14". He saw the
second opinion (`critique-88.md`: floor too dark, sconces without a light pool) and chose the draft as it is. **So the
look of draft 14 is approved exactly as rendered: do not brighten the floor, do not change the runner, the sconces,
the posters or anything else about it.** This brief turns that draft into the full set the page needs, as a new
draft number, **14**, next to the live draft 13. Nothing of the hall is re-rendered or changed, and no draft 13 file
is touched: `auditorium.html` keeps loading draft 13 until the owner promotes 14.

## Inputs (read-only - never modify)
- The approved draft and its scene: `qa11/cinema_draft_14_corridor.png`, `qa11/corridor/corridor_draft.blend`,
  `qa11/corridor/build_corridor_draft.py`, `run88.ps1`, `NOTES-88.md` (how the corridor was captured as a
  corridor-only layer over the live `cinema_draft_13@2x.png` with zero changed pixels outside it, and the plan for
  this full set: lit + dim layers, depth, the entrance-door sheets for both states), `qa11/corridor/corridor_geom.json`,
  `NOTES-87.md` (layout, the extended walk route).
- The live draft 13 set and its contract: `qa11/cinema_draft_13.png` + `@2x`, `qa11/cinema_draft_13_dim.png` + `@2x`,
  `qa11/cinema_layout_13.json` (`page_layers`: `image`, `slices` with banded `pieces`, `dim`, `entrance_door` with its
  `static_slice_cutout`, `spawn`; `walk_route.rear_portal_to_cross_aisle`; `tunnel`), the folders `qa11/draft13/`,
  `draft13_bands/`, `draft13_dim/`, `draft13_dim_bands/`, the lights-down scene `roxy_cinema_draft13_dim.blend`,
  `qa11/CINEMA-DRAFT-13.md`, and `../docs/auditorium.md` (what the page reads, how depth and the door work) and
  `../docs/art-pipeline.md` section 5 (files of a full draft, the banding tool `tools/band-slices.mjs`).

## Production settings
Draft 13's own (see `qa11/CINEMA-DRAFT-13.md` and NOTES-88): native 3840x2160 grid, the production camera, the same
samples, seed, denoiser and view transform as the draft 13 set; 1x files by the same reduction draft 13 used. Use
render borders: only the corridor's region and the door's frame rectangle need rendering.

## Deliverables: draft 14, all inside `qa11/`
1. **Lit background** `cinema_draft_14.png` and `cinema_draft_14@2x.png`: the live draft 13 background with the
   approved corridor composited in, as in the draft. Outside the corridor's support the pixels must equal draft 13
   exactly; inside it they must equal the approved draft (state the measured differences).
2. **Lights-down background** `cinema_draft_14_dim.png` and `@2x`: the same for the dim state, on
   `cinema_draft_13_dim`. The corridor is outside the hall and has its own lights: it keeps the approved look when
   the house lights go down; only what the hall's own light really contributes to it may change. Say what you did.
3. **Depth for the page.** Walkers in the corridor are drawn by the page over the background with the draft 13 key
   (`key = u + v + zpx / 90`, `z_index = 1000 + round(key * 100)`). Deliver whatever depth slices are needed so that
   corridor geometry in front of a walker covers them and nothing else does, in the same slice format (and banded
   `pieces`, made with `tools/band-slices.mjs` or by its rules) for both the lit and the dim state, in new folders
   `draft14/`, `draft14_bands/`, `draft14_dim/`, `draft14_dim_bands/`. The corridor's near side is open, so this may
   be very little or nothing: say so with the reasoning. Where draft 13's slices are unchanged, reference the draft 13
   files from the new layout instead of copying them.
4. **Entrance door sheets** for both states, where the corridor shows inside the door's frame rectangle (x 247,
   y 539, 201 x 217) while the leaves swing: new `draft14/door_entrance.png` + `@2x` and `draft14_dim/door_entrance.png`
   + `@2x`, and the static cutouts if they change, keeping the geometry, the 16 frames, 4 columns, 18 fps, the open
   poses, the frame rectangle and the held-open frames 5..10 exactly. If a sheet or cutout does not change, reuse the
   draft 13 file and say so.
5. **`cinema_layout_14.json`**: `cinema_layout_13.json` with only what the corridor changes: the `page_layers` paths
   for the images, door files and any new slices; `walk_route.rear_portal_to_cross_aisle` extended at its start with
   the corridor points from NOTES-87 (new first point `[1.45, 24, 0]`, then every 2 m, then the old first point and the
   untouched rest); `page_layers.spawn` updated to the new start, with the point where a walker has to wait for the
   door kept at the old `[1.45, 15.12, 0]` and named in a new field `door_wait_point` (the page waits at the route's
   first point today, so it will need that field); a new top-level `corridor` object with its floor outline, clear u
   and v range, the visible v range in the frame, and the poster quads and sconce positions in stage px. Keep every
   other value identical to layout 13 (rows, seats, stairs, screen, camera, tunnel, litter and so on).
6. **Validation** `qa11/corridor/validation90.json` and `NOTES-90.md`: what you rendered, settings, per-pass and total
   times, the file list with sizes and SHA-256, the pixel comparisons of items 1 and 2, the door-sheet frame check,
   the depth reasoning, a diff summary of layout 14 against layout 13, and **what the page must change to use draft
   14** (for example: the door wait point; the page's "in the tunnel" test `u < 2.9 && v > 8.8 && z < 10`, which would
   treat the whole corridor as tunnel; anything about the dim crossfade or the door cutout).
No other images. The two background stills are what the owner will look at.

## Rules
Write only inside `roxy3d/qa11/` for the new draft 14 files and folders named above and `roxy3d/qa11/corridor/`, and
`roxy3d/NOTES-90.md`. Never modify or overwrite any existing draft 13 file or folder, `qa11/cinema_draft_14_corridor.png`,
the source .blend files, `out10/`, `out10m/`, `out10l/`, `out10mist/`, or any page. No cloud; the local RTX 3050 only.
**One Blender job at a time on this machine: another agent may be running a quick Blender blockout right now; check
with `tasklist` that no `blender.exe` is running before each render and wait if one is.** No computer use. Do not
commit or push. End with a STATUS line and stop.
