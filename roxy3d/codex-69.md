Completed [NOTES-69.md](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-69.md) and the isolated Godot project.

- [10-second 1080p30 MP4](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/godot-spike/flythrough_piece_1080p30.mp4)
- [Cycles vs. Godot still](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/godot-spike/compare_still.png)
- [Three matching moments](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/godot-spike/compare_frames.png)
- [Project and reproduction instructions](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/godot-spike/README.md)

**Timing:** 6 min 54 s for Godot capture, including subframes and PNG writes; **10 min 15 s** including shutter averaging and MP4 encoding. The same pipeline projects to roughly **49 minutes for 50 seconds**, with the auditorium still unmeasured. PNG processing dominates; GPU rendering averaged 36.56 ms per subframe.

**Recommendation:** continue with a focused material and lighting pass. Geometry, camera alignment, signage and the bus route transfer well. Wet reflections, glass, soft lighting and blur smoothness remain visibly below Cycles quality.

All 300 MP4 frames decoded successfully, and the five primary input hashes remained unchanged. No cloud or live assets were changed.

Native-player playback remains unverified: automatic approval review blocked Chrome History access to protect unrelated browsing data, and VLC access was not approved. Full-file decoding and image inspection were completed instead.