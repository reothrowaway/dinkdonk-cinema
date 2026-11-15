# Brief 102: auditorium screen shots in the page, control buttons, OBS green key (QA)

15 Nov 2026. Agent: Claude Opus 5.5. QA files only: nothing live was edited, nothing committed, pushed, deployed or
zipped. Port 18770, the chat relay and the owner's bridge on 18790 were not touched; the owner's OBS was not running and
his loaded collection file was only read. Tests ran on a spare server (18771, stopped afterwards), with headless Edge
(through edgeguard, none left) and the portable QA OBS (minimized to tray, stopped afterwards). Real chat only
(`?everyone=1`, relay 18765 live, 135/135 seated). No downloads.

## What was built

| File | What |
|---|---|
| `roxy3d/aud101/page/final/` | The pack: `T1.webm`, `T2.webm`, `T3.webm` (colour + two depth tiles, VP9 1920x1620), `T1-3-camera.json`, `hold_t2_depth_tiles.png`, `hold_t2_camera.json`, `report.json`. Copied next to them: `hold_t2.png`, `hold_t2@2x.png`, `hold_t2.json`, `t1/t2/t3_screen_corners.json`. Made with `build_page101.py --src cloud-final-result/aud101-final --label final` (Blender's Python). |
| `shared/aud-shots-qa.js` (new) | The shots player (modelled on `shared/transition.js`). |
| `auditorium-qa.html` | Loads the player. Adds the `shot` command, `shots` in the screen state, the `DD_AUD` hooks, and a camera hold for the shots. While shots run there are no automatic follows, no glow, beam, dust or bubbles, and the aisle lights fade out. Backup: `roxy3d/qa-night/auditorium-qa.before-shots102-15nov.html`. |
| `control-qa.html` | Pre-show card: **Into the film (T1)**, **Out of the film (T2)**, **Back to the room (T3)**, plus **Stop shots**, and a status line. Backup: `qa-night/control-qa.before-shots102-15nov.html`. |
| `obs-bridge-qa.js` | Shot requests over the page socket (`cut-film`, `warm`, `cut-cinema`, `layer-under`, `layer-over`), `POST /cut-to-film`, keyed-setup detection, `OBS_FILM_SCENE` (default "Film fullscreen"). Backup: `qa-night/obs-bridge-qa.before-shots102-15nov.js`. |
| `roxy3d/qa-night/tools/obs-shots-setup.mjs` (new) | Sets up the portable OBS's "QA" collection for the shots. |
| `roxy3d/qa-night/tools/obs-rec-shots.mjs` (new) | Records T1, the film, T2, the hold and T3 in the portable OBS through the panel commands, and logs the scene cuts with times. |
| `roxy3d/qa-night/film-standin-102.mp4` | Stand-in film: a generated test pattern with green removed, so any green left in the recording is a fault (38 MB, can be deleted). |

**Pack check (`report.json`).** All 873 frames packed. Depth round trip: median relative error 0.1-0.5 %, p99 3-11 %
(edges), validity mismatch at most 0.9 %. Hold depth: 100 % valid, z 4.25-17.96.

## How it works

- **T1** (`shot t1`) is accepted only in the Film phase with the house lights down.
  - The glow, beam, dust, aisle lights and flashlight fade out (1.7 s). The emote atlas fills.
  - The camera eases onto the exact Film framing (`screenShot()`) if it is not there, and holds it.
  - Then the canvas shows video frame 1 and T1 plays.
  - Headless check: frame 1 matches the live page (the page projection and the frame-1 camera agree to 0.001 px).
  - About 0.4 s in, the bridge moves the film **under** the auditorium. At the last frame (all green = the film full frame) it cuts OBS to **Film fullscreen**.
- **T2** (`shot t2`, only after T1):
  - The canvas shows T2 frame 1.
  - The bridge's warm-up puts the auditorium source off-canvas in the film scene for 2.5 s, then cuts back to DinkDonk Cinema, then T2 plays.
  - At the end, the 4K hold plate and its depth replace the video. The chatters stay live: seated, hopping when they type, arriving, leaving, emotes animating.
- **T3** (`shot t3`, only from the hold):
  - The page under the canvas snaps to the wide view and is shown again.
  - Its last 40 frames keep the screen green, instead of the plate handover fading it to dark.
  - At the last frame the bridge puts the film back **on top**, then the canvas hides. The live page carries on: lights down, film on, wide shot, with no push-in (shot "movie").
- **Chatters.** Every chatter is an upright card drawn through each frame's camera. They match the page's size, hop, tilt, mirror and row light, and the popcorn and soda are drawn too. Occlusion:
  - the video's depth (next rows, seat backs);
  - the seated chatter's own backrest top, worked out in 3D (the page's clip). Without it, frame 1 showed the lower bodies;
  - names under the feet by the page's rules (`nameWant`).
