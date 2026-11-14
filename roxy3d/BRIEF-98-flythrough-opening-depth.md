# Brief 98 - Fly-through: depth of the opening frames (14 Nov 2026)

Owner, 14 Nov 2026: "on the first seconds of the video, all emotes disappear, they only show up after the bus part".
The live fly-through (`fly/transition/transition.webm` + `transition-camera.json`, built by
`fly/v10/build_transition97.py` from the Brief 97 final `fly/v10/cloud-final-result/flythrough67-final/`) draws the
chatters as cards and hides them with the per-frame depth tiles. In **global frames 1-87** (part A, the high wide
shot down to the swoop) that depth is wrong.

## What is wrong (measured by the page agent)
- `frames.json` receipts, frames 1-87: depth `max_z - min_z` is only 2.8 units, the whole frame one flat surface about
  11 units past `near` (frame 1: near 18824.57, surface 18835.9-18838.7, while the lobby itself is ~18977-18980 from
  the camera). From frame 88 the depth is real (span 23+ units). Example: frame 20 coarse Q = 10 everywhere.
- Most likely cause: in these frames the camera is **outside the sky dome**. `build_port97.py` made the dome's outside
  face transparent to camera rays for the colour, but the depth pass (second 1-sample pass, `depth_pass.py`) still
  hits it. Confirm this (or find the real cause) before fixing.
- Frames 1096-1100 are also flat (span ~0, 0.4 units from the lens: the black cut through the door). Report what it
  is; change it only if it is the same bug and the cards there should be visible.

## Do
1. Re-render **only the depth** of global frames 1-87 of part A from `fly/v10/production_A.blend` (open a copy, never
   save over it) with the same camera, resolution 1920x1080 and the same opaque-depth policy (Brief 78: opaque
   surfaces at the central pose, no shutter; glass, rain, water and transparent layers not seen), with the dome (or
   whatever the cause is) not seen. Same 16-bit code format as the final (`camera_z = near + value/65534*(far-near)`,
   65535 = none), and per-frame near/far chosen so the real lobby fits (record them, as the receipts do). Local RTX 3050,
   one Blender job at a time; no cloud. Colour is NOT re-rendered.
2. Check the new depth: per-frame min/max/valid fraction; frame 87 -> 88 must join smoothly with the existing depth
   (no jump in the lobby's depth); frame 1 must match the live isometric pose (a chatter's foot spot projects onto the
   floor's depth).
3. Rebuild the packed video in a **new staging folder** `fly/transition98/` (copy `build_transition97.py` to a new
   script that takes the final's colour PNGs and depth unchanged except frames 1-87 replaced; the camera file must have
   the new near/far for those frames). Colour must be byte-identical in source; same VP9 settings as Brief 97.
4. Verify: decode a few packed frames (e.g. 1, 20, 45, 70, 87, 88, 100, 600, 1300) and compare coarse/fine depth with
   the source; the rest of the video unchanged in content.
5. Write `NOTES-98.md`: cause, what was re-rendered, the checks, timings. End with a STATUS line.

## Rules
Write only inside `roxy3d/` (new files and folders only). Never modify `fly/transition/` (live), `fly/transition97/`,
`fly/v10/production_*.blend`, `fly/v10/cloud-final-result/`, `out10*`, `qa11/`, pages or `shared/`. Disk has ~24 GB
free: keep temporary output small and delete your own temporaries at the end. No computer use, no cloud, no commit.
The page agent (Opus) does the page test, promotion and shipping afterwards. Then stop.
