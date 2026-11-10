# Brief 79: lobby street marquee, layout BLOCKOUT (one still)

Owner, 8-9 Nov 2026: add a classic cinema marquee (canopy) over the lobby's street entrance. Picked from the
improvement drafts as L1: see `../concepts/improve/drafts/L1.png` (an SVG mockup over the live frame, not a render).
Later it will be rendered at full quality in Cycles from the production lobby scene as its **own layer** over the
existing pack (alpha image + additive light layer + depth slice). Nothing in `out10/` gets re-rendered.

This brief is only the **layout blockout**: plain labelled boxes from the fixed lobby camera, so the owner can
approve size and position. No materials, no bulbs, no text, no final-quality render.

## Inputs (read-only - never modify)
- Lobby production scene: `cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend` (frozen out10 scene, its
  camera is the production iso camera). Reference frame: `out10/full.png`, `out10/manifest.json`.
- Mockup: `../concepts/improve/drafts/L1.png` (1920x1080 stage pixels).
- Page projection (lobby stage 1920x1080): floor point (u,v,z) -> stage px `P = [900 + (u - v) * 60, 350 + (u + v) * 30 - z]`.
  `fly/mapping.json` (Brief 59) already maps lobby (u,v,z) to Blender world; reuse it if it holds.

Work on a copy in a new folder `marquee/`.

## The marquee (as in the mockup)
- A flat-roofed canopy box fixed to the glass street front, centered over the entrance doors, sticking out over the
  sidewalk toward the street (mockup: about the width of the door bay, projecting about a third of the sidewalk).
- A tall front face (fascia) toward the street, plus the shorter end face on the camera side: these are the
  letterboards. The page will draw tonight's film/seat text onto the street-facing face later, so keep it one flat
  rectangle.
- Bottom (soffit) about 3.0-3.3 m above the sidewalk, so walkers (1.7 m) clearly pass underneath. Box depth
  (fascia height) about 0.9-1.1 m.
- Pick real-world sizes that match the mockup's look from the camera; if the mockup's position clashes with the
  scene (doors, lamp post, bus shelter, the DINK DONK sign above), keep clear of it and say what you moved.

## Deliverables (all in `marquee/`)
1. `blockout.png`: ONE still, 1280x720 from the production camera (same framing as the lobby drafts), fast preview
   render (Workbench or Eevee) of the whole scene with the marquee as plain flat-coloured boxes: canopy body one
   colour, street-facing letterboard face a second colour, soffit a third. Burn in 3-4 short labels with arrows
   (e.g. "letterboard 4.2 x 1.0 m", "soffit 3.1 m above sidewalk", "projects 2.4 m"). Nothing else in the image.
2. `marquee_geom.json`: the box in Blender world coordinates (8 corners), its size in metres, and the four corners
   of the street-facing letterboard face and of the soffit in **lobby stage pixels (1920x1080)**, checked against the
   production camera.
3. `marquee_blockout.blend` (the copy with the boxes on their own collection `MARQUEE`) and the script you used.
4. `../NOTES-79.md`: what you did, sizes chosen and why, anything moved to avoid clashes, how close the stage-px
   corners match the mockup, render time, and an estimate of the later full-quality layer render (alpha + light +
   depth slice at 1920x1080 and 2x) on the local RTX 3050.

## Rules
Write only inside `roxy3d/marquee/` and `roxy3d/NOTES-79.md`. Never modify out10/, out10mist/, qa11/, the source
.blend files, or any page. No final-quality renders, no cloud, no extra images, close-ups or comparisons beyond
`blockout.png`. End with a STATUS line and stop.
