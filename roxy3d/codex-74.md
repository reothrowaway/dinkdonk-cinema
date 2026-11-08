Fixed the opening with camera changes limited to **part-A frames 2–180**.

- Exact first frame retained. The ortho pull-back now has one smooth speed ramp; the fly-in uses one shared progress curve.
- `screenspeed.py 1 200`: **no speed turns reported**. One broad peak of **33.77 px/frame at frame 140**, easing to **15.78 at frame 181**.
- The 3.0 s handoff still matches within **0.546 px**, with tight clipping. Frame-181 velocity matches within **0.003%** numerically.
- **Byte comparison passed:** all 1,324 frames from 181 onward, including part B, plus the bus, door/curtain tracks, lighting and runtime scripts are unchanged.
- `campath.py`: no yaw reversals in 0–9 s and no new stillness. Offscreen live startup exited **0**. No video rendered.

Full screen-speed output is appended to [NOTES-godot.md](/C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-godot.md).

STATUS: COMPLETE — OPENING CORRECTION AND REQUIRED CHECKS PASS; STOP.