# Brief 86: approved Dear Leader production layer pack

10 Nov 2026. Rendered and verified **`out10l/`: six page image elements**, each at 1x and native @2x. The pack has **21 files, 174,624 bytes (170.53 KiB)**. This is a staging deliverable; no page integration or promotion was performed.

![Single layer check, with one 4x inset from the 2x composite](qa10/leader-layer-check.png)

**Render, compositing, file hashes and parent reconstruction pass. The brief's full walker-rectangle assertion cannot pass with its required wall depth.** `validation.json` therefore has `passed: false`, `render_and_packaging_passed: true`, `composite_check_passed: true`, and an explicit failed walker check. This is not an unqualified acceptance result.

## Approved scene and production captures

The source is the approved `leader/leader_draft29.blend`, SHA-256 `8c02b0b274a51ec7bf88b726c698cc6415b7a2b603153cf574a07d7b8dd826cf`. Its seven meshes, 2 W warm area lamp, packed DEAR LEADER artwork, thin black-brown frame and brass fixture are unchanged. No styled revision, new artwork or lighting adjustment was made. All original files were opened read-only and no blend was saved.

Local **NVIDIA GeForce RTX 3050 6 GB Laptop GPU**, Blender **5.2.3**, Cycles **OptiX**, native **3840x2160**, **256 max / 64 min samples**, adaptive threshold **0.01**, seed **1701**, OptiX denoise, Blackman-Harris **2.5**, no motion blur, inherited **AgX Medium High Contrast**, exposure **+0.25**, gamma **1**. The production camera matrix, shift and orthographic projection were retained. All captures use camera border **[740, 370, 340, 340]** in logical stage pixels: a **680x680** native buffer with unchanged pixel density. No cloud was used.

The original production glare nodes remain. The separately added 720p marquee bulb-kernel image is bypassed for this border, which contains no marquee bulbs, as in the approved draft's native wall crop. It is not stretched across the crop. Full-body coverage and a selective world-position AOV were captured with all peers retained as camera holdouts; non-leader AOV output is zero, and body positions are normalized by actual body coverage. The opaque body's measured v span is **3.315737..4.019997**, entirely within wall slice 00's **3.0799997..4.3999996** footprint. No body split is necessary.

The full-scene lamp-on, lamp-off and leader-absent captures use identical seed and geometry except for their named change. Direct bright-scene subtraction included sampling/denoiser changes: receiver linear differences reached -0.1964, which cannot be emitted light. A second **pure picture-lamp on/off pair** disables only existing source radiance, retains all geometry/BSDFs and the identical seed, and measures the lamp contribution without subtracting two bright noisy images. Its off reference is black. Linear light transport permits this difference to be added to the full lamp-off radiance before the approved glare/AgX transform. The result is checked against the independently captured full lamp-on image below.

Each 1x display input is a **scene-linear 2x2 reduction** of the native capture, with coverage reduced in linear space. Display values stay at **16 bits** until final browser-layer quantization. This avoids creating a spurious third code value by subtracting independently rounded 8-bit images. The final files are 8-bit straight RGBA or RGB-on-black, matching the live pack.

Receiver lamp wash is averaged within its own receiver over a **2 logical px radius**, without crossing ownership boundaries or filtering the poster. Geometry differences are retained where a **1 logical px radius** mean exceeds **2/255**, within **12 px** of the body silhouette; this preserves contact shadows and excludes distant sampling changes. The matched direct-capture error is reported, including its outliers. The capture's outer eight-logical-pixel guard band has lamp contribution at most **1/255** at either resolution and geometry difference at most **1/255 at 1x, 2/255 at 2x**, so the render border does not truncate a visible spill.

## Six elements and page drawing

Resolve `leader.json` paths against `roxy3d/out10l/`. Rectangles below are **x, y, w, h in 1920x1080 logical pixels**, including @2x placement.

| Element | Rect | z-index | Blend | Receiver slice |
|---|---|---:|---|---|
| `leader_shadow_under` | 846, 533, 60, 35 | 5 | source-over | Under all walkers |
| `leader_light_under` | 846, 506, 131, 106 | 5 | plus-lighter | Under all walkers |
| `leader_body` | 837, 458, 62, 107 | 1675 | source-over | slices/occ_restroom_side_wall_00.png |
| `leader_light_restroom_side_wall_00` | 807, 458, 97, 119 | 1675 | plus-lighter | slices/occ_restroom_side_wall_00.png |
| `leader_shadow_boxoffice_00` | 845, 560, 6, 7 | 1954 | source-over | slices/occ_boxoffice_00.png |
| `leader_light_boxoffice_00` | 812, 560, 56, 41 | 1954 | plus-lighter | slices/occ_boxoffice_00.png |

