Implemented route v4.

- Removed the dissolve entirely. The 3.0 s ortho→frustum handoff uses tight clip planes; Godot projection QA measures **0.546 px maximum mismatch** at 1920×1080. Exact first pose retained.
- Opening heading now turns smoothly in one direction. **No yaw reversals in 0–9 s.**
- Later part-A reversals: **14.784 s** right→left, **26.359 s** left→right, **34.190 s** right→left. Unchanged part B: **6.522 s** right→left.
- Banking retained; dive/street speed remains **2.0995–2.1000 units/s**. Independent bus timing is unchanged.
- Live viewer started offscreen with `--quit-after 180`, exit **0**. No script/FOV errors; existing certificate-store and texture-cleanup messages remain. **No preview video rendered.**

Short notes appended to [NOTES-godot.md](/C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-godot.md). Appearance remains for owner review in `run-live.bat`.

STATUS: COMPLETE — ROUTE V4 AND QA FINISHED; STOP.