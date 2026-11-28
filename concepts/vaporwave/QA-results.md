# Cinema looks QA · 26 Nov 2026

## Picture and film alignment

The original, Normal lobby, Moody lobby and auditorium captures come from this workspace. Each of the thirteen filters produced a distinct output in all three scenes. At zero strength, native 2560×1440 RGBA output matched the unfiltered frames for all three scenes.

The film test used the exported OBS Color Key on a real 1920×1080 film-phase auditorium capture. A registration pattern sat behind the aperture. At 100% strength, all thirteen looks preserved every source alpha byte. All 864,658 tested interior pixels matched in the 2560×1440 composite. The room around the aperture changed for every look.

## Live OBS render checks

Hardware used the local RTX 3050 6 GB laptop GPU. The private portable OBS used real chat and 45 seconds of warm-up per page and resolution. Each condition ran twice, in forward and reverse order. Each measurement sampled OBS GetStats eight times across approximately eight seconds after a two-second settle. The 1440p browser source ran at 30 fps, in a 60 fps OBS project with 1080p output. The 4K test used a 3840×2160 browser source, canvas and output at 60 fps. Streaming and encoding were off during these measurements.

Values below are OBS's reported average frame render time. Browser main-thread load, video encoding, and an entire movie night's frame pacing require different measurements. Each filtered mean is paired with its own run's bypass mean. Live scene activity varied.

| Canvas and page | Preset | Off (ms) | On (ms) | Missed / observed frames with effect | People in room (range) |
|---|---|---:|---:|---:|---:|
| 1440p lobby | After-hours mall | 0.275 | 0.301 | 0 / 968 | 17–18 |
| 1440p lobby | Pearl diffusion | 0.275 | 0.301 | 0 / 967 | 18–23 |
| 1440p lobby | Anamorphic neon | 0.275 | 0.307 | 0 / 968 | 21–28 |
| 1440p lobby | Curved CRT | 0.275 | 0.298 | 0 / 967 | 23–27 |
| 1440p lobby | 35 mm midnight | 0.275 | 0.296 | 0 / 965 | 24–28 |
| 1440p lobby | Neon rain | 0.277 | 0.288 | 0 / 969 | 32–33 |
| 1440p auditorium | After-hours mall | 0.259 | 0.290 | 0 / 969 | 134–134 |
| 1440p auditorium | Pearl diffusion | 0.259 | 0.298 | 0 / 969 | 134–134 |
| 1440p auditorium | Anamorphic neon | 0.259 | 0.299 | 0 / 967 | 134–134 |
| 1440p auditorium | Curved CRT | 0.259 | 0.287 | 0 / 966 | 134–134 |
| 1440p auditorium | 35 mm midnight | 0.259 | 0.290 | 0 / 969 | 134–134 |
| 1440p auditorium | Neon rain | 0.345 | 0.360 | 0 / 967 | 135–135 |
| 2160p lobby | After-hours mall | 0.277 | 0.317 | 0 / 966 | 37–38 |
| 2160p lobby | Anamorphic neon | 0.277 | 0.318 | 0 / 967 | 34–35 |
| 2160p lobby | 35 mm midnight | 0.277 | 0.308 | 0 / 967 | 33–36 |
| 2160p lobby | Neon rain | 0.269 | 0.303 | 0 / 969 | 40–43 |
| 2160p auditorium | After-hours mall | 0.309 | 0.349 | 0 / 965 | 134–134 |
| 2160p auditorium | Anamorphic neon | 0.309 | 0.333 | 0 / 965 | 134–134 |
| 2160p auditorium | 35 mm midnight | 0.309 | 0.362 | 0 / 967 | 134–134 |
| 2160p auditorium | Neon rain | 0.306 | 0.354 | 0 / 967 | 135–135 |

Across all 56 measurement windows, including bypass, OBS counted 0 missed render frames out of 27,089. The crowd figures are lobby roster or seated auditorium counts. The QA server confirmed that the rendering page was subscribed during every window.

## Source measurements

Local QA data is under `roxy3d/qa-night/vaporwave-26nov/`. The files `motion.json`, `motion-signature.json` and `pixel-checks.json` contain the measurements. The two split-screen video segments reference the same live browser source on both halves, recorded at 1080p30 before the captioned 1280-pixel-wide export.

## All thirteen looks at 4K60

