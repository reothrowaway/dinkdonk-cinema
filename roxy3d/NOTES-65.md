# Brief 65: fly-through production bundle

6 Nov 2026. Production copies, five corrected 1920x1080 look checks and the cloud
bundle are complete. V6 remains 1625 frames (A1100 + B525), 30 fps, 54.167 s.
No pod was started; no cloud-render.sh command was executed (syntax checked only).

## Deliverables and look

- `fly/prod/production_A.blend`, `production_B.blend`, reproducible scripts and
  camera/bus/mapping exports; use `render65.py`/`pipeline.py`, not bare animation render.
- Five look checks below, with corresponding grayscale16 depth PNGs and JSON receipts.
- [Live-left / production-right comparison](fly/prod/compare_A0001_live-left_production-right.png).
- [Bundle](cloud/roxy-cloud-bundle-65.tar.gz): **30,001,251 bytes**,
  14 regular members under `bundle/`, every member read back.
- [Checksum](cloud/roxy-cloud-bundle-65.tar.gz.sha256):
  `bbd1e119ce54adf7bf2eee7bdd533552fd20d4d533a3df959269aa86364506b0`.
- [Verification](fly/prod/verification.json) and [portable contract](fly/prod/README.md).

Lobby frame 1 versus `out10/full.png`: **1.866009/255 mean RGB error**,
RMSE 5.169495, PSNR 33.862 dB. Auditorium B525 versus
`qa11/cinema_draft_13.png`: **0.538765/255 mean RGB error**,
RMSE 1.327078, PSNR 45.673 dB. These are whole-frame,
unaligned display-RGB comparisons at native 1080p, not claimed pixel identity.
The live lobby is a layered 4K-derived composite; this is a native 1080p full beauty
with new rain, physical shutter blur and different sampling. The final images were
opened and inspected: matching framing/palette/neon, visible dive/rain streaks,
readable street entrance, lobby S-route and lit draft-13 endpoint.

Both scenes now use their original **AgX - Medium High Contrast** setting. The
first attempt exposed a Blender setting-order bug that left contrast at None;
the same five requested angles were corrected and re-rendered. Earlier render
logs remain, but no extra owner angle or clip was delivered. Preview-only cards,
labels, Workbench lighting, edge darkening and 2D lens drops are absent.

## Production settings and timing

Cycles OptiX GPU and OptiX denoiser; adaptive **128 max / 32 min samples, .02
threshold**, Persistent Data, Blackman-Harris 1.5 px, 1920x1080, 30 fps. The lobby
retains production56 light-path settings, its world/fog, wet materials and glare;
the auditorium inherits the lit draft-13 scene. Source exposure is A +.25 / B 0,
with v6's dark doorway fade retained. This sampling choice halves the previous
256 cap at the owner's approved 1080p resolution while retaining the night look.

**Shutter: 1.25 frames = 1/24 s = 450 degrees**, both parts. A350 is the fast
mid-dive check and clearly shows camera/lighting streaks and falling rain. A650
is the street glide by the entrance, A850 is mid-lobby. Slow endpoint holds stay
sharp. The renderer preserves central-frame poses at projection changes, but
uses same-side extrapolation for their shutter samples to prevent a coordinate
jump from becoming a giant streak. No route or timing change.

| Final check | Local render + depth/write, seconds | Ratio-only 4090 projection, seconds |
|---|---:|---:|
| [A0001](fly/prod/lookcheck_A0001.png) | 76.15 | 10.07 |
| [A0350](fly/prod/lookcheck_A0350.png) | 70.69 | 9.35 |
| [A0650](fly/prod/lookcheck_A0650.png) | 85.02 | 11.25 |
| [A0850](fly/prod/lookcheck_A0850.png) | 93.32 | 12.34 |
| [B0525](fly/prod/lookcheck_B0525.png) | 8.86 | 1.17 |

Local hardware: NVIDIA GeForce RTX 3050 6GB Laptop GPU. Times include scene
evaluation, render/composite, depth conversion and output, excluding process
startup; the retained five total **334.04 s**.
The superseded five took 331.22 s; they are not included in final-frame rates.

NOTES-56 records 14390.53/34 = 423.25 s/local background and 2743.11/49 = 55.98 s
on the 4090: **7.5605x**. Applying that ratio gives **3.46 GPU render hours**
for all 1625 frames, weighted mean **7.66 s/frame**. Exterior frames
project around 9-12 s rather than guaranteeing every frame stays below 10 s.
Allow **4-5 billed hours on one 4090**, including changing viewpoints, startup,
encoding, validation and transfer. At the historical run-6 $0.89/h rate, **$3.56-$4.45**,
plus storage/network; this is not a current provider quote or new 4090 benchmark.
Ideal render-only division is about 1.73 h on two GPUs or 1.15 h on three;
setup/transfer and load imbalance do not divide the same way. The lobby ratio is
not a measured auditorium speedup.

