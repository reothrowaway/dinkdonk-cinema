Completed Brief 65. The production copies, five 1080p look checks, depth outputs, and verified cloud bundle are ready.

- [NOTES-65.md](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-65.md) — results, timings, depth format, and exact full/split/peek/fetch commands.
- [Cloud bundle](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/cloud/roxy-cloud-bundle-65.tar.gz) — 30.0 MB, with [SHA-256 checksum](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/cloud/roxy-cloud-bundle-65.tar.gz.sha256).
- [Opening comparison](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/prod/compare_A0001_live-left_production-right.png) and [mid-dive look check](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/prod/lookcheck_A0350.png).

The approved v6 animation is preserved. Production uses animated falling rain, a **1.25-frame shutter**, and **128 maximum samples with OptiX denoising**. Mean RGB differences are **1.87/255** against the live lobby and **0.54/255** against auditorium draft 13.

Local smoke, resume, depth, VP9 decode, and archive checks passed. All **39,114 protected files** remained unchanged. Only `peek` was added to the cloud helper; its existing safeguards remain intact.

**Cloud handoff needs a 20 GB network volume.** The notes include the expansion command and a **4–5 billed-hour estimate on one RTX 4090**. No pod, cloud run, or full animation render was started.

STATUS: COMPLETE — ready for Claude’s cloud run; STOP.