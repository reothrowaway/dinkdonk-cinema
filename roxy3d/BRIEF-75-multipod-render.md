# Brief 75: final renders across 5 RunPod pods at once (shared work queue, mixed GPUs)

Owner, 7 Nov 2026: final Cycles renders should run on **5 pods at once** to cut waiting time. Mixed GPU types are
fine ("some will finish before others anyway, some frames are heavier"). Workflow context: Godot is the draft, the
approved version is ported to Blender and rendered once with Cycles on RunPod (`godot-spike/WORKFLOW.md`).

Current single-pod tooling: `cloud/cloud-render.sh` (full/fetch/peek; credit guard, watchdog, never deletes an
unreachable pod, volume handling) and the bundle pattern from Briefs 65/67/68 (`cloud/roxy-cloud-bundle-68.tar.gz`,
run.sh with FRAMES ranges, resume, finalize/pack). NOTES-65.md has the manual split procedure.

## Build
A way to render one bundle with N pods (default 5) with a single command, e.g.
`PODS=5 FLY_MODE=final ARCHIVE=... OUTDIR=... bash cloud/cloud-render.sh multi`.
- **One network volume** in one data center, shared by all pods (RunPod volumes are per data center). Choose the
  data center that can provide N GPUs right now; allow **mixed GPU types** from an ordered preference list
  (e.g. 4090, 5090, L40S, A6000, 3090 - whatever the current helper's GPU list supports); report which GPUs were used.
  If fewer than N can be had, start with what is available (at least 1) and say so.
- **Shared work queue instead of fixed ranges:** pods claim small chunks of frames (e.g. 8-10 frames) atomically
  from the volume (lock/rename-based claim files), so fast GPUs and light frames naturally take more work; a chunk
  claimed by a pod that dies is reclaimed after a timeout. Frames already finished are never re-rendered (resume).
- When the queue is empty and all frames are verified, **one** pod (or the helper) runs finalize/pack/encode; the
  helper downloads the result like `full` does.
- **Cleanup:** every pod deleted when it has no more work (billing stops per pod), the volume deleted after the result
  is home and checked, the state file removed. Keep the existing safety rules: credit guard (scale the minimum
  balance with N and the estimate), watchdog on every pod, never delete a pod that is unreachable (leave it to its
  watchdog and report), and handle Ctrl-C/kill of the local helper without leaving pods billing - the 7 Nov draft
  showed that killing the helper left a pod running; make `multi` robust to that (pods stop themselves when idle,
  and a `multi-cleanup` command lists/deletes this run's pods and volume).
- `peek` works for the multi run (newest frames from any pod / the volume).
- Progress line in the helper log: frames done / total, per-GPU rate, ETA.
- Back up `cloud-render.sh` first (`.pre75`). Don't change `full` mode behavior.

## Verify (no pods)
Local dry-run/smoke: simulate 3-5 workers on this PC at tiny resolution against a local folder standing in for the
volume (claim/timeout/reclaim/resume/finalize paths), shell syntax checks, and a dry-run of the provisioning logic
that prints the pod/volume plan without calling RunPod. Do NOT start pods or spend money.

## Deliver
The helper changes + any bundle-side script changes, `NOTES-75.md` (how it works, commands, failure handling,
expected time/cost for a 1,504-frame final on 5 mixed GPUs vs 1). Write only in `roxy3d/cloud/` and
`roxy3d/NOTES-75.md`. Light rules: no protected-file hash audit, short notes, no computer use, no downloads. STATUS line.