- **Green for the key.** Inside the per-frame screen quad, mostly-green pixels are written as exact (0, 255, 0). The rest, plus a rim of 8 px, is despilled. Over the green, a card is drawn either opaque or not at all, so no half-green halos.
- **The film's corners.** Sent once per shown video frame, from `t1/t2/t3_screen_corners.json`; latest-only as before. During the hold, the hold plate's corners.
- **Why the film is only under during the shots.** With the film under all the time, the page's own live screen left a 1 px half-green line along its bottom edge: Chrome resamples the zoomed room, and the pinned film ends a pixel short. No small key removes that line. So outside the shots nothing changes from today: film on top, screen black. The shots' canvas despills its own rim, so it is clean.

## The recording

- **`roxy3d/qa-night/rec/shots102-T1-T2-hold-T3-15nov.mp4`**: 23.9 MB, 55.9 s, 1920x1080 at 60 fps, from the portable OBS.
  - Setup: real chat, full house, stand-in film, the colour key at similarity 1 / smoothness 1.
  - Timeline: live Film shot → T1 at 4.6 s → cut to the fullscreen film at 12.7 s → cut back at 20.3 s → T2 → hold 31.4-39.9 s → T3 → live page from 51.5 s.
- **Frame checks** (every frame decoded with ffmpeg at 960x540; contact sheets looked at):
  - **Key green left anywhere:** 0 px in every frame.
  - **Greenish pixels:** at most 22 px per frame, except 4 recorded frames at T1's start, which show up to 209 px (see below).
  - **Film on the screen during the moves:** yes, in T1, T2 and T3.
  - **Seat backs in front of the film in T2:** yes. The low pass over the back rows was checked at 27.2 and 27.7 s; chatters' heads also stay in front of the film in the hold.
  - **No jump at the cuts:** largest frame-to-frame change 5.7 of 255 at the cut to the film, against about 1.3 normally. The difference image shows only the moving test pattern; the grid does not move. At the cut back it is 0.9. At T1's start it is at most 1.8; earlier takes had a 0.13 s black flash (fixed).
  - **Hold → T3 frame 1:** 6.4 of 255, from the plate against the first video frame and the chatters.
  - **T3 → live page:** under 0.5 of 255. The page's glow and beam then fade back in.
  - **OBS:** 0 output frames skipped.
- Four earlier takes found three problems, all fixed:
  - the packed video flashed for 2 frames at T1's start;
  - green halos round cards, because the key test read the atlas texture;
  - the film vanished for 0.13 s when the layer switch came too early.

## The OBS copy for the owner: "Moobies 1440p transitions"

The new file is `%APPDATA%\obs-studio\basic\scenes\Moobies_1440p_transitions.json`.

**Source:** a copy of **"Moobies 1440p poll"**, the collection OBS has loaded and `start-all.bat` starts. It holds the film setup and the bridge items. The brief named "Moobies 1440p", but that older file has no film source. The poll file itself is unchanged.

**What changed in the copy (nothing else):**
1. "Browser 3" (the auditorium) points at `http://127.0.0.1:18770/auditorium-qa.html?everyone=1`. The shots exist only in the QA page.
2. A Color Key filter, "Key #00ff00", on "Browser 3": custom colour #00ff00, similarity 1, smoothness 1, the smallest values. Pepe and other green emotes stayed intact in the test.
3. "Film screen (src)" sits under "Browser 3" in "DinkDonk Cinema". While running, `obs-bridge-qa.js` puts it on top and moves it under only for the shots.
4. A new scene, "Film fullscreen": the VLC "Game Capture" stretched to 2560x1440, exactly as inside "Film screen (src)", so the cut at T1's end is seamless.

