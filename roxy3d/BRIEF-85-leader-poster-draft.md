# Brief 85: "Our Dear Leader" poster by the box office, styled DRAFT (one still)

Owner, 10 Nov 2026: layout OK for the Brief 84 placement ("Keep it on the wall") and OK for the poster design
("Yes, render it"). Now one styled draft at final quality. Later (separate brief, only when the owner says so) the
poster becomes its own layer over the live pack (alpha image + light layer + depth slices), like the marquee pack
`out10m/`. Nothing in `out10/` or `out10m/` gets re-rendered, so the draft must look like it belongs in the existing
render.

## Inputs (read-only - never modify)
- Approved placement: `leader/leader_blockout.blend`, `leader/build_leader.py`, `leader/leader_geom.json`, `NOTES-84.md`
  (poster face 0.66 x 0.99 m, frame 0.72 x 1.05 m, on the low partition wall right of the TICKETS sign, face plane
  X = 3.146, v 3.33..3.99, face bottom 0.085 m above the floor; a short picture-light bar under the wall's cap).
  Do not change size or position.
- Approved artwork: `leader/poster.png` (800 x 1200, 2:3, made from `leader/poster.html`). Use it as it is for the
  poster face: do not redraw, recolour, crop or add to it.
- Base scene: a copy of `marquee/marquee_draft27.blend` (the frozen out10 production scene plus the approved street
  marquee, so the frame matches what is live today; production camera, lights, wet materials; render settings in
  NOTES-56 and NOTES-82). If that file cannot be used, fall back to
  `cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend` and say so.
- Look reference: the live frame `out10/full.png`, the framed film posters on the corridor walls (frame depth, glass,
  how they sit on the wall), `qa10/draft27-marquee.png` (the last approved lobby draft and its weather frame).

Work in `leader/`.

## Look (a printed propaganda poster, hung with some care in a late-90s cinema lobby)
- The poster: `leader/poster.png` on the face as a printed paper sheet: matte, a slight paper sheen, no emission. It
  is lit by the scene and by its own picture light, so the reds must not glow or blow out and must not turn muddy
  either; it should read clearly as red, gold and cream in the dim purple lobby.
- Frame: a thin dark frame (black-brown lacquered wood or dark metal, about 3 cm), simple, no ornament. No glass
  reflection that hides the picture; if you add glass, keep it barely visible.
- Picture light: a small brass bar on a short bracket above the poster (as in the blockout), with a warm narrow light
  that washes the poster evenly from the top and spills a little on the wall and the floor below. Warm white,
  dimmer than the corridor sconces; no visible hot spot, no blown-out white.
- Nothing else is added: no stand, no rope, no flowers, no extra props.

## Deliverables
1. `qa10/draft28-leader.png`: ONE still, 1280x720, the fixed production camera, final quality (production samples,
   wet materials, reflections, glare as in the live pack) with one composited weather frame, same as the earlier
   lobby drafts. Everything else in the frame unchanged. Because the poster is only about 26 px wide in this frame,
   put ONE magnified inset of the poster wall in an empty corner of the same image (about 4x, rendered natively at
   that scale with the same final-quality settings, not an upscale), with a thin line to the spot. No labels.
2. `leader/leader_draft.blend` and the script(s), with the poster, frame, picture light and its lamp in collection
   `LEADER`, ready for the later layer render.
3. `NOTES-85.md`: what you did, material and light values, render time, and a short plan for the later layer render
   (which passes, how the picture light's contribution is isolated, how the depth slices are made so walkers in front
   cover the poster and the box office stays in front where it is) with a time estimate on the local RTX 3050.

## Rules
Write only inside `roxy3d/leader/`, `roxy3d/qa10/draft28-leader.png` and `roxy3d/NOTES-85.md`. Never modify out10/,
out10m/, out10mist/, qa11/, marquee/, the source .blend files, `leader/poster.png`, `leader/poster.html`, or any page.
No close-ups, clips, comparisons or extra images beyond the one inset inside the still. No cloud. No computer use.
End with a STATUS line and stop.