## Rain, preservation and depth

**5,180 shared-mesh world-space drops**, deterministic seed 6501, fall at 6.5-8.5
source units/s over the street, exterior roofs/alleys and the air traversed by the
dive. No rain volume enters the cutaway lobby. Static fine airborne/edge drips
were hidden. Drop scale becomes zero around off-surface respawn boundaries.
Native Cycles subframe transforms create streaks. Existing animated ripples,
micro impacts, wet surfaces and stateless ground effects remain. Old topology-
changing geometry-node crowns can disable their own blur in Cycles; new falling
drop topology is stable. Four half-frame checks found **every active sampled drop
falling**, 0.10833-0.14166 units per half frame. No lens effect was added.

All original animation curves/parents compared equal: 238 A rig/camera objects,
3 B hinge/camera objects. All **1625** exported central camera records remain
numerically identical; only resolution/documentation metadata was updated.
The 14 A + 6 B preview cards were removed.

Depth PNGs: **1920x1080, grayscale, 16-bit unsigned, no alpha/gamma/AgX**. Positive
camera Z comes from Cycles world Position transformed by the camera view matrix;
the distance pass masks misses. Each frame JSON contains its near/far:

    Z = near + value / 65534 * (far - near)

65535 is invalid/no surface/clipped; 0..65534 are valid. Near/far match the current
camera clips, usually .015..200 (A1 .1..200); the distant long-lens frames have
different ranges. Use each frame's metadata, not a fixed global range. At a 200-unit
range quantization is about .00305 units. Lossless roundtrip covers all 65536 codes.
This is first-hit depth, not a coverage matte: glass, rain and motion-blurred edges
need page-side blending treatment. Cycles depth/position passes are unfiltered;
[Blender's pass documentation](https://docs.blender.org/manual/en/4.2/render/layers/passes.html)
describes that limitation. Exact renderer/depth details are in `fly/prod/README.md`.

Frames commit on the volume in ascending order within each worker: RGB PNG,
depth PNG, then a SHA-256 receipt LAST. Resume checks both hashes; incomplete
pairs are replaced. FRAMES is a global inclusive range. Finalization requires all
1625 valid pairs and produces PNG colors, a lossless depth PNG archive, metadata
and **flythrough_1080p30.webm**, VP9 CRF18, 30 fps, silent. `out10.tar.gz` is only
the existing helper's transport filename; its payload is **flythrough65/**.

The five image-pair sizes project to **5.43 GB raw**, plus roughly another
archive-sized copy. **Use a 20 GB network volume.** The helper's original 10 GB
default is unchanged: enlarge its newly created volume with the command below.
Intermediate archives stay on the container disk; finalization checks space
before handing off the result. No completed raw frame is deleted to make room.

## Local bundle proof

Archive extraction and the actual bundled pipeline were exercised with **four
160x90, 4-sample frames: A1, A462, B1, B525**. This covers both scene loads, the
bus passage, falling rain, depth exports, VP9 encode and actual decode of all four
frames. Maximum decoded mean RGB error: **2.474815/255**.
Result archive read-back passed. A repeat skipped all four finished pairs and
reused the verified package. The first codec check caught a missing active VSE
scene; the corrected packaging reused only hash-verified unchanged rendered
inputs (`smoke-packaging-repair.json`). A Windows checksum-list newline issue was
also caught and fixed; the final Unix SHA256SUMS check passes.

`cloud-render.sh.pre65` is the exact pre-edit backup. The helper adds only `peek`
and exits that branch before resource traps. Everything from its original fetch
state/credit/cleanup logic onward is **byte-identical**, including the credit
guard and never-delete-unreachable-pod behavior. Bundled watchdog.sh is also
byte-identical to Brief 57. Bash syntax checks pass. Peek's remote transfer,
Linux/RunPod execution, multi-pod volume behavior and the full movie remain
unexecuted here; no cloud permission, resource or credit was consumed.

SHA-256 preservation: **39,114 files / 4,694,938,073 bytes**, zero changed
or missing. This includes earlier v1-v6 outputs, live packs, source scenes and
pages. No server/OBS/page edit, commit or push. PROGRESS.md was left unchanged
because this brief explicitly restricts writes to fly/prod/, cloud/ and this note;
this note records the work and reasons.

## Exact commands for Claude (not executed)

Full run, in its own Git Bash terminal, from standby:

```bash
cd /c/Users/maxsp/Desktop/Angelthump_H264_4K/standby
ARCHIVE="$PWD/roxy3d/cloud/roxy-cloud-bundle-65.tar.gz" \
OUTDIR=roxy3d/fly/prod/cloud-result \
GPUS="NVIDIA GeForce RTX 4090" \
bash roxy3d/cloud/cloud-render.sh full
```

In a second terminal at the same standby directory, **after this run reports its
new pod/volume and writes cloud-state-full.json**, expand that volume before the
render finishes. Do not use a stale state file from another run. The CLI flag was
verified using local `--help`; no update was executed here:

```bash
./tools/runpodctl/runpodctl.exe network-volume update \
  "$(node -e 'console.log(JSON.parse(require("fs").readFileSync("roxy3d/cloud/cloud-state-full.json","utf8")).volume)')" \
  --size 20
```

Peek while it runs; this copies only the newest N committed color/depth/JSON sets:

```bash
bash roxy3d/cloud/cloud-render.sh peek 6
# For an explicitly provisioned split worker, with PEEK_POD set to its id:
PEEK_POD="$WORKER_POD" bash roxy3d/cloud/cloud-render.sh peek 6
```

Files land in `roxy3d/fly/prod/peek/fly65-<build-hash>/`. Peek never stops, resumes,
deletes or provisions anything. If SSH is unreachable it fails and leaves the pod
alone. Its transfer has only static/syntax verification locally.

Split run: Claude provisions two or three pods in the same data center with the
same **20 GB** network volume at `/vol`, installs the helper's existing Blender
system prerequisites, uploads this same archive, and extracts each to its own
`/workspace/bundle`. Do not run concurrent local helpers: they share one state
file and do not forward FRAMES. In each pod's Bash terminal, import the pod's
watchdog environment without printing it, then choose one disjoint worker line:

```bash
while IFS= read -r kv; do export "$kv"; done < <(tr '\0' '\n' < /proc/1/environ | grep -E '^RUNPOD_(POD_ID|API_KEY)=')
cd /workspace
tar -xzf bundle.tar.gz
cd bundle
# TWO pods: one line on each
FRAMES=1-580 bash run.sh full > run.log 2>&1
FRAMES=581-1625 bash run.sh full > run.log 2>&1
# Or THREE pods: one line on each
FRAMES=1-400 bash run.sh full > run.log 2>&1
FRAMES=401-800 bash run.sh full > run.log 2>&1
FRAMES=801-1625 bash run.sh full > run.log 2>&1
```

After every worker reports RANGE_COMPLETE, on ONE coordinator pod, with FRAMES
unset (the same environment import arms the unchanged watchdog):

```bash
unset FRAMES
cd /workspace/bundle
bash run.sh finalize > run.log 2>&1 && \
cp out10.tar.gz /vol/results/out10.tar.gz.partial && \
mv /vol/results/out10.tar.gz.partial /vol/results/out10.tar.gz && \
cp out10.tar.gz.sha256 progress.log run.log /vol/results/ && \
sync && printf '0\n' > /vol/results/EXIT
```

For the normal full run, the helper already publishes those result files and
maintains its state. Fetch later with the same destination:

```bash
OUTDIR=roxy3d/fly/prod/cloud-result bash roxy3d/cloud/cloud-render.sh fetch
```

For a manually provisioned split run, set COORDINATOR_POD, NETWORK_VOLUME and
DATACENTER_ID to the values from that provisioning session, export them, and
write the helper's ignored local state before that fetch (never commit it):

```bash
node -e 'const e=process.env; for(const k of ["COORDINATOR_POD","NETWORK_VOLUME","DATACENTER_ID"]) if(!e[k]) throw Error("Missing "+k); require("fs").writeFileSync("roxy3d/cloud/cloud-state-full.json",JSON.stringify({pod:e.COORDINATOR_POD,volume:e.NETWORK_VOLUME,dataCenter:e.DATACENTER_ID,mode:"full"},null,2))'
OUTDIR=roxy3d/fly/prod/cloud-result bash roxy3d/cloud/cloud-render.sh fetch
```

The helper fetch removes its recorded coordinator/volume after successful local
verification. Claude must first finish/stop the other split workers and remove
their pods after results are verified; never delete an unreachable worker.
Shared volume attachment is described by
[RunPod](https://www.runpod.io/blog/network-volumes-on-runpod-secure-cloud);
multi-pod runtime/locking remains untested in this local task.
The fetched payload is `roxy3d/fly/prod/cloud-result/flythrough65/`.

STATUS: COMPLETE - PRODUCTION COPIES, FIVE FINAL LOOK CHECKS, DEPTH CONTRACT,
VERIFIED CLOUD BUNDLE/CHECKSUM, PEEK-ONLY HELPER ADDITION AND HANDOFF DELIVERED;
NO POD, CLOUD RUN, FULL ANIMATION OR LIVE-ASSET CHANGE; STOP.
