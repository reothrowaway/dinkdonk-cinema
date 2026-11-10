# Brief 83: lobby street marquee, FULL layer render (owner approved)

Owner, 9 Nov 2026, on draft 27 (`qa10/draft27-marquee.png`): "It's good, go ahead." This is the full-quality render
of the approved marquee as its **own layer set over the live pack**. Nothing in `out10/` or `out10mist/` is
re-rendered or changed. Render on the **local RTX 3050** (no cloud).

## Inputs (read-only)
- Approved look: `marquee/marquee_draft27.blend`, `marquee/build_marquee_draft27.py`, `NOTES-80/81/82.md` (your
  layer-render plan in NOTES-80 plus the NOTES-81/82 additions: receiver on/off passes, canopy-absent baseline,
  depth ownership, 4-group chase, the 3840x2160 bulb kernel sigma 3.30 px / radius 9.30 px).
- Live pack contract: `out10/manifest.json` (projection, depth convention, `render_layers`, `prop_loops`,
  `prop_loop_contract`, the sign's chase clock), `../docs/art-pipeline.md` section 2, `../docs/lobby.md`.
- Face quads: `marquee/marquee_geom_b.json`.

## Production settings
Same as the live pack (NOTES-56): native 3840x2160 grid, production camera, 256 max / 64 min samples, 0.01
adaptive threshold, seed 1701, OptiX denoise, Blackman-Harris 2.5, the existing AgX look and glare chain. 1x files
come from linear 2x2 reduction of the native 2x captures. Crop each layer to its bounding box plus padding for glare
and the bulb kernel; never change the projection.

## Deliverables: staging pack `out10m/` (new folder)
Every image at 1x and @2x, all rects/z in 1920x1080 logical pixels, same conventions as `out10/`:
1. **Marquee body** (canopy, trim, blank lit letterboards, roof with its wet reflections, bulbs at the chase's
   steady/base level): straight-alpha PNG(s), cut into disjoint **depth slices** from the world-position AOV with
   the lobby's depth convention (`1000 + round((u + v) * 100)` style z), so walkers on the sidewalk under and in front
   of the canopy sort correctly. Slices must rebuild the parent exactly.
2. **Receiver light** (the warm pool on the sidewalk/threshold/glass, the bulbs' spill): RGB on black,
   `plus-lighter`, split by the receiver's own ground depth, steady (no chase) unless it visibly needs it.
3. **Shadow/negative correction** where the canopy blocks existing light or reflections: a straight-alpha darkening
   layer (drawn source-over), only if it is actually needed; say so either way.
4. **Bulb chase**: sprite sheet(s) per the `prop_loop_contract` (RGB on black `plus-lighter` on top of the body, or
   straight RGBA if that reproduces it better): 48 phases, 24 fps, 2 s, phase-locked to the existing sign chase in
   the 6 s master loop. Check the 47->0 join.
5. `marquee.json`: a manifest fragment in the same schema style as `out10/manifest.json` (`render_layers`-style
   entries with file, x, y, w, h, z_index, blend; `prop_loops`-style entries for the chase; the letterboard face
   quads in stage px as `letterboard_quads` for the page to draw text on; the canopy footprint in u/v so the page can
   keep walkers' name tags off it if needed).
6. `checksums.json` (`{file, bytes, sha256}` for every file) and `validation.json` (slices rebuild parent,
   composite check passed, chase join passed).
7. ONE check image `qa10/marquee-layer-check.png`, 1280x720: the live `out10/full.png` with the new layers
   composited the way the page will (body slices source-over, light plus-lighter, chase phase 0), so it can be
   compared with draft 27. No other images or clips.
8. `NOTES-83.md`: what you rendered, settings, per-pass times, total time, file list and sizes, how each layer is
   meant to be drawn in the page (z, blend, timing), and anything the page must handle (rain over the canopy,
   walkers passing under it, name tags).

## Rules
Write only inside `roxy3d/out10m/`, `roxy3d/marquee/`, `roxy3d/qa10/marquee-layer-check.png` and
`roxy3d/NOTES-83.md`. Never modify out10/, out10mist/, qa11/, the source .blend files, or any page. No cloud. Use
the local GPU only, one Blender job at a time (it's a 6 GB laptop GPU). End with a STATUS line and stop.
