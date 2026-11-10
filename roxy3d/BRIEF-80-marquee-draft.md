# Brief 80: lobby street marquee, styled DRAFT (one still)

Owner, 9 Nov 2026: layout OK for blockout B (`marquee/blockout_b.png`). Now one styled draft at final quality.
Later (separate brief, only when the owner says so) the marquee becomes its own layer over the live pack: alpha
image + additive light layer + depth slice + bulb chase. Nothing in `out10/` gets re-rendered, so the draft must
look like it belongs in the existing render.

## Inputs (read-only - never modify)
- Approved layout: `marquee/marquee_blockout_b.blend`, `marquee/build_marquee_b.py`, `marquee/marquee_geom_b.json`
  (4.6 m wide, projects 1.2 m from the facade, soffit flush on the 2.05 m entrance header, fascia 1.0 m;
  u 7.2-11.8, v 9.0-10.2). Do not change size or position.
- Production lobby scene: `cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend` (frozen out10 scene,
  production camera, lights, wet materials, render settings in NOTES-56).
- Look reference: `../concepts/improve/drafts/L1.png` (mockup), the live frame `out10/full.png`, the DINK DONK sign's
  amber bulbs (match their bulb size, colour and glare).
- Earlier lobby drafts and how they composite the weather frame: `NOTES-56.md`, `qa10/draft24-*`.

Work on a copy in `marquee/`.

## Look (classic late-90s cinema marquee, as in L1)
- Canopy body: dark plum/near-black painted metal, thin dark-red trim bands top and bottom of the fascia.
- Letterboards (street face and the short camera-side end face): cream, backlit translucent panels with an even
  warm glow, inset slightly in the frame. In the draft only, put sample black letterboard text on the street face,
  two lines, e.g. `NOW SHOWING · WHIPLASH` / `SCREEN 1 · DOORS OPEN`, in classic changeable marquee letters. Do this
  as a 2D overlay onto the face's stage corners (that's how the page will draw it later), not in the scene.
- Bulbs: one row of warm round bulbs along the top and bottom edge of both letterboard faces (about 20-24 along the
  street face), same look as the sign bulbs. Draft = all on (no chase).
- Soffit: dark, with a few warm downlights that cast a soft pool on the wet sidewalk and entrance threshold,
  reflecting in the wet street like the other lights. The glow and reflections must stay plausible: no blown-out
  white areas.
- Roof: plain, with a slight lip; no extra props.

## Deliverables
1. `qa10/draft25-marquee.png`: ONE still, 1280x720, the fixed production camera, final quality (production samples,
   wet materials, reflections, glare as in the live pack) with one composited weather frame, same as earlier lobby
   drafts. Everything else in the frame unchanged.
2. `marquee/marquee_draft.blend` and the script(s), with the marquee's materials, bulbs and lights in collection
   `MARQUEE`, ready for the later layer render.
3. `NOTES-80.md`: what you did, materials/light values, render time, and a short plan for the later layer render
   (which passes, how the light layer is isolated, how the depth slice is made, how the bulb chase syncs with the
   6 s loop) with a time estimate on the local RTX 3050.

## Rules
Write only inside `roxy3d/marquee/`, `roxy3d/qa10/draft25-marquee.png` and `roxy3d/NOTES-80.md`. Never modify
out10/, out10mist/, qa11/, the source .blend files, or any page. No close-ups, clips, comparisons or extra images. No
cloud. End with a STATUS line and stop.
