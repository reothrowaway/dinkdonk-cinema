Started the detached local RTX 3050 job with **two workers**. **31/1504 frames** were complete at the last check, with no failure reported. Estimated runtime: **2–3 hours**. It resumes existing frames and writes `DONE` only after all 1504 files pass validation.

All 11 smoke frames rendered successfully. **Strict equality with the old depth does not pass:** the old capture used motion blur, while this brief requires the central pose. Controls rendered at the same pose showed **zero median and p99 error on unchanged opaque pixels**.

- [Notes, exclusions, measurements, and restart commands](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-78.md)
- [Frame 560 diagnostic](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/v8-depth78/diagnostic-00560.png)
- [Live progress](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/v8-depth78/progress.json)

**STATUS: RUNNING — background render started; comparison caveat documented; stopping as requested.**