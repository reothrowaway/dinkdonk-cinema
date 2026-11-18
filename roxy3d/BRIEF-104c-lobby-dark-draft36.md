# Brief 104c - "Gamer lobby": draft 36, the lighting cranked up hard (ONE styled draft still)

17 Nov 2026. Render agent: Claude Fable 5.2, high effort. Builds on draft 35 (`lobby104/lobby_draft35.blend`,
`qa10/draft35-light-fountain.png`, NOTES-104 "Stage 2").

## Owner
- On draft 35: **"Yeah, it is too subtle. So crank it up. It really needs to be noticeable."**
- New decision: this dark look becomes a SECOND lobby option (the "gamer lobby") beside the normal lit lobby, which
  stays as it is. So this scene no longer has to stay close to the live look: it should look clearly different at a
  glance - dark, high contrast, lit by its own real sources. (Queue item 90.)

## Do
Make `lobby104/lobby_draft36.blend` from `lobby_draft35.blend` (keep 35 unchanged) and render ONE still. Apply all six
points of `reviews/review-104-draft35.md` (point 7 = the gate change below), and go **much further** than its numbers:
1. **Kill the flat fill.** Split the two 100 W fills over the restroom by light linking: restroom-only copies keep the
   restroom exactly as it is; for everything else inside the cinema, ceiling/ambient fills go to nearly nothing.
   The interior should be lit almost only by real sources. If the light-linking budget (Blender limit 64, our gate 60)
   gets tight, merge or re-group receiver lists rather than dropping the split; report the count.
2. **Dark is dark.** Walls, back wall above the doors, ceiling edges and the corridor between pools go deep (think
   the restroom's darkness or darker). Light pools are bright and clearly shaped, with a visible falloff edge. Target
   about 8-10x between pool centres and the floor between them (draft 35: 4.5x). Walkable floor between pools still
   keeps a faint low fill so a dark emote stays readable: about 14-18 luma (0-255) at the darkest, not black.
3. **Light from things you can see.** Lean the pools from visible emitters (TICKETS board, poster frames, wall
   sconces, claw machine, jukebox, marquee underside, menu boards, neon strips). Neon strips and sign glow may be
   stronger and throw coloured light on walls and floor; that is the "gamer" part. No new fixtures (no layout change).
4. **Snack bar** stays the brightest interior spot. Candy case strip down (12 W -> 6-8 W, or warmer) so the candy
   keeps its colour.
5. **Fountain** (on the candy case, 0.40 m bowl, look unchanged): a grazing accent from top left on the bowl lip and
   the falls so it reads as a fountain; a faint blue basin bounce on the case top; separate the bowl from the dark case.
6. **Box office** behind the glass: drop its fill, let the two ticket-window pools carry it; teal edges x3 -> x2.
- Keep: restroom, street, rain, street lights, wet reflections of the street, billboards, DINK DONK sign, layout,
  animated emitters' positions. The wet sidewalk and glass will mirror the darker interior; that is expected.

## Deliverable
ONE image `qa10/draft36-gamer-lobby.png`, 1280x720, fixed lobby camera, weather frame 0, same render settings as draft
35. No insets, crops, close-ups, clips or comparisons. Checks to report: light-linking count (no warning line);
restroom vs draft 34 as a **blurred diff** (6-8 px blur; the unblurred number is noise level); street/roofs within
noise; luma of pool centres, floor between pools (median and darkest walkable), walls, snack bar strip; pool-to-floor
ratio. Append a "Stage 2b (draft 36)" section to `NOTES-104.md`. End with a STATUS line.

## Rules
Write only inside `roxy3d/` (`lobby104/`, `qa10/draft36-gamer-lobby.png`, `NOTES-104.md`). Never modify `out10*`,
`qa11/`, pages, existing drafts or existing .blend files (35 included). Local RTX 3050, one Blender job at a time:
check `tasklist` for `blender.exe` and Godot before each render. Blender in background mode (`-b`) only; never a
visible Blender or Godot window. No cloud, no production render, no commit or push. Temporary images outside the
project, deleted after. Then stop.
