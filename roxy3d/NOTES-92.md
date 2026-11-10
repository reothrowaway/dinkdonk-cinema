# Brief 92: the lobby as a "scale model" picture (gray and color)

10 Nov 2026. Four Workbench stills from the unchanged production camera, same framing as the lobby drafts. No Cycles,
no cloud, nothing written outside `style/` and this file. Source scene: `leader/leader_draft29.blend`, opened
read-only (SHA-256 unchanged before and after, as are `out10/full.png`, `full@2x.png`, `manifest.json`).

![Gray](style/lobby_model_grey.png)
![Color](style/lobby_model_color.png)

| File | Size |
|---|---|
| `style/lobby_model_grey.png`, `style/lobby_model_grey@2x.png` | 1920x1080, 3840x2160 |
| `style/lobby_model_color.png`, `style/lobby_model_color@2x.png` | 1920x1080, 3840x2160 |
| `style/build_style.py` | the script (`--inspect`, `--only grey\|color`, `--no2x`, `--source x.blend`) |
| `style/style_model.blend` | the copy; color set active, both sets stored on every object |
| `style/run_blender.ps1`, `verify_blend.py`, `inspect_nodes.py` | runner (waits while another blender.exe runs), check of the saved copy, node-tree dump |
| `style/run_report.json`, `verification.json`, `build.log`, `verify.log` | what the last run did |

## Settings (both versions, copied from `props/build_props.py`)
Workbench, view transform Standard, light FLAT, color type OBJECT, no shadows, cavity on (type BOTH, ridge 1.1,
valley 1), object outline on (.025, .035, .05), no specular, no x-ray, world background (.025, .035, .05), 16 AA
samples. Hidden: sky sphere, fog box, the alley's steam card. Glass (45 objects, same name list as the blockout) drawn
see-through with the blockout's tint (.05, .09, .14), alpha .34 storefront / .22 other.

**Gray** = the blockout's formula unchanged: gray = min(.29, .055 + luminance of the material's viewport color x .26),
tinted (.87, .96, 1.08). Checked against `props/blockout.png`: the same RGB values at matching points. No boxes,
rings, labels or inset.

## How the colors were chosen
Per material, read from its node tree (563 materials; 6 could not be read and fell back to their viewport color, all
of them on hidden or off-screen helper objects, so nothing visible is on a fallback):
1. Principled **base color**. Noise-driven color ramps are averaged around the noise's middle; multiply/mix nodes are
   followed; the rain "WetLayer" group is passed through, so the model shows the **dry** color.
2. **Image textures** (the 19 prints: posters, emotes, flyers): the **main color** = mean of the largest color cluster,
   not the plain average. The average of the Dear Leader poster is an orange-tan (#b67752) that is nowhere in the
   poster; the main color is its red (#bd3625). Whiplash board: near black instead of olive gray.
3. A surface that **glows brighter than it reflects** (neon tubes, lit windows, bulbs: 297 objects) gets its emission
   color, flat, no glow.
4. An object with several materials gets the area-weighted mean (4 objects: the three carpet-fleck meshes, one
   restroom wall).

**Lift (even, every color the same curve):** on luminance L in linear light, L' = 0.055 + 0.945 x L, color scaled by
L'/L, so hue and saturation stay. 0.055 is the darkest gray of the gray version. In practice: near-black roofs and
enamel about x5 to x6, asphalt x2.5, lobby carpet x2.9, plum walls and red doors x1.9, cream letterboards x1.07, neon
x1.01. Without it the whole exterior was black and the outlines disappeared.

## Hand-picked (color version only)
- **Pothole water** (4 objects): clear water has a white base color; given the puddles' color.
- **Glass**: the blockout's dark see-through tint instead of each glass material's own color (same as gray).
- **Rain hidden** (126 objects: surface beads, drips, splash crowns, gutter pours; material "dielectric water beads"
  plus two material-less rain meshes). They were white specks over everything. The gray version keeps them, as in the
  blockout. Puddles, runoff and damp stains stay in both.
- **See-through** for materials that are mostly transparent (9 visible objects: bus-shelter glazing x3, two ad
  glasses, two glass-block insets, the tip jar, the "ABSOLUTE CINEMA" wall decal). In gray they are solid, as in the
  blockout.
No single object got a color typed in by hand.

## Does not match the brief / to know
- **Dear Leader poster is red, not red and gold.** One object can carry one flat color. The gold is only the small
  brass picture light above it; the frame keeps its black-brown lacquer.
- **Line weight.** Workbench outlines and cavity edges are 1 px at any size. Against the 720p blockout the lines are
  2/3 as heavy at 1080p and 1/3 at 4K. Tones are identical; the picture is finer, not different.
- The gray still shows the Dear Leader poster as a light panel (the blockout's scene did not contain it).
- The EatFresh emote panel on the roof billboard is a strong blue (its main color); the cat panel is brown.
- `run_report.json`: the list `see_through_in_colour_only` also names off-screen and source-hidden objects; its render
  times are from a run that overlapped the other agent's Blender (see below).

## Render time
Undisturbed: 2.2 to 3.3 s per 1920x1080 frame, 3.1 to 3.2 s per 3840x2160 frame; the whole build (open the scene,
read 563 materials, 4 stills, save the copy) 29 to 31 s on the RTX 3050. The last run took 104 s (3.8 to 7.5 s per
frame), most likely because the other agent's Blender render started while it ran (none was running at the check just
before); the four files have the same sizes as in the undisturbed run before it.

## Not checked
- `style_model.blend` was verified by script only (same camera, object count, vertices and transforms as the source;
  settings; 8,516 objects carry both color sets). Not opened in the Blender window; the `style_switch.py` text block
  inside it was not executed.
- Colors against `out10/full.png` were judged by eye, not measured. The 2x stills were looked at as 1:1 crops of the
  snack-bar area only.

## The auditorium, animation, live
- **Auditorium still:** `build_style.py --source <auditorium .blend>` reads any scene. To change: the output file
  names (hard-coded `lobby_model_*`), the glass and hide name lists (lobby names), then one look for helper objects
  that render as solid blocks (light cards, volumes, the screen's catcher) and for the screen material. Estimate: one
  agent run, seconds of rendering. Not tried.
- **Animated:** about 3 s per 1080p frame locally, so a 10 s clip at 30 fps is about 15 minutes, no cloud.
- **Live (as page art):** the page needs the full layer set (beauty, occluder sprites, glass), not one still. Camera
  and geometry are the same, so the existing cut and depth layout could be reused and only the pictures re-rendered in
  Workbench into a separate pack folder. Mist, lamp layers, neon glow and rain would not apply. Estimate only.

STATUS: done - 4 stills, script and working copy in `style/`; one deviation (Dear Leader poster flat red).
