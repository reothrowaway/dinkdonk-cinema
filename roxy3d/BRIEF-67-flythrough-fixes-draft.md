# Brief 67: fly-through v7 - fix the owner's six problems, faster settings, 540p/15 fps draft bundle

The owner reviewed the first final render (`fly/prod/cloud-result/flythrough65/`, built from `fly/prod/`, see
NOTES-65.md) on 7 Nov 2026 and found six problems. Claude's automated checks (`tools/qa-fly/campath.py` on
`camera_path.json`, `tools/qa-fly/flash.py` on the frames) confirmed four of them; numbers below are global
frames of that render (A = 1-1100, B = 1101-1625).

1. **Jerky camera:** the speed keeps rising and falling. From A450 to A1020 it swings between about 0.8 and 2.2
   units/s a dozen times. Re-time the whole route for a near-constant speed in each stretch (arc-length
   parameterization), easing only where the move really starts, stops or changes character. No speed oscillation.
2. **Rain glitching outdoors** (by the bus and elsewhere outside). Not yet diagnosed. Inspect consecutive
   full-resolution frames of the old render (for example A470-A520 at the bus and A560-A600 along the facade) and
   find what pops or flickers: drops appearing or disappearing between frames, splash crowns / edge drips
   re-randomized every frame (the pod log said "Topology differs, disabling motion blur for object D10 stateless
   edge drips and impact crowns"), or anything else. Fix the cause so every drop and splash persists and moves
   continuously, with motion blur. Report what it was, with a before/after crop pair.
3. **Grey thing at the auditorium door:** a flat brown-grey panel fills the middle of the frame behind the Screen 1
   doors around A1040-A1065 (see frame 01052.png). Remove it or make that space read as dark depth (black, or the
   parted curtain), so the doorway goes smoothly into darkness.
4. **Camera climbs the tunnel steps:** in part B the camera height rises in three separate steps (about B97-B153)
   like a person walking. It must glide: one smooth height curve through the tunnel and up to the landing.
5. **Too long looking at the screen:** from about global frame 1356 to 1592 the camera barely moves (~8 s at the
   blank screen). Cut that hold to a short beat (about 1-1.5 s), so the turn and the pull back to the final
   auditorium view start much sooner.
6. **Grey flash before the final view:** global frames 1586-1595 are almost empty flat dark grey (the scene drops
   out of view, probably clipping with the far long-lens camera), then it snaps to the auditorium view at 1596.
   Fix the clipping / camera so every frame shows the room, and the switch to the final orthographic view is
   invisible.

Keep everything else that was approved: the v6 route shape (pull back, left arc, dive, bus near-miss, glide,
entrance, lobby S-route, Screen 1, tunnel, auditorium, final exact isometric view), the lower camera, the night
look, falling rain, strong motion blur (1.25-frame shutter), depth pass, exact first and last frame matches.
The total length may drop because of item 5; report it.

## Faster render settings
Apply the optimized Cycles preset from the independent Opus test (`NOTES-66-opus.md`, `fly/speed-opus/variants.py`,
"optA"): falling rain as one geometry-nodes object, light tree off, 64 max / 16 min samples, adaptive threshold
.03, fog seen by camera rays only, persistent data on. Codex's own study is `NOTES-66.md`. Check the look against
the old frames on a few frames and report the difference and time per frame.

## Checks before handing over (required)
Run `tools/qa-fly/campath.py <new camera_path.json> <out.npy>` (Blender's Python:
`../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe`) and report its output. It must show: no speed swings
over 15 % inside moving stretches (only the deliberate eases), no staircase in part B (one rising stretch), no
near-still stretch longer than the intended ~1-1.5 s screen beat besides the opening hold and final hold.
Render a few local test frames around items 2, 3 and 6 at 540p and look at them.

## Draft bundle for the pod (do not run it)
`cloud/roxy-cloud-bundle-67.tar.gz` that renders a **draft**: 960x540, **every other frame** (15 fps), draft
samples (pick a low max with denoising that still shows rain, flashes and objects clearly), same look and motion
blur, writes frames to the network volume as they finish, then encodes `flythrough_draft_540p15.webm`. The same
bundle must also be able to render the **final** (1920x1080, all frames, the optimized preset) with a mode switch,
so the final needs no rebuild. Keep `FRAMES=start-end` splitting and resume. Use `cloud-render.sh` as is (it already
has `peek`); if it needs a change, back it up first (`.pre67`) and keep the credit guard, watchdog and
never-delete-an-unreachable-pod logic. Smoke test locally at tiny resolution. Give Claude the exact commands for
the draft and the final, and the expected pod time for each.

## Deliverables
`fly/v7/` (scenes, scripts, the new `camera_path.json`, `bus_path.json`, QA output, test crops), the bundle +
checksum, `../NOTES-67.md` (what each of the six problems was and how it was fixed, the rain diagnosis with
crops, new length, QA results, settings, timings, commands). STATUS line, stop.

## Rules
Write only inside `roxy3d/fly/v7/`, `roxy3d/cloud/` (bundle and, if needed, the helper with backup) and
`roxy3d/NOTES-67.md`. Never modify `fly/prod/`, the cloud result, `fly/speed*/`, out10/, out10mist/, qa11/, the
source .blend files or any page. No pod, no full-length render locally.
