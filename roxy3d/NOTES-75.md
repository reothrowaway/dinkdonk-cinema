# Brief 75: shared-queue multi-pod helper

7 Nov 2026. **Complete locally. No pods, RunPod API calls, downloads or spend.**
`godot-spike/` was not touched. Writes are limited to `cloud/` and this note;
this note replaces a PROGRESS.md entry because the brief restricts writes.

`cloud/cloud-render.sh.pre75` is the byte-exact backup. Removing the new nine-line
dispatcher reproduces it exactly: existing `full`, `smoke` and `fetch` code is
unchanged. New files: `cloud-multi.sh`, `multi.py`, `multi_queue.py`,
`multi_blender.py`, `multi_boot.sh`, `multi_launch.sh`, and three test runners.
The sealed Brief 67/68 archive is unchanged; the adapter is uploaded alongside it.

## Commands

From `roxy3d/` in Git Bash. The wrapper uses the existing Blender Python on this
PC; elsewhere supply Python 3.12+ through `MULTI_PYTHON` if needed.

Offline demonstration, safe to run now:

```bash
DRY_RUN=1 PODS=5 FLY_MODE=final \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-68.tar.gz" \
bash cloud/cloud-render.sh multi
```

This exercises placement against synthetic stock without constructing a live
provider or calling CLI/SSH. `INVENTORY=path.json` supplies another stock fixture.

Future final, **only after owner authorization to spend**; not executed:

```bash
PODS=5 FLY_MODE=final \
ARCHIVE="$PWD/cloud/roxy-cloud-bundle-68.tar.gz" \
OUTDIR="$PWD/cloud/final75-result" \
bash cloud/cloud-render.sh multi
```

```bash
bash cloud/cloud-render.sh peek 6
FETCH_MODE=full bash cloud/cloud-render.sh peek 6  # explicit legacy peek
MULTI_RESUME=1 bash cloud/cloud-render.sh multi
bash cloud/cloud-render.sh multi-cleanup
```

Peek automatically selects existing multi state; `PEEK_DEST` overrides its local
folder. It never provisions a reader pod. `OUTDIR` must be new/empty and is never
cleared. Resume remembers it or accepts a fresh `OUTDIR` after failed extraction.
`MULTI_STATE` overrides `cloud/cloud-state-multi.json`. Cleanup/recovery refuses
an actively locked state: stop that local helper first. Peek can run alongside it.

## How it works and fails safely

- **Placement:** default five workers, one GPU each, one 20 GB network volume.
  Preference: 4090, 5090, L40S, RTX A6000, 3090; override `GPUS` or `PIN_DC`.
  Centers rank by numeric capacity when supplied, otherwise stock diversity.
  Categorical stock cannot guarantee five slots; actual creates determine capacity.
  It reports fewer workers when necessary, down to one. Empty unused volumes are
  removed before trying another center. Other bundle contracts fail preflight.
- **Queue/resume:** eight selected frames per chunk (`CHUNK`), atomic renames and
  kernel locks. Draft keeps odd timeline frames. Claims heartbeat within a
  180-second lease (`LEASE_SECONDS`). Reclaim requires both expiry and a released
  writer lock; a stalled live writer stays fenced until its watchdog stops it.
  Verified color/depth pairs are skipped. Production render settings are unchanged.
- **Completion:** one idle worker remains to reclaim dead workers; others retire.
  One coordinator rechecks all pairs, repairs missing/corrupt frames, then runs
  the existing encode/package function. The helper downloads and verifies the
  archive, every color/depth hash, timeline order, paths and VP9 payload. Its log
  shows frames done/total, per-GPU frames/minute and ETA, excluding encode/transfer.
- **Independent shutdown:** the creation command embeds a guardian before SSH or
  upload. Defaults: 30-minute startup cap (`BOOT_MIN`), six-hour lifetime cap
  (`MAX_HOURS`), process-death detection, 30-second idle/failure grace, 20-minute
  post-success collection grace. Failed stop requests retry. Ctrl-C/TERM also
  attempts immediate reachable-pod cleanup. A killed local helper cannot kill
  these remote guardians. Base-image `/start.sh` supplies SSH/pod-local CLI setup;
  no account key is copied into files.
