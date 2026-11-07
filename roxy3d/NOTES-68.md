# Brief 68: pullback black-frame diagnosis and fix

7 Nov 2026. **Complete locally.** The owner canceled the pod draft and explicitly
removed the local draft-range render. No local draft range was rendered. There
were exactly four new 1920x1080 final-quality proof frames, plus low-resolution
diagnostic and smoke images. No pod, cloud API, server or OBS operation was run.

## Cause and affected interval

**A107-A240 inclusive** (134 timeline frames, 4.467 seconds) are affected by the
outside of **`P8 enclosing indigo cloud sky`**, a 150-unit enclosing sky shell.
This starts at the ORTHO-to-distant-PERSP switch. Brief 67 widened the clip slab
over neighboring virtual camera positions, while separately normalizing their
shutter transforms to the central focal length. The oversized A near clip then
admits the shell in front of the cinema.

At A185, the broken clip interval is **18984.160-20815.840**. The center ray hits
the sky exterior at camera Z **19740.839**, before the city. All pixels have valid
depth because that pass sees the shell; valid depth did not establish city
visibility. Restoring the original central slab to **19798.140-20003.140** clips
away that exterior and exposes actual scene depths around **19853-19892**.

Controlled A185 renders at 960x540 / 24 samples:

- Baseline: mean RGB **0.082064/255**, maximum **1/255**.
- Full fog ray visibility, fog hidden, motion blur disabled, and an extremely
  broad clip interval each remain black with the same mean and maximum.
- Original central clipping restores the cinema (mean **16.838383/255**).
- Hiding only the sky from camera rays also restores it (mean **16.821421/255**),
  identifying the occluder. That visibility workaround was not shipped.
- Exposure remains **+0.25** in these controls; no exposure or fog change is needed.

The route scan rendered **112 A samples and
42 B samples**, at **160x90 / 4 samples**,
with the normal motion blur, scene, lighting and weather. A uses every tenth
frame from A16 through A1096, plus A1, A450 and A1100; B uses B1, B11, ..., B401,
plus B404. Explicit boundary renders cover A105-108 and A238-243. The original
A107-108 are partially obscured (mean RGB 4.4065 and 3.9622/255), while A238-240
are fully black; A106 and A241 delimit the failure. The shutter leaves some
image at the beginning of the affected interval. All-frame
nine-ray sky intersections independently place the obstruction at A107-240.
The expected dark vestibule/entrance transition is not a clipping failure.

Evidence: [route metrics](fly/v7/qa68/scan-before.json),
[before boundaries](fly/v7/qa68/scan-before-boundary.json),
[fixed boundaries](fly/v7/qa68/scan-after-boundary.json),
[all-frame sky intersections](fly/v7/qa68/sky-intersections.json).

## Fix and preservation

`fly/v7/camera_path.json` restores A's original interpolated central clip slab,
changing clipping and the exported projection depth row at **A107-A260**. The
small envelope differences after A240 were not black frames. `motion67.py`
now regenerates that policy. B retains its required shutter-wide clip envelope.
The renderer, source blends, poses, lenses, shifts, motion blur, exposure, fog,
lights, materials, rain, timing, bus path and endpoint plates are unchanged.
The exported XY projection rows are also preserved exactly.

A1, every A410-A1100 row and every B row are identical to their pre-fix values.
The original endpoint plates retain their original hashes, so frame 1 has the
same matching policy as Brief 67, with no new live-composite identity claim.
The new native A519 control differs from the pre-68 v7 native A519 by
**0.008385/255** mean RGB;
pixel identity: **False**.
[Exact change record](fly/v7/qa68/fix.json),
[unchanged input hashes](fly/v7/qa68/unchanged-inputs.json).

## Four final-quality proofs

**1920x1080**, Cycles OptiX, **64 max / 16 min samples**, threshold **.03**,
OptiX denoising, persistent data, original AgX look and **1.25-frame shutter**.
Color, 16-bit camera-Z PNGs and receipts are in
[`fly/v7/qa68/final-proof/`](fly/v7/qa68/final-proof/).

The old comparison is the nearest `source_v6_frame` in the v7 path, resolved to
the original production global index. It is not the same-numbered v7 frame.

| V7 local / global | Source v6 frame | Old production global | Native mean RGB difference /255 | Local total |
|---|---:|---:|---:|---:|
| A185 / 185 | 184.710536 | 185 | 11.1283 | 31.94 s |
| A225 / 225 | 224.931750 | 225 | 9.3010 | 29.73 s |
| A519 / 519 | 480.248506 | 480 | 5.7282 | 27.93 s |
| B374 / 1474 | 495.000000 | 1595 | 6.7066 | 6.17 s |

