# Brief 97 - Fly-through refresh, Godot stage (13 Nov 2026)

Owner, 13 Nov 2026: "we need to redo the transition video, you should first start with the Godot stage so I can see
it." The lobby -> auditorium fly-through (`shared/transition.js` plays `fly/transition/transition.webm`) still shows
the lobby and auditorium of 7 Nov. Since then both changed a lot. This brief is the **Godot stage only**: bring the
Godot fly-through scenes up to date so the owner can watch it in the live viewer. No Cycles render, no video, no cloud.

Render agent: Claude Fable 5.2, high effort (Blender/Godot scene work). Workflow: `godot-spike/WORKFLOW.md`,
`godot-spike/README.md`, `godot-spike/FINAL-CHECKLIST.md`, `NOTES-godot.md` (read first), and the memory of how the
owner reviews: **he watches in the live viewer (`godot-spike/run-live.bat`), no preview videos**; camera rule: no
yaw back-and-forth, turns are single smooth arcs; the start and end frames must match the live stills.

## What changed since the Godot scenes were made (bring all of it in)
Lobby (live art `out10s/`, scene `rerender96/lobby_draft34.blend` = the current source of the whole lobby including
the street marquee, the "Dear Leader" poster and the props; see `NOTES-96.md`, `NOTES-95.md`):
- wet, reflective outside walls, roofs, ledges and alley (Brief 95);
- the DELIVERIES gate at the head of the alley with the EXIT door beside it; no "ABSOLUTE CINEMA" lettering;
- the street marquee "NOW SHOWING" (Brief 83), the "Dear Leader" poster (Brief 86), the jukebox and the breaking-news
  TV (Brief 94), and the claw machine standing where the ORBIT arcade cabinet was (the cabinet is gone, Brief 96);
- the page-drawn items Brief 95/96 baked (skyline, searchlight units, poll projector and screen case, bridge-out
  board, Dogtober poster);
Auditorium: draft 14 = draft 13 + the dim purple entrance corridor behind the entrance door (Brief 90, `NOTES-90.md`,
`corridor_draft.blend` / the draft 14 source named there; live layout `qa11/cinema_layout_14.json`). The route now
enters the auditorium through that corridor, so the camera must come down the corridor and through the door.

## Do
1. Re-export the Godot scene parts from the current sources (`godot-spike/export_scenes_v5.py` reads
   `fly/v7/production_{A,B}.blend`; build updated production scenes from the current lobby and auditorium sources in a
   new folder, e.g. `fly/v8/`, and export to new asset folders, e.g. `godot-spike/assets_v8_A/`, `assets_v8_B/`). Keep
   the look settings the owner accepted (lighting, fog, reflections, rain) unless the new art needs a change; the
   wet walls/roofs should read wet in Godot too.
2. Route: keep the accepted camera route and timing where the geometry allows; adjust only what the changes force
   (the corridor at the auditorium end; anything new in the way, e.g. the marquee canopy or the claw machine). Keep the
   opening (exact live isometric first pose) and the ending (exact live auditorium pose, draft 14 plate) matching the
   live pages. Run the camera-path QA (`tools/qa-fly/campath.py` or the godot-spike QA scripts) on the new route.
3. Make `run-live.bat` open the new version by default (keep the old one reachable, e.g. a second .bat or a flag),
   with the usual HUD, scrubbing, playback and free fly. Check offscreen that it starts and runs (as the README says:
   `run-route-v3.ps1 -Mode live ... -QuitAfter 180` or the current equivalent) — the owner then opens it himself.
4. Write `NOTES-97.md`: what changed in the scenes and the route, what the owner should look at (times on the scrub
   bar), what is not done yet (anything left for the Cycles final), how to open it. End with a STATUS line.

## Rules
Write only inside `roxy3d/` (new folders/files; never modify live packs `out10*`, `qa11/` pack files, pages,
`fly/transition/` delivered video, existing source .blend files — copy them). Local RTX 3050, one Blender/Godot job at a
time (`tasklist`), no cloud, no computer use (do not drive the owner's desktop; the live viewer may be started
offscreen/headless for checks only), no commit. Then stop.
