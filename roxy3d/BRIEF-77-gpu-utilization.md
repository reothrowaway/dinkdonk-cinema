# Brief 77: make the multi-pod renderer use the GPUs fully, and own every pod

The first live `multi` run (v8 final, 7 Nov 2026, see the end of PROGRESS.md) found the tool left the GPUs mostly
idle, and Claude patched the live run by hand. Owner: automate it so every render tries to reach ~100% GPU use.
Build these into `cloud/` (multi.py, multi_boot.sh, multi_launch.sh, multi_queue.py, multi_blender.py; new files OK).

## What the live run showed (measured on RTX 4090 pods, bundle 76, final 1080p)
- One Blender per GPU: GPU busy ~32%, ~107 W; `blender` at 100% of ONE of 32 CPU cores. Receipts: 8.6 s/frame,
  7.2 s in the render call of which ~2.5 s is path tracing; the rest is single-threaded scene/BVH/motion-blur prep.
- Extra Blender workers on the same pod and shared queue (Claude's `cloud/extra_worker76.sh`: copy the running
  worker's environ, new worker name): 2 workers 54-70%, **4 workers 96%** (VRAM 18.4 of 24 GB, ~4.6 GB each).
  The per-chunk kernel locks made this safe; no duplicate frames.
- The boot guardian only watches the original worker: when it retired the pod stopped 30 s later even with extra
  workers mid-chunk, and without the 20-min collection grace if an extra worker did the finalize. Claude's
  `cloud/keeper76.sh` held it off (points RUNNING at a live worker, removes END, touches COMPLETE on SUCCESS).
- Only 2 of 5 pods could be created at start (EU-RO-1 stock "Low"). Claude's `cloud/add_workers76.py` + a 4-minute
  retry loop added 3 more pods on the same volume mid-run, but the helper didn't know them: it deleted its own two
  idle pods, printed "No worker remains" and exited before collecting. Claude collected via an added pod
  (`cloud/fetch76.py`). Two added pods had only been *stopped* (EXITED), still held the volume, and blocked its delete.
- Fixed already by Claude in multi.py (keep, add tests): `run()` sends stdin as bytes (Windows text mode turned LF
  into CRLF and the pod's sha256sum failed every worker); `rank_centers` uses the stock label (High 4 / Medium 2 /
  Low 1) when no count is given, so a High data center wins.

## Build
1. **Several workers per pod, auto-tuned.** A per-pod supervisor (the RUNNING process) starts workers with unique
   names (`<pod>-w1..wN`) and the same env. `WORKERS=auto` (default): start 2; after each worker finishes a frame,
   sample `nvidia-smi` (utilization, memory) for ~20 s; add a worker while GPU busy < 90%, VRAM would stay under
   ~85% (measured per-worker VRAM), and CPU cores allow; cap `MAX_WORKERS` (default 4). Allow a fixed `WORKERS=N`.
   Log every decision. Different GPU types/scenes must work (A6000 48 GB, 3090 24 GB, L40S, 5090).
2. **Guardian/supervisor:** the pod stays up until all its workers exit; COMPLETE whenever SUCCESS.json exists,
   whichever worker finalized; keep hard cap, startup cap and fencing (kill all worker groups at the cap).
3. **Helper owns every pod.** If fewer than PODS workers were created, keep trying every ~4 min to add pods in the
   same data center (same GPU preference list) while the queue is < ~75% done, recording them in the state before
   create (lost-response recovery as now). Retire/cleanup/collect cover all of them. Never exit "No worker remains"
   while chunks are unfinished: create replacements (credit guard applies). Collection works from any live pod; if
   none is live but the volume has SUCCESS, use a cheap reader pod in that data center (as `fetch` does).
   Cleanup removes EXITED pods that still hold the volume, then deletes the volume.
4. **Telemetry:** the progress line every few minutes includes per pod: GPU %, VRAM, worker count, frames/min;
   warn in the log if any pod stays < 70% GPU for 5 minutes after warm-up.
5. **Live-test switch:** `FRAMES=a-b` (subset at full final quality) so Claude can verify auto-tuning on one pod for
   a few minutes cheaply; results go to a separate output and never mix with a real run.

## Verify (no pods, no spend)
Offline tests extending `test_multi75.py` / `smoke_multi75.py` (keep their state in temp dirs, never
`cloud-state-multi.json`): supervisor with mocked `nvidia-smi` readings (add/stop adding, VRAM cap, fixed N),
several workers per pod on the shared queue with crash/reclaim, guardian keeps pod while any worker lives and gets
COMPLETE when a non-first worker finalizes, mid-run pod top-up recorded in state, helper never exits with unfinished
chunks, cleanup with EXITED pods holding the volume, collection via reader pod, CRLF regression, stock ranking.
A small local Blender smoke with 2 workers on this PC at tiny resolution. Syntax checks. Give Claude the exact
live-test command for one pod (`FRAMES` ~1100-1160, about 5 minutes) and the final command.

## Rules (light)
Back up each changed file (`.pre77`). Write only in `roxy3d/cloud/` and `roxy3d/NOTES-77.md`. No pods, no RunPod API
calls, no downloads, no computer use, no hash audits, short notes. End with a STATUS line.