**Three plus-lighter images total.** Their logical bounding rectangles cover 27,725 pixels. All six rectangles cover 36,501 pixels, or approximately 142.6 KiB decoded as RGBA at 1x and 570.3 KiB at 2x, excluding unused parent references. These are inventory sizes; no OBS performance measurement is claimed.

The frame and fixture **need their contact shadow**. It is fused with the body in one straight-alpha source-over image because both sit on the same wall slice at the same z. Transparent pixels have zero RGB; there is no opaque rectangular wall plate. The separate black ground correction keeps small floor darkening under walkers. A very small matched correction falls on the box-office slice and retains that receiver's depth. These are necessary geometry/display corrections, not an extra lamp or a changed poster look.

Black shadow plus a positive chromatic complement encodes the final AgX result with browser source-over and plus-lighter, following the Brief 83 approach. Opaque body pixels carry their entire lamp wash. Straight edge colors are solved against the receiver; the wall light retains only spill and the minimal positive display complement at fractional edges. Parent images are reconstruction references and **must not be drawn** in addition to the pieces.

At z 5, draw `leader_shadow_under` before `leader_light_under`, after the wet-street light and before walkers. For pinned pieces, the manifest names both the parent occluder PNG and the exact slice PNG: the wall is **1674 + 1 = 1675**, the box office **1953 + 1 = 1954**. At equal z, insert source-over body/shadow before the matching plus-lighter light. These children must share the page's existing walker stacking context. Preserve native resolution and normal @2x selection. Turn off the page-drawn Dear Leader placeholder when integrating the art.

`face_quad` is TL, TR, BR, BL in stage pixels, copied from the approved geometry:

| Corner | x | y |
|---|---:|---:|
| TL | 849.359951 | 485.083959 |
| TR | 888.959999 | 465.283978 |
| BR | 888.959999 | 538.033855 |
| BL | 849.359951 | 557.833836 |

## Walker-depth conflict

The wall's actual file is `out10/slices/occ_restroom_side_wall_00.png`, z **1674**. The brief requires the body to be exactly one above it, hence **1675**. For its supplied rectangle **u 3.45..4.15, v 3.2..4.1**, `1000 + Math.round((u + v) * 100)` ranges from **1665 to 1825**. It does not put every point above 1675.

| u | v | Walker z | Compared with body 1675 |
|---:|---:|---:|---|
| 3.45 | 3.20 | 1665 | Below |
| 3.45 | 3.30 | 1675 | Equal; DOM order decides |
| 3.45 | 3.66 | 1711 | Above |
| 3.75 | 3.70 | 1745 | Above |
| 4.15 | 4.10 | 1825 | Above |

Strictly above requires integer walker z **>=1676**, or **u+v >=6.755**, subject to ordinary JavaScript floating-point rounding. At **6.745 <=u+v<6.755**, the values tie. No body z can satisfy both “wall 1674 plus 1” and “below every walker starting at 1665.” I retained the specified wall rule and approved geometry and recorded the failed range assertion instead of inventing a pass. No fake chatter or walker screenshot was created. Whether a particular failing-range sprite overlaps the poster depends on its emote dimensions and animation; that geometric/real-chat acceptance was not substituted for the requested numerical check. Page integration needs to resolve this range/stacking condition before claiming that all supplied positions pass.

## Composite and file validation

The written PNGs were read back independently. Disjoint retained pieces rebuild their cropped **body/contact-shadow, black-shadow and RGB-light parents byte-exactly at both sizes**. The complete final audit also independently reads those parent PNGs, checks dimensions, confirms straight-alpha transparent RGB, black shadow RGB, RGB light channels, pinned z values and every checksum.

All errors below are in **8-bit code values**. Target columns are mean / p99 / max. Direct columns are mean / p99 against the independently rendered full lamp-on capture.

| Scale | Body vs encoded target | Receivers vs encoded target | Direct body | Direct receivers |
|---|---|---|---|---|
| 1x | 0.0051 / 0.00 / 1 | 0.0060 / 0.00 / 2 | 1.026 / 6.44 | 0.194 / 2.00 |
| 2x | 0.0046 / 0.00 / 1 | 0.0058 / 0.00 / 2 | 1.489 / 10.00 | 0.227 / 2.00 |

The final encoded composite differs by at most **1/255 on the body and 2/255 on receivers** after the listed noise omissions. The direct-render acceptance gates are **mean <=2/255, p99 <=12/255**, the same as NOTES-83. Both sizes pass those gates. Direct native outliers still reach **39/255 on body pixels and 36/255 on receiver pixels**; these are sampling/display differences, so this is a measured tolerance check, not a claim of pixel-exact agreement with the direct render.

Nonzero light pieces omitted after the documented display preparation, because neither size exceeds **2/255**:

