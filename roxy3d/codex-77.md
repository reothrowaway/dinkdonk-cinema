Implemented Brief 77. Changed files have `.pre77` backups; handoff is in [NOTES-77.md](C:/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/NOTES-77.md).

- Auto-tunes from two workers toward four, bounded by GPU utilization, measured VRAM and CPU capacity; supports fixed `WORKERS=N`.
- Guardian covers the supervisor and every worker group, with collection grace after any worker finalizes.
- Helper tracks top-ups, replacements and reader pods through collection and cleanup.
- Adds per-pod telemetry and isolated, full-quality `FRAMES` tests.

Passed **12 offline tests**, the Brief 75 fault suite, **six mocked guardian cases**, and a **two-worker Blender smoke** with encode/depth verification and resume. Live utilization and Linux/NFS behavior remain untested this round.

Future one-pod test, from `roxy3d` in Git Bash:

```bash
PODS=1 WORKERS=auto MAX_WORKERS=4 FRAMES=1100-1160 FLY_MODE=final \
CHUNK=1 MAX_HOURS=0.25 BOOT_MIN=10 ESTIMATE_HOURS=0.25 \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-76.tar.gz" \
MULTI_STATE="$PWD/cloud/cloud-state-77-test.json" \
OUTDIR="$PWD/cloud/result77-test" \
bash cloud/cloud-render.sh multi
```

Future five-pod final:

```bash
PODS=5 WORKERS=auto MAX_WORKERS=4 FRAMES= FLY_MODE=final \
MAX_HOURS=1.5 BOOT_MIN=10 ESTIMATE_HOURS=0.75 \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-76.tar.gz" \
MULTI_STATE="$PWD/cloud/cloud-state-77-final.json" \
OUTDIR="$PWD/cloud/result77-final" \
bash cloud/cloud-render.sh multi
```

Neither command was run.

STATUS: COMPLETE — TOOLING AND LOCAL CHECKS READY; NO PODS OR SPEND; STOP.