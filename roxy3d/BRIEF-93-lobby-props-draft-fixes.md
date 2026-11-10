# Brief 93: lobby props, styled draft 31 (fixes to draft 30, one still)

Render agent: Claude Fable 5.2 at high effort (owner, 10 Nov 2026; see `../AGENTS.md`, "Who renders the art").

Owner, 10 Nov 2026, on draft 30 (`qa10/draft30-props.png`) and its second opinion (`critique-91.md`): "Fix draft
first". So one more styled draft with the fixes below, then (separately, only on his word) the layer render.
**Positions and sizes stay exactly as approved (Brief 91, `props/props_geom.json`). Change only what is listed here;
everything else about the three props stays as in draft 30.**

## Inputs (read-only - never modify)
- Draft 30 and how it was made: `qa10/draft30-props.png`, `props/props_draft.blend`, `props/build_draft91.py`,
  `props/run91.ps1`, `props/verify_draft91.py`, `NOTES-91.md` (materials, light values, the inset set-up, the checks).
- The second opinion: `critique-91.md` (its measurements are the reason for each change).
- The live frame `out10/full.png` and `qa10/draft29-leader.png` (the same scene without the props).

Work in `props/`, in new files (suffix 93); do not overwrite the Brief 91 files, including `props_draft.blend`.

## Changes (critique points 1-5; point 6, the TV mask, is NOT taken: the TV stays exactly as it is)
1. **Claw machine header.** At stream size the header's amber bulbs match the street marquee's bulbs a few pixels
   above (same colour and brightness), so the header reads as a stray piece of the marquee and the pink sign face is
   drowned. Make it a pink sign with small accents: bulbs from emission 7.0 to about 3 and their radius from 15 mm to
   about 10 mm; sign face from 1.0 to about 1.8. Keep the lettering, the teal line, the box light, the plush heap,
   the claw and everything else. Judge the result at stream size: the header must read as its own pink sign, clearly
   apart from the marquee's bulbs, with no blown-out pixels.
2. **Jukebox body.** The side and top are black against the black bar end, so it reads as an arched panel stuck on
   the bar. Side and top to a visible dark cherry (about 2.5x lighter than now, near linear 0.17 / 0.05 / 0.035), and
   a thin chrome or warm brass edge strip along the arch where front, top and side meet, so the silhouette separates
   from the bar and the worktop. No change of shape or size.
3. **Jukebox title window.** At stream size it is a near-white block. JAMS lettering from 3.2 to about 1.8 and the
   window glass from 0.40 to about 0.7, so it reads as a glowing amber window with darker letters or amber letters on
   a deeper amber field, not a white label. Tune by eye at stream size: it must be amber, not white.
4. **Jukebox floor light.** One clear pink-led pool on the carpet front-left of the jukebox (where the blockout's
   standing rings are); the teal spot halved or dropped, whichever gives one clean pool and no blue-grey smear; cone
   tight enough that the light stays on the carpet and off the front bar's end and the wet surface beyond the lobby
   edge.
5. **Delete the shelf bracket** `P91 tv shelf bracket` (not visible, outside the approved box). Nothing else about
   the TV, its shelf, its glow or its sample picture changes.

## Deliverables
1. `qa10/draft31-props.png`: ONE still, 1280x720, the fixed production camera, final quality with the weather frame,
   built exactly like draft 30, with the same three 3x native insets at the same places (so the owner can compare the
   two drafts side by side). No labels, no before/after panels.
2. `props/props_draft93.blend` and the script(s), the props in collection `PROPS` as before, ready for the layer
   render.
3. `NOTES-93.md`: each change with the old and new values, what you measured at stream size for points 1, 3 and 4
   (the header against the marquee bulbs, the title window's colour, the floor pool), the blown-out check, the
   verification that every prop is still inside its approved box and the TV is unchanged, render time, and anything
   that still falls short. Keep it short.

## Rules
Write only inside `roxy3d/props/` (new files), `roxy3d/qa10/draft31-props.png` and `roxy3d/NOTES-93.md`. Never
modify or overwrite `qa10/draft30-props.png`, the Brief 91 files, out10/, out10m/, out10l/, out10mist/, qa11/,
marquee/, leader/, style/, the source .blend files, or any page. No close-ups, clips, comparisons or extra images
beyond the insets inside the one still (tuning crops go in a temp folder outside the project and are deleted). No
cloud; the local RTX 3050 only, one Blender job at a time (check with `tasklist` that no `blender.exe` is running
before each render and wait if one is). No computer use. Do not commit or push. End with a STATUS line and stop.