The copy loaded cleanly in the portable OBS: all scenes, the key filter and the scene order were read back.

**The owner's steps:**
1. Start everything as usual (`start-all.bat`). In OBS: Scene Collection → **Moobies 1440p transitions**.
2. Close the "OBS bridge (:18790)" window. In the `standby` folder run **`node obs-bridge-qa.js`**. It uses the same port and password, and does everything the live bridge does.
3. Open `http://127.0.0.1:18770/control-qa.html` and set Scene to Auditorium. Press Lights down, then Film. Then:
   - **Into the film (T1)**;
   - when you want the room back, **Out of the film (T2)**: it holds over the heads as long as you like;
   - **Back to the room (T3)**.

   **Stop shots** ends any shot and shows the live page again.
4. To go back: Scene Collection → Moobies 1440p poll, close the QA bridge, `start-obs-bridge.bat`.

## Not verified / to know

- **Not tested:** the owner's own OBS (websocket 4455 with password), the real VLC capture, and a real film. Only the stand-in film in the portable OBS was used.
- **T1's start:** for 2 page frames (0.07 s), a faint dark-green 1 px line shows just above the screen's top edge. This is while the film is still on top of the canvas: OBS's film corners lag the page by a frame or two.
- **The hold and T2's low pass:** the back-row chatters right in front of the camera are very large and soft. These are small emote images seen close up, and the cards fade only within about 1 world unit of the lens. Worth a look by the owner.
- **Delays:**
  - T1 starts about 1.7 s after the button (the page's lights fade out first, so nothing pops).
  - T2 starts about 2.7 s after its button (the warm-up before the cut back).
- **Not drawn in the shots:** phones, the golden aura, the usher's flashlight and speech bubbles. Bubbles are hidden while shots run.
- **After T3** the page sets its own shot to "movie" (the panel shows Movie). The shared room is not told, so a room snapshot (reconnect) could bring the push back.
- **Page reload:** a reload of the auditorium source in the middle of the shots loses the shot state. Use Stop shots, or switch the OBS scene by hand.
- **Wide shot zoom:** with "Wide shot zoom" above 1, the page eases from the default view to that zoom after T3.
- **Preview screens** play the shots too; only the OBS one drives OBS.
- **Portable OBS:** its "QA" collection now also has "aud", "Film stand-in" and "Film fullscreen". Its lobby `page` URL was restored.

STATUS: BUILT AND RECORDED (QA ONLY) - roxy3d/aud101/page/final/ (pack, report OK), shared/aud-shots-qa.js, auditorium-qa.html + control-qa.html (T1/T2/T3 + Stop), obs-bridge-qa.js (cuts, warm-up, film layer per shot, keyed detection); PORTABLE OBS RECORDING roxy3d/qa-night/rec/shots102-T1-T2-hold-T3-15nov.mp4 (23.9 MB, 55.9 S): KEY GREEN 0 PX IN EVERY FRAME, FILM ON SCREEN THROUGH THE MOVES, SEAT BACKS AND HEADS IN FRONT OF THE FILM, NO JUMP AT THE CUTS, T3 LANDS ON THE LIVE PAGE; OBS COPY "Moobies 1440p transitions" (FROM "Moobies 1440p poll", LOAD-TESTED); NOT TESTED IN THE OWNER'S OBS / REAL VLC FILM; NO COMMIT, NO DEPLOY, NOTHING LIVE.

## 102b - big chatters faded, everyone faces the screen (15 Nov 2026)

Owner, after the first recording: fix the huge blurry chatters in front of the camera first; then: "when on this camera
pos, the emotes should be all looking to the screen, so the left ones looking right, the right ones looking left".
Only `shared/aud-shots-qa.js` changed (backup `roxy3d/qa-night/aud-shots-qa.before-bigfade-15nov.js`; `node --check` OK).

- **Size cutoff.** A chatter whose picture (its larger side, width or height, on the 1080 frame) grows past 295 + 12 px
  fades out over 0.4 s, and fades back in below 295 - 12 px (the margin stops a hopping chatter flickering).
  Settled cards are fully in or out, so the still hold has no half-faded ones. Over the film a card that is mid-fade
  dissolves in a 4x4 Bayer pattern (the key needs opaque-or-nothing). QA: `?shotbig=<px>,<margin>`.
  - Measured in the hold (headless, real chat, 137 chatters): the rows run about 580-820 / 430-540 / 300-360 /
    250-290 px. A height-only test missed wide emotes (the big cat); taking the front row away shows the next one, so
    the cutoff sits under the 300-360 row: the hold now shows one tidy row of normal-sized chatters over empty seat backs.
- **Facing the screen.** In T2 and the hold, each chatter with a left/right emote (`shared/emote-facing.json`) looks
  toward the screen's centre as the hold camera sees it (left of it -> right, right of it -> left); 'front' emotes keep
  the page's facing. Decided with the hold camera, so nobody turns during T2's move. In T3 they turn back to the page's
  facing one by one between 35 % and 60 % of the shot. A turn is a 0.32 s narrow-and-open (the card squeezes to
  nothing and opens mirrored). QA: `?shotover=1` forces the over-the-heads facing (for still checks).
- **Recording:** `roxy3d/qa-night/rec/shots102b-bigfade-facing-15nov.mp4` (22.8 MB, 53.3 s, 1080p60, portable OBS,
  18771, real chat, 135 seated). Frame checks: key green 0 px in every frame; greenish pixels only a real yellow-green
  emote in T2's low pass; biggest frame change 7.0/255 (hold -> T3 frame 1, as before); 0 output frames skipped.
  First take of this round was discarded: I ran the OBS setup after starting the bridge, so the film sat under the
  page before T1 (test order, not the page).
- **Not verified:** the turns in T3 were not looked at frame by frame; the cutoff is tuned on one house (full, 135
  seated); not in the owner's OBS.

STATUS: 102b DONE (QA ONLY) - size cutoff 295 px (hysteresis 12, 0.4 s fade) + screen-facing in T2/hold, turn back in
T3; recording shots102b-bigfade-facing-15nov.mp4 checked; nothing live, no commit.

## 102c - jannies on screen duty (15 Nov 2026)

Owner: whenever an auditorium mode is on (lights down, zoomed camera, ...), mods spawned as the mopping penguin must
always mop around the cinema screen so they are seen there; with no mopping mods, always spawn two mods picked at
random from a list. Only `auditorium-qa.html` changed (backup `roxy3d/qa-night/auditorium-qa.before-janduty-15nov.html`).

- **When:** house lights down (Lights down / Film), the camera's push onto the screen, or the screen shots T1-T3
  running. Not the director's quick follows of arrivals (they come and go all the time in seating; first test had
  the duty flicker on with them). `?janduty=0` turns it off.
