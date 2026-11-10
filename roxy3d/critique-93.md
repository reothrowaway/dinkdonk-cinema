# Critique 93: draft 31, lobby props fix round (claw machine, jukebox, TV)

10 Nov 2026. Read-only second opinion (Claude Fable 5.2). `qa10/draft31-props.png` against draft 30 at stream size
and in the insets, enlarged side by side and measured against draft 29. Positions, sizes and the TV are fixed.

**Verdict: good enough. Draft 31 can go to the layer render as it is. No further draft needed. All five points
are done; nothing got worse. Three small optional touches below can ride along in the layer-render brief.**

## The five points
1. **Claw header against the marquee: fixed.** Header bulbs at stream size went from marquee-like 245/210/184 to
   small amber dots near 194/129/82; the marquee's own bulbs stay white-hot, so the two no longer read as one row.
   The pink is stronger (ends and roundel 164/48/73 to 191/59/99). Leftover: the cream lettering (unchanged,
   230/219/203) is still the largest and lightest part, 186 cream px against 104 pink, so it reads as a cream sign
   with pink ends rather than a pink sign. It is its own sign now, which was the point.
2. **Jukebox body: fixed at stream size.** East side 45/8/13 against the bar end's 1/0/0: a dark cherry cabinet
   with a rounded shoulder, clearly a box standing in front of the bar. Leftover: the crown still has the
   worktop's lilac (160/146/163 against 151/140/154); the side and the strip now carry the separation instead.
3. **Title window: fixed.** 225/179/132 at its center (draft 30: 243/236/226) with an orange frame line; an
   apricot-amber window, no white pixel. It is no longer the brightest spot in that corner; the pink arch is.
4. **Floor pool: fixed.** One soft magenta oval front-left, carpet 59/44/79 to 107/48/99, no blue-grey left. It
   stops short of the wet edge and the bar end; its left edge tucks behind the standee, which reads naturally.
5. **Shelf bracket: gone**, by the build record (`verification93.json`: bracket absent, TV otherwise identical).
   Not visible either way: the TV region differs from draft 30 by 0.3 levels on average (render noise).

## Did the fixes make anything worse?
- **Flat emission on the body: no at stream size, slightly in the inset.** Not self-lit: 45/8/13 is the level of
   the plant pot's shadow side (31/9/8), not a glow. But it is one flat value (within 2 levels over the whole
   side), next to a pot with real shading, so on a director zoom-in it reads as a matte panel: unshaded, not pasted.
- **Brass strip: harmless.** In the inset an olive-gold band on the arch, a dark seam down the east edge. At
   stream size it is a 3-4 px pale grey fleck on the crown (213/211/202), a rim highlight rather than brass.
- **Single stronger pool: fine.** Peak as draft 30's pink (118/54/102 against 111/41/94), only larger and even.
   The most saturated patch on the carpet, but not too strong, and as an additive piece the page can dim it.
- **Amber-on-amber JAMS: acceptable.** Unreadable at stream size in both drafts (9 x 4 px); in the inset it is
   legible but soft. Do not chase it: brighter letters go white again, dark letters would brown the window.
- **Key strip: fine.** 206/197/185, one pixel high; it now separates the window from the grille and reads as a
   key row. Leave it.

## Optional, in order of gain (none worth another draft; fold into the layer-render brief or skip)
1. Jukebox side: turn the flat self-color into a top-to-bottom falloff (about 0.28 at the shoulder to 0.12 at the
   floor) so zoom-ins show a shaded cabinet, not a matte panel. Stream-size read barely changes.
2. Claw lettering 3.4 to about 2.4, so the pink face carries the header instead of the cream letters.
3. Brass strip roughness 0.32 to about 0.5 (or a slightly darker gold), so the crown fleck stays gold, not gray.

Not checked: the page, real chat figures at the props, the pack's glass sprite over the claw machine, animation.