| Receiver | Max 1x | Max 2x |
|---|---:|---:|
| partition_left_00 | 1 | 1 |
| partition_right_00 | 1 | 1 |
| podium_00 | 2 | 2 |
| restroom_side_wall_01 | 1 | 1 |

`qa10/leader-layer-check.png` is the **only presentation image**, **1280x720**. It starts with `out10/full` plus the original marquee layers and chase phase 0, the same construction as `qa10/marquee-layer-check.png`, then interleaves the new pieces in the global z order with their actual browser blend modes. The marquee boards are blank in that prior-check construction; the running page adds its own text. The single inset uses stage **[831,438,81,129]** from the actual **2x composite**, at four times the wide view's density (**216x344** at **[16,12]**). Its 4/3 interpolation from the native 2x crop does not create extra captured detail; no higher-resolution close-up was rendered. The final image was opened and visually inspected against draft 29: poster, thin frame, brass light, mounting shadow and local spill are present with no rectangular plate or visible halo. No browser, computer use, real-chat session or OBS test was performed.

All **33,716 protected inputs** retain their initial SHA-256 values, including the approved blend, poster artwork, source builder, live `out10/`, `out10m/`, `out10mist/`, `qa11/` and prior check/draft images. Pack SHA-256 entries cover every pack file except `checksums.json` itself, following the existing self-hash exclusion convention. No page, server, source blend, live pack, OBS collection or Git history was edited.

## Times

| Accepted native capture/export | Seconds |
|---|---:|
| `body` | 8.60 |
| `lamp_on` | 29.90 |
| `lamp_off` | 29.56 |
| `absent` | 29.64 |
| `lamp_basis_on` | 8.27 |
| `lamp_basis_off` | 7.26 |
| **All six captures** | **113.23 (1.89 min)** |

The four main captures total 97.70 s; the isolated lamp pair adds 15.53 s. There were no superseded GPU captures. Accepted 16-bit display preparation: **8.00 s**. Final packaging and compositing: **7.95 s**. Independent full-file audit: **20.17 s**. Elapsed from the first render runner launch (**15:32:19 UTC**) to the final audit (**15:51:43 UTC**): **19.40 min**, including script development, intermediate numeric plans and hashing. Brief reading before that launch is excluded. GPU time and elapsed work time are intentionally reported separately.

## Reproduction and pack inventory

Run from `roxy3d/`, one Blender job at a time:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File leader/run_blender.ps1 -Script render_layers86.py -Log layers86-render.log
powershell -NoProfile -ExecutionPolicy Bypass -File leader/run_blender.ps1 -Script render_lamp_basis86.py -Log layers86-lamp-basis.log
powershell -NoProfile -ExecutionPolicy Bypass -File leader/run_blender.ps1 -Script display_layers86.py -Log layers86-display.log
& ../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe -B leader/package_layers86.py --build
& ../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe -B leader/verify_layers86.py
& ../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe -B leader/write_notes86.py
```

Internal EXRs, signed linear differences, AOVs, float display arrays, receipts, scripts and logs remain under `leader/`. Existing draft sources were not overwritten. Writes are limited to `leader/`, `out10l/`, the one check PNG and this note. This note is the dated change log: the brief's explicit allowlist excludes `PROGRESS.md`.

| Pack file | Bytes |
|---|---:|
| `checksums.json` | 3,114 |
| `leader.json` | 5,818 |
| `leader_body.png` | 12,655 |
| `leader_body@2x.png` | 41,585 |
| `leader_light_boxoffice_00.png` | 450 |
| `leader_light_boxoffice_00@2x.png` | 894 |
| `leader_light_restroom_side_wall_00.png` | 2,361 |
| `leader_light_restroom_side_wall_00@2x.png` | 6,487 |
| `leader_light_under.png` | 2,882 |
| `leader_light_under@2x.png` | 7,464 |
| `leader_shadow_boxoffice_00.png` | 101 |
| `leader_shadow_boxoffice_00@2x.png` | 133 |
| `leader_shadow_under.png` | 736 |
| `leader_shadow_under@2x.png` | 1,920 |
| `parents/body_with_contact_shadow.png` | 12,655 |
| `parents/body_with_contact_shadow@2x.png` | 41,585 |
| `parents/light.png` | 5,313 |
| `parents/light@2x.png` | 14,489 |
| `parents/shadow.png` | 746 |
| `parents/shadow@2x.png` | 1,945 |
| `validation.json` | 11,291 |

STATUS: RENDER AND STAGING PACK COMPLETE - SIX ELEMENTS, ONE CHECK IMAGE, EXACT PARENTS AND HASH AUDIT DELIVERED; REQUIRED WALL Z EXPOSES A FAILED FULL WALKER-RANGE ASSERTION; PAGE ACCEPTANCE/PROMOTION PENDING; STOP.
