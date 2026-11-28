# Cinema mod checks · 27 Nov 2026

## Real-room 4K60 sweep

OBS missed **37 of 25,391** compositor frames across 84 measured windows for the 20 new machines and bypass. Both QA rooms ran at 3840 × 2160 with a 60 fps browser source and a 60 fps OBS canvas. Recording and streaming were off. The room server reported 7–17 people in the lobby and 134 seated in the auditorium.

The run used standalone portable OBS 32.2.2, obs-shaderfilter 2.6.1, Direct3D 11, and the NVIDIA GeForce RTX 3050 6GB Laptop GPU. The lab used its own collection, websocket, and standby port. The browser sources used real DGG chat with everyone enabled, the control feed disabled, and the film bridge disabled.

Each row combines one forward and one reverse pass per room. After a 0.75-second settling period, the harness took five one-second OBS samples and a 4.2-second browser animation-frame sample. The table shows the mean OBS-reported average render time and the highest of the four per-window browser p95 values. OBS compositor timing and browser frame intervals measure different stages. Live crowd and camera changes affect these short windows.

| Mod | Lobby OBS render, ms | Auditorium OBS render, ms | Missed / rendered | Highest browser p95 interval, ms |
|---|---:|---:|---:|---:|
| Shader bypassed | 0.28 | 0.31 | 0 / 1,210 | 16.80 |
| Prism Cathedral | 0.32 | 0.35 | 0 / 1,207 | 16.80 |
| Scanline Elevator | 0.33 | 0.35 | 0 / 1,210 | 16.80 |
| Lenticular Marquee | 0.32 | 0.33 | 0 / 1,206 | 16.80 |
| Black Hole Matinee | 0.33 | 0.34 | 0 / 1,209 | 16.80 |
| Folding Screen | 0.34 | 0.34 | 0 / 1,210 | 16.80 |
| Pin Matrix | 0.34 | 0.35 | 0 / 1,210 | 16.80 |
| Ribbon Plotter | 0.33 | 0.35 | 0 / 1,210 | 16.80 |
| Leaded Glass | 0.33 | 0.34 | 0 / 1,210 | 16.80 |
| Thermal Receipt | 0.33 | 0.34 | 0 / 1,208 | 16.80 |
| Contact Printer | 0.33 | 0.34 | 0 / 1,208 | 16.80 |
| Tidal Glass | 0.33 | 0.34 | 0 / 1,210 | 16.80 |
| Horizon Drive | 0.32 | 0.34 | 0 / 1,209 | 16.80 |
| Mirrorball Ballroom | 0.34 | 0.34 | 0 / 1,211 | 16.80 |
| Poster Peel | 0.33 | 0.34 | 0 / 1,209 | 16.80 |
| Parallax Cutouts | 0.34 | 3.05 | 37 / 1,209 | 16.80 |
| Silk Facets | 0.34 | 0.35 | 0 / 1,213 | 16.80 |
| Laser Topography | 0.33 | 0.34 | 0 / 1,208 | 16.80 |
| Pinball Optics | 0.33 | 0.34 | 0 / 1,208 | 16.80 |
| Warp Gate | 0.32 | 0.35 | 0 / 1,208 | 16.80 |
| Glyph Cascade | 0.33 | 0.34 | 0 / 1,208 | 16.80 |

The browser sampled 21,200 frame intervals, including 3 longer than 33.4 ms. These measurements cover the preshow on this laptop. A running movie decoder, stream encoder, other scenes, or another GPU can change the result.

## Auditorium slowdown

All 37 missed frames occurred during one reverse-pass window for **Parallax Cutouts**. The forward window recorded zero misses. A fresh 4K60 auditorium run interleaved the same mode five times with three bypass windows, Poster Peel, and Silk Facets. Parallax Cutouts missed **0 of 1,512** frames on those repeats, with mean OBS render time ranging from 0.34 to 0.38 ms. All ten follow-up windows together missed 0 of 3,024. The original stall remains in the table. Its cause was not established.

## First four mods

The first-four tests measured each mod and bypass for eight seconds per room at 4K60, with encoding off. OBS missed **0 of 4,839** frames. Each result below has one sample window per room. A static-image cross-check found that changing shader files on an existing OBS filter could keep the previous shader active. Infinity Foyer was recorded and measured again with a fresh filter loaded directly from its file. The table and gallery use the corrected take.

| Mod | Lobby OBS render, ms | Auditorium OBS render, ms | Missed / rendered | Highest browser p95 interval, ms |
|---|---:|---:|---:|---:|
| Bypassed | 0.31 | 0.31 | 0 / 969 | 16.70 |
| Vector Rebuild | 0.25 | 0.26 | 0 / 967 | 16.80 |
| Mercury Bath | 0.25 | 0.26 | 0 / 967 | 16.70 |
| Infinity Foyer | 0.34 | 0.35 | 0 / 969 | 16.80 |
| Laser Choir | 0.21 | 0.23 | 0 / 967 | 16.80 |

## Film alignment and movement

The 23 OBS shader modes were placed on a native 1920 × 1080 auditorium browser plate after the packaged film color key. Each mode preserved every alpha byte. All 864,658 measured interior pixels of a calibration image behind the opening matched bypass in every mode. Comparisons of a fixed plate at two different times also confirmed visible animation in each of the 20 additional machines.

With Mix at 0%, native opaque picture pixels matched bypass. At 2560 × 1440, resampling the keyed plate through the additional OBS filter pass produced small-area differences at the boundary. Use the filter eye for an exact return to the original composite.

On the fixed, opaque lobby image, all 23 shaders produced distinct stills. Holding Speed at 0 gave identical frames over time. At native resolution, Mix 0 reproduced the original lobby pixel for pixel. At Mix 50, the observed change was 49.9–50.3% of the corresponding full-strength change.

Both Laser Choir installations produced a wave after a real chat message. Reduced-motion emulation paused both fans, and another real message produced no wave. The auditorium’s live clip geometry excluded the screen center and four near-corner points while admitting the surrounding room.

## Gallery and recordings

The gallery contains 48 mod clips and two original takes. It uses local 1280 × 720, 30 fps, silent H.264 video from the real rooms. Encoding and pixel checks confirmed motion in every take. An automated Edge check opened all 24 options in both rooms, compared both originals, exercised the five groups, opened a deep link at 375 px width, verified reduced-motion behavior, and confirmed playback advanced. The 72-second overview contains one three-second chapter for each mod.

The 20-machine raw runs, pixel comparisons, browser checks, and per-window timings are in `roxy3d/qa-night/machines-27nov/`. The corresponding first-four evidence is in `roxy3d/qa-night/cinema-mods-27nov/`. Captures containing real chat stay local.
