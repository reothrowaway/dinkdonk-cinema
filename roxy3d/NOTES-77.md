# Brief 77 — GPU workers and pod ownership

7 Nov 2026. Implemented in `cloud/`; the five changed existing files have
`.pre77` backups. `cloud-render.sh`, bundle 76, art and the live state file are
untouched. No pods, provider calls, downloads, computer use or hash audits.

- New `multi_supervisor.py` is the pod's RUNNING process. Auto starts two
  Blender workers (CPU permitting), samples GPU/VRAM for 20 seconds after frame
  completions, then adds while GPU <90%, projected VRAM <85%, and CPU/MAX_WORKERS
  allow. Default maximum four; `WORKERS=N` fixes the count. Every tuning decision
  is logged. Worker IDs, temporary directories and process groups are separate.
- Guardian waits for the whole supervisor, sees queue SUCCESS from any worker,
  and grants the 20-minute collection grace. Startup/hard caps remain; a local
  fence marker plus TERM/KILL covers all registered worker groups. Sync is bounded.
- Helper retries capacity every 240 seconds below 75% completion, recording
  every create intent first. Missing workers trigger recovery/replacements;
  transient inventory failures preserve the run. With no reachable renderer,
  a guarded cheap reader checks SUCCESS before new rendering is rented. All
  tracked/recovered pods, including EXITED pods and readers, participate in
  cleanup; the volume is deleted only after verified collection.
- Progress every 120 seconds includes per-pod GPU %, VRAM, worker count and
  recent frames/minute. GPU <70% for five minutes after warm-up is logged.
  Kept Claude's byte-stdin CRLF fix and High/Medium/Low stock ranking.
- `FRAMES=a-b` requires full final quality. Tests have separate run/queue/output
  identities and explicit subset metadata; collection rejects a tiny or
  mismatched subset as a final. Resume checks the range too.

Verification: [12 offline tests](cloud/qa77/offline-tests.json), including real
synthetic worker processes scaling to four with mocked GPU readings, a commit/
crash/reclaim and 64/64 frames without duplicate rendering; non-first worker
finalized. The redirected Brief 75 suite also passed (five-worker faults,
fencing, corruption repair, recovery and cleanup). Six Bash guardian cases
passed, including non-first completion/grace, startup hang and hard cap:
`cloud/qa77/guardian-tr104O/`. Stop/group signals were mocked on Windows.

[Local Blender smoke](cloud/qa77/blender-smoke.json): one supervisor, two workers,
eight 160x90/4-sample bundle-76 frames, 30-fps VP9, color/depth archive checks,
all eight decoded (worst mean RGB error 2.367/255), unchanged resume. All workers
exited and COMPLETE was set. Python/Bash syntax and backups checked:
[verification](cloud/qa77/verification.json). No new Linux/NFS, mixed physical
GPU or live utilization claim; the auto policy still needs the authorized test.

Commands below are for Claude/owner later, **from roxy3d in Git Bash**, after
spend approval. Neither was run. Keep test and final state/output paths separate.

One-pod full-quality test, global 1100–1160; allow a few minutes for startup and
tuning, with a 15-minute hard cap:

```bash
PODS=1 WORKERS=auto MAX_WORKERS=4 FRAMES=1100-1160 FLY_MODE=final \
CHUNK=1 MAX_HOURS=0.25 BOOT_MIN=10 ESTIMATE_HOURS=0.25 \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-76.tar.gz" \
MULTI_STATE="$PWD/cloud/cloud-state-77-test.json" \
OUTDIR="$PWD/cloud/result77-test" \
bash cloud/cloud-render.sh multi
```

Five-pod final, same mixed-GPU preference list as Brief 75:

```bash
PODS=5 WORKERS=auto MAX_WORKERS=4 FRAMES= FLY_MODE=final \
MAX_HOURS=1.5 BOOT_MIN=10 ESTIMATE_HOURS=0.75 \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-76.tar.gz" \
MULTI_STATE="$PWD/cloud/cloud-state-77-final.json" \
OUTDIR="$PWD/cloud/result77-final" \
bash cloud/cloud-render.sh multi
```

Initial balance reserve is $5 for this test / about $6.36 for this final command,
not a charge or hard dollar cap. Defaults remain conservative when no estimate
is supplied. Use `MULTI_RESUME=1` with the matching state to recover; `multi-cleanup`
with that state covers every owned pod and retains uncollected volume data.

STATUS: COMPLETE — SUPERVISOR, AUTO-TUNING, TOP-UP/READER RECOVERY, TELEMETRY AND OFFLINE/LOCAL CHECKS READY; NO PODS OR SPEND; STOP.
