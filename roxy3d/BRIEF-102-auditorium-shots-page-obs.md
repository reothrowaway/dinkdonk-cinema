# Brief 102 - Auditorium screen shots: page player, control buttons, OBS green key (QA) (15 Nov 2026)

The three auditorium transitions are rendered (Brief 101, `NOTES-101.md`; final in
`roxy3d/aud101/cloud-final-result/aud101-final/`). Owner, 14 Nov: "Yes go ahead" to setting up the OBS green key and the
page player. Owner's choice for the film: **OBS keys the film on the green** (the film shows only where the video is
`#00ff00`, so the seat backs that cross the screen in T2 stay in front of it).

Agent: Claude Opus 5.5, high effort (page work, not art). **Everything in QA copies; nothing goes live in this brief.**

## The show flow to build
1. Film phase, lights down, the auditorium page on its zoomed Film shot (director push). The film is on the screen.
2. **T1 "Into the film"** (8 s): the page plays T1 (from exactly the Film framing to the screen filling the frame).
   The film stays on the screen through the move (per-frame corners). At T1's last frame OBS cuts to a **fullscreen
   film scene** (the film alone, filling the canvas). If the page camera is not on the Film framing when T1 is asked
   for, ease it there first (or say so on the panel), so frame 1 matches.
3. **T2 "Out of the film"** (10 s): OBS cuts back to the auditorium scene, which shows T2's frame 1 (all green = the
   film full frame, no jump), then T2 plays to the over-the-heads view and **holds** there: the 4K hold plate
   (`hold/hold_t2.png`, `@2x`) with the seated chatters drawn in, live, as long as the streamer wants.
4. **T3 "Back to the room"** (11 s): from the hold to the default view; its last frame is the page's own dim plate,
   then the page carries on live (lights still down, wide shot).

## Do
1. **Pack** the final for the page: `roxy3d/aud101/build_page101.py --src roxy3d/aud101/cloud-final-result/aud101-final
   --label final` (Blender's Python; read its header). Check `report.json`. Stage the pack where the QA page loads it
   (new folder, e.g. `roxy3d/aud101/page/final/`); keep the corner files with it.
2. **Player in `auditorium-qa.html`** (with a new `shared/aud-shots-qa.js`, modelled on `shared/transition.js`, the
   fly-through's WebGL player: packed colour + depth video, per-frame camera, real chatters drawn in with depth
   occlusion). Draw the chatters who are seated in the auditorium (and anyone walking, if sensible) through each
   frame's camera, occluded by the video's depth, emotes animating, the auditorium's name rules where they fit. The
   video's green area must stay exact `#00ff00` (no tint, glow, dust or beam over it) so OBS can key it. In the T2 hold,
   the hold plate + its depth replace the video, chatters keep living (sit, hop when they type, leave, arrive).
3. **Control buttons in `control-qa.html`**: "Into the film (T1)", "Out of the film (T2)", "Back to the room (T3)",
   enabled only when they make sense (T2 after T1, T3 after T2), each sending a command to the auditorium page.
4. **OBS bridge (`obs-bridge-qa.js`)**: send the film's corners per video frame (from `t1|t2|t3_screen_corners.json`,
   in sync with the frame the page actually shows), cut to the fullscreen film scene at T1's end and back to the
   auditorium scene for T2 (Cut, then restore the usual transition, as `/cut-to-cinema` does). Latest-only updates as
   now.
5. **OBS setup, test copy only**: in the portable QA OBS (`roxy3d/qa-night/obs-portable`, see memory notes in
   `NOTES-godot.md`/`transition-obs-recording`: start command, websocket 4466, spare server `STANDBY_PORT=18771`):
   the film source **under** the auditorium browser source, corner-pinned by the bridge, and a key on the browser
   source that removes exactly `#00ff00` (a Color Key with the smallest similarity that removes the green cleanly,
   so green emotes such as Pepe are NOT keyed: test with real chat emotes). A fullscreen film scene. Then write the
   same changes into a **new copy** of the owner's collection JSON (`%APPDATA%\obs-studio\basic\scenes`, copy of
   "Moobies 1440p", new name e.g. "Moobies 1440p transitions"); never edit the owner's loaded collection; say in the
   notes what he has to switch to and what changed.
6. **Test with real chat** (`?everyone=1`, relay 18765; never `demo=1`): on 18771 with the QA pages, run T1 -> T2 ->
   hold -> T3 in the portable OBS with a stand-in film (any local video file already on the PC that the owner's setup
   uses, or a generated test pattern; no downloads) and **record it** with `roxy3d/qa-night/tools/obs-rec-fly.mjs` or
   an adapted copy (memory rule: after transition changes, record in the portable OBS and send the video). Check the
   recording by decoding frames: film on the screen during the moves, seat backs in front of the film in T2, no
   green fringe, no jump at the cuts, chatters present, T3 lands on the live page. Keep the file under 30 MB.

## Rules (hard)
- **QA only**: `auditorium-qa.html`, `control-qa.html`, `obs-bridge-qa.js`, new `shared/*-qa.js` files. Never edit
  `auditorium.html`, `control.html`, `lobby*.html`, `obs-bridge.js`, `standby-server.js`, or existing `shared/*.js` live
  files. The QA copies differ from live already (other work may be in them): read `git diff` / `diff` first, keep
  that work, and check for signs of another agent editing them (very recent mtimes) before you start.
- Shared JS: write new files; run `node --check` on every JS file you touch.
- Never stop or restart the server on **18770** or the owner's OBS; never touch his loaded collection. Test servers on
  18771 (stop by exact PID afterwards, no tree kill). Headless browsers only via the project's edgeguard
  (`close-test-browsers`), none left running. No visible windows on the owner's screen (portable OBS minimized to tray
  as its start command does; no computer use).
- Real chat only. Keep the full render resolution. No commit, no push, no deploy, no zip in this brief.
- Write notes to `roxy3d/NOTES-102.md` (what was built, how to test, the recording path, the OBS copy's name and the
  exact steps for the owner, what is not verified), log a few lines in `roxy3d/PROGRESS.md`, end with a STATUS line.
