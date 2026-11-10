# Brief 92: the lobby as a "scale model" picture (two stills, preview renderer)

Render agent: Claude Fable 5.2 at high effort (owner, 10 Nov 2026; see `../AGENTS.md`, "Who renders the art").

Owner, 10 Nov 2026, looking at the props placement blockout `props/blockout.png`: "i really like the style on it". He
means the look of the Workbench preview itself: the whole city block as a grey scale model with crisp edges and dark
outlines. He asked for a clean picture in that style ("yes, make one") and whether it has to be without colours
("does it have to be with no colors?"). It does not, so this brief makes **two** stills of the same view: the grey one
he saw, and one in colour.

This is not a production render and not a blockout of anything new: no props, no boxes, no labels, no inset.

## Inputs (read-only - never modify)
- The picture he liked and exactly how it was made: `props/blockout.png`, `props/build_props.py` (the Workbench set-up
  near its end: engine `BLENDER_WORKBENCH`, view transform Standard, `light = 'FLAT'`, `color_type = 'OBJECT'`, no
  shadows, cavity on with type BOTH, ridge 1.1, valley 1, object outline on with colour (.025, .035, .05), no specular,
  no x-ray; the storefront glass drawn see-through; the sky sphere, fog box and the alley's steam card hidden), and
  `props/run_blender.ps1` (how to run Blender headless with its caches inside the job's folder), `NOTES-89.md`.
- Scene: a copy of `leader/leader_draft29.blend` (the frozen out10 lobby with the street marquee and the "Dear Leader"
  poster), production camera unchanged. If it cannot be used, `marquee/marquee_draft27.blend`, and say so.
- For the colours: the scene's own materials (Principled base colours and their image textures) and the live frame
  `out10/full.png` to compare against.
- The auditorium's corridor blockout `qa11/corridor/blockout.png` already shows this renderer in colour (purple seats,
  blue walls, the red door): its script `qa11/corridor/build_corridor.py` copied each material's colour to its
  object's display colour.

Work in a new folder `style/`.

## The two stills (same camera, same framing as the lobby drafts, 16:9)
1. **`style/lobby_model_grey.png`**: the look of `props/blockout.png` exactly (same Workbench settings, the same
   neutral greys, the same see-through tinted glass), with the three coloured prop boxes, their floor rings, the
   labels, arrows and the inset left out. Nothing else changes.
2. **`style/lobby_model_color.png`**: the same picture with every object in its own flat colour instead of grey: the
   colour a viewer would name for that surface in the real render (plum walls, the purple lobby carpet, the red
   padded doors, the cream letterboards, the teal and pink of the neon tubes, brick, the wet asphalt's dark blue-grey,
   the posters as flat patches of their main colour, the "Dear Leader" poster red and gold). Take each from the
   material's base colour; where a material is driven by an image texture or a mix, use a representative colour of it
   (for example the texture's average). Keep the flat lighting, the cavity edges and the dark outline, so it still
   reads as a model, not as the night scene: no emission glow, no shadows, no rain. Colours should be clear but not
   garish; if the raw material colours come out too dark to read (it is a night scene), lift them evenly and say by
   how much.
- Both at **1920x1080** and also at **3840x2160** (`...@2x.png`); the renderer is fast enough.
- Look at both yourself (read the PNGs) and fix obvious faults: an object left at default grey in the colour version,
  a large surface in the wrong colour, something that renders as a solid block and hides the scene (the helper
  objects the earlier script hid), missing outlines.

## Deliverables (all in `style/`)
- The four PNG files above. No other images.
- `build_style.py` (the script) and `style_model.blend` (the copy with the display colours set), so the same look can
  be produced again or for the auditorium.
- `../NOTES-92.md`: the settings, how the colours were chosen (and any lift), which objects needed a hand-picked
  colour, render time per frame, and what it would take to do the same for the auditorium or as an animated or live
  element. Keep it short.

## Rules
Write only inside `roxy3d/style/` and `roxy3d/NOTES-92.md`. Never modify out10/, out10m/, out10l/, out10mist/, qa11/,
marquee/, leader/, props/, the source .blend files, or any page. Preview renderer only (Workbench): no Cycles, no
final-quality render, no cloud. **Another agent is rendering a final-quality draft with Blender on this machine right
now (Brief 91, it writes in `props/`): before each of your renders check with `tasklist` that no `blender.exe` is
running, and if one is, wait and check again; do not stop or disturb it.** No computer use. Do not commit or push.
End with a STATUS line and stop.