[Four comparisons: old left, fixed right](fly/v7/qa68/four_final_proofs_old-left_fixed-right.png).
[A185 broken vs fixed](fly/v7/qa68/before_after_A0185_before-left_fixed-right.png).
[Street control before vs fixed](fly/v7/qa68/before_after_A0519_before-left_fixed-right.png).
These last two sheets compare the earlier 540p diagnostic to an exact 2x2
reduction of the final proof; their differences also include sampling and
resolution. [Native measurements and provenance](fly/v7/qa68/comparison.json).

Old-vs-fixed moving images include Brief 67 retiming, fractional camera pose,
weather/bus phase, sampling and shutter normalization. Their numerical error
is not an isolated measure of the clip fix. In the contact sheet the old A185
and A225 images show long-lens smearing; old B1595 is visibly dim/obscured.
The new B proof retains Brief 67's clearer endpoint behavior, with no Brief 68
B change. The fixed boundaries show the
cinema, and the all-frame sky check admits no front shell after the fix.
The native A185 and the four-row comparison sheet were visually inspected,
as was the [full-route diagnostic contact sheet](fly/v7/qa68/route_before_contact.png).

## Bundle and smoke

[`cloud/roxy-cloud-bundle-68.tar.gz`](cloud/roxy-cloud-bundle-68.tar.gz)
is **34,952,529 bytes**, **27 regular members**,
all read back and hashed. SHA-256:

```text
6e7b5038a851dce8abdc27750667898dee0f0f4c594cd21a52d260125c634ae2
```

[Checksum file](cloud/roxy-cloud-bundle-68.tar.gz.sha256).
Both modes are self-contained in this one archive. File names and result
prefixes retain `67` for helper compatibility; the new sealed manifest produces
new draft/final build identities, preventing reuse of the broken build.

The extracted sealed archive passed preflight, both mode smoke runs and resume.
Smoke now explicitly includes A185 and A225, plus both scenes, the endpoints
and the final perspective/ORTHO boundary.

- **draft:** 8 smoke images at 160x90 / 4 samples, VP9 at 15 fps, all 8 decoded and checked; maximum decoded mean RGB error 2.5133/255. Repeat skipped all 8 verified pairs and reused the package.
- **final:** 8 smoke images at 160x90 / 4 samples, VP9 at 30 fps, all 8 decoded and checked; maximum decoded mean RGB error 2.5133/255. Repeat skipped all 8 verified pairs and reused the package.

Python syntax, Bash syntax, Unix `sha256sum --check`, all color/depth receipts,
archive read-back and unchanged launcher/watchdog checks passed. No topology
warnings occurred in the accepted smoke runs. This is local Windows Blender
execution of the portable pipeline; no new Linux/RunPod execution or full-motion
film review is claimed. [Verification](fly/v7/qa68/verification.json).

## Same helper commands as Brief 67, new archive

Commands are provided for the owner/Claude; **none were run here**. A new draft
or final cloud job still needs the owner's instruction.

Draft:

```bash
cd /c/Users/maxsp/Desktop/Angelthump_H264_4K/standby
FLY_MODE=draft \
ARCHIVE="$PWD/roxy3d/cloud/roxy-cloud-bundle-68.tar.gz" \
OUTDIR=roxy3d/fly/v7/cloud-draft-result \
GPUS="NVIDIA GeForce RTX 4090" \
bash roxy3d/cloud/cloud-render.sh full
```

Final:

```bash
cd /c/Users/maxsp/Desktop/Angelthump_H264_4K/standby
FLY_MODE=final \
ARCHIVE="$PWD/roxy3d/cloud/roxy-cloud-bundle-68.tar.gz" \
OUTDIR=roxy3d/fly/v7/cloud-final-result \
GPUS="NVIDIA GeForce RTX 4090" \
bash roxy3d/cloud/cloud-render.sh full
```

As in NOTES-67, the final needs this new run's volume enlarged to **20 GB**
after its fresh state file is written. On already provisioned workers, the
same `FLY_MODE=draft|final FRAMES=start-end bash run.sh full` commands apply;
draft still selects odd global frames. There is no local range output to
splice into the canceled draft.

Writes were limited to `fly/v7/`, the new Brief 68 bundle/checksum in `cloud/`,
and this note. The original Brief 67 archive retains SHA-256
`8f2be0d6357f9a25bf379cf463440682902ecc6bc55cf9c4c1bc1e19ef20d3a2`.
`PROGRESS.md` was not edited because the brief restricts writes; this note logs
the change. No source/live art, scene page, helper, server, OBS, commit or push changed.

STATUS: COMPLETE - SKY-SHELL CLIPPING CAUSE AND A107-A240 RANGE VERIFIED;
FIXED V7, FOUR FINAL PROOFS, DUAL-MODE BUNDLE, SMOKE/RESUME AND CHECKSUM DELIVERED;
LOCAL DRAFT RANGE SKIPPED AS REQUESTED; NO POD OR CLOUD; STOP.
