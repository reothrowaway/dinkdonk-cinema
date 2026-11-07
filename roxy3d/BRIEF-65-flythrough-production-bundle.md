# Brief 65: fly-through production setup - night look, falling rain, cloud bundle, look-check frames

Owner, 6 Nov 2026: v6 (`fly/v6_*`, NOTES-64.md) is approved as the route for a first version. Final render:
**1920x1080, 30 fps** on a RunPod GPU (the owner chose 1080p). Owner's notes:
- "Remember to nail the night aesthetic of the lobby scene."
- "Careful with the rain when doing this fly-by, because some raindrops look frozen in the air." The scene's rain
  is static geometry made for the still (motion came from the baked loops), so a moving camera shows it hanging.
- The owner wants to see the first frames as they render on the pod.

## 1. Production scenes for the fly-through
Work on copies in `fly/prod/` built from the v6 working files (camera, bus, door and curtain animation exactly as v6;
no route changes; remove the preview-only things: scale cards, frame labels, Workbench overrides, preview edge
darkening, 2D lens-drop overlay).
- **Lobby (part A):** the look must match the live lobby (`out10/full.png`, the light/rain loops) at night: same
  Cycles/AgX/glare/exposure/world/fog/neon/wet-material setup as the production scene (`production56.py`,
  NOTES-56/57), so frame 1 looks like the live page. Check frame 1 against `out10/full.png` (side-by-side and a
  difference number) and report it.
- **Rain:** hide the static rain geometry and replace it with animated falling rain for the fly-through: particles
  or instanced streaks falling at a plausible speed in world space, in the area the camera actually sees (street,
  air above it during the dive, beyond the glass), with **Cycles motion blur** so drops read as streaks, plus the
  existing splash/ripple look on the ground if it can animate. No drop may stay still relative to the world.
  Optional: real drops on the lens during the dive, subtle.
- **Auditorium (part B):** the lit draft 13 look; the last frames must match `qa11/cinema_draft_13.png`.
- **Motion blur: strong and clearly visible.** Owner: "I really like motion blur, so that should be really
  explicit." Use a long shutter (start around 1.0 frame, the full 360-degree shutter, and go longer if it still
  reads weak at the fast parts), the same settings for both parts. The dive, the bus pass, turns and the rain must
  show obvious streaking; slow parts may stay fairly sharp. Show it in the look-check frames (pick the mid-dive
  frame at a fast moment) and say which shutter you chose.
- **Samples:** pick settings that hold the production look at 1080p with OptiX denoising; aim for about 5-10 s per
  frame on an RTX 4090. Say what you chose and why.
- **Extra passes per frame** for the page to put live chatters into the video: a depth pass (camera Z) as 16-bit PNG
  with the near/far mapping written down, at the same resolution. Document the format in the notes.

## 2. Local look check (do this before the bundle is final)
Render **4 frames** at 1920x1080 on this PC (RTX 3050) with the final settings: frame 1 (must match the live
lobby), mid-dive (rain falling past the camera), the street glide by the entrance, and mid-lobby. Plus 1 auditorium
frame at the end of part B. Save as `fly/prod/lookcheck_A0001.png` etc. and report time per frame. Nothing else.

## 3. Cloud bundle
- `cloud/roxy-cloud-bundle-65.tar.gz` that renders all 1625 frames (A 1100 + B 525) with resume (skip finished
  frames), writes PNG frames + depth PNGs to the network volume **as they finish, in frame order**, then packs the
  results and encodes `flythrough_1080p30.webm` (VP9, like the existing loops) and a depth video or depth PNG archive.
- Support splitting the frame range across several pods (`FRAMES=start-end`), so it can run on 2-3 pods at once.
- `cloud/cloud-render.sh`: back it up to `cloud-render.sh.pre65` first, then add only a `peek` command that copies the
  newest N finished frames from the running pod to `roxy3d/fly/prod/peek/` without disturbing the render. Keep the
  credit guard, watchdog and never-delete-an-unreachable-pod logic exactly as they are.
- Smoke test locally at tiny resolution (a few frames) to prove the bundle extracts and runs. Do NOT start a pod and
  do NOT run cloud-render.sh; Claude runs it.
- Estimate the pod time and cost for 1625 frames from your look-check timings (3050 -> 4090 ratio from NOTES-56).

## Deliverables
`fly/prod/` (scenes, scripts, look-check PNGs), the bundle + checksum, `../NOTES-65.md` (look match results, rain
method, sample settings, pass formats, look-check timings, pod estimate, the exact commands for Claude: full run,
split run, peek, fetch). STATUS line, stop.

## Rules
Write only inside `roxy3d/` (fly/prod/, cloud/ for the bundle and the helper change, NOTES-65.md). Never modify
out10/, out10mist/, qa11/, the source .blend files, the v1-v6 outputs or any page. No pod, no cloud, no full render.