- **Recovery/cleanup:** unique names are saved before creating resources; exact-name
  enumeration recovers lost create responses. Unconfirmed requests retain state
  for reconciliation/manual inspection. Resume reuses live workers, or creates
  replacements on the existing volume after old workers stop/disappear. Unreachable
  running/unknown pods are never deleted; confirmed stopped pods can be removed,
  matching existing recovery behavior. The volume is deleted only after every pod
  is gone and the local archive is rechecked. Download/delete failures return an
  error and preserve state. Cleanup keeps uncollected results; recover them first.

Credit guard: max of $5, `PODS * ESTIMATE_HOURS * GPU_HOURLY_ESTIMATE * 1.25 + $0.50`,
and `MIN_BALANCE`. Defaults are `max(1.5, 4/PODS)` hours and $1.25/GPU-hour:
**$12.22 for five; $6.75 for one**. Missing balance fails closed. This is a planning
reserve, not a hard dollar cap; the guardians separately bound worker duration.

## Local verification and limits

- [Five-worker fault tests](cloud/qa75/offline-tests.json): 48 PNGs at 32x18;
  crash after commit, timeout/reclaim, live-writer fencing, zero duplicate renders,
  resume, single finalization, finalizer failure and corrupt-frame repair. Also
  mixed placement, 1-of-5 fallback, credit refusal, lost-create recovery, cleanup
  safeguards, and propagation of download/cleanup errors.
- [Three-worker Blender smoke](cloud/qa75/blender-smoke.json): extracted Brief 68
  bundle, eight 160x90 / 4-sample frames **per mode**, both scenes, regression and
  endpoint/boundary frames. VP9 30/15 fps; all eight decoded per mode; maximum
  mean RGB error **2.513264/255**. Archive/color/depth read-back passed; resume
  preserved PNG bytes and mtimes. Latest runs isolate worker caches. Logs retain
  unavailable-HIP discovery warnings on this NVIDIA laptop; no worker failed.
- [Guardian tests](cloud/qa75/guardian-tests.txt): abandoned upload, idle, failure
  and completion each issued one mocked stop. Git Bash substitutes an immediate-exit
  wrapper for missing `setsid`; Linux process-group shutdown was not runtime-tested.
- [Provisioning dry-run](cloud/qa75/provision-dry-run.txt): two 4090s, two 5090s,
  one L40S and one simulated volume. [Syntax/backup checks](cloud/qa75/verification.json)
  passed. Runners: `test_multi75.py`, `smoke_multi75.py`, `test_boot75.sh` in `cloud/`.

**Not live-tested:** Linux provisioning, NFS locking, mixed physical GPUs, remote
transfer, pod credentials and provider shutdown. Guardians require a booted
container and working stop API; never-booting pods/provider outages still require
recovery inspection. The image must retain `/start.sh`, `setsid`, `timeout` and
pod-local runpodctl. References: RunPod's [shared volumes](https://docs.runpod.io/pods/storage/types)
and [lifecycle commands](https://docs.runpod.io/runpodctl/reference/runpodctl-remove-pods).
Actual flags were checked against the installed CLI's local help.

## Estimate: 1,504-frame final

Based on NOTES-67's one-4090 estimate, not this laptop smoke as a cloud benchmark:

| Setup | Render time | Including startup, encode, transfer | Assumed GPU cost |
|---|---|---|---|
| One 4090 | 2.7-3.2 h | 3-4 h | about $2.70-5 |
| Five mixed GPUs | 0.5-0.9 h | 0.8-1.5 h | about $4-7 |

Planning assumptions: $0.90-1.25/GPU-hour and 3.5-5.5 combined 4090-equivalents;
**not current price quotes**. Early retirement limits idle cost. Five cold starts,
shared storage and one serial encoder prevent guaranteed 5x gains. Slow GPUs,
capacity/transfer limits or long initialization can exceed these ranges; storage
is extra. No protected-file hash audit, computer use, live art change, commit or push.

STATUS: COMPLETE - MULTI HELPER, QUEUE, RECOVERY/CLEANUP, PEEK, OFFLINE PLAN,
FIVE-WORKER FAULT TESTS AND THREE-WORKER BLENDER SMOKES DELIVERED;
LIVE RUNPOD VALIDATION NOT PERFORMED; NO PODS OR SPEND.
