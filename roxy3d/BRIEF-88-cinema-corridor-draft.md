# Brief 88: auditorium entrance corridor, styled DRAFT (one still)

Owner, 10 Nov 2026: "Layout OK" for the Brief 87 blockout (`qa11/corridor/blockout.png`). Now one styled draft at
final quality. Later (separate brief, only when the owner says so) comes the full set for the page: lit and
lights-down versions, depth slices, the extended walk route. The hall itself is approved and must not change.

## Inputs (read-only - never modify)
- Approved layout: `qa11/corridor/corridor_blockout.blend`, `qa11/corridor/build_corridor.py`,
  `qa11/corridor/corridor_geom.json`, `NOTES-87.md` (clear floor 2.20 m wide, u 0.35..2.55, from v 14.94 to v 24.00;
  far wall 2.60 m high at u 0.19..0.35; three poster frames 0.70 x 1.00 m at v 16.15, 18.25, 20.35; two wall lights at
  v 17.20 and 19.30; a runner down the middle; near side open; no far-end doorway). Do not change sizes or positions.
- Auditorium production scene: `roxy_cinema_draft13.blend` (lit state, the base for this draft), its build script,
  the live frame `qa11/cinema_draft_13.png`, `qa11/cinema_layout_13.json`, render settings in `qa11/CINEMA-DRAFT-13.md`.
- The lobby, for the look to match: `out10/full.png` (the corridor behind the usher: plum walls, the pink and teal
  neon lines, dark wainscot, deep blue carpet, framed film posters, small wall sconces) and the lobby scene
  `cloud/brief57/upload/bundle/out10i/_work/pipeline/scene.blend` for its wall, carpet, poster-frame and sconce
  materials and its poster artwork.

Work in `qa11/corridor/`.

## Look (the owner's words: dim, less lit than the hall, the same purple look as the cinema, maybe posters on the
## walls, some really dim lights)
- It is the back corridor of the same late-90s cinema as the lobby: the lobby's plum wall finish with a dark
  wainscot, the lobby's carpet with a darker runner down the middle. No neon lines here (the first mockup's pink neon
  line was too bright); at most a very dim cove or skirting glow if it helps the floor read.
- **Clearly darker than the hall with its house lights up**, and much darker than the lobby: the corridor must sit
  back in the frame, not pull the eye from the seats and the screen. But a chatter walking down it (a 32 px emote
  figure the page draws) must still read against the floor and the wall, so no crushed black: keep the floor and the
  lower wall visible.
- Lights: the two wall lights as small sconces in the lobby's style, really dim and warm, each with a small soft pool
  on the wall and the runner. No visible hot spots, nothing blown out.
- Posters: the three frames with film posters from the lobby's own poster set (the filler posters and the GLORP
  one), behind dull glass, lit only by the corridor's dim light: you can tell they are posters, you can barely read
  them. No picture lights.
- Where the corridor leaves the frame at the left edge it just continues; no end wall, no doorway.
- The hall, the entrance door and everything else in the frame stay exactly as in `cinema_draft_13.png`. Light from
  the corridor must not visibly change the hall, and the hall's light must not light the corridor more than a faint
  spill at the door.

## Deliverables
1. `qa11/cinema_draft_14_corridor.png`: ONE still, 1920x1080, the fixed production camera, final quality (draft 13's
   production samples and settings), house lights up. Everything outside the corridor unchanged.
2. `qa11/corridor/corridor_draft.blend` and the script(s), with the corridor's geometry, materials and lights in
   collection `CORRIDOR`, ready for the later full set.
3. `NOTES-88.md`: what you did, material and light values, render time, how much the hall's pixels changed outside
   the corridor (a measured number), and a short plan with a time estimate for the full set on the local RTX 3050:
   lit and lights-down corridor, whether it can be a separate layer over the live draft 13 art (so nothing of the
   hall is re-rendered) or needs a new full draft, the depth slices the page needs for walkers in the corridor, and
   whether the entrance door's sprite sheet has to be re-rendered.

## Rules
Write only inside `roxy3d/qa11/corridor/`, `roxy3d/qa11/cinema_draft_14_corridor.png` and `roxy3d/NOTES-88.md`. Never
modify the source .blend files, any other file in `qa11/`, `out10/`, `out10m/`, `out10l/`, `out10mist/`, or any page.
No close-ups, clips, comparisons or extra images. No cloud; the local GPU only, one Blender job at a time. No computer
use. End with a STATUS line and stop.
