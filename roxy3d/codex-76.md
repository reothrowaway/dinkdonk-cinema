Built `fly/v8/` and sealed [roxy-cloud-bundle-76.tar.gz](cloud/roxy-cloud-bundle-76.tar.gz) for **1,504 frames at 1920×1080, 30 fps**. Handoff: [NOTES-76.md](NOTES-76.md).

- Camera, bus and car JSON remain byte-identical to approved Godot inputs.
- Added the car, rolling wheels, lamps and motion blur; preserved mapped door/curtain timing.
- Fixed the enclosing sky blocking the far opening without changing camera clips.
- Passed 35 local 540p checks, camera QA, and legacy/shared-queue smoke tests in both quality modes, including encode, depth packaging and resume.
- Final projection handoff measures up to **1.55 px at 1080p**; the approved path remains unchanged.

SHA-256:

```text
5aea4002af53c9a5597a0ad46a73ca8db34c154e85fb70f432687f23368744dd
```

Future command from `roxy3d` in Git Bash, after spend approval:

```bash
PODS=5 FLY_MODE=final \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-76.tar.gz" \
OUTDIR="$PWD/fly/v8/cloud-final-result" \
bash cloud/cloud-render.sh multi
```

Planning estimate for five mixed GPUs: **0.8–1.5 hours overall, about $4–8 plus storage**. This is based on prior estimates, not a new cloud benchmark. No pods were started.

**STATUS: COMPLETE — V8 PORT AND FINAL BUNDLE READY; NO CLOUD RUN; STOP.**