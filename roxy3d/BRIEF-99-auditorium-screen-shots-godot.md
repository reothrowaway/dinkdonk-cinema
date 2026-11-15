# Brief 99 - Three auditorium screen transitions, Godot stage (14 Nov 2026)

Owner, 14 Nov 2026: "we will add three additional transitions, small ones. I will need to check each on Godot like we
always do." This brief is the **Godot stage only**: three short camera moves in the auditorium, viewable in the live
viewer. No Cycles render, no video, no cloud, no page changes.

Render agent: Claude Fable 5.2, high effort (new camera shots in the Godot scene). Read first: `godot-spike/WORKFLOW.md`,
`godot-spike/README.md`, `NOTES-godot.md` (bottom: versions 97 / 97b), `NOTES-97.md`. How the owner reviews: **he
watches in the live viewer, no preview videos**. Camera rules: no yaw back-and-forth, turns are single smooth arcs,
ease in and out, no speed swings (`tools/qa-fly/campath.py`). Start and end frames that are live page views must match
those views exactly.

## The three shots (owner's answers, 14 Nov)

All with the **house lights down** (the page's dim state: match `qa11/cinema_draft_14_dim.png` at the plate pose, as
97b matched `cinema_draft_14.png` for the lit room). The film is playing on the screen throughout.

1. **T1 - zoomed Film shot -> full screen.** Starts on the live page's Film framing: the default auditorium pose (the
   v97 end pose = `cinema_draft_14.png` plate) zoomed in the way `auditorium.html` `screenShot()` does it: centre =
   the centre of the screen polygon's bounding box in plate pixels, zoom = `min(1920/w, 1080/h) * 0.94` clamped 1-3
   (a 2D zoom of the plate; reproduce it exactly, e.g. a smaller orthographic size / lens shift on the plate camera -
   check which projection the end pose uses). Ends with the camera **square-on to the screen and the screen
   (`qa11/cinema_layout_14.json` "screen", physical_aspect 16:9) filling the 16:9 frame exactly, edge to edge**, so
   OBS can cut to the fullscreen movie scene with no jump. The iso-to-square-on turn is one smooth arc
   (the fly-through opening's ortho->perspective handover is the model for the projection change). Length ~4 s.
2. **T2 - full screen -> over-the-heads angle.** Starts exactly where T1 ends (screen fills the frame). Pulls back to a
   **new 3D angle: low, behind the back rows, looking past the audience's heads at the lit screen**; the screen stays
   big in frame, the back half of the house shows. The owner chose this angle from options; you choose the exact pose
   (sensible lens, heads in the lower part of the frame, screen not cut off). **The camera holds there** - in the real
   show it stays on this view for as long as the streamer wants (chatters keep moving in it) until a button starts T3.
   So make the hold pose a clean still view (no drifting). Length ~5 s.
3. **T3 - over-the-heads angle -> default view.** From the T2 hold pose back to the **default auditorium pose** (the
   v97 end pose / plate, unzoomed), lights **stay down**. One smooth move. Length ~5-6 s.

Lengths are starting values; the owner will tune them.

## Audience stand-ins
The chatters are drawn by the page, so the Godot seats are empty. To judge T2's angle, add simple **grey stand-in
heads/torsos** in the seats (seat positions from `qa11/cinema_layout_14.json`), roughly half the house filled, clearly
plain shapes. Key **H** hides them. They are only a framing aid; they are not part of the look.

## Screen content
Put a placeholder picture on the screen (lit/emissive like the film, e.g. a neutral test picture with a thin bright
border at the screen's edge) so the owner can see that T1 lands with the screen exactly filling the frame. Keep the
screen's light on the room as the lights-down art has it (no new light design).

## Viewer
- New launcher `godot-spike/run-live-aud.bat` (keep `run-live.bat` = the fly-through unchanged). Opens a new scene
  (e.g. `main_aud99.tscn`, reusing the v97 auditorium assets `assets_v97_B/` and the v97 look/lighting code; copy and
  adapt files rather than editing the v97 ones).
- Keys: **1 / 2 / 3** play T1 / T2 / T3 from their start pose and hold on the end pose; **Space** replays the current
  shot; a scrub/progress bar per shot as in the fly viewer; **Tab** free fly; **H** stand-ins; **P** in free fly
  saves the current camera as the new T2 hold pose (written to a small JSON the shots read, so T2 and T3 follow it on
  the next play) and prints it. Keys shown on screen as usual.
- Shots go into a camera-path JSON per shot in the same format as `assets_v97/camera_path.json` (Blender coordinates),
  so the approved version ports to Blender/Cycles like the fly-through did.

## Checks
- `campath.py` (or equivalent) on all three paths: no yaw reversal, no speed swing; report max turn rate.
- Start/end checks: T1 start vs the zoomed Film framing of the dim plate (compare a Godot still crop with the plate
  crop, as 97b did with numbers); T1 end: screen corners projected to the frame corners (report the pixel error);
  T3 end vs the dim plate at the default pose; T2 end == T3 start and T1 end == T2 start exactly.
- Clearance: the T2 path and hold pose do not pass through seats, rails, walls or the stand-ins.
- Start the viewer offscreen with `--quit-after` like 97 did, exit 0, each shot played once without script errors.

## Write
`NOTES-99.md`: what was built, the chosen T2 pose (numbers), shot lengths, check results, how to open it, what is
left for the Cycles final (and for the page later: the T2 hold view will need its own dim plate with depth for the
chatters, like the fly-through's depth - not part of this brief). Add a few lines to `NOTES-godot.md`. End with a
STATUS line.

## Rules
Write only inside `roxy3d/` (new files; never modify live packs `out10*`, `qa11/` files, pages, `shared/`,
`fly/transition/`, existing source .blend files or the v97 Godot files - copy them). Local RTX 3050, one Blender/Godot
job at a time (check `tasklist` first), no cloud, no downloads, no computer use (the viewer only offscreen/headless for
checks), no commit. Then stop.
