Route v5 is ready in `godot-spike/run-live.bat`.

- **Handoff lighting:** component QA identified shadow-edge spikes and a broader GI/fog shift; SSR contributes little. Smooth shadow-opacity easing reduced the sampled projection-switch peak from **93.6 to 31.9/255**. Some GI/fog difference remains.
- **Screen 1:** padded leaves and hardware swing rigidly on their hinges; the curtain parts using v7 animation. Doors finish opening at **35.40 s**, before the camera crosses at **36.27 s**, then the camera enters black depth.
- **Auditorium:** added draft-13 geometry, seats, screen, padded tunnel and warm lighting. The live viewer plays and scrubs the full **50.13 s A+B timeline**, with a dark cut at **36.667 s**. Free fly works in both rooms. The final hold uses the exact live auditorium plate over the exact orthographic camera pose.
- **QA passes:** no part-B speed swings, one continuous height rise, and no stillness beyond the final hold. Full-timeline yaw reversals: **14.784 s R→L, 26.359 s L→R, 34.190 s R→L, 43.189 s R→L**; none in 0–9 s. Offscreen startup exits **0**.

Updated [NOTES-godot.md](/C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-godot.md) and [FINAL-CHECKLIST.md](/C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/godot-spike/FINAL-CHECKLIST.md). No preview video rendered; appearance awaits live review.

STATUS: COMPLETE — IMPLEMENTATION AND QA FINISHED; STOP.