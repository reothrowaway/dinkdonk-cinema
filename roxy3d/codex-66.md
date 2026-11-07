Completed Brief 66. **I recommend optimized Cycles.**

- **23.3–32.5% faster** on the moving lobby checks, with the original lighting, fog, rain, reflections, resolution, and strong motion blur retained.
- Opening-frame error is **1.866008/255**, matching Brief 65’s **1.866009/255**.
- Estimated 4090 render time: **3.95 hours**, calibrated against the previous **5.22-hour** run. The requested ratio-only estimate is **2.50 hours**; its limitations are documented.
- Eevee was slower overall and lost substantial reflected and indirect lighting. The auditorium endpoint was faster, but visually different.

The full profiling table, settings, timings, estimates, crossfade proposal, and STATUS line are in [NOTES-66.md](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-66.md).

Comparisons: [A0001](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/speed/compare_A0001.png) · [A0350](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/speed/compare_A0350.png) · [A0650](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/speed/compare_A0650.png) · [A0800](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/speed/compare_A0800.png) · [A0850](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/speed/compare_A0850.png) · [B0525](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/fly/speed/compare_B0525.png).

Used **95.3 minutes** of accounted local render/bake time. All six comparisons were inspected, and **40,946 protected files remain unchanged**. No cloud run, full animation, production changes, commit, or push.