One fresh live browser scene per room at 3840×2160. Browser animation-frame timings came from requestAnimationFrame inside the OBS browser source. Each preset and bypass had two eight-second windows per scene, in reverse order on the second pass. The long-interval column counts browser intervals over 33.4 ms. OBS compositor misses are counted separately. The changing live crowd and short windows limit small comparisons.

| Scene | Look | Browser fps (mean) | Worst window p99 (ms) | Browser intervals >33.4 ms | OBS missed / observed | Visible walkers |
|---|---|---:|---:|---:|---:|---:|
| lobby | Filter off | 60.00 | 16.8 | 0 | 0 / 966 | 35 / 42 |
| lobby | Neon rain | 59.88 | 16.8 | 0 | 0 / 966 | 34 / 35 |
| lobby | After-hours mall | 59.94 | 16.8 | 1 | 0 / 967 | 41 / 39 |
| lobby | Pearl diffusion | 59.69 | 33.3 | 0 | 0 / 967 | 40 / 37 |
| lobby | Chrome & cyan | 60.00 | 16.8 | 0 | 0 / 965 | 40 / 35 |
| lobby | Pink halation | 60.00 | 16.8 | 0 | 0 / 967 | 32 / 31 |
| lobby | Miami dusk | 60.00 | 16.8 | 0 | 0 / 965 | 29 / 28 |
| lobby | Anamorphic neon | 60.00 | 16.8 | 0 | 0 / 965 | 31 / 32 |
| lobby | Star-filter glass | 60.00 | 16.8 | 0 | 0 / 966 | 36 / 35 |
| lobby | Curved CRT | 60.00 | 16.8 | 0 | 0 / 966 | 34 / 37 |
| lobby | VHS rental | 59.50 | 16.8 | 1 | 0 / 970 | 32 / 39 |
| lobby | Milk-glass pastels | 60.00 | 16.8 | 0 | 0 / 968 | 33 / 36 |
| lobby | Ultraviolet arcade | 60.00 | 16.8 | 0 | 0 / 965 | 35 / 33 |
| lobby | 35 mm midnight | 60.00 | 16.8 | 0 | 0 / 967 | 35 / 35 |
| auditorium | Filter off | 59.69 | 16.8 | 2 | 0 / 969 | 135 / 137 |
| auditorium | Neon rain | 60.00 | 16.8 | 0 | 0 / 965 | 135 / 135 |
| auditorium | After-hours mall | 59.94 | 16.8 | 0 | 0 / 969 | 135 / 137 |
| auditorium | Pearl diffusion | 60.00 | 16.8 | 0 | 0 / 967 | 135 / 136 |
| auditorium | Chrome & cyan | 60.00 | 16.8 | 0 | 0 / 969 | 135 / 136 |
| auditorium | Pink halation | 60.00 | 16.8 | 0 | 0 / 967 | 136 / 136 |
| auditorium | Miami dusk | 59.63 | 16.8 | 3 | 0 / 969 | 136 / 136 |
| auditorium | Anamorphic neon | 59.94 | 16.8 | 1 | 0 / 968 | 136 / 136 |
| auditorium | Star-filter glass | 59.94 | 16.8 | 0 | 0 / 967 | 136 / 136 |
| auditorium | Curved CRT | 60.00 | 16.8 | 0 | 0 / 967 | 136 / 136 |
| auditorium | VHS rental | 59.69 | 16.8 | 0 | 0 / 969 | 136 / 136 |
| auditorium | Milk-glass pastels | 59.88 | 16.8 | 0 | 0 / 967 | 136 / 136 |
| auditorium | Ultraviolet arcade | 60.00 | 16.8 | 0 | 0 / 968 | 135 / 135 |
| auditorium | 35 mm midnight | 59.94 | 16.8 | 0 | 0 / 965 | 135 / 135 |

Full sweep data is in the local QA file `motion-full.json`.

## Promoted collection · 27 Nov 2026

OBS 32.2.2 loaded six lobby looks and two auditorium looks. The collection opened with Neon rain at 85% and Pearl diffusion at 55%. All eight changed the native image at their configured strengths. After all looks were switched off, both plates matched their original images byte for byte.

In the live browser test the original Color Key made 93,186 interior pixels transparent under bypass and under both auditorium looks. All 97,902 interior calibration-film pixels matched bypass with either grade. A thin green fringe was visible on part of the original keyed edge under all three settings. The live pages reported nine lobby guests, 134 seated guests and zero page exceptions. The [comparison video](qa/looks-comparison.mp4) shows each promoted strength against bypass on a fixed OBS frame.
