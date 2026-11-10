# Critique 91: draft 30, lobby props (claw machine, jukebox, TV)

10 Nov 2026. Read-only second opinion (Claude Fable 5.2). Looked at `qa10/draft30-props.png` whole, at the three
insets, and at the same spots enlarged against `out10/full.png` and draft 29 (before/after difference measured).
Positions and sizes are taken as fixed.

**Verdict: not quite as it is. One more cheap draft (changes 1-4, about 3 minutes of rendering), then the layer
render. The TV can go as it is. Nothing is broken: nothing floats, clips or is blown out.**

## Per prop
**TV: the best of the three, belongs.** Reads as a CRT set at stream size (light box, dark screen, coloured
picture); its values sit inside the bar's range (bezel about 164/155/149, menu boards 215/206/196). The glow lamp
spills nowhere (wall above: +9 levels at most). Sits naturally on the west end of the back counter. Only note: a
beige box with a blue screen is nearer a PC monitor than a 90s TV; with a real picture it will hardly matter.

**Claw machine: reads as a lit prize machine, but its header gets lost.** The blue heap in a lit glass box is the
right signal and survives the tinted glass; the teal line ties it to the lobby; plush faces, claw and Buddy
roundel are good in the inset. At stream size the 28 header bulbs have the colour and brightness of the street
marquee's bulbs a few pixels above (header 239/201/170, marquee 239/206/182), so the header looks like a stray
piece of the marquee's corner, and the pink sign face (strength 1.0) is drowned. The base reads dark green, not the
arcade's black (glass veil plus teal line); it suits the lobby, but recheck under the pack's glass sprite. The cool
reflection on the wet pavement below is the strongest spill of the three (mean +23, up to +79 levels) but it is a
natural mirror image: keep it as an additive piece.

**Jukebox: the front is right, the body is missing.** The arch is the read at stream size and it works; its pink
matches the arcade cabinet's trim (244/167/196 against 251/186/210), no clipping. But the side is pure black
against the black bar end, the top has the worktop's blue-grey sheen at nearly the worktop's height, and the
jukebox shadows the cabinet behind it, so it reads as an arched panel stuck on the end of the bar, not a
free-standing machine. The title window is not amber at stream size: a near-white block (243/236/226, about
9 x 4 px), the brightest spot in that corner, like a blank label. Floor light: the pink patch reads well (36/29/55
to 111/41/94); the teal one becomes a blue-grey smear on the purple carpet (54/41/75 to 64/77/113), so the floor
shows two unrelated blobs, and a little reaches the front bar's end and the wet surface beyond the lobby edge.

## Lights, summary
None too strong for the room. Too strong locally: claw header bulbs, jukebox title window. Wrong colour: the
jukebox's teal floor patch. Too weak: the claw header's pink face, anything that separates the jukebox body.

## Shelf bracket: delete
From this camera (it sees south and east faces) I could not find it in the 3x inset, let alone at stream size. The
shelf already reads as a wall shelf because the set's back meets the wall. It is the only part outside the
approved boxes and one more object in the TV's captures.

## Chat figures
- Claw player (east side) stands in front of the east face: control deck, the BUDDY half of the header and the
  east window are hidden while someone plays. The south face then carries the prop (WIN A, heap, roundel, teal
  line): keep all four. One more reason the header must read as a pink sign, not as bulbs.
- Dancers: the jukebox front is about 30 stage px wide; anyone dead in front hides the grille and most of the
  arch. Only the top third stays above heads, so the brightness belongs there (it is). Figures take no scene
  light, so the floor pool only shows between them: one clear colour, where the blockout's rings are (front-left).

## Changes for the next draft, in order of gain
1. Claw header: bulbs 7.0 to about 3 and radius 15 to 10 mm; sign face 1.0 to about 1.8 (a pink sign, not more
   marquee bulbs).
2. Jukebox body: side and top to a visible dark cherry (about 2.5x lighter, near 0.17/0.05/0.035) plus a thin
   chrome or brass edge strip along the arch where front, top and side meet.
3. Jukebox title window: JAMS 3.2 to about 1.8, window glass 0.40 to about 0.7 (amber window, not white label).
4. Jukebox floor light: one pink-led pool front-left; teal spot halved or dropped; tighter cone, carpet only.
5. Delete `P91 tv shelf bracket`.
6. Optional: a charcoal mask around the TV screen (cabinet stays beige), so it reads as a TV, not a monitor.