- **Where:** front-floor spots (u 1.1-16.5, v 1.35-1.75) whose penguin is fully inside the zoomed Film framing, kept
  off the dark corner by the wall, spread 1.2 apart: five spots u 3.8-9.5 at v 1.35, on the floor along the screen's
  light strip. Jannies hop between them as usual; on duty they never clock off for silence and take no shush errands
  (the usher shushes instead). A mod's ban escort still takes them out briefly.
- **Two mods when none are there:** picked at random from mods seen in chat since the page loaded (messages or
  joins, admins and bots left out), else `MOD_LIST` = tdnPanda, Lemmiwinks, Mitch, Bing, Titan (the mods online in
  DGG chat on 15 Nov, read from the relay's user list; Destiny left out). Their names show in mod colour. When the
  duty ends they go home unless they spoke in chat meanwhile; real jannies go back to the whole front floor.
- **Headless test** (18771, real chat, `?everyone=1`): seating no duty and no spawn; Lights down: two mods walked in
  within 1 s and reached the screen spots in ~20 s; Film: both stayed in frame in the zoomed shot for the whole
  minute (screen positions x 300-890, y 744-1006 of 1080), mopping by the screen; Lights up: both clocked off and
  were gone ~20 s later. Screenshot checked.
- **Not verified:** a real mod speaking during the duty (none spoke in the test); in the T2 hold the front floor is
  behind the rows, so the jannies are not seen there; not in OBS.
- Mishap: one edit went straight into the QA page and cut a line, so the QA page did not run for ~5 minutes (QA only,
  nobody watching it; the live page was not touched). Fixed; later edits went through a checked copy.

STATUS: 102c DONE (QA ONLY) - jannies on screen duty + two random mods; headless test OK; nothing live, no commit.
