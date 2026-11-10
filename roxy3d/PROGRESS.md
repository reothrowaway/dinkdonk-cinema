# Progress log

- 01 Nov 22:45 - goal set (weekly usage 25%). Codex pass 1 (stills + occluders) running.
- 01 Nov 22:40 - Codex pass 1 done: Blender scene, Cycles stills, 17 occluders / 66 depth slices, calibration 0.016 px.
- 01 Nov 22:50 - Claude: roxy.html loads roxy3d/out/manifest.json (bg + z-sorted slices, @2x at hi-res, glow under chatters),
  DOM door signs sit in the rendered marquee boxes, baked signs' DOM copies hidden, ?art=flat keeps the blockout.
- 01 Nov 22:55 - Codex pass 2 started (BRIEF-3-pass2.md -> out2/): counters against the walls (owner QA), grittier
  materials, base + seamless light loop.
- 01 Nov 23:05 - Claude: layout data per manifest ("layout": 2 switches routes), two ticket windows (2nd opens at 3+ in
  line), 3 snack registers with own clerks, light-loop video support (plus-lighter, falls back to full.png),
  ?artdir= / ?layout= / ?loop=0 for testing; door-sign flash driven by the frame loop (CSS animations stall
  in headless/throttled sources).
- 01 Nov 23:15 - Claude: umbrellas (35% of chatters, open only outside), splash rings when hopping on the wet
  pavement, arcade detour (7%: plays a round, "GAME OVER" / "NEW HIGH SCORE"). QA screenshot ok, no errors.
- 01 Nov 23:10 - Codex review #1 (reviews/review-1.md). TAKEN: P1 frozen walkers on re-talk (figures set keeps
  retiring walkers updating), P1 unbounded chat stats/maps (core.js prunes every 200 msgs, cinema.js caps maps at
  4000), door lock (doorRoom; counter goes to the door actually used), case-insensitive purge, restroom/offscreen
  bubbles held until visible, snack registers queue (one served, others wait behind), arcade route around the
  cabinet, art manifest validation + 5 s timeout, @2x->1x image fallback, poster retry after failure, loop video
  fallback to the lit still, transforms only written when changed, renderTokens ellipsis, ?green= validation,
  empty emote pool fallback. DESIGN: names only while new (7 s) or talking, dark name backing, square Verdana
  90s dialog bubbles (3 lines max), solid door signs with 2-line titles, "0 went in" hidden, "LOCAL" clock,
  staff caps (red; usher maroon with gold button), per-arrival sidewalk lanes.
  DEFERRED: self-hosted fonts (OBS is online; revisit), bubble collision layout, 30 Hz rain, staff gags.
- 01 Nov 23:25 - Codex pass 2 delivered (out2/): layout 2 (box office + snack bar as counters against the 90 px
  walls, staff behind), grittier materials, base + 5 s seamless additive light loop (2.8 MB VP9). Claude: page
  now defaults to out2 (?artdir=out for pass 1), loop plays with plus-lighter, QA at 1080p + 4K ok (green rect
  pure at 4K, @2x crisp), float texts stack instead of overlapping.
- 01 Nov 23:30 - Codex pass 3 started (BRIEF-4-vehicles.md -> out3/: bus, taxi, two sedans, both directions,
  additive headlight sprites, lit_bg fallback). Codex review #2 started (design of pass 2 + verify fixes + routes
  vs new footprints).
- 01 Nov 23:40 - Codex review #2 (reviews/review-2.md): confirmed review-1 fixes, all layout-2 routes clear the 18
  props. TAKEN: real snack lines per register (max 3, head served, line moves up; overflow skips popcorn), speech
  above announcements + 18 px + pointer no longer clipped (clamp on inner .bt), wide emotes fitted to 74 px,
  staff call-outs rate-limited (staffSays, 6 s), JS rain off while the light loop plays, loop: 6 s first-frame
  deadline -> lit still, stall nudge (never drops a working loop), ?loop=0 uses the lit still, broken manifest
  entries skipped, pending speech for hidden speakers (no longer evicts visible bubbles), film change resets its
  count, restroom: one inside + one waiting beside the door, figure ceiling 80, window 2 opens on pre-dispatch
  line length, green-off board refreshed with the HUD, emote loading bounded (8 s) + bad names filtered, arcade
  route with clearance, sidewalk lanes 9.78-10.05, arrivals staggered per side. NEW charm: warm light wedge out
  of a door when someone goes in, arcade screen flash after a round. Signs inset into the rendered marquee
  (bevel visible), screen 1 sign above screen 2.
  DEFERRED: carpet contrast + warm light at service points (-> next Codex art pass), self-hosted fonts,
  ticket-tear / umbrella-fold animations.
- 01 Nov 23:50 - Codex pass 3 delivered (out3/): bus, taxi, 2 sedans x 2 directions, additive road lights, open-door
  variants, lit_bg fallback, arrival_stops. Claude: traffic in roxy.html - a passing car every 6-16 s both ways,
  a bus every 50-100 s that stops at the shelter (dwell grows with riders), taxis (10% of arrivals) drive a
  chatter to the entrance; riders stay hidden until their vehicle stops, then step out ("thanks driver!");
  lane following keeps gaps (cars queue behind a stopped bus). Default art = out3. QA screenshot ok.
- 01 Nov 23:55 - Codex pass 4 started (BRIEF-5-pass4.md -> out4/: calmer carpet, warm light at service points,
  prop loops: popcorn popping, arcade attract mode, buzzing boards). Codex review #3 started (traffic code).
- 02 Nov 00:00 - Codex review #3 (reviews/review-3.md): review-2 fixes confirmed; 10-min crowd sim found no traffic
  leak. TAKEN: snack places reserved when the register is chosen (hard max 3 incl. people on their way), riders
  get off one at a time and the vehicle waits until all stepped away (max +10 s; riders of a departed vehicle
  walk out), rider membership tracked (purge/caps), cars never move into the one ahead + spawn only on a clear
  lane, curb-side walkers drawn behind vehicle bodies, vehicle sprites follow 1x/2x on resize + @2x->1x fallback
  + a car whose body can't load leaves the road, restroom admits the next one only after the doorway is clear,
  stalled loop -> lit still after ~18 s, emote width cap is now hard (min 16 px tall), depth_slices validated,
  one "thanks driver!" per stop, arrival name timer starts when the rider appears, splash on stepping out,
  signs 150 px wide (screens 1/2 no longer overlap much).
  DEFERRED: bus depth slices (P2, needs Codex), late emote CSS refresh, film identity keys, brake lights.
- 02 Nov 00:20 - Codex pass 4 delivered (out4/): carpet contrast -60 %, warm pools at windows/registers/gate/doors,
  dimmer lobby, quieter counter tops, 8 additive prop loops (2 popcorn machines, arcade attract mode, 3 menu
  boards, soda fountain, TICKETS "E" flicker). Claude: prop-loop sprite sheets stepped by the frame loop
  (plus-lighter, 1x/2x), default art = out4. QA screenshot ok, no errors.
- 02 Nov 00:25 - Codex pass 5 started (BRIEF-6-pass5.md -> out5/: vehicle depth slices, brake/indicator lights,
  lobby cat sprite sheets, tyre spray). Codex review #4 started (design & feel, next 10 additions).
- 02 Nov 00:35 - Codex review #4 (reviews/review-4.md, design & feel + 10 ranked additions). TAKEN: speaker name in the
  bubble header (floor label hides while talking, arrival names 5 s), staff call-outs replaced by gestures
  (second cashier waves = hop; usher points ◀/▶ to the chatter's wing), ticket stub carried from the box office
  and torn by the usher (#1 addition), arcade attract loop stops while someone plays (#6, partly), header now
  "INTERMISSION" + "NEXT MOVIE NIGHT · <date>" ("back in a moment" only while a night is live), signs show
  number + title + one detail (rating), subtler splash rings, hard emote width cap, bus admits max 6 riders and
  only while it can unload them; riders still inside at a forced departure get off at the shelter instead.
  FOR CODEX PASS 6: separate the screen 1/2 marquee+poster stacks, material wear on counters/thresholds,
  shaded umbrella sprites + fold frames, door leaves that open, shelter drip loop, janitor NPC, bench regular.
- 02 Nov 00:50 - Codex pass 5 delivered (out5/): vehicle depth slices (28 sections), brake + indicator lights,
  ginger lobby cat (sleep, sit, stretch, 4 walk cycles), tyre spray. Claude: vehicles drawn as z-sorted slices
  (curb-side z hack removed), brake lights while slowing/stopped, bus/taxi indicator blinks pulling in/out,
  tyre spray one-shots off the rear wheel, generic sprite-sheet helpers, the cat (sleeps at 4 spots, stretches,
  walks axis-aligned routes via a lobby hub, sits, wakes when someone hops right past). Default art = out5.
- 02 Nov 00:55 - Codex pass 6 started (BRIEF-7-pass6.md -> out6/: separate screen 1/2 stacks + poster_frames in
  the manifest, material wear, door open sheets, umbrella sprites, janitor NPC, shelter drip loop).
  Codex review #5 started (pass 5 integration code, cat routes vs footprints).
- 02 Nov 01:10 - Codex review #5 (reviews/review-5.md): no P1; slices du correct both ways, all 12 cat routes clear all
  props (3,618 checks), bus admission verified. TAKEN: vehicle slice swaps decode-then-swap with a generation
  guard (stale errors can't remove a vehicle), riders of a vanished vehicle get off at the shelter (shared
  releaseRiders), light variants preloaded, steady brake light while parked (indicator only pulling in/out),
  dt-based brake detection with 0.3 s hold, tyre spray on the ground layer (z 4), cat + one-shots follow 1x/2x on
  resize, sheet @2x->1x fallback, manifest validation for cat/spray/slices (validSheet), usher locks the door
  it points to, stub follows emote width, cat only woken by visible moving chatters, one-shot cap 12, frame
  errors caught so the loop never stops, bubbles clamped inside the stage with the pointer aimed at the speaker.
  OPEN: combined brake+indicator light (needs an indicator-only sprite), screen 1/2 stacks (pass 6).
- 02 Nov 01:45 - Codex pass 6 delivered (out6/): separated marquee/poster stacks (manifest marquees + poster_frames),
  wear on counters/thresholds/glass/pavement, 6 door open-close sheets, umbrella sprites (4 colours + fold),
  janitor (4 walks, sweep, watch-check idle), shelter drip loop. Claude: signs + posters placed from the manifest,
  doors swing open when someone goes in (and for the restroom), umbrella sprites held outside and folded at the
  door, generic NPC walker (cat refactored onto it) + the janitor (walk -> sweep -> check watch -> next spot),
  float-stacking memory = animation length. Default art = out6. QA screenshot ok, no errors.
- 02 Nov 02:00 - Codex review #6 (reviews/review-6.md): verdict "convincingly evokes a late-90s isometric game (Sims /
  Theme Hospital with a rainy neon-cinema palette)"; remaining gap = crowd presentation + interaction timing. NPC
  routes re-verified (cat 3,618 + janitor 3,216 checks clear), posters/marquees exact. TAKEN: umbrella fold animates
  in the owner's hand (follows hops/fade), grip at the asset's [10,-40], umbrellas follow 1x/2x on resize, a door
  re-opens for someone arriving while it swings, sign text fits each aperture (rating + count share one row,
  compact 1-line title for the smaller screen-4 box), "BOUGHT ONLINE"/"HAS A TICKET" replaced by the stub,
  gate/entrance spread (personal offsets), shorter + smaller rectangular combo badge, rectangular clock panel,
  shaded staff caps and stubs, bubble collision layout (overlapping bubbles stack upwards).
- 02 Nov 02:25 - Codex pass 7 delivered (out7/): rendered popcorn tub, soda cup, stub, ticket, cashier + usher caps;
  indicator-only light sprites. Claude: items attached at emote-relative points (follow emote width changes),
  flying ticket/stub use the sprites, staff wear the rendered caps, bus/taxi brake light stays steady with the
  indicator glow blinking on top (also while parked). Default art = out7. QA at 4K ok, no errors.
- 02 Nov 02:35 - Codex review #7 (final, reviews/review-7.md): no P1; "visually good enough for a first stream".
  TAKEN: doors held open while someone else arrives (animation wound back to its hold), bubble stacking bounded to
  the stage (side placement, else the older bubble waits), staff caps sit on the emote's actual height.
- 02 Nov 02:40 - LOOP STOPPED: result is good (reviewer verdict), weekly usage 27 % (< 35 % budget). README + gallery
  updated. Not verified: live DGG chat through the DSA relay, inside OBS, real 60 fps at 4K on the stream PC.

## 02 Nov morning - owner's new asks: surroundings + heavy rain (pass 8)
- 08:25 - Owner: fill the empty areas (buildings across the street = roofs bottom-left, neighbours left and right
  of the cinema), much heavier rain, stronger water on the street and the cinema glass, stronger reflections,
  and implement Codex's suggestions too.
- 08:35 - Codex review 8 (reviews/review-8-suggestions.md): surroundings plan with occlusion envelopes
  (H <= 60(v-13.5)-48 across the road, H <= 60(u-13)-48 right of the cinema), rain density numbers, 6 s/144-frame
  loops, foreground rain layer, per-glass-slice water, additive-limitation warning, VP9 CRF 16-22, plus 7 ideas.
  All taken: art in BRIEF-9-pass8.md (Codex), page ideas done by Claude.
- 08:40 - Page: generic playLoop() (first frame <= 6 s, stall nudges, drop after ~18 s) for the light loop and a new
  #rainfg video (manifest rain_fg, plus-lighter, z 70001: above walkers/vehicles, below signs/bubbles/HUD);
  procedural fallback rain 150 -> 520 drops in two depths; prop loops honour blend: source-over (glass water).
- 08:45 - Page (Codex C1-C6): usher gate line (one at the gate, holding spots beside the podium / snack counter end,
  serveGate) + personal space (a walker about to walk into the back of someone just ahead waits, max 1.5 s, then
  goes); bubbles never cover the HUD or billboard and avoid door titles + gate sign when another spot is free
  (pointer recomputed after any move); contact shadow sized to the emote and shrinking mid-hop; outdoor emotes
  slightly dimmer; arcade screens attract -> play -> hiscore (when the art has them); bench patron waits for the
  next arrival ("there you are!"); wet prints behind people coming in from the rain (items.wet_print or CSS).
- 08:45 - BUG FOUND: standby-server.js had no .webm type, so light_loop.webm was a 404 and the pre-rendered
  rain/neon loop never played through the server (the page silently used the lit still). Fixed: video MIME
  types + byte-range responses. The owner's running server (start-standby.bat) needs one restart.
- 08:45 - Codex pass 8 first preview: right layout (opposite workshops, left apartments + video rental, auditorium
  block, alley + annex + right apartments, billboard tower, 3D distant city) but far too dark; stopped and resumed
  with BRIEF-9b-lighting.md (sky, fill, lit windows, neighbour signage, roof detail).
- 09:22 - Codex pass 8 delivered (out8/): lit city block, 6 s downpour loop + rain_fg, wet reflections (minimum base +
  differences), drainage/drips, 9 glass-water slices, entrance mat/threshold, wet_print item, arcade_play/hiscore.
  Occlusion 0, aperture exact, seams/black level ok. Claude: default art = out8; both videos verified playing.
- 09:35 - Codex review 9 (reviews/review-9.md): no P1; "reads as one rainy city block". TAKEN (Claude): server empty-file
  crash + stream leak on aborted requests, bounded gate line (extras wait inside), bubble lifetime only runs while
  shown, playLoop kill/detach (no hidden restart), coordinated weather fallback (one foreground rain renderer at a
  time; tested fg-fail and base-fail), lighter marquee inserts. Art items -> BRIEF-10-pass8b.md.
- 10:10 - Fresh, context-free GPT-6 Astra xhigh feedback (reviews/fresh-xhigh-feedback.md). Owner's picks queued in
  QUEUE-owner.md - NOT to be started until his next list.
- 10:24 - Codex pass 8b (out8b/): stepped distant roofs + haze, denser rain, wetter glass, broken reflections, textured
  alley/roof, 18 carpet outlines removed, lit_bg_dry fallback. Default art = out8b; verified in the browser (both
  videos, no errors). Not verified: OBS/CEF performance on the stream PC.

## 02-03 Nov 2026 - final render (out10) on RunPod, owner asleep
- 21:18 - `bash cloud/cloud-render.sh full` from the draft-13 bundle (BRIEF-26). Pod e9drr2tw6upc4e, RTX 5090 secure,
  $1.19/h; credit ~$9.40 at launch; helper cap 7 h.
- 21:36 / 22:23 - background loops done (48 frames: 1080p ~19 s/frame, 4K ~41 s/frame).
- 23:30 - problem: every foreground group was marked dynamic (any glossy/glass/metal material) and rendered 48 frames
  x 2 scales at ~9 s/frame (4 s Cycles + ~5 s per-frame scene sync, the same at 1080p and 4K) = ~15 min per group.
  39 groups -> ~10 h: over both the 7 h cap and the credit, and the helper would have deleted the pod with nothing
  delivered. Fix (Claude): production.py `INTERIOR_STATIC` - the 25 indoor groups (podium, lobby props, queue ropes,
  restroom, corridor) render one frame per scale (no rain, constant light indoors, so their loop was ~empty
  anyway); the 10 outdoor/glass groups keep the full 48-frame wet loop. Killed the pipeline without an EXIT marker,
  moved the partial pod output to out10.run1, updated BUNDLE-SHA256SUMS, relaunched; finished Cycles buffers are
  reused from the cache (runtime.py unchanged). Original saved as cloud/bundle/production.py.orig-full1.
  Also found: the first launch had no pod watchdog (RUNPOD_POD_ID is not in the ssh env) and its EXIT marker was
  hard-wired to 0 (`$?` expanded locally). The relaunch exports the pod id (watchdog armed) and writes the real code.
- 00:20 - page (roxy.html) vs the layout-3 manifest template: stall routes read `route_points` (the template's name).
  Codex read-only review (reviews/review-10-code.md, 9 x P2/P3), all checked against the code and fixed by Claude:
  ticket window no longer pulls someone across the ropes (they walk the lane first); gate arrivals from the east go
  round the usher podium (via gateIn); arcade route passes below the back rope; removing a chatter in a stall frees
  it and refreshes the WC light (a stray line had landed in the bench callback); LED text rows use the rendered dot
  rows (rows_px); posters use the frame's wall offset (were 4.3 px off); after the layout-3 sign surgery the room
  list is reapplied and signs renumbered (films 3-5 could show on screens 1-3 for 2 min); the 4K base now plays with
  light_loop_2x (its exact complement; `?loop2x=0` keeps the 1080p loop if the stream PC struggles); random poster
  chases only pick existing screens. Smoke test with out8b + ?layout=3 and 10 test chatters: no page errors.
- 00:13-02:37 - all 10 outdoor groups (48 frames), the 25 indoor statics, weather and the 8 door animations rendered.
- 02:46 - FAILED in the last packing step. video.py's decode check of light_loop_2x (4K VP9 crf 4) found 10 of 565,684
  black probe pixels at 1/255 (an additive layer: invisible) and raised. The helper then deleted the pod as designed,
  so all 5.5 h of renders were lost. Balance after: ~$2.77, not enough for a re-run (~5.5 h x $0.89-1.19/h).
  Fixes (Claude, bundle resealed with seal_bundle.py, only video.py/validation.py changed vs run 2):
  - video.py: black probe passes with codec noise <=2/255 on <=0.05% of probe pixels (was exactly 0);
    validation.py: the duplicate `decoded_black_max != 0` test is gone (it uses the video's own pass flag).
  - cloud-render.sh: a FAILED full run whose pod watchdog is armed now KEEPS the pod (render cache intact), downloads
    run.log/progress.log, and prints the repair command: fix, then `ADOPT_POD=<id> bash cloud-render.sh full`
    (moves the old out10 aside, reuses every cached render; the watchdog stops the pod 3 h after the failure;
    KEEP_ON_FAIL=0 restores delete-on-fail). Also fixed: EXIT records the real exit code and the watchdog gets
    RUNPOD_POD_ID (both via a pod-side launch.sh), and a full run refuses to start below $7.50 balance
    (MIN_BALANCE overrides) so a run cannot die mid-way from lack of credit.
  - Backups: cloud/backup-run2/ (run-2 checksums, original production.py and video.py).
- 03:05 - Codex read-only review of the never-run packaging tail (reviews/review-run2-packaging.md). Acted on: the
  black-noise allowance is now per decoded frame (it summed 5 frames against a one-frame budget). Not changed
  (Codex agrees they are sound or low-risk; a failure there is now repairable on the kept pod): exact slice/door/bus
  byte checks (exact by construction), the rain loop-seam assert, 4K memory use (passed in run 2), WebM duration
  metadata. Repair path note: any *.py change alters out10's fingerprint, so ADOPT_POD moves out10 aside and the
  pipeline re-walks every stage from the render cache (as the run-1 relaunch did). Bundle resealed again.
- 07:46 - owner topped up ($12.77). Run 3 started: RTX 4090 secure $0.89/h, watchdog armed (fixed launch path works).
  4090 measured ~31 s/frame for 1080p backgrounds (5090: ~20 s) -> projected finish ~14:30-15:00.
- 08:22 - STOPPED on owner's request after a render-time breakdown: ~60% of a run is 14 outdoor foreground groups x
  48 frames x 2 scales = 1,344 separate full renders at ~9 s (only ~4 s Cycles; ~5 s per-render scene sync).
  Owner wants the faster pipeline first: one render per frame cut into layers (object masks), 4K only + downscale,
  less per-render sync, 24 frames for subtle wet loops (needs a draft). Pod deleted, billing 0, balance $12.27.
- 03 Nov - BRIEF-27 (fast pipeline: one render per frame cut by masks, 4K only + downscale, less per-render
  overhead, 24-frame wet loops) sent to Codex. Owner then approved 24 frames as the default for the wet loops.
- 09:20 - Codex delivered BRIEF-27 (NOTES-FAST-PIPELINE.md, draft image qa10/draft14-fast.png, same look as draft 13).
  Per-render overhead 15 s -> 6 s (local), 4K-only + linear 2x2 downscale, combined mask capture for 6 of 39 groups
  (33 keep isolated renders: glass/soft edges differed beyond noise), 24 wet frames now the default (48 override).
  Packaging tail passed end to end at smoke scale. Projected full run: 5090 ~2.1 h/$2.46, 4090 ~2.7 h/$2.43
  (not measured on the cloud). Bundle resealed (sha f5b4d7b1...).
- 09:56 - Run 4 (fast pipeline, 24 wet frames): no 5090/4090 free -> L40S secure $1.09/h, pod m0dhqr1o60n2fn.
  4K backgrounds ~71 s/frame (done 11:01); combined masked foreground done ~11:21; isolated groups started.
- 11:26 - the pod became unreachable over ssh ("No route to host") and stayed so; at ~12:29 the Claude session
  ended and the local helper died with it. The pod kept rendering; billing (~6.4 h, $7.06) fits the pipeline ending
  ~13:20 and the pod watchdog stopping it 3 h later (~16:20). `pod start` fails (no free GPU on that host) and a
  stop clears the container disk (no volume was attached), so the result is lost. Balance after: $5.16.
  Design gaps found: (1) the only copy of out10 lives on the pod's container disk, which the watchdog's stop wipes;
  (2) the local helper is tied to the Claude session; (3) no way to fetch results if the controller loses the pod.
- 03 Nov - SCENE 2 started: BRIEF-28 (auditorium draft 1, one still, qa11/) sent to Codex (log codex28.log). Owner decisions: screen = OBS green aperture (page draws the green quad, obs-shaderfilter corner-pin; edits only in a COPY of the "Moobies 1440p" collection), pre-show then film on it, download progress from qBittorrent Web UI (127.0.0.1, localhost auth bypass).
- 03 Nov - Draft 1 delivered (qa11/cinema_draft_01.png, 72 seats, screen 552 px). Owner: agrees with bigger/grittier/fill-frame -> BRIEF-29 draft 2 sent (codex29.log). Owner: the film on the in-room screen is only a short moment in the transition to the full-screen movie, so the zoom director stays free (no wide-shot lock, no live OBS corner updates).
- 17:30-18:50 - Results now survive a lost pod/controller (cloud-render.sh rewrite): a 10 GB network volume is created
  per run in a data center with a free GPU (stock list, plus a sweep of all data centers every 5th round because the
  list is sparse); the pod copies results/logs to /vol/results when the run ends (progress every 5 min) and stops
  itself 20 min after a success; the helper never deletes an unreachable pod - it waits for it to stop and reads the
  volume with a small pod in that data center (`bash cloud-render.sh fetch`, retries up to 6 h; cheap GPUs first,
  CPU last - CPU pods sat at awaiting_container 20+ min in EU-RO-1); the volume is deleted only once the result is
  home. Bugs fixed while testing: Git Bash rewrote /vol to C:/Program Files/Git/vol (runpodctl now runs with
  MSYS_NO_PATHCONV=1), search volumes leaked on Ctrl-C, a lookup of a deleted pod killed the script under
  set -e/pipefail. Credit guard 4.5 for a full run. Run the helper from the Terminal panel, not inside Claude.
  Smoke test (5090, EU-RO-1, TEST_FETCH=1): render exit 0; result fetched from the volume via a pod; pods and volume
  deleted; billing 0. Balance $4.95. Run-4 pod m0dhqr1o60n2fn left stopped (empty, no cost).
- 03 Nov - Draft 2 delivered (816 px screen, 10x20 seats, fills frame). Owner: "bigger" meant a bigger hall seen MORE ZOOMED OUT (whole hall in frame). Codex read-only critique reviews/review-cinema-d2.md (points 1-9 taken; 10 = emote test, left for page work). BRIEF-30 draft 3 sent (ortho_scale cap ~30 -> emotes ~38 px, walls ~700, 8-9 rows x 16-18).
- 18:52 - full run refused by RunPod: a network volume needs >= $5 on the account (balance $4.94). Guard raised to $5.50 (full) / $5.10 (smoke). Needs a top-up.
- 03 Nov - Draft 3 delivered (whole hall, ortho 30, 8x18 seats). Owner shared photos of his childhood cinema (Showcase Cinemas in a mall, Spanish signage) -> ref/childhood-cinema/. Codex read of the photos: reviews/review-cinema-d3-refs.md. BRIEF-31 draft 4 sent (flat front rows + stadium bank, passage entrance, mauve seats, teal pleated walls, SALIDA, red step dots, 90s carpet). Lobby/snack-bar photos (01, 06, 07) also fit scene 1 later.
- 03 Nov - Draft 4 delivered (childhood-cinema look). Owner: walls much darker/muted, room less lit, seats PURPLE not pink, EXIT not SALIDA, rows 50-75% more level, staircase between two seat blocks, and a quick BOX BLOCKOUT first for layout feedback -> BRIEF-32 (draft 5 blockout) sent, codex32.log.
- 03 Nov - Blockout 5 delivered (6 rows, level rows work). Owner: remove row A + gap to the screen, B/C too close, add 3-4 bank rows at the back, lower the too-tall walls, rows split into blocks/aisles like his seat map (ref/childhood-cinema/08-seat-map.png, indicative only) -> BRIEF-33 blockout v2 sent, codex33.log.
- 03 Nov - Owner approved blockout v2 layout (incl. ortho 32 zoom-out, emotes ~35 px). BRIEF-34 styled draft 7 sent (dark muted room, deep purple seats, dark teal pleats, EXIT, visible red step dots), codex34.log.
- 03 Nov - Draft 7 delivered (styled blockout v2, seats mean 18/255). Owner: the empty middle-left is a TUNNEL from the real entrance at the back (chatters arrive through it; screen-side door = emergency exit only), walls dark BLUE not green, more popcorn/litter, remove senseless handrails; agrees to lift darks, visible step lights, lit cut edge. Codex critique reviews/review-cinema-d7.md (1-9 taken). BRIEF-35 draft 8 sent, codex35.log.
- 03 Nov - Draft 8 delivered (tunnel, navy walls, seats 41/255, visible step lights). Owner: light the tunnel mouth -> BRIEF-36 draft 9 (lighting only), codex36.log.
- 03 Nov - Draft 9 delivered (tunnel mouth lit: warm spill on approach, 3 step inserts, EXIT on guard post; screen unchanged). Waiting for owner review.
- 03 Nov - NEW PAGE standby/auditorium.html (scene 2, Claude): bg = qa11/cinema_draft_NN.png + cinema_layout_NN.json (?draft=09 default). Chatters (Cinema.onWalkIn, everyone=1/tag) spawn one at a time at the rear portal, hidden in the tunnel, approach -> cross-aisle -> left/right stair -> legroom -> seat; own-row seat backs hide the lower body (clip at the back-top line); arrival + walking messages saved and said once seated; max 4 bubbles, stacked, never over the screen quad; seat choice: mentioned friends, middle-weighted, gap to strangers. Tested with injected SB.say messages (headless Edge, scratchpad shot.mjs): 22 walkers, all routes OK. DSA chat relay (ws 127.0.0.1:18765) was offline, so no real everyone=1 view yet. Not yet: occluder layers from Codex, stair/row-C partial occlusion, zoom director, pre-show/green, lights-down.
- 03 Nov - auditorium.html: seated emotes now cut on the backrest diagonal (slope 0.5, clip-path polygon), sitters drawn 0.2 tile back so heads centre over their own backrest. Owner let me start the DSA relay myself (customchat/destinygg-obs-overlay, node server.js): live everyone=1 filled 77 chatters / 61 seated in 90 s. NEW standby/lan-proxy.js (phone on the LAN): listens on 192.168.2.150:18780, forwards pages to 18770 and /__dgg_chat_ws to the relay; phone URL http://192.168.2.150:18780/auditorium.html?everyone=1&relay=192.168.2.150:18780. Both servers stay on 127.0.0.1; Node inbound is allowed on the Private Wi-Fi profile.
- 03 Nov - Owner notes on the live page: rear door (lobby screen door, opens per chatter) instead of the EXIT sign, wall over the cut underside, tunnel-mouth reveal, speak while entering, emergency exit closer to the screen (red EXIT, closed), front row = wheelchair row (blue wheelchair signs on row-B backs; YEE chatters only sit there), DGG flair colours, no square emotes as bodies. Done in pages: speech while walking (bubbles wait hidden in the tunnel; 4-bubble cap counts only visible), page_layers support (depth slices z = 1000+round((u+v+z/90)*100), entrance door sheet) in auditorium.html; shared/core.js DGG flair colours (flairs.json via standby-server, rainbow for tier 5) used by roxy + auditorium; shared/cinema.js keeps square emotes (border >80% opaque, found via same-origin /dgg/emote-img) + JARVIS off chatter bodies (27 found live); YEE -> row B only. standby-server.js: /dgg/flairs.json + /dgg/emote-img. BRIEF-37 (draft 10: door, cut wall, depth slices) running in Codex; items 4-5 (emergency exit, wheelchair signs) were appended after it started - check, else resume.
- 03 Nov ~21:35 - OVERNIGHT GOAL (GOAL-cinema.md): until good or 55% weekly usage (43% now). Done since: DGG name colours 1:1 with the DSA userscript (lowest-priority flair, plain #fff, roles/sub tier, gradient rainbow), emote facing table shared/emote-facing.json (Codex vision on 7 contact sheets from tools/emote-sheet.html: 132 right / 70 left / 123 front) used by both scenes, lobby walk animation in the auditorium, sitters taller (SIT_Z 48), draft 10 integrated (159 depth slices, door sheet with static-slice cutout mask, wait 0.28 s) and made the page default. Codex BRIEF-38 (page: director + control panel, codex38.log) and BRIEF-39 (render: draft 11 polish + final 4K on local GPU, codex39.log) running in parallel.
- 03 Nov ~22:00 - BRIEF-38 done by Codex (PAGE-38.md): auditorium zoom director (lobby port, follows an arrival door -> tunnel mouth -> seat, holds 3.2 s), control.html scene selector (lobby/auditorium) with reset/follow/wide/zoom/test arrival/remove, standby-server routes /ctl commands per scene (controlVersion 2; server restarted), optional @2x art selection. Verified live with director=30. Found: name labels hidden by depth slices -> BRIEF-40 (names in their own top layer + seated neighbours turn to the speaker) running, codex40.log.
- 03 Nov 21:53 - FINAL RENDER DONE (run 5, fast pipeline BRIEF-27, 24-frame wet loops): RTX 5090 EUR-NO-1, pod
  a616bp5ubdg572 + network volume xyurzmultn, 19:08-21:53 (2 h 45 m, ~$3.30). Exit 0, out10.tar.gz checksum OK, pod and
  volume deleted, billing 0, balance $11.69. Pack: validation.json passed (no failures; depth slices reconstruct exactly;
  light_loop, light_loop_2x, rain_fg decode checks pass), all 705 checksums.json entries match. Swapped in: old local
  out10 (02 Nov local build) -> out10.stale-20261102; roxy.html ART default out8b -> out10 (?artdir=out8b for the
  old pack; backup cloud/backup-run2/roxy.html.pre-out10). Live test on :18771 with demo=1: all out10 assets load,
  light_loop_2x + rain_fg play, door sheets (screen_2, stall_1), tickets/stubs, wet prints and umbrellas fire, no
  page errors (only pre-existing 400s: the emote proxy rejects .avif emotes). qa10/final/out10-full-1080p.png = the
  final composite. Not verified: OBS/CEF performance with the 4K loop on the stream PC (?loop2x=0 fallback).
  Note: manifest render_device still says the local RTX 3050 (stale metadata, harmless). Run-4 pod m0dhqr1o60n2fn
  still stopped (no cost), delete on owner OK.
- 03 Nov ~22:15 - BRIEF-40 done (PAGE-40.md): names in their own top layer (no longer hidden by slices), seated neighbours turn to a speaker 4-6 s. Live check with director=30 OK, no errors. Noted for later: big live bursts crowd the approach/cross-aisle with overlapping names.
- 03 Nov ~22:20 - Draft 11 + FINAL 4K set delivered by Codex (CINEMA-DRAFT-11.md, local RTX 3050 only): polish (tier separation, door fabric/portholes, plaques slightly toned down, cut wall variation), native 3840x2160 bg, 159 slices x2 scales, door x2, layout_11 with image_2x/file_2x. Page default -> draft 11; verified at 3840x2160 output (2x bg + slices selected, crisp, seat-shaped occlusion). qBittorrent not running and WebUI not enabled yet (WebUI\Address=127.0.0.1 only). BRIEF-41 (pre-show slides on the screen quad, /qb/progress, phases seating/dim/film/up with control panel buttons) running, codex41.log.
- 03 Nov ~22:35 - BRIEF-42 done: lights-down state cinema_draft_11_dim(.png/@2x) + draft11_dim slices/door with identical masks, layout_11 page_layers.dim. Looks right (step dots, EXITs, tunnel spill, faint sconces; screen wall black - filled by pre-show/OBS). Note: wheelchair plaques read a bit self-lit when dim. Page integration (crossfade instead of CSS brightness) after BRIEF-41.
- 03 Nov ~22:50 - BRIEF-41 done (PAGE-41.md): /qb/progress (qBittorrent WebUI 127.0.0.1:8080, QB_URL; returns available:false now), phases seating/dim/film/up (auto at 90% / 10 s after completion, manual from control.html, ?phase=), pre-show slides affine-mapped onto the screen quad (presents+title, loading %/"begins shortly", silence phones, snack bar, audience credits). Server restarted; verified live (projected slide on the screen, LAN proxy still up). BRIEF-43 (crossfade to the rendered dim set) running, codex43.log.
- 03 Nov ~23:05 - BRIEF-43 done (PAGE-43.md): dim/film phases crossfade to the rendered lights-down set (bg + paired slices + door), CSS darkening only as fallback; verified live with ?phase=dim (dark room, glowing pre-show, readable chatters). Weekly usage 44%. BRIEF-44 (code review/QA of auditorium.html, arrival-burst spacing + short-lived names, full-house behaviour) running, codex44.log.
- 03 Nov ~23:30 - BRIEF-44 done (PAGE-44.md): code review/QA fixes (full house: newcomers queue outside the rear portal instead of vanishing; bans/mutes also clear the queue; bounded pending speech; failed emote sprites show "?"; per-frame DOM write reduction; panel request timeouts), route spacing 0.9 tiles (FIFO, no overtaking), arrival names 5 s after leaving the tunnel; 12 fill/reset soak cycles leak-free. Final live check of auditorium + lobby: no errors. STOPPED for the night at 44% weekly usage: the scene is in a good state; open items for the owner in GOAL-cinema.md.
- 04 Nov ~10:10 - LOBBY PERFORMANCE (roxy.html + out10), headless Edge on this laptop (RTX 3050), harness from the
  cinema session (scratchpad perf-roxy.mjs: 170-nick burst over the cap, chat every 400 ms, director every 30 s).
  Before: 9-22 fps at 1080p/1440p, even nearly empty; trace: ~20 s of image decoding per 8 s. Cause: the director
  multiplies dpr() by its 1.85 zoom, so @2x art always loads, and the 58 wet prop-loop sheets decode to ~590 MB at
  @2x - more than Chrome's GPU image cache - so they were re-decoded every frame (same issue the cinema session found
  with its 4K slices). Fix (roxy.html applyArtRes): wet_* loops stay 1x; all other art keeps @2x. ?wet2x=1 restores
  the old way. After: ~53 fps steady at 1080p, 1440p and 4K with a full house (63 walkers), p99 ~20 ms, 0 long
  tasks, main thread ~20 % busy. Glass/pavement crops 1x vs @2x at 1440p look the same. Backup:
  cloud/backup-run2/roxy.html.pre-perf. Still ~265 composited layers (harmless now). Not verified in OBS itself.

## 04 Nov 2026 - auditorium performance (Claude)
Measured headless Edge on the RTX 3050 (GPU on, uncapped ~100-120 fps), 170 chatters arriving + chat every 0.4 s.
1. Zoom: `.w { will-change }` gave every chatter a GPU layer; the depth slices between them were then layered too and
   thrashed tile memory at the director's 1.85x zoom (~3 fps). Removed the will-change -> ~90-100 fps zoomed.
2. Full house: the slices' bounding boxes are ~25 screens of pixels (97 % transparent); at 2x they overflow Chrome's
   decode cache and PNGs were re-decoded every frame (600 decodes / 8 s, 4-17 fps). Fix:
   - `tools/band-slices.mjs` cuts every slice (lit/dim, 1x/2x) into 64 px bands split at 48 px gaps, trimmed to
     visible pixels (5.3 screens, 2327 pieces per set, opaque-only 2-row overlap against zoom seams). Verified: pieces
     rebuild every slice exactly. Files `qa11/draft11_bands/`, `qa11/draft11_dim_bands/`; layout gets `pieces`
     (backup `qa11/cinema_layout_11.before-bands.json`).
   - The page draws only the pieces that cover a chatter or the moving door (`cullPieces`, 64 px grid); the background
     already holds the same pixels, so hiding the rest looks identical (checked: culled vs all pieces = same image).
   - Lights down: the lit art stops being drawn once the dim art has faded in (`dim-done`); dim pieces aren't decoded up front.
   Result, 135 seated: 1080p ~102 fps, 1440p ~101, 4K 69-79, 1440p lights down ~103 (before: 3-17); no long tasks.
   During the arrival rush (20+ walking at once) 36-60 fps headless.
3. standby-server.js: `/dgg/emote-img` accepts .avif emotes (4 newer DGG emotes were rejected with 400).
Old page: `roxy3d/auditorium.before-perf.html`. Lobby zoom measured ~20 fps either way - not changed, separate look.
- 04 Nov ~10:50 - ALLEY FLICKER fixed (owner's phone clip). Cause (Codex BRIEF-45, NOTES out10-loopfix/NOTES-45.md):
  in the right-hand annex roof, `P8 record and repair annex` and `P8 gravel roof.005` both end at z=58
  (build_pass8.py:157 + roof() line 53) with different wet materials, so Cycles picked either face per frame:
  a cyan DINK DONK reflection + warm patch popped on/off (frames 8, 15, 17-23 of each 24). Not a light.
  Post-fix without re-render: bad phases interpolated from neighbouring good phases inside a feathered mask, both
  light_loop.webm and light_loop_2x.webm re-encoded with the bundle's VP9 settings (144 frames, 24 fps, additive).
  Checked by Claude: alley off-beat blocks 1080p ~20 -> 0, 4K 56 -> 0, street rain spots unchanged, 10 live frames
  at 1440p steady. Originals in out10.orig-loop/; out10/checksums.json is stale for those two files.
  NEXT RENDER: remove the covered annex top faces (or lift the roof slab) and check other roof()/body pairs.
- 04 Nov ~11:15 - Lobby director zoom check (asked by the cinema session, which measured ~20 fps zoomed): with the
  wet-loop fix it runs ~53 fps zoomed (scale 1.85) at 1080p and 1440p, GPU main ~22 %, no image re-decoding;
  ?wet2x=1 reproduces the old ~12 fps with ~20 s decode per 8 s. Their run predated the fix; nothing more to change.
- 04 Nov ~11:50 - DRAFT 15 (BRIEF-46, Codex, local only; qa10/draft15-cars-door2.png, NOTES-46.md). Owner saw a
  "light over everything" on cars/bus and a dark Screen-2 door. Causes: (1) vehicle studio rig in
  cloud/bundle/build_vehicles.py lighting(): 'Cool overcast fill' 220 W overhead + strong reflection lights + world .3
  -> pale roofs everywhere; draft: overhead 0 W, reflections ~8 %, world .015. (2) Screen 2's leaves are missing from
  the 'D12 unchanged cinema receivers outside restroom' collection (10/102 parts vs 102/102 for screens 1/3; they
  were posed open when memberships were assigned), so 9 lobby lights skip them; plus a wet-paint material mismatch.
  Draft fix: masked per-channel curve on door 2 in the 10 static plates (fixed nonnegative offset, loop contract
  kept; median [28,4,7] -> [90,20,33]). Full apply: 12 vehicle body renders + 56 slices + 10 plates + 2 door sheets,
  ~3-6 min locally. Claude's note: the after-cars look too dark (blue sedan reads plum, bus near-black). Waiting for
  the owner.

## 04 Nov 2026 - door, seated look, emote facing (Claude)
- Door: owner flagged the rear entrance as stretched + old (pass-9 porthole door scaled into the 2.35-tile portal).
  BRIEF-46 quick draft -> owner approved -> BRIEF-47 full pass: draft 12 = draft 11 + the lobby's current padded door
  at uniform scale (139/114, centred u 1.45, wall infill), lit + dim, 1x + 4K, slices, door sheets, cutout
  (`qa11/CINEMA-DRAFT-12.md`). Banded with `LAYOUT=cinema_layout_12.json node tools/band-slices.mjs qa11 64`
  (exact rebuild). Page default `?draft=` is now 12. Door opens and arrivals walk through (checked). 1440p full house
  ~101 fps seated, no long tasks (same as draft 11).
- Seated: emotes were raised (SIT_Z 48) so they looked perched with flat bottoms beside the backrest. Now cut along the
  backrest line also with depth slices, drawn at 1.2x (owner picked "A"); `?sitz=` / `?sitscale=` to compare.
- Facing: owner said Skip and other ambiguous emotes face the wrong way. Codex made an independent pass on large sheets
  (`reviews/facing2/emote-facing-2.json`, `tools/emote-sheet.html?big=1&labels=1&names=`); Claude checked all 67
  disagreements: Skip -> right, 44 labels changed (clear L/R fixes, near-frontal -> front). 10 ambiguous ones are with
  the owner (GIGACHAD, Normgasm, SICKO, ThisIsFine, POPPERS, NOTMYTEMPO, hesRight, WooYeah, YAM, hhhehhehe).
  Old table: `reviews/emote-facing.before-owner-review.json`.
- 04 Nov ~12:30 - Owner: "apply as drafted, but right-to-left cars drive almost on the opposite lane".
  Lanes: road v 10.6-13.5, dashed centre line at v 12 (build_scene.py); manifest lanes.far = 12 put -u traffic on
  the dashes. roxy.html now uses far = 12.75 (default and when the manifest says <= 12.05); checked with 4 passing
  -u cars. Draft 15 applied by Codex (BRIEF-47, NOTES-47.md) into out10b: 12 vehicle bodies + 56 slices (both
  scales), 10 static plates (Screen 2 offset), doors/screen_2 sheets, manifest lanes.far 12.75, checksums/validation
  refreshed, scene sources fixed for the next render. Claude checked: 705 checksums OK, 95 files differ from out10
  (92 images + 3 json), the three videos byte-identical, validation passed; live doors and 6 passing vehicles OK.
  Swapped: out10 -> out10.pre-d15, out10b -> out10 (revision 10b-local-draft15-brief47).
  Owner decided the 10 (04 Nov): current labels confirmed except POPPERS -> right, hhhehhehe -> right.
- Pre-show "Tonight:" (owner, 04 Nov): it showed the last watched film (history[0], Ali G). Now `upcomingFilm()` takes
  the winner of the newest film poll (details.polls endedAt) and drops it once it is rated or in history with that
  poll id; no unplayed poll winner -> "Tonight: Feature Presentation", no poster. Tested on live data (Last Night in
  Soho rated -> generic) and a made-up new poll (shown, then gone once rated).
- 04 Nov ~13:15 - Lobby behaviour (owner requests, roxy.html):
  - Talk spots per kind (SPOTS / HANG_P): lobby 3 (new one between box office and glass, layout 3), outside 2 on
    the sidewalk either side of the entrance (6.8 / 11.9, v 9.5), corridor 2 past the usher (5.9 / 11.4, v 2.15).
    Arrivals may stop outside before going in (50 % with something to say / 25 % without), lobby as before, corridor
    70 % / 35 %. Alone outside or in the corridor they move on after 7 s. Back from a sidewalk group they line up
    with the entrance first (no walking through the glass). Janitor chats stay a lobby thing.
  - Restroom: with layout 3, ~16 % of arrivals add a restroom visit (plus chat's ~5 %); before only ~5 %.
  - Run-overs: 6 % of arrivals on foot walk along the road with traffic; a moving vehicle that catches them:
    "BONK", knocked along 1.3 tiles, fade out, removed (riders at the curb and parked vehicles are safe).
  - Counter staff (cashiers, snack clerks) stand 18 px higher (STAFF_STEP); the usher unchanged.
  Simulated 5 min, 207 arrivals: up to 12 talking outside, 14 in the lobby, 3 in the corridor, 34 restroom visits,
  4 run-overs, 0 page errors; perf 1440p full house ~53 fps, p99 ~20.6 ms, 0 long tasks. Backup before:
  cloud/backup-run2/roxy.html.pre-perf (+ lane fix, wet-loop fix after it).
- 04 Nov ~13:45 - Every chat message is now shown once (owner: "show every one"). queueLine keeps up to 4 unsaid
  lines (a 5th says the oldest at once); soloSpeech says the next line 1.2 s after it arrives (or after their last
  bubble has been up a while) whenever the chatter is in view and not standing in a talk group; in a group they
  speak by turns as before. Arrival messages are said once they walk into view. HANG_P "without" chances raised
  (outside .35, lobby .5, corridor .4) since most say their arrival line on the way. Still max 4 bubbles on screen.
  Sim (new chatter / 6 s, message / 2.5 s, 3 min): 110 of 113 messages shown (3 still queued at the end), 0 errors.
  Perf 1440p full house with a message every 0.4 s: ~53 fps, p99 ~20.7 ms, 0 long tasks.
- Pre-show slides (owner): "Tonight's audience" -> "Tonight's movie chatters"; projectionist + snack-bar slides removed
  (3 slides now). Director checked live on this scene (first follow ~70 s, zoom 1.85).
- Props (owner): ~40% of arrivals carry the lobby's rendered popcorn (70%) / soda (out10/items, scaled by K), held over
  the backrest when seated; ~13% of seated chatters (`?phones=0..1`) take out a phone for 6-14 s every 25-70 s, a CSS
  phone with a blue screen glow (stands out with the lights down).
- 04 Nov ~14:30 - Speech bubbles (owner: they jump when making room; 4 is too few). Now: up to MAX_BUB = 8 on
  screen (?bubbles=2-14); new bubbles fade in (0.25 s), pushed-out/ended ones fade out (0.28 s) instead of vanishing;
  a bubble follows its speaker 1:1 but a change of spot (stacking/making room) moves on a critically damped spring
  (0.2 s scale); stacking tries up to 7 levels. Test (scratchpad bubtest.mjs, 45 chatters, a message / 0.6 s, 60 s at
  1080p): before - max jump 520 px in one frame, 90 jumps > 40 px, 4 visible; after - max 40 px, 0 > 40 px, ~7.7
  visible on average. 1440p full house perf ~53 fps, 0 long tasks. Comparison image qa10/bubbles-6-8-10.jpg.
- 04 Nov ~14:50 - roxy.html: (1) staff face their customers (faceStaff: cashiers -> window line, clerks -> register
  line, usher -> gate entry); FeelsGoodMan clerk now looks at the snack line. (2) Everyone carries an umbrella (was
  35 %); open outside, folds at the door as before. (3) Glass-front clipping: the glass is depth-sliced every ~0.9 tile
  and sorted at slice centres, so figures right at the glass got glass over them (outside) or sat over the glass
  (inside). frontV(): for u 2.9-13.1, outside within a tile sorts at v 10 (in front of every slice their sprite or
  umbrella can overlap), inside sorts at min(v, 16.85 - v) (behind them); the bus shelter area is unchanged.
  Checked in a simulated crowd (glass-front crops): no clipping, 0 errors. Owner's "floating thing": a small white
  rectangle baked at the curb by the bus stop (full.png ~(110,605)), drawn above near-lane cars via the bus_stop
  slices - BRIEF-48 to Codex (into out10c).
- 04 Nov ~15:10 - Floating white rectangle fixed (BRIEF-48, NOTES-48.md): the two number plates (+ "DGG 05" text) of
  the removed parked inspection bus were left in the scene - built inside build_pass10_draft6.py shelter() while the
  shelter layer was current, so prepare_scene.py kept them as bus_stop geometry and they were sliced above near-lane
  traffic. Codex removed them in out10c (19 files: full 1x/2x, occ_bus_stop + 3 slices, 3 wet_bus_stop sheets, json),
  inpainted from the clean already-rendered ground; loops untouched; sources fixed for the next render. Claude
  checked: 705 checksums OK, validation passed, before/after crop: both plates gone. Applied by copying the 19 files
  into live out10 (the folder could not be renamed while the server streams from it); originals in out10.pre-plates/;
  live out10 checksums all OK.
- Floor lights (owner): BRIEF-48 brightness draft, BRIEF-49 re-seated all 67 step markers as flat inserts on real
  surfaces (several floated), owner picked V2 45 %. BRIEF-50 full pass = draft 13 (`qa11/CINEMA-DRAFT-13.md`); banded
  (`LAYOUT=cinema_layout_13.json`), page default `?draft=` 13. Screen line "Moobies starting soon, take a seat...";
  popcorn ~85 % (80 % popcorn / 20 % soda), phones ~30 % (out 8-18 s every 15-45 s).
- 04 Nov ~15:40 - Queue quitters (owner): 6 % of people in the ticket line lose patience after 2.5-7 s (QUIT_P,
  ?quit=1 forces it for testing): a float ("nah, going home", "changed my mind", ...), out of the rope lane by its
  open end, back out of the entrance (umbrella reopens: giveUmbrella() now shared with spawn; drawFigure gives one to
  anyone stepping back out), wait at the bus stop door (1.2, ~10); the next bus is called within 6-14 s if none is
  coming; once it has stopped and its riders are off they walk to the door and fade in ("bye 👋" half the time); the
  bus waits for boarders (max 12 s past its dwell). Test with ?quit=1, 160 s: 9 quit, boardings seen, 0 errors.
- 04 Nov ~16:10 - Taxi roof sign (owner, via the intro session: "way too big"). Codex BRIEF-49 / NOTES-49.md: box
  0.34 x 0.46 tiles x 9 units -> 0.12 x 0.32 x 5 (roof footprint 55 % -> 13.5 %), smaller lettering/base, same
  warm emission and draft-15 studio light; the 4 taxi body states + all 32 taxi light maps (their wet-road sign
  reflection) re-rendered locally into staging out10d (58 files: taxi PNGs + checksums/validation; Claude checked).
  Draft qa10/draft16-taxi-sign.png sent; waiting for the owner's OK before copying into live out10.
- 04 Nov ~16:20 - Owner approved draft 16: the 58 taxi files copied from out10d into live out10 (originals in
  out10.pre-taxi/); live checksums all OK.
- 04 Nov ~16:25 - shared/emote-facing.json: WEOW "front" -> "left" (owner asked; its base frame is a 3/4 face turned
  to the viewer's left), so it now turns to face where it walks in both scenes. Backup cloud/backup-run2/.
- 04 Nov ~16:40 - Emote chat effects (owner: GSN shows emoji dolphins on top). DGG's emotes.css draws one-shot effects
  on ~20 emotes as text glyphs in ::before/::after (GSN 🐬🐬, BEARSLEEP 💤, PARDNER 🔫🔥, SNAP 💥, PepeHands tears, ...);
  they jump once in chat and hovered over standing emotes. shared/core.js textDeco() checks each emote name once
  (computed ::before/::after: text content and no background image) and marks it sb-nob / sb-noa; shared/base.css
  hides those. Image pseudo-elements (KYSNOW, BERN, RaveDoge) stay. Applies to both scenes and to bubbles.
  Verified in headless Edge. Backup cloud/backup-run2/base.css.pre-deco.

## 04 Nov 2026 - auditorium: "?" emotes recover
- Owner saw "?" instead of some chatters' emotes. Cause: the avatar check gave each cdn.destiny.gg image 5 s, and a full-house rush missed that; the "?" stayed for good, and Chrome keeps a failed CSS background broken for that emote class.
- Fix in auditorium.html (avatarLoads/checkAvatar): 12 s check, failures never cached, retries after 5/15/30/60/120/300 s, then the sprite comes back with an inline background-image (a fresh fetch).
- Test: emote requests failed for the first 15 s through CDP. The "?" marks clear by about 35 s and no chatter stays blank. Forwarded the lobby side to Lobby Map.
- 04 Nov ~17:00 - Emote load failures (tip from the cinema session): a cdn.destiny.gg emote image that fails left the
  chatter blank for good (Chrome keeps the failed CSS background for every element of that emote). roxy.html now
  does what auditorium.html does: checkEmote() after each setEmote - "?" while it fails, retries after
  5/15/30/60/120/300 s, failures never cached, on success an inline copy of the url. Test (CDP Fetch.failRequest on
  emote images for 15 s): 24 chatters "?" while blocked, all recovered within 25 s after, 0 errors.
- 04 Nov ~17:30 - Jannies (owner idea): the lobby starts with no janitor (?janitor=always = old penguin,
  ?janitor=3d = rendered one). Any message from a DGG moderator (features 'moderator', tagged or not) brings a cpMOP
  penguin wearing their name (mod colour, always shown) in from the staff corridor (J -> gate -> hub), "🧹 janny on
  duty", mops a free JAN_SPOTS spot 10-18 s, moves on; one per spot (4 max); their messages are said as bubbles;
  lonely chatters talk to any mopping janny (groups carry g.jan); 10 min without a message (?janidle=<s>) and they
  clock off back through the gate. Mods no longer walk in as chatters (shared/cinema.js walk-ins now carry
  `features`). Layout 3: janitor spot 2 moved to (6.7, 8.35) and reached round the rope lane's open end (the old
  route crossed the front rope). emote-facing.json: cpMOP "right". Test (?janidle=30): 0 -> 1 -> 4 jannies (5 mods),
  tagged mod did not walk in, all clocked off after idle, 0 errors.

## 04 Nov 2026 - auditorium: jannies (DGG mods) mop the front
- Owner, via the lobby session: "same thing should be in the auditorium scene, the jannies will mop the front part. never sit down."
- auditorium.html "jannies": any mod message (SB 'msg', features 'moderator') brings a cpMOP penguin wearing the mod's name in through the entrance. It goes down row B's aisle (u 3.475) to the front floor (v ~1.55, z 24) and mops one of 6 spots for 10-18 s before moving on; one janny per spot.
- Its messages show as bubbles. After 10 min without a message (`?janidle=<s>`) it clocks off back through the tunnel.
- Mods never walk in or sit (onMessage returns early for 'moderator'); a seated mod is swapped for their janny.
- Test: 5 mods + 2 tagged chatters, janidle=30. 5 jannies on the front floor, 0 seated mods, all clocked off by 100 s, 0 errors.

## 04 Nov 2026 - auditorium: dozing, phones in the dark, ban escorts, usher with a flashlight
- Owner picked 4 of the suggested ideas (3, 4, 5, 9).
- Dozing: a seated chatter quiet in chat (tagged or not) for ~10-16 min (`?doze=<s>` x 0.8-1.6) leans over, sinks a little, breathes, z's drift up (z's on at most 12 sleepers). Any chat message wakes them.
- Phones in the dark: with the lights down, 3 chat messages within a minute (`?chatty=<n>`) get the phone out (glowing). The nearest free janny walks into the row, "🤫 shh!", phone away, 2 min cooldown. No janny on duty: the usher does it after the current round.
- Bans/mutes: shared/core.js now also emits 'modAction' { kind, nick, by } before 'purge'. A seated chatter gets "🚫 banned" / "🔇 muted", the mod who did it (if on duty, else the nearest janny, else the mod is called in through the entrance) walks over, "👉 out", and follows them out through the tunnel, then comes back to mop. No janny possible: they leave alone. Not seated yet: removed as before.
- Usher: 4 s after the lights go down the lobby usher's emote (cap_usher) comes in, patrols the cross-aisle and stair aisles at 0.7x pace, shines along rows; whoever talks (a bubble) gets the light for 3.5 s. Never blocks or is blocked. Leaves when the lights come up.
- Tests (phase=dim, doze=25): usher in, beam on the speaker, phone + shush at 11 s, ban by an off-duty mod -> called in, escorted out; mute by an on-duty janny -> escorted out; dozers asleep and woken; usher left 30 s after phase up. 0 errors. Not checked in OBS.

## 04 Nov 2026 - splash mist samples (BRIEF-50, not live)
- Owner wants heavy-rain splash mist on every surface; asked for Claude's and Codex's versions side by side.
- Codex: out10mist/ surface passes (catch, rim, light, height; 1x + @2x) + baked sample qa10/draft17-mist-baked.png (NOTES-50.md).
- Claude: runtime layer in roxy.html behind ?mist=1|2|3 (masked scrolling noise haze + splash crowns, additive, under the rain);
  off by default. Sheet qa10/draft17-mist-claude.png. 1080p perf with mist=2: 53 fps, same as without.
- Owner: animated layer is the way, but v1 "not great"; wants 3-4 different takes. Rewrote the layer as one WebGL shader
  (masked fbm noise, spray rising from surfaces via 14 jittered taps down-screen, procedural splash crowns) with four
  styles behind ?mist=1..4 (+ ?mistgain=): 1 splash sparkle, 2 edge spray, 3 lamp-lit mist, 4 wind sheets.
  Samples qa10/draft18-mist-style0..4.png (0 = live today). Perf with style 3: 53 fps at 1080p and 1440p, 0 errors.
  Backup before: cloud/backup-run2/roxy.html.pre-mist. Still off by default.
- Owner picked style 2 (edge spray): now the lobby default (?mist=0 off, 1|3|4 other styles). Splash dots on unlit
  roofs toned down (air term .5). Perf at 1440p with the default: 61 fps, 0 errors. Needs out10mist/ next to out10/.
- Owner on the live style 2: "looks as if there was water boiling off the edges" -> back to off by default
  (samples stay behind ?mist=1..4).
- Extra rain samples (owner asked if more rain is easy): WebGL layer #rain2 over rain_fg, ?morerain=1..4
  (+ ?moreraingain=): 1 denser, 2 downpour (+ long near drops), 3 curtains (gust bands), 4 downpour + splash crowns.
  Lit by out10mist/light.png, masked out of the building. Shared helper glLayer() now also drives the mist.
  Samples qa10/draft19-rain-style0..4.png. Off by default.
- Crowd control (owner: skip people when there's a huge queue outside): spawn() skips new chatters once >= CROWD (14)
  people are outside or in the ticket line: every 2nd walks in, every 3rd from 21, every 5th from 28 or a full house
  (CAP 40). Returning chatters still talk, host always walks in; ?crowd=<n>, ?crowd=0 = off. Flood test (4 new
  chatters/s, 90 s): outside/in line ~15-22 with it vs 45-56 without, 0 errors.
- Owner liked all four rains -> weather: the extra rain is now ON by default and drifts between light / steady /
  downpour / curtains / deluge (hold 40-120 s, 12-20 s crossfade; ?weather=<x> speeds the clock, ?morerain=0 off,
  1-4 fixed). Rain now falls in front of the cinema's outer walls (mask = wall-top outline only, not the whole
  building). Owner: "rain is way too fast" -> streak speeds 900-2100 -> 380-820 px/s (time-based, not frame-based),
  near drops shorter (52 -> 30 px). 1440p perf 61.8 fps, 0 errors.
- Extra rain stepped at 24 fps like the baked loops (manifest fps 24); ?rainfps=0 smooth. Redraws only on a new step.
- Rain on umbrellas / vehicle roofs: tried in-page canvas splashes (per-sprite canvases from alpha top bands); owner:
  these "more permanent" effects should be rendered, they look better -> runtime code removed (page as before,
  smoke test 0 errors). BRIEF-51 to Codex: draft of rendered umbrella rain loop, vehicle-top impacts overlay and
  continuous tyre spray + wake (staging out10e/, owner image qa10/draft20-rain-umb-veh-tyre.png).
- 04 Nov 2026 - auditorium (owner requests): emotes 10% smaller (EH 45*K); OMEGALUL, TF, dggL, LOCKEDIN, LULW labelled "left" in shared/emote-facing.json; the front (wheelchair) row takes all 13 yee emotes from the DSA script's IDEOLOGICAL_EMOTE_MAP. qBittorrent integration verified live with a real download (Phone Booth). Loading slide: narrower bar with spacing, a DGG meme card (emote + caption, 8 jokes from memes/SHORTLIST.md, next one each time the slide comes round), chat's top emote of the last 3 min riding the bar, chat emotes floating up the outer edges while it loads (?qb=<0-1> fakes a download). Lights down: emotes and held items dim to 50%; 10 s in, the director pushes onto the screen (same framing every time, for the OBS corner-pin; no auto follows while the lights are down; W cancels; director=0 keeps it wide). Usher: walks over to whoever talks in the dark, shines the light up close, 50% chance it walks them out ("kicked"; ?kick=<0-1>); talkers queue. standby-server.js: a download seen finishing counts as recent even with a stale completion_on (needs a server restart, asked Lobby Map).
- 04 Nov 2026 - auditorium: server restarted by the owner; full real-download run verified (White Christmas: dim at 90 %, "ready" at 100 %, film ~10 s later, camera on the screen, 0 errors). Loading slide now shows what is downloading: torrent name parsed (tracker "Рус / English (Dir) [year, ...]" and scene "Title.S03.1080p..." styles) and looked up on Cinemeta (v3-cinemeta.strem.io, keyless, CORS open): poster (images.metahub.space), title, release year, genres, IMDb rating; cached a week in localStorage. "Tonight" falls back to it when no film poll is up. Test: ?qb=0.42&qbname=<torrent name>.
- BRIEF-51 draft delivered (Codex, local Cycles): out10e/ red umbrella wet loop (88x80, 24f), taxi/bus roof
  impact overlays, bus/sedan continuous tyre spray (all 24 f @ 24 fps, 1 s). Owner image qa10/draft20-*.png.
  Claude's read: physically fine but too faint to read at 1x (roof crowns, spray); shown to owner, waiting.
- Owner: 'make a stronger pass'. Codex read-only critique (codex-51-critique.txt) gave px/rate/brightness targets; BRIEF-52 -> out10f/, owner image qa10/draft21-rain-stronger.png composited into the real frame at 1x and 2x.
- Owner approved draft 21 as is ('go with draft 21 and that's it'). BRIEF-53: production set (4 umbrella colours, all vehicle tops sliced, spray+wake all types/dirs) -> staging out10g/, local GPU (owner asked about RunPod: not worth it, ~30 min GPU work). Claude wires umbrella.wet / roof_rain / spray / wake into roxy.html after.
- roxy.html wired for BRIEF-53 keys (inactive until the pack has them): umbrella.wet[c] loop replaces the open sprite; vehicles[t][dir].roof_rain per slice (additive, z = its slice); spray (z above body) + wake (road layer 4) fade in with speed; old one-shot tyre spray only without the loops. Smoke test on live out10: 0 errors.
- BRIEF-53 production delivered (Codex, local, 27 min GPU): out10g/ with 96 new PNGs (48 loops, 2.8 MiB; 40 MiB
  decoded at 1x, 160 MiB @2x): umbrella.wet x4, roof_rain per slice for all 4 vehicles x 2 dirs (+ door_open),
  spray + wake for all. Slice reconstruction exact (NOTES-53). Tested with ?artdir=out10g: wet umbrellas, roof
  loops, spray/wake fading with speed, 0 errors; 1440p 52.9 fps vs 53.4 without. LIVE: the 96 files + manifest /
  checksums / validation copied into out10 (originals of the 3 JSONs in out10.pre-rain/); 801/801 checksums OK.
- 05 Nov 2026 (night) - QA + performance session (owner's overnight goal): fixes in copies only, live pages untouched: standby/roxy-qa.html and standby/auditorium-qa.html, patches roxy3d/qa-night/roxy-qa.patch + auditorium-qa.patch, full report with measurements roxy3d/QA-REPORT.md. Lobby 55 -> 105 fps (blended rain_fg video capped Edge at ~52 Hz; now drawn in the #rain2 pass, pixel-identical), camera freeze on rider follow fixed (froze all speech), bubbles no longer overlap; auditorium 52 -> 114-146 fps uncapped (identity filters removed), plus stuck/leak fixes from code reviews.

**05 Nov 2026 - QA copies promoted to default (owner request):** roxy.html, auditorium.html, control.html and lan-proxy.js are now the QA versions (byte-identical to roxy-qa.html, auditorium-qa.html, control-qa.html, qa-night/lan-proxy-qa.js). Originals backed up in standby/backup-2026-11-05-pre-qa/. Smoke test through the server, real chat, 1440p, 60 s each: lobby 122 fps, auditorium 123 fps (headless 120 Hz), 0 page errors. Not promoted: shared-qa/ (used by ~20 other scenes) and standby-server-qa.js (needs a server restart).

**05 Nov 2026 - shared scripts + server promoted (owner request):** shared/core.js, cinema.js, live.js = qa-night/shared-qa/*, standby-server.js = qa-night/standby-server-qa.js (takes effect at the next server restart). Originals in standby/backup-2026-11-05-pre-qa/ (shared/ subfolder). Smoke test, real chat, 1440p, all 19 scenes that load shared/: all render, no errors from our files; the only messages come from the destiny.gg chat iframe (autofocus notice) and the DSA relay (emotes.click 502), same as before.

**05 Nov 2026 - Lobby Map: owner's fix list on the promoted roxy.html:** (1) everyone lines up for tickets (the random 12% skip is gone; only a full house = CAP or a line past its 14 places skips), layout 3 line snakes: 7 in the rope lane + a second row back along v 8.25; (2) walking pace 75% while the lobby has room, back to full speed between 70% and 85% of CAP (eased), hops slow with it; (3) held sodas/popcorn/ticket stubs at 2x size (HELD, @2x files); (4) BINGQILIN staff emote gets a 14 px "chair" (STAFF_CHAIR); (5) walkers past the usher go through GATE_OUT [3.75, 2.45] before J, no longer over the restroom corner; (6) black lines on the TICKETS/SNACK BAR signs: each depth-sliced occluder also gets its whole image underneath at its lowest slice z (fills the antialiased slice seams that showed the restroom floor); the black bar beside the box office was the restroom side wall's slice 01 shaded face drawn over the ticket wall - clipped to its top cap. Verified headless: 0 errors, sign seams/bar gone, 90 s chat flood fine. Still open: faint diagonal seams on the restroom wall's top cap (restroom slices sit over the ticket wall's dark top band); rain on the right cutout / window rain (asking owner). BRIEF-54 (DINK DONK "CINEMAS" line + bell at half speed) running as a Codex draft. Idea 48 (24 vs 48 fps test) logged in QUEUE-owner.md.

**05 Nov 2026 - Lobby Map, rain follow-ups (owner):** right cutout strip (u 13-15.6 by the ABSOLUTE CINEMA annex) dry: the rain mask now has two channels (red = extra rain, green = baked rain_fg inside the rain2 pass); the strip polygon up to the roof line is dry for both where the height pass < 60, the taller roof in front keeps its rain. Window streaks: the extra rain's drop light came from the surface light pass, black over the glass front -> dim grey-blue streaks there vs lamp-lit ones on the street; holes now filled with blur(light)/blur(catch) at quarter size (airL). Headless check: 0 errors. Draft 22 (BRIEF-54, DINK DONK CINEMAS + bell 12f/state) shown to owner; Codex critique in codex-54-critique.txt (tracking, 18 px bulb clearance, +2 bulbs per upright, S not $, mounts, floodlights); production estimate 5-10 h local.

**05 Nov 2026 - DINK DONK sign:** draft 23 (BRIEF-55, cleanup of draft 22 per codex-54-critique) approved by the owner ("Yes, render it"); BRIEF-56 production started with Codex (local GPU, staging pack out10i/ + out10i-copy-list.txt, plus the floodlight re-aim from codex-55-critique point 7). Live out10 untouched until Claude tests ?artdir=out10i.
- 05 Nov 14:45 - Owner: "use the GPU remote for this". Local BRIEF-56 run stopped at 34/48 background frames
  (3050: 423 s/frame vs 48 s on the run-5 5090); out10i/_work kept as fallback. BRIEF-57: Codex packs the frozen
  production scene (sign + floodlight re-aim, bell A12/B12) as cloud/roxy-cloud-bundle-56.tar.gz and makes
  cloud-render.sh take ARCHIVE/OUTDIR overrides; Claude then runs it on RunPod (balance $11.62, expected ~$3-4).
- 05 Nov 14:50 - BRIEF-57 done (NOTES-57.md): cloud/roxy-cloud-bundle-56.tar.gz (160 MiB, sha cb6d3387...), local
  preflight + smoke passed, all 8 mist maps included. Claude started the cloud run in Terminal tab "RunPod sign render":
  ARCHIVE=...bundle-56 OUTDIR=roxy3d/out10i.cloud cloud-render.sh full. RTX 4090 SECURE, EUR-IS-1, pod dhc93hhfxqwvi1,
  network volume lbx8rc3twh. Pod preflight passed 14:57, backgrounds stage started 14:58.
- 05 Nov 17:53 - Cloud run done (4090, 14:51-17:53, exit 0, DONE). Result checksum OK, unpacked to out10i.cloud/out10/
  (118 entries incl. 8 mist maps); pod + volume deleted; balance $11.62 -> $8.87 (~$2.75). BRIEF-58: Codex merges into
  out10i, decodes/QA all loops, makes qa10/draft24, copy list and NOTES-56. Then Claude tests ?artdir=out10i&mistdir=out10i.
- 05 Nov 19:20 - BRIEF-58 done (NOTES-56.md, qa58/final-validation.json passed: 432 video frames, A12/B12, wraps,
  alpha/depth, Brief 53 identity). Claude tested ?artdir=out10i&mistdir=out10i&everyone=1 (0 errors, sign + CINEMAS ok,
  restroom slice geometry unchanged so the seam/clip fixes still apply). PROMOTED: backups out10.pre-sign/ and
  out10mist.pre-sign/; copied the 452 listed files (444 CHG -> out10, 8 mist -> out10mist), sha256 all match; out10 ==
  out10i (minus _work and mist). Live page check 0 errors (qa10/live-after-sign-20261105.png). Not checked in OBS.
  Cleanup later with owner OK: out10i.cloud (990 MB), out10i/_work (local fallback), the .pre-sign backups.
- 05 Nov 19:30 - Owner OK'd cleanup: deleted out10i.cloud/, out10i/_work/ (stopped local fallback), cloud/result-full.tar.gz,
  cloud/brief57/verify/. Kept: out10i/ (staged pack == live), out10.pre-sign/, out10mist.pre-sign/ (rollback),
  cloud/roxy-cloud-bundle-56.tar.gz + brief57 build scripts (to re-run the sign render).
- 05 Nov 19:45 - Owner: extra rain looks much faster than the baked rain; wants a control to pick the speed. roxy.html:
  streaks run on their own clock (uS = rainClock += dt * rainSpeed); ?rainspeed=x (0.1-2, default 1 until owner picks),
  ?raintune=1 shows a slider (top left) with the value. Splash crowns/gusts keep page time.
  Owner: the wcat chatter emote faces the wrong way. shared/emote-facing.json wcat front -> left (3/4 view turned to
  the viewer's left; backup qa10/emote-facing.pre-wcat.json), so it now turns to face where it walks.
- 05 Nov 20:00 - Owner: rain speed varies 0.20-0.40 like the intensity. WEATHER entries got a 5th value (fall speed):
  light 0.20, steady 0.26, curtains 0.30, downpour 0.34, deluge 0.40; crossfades with the weather (12-20 s), the
  streak clock integrates so nothing jumps. ?rainspeed=x / the ?raintune=1 slider fix it for testing. Verified with
  ?weather=40 (0.20..0.40 seen), live page 0 errors.
- 05 Nov 20:30 - Owner wants a squarer OBS browser source without black bars -> "crop the sides". ?fit=cover:
  shared/core.js mountStage(el, {cover}) scales to fill (max) and exposes SB.view (visible stage rect; default
  contain = unchanged for every page). roxy.html: wide shot centres on WIDE_X 1040 (?fitx=), camera clamps to the
  visible half size, onScreen + bubble placement stay inside SB.view, art/loop resolution picked from the cover
  scale. Tested 1500x1080: view [210..1710], lobby + whole sign in frame, 0 errors (qa10/fit-cover-1500x1080.png);
  1920x1080 without fit unchanged, 0 errors. OBS source not changed (owner adds &fit=cover + its size).

## 05 Nov 2026 - auditorium: house-lights fade even across the room
Owner: "lights up and lights down are scuffed" (dark stripes over the seats, the stair/exit block lit differently).
Cause: slice dim twins were shown/hidden with `display`, so a twin started at its end opacity instead of fading:
pieces with a chatter behind them went dark at once on lights-down and popped lit on lights-up while the room took 6 s.
Fix: one `@property --dim` on #stage with a 6 s transition drives every `.dim-art` opacity, and `cullPieces` keeps the
twins up for 6.5 s after lights-up. Headless check: twin opacity = background dim at every step, 0 errors.
- 05 Nov 21:00 - Owner: emotes "going over the back wall of the snack bar". Cause: the corridor talk spots (SPOTS.hall
  c [5.9,2.15]/[11.4,2.15]) sat in the strip behind the snack bar's tall back wall (floor hidden for v > ~1.6), so
  only heads showed above the wall top. Moved to c [6.3,0.85]/[9.7,0.85], r 0.28 (between the screen doors, in front
  of the v 1.4 walking line, clear of standees/extinguisher). Sim: no one stops behind the wall any more, group fully
  visible (qa10/hall-spots-moved.png), 0 errors. Clerks checked: heads stay 45-58 px under the wall top.
  Owner's "lights up / lights down are scuffed" (auditorium) forwarded to Cinema Screen Map.
- 05 Nov 2026, rename + GitHub: the owner asked to drop the "roxy" name. roxy.html -> lobby.html, roxy-qa.html ->
  lobby-qa.html; roxy*.html are now redirect stubs that pass the query string through (OBS URLs keep working). The old
  concept lobby.html moved to concepts/cinema-lobby.html. Titles/labels updated (index, control, README, package/build.js).
  roxy3d/ folder and the 'roxy-<role>' emote keys are unchanged. Backups: backup-2026-11-05-pre-lobby-rename/.
  standby/ is now a git repo pushed to github.com/reothrowaway/dinkdonk-cinema (public): source, docs, blends,
  out10 + out10mist, and the qa11 files auditorium.html loads (package/art.js). Draft/QA/old packs/caches stay local
  (.gitignore). The "Lobby and auditorium OBS package" session was told to switch web/ to lobby.html.
- 05 Nov 2026, packaging + hosting (OBS package session): package/build.js builds dist/DinkDonk-Cinema.zip (lobby,
  auditorium, only the art they load via package/art.js, chat relay, OBS collections 1080p/1440p/2160p with lobby.html
  URLs, START.bat). web/ is the hosted edition (web/README.md): web/server.js (room keys, one shared DGG chat upstream,
  per-room control panel, emote/dinkdonk cache), web/shim.js injected into lobby/auditorium/control (adds the key,
  runs the film-screen bridge in the page: direct to OBS 4455, or relayed through the server to the control panel for
  OBS 33+, whose Chromium blocks websites from reaching 127.0.0.1), web/setup.html (creates the OBS scenes over
  obs-websocket, any film source), web/admin.html (invites). Live pages are not edited; the builds copy them.
  Tested locally on 18772 with real chat and a mock obs-websocket: setup, direct and relay film pinning, film off when
  the auditorium closes, per-room isolation, revoke. Not deployed yet: no SSH access to the Hetzner server
  (2.29.56.208); web/deploy/deploy.sh is ready once access is added (web/README.md, "Server access").
- 05 Nov 2026, hosted edition deployed: https://2-29-56-208.sslip.io (Hetzner dinkdonk-cinema, Ubuntu 26.04, Node 22,
  Caddy + Let's Encrypt, ufw 22/80/443, key-only SSH, unattended upgrades). SSH key ~/.ssh/dinkdonk_cinema_v2_ed25519
  (added by the owner). Checked on the public URL: HTTPS, keyless pages refused, lobby and auditorium load with no
  missing files and real chat over the shared upstream, control panel commands (lights down), the film relay over wss,
  wrong keys refused. Admin token is in a local file outside the repo. Still untested: the film pinned in real OBS.
- 05 Nov 2026, hosted edition tested in the owner's real OBS 32.2.2: setup.html (now with "new scene collection",
  a moving test-pattern film web/testfilm.html, a live OBS preview and "switch back") created a separate
  "DinkDonk Cinema" collection; the auditorium inside OBS linked to OBS directly from the https page (obs=true);
  control panel Lights down -> Film put the test film exactly on the cinema screen (pinned, follows the camera),
  Lights up took it down. OBS switched back to "Moobies 1440p poll"; the local obs-bridge reconnected (film off).
  The test collection "DinkDonk Cinema" stays in OBS. Not tested: the relay path on OBS 33+ (mock only).
- 05 Nov 2026, relay path tested in real OBS 32.2.2: new setup option "Link the film through the control panel"
  (#relay=1 in the auditorium URL, web/shim.js). With it, the OBS auditorium sent the screen corners through the
  server to the control panel in Chrome, which applied them in OBS: test film pinned on the screen, Lights up took it
  down. This is the path OBS 33+ falls back to (OBS 33's own block itself not tried: no OBS 33 here). OBS switched back
  to "Moobies 1440p poll"; local obs-bridge OK.
- 05 Nov 2026, setup.html step 1 is now a picture guide: real screenshots of the owner's OBS 32.2.2 (Tools menu,
  WebSocket Server Settings; web/guide/, title bar cropped, password shown only as dots) with numbered marks on what
  to click, the local-network-access prompt, obs-shaderfilter install, and a "not reachable / wrong password" help
  section. The OBS windows were opened through UI Automation and closed without changing anything (Connect Info,
  which shows the password, was not captured). Deployed.
- 06 Nov 2026, fly-through transition: owner wants the lobby -> auditorium switch to be a camera fly-through
  (iso -> first person, street, glass doors, lobby, hallway, screen door, auditorium tunnel, near the screen, pull back
  to the auditorium iso view), rendered in Blender, with the live chatters composited in by the page (camera path +
  depth per frame). Step 1 = route blockout: BRIEF-59 to Codex (fly/, 640x360 preview, camera_path.json, mapping.json).
  Blockout done (NOTES-59, ~30 min Codex): fly/blockout_AB.mp4 (20 s, 640x360, Workbench), Screen 1 route, 20 scale
  cards, camera_path.json (600 frames) + mapping.json; endpoints match the live views (<0.13 px). Found: lobby has no
  ceiling (open cutaway, billboards/roofs visible from inside), Screen 1 door 1.55 units high (camera ducks), tunnel
  low; full 4K Cycles estimate 6-10 h on a 4090. Sent to owner for route feedback.
- 06 Nov 2026: owner on the blockout: route good; the iso->perspective warp at the start is the main issue; camera lower. BRIEF-60: three openings (top-down drop, flat zoom + quick swoop, soft dissolve) as full v2 videos, eye height ~1.15 units without ducking. Codex now runs at normal speed (service_tier default).
  Brief 60 done (~50 min, normal speed): fly/v2_opening{1_topdown,2_swoop,3_dissolve}_AB.mp4 (20.7 s each), camera at 1.15 units with no ducking (tunnel clearance 0.197). Sent to owner to pick an opening.
- 06 Nov 2026: owner picked opening 1 (top-down drop); wants a smoother, less sudden drop, a bus near-miss during the zoom, and a fixed door animation (Screen 1 leaves pressed against the camera, stretched texture, flying into the curtain). BRIEF-61 -> fly/v3_flythrough_AB.mp4.
  Brief 61 done: fly/v3_flythrough_AB.mp4 (22.2 s): 5 s smooth top-down drop, d.gg bus from roxy_vehicles_pass9.blend passing under the camera (closest 0.32 units at A138, path in v3_bus_path.json), Screen 1 leaves hinge-swing outward + curtain parts into black, auditorium door cleaned. Sent to owner.
- 06 Nov 2026: owner on v3: opening dives into plain street, should pan toward the door and be smoother. Codex review (reviews/flythrough-v3-opening.md) agreed; owner chose its 'door-led crane'. BRIEF-62 -> fly/v4_flythrough_AB.mp4.
  Brief 62 done: fly/v4_flythrough_AB.mp4 (22.2 s): door-led crane, switch at A72 on the paving slab outside the entrance, threshold back by A90, bus crosses A84-88, joins v3 route at A194. Sent to owner.
- 06 Nov 2026: owner on v4: worse. Drew the move (fly/owner-sketch-swoop.png): lift out left, dive to street beside the bus, glide into the entrance, S-curve to the screen door. Cause of warp = framing held while lens changes. BRIEF-63: three variants (V5A swoop + bus pass, V5B follow the bus, V5C follow a chatter), all with pull-back switch + drone feel.
  Brief 63 done: fly/v5A/B/C_flythrough_AB.mp4 (23.8/25/26 s). Pull back to ortho scale 28 (A16-45), switch at A46 with 0.27 px max mismatch, swoop left and dive, banking, blur, lens drops; block edges fade to dark. Sent to owner to pick.
- 06 Nov 2026: owner picked V5A (swoop + bus pass); camera 'bounces' at the start and moves are too fast/sudden; may be longer than 30 s. BRIEF-64 -> fly/v6_flythrough_AB.mp4 (one pull back/crest/dive, scale rate continuous across the switch, ~35-45 s, speed/turn limits, part B retimed too).
  Brief 64 done: fly/v6_flythrough_AB.mp4 (54.2 s: A 36.7 s, B 17.5 s). Bounce = scale hitch at the switch + extra pullout (plot fly/v6_apparent_scale.png); v6 one smooth minimum. Peaks: 2.28 units/s, 18.3 deg/s (v5A had 15 units/s, 163 deg/s). Sent to owner.
- 06 Nov 2026: owner approved v6 for a first version; final pod render 1080p 30 fps, nail the lobby's night look, fix frozen rain (static geometry), send frames as they render. BRIEF-65: production scenes + falling rain + depth pass, 5 local look-check frames, bundle-65 with split + peek.
  Owner: motion blur must be strong and explicit -> BRIEF-65 updated (long shutter ~1 frame or more); Codex restarted before it had written anything.
  Brief 65 done: fly/prod/ production scenes (lobby night look, animated rain, 1.25-frame shutter, 128/32 samples + OptiX), 5 look checks sent to owner (A1 vs live 1.87/255), depth PNGs, cloud/roxy-cloud-bundle-65.tar.gz (30 MB), cloud-render.sh + peek (backup .pre65). Needs a 20 GB volume. Estimate 4-5 billed h on one 4090, ~$3.6-4.5. RunPod balance $8.87. Waiting for owner OK on the look.
- 06 Nov 2026 18:01: owner said go. Fly-through render on RunPod: pod f1fvtg3ldf6exq (RTX 4090 SECURE, EU-RO-1), volume cfomnqf1uo expanded to 20 GB, bundle-65, OUTDIR fly/prod/cloud-result. Balance before: $8.87.
  18:03 first frames rendering on the pod, ~6.5 s/frame (ETA ~3 h for 1625). Warning in log: motion blur disabled for 'D10 stateless edge drips and impact crowns' (topology changes per frame). Peek check scheduled every 20 min.
  18:21 frame 77/1625; pull-back frames ~13 s each (hold frames were ~6.5 s). At this pace ~6 h -> may hit the helper's 6 h MAX_HOURS at ~00:01 (then it deletes the pod and KEEPS volume cfomnqf1uo with the finished frames; recover by creating a pod on that volume + ADOPT_POD to resume). $0.89/h.
  Owner wants a reminder after this render: (1) Codex profiling of fly/prod scenes for a 2-3x speed-up, (2) Eevee option with crossfades. Saved in memory + render-check cron.
- 06 Nov 2026 23:33: fly-through render DONE (EXIT 0, marker DONE). 1625 frames + flythrough_1080p30.webm (55 MB) + depth_pngs.tar.gz (2.5 GB) + camera/bus/mapping JSON in fly/prod/cloud-result/flythrough65/ (5.2 GB). Pod f1fvtg3ldf6exq and volume cfomnqf1uo deleted. Balance $8.87 -> $3.92 ($4.95). Last frame = auditorium iso view. Sent the video to the owner; reminded them of the speed-up follow-ups.
- 06 Nov 2026 23:4x: owner: do both speed-ups. BRIEF-66: Cycles profiling + optimized setup, and an Eevee test, on 6 test frames locally; comparison images fly/speed/compare_*.png.
  Owner also asked for a parallel Opus 5.5 session doing BRIEF-66 independently (session opus-speed-test, local_a8085f34; folder fly/speed-opus/, NOTES-66-opus.md) to compare with Codex. Both share the RTX 3050, so timings are relative.
- 07 Nov 2026 ~02:40: Brief 66 compared. Opus (NOTES-66-opus.md): optimized Cycles 2.3-2.5x faster locally (64/16 samples, threshold .03, light tree off, rain as one GN object, fog camera-only), image diff ~1.4-2.4/255, frame 1 vs live 2.49/255; est 4090 ~2.7 h; Eevee 14.5 s local but loses wet street. Codex (NOTES-66.md): optimized Cycles 23-33% faster (adaptive threshold preset), diff 0.4-0.8/255, frame 1 unchanged; est 4090 3.95 h; Eevee slower than Cycles (84-117 s). Both recommend optimized Cycles. Opus preset untested for flicker in motion.
- 07 Nov 2026: owner review of flythrough65: jerky camera (speed oscillates), rain glitching outdoors, grey thing at the auditorium door, camera climbs tunnel steps, too long on the screen, grey flash during the final zoom-out. Wants faster turnaround; agreed: automated QA + cheap full-length draft before any final.
- 07 Nov 2026: QA test on flythrough65 (~10 min, tools/qa-fly/campath.py + flash.py). Caught automatically: speed oscillation A450-1020 (0.8<->2.2 u/s), tunnel staircase (3 climbs B97-B153), camera nearly static frames 1356-1592 (~8 s at the screen), near-empty grey frames 1586-1595 before the ortho switch at 1596 (the grey flash). Missed by the scan, found only by eye where the owner pointed: flat brown-grey vestibule panel behind Screen 1 doors (~A1040-1065). Rain glitch not checked.
- 07 Nov 2026: owner OK'd the fix round: 540p, 15 fps draft on one pod (~45-60 min, ~$1). BRIEF-67 to Codex: fix the 6 problems, Opus optA preset, QA must pass, bundle-67 with draft + final modes.
- 07 Nov 2026: owner-approved cleanup (C: had 5.6 GB free): deleted qa10/draft4, roxy3d/cache/* except brief50, qa qa2-qa9 qa8b qa8shots qa58, fly preview frame folders v1-v6 (MP4s kept). Not deleted (owner chose to keep): old art packs, old cloud bundles.
- 07 Nov 2026: Brief 67 done (50.13 s, 1504 frames; speed varies 0.07%, one tunnel rise, 1.32 s screen beat, rain topology stable, door backing black, no grey dropout). My campath check passes (turn rates now up to 37/66 deg/s). Draft started on pod: FLY_MODE=draft, MIN_BALANCE=2.5 (balance $3.92 < default 5.5 guard), out fly/v7/cloud-draft-result. Codex estimate draft 1.25-1.75 h incl. overhead; final 3-4 h (needs top-up).
- 07 Nov 2026 09:50: draft peek: A185/A187 pure black (depth valid, far long-lens camera). Pod left running (rest of route likely fine). BRIEF-68 to Codex: diagnose (suspect fog camera-only), fix, render the affected range locally at draft settings for splicing, rebuild bundle-68.
- 07 Nov 2026 ~09:55: owner cancelled the draft ('doesn't make sense to wait this long'). Helper stopped; it left pod ghhzf5iodu6qab running -> removed by hand; volume 60h4yq3ugv deleted; state file removed. Balance now $13.61 (owner topped up). Codex BRIEF-68 still running.
- 07 Nov 2026: owner: fix only, no draft. Codex 68 stopped and resumed (codex exec resume --last) with the narrower task: diagnose + fix + bundle-68, proof = a few local final-quality frames of the pull-back; no draft render.
- 07 Nov 2026: Brief 68 done: black pull-back = widened near clip exposed the outside of the sky shell (A107-A240); original A clip restored. 4 final proofs OK (fly/v7/qa68/four_final_proofs_old-left_fixed-right.png, sent to owner). Bundle-68 (sha 6e7b5038...) ready for the final.
- 07 Nov 2026 10:23: owner: start the final. FLY_MODE=final bundle-68 on pod u15g05tzahjzr1 (4090 SECURE, EU-RO-1), volume 1jvd0l04mu expanded to 20 GB, out fly/v7/cloud-final-result. Balance before $13.61. Peek check every 20 min.
- 07 Nov 2026: owner: switch to a game engine, Claude chose Godot (text scenes for AI agents, small, no account; UE5 too big for disk/GPU/automation). Godot 4.7.2 official win64 downloaded from github.com/godotengine/godot releases (86 MB, SHA512 verified) to standby/tools/godot-4.7.2/. BRIEF-69 Godot spike to Codex (lobby still compare + 10 s fly-through piece with sub-frame motion blur). The v7 Cycles final keeps rendering on the pod.
- 07 Nov 2026: hosted edition (web/shim.js): lobby and auditorium now show a hint for the first 10 s, "Click here to open the control panel or press Alt + C" (Option + C on Mac), bottom right, with a close button. Alt+C opens the room's control panel any time. The hint is skipped inside OBS (window.obsstudio) so it never shows on stream. Tested on a scratch build on 18772 (lobby, auditorium, Alt+C, auto-hide); not deployed to the server yet.
- 07 Nov 2026: owner: Lights down must only dim, no zoom; the next option (Film) is lights down + screen zoom. auditorium.html applyPhase(): the screen push now happens only in Film (push shot) - 10 s after the lights go down, or at once when Lights down already dimmed them. Lights down alone keeps the wide shot. control.html: tooltips on Lights down / Film. docs/auditorium.md updated. Backups in standby/backups/*.before-lightsdown-nozoom-2026-11-07.html. Tested on 18771 with real chat: dim +16 s wide; dim->Film pushes at once; Seating->Film wide at 6 s, pushed at 15 s; Movie wide; Film->Lights down eases back to wide. No console errors.
- 07 Nov 2026: Godot spike done (NOTES-69.md, godot-spike/). 10 s 1080p30 piece in 10 min 15 s locally (6:54 capture incl. 5 shutter sub-frames; GPU 36.6 ms/sub-frame; PNG I/O dominates); full 50 s projected ~49 min locally, no cloud. Look: geometry, camera, signage, bus transfer well; colder/flatter lighting, weaker wet reflections/puddles, glass hotspots, softer motion blur. Codex also tried computer-use (Chrome history, VLC) to play the MP4; blocked by approval. Future briefs: no computer use / other apps.
- 07 Nov 2026: chat bubbles (owner: they switch around too much when the camera moves or many people talk; 5 new looks).
  Test copies lobby-bubbles.html / auditorium-bubbles.html (made from live; live files untouched).
  Lobby causes: stack order re-sorted by height every frame (swapped whenever two speakers crossed), the chosen spot
  (over the head / beside / around a sign) re-picked every frame with no memory, 0.2 s glides, 900 px/s pushes.
  Fix: stack order with 36 px hysteresis, a spot is kept until another was better for 0.6 s, a stacked bubble only
  drops back down after the room below held free 0.6 s, glide 0.32 s, push 600 px/s, push relax 0.3 s.
  Auditorium causes: no smoothing at all (raw position each frame), instant above/below-seat flip, bubble bobbed with
  hops and the seat bounce, removed without a fade (the ones above fell at once). Fix: spring offsets (0.32 s),
  above/below flip after 0.6 s, stacked spots held 0.6 s, anchored at standing height, fade in/out.
  Measured on real chat, 90 s each (hidden pane, 40 ms sampling): lobby jumps >2500 px/s 11 -> 3, max 7789 -> 2689
  px/s; auditorium 19 -> 0, max 7434 -> 1989 px/s (28 seated vs 19).
  Looks: ?bubstyle=1 marquee, 2 ticket stub, 3 neon (speaker's color), 4 comic, 5 RPG window; none = current box.
- 07 Nov 2026: owner likes Godot, keep improving. Reported static rain-like streaks right of the bus shelter at 6-7 s of the Godot piece. BRIEF-70 to Codex: identify/fix static drip objects + look pass (warmer light/GI, wet street reflections + puddles + ripples, glass hotspots, stronger blur with 8-10 sub-frames, faster capture). No computer use.
- 07 Nov 2026: owner OK -> web edition rebuilt and deployed (bash web/deploy/deploy.sh, exit 0, 725 MB). Ships the Lights down no-zoom fix and the Alt+C control-panel hint (web/shim.js). Server auditorium.html has the fix, healthz ok, no service errors. Previous version in /opt/dinkdonk-cinema/previous.
  Stills (real chat, lobby ~1:1 crops, director=0): roxy3d/bubble-drafts/. Not yet in the live files.
- 07 Nov 2026: Godot v2 done (NOTES-70): static streaks = 'D5 metal and cap splash crowns' + 'D5 physical surface beads' (also static in the Cycles production scene -> likely part of the owner's Cycles rain complaint; the running v7 final still contains them). Removed in Godot export. Warmer GI, puddle masks, wet reflections, clear glass, 10-sample HDR blur accumulated in Godot. 10 s piece 4 min 6 s (0.82 s/frame); full 50 s ~20 min locally. Note: decoded frame sizes dip every 18 frames = encoder GOP 18 (possible quality pulse) -> use higher quality / longer GOP.
- 07 Nov 2026: owner picked bubble look 3 (neon). Promoted to the live scenes with the smoother placement: backups in
  backup/lobby.pre-bubbles-20261107.html and backup/auditorium.pre-bubbles-20261107.html. lobby.html = lobby-bubbles.html
  (live was unchanged since 5 Nov); auditorium.html got only the bubble hunks, keeping the other session's 10:55 Film /
  Lights-down camera change (pushWanted). Neon is the default; ?bubstyle=0 the old box, 1..5 the other drafts. Checked
  on real chat: both scenes render neon, no console errors.
- 07 Nov 2026: Godot workflow agreed (godot-spike/WORKFLOW.md): resume one Codex session, light rules, Claude does small tweaks, owner views live via godot-spike/run-live.bat (new live mode: live_view.gd; main_v2.gd backed up as main_v2.pre-live.gd).
- 07 Nov 2026: live viewer got a progress bar (drag to scrub the whole route); owner likes it ('way better for me to give feedback').
- 07 Nov 2026: owner live-view feedback (godot-spike, v7 route): 0-5 s opening broken in Godot (far long-lens camera); 10.8-16.5 s camera barely moves forward (waits for the bus) -> keep camera moving, time the bus to it; add plane/spaceship banking (roll into turns, horizon tilts opposite). Sent to the resumed Codex session (WORKFLOW.md rules).
- 07 Nov 2026: shared, persistent rooms (owner plan web/PLAN-shared-rooms.md, approved today): new shared/room.js keeps
  one lobby + one auditorium per room on the server (who walks in, crowd rules, caps, seats, the queue, shared director,
  saved to cache/room-state.json locally / DATA/room-state/<key>.json hosted; keeps filling from chat with no screen
  open). standby-server.js reads chat itself from the relay for it; web/server.js keeps its chat upstream while rooms
  exist. Pages opt in with window.DD_ROOM_PAGE (shared/cinema.js; ?room=0 off): auditorium-qa.html and control-qa.html
  done (refreshed from live first; old QA copies in backups/2026-11-07-pre-shared-rooms/), lobby-qa.html with the Lobby
  Map session. Live lobby.html / auditorium.html / control.html unchanged; port 18770 not restarted. Checked on real
  chat (test ports 18771, 18773 hosted): two tabs same 23 people, reload and server restart come back seated, Reset clears.
- 07 Nov 2026: Godot route v3 done (NOTES-godot.md): opening rebuilt (pull-back near the scene, dissolve 2.8-3.8 s), steady 2.1 u/s dive+street, bus independent 5.6 u/s meets camera at 14.43 s, banking -11.9/+13.6 deg; campath ok; godot-spike/route_v3_preview_540p.mp4.
- 07 Nov 2026: at the 'Web session persistence' session's request, lobby-qa.html refreshed from lobby.html and wired to the shared room (helper agent; tested on 18772, two tabs, reload, Clear lobby, no errors). lobby.html untouched. Gaps reported to that session: no 'left' command (leftRoom uses kicked/home), default emote differs across screens (pool shrinks), crowdEvery uses roster length.
- 07 Nov 2026: owner: no more preview videos, reviews in the live viewer only. Feedback route v3: dissolve at 2.8-3.6 s unwanted; yaw back-and-forth 5-8.7 s (pans right while moving left, swings left ~6 s and ~8 s) -> one smooth turn. Sent to resumed Codex session.
- 07 Nov 2026: owner agreed to drop Cycles-era overhead for Godot (cloud fly-through pipeline after v7 final, Codex status spam, draft/critique/comparison rules, Cycles speed follow-ups). Quiet Codex check replaces the 20-min status.
- 07 Nov 2026: final workflow agreed: Godot drafts -> on approval port route/timing/fixes/lighting/blur to Blender -> Cycles on RunPod -> checks. RunPod pipeline stays (for finals only).
- 07 Nov 2026: owner OK -> shared rooms live. lobby.html / auditorium.html / control.html = their QA copies (lobby title
  back to "Lobby"); old live files in backups/2026-11-07-pre-shared-rooms-live/. Port 18770 restarted (the old process
  had been started by a Claude preview; now runs from start-standby.bat in its own window), room on, live lobby.html
  joined it with no console errors. Web edition rebuilt and deployed (deploy.sh exit 0, healthz ok, 3 rooms, chat
  connected with 0 screens = rooms keep filling). Not yet seen with a streamer's invite link or inside OBS.
- 07 Nov 2026: hosted lobby showed nobody: Caddy's `encode zstd gzip` held back the room's event stream (anything over
  512 bytes) in browsers. web/server.js now sends its event streams with Cache-Control no-transform and
  Content-Encoding identity (Caddy passes them through); shared/cinema.js counts the room live only once its snapshot
  arrived, so a held-back stream falls back to local walk-ins after 10 s. Redeployed with the owner's OK; the owner's
  lobby link showed 50 chatters.
- 07 Nov 2026: Godot route v4: dissolve removed; ortho -> narrow frustum handoff at 3.0 s (0.546 px max mismatch, tight clip planes); single right turn 0-9 s, rejoins dive at 8.7 s; campath now reports yaw reversals (part A at 14.8/26.4/34.2 s, intentional). Live viewer reopened for the owner.
- 07 Nov 2026: owner on route v4: 'pretty good'. Watch the light change at the bottom right at the ~3 s handoff (on the final checklist: godot-spike/FINAL-CHECKLIST.md). Screen 1 door doesn't open in Godot -> add door + curtain. Next: build the auditorium part (B) in Godot. Sent to resumed Codex session.
- 07 Nov 2026: DinkDonk poll in the lobby, data side: poll-draft.js + POST /dd/draft, GET /dd/draft.json in standby-server.js; userscript userscripts/dinkdonk-poll-draft.user.js reads dinkdonk.mov's poll builder (hidden options[] TMDB JSON) and reports building/open/closed. Tested on 18771 with a copy of the builder form; not yet on the real builder page (needs DGG login). Live 18770 not restarted. Lobby display handed to the Lobby Map session.
- 07 Nov 2026: request from 'Ding dong polling integration in lobby': show the DinkDonk poll (building/open, /dd/draft.json) in-world in the lobby. Blockout of candidate spots in lobby-qa.html behind ?pollspots=1 (helper agent, port 18773) -> owner picks.
- 07 Nov 2026: live 18770 restarted with the poll endpoint (it had been down). Owner tested the userscript on the real dinkdonk.mov builder: title, type, movie title/year/TMDB poster arrive in /dd/draft.json.
- 07 Nov 2026: poll spots blockout in lobby-qa.html (?pollspots=1 only; block marked POLL SPOTS BLOCKOUT + one call in the boot IIFE): A door poster frames (3), B NEXT SHOWING board (title + 4), C TICKETS board (title + ticker), D rooftop WCAT billboard (title + 6 with poster thumbs, newest flashes). Tested on 18774 with posted test data, real chat; screenshot qa10/poll-spots-blockout.png. Note: cache/poll-draft.json is shared by every server port, so test posts on another port overwrite the live server's saved draft - restored from 18770 afterwards. lobby.html untouched.
- 07 Nov 2026: poll-spots blockout done (lobby-qa.html ?pollspots=1, qa10/poll-spots-blockout.png): A door poster frames (3), B Next Showing board (title + 4), C Tickets board (ticker), D rooftop billboard (6 with posters). Sent to owner to pick. Reported to polling session: cache/poll-draft.json shared across ports (test overwrote live copy; restored).
- 07 Nov 2026: poll display work moved by the owner to the polling session (per its message); handed over the blockout location (lobby-qa.html 3929-4018), no further edits from here.
- 07 Nov 2026: poll display taken over from Lobby Map (owner dropped the lobby-routing rule). Its ?pollspots=1 blockout in lobby-qa.html (spots A door frames, B NEXT SHOWING board, C TICKETS board, D rooftop billboard) checked with real chat on 18771; screenshots to owner for a pick. poll-draft.js: test ports now save to cache/poll-draft-<port>.json so they can't overwrite the live poll file.
- 07 Nov 2026: Godot route v5 (NOTES-godot.md): handoff shadow-edge easing (peak 93.6 -> 31.9/255, some GI/fog shift left), Screen 1 doors + curtain animated (open by 35.40 s, camera through 36.27 s), auditorium built (draft-13 look, 37 approx lights), full 50.13 s A+B live timeline with dark cut at 36.667 s. Yaw reversals 14.8/26.4/34.2/43.2 s. Live viewer reopened for the owner.
- 07 Nov 2026: owner: shudder 3-5 s in route v5; keep it simple, only touch 0-6 s. Diagnosis (tools/qa-fly/screenspeed.py, new): screen speed surges/brakes 33->22->51->9->16 px/f at frames 120/138/152/166 because retreat (60,000 units -> near) and lens are scheduled separately after the 3 s handoff; small dip at 1.8-2.2 s in the ortho pull-back. Sent narrow fix to resumed Codex (frames 1-180 only, 181+ identical).
- 07 Nov 2026: owner: final renders on 5 pods (mixed GPUs ok). BRIEF-75 to a separate Codex job: cloud-render.sh multi (shared volume, work queue with chunk claims, mixed GPUs, per-pod cleanup, robust to helper kill), smoke locally, no pods.
- 07 Nov 2026: opening fix done (frames 2-180 only; verified myself: A 181-1100 and part B unchanged vs route-v6-backup; screenspeed no surge/brake, one peak 33.8 px/f at frame 140). Live viewer reopened.
- 07 Nov 2026: poll screen (owner picked spot B, bigger, roll-up): lobby-qa.html POLL SCREEN block replaces the pollspots blockout; control-qa.html card Lower/Roll up/Zoom to the poll; server stores screen up/down (pollscreen cmd) and reads votes/result from /poll/<id>/results (dinkdonk.pollResults) every 20 s while open. Tested on 18771 with real chat and a replay of today's real Moobies! poll (building, open, results). Not promoted to lobby.html/control.html; live 18770 not restarted.
- 07 Nov 2026: poll screen made live (owner OK): lobby.html/control.html from QA (backups/2026-11-07-pre-pollscreen-live), 18770 restarted. Restart side effect: a ?everyone=1 check tab was the room's first screen and switched who-walks-in to everyone for a few minutes; restored to tag arealhumanbean (~16 extra walk-ins stayed). Then idea 2 (owner OK): the newest finished film poll's winner (ours from /dd/draft.json or dinkdonk.mov's) goes on screen 1's LED sign + poster as NEXT UP and a NEXT SHOWING overlay on the board, until it's in the watch history (12 h max). Checked with real data (Green Room won kVwkd at 13:02) on 18771, then live (backups/2026-11-07-pre-nextup-live).
- 07 Nov 2026 (Claude, hands-on): live 'shudder' 3-5 s = playback at ~20 fps (SDFGI rebuilding cascades around the far camera, measured with live_view --perflog/--off=); SDFGI now off while the camera is >250 units out (A ~91-128) + live viewer capped at 30 fps -> 3-6 s ~30 fps, one ~65 ms hitch at ~4.3 s when SDFGI comes back; 0-3 s still ~17 fps (real GI work at 28-39 units). Auditorium black = B lights on layer 1 vs camera cull mask 16 -> light.layers=16, energies + surround matched to the live still. Oncoming car added (sedan_b, car_path.json, far lane, passes ~17.2 s).
- 07 Nov 2026 13:50: v7 Cycles final DONE on pod (marker DONE), but the local helper crashed at the end (syntax error at line 319: Codex Brief 75 was editing cloud-render.sh while it ran); pod deleted, volume 1jvd0l04mu kept with the result. Fetching with a copy of cloud-render.sh.pre75 (cloud-render-fetch68.sh). Balance $10.43. Lesson: never edit cloud-render.sh while a run uses it - future multi-pod work goes in a separate file or waits.
- 07 Nov 2026: poll screen round 2 (owner): screen moved forward (v 0.45, down to z 12) so it covers the corridor standee (its cut-out hidden while down); film look on the picture (grain, flicker, vignette, warm tint, scratches, dust); projector on a bracket on the corridor's left wall (u 0) with a light beam, lamp on after the unroll; chatters on their way to a door stop in front of the lowered screen 6-14 s (75%, 12 spots, pollWatchSteps in doorSteps); bubbles keep off the lowered screen (soft rect). Tested on 18771 with real chat, then live (backups/2026-11-07-pre-projector-live).

- 7 Nov 2026 (Claude): Godot opening v7 (owner: "jitter still at 3 s… do the dolly-zoom effect instead"). v6 was a flat
  ortho zoom-out 0-3 s, then a switch to an equivalent far long-lens camera flying in 3-6 s; the joint at 3 s (plus
  the shadow fade and SDFGI switching there) read as a jolt. `godot-spike/opening_v7.py` replaces frames 1-180 with one
  dolly zoom: far pinhole from frame 1 (matches the iso still to 0.06 px), position/dolly/zoom/turn on one eased screen
  progress; the screen-centre ground point glides along the street like v6 (end swing kept to the last half).
  QA: screenspeed 1-300 no new speed turns (259/269 pre-existing), campath no yaw reversals 0-9 s. main_v2.gd: shadow
  fade removed; SDFGI bounce light fades in over the dolly (retreat 250->5) instead of popping. Frames 181+ untouched.
  Backups: godot-spike/route-v7-backup/. FINAL-CHECKLIST updated.
- 7 Nov 2026: v7 Cycles final (old route) fetched from volume 1jvd0l04mu (1,504 frames); fetch pod and volume deleted.
  The helper crash after DONE was Codex Brief 75 editing cloud-render.sh mid-run; never edit it while a run uses it.
- 07 Nov 2026: control panel: Zoom to the poll moved from the Poll screen card to the Camera card (lobby only); live (backups/2026-11-07-pre-zoombutton-live).
- 7 Nov 2026: owner on the v7 dolly-zoom opening in the Godot live view: "looks good". v7 Cycles final (old route)
  checks: flash scan finds no brightness spikes (largest frame-to-frame luma jump 0.016 at the doorway darkening,
  A1063-1073); campath shows no yaw reversals in 0-9 s. 720p copy fly/v7/flythrough-v7-final-720p.mp4 (24 MB) sent.
- 07 Nov 2026: poll screen for the hosted edition (not deployed yet): web/server.js /dd/draft (POLL_TOKEN) + /dd/draft.json (screen per room key) + pollscreen in /ctl/cmd + results check; poll-draft.js screens per room, POLL_DRAFT_FILE; shim adds ?k= to /dd/draft.json; build copies poll-draft.js; setup-server.sh makes POLL_TOKEN; userscript 0.2 also posts to the hosted server with a key set in its menu. Tested on web-test 18773 (two rooms: shared poll, separate screens, panel roll-up).
- 7 Nov 2026 (Claude): auditorium (part B) lighting in Godot (owner: "too much now; the last frames look right").
  The last frames are the Cycles still itself (endpoint.png overlay from B frame 1475); before that it is Godot light.
  Measured Godot frame 1474 against endpoint.png per region: screen 3x, seats 2x, walls 1.6x too bright. Causes in
  cinema_timeline.gd: Cycles AREA lights were converted to omni lights (all directions) with ~linear falloff, and
  lights.json matrices aim lights down local -Y. Now: AREA -> 70-degree soft spot aimed down -Y, inverse-square falloff,
  gains 0.02 area / 0.04 point, ambient 0.1; the eight row upholstery fills (which face the screen) no longer light the
  screen mesh (layer 32). Last measured before the screen split: seats 1.19x, screen 1.6x (row fills alone account
  for it: without them screen 0.136 vs render 0.141), walls ~0.55-0.7x (a bit dark). Final combination not rendered
  (owner asked to stop test windows); check in the live view. Backup: route-v7-backup/cinema_timeline.pre-area.gd.
- 07 Nov 2026 (owner change): hosted poll is per room, not shared: poll-draft.js keeps a poll per room; web/server.js takes a room's poll by room key (POST /dd/draft?k=, X-DD-Draft) and serves each room its own script (/dd/poll-script.user.js?k=: userscript template with SERVER/ROOM_KEY/@connect/@updateURL filled in); control panel: Install your poll script (local: the plain script). Shared POLL_TOKEN removed. Userscript 0.3 = template. Tested on web-test 18773 (2 rooms). Not deployed; control.html (live) not yet updated.
- 07 Nov 2026: made live (owner OK): control.html from QA (backups/2026-11-07-pre-pollscript-live), local 18770 restarted (walk-in tag and poll kept), hosted edition deployed (healthz ok; per-room poll + /dd/poll-script.user.js checked with the arealhumanbean room: SERVER https://2-29-56-208.sslip.io, its key, @connect the domain).
- 7 Nov 2026 (Claude): owner: "almost perfect", but shakiness in the first ~4 s and the last ~4-5 s of the auditorium
  pull-back. Both are where the camera sits tens of thousands of units out. (1) 32-bit rounding at 60,000 units shakes
  the render ~0.5 px per frame; (2) the B pull-back data itself had ~1 px per-frame aim-point noise (generated/stored
  in 32-bit far out): speed jumped 0.35-2.2 px/f frame to frame. `godot-spike/cap_distance.py`: soft cap to ~20,000
  along each frame's own axis (lens scaled, framing kept; frame 1 vs iso still 0.39 px), Gaussian-smoothed B aim point.
  B 1441-1474 max accel 3.97 -> 0.4 px; swap to the end plate 1.2 px. QA: no new speed turns 1-300, no yaw reversals
  0-9 s. Backup: route-v7-backup/camera_path.pre-cap.json. Not rendered (no test windows); owner checks live.
- 7 Nov 2026: owner approved the Godot draft after the shake fix ("alright its good"). Next: Blender port per godot-spike/FINAL-CHECKLIST.md, review Brief 75 multi-pod tooling, then the 5-pod Cycles final on the owner's OK.
- 7 Nov 2026: Blender port started: BRIEF-76-blender-port.md, Codex resumed (session 01a1b5ae), log codex-76.log, fly/v8/ + cloud/roxy-cloud-bundle-76. Reviewed Brief 75 multi tooling: credit guard needs $12.22 for 5 pods (balance $10.43); guardian MAX_HOURS default 6 h - use MAX_HOURS=2 for the run; stopped pods are removed by the helper or multi-cleanup; Linux side untested live.
- 7 Nov 2026: Brief 76 done: fly/v8 + cloud/roxy-cloud-bundle-76.tar.gz (sha256 5aea4002...44dd). Paths byte-identical to Godot; car + lamps + wheels; D5 statics removed; sky outer face camera-transparent (far opening was black); 35 local 540p checks; opening 80-100 max luma step 0.59/255; no yaw reversals 0-9 s; legacy + multi smokes passed. Awaiting owner spend OK for the 5-pod final.
- 7 Nov 2026 16:06: owner 'Go ahead' -> 5-pod Cycles final started (bundle 76). Balance $10.41, no leftovers. Limits: MAX_HOURS=1.5 per pod (guardian), ESTIMATE_HOURS=1.2 -> guard minimum $9.88. Log cloud/run76-final.log. Do not edit cloud/ scripts while it runs.
- 7 Nov 2026 16:10: first live multi run: both workers failed setup - multi.py run() sent stdin in Windows text mode (CRLF), pod sha256sum saw names ending in CR. Fixed (bytes stdin; backup cloud/multi.py.pre-crlf), helper killed, MULTI_RESUME=1 reused the 2 live pods: both ready 16:10. Only 2/5 4090s available in EU-RO-1. Stale 09:28 'cloud-render.sh full' helper (draft run, waiting on a deleted pod/volume) still alive: WINPID 27788; kill was denied by the permission classifier - owner to close it.
- 7 Nov 2026 16:15: owner asked me to clean stray processes myself: stale 09:28 helper killed. Owner: 'why only 2 pods?' - EU-RO-1 had only two 4090s free at start; tool doesn't add later. New cloud/add_workers76.py creates extra pods on the same volume (same bootstrap/guardian) and runs the same prepare: +1 4090 (oiaddnfzsceh3g) at 16:14; retry loop every 4 min for 2 more (ids in cloud/add_workers76.json - remove them and the volume after the helper finishes). With 2 GPUs ETA was ~160 min > 90 min cap.
- 7 Nov 2026: owner: a data center showing High stock should win. cloud/multi.py rank_centers now estimates capacity from the stock label when no count is given (High 4, Medium 2, Low 1) and ranks by it (backup multi.py.pre-stock). Spot test: High beats two Lows. Run test_multi75.py after the live run (with MULTI_STATE pointed at a temp file). Retry loop added a 4th 4090 (5zi6osich80zn0) at 16:17.
- 7 Nov 2026 16:25: owner saw low GPU use on the RunPod console. Measured on pod 59ol: GPU busy >50% only 27% of samples (mean 32%, ~107 W of ~450), blender at 100% of ONE core of 32. Receipts: 8.6 s/frame total, 7.2 s in render call (~2.5 s path tracing, rest single-threaded scene sync/BVH/motion-blur prep), ~1.4 s save/depth encode. Next time: 2-3 Blender workers per pod on the shared queue (VRAM 4.7 of 24 GB each) - not changed mid-run.
- 7 Nov 2026 16:20-16:31 (owner: "change the running job", use the GPUs fully): one Blender worker per 4090 kept
  the GPU ~32% busy (one CPU core does per-frame scene/BVH/motion-blur prep). Started extra workers on the live pods
  (cloud/extra_worker76.sh copies the running worker's env, new worker name; the queue's per-chunk locks make it
  safe). Measured: 2 workers 54-70% GPU, 4 workers 96% (VRAM 18.4 of 24 GB). Now 3 workers on 4 pods, 4 on 59ol.
  ETA 48 -> ~15 min. Retry loop added a 5th 4090 (xg7rzh0y4e0waw) 16:26. cloud/keeper76.sh on every pod holds the
  boot guardian off while any worker lives (it only watched the original worker) and marks COMPLETE after success.
  Owner: automate this for all future renders (aim for ~100% GPU) - do after this run, with tests.
- 7 Nov 2026 16:41: all 1504 frames rendered (~35 min on 5 4090s after tuning). Helper deleted its own 2 idle pods, saw none of its own left and exited (EXIT 1) before collecting - it doesn't know pods added by add_workers76. Finalize/encode ran on added pod oiaddnfzsceh3g (keeper held its guardian); 5zi6/xg7r already gone. Collecting with cloud/fetch76.py via oiad; then remove oiad + volume 1t9qz8nhzr. Lesson for automation: the helper must own every worker pod.
- 7 Nov 2026 ~16:55: v8 final collected via fetch76.py (5.56 GB, sha ok: 30ec5759...440a), 1504 frames + flythrough_1080p30.webm (50 MB) in fly/v8/cloud-final-result/flythrough67-final. All run pods removed (2 added pods were EXITED and still held the volume), volume 1t9qz8nhzr deleted. Balance $8.21 (run cost ~$2.20). Old 3 Nov stopped pod m0dhqr1o60n2fn (empty, no cost) still awaits owner OK to delete.
- 7 Nov 2026 17:00: v8 final QA: flash scan no spikes (max luma step 0.013 at A688; opening 0-200 max 0.0024; 1460-1504 none); campath no yaw reversals 0-9 s, one B rising stretch, only the final hold still. Noted: A140-166 (~4.7-5.5 s) nearly black - camera looks over the empty dark area left of the block (approved Godot framing, darker in Cycles). 720p copy fly/v8/flythrough-v8-final-720p.mp4 sent.
- 7 Nov 2026: owner approved the v8 Cycles final ("alright this is good. gj"). Open: build multi-worker GPU tuning + own-every-pod + High-stock ranking into cloud tooling (owner asked); old 3 Nov stopped pod m0dhqr1o60n2fn awaits OK to delete.
- 7 Nov 2026: owner 'Yes, build it' -> BRIEF-77-gpu-utilization.md to Codex (resumed session 01a1b5ae), log codex-77.log.
- 7 Nov 2026 (Claude): chatters in the fly-through, BLOCKOUT (owner: "build the thing that places users inside the video,
  like the original idea" = Brief 59's "the live page draws the real chatters into it"). roxy3d/fly/transition/
  build_transition.py (Blender's Python) packs the v8 final into transition.webm 1920x1620: colour on top, two 960x540
  depth tiles below (coarse 8-bit log depth per frame near/far + a folded fine ramp, period 32 steps; measured median
  error ~0.03 steps, p95 0.15-0.4) + transition-camera.json (per-frame view/proj/near/far). shared/transition-qa.js:
  WebGL player over the stage; labelled cards (A = lobby spot frozen at start, B = auditorium seat from the room)
  stand upright at their world spots, hidden by the per-frame depth. Only lobby-qa.html loads it (key T or ?fly=N;
  ?flyghost=1 shows hidden parts). standby-server.js: read-only GET /ctl/room-roster?page= (no subscription).
  Live lobby.html/control.html untouched; 18770 not restarted.
- 7 Nov 2026 ~17:30: Brief 77 done (multi_supervisor.py auto-tunes 2->4 workers by GPU<90%/VRAM<85%/CPU; guardian waits for all workers; helper tops up pods, owns every pod, reader-pod collection, cleans EXITED pods; telemetry; FRAMES test mode; 12 offline tests + guardian cases + 2-worker Blender smoke). Reviewed. Live test started: 1 pod, FRAMES=1100-1160, 15-min cap, log cloud/run77-test.log.
- 7 Nov 2026 17:31: 1st live test failed at volume create: ranking picked EUR-IS-2 (4090 Low + 3090 Low), which has no network volumes (RunPod error lists supported DCs). Nothing created. multi.py: VOLUME_DCS allow-list (from RunPod's message; MULTI_VOLUME_DCS override) + VolumeUnsupported -> try next center (backup multi.py.pre-voldc). test_multi77.py 12/12 OK. Rerunning test.
- 7 Nov 2026 17:34-17:40: Brief 77 live test PASSED: 1 4090 EU-RO-1 (skipped EUR-IS-2/US-MO-1), auto-tuned to 4 workers, GPU 96%, VRAM 13.8/24 GB, 30.6 f/min (vs ~7 f/min with 1 worker), 61/61 frames verified, pod + volume deleted automatically, cost ~$0.14 (balance $8.07).
- 7 Nov 2026 (Claude): Brief 78 (owner: "Yes, local depth pass"): Codex built fly/v8-depth78/ (Cycles OptiX depth-only,
  central pose, glass/glazing/rain/fog/steam excluded, 5720 objects in A listed in NOTES-78.md; same-pose opaque pixels
  match exactly). Full run on 2 local workers stopped at 171/1504 at 18:09 on its 350 MB low-disk guard (free space
  swung 1.8 GB -> 0.26 GB -> 1.6 GB while Brief 77's tests ran; likely page-file growth at ~0.8 GB commit headroom).
  Resumed 18:12 with 2 workers after Brief 77 finished; FAILED renamed FAILED-1809-diskguard.txt.
- 7 Nov 2026 18:20 (Claude): with only Brief 78 running, free disk fell to ~0.6 GB again: page file grew 18.5 -> 19.5 GB
  (free commit 1.1 GB with 2 Blender workers at ~3.3 GB each). Stopped the job (207/1504 kept) and resumed with
  -Workers 1 (~14 s/frame, ETA ~23:30). Lesson: on this PC one local Blender depth worker at a time.
- 7 Nov 2026 (Claude, owner OK): deleted cloud/result-full.tar.gz (5.2 GB, packed v7 fly-through final; frames stay unpacked in fly/v7/cloud-final-result/) to free disk.
- 7 Nov 2026 19:15 (Claude, owner: "do this on a runpod"): remaining Brief 78 depth frames >= 900 (600 frames) on one
  RunPod RTX 5090 (pod m2jndut9ezrz07 "dd-depth78", secure, $1.19/h, no volume, 90 min self-stop; 4090s were gone).
  fly/v8-depth78/podworker78.py + pod78.sh run the unchanged depth78.py (same signature -> receipts merge). Local job
  keeps rendering below 900. Balance before: $8.07.
- 7 Nov 2026 19:23 (Claude, owner: workers should adjust to GPU use): pod78.sh now runs a self-sizing pool:
  podworker78.py workers share one queue (atomic mkdir claims), start 4, and every 15 s the controller adds one
  (max 12, >=45 s apart) while the GPU averages <95% busy with >4 GB VRAM and >8 GB RAM free; dead workers' frames
  are re-queued (3 rounds). Swapped the running pod job at 98/600 (first start failed: missing inventory-*.json, then
  missing libEGL - the cloud helper's apt list is needed on runpod/base). Lesson: never `pkill -f <script>` over ssh
  when the ssh command line contains that name (it killed the session).
- 7 Nov 2026 19:38 (Claude): pod finished 600/600 (self-sizing pool went 4 -> 8 workers, GPU 91-99%, stopped at the
  4 GB VRAM floor; ~40 frames/min). result78.tar sha a4c01be5... verified, pod deleted, no volumes; cost ~$0.61
  (balance $7.46). Local job stopped after 1-899. Merged 595 pod frames (5 overlapped, 0 bad): fly/v8-depth78/depth
  complete 1504/1504. Old first-hit video kept as fly/transition/transition-firsthit.webm; rebuilding transition.webm.
- 7 Nov 2026 19:50 (Claude): transition.webm rebuilt from the glass-free depth (51 MB, was 82 MB). Checked on 18771
  with real chat (62 in the lobby): frame 560 shows the people inside the lobby through the front glass (mullions cut
  them correctly, no rain speckle); frame 700 shows both cashiers behind the ticket glass, counter hides their lower
  half; queue ropes still occlude. Stills fly/transition/qa/f0560-noglass.jpg, f0700-noglass-cashiers.jpg.
- 7 Nov 2026 (Claude, owner picked "Emote sprites"): shared/transition-qa.js draws each chatter's real emote (first
  frame of its DGG sprite CSS, lobby size/facing: page px -> world w/84.85, h/73.48, so frame 1 matches) with the
  name label above the head (14 px Oswald pill, chat colour / rainbow; staff unnamed). Auditorium entries use their
  room emote (or Cinema.defaultEmote) and flair colour. Images go through /dgg/emote-img (proxy only takes the
  versioned CDN path from emotes.json; CSS uses unversioned -> mapped by file name). Checked on 18771 with real chat:
  frame 1 matches the lobby, frame 700 sprites behind ropes + cashiers behind glass, frame 1420 all 135 seated.
  Not yet: animated emotes (first frame only), carried items/umbrellas/hats, walking poses. Stills fly/transition/qa/*-sprites.jpg.
- 7 Nov 2026 (Claude, owner: names "Fixed screen size"): name labels are now separate screen-space quads (the lobby's
  14 px Oswald pill at every distance, own 2x atlas), pinned 3 px above the head; a label shows only when its owner's
  head point is visible in the depth (no names through walls, no per-pixel cut-off). Sprites stay world-size.
  Checked on 18771 with real chat (frames 700 and 1420). Still fly/transition/qa/f0700-screenlabels.jpg.
- 7 Nov 2026 (Claude, owner: "Animate emotes first"): transition-qa.js samples each emote's CSS animation (Web
  Animations API, up to 24 frames: sprite-sheet steps + transforms; finite animations = end state) and decodes GIF
  emotes (ImageDecoder), all frames in one atlas with timings; each chatter loops with its own phase. 5 s limit per
  emote, emote fetches with timeouts, [fly] progress logs, QA hook DD_FLY_ANIMATED(). Checked on 18771 with real chat:
  ~80 emotes / ~200 frames sampled in ~120 ms; pixel readback at the static end frame changes for animated chatters
  (NODDERS, PoroPls, Skip) and stays fixed for static ones. Also: the video element is now full size under the canvas
  and play() retries (Chrome paused the 2 px hidden video as "video-only background media"). Found: at the wide
  auditorium end all 135 names cover the emotes (strip fly/transition/qa/f1500-anim-strip.jpg).
- 7 Nov 2026 (Claude, owner: names "like the lobby"): flight names follow the lobby rule: only chatters whose last
  message/arrival (room roster `last`) is under 120 s old when the flight starts get a name; per frame, most recent
  first, a name overlapping one already placed (or off screen) fades out over 0.4 s until clear. Checked on 18771 with
  real chat: the wide auditorium end shows the emotes with a few names instead of 135; frame 700 has a handful.
  Stills fly/transition/qa/f1500-names-recent.jpg, f0700-names-recent.jpg.
- 7 Nov 2026 (Claude, owner: "Bridge switches it"): fly-through hooked to the scene switch (QA copies + bridge).
  control-qa.html: "Fly to the auditorium" (Camera card, lobby only) sends cmd 'fly'; lobby-qa.html control() plays
  it in cut mode. transition-qa.js cut mode: auditorium 'wide' at the start and 2.5 s before the end; during part B
  the canvas shifts by the lobby's cover crop (210 stage px for the 2000x1440 OBS source; jump hidden in the black
  A1100->B1 cut) so the last frame = the cinema scene's left 2000 px; debug line hidden; on the last frames the copy
  inside OBS (window.obsstudio, or ?flycut=1) POSTs http://127.0.0.1:18790/cut-to-cinema; if that fails the last frame
  holds 20 s for a manual switch. obs-bridge.js: POST /cut-to-cinema (this PC + standby page origins only; {dry} reads
  only): turns the auditorium source's "refresh when active" off, Cut transition, program -> "DinkDonk Cinema", then
  restores Fade + refresh after 1.5 s. Tested end to end against a fake obs-websocket (fly/transition/test/fake-obs.js)
  on 18774 with real chat: panel cmd -> flight -> shift 210 -> cut + restore in the right order; final lobby frame vs
  auditorium-qa at 1280x720 line up. Not tested with real OBS (OBS was closed); bridge must be restarted to get it.
  Not promoted: lobby.html/control.html live untouched. .claude/launch.json: standby-fly test server on 18774.
- 7 Nov 2026 (Claude, owner: "migrate the url modifiers to the control panel"; picked "Show settings only" + "Server
  remembers"): new panel card "Scene settings" in control-qa.html. Lobby: bubble look, bubbles max, poll screen on/off,
  crowd, quit chance, janitor (none/always/3d), janny idle, extra rain style/brightness/speed/steps, weather clock,
  mist style/brightness. Auditorium: bubble look, screen always green, slide change, seated size/lift, leave, doze,
  chatty, phones, kick, janny idle. Setup/test options (artdir, maxres, draft, layout, fit, ctl, room, bridge, relay,
  qb, raintune, demo) stay URL-only; everyone/tag, director, zoom, phase were already in the panel.
  How: shared/settings.js (schema + validation, remembered in cache/ctl-settings.json); standby-server.js handles
  {cmd:'setting'|'settingsReset'} on /ctl/cmd, sends {cmd:'settings', values} to every screen of the scene (also on
  connect, so a reload keeps them), GET /ctl/settings for the panel. URL values stay the defaults; ↺ / "Reset all"
  goes back to them. lobby-qa/auditorium-qa: the consts became live lets + setters (mist/extra rain load lazily the
  first time they're on; extra rain "off" fades its weights to 0 so the fg rain video still shows); pages report
  settings + urlSettings in /ctl/state. shared/room.js: optional crowd() hook so the panel's crowd reaches the room.
  Tested on 18771 with real chat: every setting applied live in both QA scenes, reload and server restart keep them,
  ↺ and Reset all restore the link values, old lobby.html/auditorium.html ignore the new messages, no console errors.
  standby-server.js + shared/room.js changed in place (backward compatible; 18770 needs a restart to get it).
  Not promoted: lobby.html, auditorium.html, control.html live untouched.
- 7 Nov 2026 (Claude, owner: "Yes, promote"): scene settings promoted to lobby.html, auditorium.html, control.html.
  Backup first: backups/2026-11-07-pre-scene-settings-live/ (the three live pages; plus git HEAD copies of
  standby-server.js and shared/room.js). Ported only the settings edits: lobby.html = lobby-qa minus the fly-through
  bits (DD_FLY, 'fly' case, transition-qa.js, "Lobby QA" title); control.html = control-qa minus the Fly button;
  auditorium.html = auditorium-qa (they were identical before). Checked on 18771 with real chat: panel card shows 14
  lobby / 11 auditorium settings, both live scenes react (comic bubbles, lamp-lit mist, green screen, seated size),
  no console errors in fresh tabs; test settings reset, test server stopped. The 18770 server was not running; its
  next start loads the new server code. Docs: docs/server-and-shared.md "Scene settings" now applies to the live pages.
- 7 Nov 2026 ~20:52 (Claude, owner: "Yes, with OBS"): real-OBS run (not streaming/recording; collection
  "Moobies 1440p poll"; lobby source temporarily -> lobby-qa.html, restored after): panel 'fly' -> flight in the lobby
  scene -> bridge cut to "DinkDonk Cinema" ~52 s later, Fade restored. Flight's last frame correct in OBS. BUT the
  auditorium was black at the cut and still loading 3 s later: SetInputSettings on a browser source (the bridge's
  temporary refresh-off/on toggle) itself reloads the page. Bridge fixed: never touches source settings; warns if
  "Refresh browser when scene becomes active" is on. Seamless cut needs that option off on "Browser 3" (owner's call).
  Shots: fly/transition/test/obs-shots/. Test scripts: fly/transition/test/obs-status.js, obs-fly-test.js.
- 7 Nov 2026 ~20:56 (Claude, owner: "Yes, you do it"): turned off "Refresh browser when scene becomes active" on OBS
  source "Browser 3" (auditorium) via obs-websocket (not streaming/recording; reloaded the auditorium once). Real-OBS
  run 2: panel 'fly' -> flight -> cut to "DinkDonk Cinema" ~52 s later with no auditorium reload; Fade restored; lobby
  source URL restored to roxy.html. The cut is seamless: room, seats and seated chatters line up; only the page's own
  speech bubbles, the screen slide and the right 560 px (poll builder area) change. Stills fly/transition/qa/obs-cut-
  before.jpg / obs-cut-after.jpg. Left running: standby server 18770 and the updated obs-bridge (terminal tab).
  Still QA-only: lobby.html/control.html not promoted (lobby-qa.html also holds the settings session's work).
- 7 Nov 2026 (Claude, owner: "Yes, add it" = scene settings on the web edition): web/server.js keeps one settings set per
  room key (shared/settings.js, DATA/settings/<key>.json; deleted on revoke), sends it on /ctl/events connect and on
  'setting'/'settingsReset', serves GET /ctl/settings?k=; the room's crowd() hook reads the room's lobby crowd.
  web/build.js copies shared/settings.js next to server.js. control.html needed no change (the shim keys /ctl/*).
  Tested on the local web server 18773 with a fresh test room and real chat: card shows, lobby/auditorium react,
  reload keeps the settings, another room's values stay empty, no key = 403, revoke removes the file, no console
  errors. Not deployed to the Hetzner server yet (waiting for the owner's OK).
- 7 Nov 2026 ~21:03 (Claude, owner: "Yes, make it live"): fly-through made live. Backups backups/2026-11-07-pre-
  flythrough-live/ (lobby.html, control.html). lobby.html = lobby-qa.html (title Lobby, loads shared/transition.js, a
  live copy of shared/transition-qa.js); control.html = control-qa.html (live and QA differed only by the fly changes;
  the settings session's work was already live). docs/owner-workflow.md step 3 updated. Checked: live lobby loads with
  no console errors; real OBS run with the live lobby source (roxy.html -> lobby.html) and the live panel's button:
  cut to "DinkDonk Cinema" ~52 s later, no auditorium reload, Fade restored (fly/transition/qa/obs-live-cut-after.jpg).
  18770 not restarted (it was started 20:50 with the room-roster route). obs-bridge must run the new code (restart).
- 7 Nov 2026 21:10 (Claude, owner: "Yes, deploy"): web edition deployed to the Hetzner server (web/deploy/deploy.sh,
  725 MB, exit 0, service active, healthz ok, 6 rooms reloaded). On the server: settings.js next to server.js, the
  Scene settings card in site/control.html, applySettings in site/lobby.html. The build already had the fly-through
  promotion (lobby.html loads shared/transition.js, Fly button), but not its assets (roxy3d/fly/transition/*) nor a
  /ctl/room-roster route in web/server.js: the Fly button likely fails on the hosted site. Told the fly-through
  session; nothing changed for it here.
- 7 Nov 2026 (Claude, owner: hosted fly-through "Yes, make it work"): package/art.js lists the fly-through video +
  camera table (zip and hosted builds); web/server.js: GET /ctl/room-roster, POST /ctl/cut-to-cinema (hands {cut} to
  the room's control panel = relay host; 409 without one); web/shim.js: the page's POST :18790/cut-to-cinema goes to
  /ctl/cut-to-cinema (JSON body: the server takes JSON only), the panel's makeBridge.cut() switches OBS to "DinkDonk
  Cinema" with Cut and restores the transition right after (no timer, no source settings); web/setup.html creates the
  auditorium source with restart_when_active false. Tested on web-test 18773 with a test room, real chat and a fake
  OBS on the panel: panel Fly -> hosted flight (20 lobby + 15 seated) -> /ctl/cut-to-cinema 200 relayed -> fake OBS
  got Cut + program DinkDonk Cinema + transition back. web/README.md row added. Deploying (deploy-fly.log).
- 7 Nov 2026 ~21:25 (Claude): hosted edition deployed with the fly-through (build 778 MB; service active, healthz ok).
  Checked on https://2-29-56-208.sslip.io: transition.webm + transition-camera.json + shared/transition.js served,
  web/shim.js has the cut code, /ctl/room-roster without a key = 403. Not tried with a streamer's real OBS on the
  hosted site. Existing hosted streamers re-run setup.html once to get the auditorium source without refresh.
  The zip package (package/build.js) also picks up the fly-through files now, but it was not rebuilt.

## 7 Nov 2026 - RunPod cleanup
Deleted the old stopped pod m0dhqr1o60n2fn (dinkdonk-full, L40S, 3 Nov, empty) on owner OK. No pods left on the account.
- 7 Nov 2026 (Claude): perf audit of lobby + auditorium with real chat. Earlier "jank" (auditorium p95 25 ms) came from
  orphaned headless Edge left by the QA tools, not the pages. Clean: lobby ~105 fps p99 ~11 ms; auditorium 95-103 fps
  p99 17-20 ms, only 3-6 long tasks in the first 15 s after load. Small style-write tweaks in lobby-qa/auditorium-qa:
  safe, no measurable gain, not promoted (backups in backups/2026-11-07-pre-perf/). Fixed the QA tools to kill the
  Edge tree on exit and to stream trace.mjs SAVE=1 output.
- 8 Nov 2026 (Claude): measured live lobby.html and auditorium.html inside the portable OBS (2560x1440 @ 60, real chat,
  60 s each). Lobby: 60 fps, p99 16.8 ms, 0 frames over 20 ms. Auditorium (135 walkers): 59.7 fps, p99 16.8 ms, 19
  frames over 20 ms and 4 over 33 ms in 60 s (~0.5%). OBS render 0.21 ms, 0 skipped frames. Output:
  roxy3d/qa-night/tools/res/obsmeasure-2026-11-08.txt. Portable OBS binaries copied back (~490 MB).
- 8 Nov 2026 (Claude, owner: "the zoom amount on the control panel should work for the movie poll screen"):
  lobby-qa.html: "Zoom to the poll" = the screen's fit zoom x (Zoom amount / default 1.85), clamped 1.2-4; moving the
  slider while the camera is on the poll re-aims it (panel cmd and room snapshot). Checked on 18774 with real chat
  (camera target via new QA hook DD_FLY.camera()): 1.85 -> 3.98 (unchanged), 1.30 -> 2.80, 2.60 -> 4.00 (cap; the fit
  is already ~4, so in practice the slider only zooms the poll out). Not watched on screen (pane was not rendering).
  QA only; lobby.html not promoted.

## 8 Nov 2026 - improvement concept drafts (lobby x5, auditorium x5)
- Owner asked for 5 design drafts each of what to improve. Made overlay mockups on today's scenes (lobby: live
  screenshot with real chat; auditorium: draft 13 art) in `concepts/improve/index.html` (`?s=L1..A5` for one at
  1920x1080), PNGs in `concepts/improve/drafts/`. Nothing live changed, no renders.
- Lobby: L1 street marquee over the doors, L2 name-tag chips, L3 searchlights + skyline, L4 wet-street light,
  L5 rooftop LED countdown board. Auditorium: A1 film lights the room (queue 58), A2 aisle/step lights,
  A3 projector beam, A4 designed pre-show card, A5 side-wall dressing. L1 and A5 need art (blockout first).

## 8 Nov 2026 - owner queue 49-60, first pass (Claude, owner: "alright start with these")
All in QA copies (lobby-qa, auditorium-qa, control-qa, transition-qa) plus shared server code; nothing promoted to
lobby.html / auditorium.html / control.html. Tested on the 18774 test server with real chat; stills in
`roxy3d/qa-queue-0811/`. Backups of every shared file touched: `backups/2026-11-08-queue/`.
- 59 facing: shared/emote-facing.json BLESSTINY, NOBULLY, WAOW "front" -> "left" (art checked enlarged: BLESSTINY
  turned left, NOBULLY points left, WAOW three-quarter face, nose left). Shared file: live on the next page load.
- 52 Yee front row: shared/room.js chooseSeat: non-Yee never get a front-row seat (they wait outside); Yee overflow
  into the other rows only when the front row is full; seatQueue no longer stops at the first non-Yee who can't sit
  (a Yee behind them still gets in). Same in auditorium-qa.html's own seating (+ arrivals loop skips a blocked head).
  The Yee list matches every Yee emote on DGG today (13). Seated chatters keep their entry emote, so switching emotes
  can't break it. Node test: 150 PEPE + 25 YEE -> 0 non-Yee in front, 18 Yee in front, 7 Yee waiting (hall full).
  Note: room.js runs in the server, so this goes live at the next standby-server.js start.
- 53 Empty both: control-qa.html "Empty lobby + auditorium" at the top (confirm dialog), = reset lobby + reset
  auditorium. Tested (commands): both rosters 0.
- 54 Screen picker: room show.screen auto | upnext | loading | audience | film (panel select in the pre-show card).
  A slide is held (no rotation, also during Film); "The film" puts the film up whatever the phase; Film / Movie set it
  back to auto. Pages: filmOnScreen() drives the green screen, the bridge's film flag and the fill. Tested.
- 60 Litter: room show.litter + show.fullAt (first moment >= 60% seated; reset / toggle clear it; 'show' event with
  server time). auditorium-qa draws up to 140 SVG pieces (popcorn clusters, tipped boxes, cups, wrappers, napkins)
  from 10 min after fullAt over 25 min, depth-sorted with the slices, dimmed with the lights; weighted to the open
  floor (cross-aisle, front, stairs) since legroom litter hides behind seated people. Same pieces on every screen
  (seeded by fullAt). Panel: Litter on/off + status line. ?littermin=<min> previews. Tested (clock 598 s after on).
- 51 Poll countdown: lobby-qa poll screen: big clock next to the title while the poll is open (from dinkdonk.mov's
  end time, which the server already reads), ticks every second, orange in the last minute, red pulsing in the last
  10 s, "CLOSING..." at 0. Tested with a copy of today's real poll set open on the test server (file restored).
- 50 Vote: shared/room.js voteFollow: a message containing "vote" gets the director once 40% of the usual gap has
  passed (new arrivals via follow flag, people already in the room via a follow event); page fallback in lobby-qa.
- 57 Stall gag: the room picks two lobby chatters every 10-20 min ('gag' event); lobby-qa walks them into one free
  stall, hearts float up for ~9 s, they come out one after the other (blush emojis) and carry on; the director follows
  the first for at most 30 s. Tested on 18774 (forced via /ctl/cmd {cmd:'gag'}): camera held on the stall, hearts,
  both left for the usher gate afterwards.
- 56 Interesting spots: a third of the lobby director's turns look at a spot for 7 s ('peek' event): wcat and eatfresh
  billboards, the roof sign, cashiers, snack clerks, usher, screen posters 1-3, the cat, the bus shelter ad. Framing
  checked for sign, cashiers, snack bar. Candidate list to be confirmed by the owner.
- Gating: room events the old pages can't play (peek, gag, vote) only go out when a screen of the page says it can
  (window.DD_ROOM_CAPS -> shared/cinema.js 'caps' param -> standby-server.js / web/server.js -> room.subscribe).
  The QA pages set it; lobby.html / auditorium.html don't, so a server restart before promotion changes nothing
  for them (checked: live pages load clean on the new server).
- 55 First-cut warm-up: obs-bridge.js POST /warm-cinema (lobby asks at the start of a cut-mode flight, OBS copy only):
  the auditorium browser source is added hidden into the program (lobby) scene, moved off-canvas, shown (counts as
  shown, so OBS loads it), and removed 1.5 s after the cut (or after 2 min). Hosted: shim -> /ctl/warm-cinema ->
  panel bridge.warm(). Tested with fake OBS (test/fake-obs.js extended): ADD hidden, MOVE x 2960 on a 2560 canvas,
  enable, cut, REMOVE. Not tested: real OBS from a fresh start (needs the owner, not while streaming); hosted path.
- 58 Screen glow, draft: auditorium-qa bloom (box-shadow on a div mapped onto the screen like the pre-show) and a
  floor spill ellipse, both screen-blended, only with the film up and the lights down. Colour from ?glow=<hex> or
  ?glow=cycle for now; step 2 (after the owner OKs the look): the bridge samples the film's average colour.
  Draft still: qa-queue-0811/58-glow-draft.jpg (the screen there shows a stand-in gradient, OBS shows the film).
- 49 (poll zoom) unchanged: waiting for the OK to go live with everything above.

## 8 Nov 2026 - queue 58 screen glow: colour follows the film (Claude, owner OK'd the glow look: "Looks right")
- obs-bridge.js: while the film is up (and a page is connected), GetSourceScreenshot of "Film screen (src)" at 96x54 PNG
  about every 500 ms; a small PNG decoder (zlib, 8-bit RGB/RGBA, all row filters) takes the alpha-weighted average
  (the source is corner-pinned, so most of its frame is transparent) and sends {glow:[r,g,b]} to the pages when it
  changes. Errors are logged once, then the loop slows to every 5 s. Old pages ignore {glow}.
- auditorium-qa.html: filmColour() lifts the film average into a light colour (keeps hue, a bit more saturation,
  level from its brightness: dark scenes glow faintly, bright ones fully); ~0.6 s easing; without readings for 3 s
  (outside OBS, old bridge) back to the cool white of the draft. ?glow=<hex>/cycle still override.
- Hosted: web/shim.js samples the same way in the browser (createImageBitmap + canvas) in direct and relay mode;
  web/server.js passes host {glow} readings (3 integers 0-255 only) on to the room's pages; BridgeSocket only
  replays {obs} on open.
- Tested: fake OBS (test/fake-obs.js now answers GetSourceScreenshot with a pinned-film PNG whose rows use all five
  filters, colour changing every 4 s) + test bridge on 18791 + auditorium-qa loaded as if in OBS
  (test/obs-wrap.html): glow went blue -> green -> orange with the film, stopped with film off, back to the idle
  white 3 s after the bridge went away. Decoder = browser result on real PNGs (RGBA emote, RGB frame).
  Not tested: real OBS (GetSourceScreenshot cost and the real film's look), hosted path end to end.
- Backups: backups/2026-11-08-glow/.

## 8 Nov 2026 - queue 49-60 live (Claude, owner: "Go live")
- Promoted: lobby-qa.html -> lobby.html (title "Lobby", loads shared/transition.js), auditorium-qa.html ->
  auditorium.html, control-qa.html -> control.html, shared/transition-qa.js -> shared/transition.js (live header kept).
  The DD_ROOM_CAPS lines came along (lobby 'peek,gag,vote', auditorium 'vote'). Also carried along: the 7 Nov perf-QA
  bubble changes that were already in the QA copies (bubble sizes measured before the frame's writes, opacity only
  written on a change). Backups of the old live files: backups/2026-11-08-golive/.
- Checked on the 18774 test server (new server code): live lobby, auditorium and panel load with no console errors;
  panel shows Empty both, screen picker, litter toggle + status.
- Still running old code until restarted: the 18770 server (room.js: Yee front row, litter clock, screen picker kept
  in the room, peek spots, stall gag, vote follows) and obs-bridge.js (film-colour glow, first-cut warm-up). Until then
  the new pages work without those: no litter, no peeks/gags, screen picker per screen only, glow in the idle white.
  OBS sources show the new pages after their next reload.
- 56: went live with the 11 candidate spots as built (owner hasn't trimmed the list).
- Not done: hosted deploy and zip rebuild (owner OK needed), real-OBS test of the warm-up and the glow colour.
- 8 Nov ~19:19, owner "Restart now": the 18770 standby server and obs-bridge.js restarted in their own windows
  (start-standby.bat / start-obs-bridge.bat; my first try with cmd /K windows didn't start node, so both were down
  for about 4 min). Checked: room state now carries screen/litter/fullAt (new room.js), lobby chat active, bridge
  "OBS ready". OBS (started 19:16) connected to the new bridge. The room's auditorium show was left in Film/outro with
  house out from earlier - unchanged.
- 8 Nov ~19:40, owner "Yes, both": hosted edition rebuilt and deployed (web/deploy/deploy.sh; service active, chat
  connected, the deployed pages/room/server carry the queue 49-60 code; the old version stays in
  /opt/dinkdonk-cinema/previous). First deploy try failed at the build (my shell sat in dist/web and locked it);
  nothing had been uploaded.
- Zip rebuilt: dist/DinkDonk-Cinema.zip (775 MB). Two package/build.js fixes:
  - the live OBS lobby scene is now "Lobby + Poll setup 2" (lobby only, no poll builder): the build takes a numbered
    copy and ships it as "Lobby + Poll setup" (owner chose "your current scene"); README line updated.
  - the packaged server could not start since 7 Nov (standby-server.js requires poll-draft.js, which the build did
    not copy): now copies poll-draft.js and userscripts/dinkdonk-poll-draft.user.js. Smoke test on 18771: server
    starts, lobby/auditorium/control/room.js/dd/draft.json answer 200.

## 8 Nov 2026 - queue 61: picked drafts L3, L4, A2, A3 built in QA (Claude)
- lobby-qa.html: three page layers over the background, under #world (z 3): #skyline (far skyline blocks across the
  black top-left, normal blend), #skyfx (warm haze along the top edge, red aircraft light, two roof searchlights
  sweeping 23 s / 29 s; screen blend), #wetfx (purple spill from the glass front onto the sidewalk + vertical puddle
  reflections under the lamp, video store, pink neon and corner shop, slow shimmer; screen blend). Gradients only, no
  blur filters; motion is transform/opacity only. ?sky=0 / ?wet=0 turn them off. The draft's extra lit windows and
  brake-light smear were left out (windows didn't line up with the render's grid; a fixed red smear vs moving cars).
- auditorium-qa.html: A2 aisle lights from the layout JSON (amber nosing strip on every tread of both stair aisles,
  lamps at each raised row's aisle ends, cyan cove strip along the stage edge at v 0.3, red/green halos at the two
  EXIT signs), depth-sorted with depthZ, fading in with lights-down (6 s). A3 projector beam from a booth above the
  back wall (u = screen centre - 2.3, v = back wall, z 580, where the picked draft had it) to the screen corners:
  three nested hulls with a gradient (no blur), 48 drifting dust motes clipped to the beam; on with the film +
  lights down, tint and brightness from the screen glow (stepGlow). ?aisle=0 / ?beam=0 turn them off.
- Checked in the browser pane with real chat (lobby-qa ?everyone=1; auditorium-qa ?room=0&phase=film&glow=ff9a50):
  no console errors. Not checked: inside OBS (black screen + pinned film), performance with a full house, hosted.
  Live files untouched. Screenshots: concepts/improve/qa/.
- 8 Nov ~19:45, owner "Go live": lobby-qa.html -> lobby.html (title "Lobby", shared/transition.js kept),
  auditorium-qa.html -> auditorium.html. Before that, diffed: live = QA apart from these changes and the live header.
  Backups: backups/2026-11-08-queue61/. Checked on the 18771 test server (stopped afterwards) with real chat: lobby
  sky 6 + wet 5 layers, auditorium 60 lamps + beam on in film/lights down; no console errors except the favicon 404.
  Found the 18770 standby server and obs-bridge.js NOT running (only the chat relay on 18765) - not restarted, owner
  asked. Hosted edition and zip not updated.
- 8 Nov ~19:50, owner "Start them": started start-standby.bat (18770) and start-obs-bridge.bat (18790) in their own
  windows. Checked: lobby/auditorium/control.html 200 and serve the queue-61 layers; bridge status "OBS ready,
  1 page(s), film on". OBS browser sources still need a refresh to pick up the new pages (not done by me).
- 8 Nov ~20:00, owner "you can update the hosted site": `bash web/deploy/deploy.sh` (build 778 MB, exit 0). Server:
  service active, /healthz ok (chat true, 0 screens). /opt/dinkdonk-cinema/current/site/lobby.html has the sky/wet
  layers, auditorium.html the beam/aisle code; previous version kept in /opt/dinkdonk-cinema/previous. Keyed pages
  answer 403 without ?k= (as designed). Zip not rebuilt. L1 marquee: later (owner).

## 8 Nov 2026 - lag on camera moves and light changes (Claude, owner: "still lag, bad")
- Owner's OBS recording (Videos/2026-11-08 19-27-22.mp4, decoded frame by frame): the camera advanced only every 2-3
  output frames (20-30 fps) in both scenes, and the auditorium froze up to 12 frames (~200 ms) during the light fade.
- Causes (headless Edge 2560x1440, real chat, RTX 3050 laptop):
  - #cam had no will-change: every director move/zoom re-rastered the whole lobby/auditorium.
  - Auditorium fade: `--dim` was a registered, inherited custom property with a 6 s transition on #stage, so every
    frame of the fade restyled all ~9000 elements (430 ms/s style) and repainted the room incl. the full-frame dim
    picture.
- Fix in lobby-qa.html and auditorium-qa.html (live files untouched):
  - `#cam { will-change: transform }` in both.
  - auditorium: the fade is driven from script (stepDim, same 6 s ease-in-out, reversals continue from the current
    level); #bg-dim is its own layer (will-change: opacity) and gets every frame's value; the culled dim pieces and
    the door sheet get the value in 1/64 steps and on being shown (no blocks mid-fade).
- Measured (same tests, live -> QA): lobby camera moving 63.6 fps / p99 50 ms -> 118 fps / p99 17 ms (uncapped);
  auditorium camera 75 -> 120 fps, p99 33 -> 17 ms; auditorium light fade 27 fps / p99 267 ms / max 725 ms ->
  68 fps / p99 50 ms / max 83 ms. Zoom-in sharpness (edge score on fixed signs) unchanged; mid-fade and full-dark
  shots match live. Not measured inside OBS.
- tools/trace.mjs: `JS=` env runs an expression 3 s after load.
- Later (owner: keep testing; multi-threading? GPU use?), in the portable OBS (tools/obsbench.mjs, obsshow.mjs):
  - Found: the live OBS browser sources ("Browser" lobby, "Browser 3" auditorium in Moobies 1440p poll) have
    "Use custom frame rate" on with no rate = OBS's default 30 fps, on a 60 fps canvas. Owner to untick it (or 60).
  - Hidden sources are paused by OBS (rAF 0, document.hidden): a second page costs ~nothing.
  - In OBS @60: live lobby with camera moves 56.4 fps / 98 frames >20 ms per 30 s -> QA 59.9 / 1; auditorium
    light fade live 33.6 fps / 769 -> QA 59.1 / 21 -> (after the two fixes below) 59.4-59.6 / 7-18.
  - GPU stayed 11-35% throughout; the limits were main-thread style/paint and the browser's one GPU-process thread,
    not the GPU or a lack of threads (page script ~1 ms per frame), so workers/OffscreenCanvas would gain little.
  - auditorium-qa.html, more: chatters' emote/item dimming stepped from script (stepEmoteDim, 1/32 steps) instead of
    a 6 s CSS filter transition on every chatter (headless fade 94 -> 120 fps uncapped); the no-dim-art fallback dim is
    its own class (lights-flat) and the lit pieces are hidden per displayed piece in cullPieces, so a lights toggle
    no longer restyles all ~4600 slice images. Film phase checked: beam, dust, glow and hidden lit pieces as live.
  - Test server 18771 seeded with a copy of the live room (cache/room-state-18771.json; its old file kept as
    room-state-18771.bak-pre-fullhouse.json) for full-house show runs.
- 8 Nov ~22:00-22:35, full house of real chatters (test server 18771 seeded from the live room: 397 auditorium /
  55 lobby; ~137 chatters on screen) driven through the real panel commands (tools/obsshow.mjs: follows, zooms,
  lights down, film push-in, house lights up/down, outro, movie, lights up), in the portable OBS set up like the
  owner's output (tools/obsrec-setup.mjs: 2560x1440 -> 1920x1080 @60, NVENC CBR 8000) and RECORDED: a frame counter
  injected by the test (top-left block) is decoded from the recording (tools/recana.mjs), so the numbers are what
  reached the output. Owner runs the sources at a custom 30 fps on purpose (style): target = a steady 30.
  - @30, frames per second actually shown, live -> QA auditorium: lit steps 28-30 -> 30.0; lights down 20.3 -> 30.0;
    film push-in 25.8 -> 30.0; house lights up/down in film 19.4/19.0 -> 29.9/30.0; follow in the dark 19.3 -> 30.0;
    lights up 22.2 -> 30.0. QA's remaining unevenness: ~10% of frames held 3 ticks then 1 (late by a tick, none
    dropped), mostly while zooming (the re-raster that keeps zooms sharp). Lobby: live 29.4-30 with hitches to
    100 ms -> QA a clean 30.
  - auditorium-qa.html, more: one fade clock (~8 Hz) for everything painted with the room (dim pieces, door sheet,
    chatters' emote/item brightness, aisle lamps; lamps lost their 6 s CSS transition); the dim twins of displayed
    pieces stay drawn at 0.5% while lit (DIM_WARM) and the lit art stays drawn under the dim art (no dim-done
    hiding), because Chrome drops decoded images it no longer draws and each fade start decoded ~800 of them
    (40-80 ms raster stalls).
  - Pitfalls found: OBS reloads a browser source only when its settings change (obsshow adds run=); two drivers on
    the same source spoil both runs (tools/obslock.mjs now refuses a second one); a portable OBS up for hours
    drifts - restart it between long batches.
- 8-9 Nov night, more (portable OBS, @30, full house):
  - Full lobby (crowd thinning off on 18771, 64 on screen): QA a clean 30 in every step; live mostly 30 but zooming
    out jitters (36 of 197 frames uneven) with a 100 ms hold.
  - Soaks (tools/soak.mjs, one page load, show cycled): auditorium-qa 42 min / lobby-qa 31 min: every cycle 29.9 fps,
    worst frame 34 ms, no slow frames, heap 5-12 MB, DOM steady - no degradation over time.
  - Cut lobby -> auditorium with the auditorium hidden (OBS pauses hidden sources and drops their tiles):
    ~430-480 ms freeze, live and QA alike (the owner's recording froze ~230 ms at its cut). With the auditorium
    shown off-canvas 5 s first (what obs-bridge's /warm-cinema does for the fly-through): 50-67 ms, invisible. Only
    the fly-through warms; a plain cut (hotkey/scene click) freezes. Idea for the owner: a panel "cut to cinema"
    that warms first (not built).
  - Tried and reverted: spreading each fade update over 4 frames by stage band (no measurable gain).
  - Pacing: custom 30 fps gives an even 30 (every page frame held 2 ticks). Custom 60 vs custom off was
    inconsistent between runs (earlier claim withdrawn).
  - Residual auditorium unevenness (~5-15% of frames one tick late, none dropped; lobby ~1%): A/B in OBS shows it
    comes from drawing the ~137 chatters' emote images in the shared room layer (hidden emotes or grey boxes: mostly
    gone; paused sprite animations, no clip-path, no name shadows, no emote scale: no change). A trace of a zoom-in
    in OBS has only ~300 small decodes and one GPU task >20 ms in 9 s: timing variance, not stalls. Not pursued: the
    fix would be compositing emotes, which the 4 Nov QA found explodes layers.
  - Checked: zoom sharpness inside OBS (poll-screen zoom, live vs QA: same edge scores); both lobby videos
    (light_loop_2x 4K VP9, rain_fg) are hardware-decoded (D3D11VideoDecoder), 0.8% dropped video frames.
  - Test tools added in roxy3d/qa-night/tools: obsbench, obsshow (REC=1, CSS=), recana, obsrec-setup, obstrace,
    soak, cuttest, obsshot, obslock, longtasks, pageinfo. Kept recordings: rec/ (30 fps show, QA vs live).
- 9 Nov ~01:00-01:30:
  - Fly-through (panel "fly", ?flycutdry=1, @30 in OBS): clean in live and QA - 30 fps shown, <1% late, the
    transition video's frames presented in sequence (1499/1500).
  - Standby server 0.2% of a core, test server 0.9%, chat relay 0.3%: not a factor.
  - Cut freeze anatomy (tools/cuttrace.mjs): ~550 ms of image decoding + a 270 ms first frame; OBS drops a hidden
    page's decoded images. Tried loading the auditorium's dim set while hidden (decode() never settles hidden):
    the cut got worse (433 -> 600-650 ms, the first frame then decodes both sets) - reverted, comment left.
  - lobby-qa.html: a vehicle's old body slices were removed only after the new ones decode()d, which never happens
    while OBS keeps the lobby hidden, so they piled up for the whole film (2.5 min hidden: live 31 vehicle images,
    QA 20). Hidden, the old set now goes at once.
  - Tried and dropped: emotes on their own GPU layers (no gain beyond run-to-run noise, longer worst frames).
  - Headroom @60 (custom off), full house: lobby-qa 57-60 fps shown in every step (could run at 60);
    auditorium-qa 41-55 fps - 30 is the right rate for a full auditorium on this laptop (the owner's choice).
  - auditorium-qa.html: the projector dust (48 motes) was a CSS keyframe with var() values, which Chrome runs on the
    main thread: ~5000 style recalcs a second, also with the dust off (seating). Now a Web Animation per mote with
    explicit values (same rnd() draws, same paths), paused while the dust is off. @60 full house, lit steps:
    seating 54.8 -> 59.4, follow 53.8 -> 58.8, zoom 50.5 -> 57.6, film push-in 51.0 -> 57.9 fps shown.
    Film-phase screenshot: dust in the same places.
  - Found and left: the lobby's wet footprints (7 s opacity fades, up to 30) restyle on the main thread; small.
  - auditorium-qa.html, litter: the 140 pieces were SVG <img>s, which Chrome redraws from their vector shapes on
    every repaint of their tiles (A/B @60: no litter = fades ~10 fps faster; litter without its filter = no change).
    Each design is now drawn once into a PNG at 4x its stage size (sharp at 3x zoom on 1440p) and the pieces use
    that; their filter steps with the room's fade (no 1.5 s CSS transition; the litter now dims with the room over
    6 s). @60 full house with full litter, fades: lights down 42-48 -> 50-56, house lights up 32-39 -> 47-55, down
    33-42 -> 52-53, lights up 33-45 -> 53 fps shown, worst frames 67-100 -> 33 ms. Tried and dropped first: SVGs
    with the two looks baked in (swapping 140 SVGs per fade was worse).
  - Final check @30, full house with full litter, recorded (QA vs live): QA 29.9-30.0 fps shown in every step with
    0-8 late frames per step (before the dust/litter fixes: 20-60); live 18.4-26.1 in the dark/fade steps (lights
    down worst frame 183 ms). Soak 25 min on the final QA: 29.9 every cycle, worst 34 ms, no growth.
  - Keeping the auditorium warm all the time (off-canvas in the lobby scene) fixes every cut but costs 2.6-3.1
    browser cores and 22-27% GPU vs 0.8 / 10% while the lobby is up: not worth it. On-demand instead:
    control-qa.html has a "Cut to cinema" button (lobby page): obs-bridge /warm-cinema, 5 s, /cut-to-cinema; result
    shown on the button. Checked only up to the bridge (OBS was off: 503 "OBS not ready", no cut sent); the real
    warm + cut needs the owner's OBS.
  - Machine load during the show @30 (portable OBS, full house): auditorium QA 0.72 browser cores / 12% GPU vs live
    1.80 / 17%; lobby QA 0.95-1.22 / 17% vs live 1.57-1.65 / 22%. GPU memory with a full house: QA +64 MB lit,
    -65 MB dark vs live (~1.8-1.9 GB total) - the always-drawn lit/dim art costs nothing measurable.
  - Per-feature cost in OBS @30, one page load, feature off/on in alternating windows (tools/featab.mjs; a do-nothing
    control lands within +-0.1 cores): lobby-qa total ~0.75 cores - prop loops (~70 sprite loops, 58 wet
    highlights at 24 fps) 0.27 cores, everything else (light loop, sky, wet layer, vehicles, rain GL, bubbles) at
    noise level. auditorium-qa full house: ~0.5 cores / 5% GPU lit, ~0.6 / 8% in the film; nothing above noise
    lit; in the film the projector set (beam, dust, bloom, spill) <= ~0.1-0.2 cores also with drifting film colours
    (tools/fakebridge.mjs stands in for obs-bridge on 18799). No hotspot left to fix.
  - obs-bridge's film-colour sampling (GetSourceScreenshot 96x54 PNG every 500 ms): 2-3 ms per shot, no OBS render
    or output lag, recording cadence unchanged (tools/glowstall.mjs). Safe.
  - House out with a full house (panel "house out" after lights up; tools/obsshow.mjs audout, test room re-seeded
    from the live room before each run, tools/outpair.sh): live and QA both hold 30 with no drops, but QA had more
    one-tick-late frames (30-118 per 20 s vs live 8-25). A/B: the always-drawn warm dim twins (every piece toggled by
    someone walking past also toggled its twin); the camera layer was not it. auditorium-qa.html: no twins during a
    house out with the lights up and no fade -> 0-5 late per 20 s (two runs), better than live. Tried first: twins
    only for pieces up 2 s (worse, reverted).
  - Full show @30 on the final QA (house-out fix in): 29.8-30 fps shown in every step, 0-4 late frames per step.
  - Scene settings in OBS @30 (tools/setab.mjs: set through the test server's panel commands, alternating with the
    default): lobby - all 6 bubble looks, extra rain off/deluge, mist 1-4, janitor penguin/3D, 14 bubbles: no slow
    frames; mist 3-4 cost ~+4-5% GPU, the 3D janitor ~+0.2 cores. Auditorium (full house) - all bubble looks and 14
    bubbles: ~0.4 cores / 4% GPU, no difference, no slow frames.
  - Stress: full show @30 with a film playing in OBS at the same time (tools/obsfilm.mjs: a looping 1080p60 media
    source, hardware decode, composited in the scene; recording on): QA a clean 30 in every step (0-4 late), 0.60
    browser cores / 16% GPU; live 18.7-25.9 fps in the dark steps (worst 233 ms), 1.78 cores / 21% GPU.
  - Ready for the owner's OK: roxy3d/qa-night/tools/promote-perf.mjs (dry run by default; --apply backs the live
    files up to backups/2026-11-09-perf/, copies lobby-qa/auditorium-qa/control-qa over the live pages with the
    lobby's live header kept, and refuses if a live file changed since 9 Nov). Dry run passes; the promoted lobby
    differs from live by exactly the two lobby fixes.
  - Tried and rejected: the lobby's prop loops on their own GPU layers (.proploop will-change) - 0.21 cores less, but
    zoom-ins of the loops went soft (poster/bulb edge detail -9..-20% at 2.5x): breaks the full-resolution rule.

### 9 Nov 2026 - long soaks of the QA pages (portable OBS, 30 fps, test server 18771, real chat)
- auditorium-qa, 2 h full house (134-137 walkers, light cycles all the way): 58/58 cycles at 29.9 fps, p99 33-34 ms,
  max 34 ms, 0 slow frames. Heap 6-12 MB (sawtooth, no growth), DOM nodes 6376 -> 6424, images 4919 -> 4925.
- lobby-qa, 1 h (12-42 walkers): 40/40 cycles at 29.9 fps, max 34 ms, 0 slow. Heap 4-8 MB, nodes 495-741 follow
  the walker count (no leak).
- No slowdown or leak over time; the fixes hold for a full movie night.

### 9 Nov 2026 - fresh-load hitches (new tool qa-night/tools/loadwave.mjs: buffered long-animation-frames in OBS)
- Found a QA regression: the litter bitmaps (from the 9 Nov SVG fix) were drawn on GPU canvases and encoded with
  toDataURL; with litter down, a fresh load did all ~20 designs at once and each waited for a GPU readback:
  hitches of 390 and 490 ms about 7 s after load (live has no such frames). It would also hit mid-show the first
  time a new design appears.
- Fix (auditorium-qa.html rasterLitter): one design at a time (40 ms apart), CPU canvas (willReadFrequently),
  toBlob + blob URL. After: no litter script in any long frame; all 140 pieces on blob bitmaps, same pixel sizes,
  look unchanged (shots/litter/blob_zoom.png).
- Left as known: on both live and QA, ~5-6 s after a fresh load the room snapshot places the full house at once
  (script 150-210 ms), then one ~400 ms frame waits for the first decode (560 ms on workers) and GPU raster
  (475 ms) of 135 walkers. Happens once per source load, never mid-show (soaks: max 34 ms over 2 h).
- After that first second: QA auditorium 3 frames > 50 ms in 35 s vs live 130-150 (51-88 ms, the dark-scene cost
  the 8-9 Nov fixes remove). Lobby: both clean after the first ~1.1 s.
- tool fix: loadwave's script sort threw on LoAF's frozen scripts array (that was the "hang").
- Show sweeps after the litter fix (OBS, full house 135 walkers): at 30 every step p99 33.4 ms, one late frame in the
  whole show (first lights-down); at 60 every step 16.7/16.8 except the first lights-down (3 frames > 40 ms, max 83)
  and 2 frames each in movie / lights up. The 8 Nov qa5 run at 60 had 10-15 such frames per fade, max 150.
- Tried and reverted: resting #bg-dim at 0.005 instead of 0 (keep its decoded image): first lights-down A/B
  (firstdim.mjs, 3 rounds at 60) 3-6 late frames in 8 s either way. The rest are room repaints on the fade clock.
- Checked against the owner's active collection (Moobies 1440p poll, read-only): sources on 127.0.0.1:18770,
  2560x1440, custom fps (30), shutdown off, film on its own scene with the shader filter; no OBS browser docks.
  Same as the test setup. The four node processes (servers, bridge, relay) use ~0 CPU.
- Hidden full-house auditorium behind the visible lobby: no measurable cost (lobby 0.6-0.7 cores, 30.0 fps either way).
- Show at 30 under film load (new filmsrc.mjs: looping 4K60 h264 media source, hw decode, over the screen area) with
  NVENC recording: page 30.0 fps every step, GPU 25-30%; recording 29.9-30.0 fps per step, no page frame lost,
  at most 7 frames per step held one output frame longer (longest 50 ms), mostly 30-on-60 phase jitter.
- Same film-load show on the LIVE auditorium.html (recording, 30 fps): camera moves 27.4-28.0 fps (up to 83 ms),
  lights down 20.1 fps (up to 233 ms), fades in the film 18.6-19.4 fps, follow in the dark 19.3 fps; browser
  1.5-2.3 cores vs QA 0.3-1.0. QA in the same run: 29.9-30.0 fps every step. Recordings kept in qa-night/rec/
  (auditorium-LIVE-/QA-30fps-fullhouse-film4k-show.mp4).
- Lobby show + fly-through sweeps at 30 (QA): every step 30.0 fps, max 33.5 ms; fly-through video 0/1504 dropped.
  Sunday-morning chat emptied the lobby to 11-19 walkers by the time the sweeps ran; at the 55 cap (fresh-load runs)
  it was clean after the first second. Promote dry run still passes (includes the litter fix).
- Busy-chat runs (9 Nov, 15:10-16:10 UTC, 87 msgs/min, 53 chatters; QA pages, test OBS at 30, recording on):
  - Auditorium show, full house (135), 4K film source playing: page 30.0 fps every step (max 33.5 ms, 1-2 frames of
    67 ms in the dim and lights-up fades); main thread over 30 s after the show: 2 long frames, rAF p99 33.4 ms.
    Recording: 29.7-30.0 fps per step, 2 page frames never shown in 145 s; more 30-on-60 phase jitter than in quiet
    chat (up to 29/333 frames held one output frame longer, in lights up), all on the OBS/compositor side.
  - Lobby show (52 walkers) and fly-through: page 30.0 fps every step; recording 29.7-30.0, 3 page frames never shown
    in "next arrival"; fly-through video 1/1504 dropped. Lobby browser 1.0-1.8 cores vs 0.6-0.8 in quiet chat.
  - Where the lobby's extra time goes (Chromium trace, 10 s): JS only ~57 ms/s; image decode on worker threads
    ~0.2 cores (167 png decodes/s, some large sheets re-decoded ~3x/s). Hiding the umbrellas (A/B, 2 rounds) did not
    change it; the count swings with the camera, not a single asset. Left alone: off the main thread, no page frames lost.
  - 30-min lobby soak: 29.9-30.0 fps every cycle, 1 frame over 40 ms in 30 min, heap 4.5-8.9 MB, nodes and images
    follow the walker count (36-63), no growth.
  - 30-min auditorium soak, full house (135-137), busy chat: 29.9 fps every cycle, max 34 ms, 0 slow frames, heap
    7-12 MB, nodes/images flat (6378-6438 / 4927); running animations level off at ~97 after the first lights cycle.
  - Verdict: no new stutter under busy chat on either QA page; nothing new to fix. Waiting on the owner's OK to promote.

### 9 Nov 2026 (evening) - lobby prop loops off the image cache; the auditorium lights-up blackout
- New tools (qa-night/tools): decab.mjs (fresh load in the test OBS, Chromium trace per camera state: png decodes,
  raster ops, GPU/main-frame time, CPU), abcss.mjs (A/B one injected CSS rule on the loaded page), artscan.mjs (finds
  one-frame glitches in an OBS recording: a patch that differs from the page frames before and after while those agree;
  EXCL= leaves out a region such as a film source).
- Lobby, busy chat: the extra CPU was image decoding. A/B with the 74 prop loops hidden: png decodes 170-350/s -> 10/s,
  raster ops 2500-2800/s -> ~930, browser 1.6-1.9 -> ~1.0 cores. Each loop step (background-position on a div) repainted
  its patch of the lobby's one big #cam layer, and the sheets (~220 MB decoded, more than Chrome's decoded-image cache
  keeps) were decoded again and again.
- lobby-qa.html: loops now ?loopcv=2 (default): the whole sheet drawn once on its own canvas (from fetch -> blob ->
  ImageBitmap -> OffscreenCanvas copy: bitmaps from an <img>, or straight from a blob, were still re-decoded on every
  draw) behind a frame-sized overflow:hidden window, and a step only moves it (compositor transform). ?loopcv=1 = one
  frame drawn per step on a frame-sized canvas; ?loopcv=0 = the old div. Fresh-load A/B in the test OBS (2 loads each,
  3 camera states): cores 1.57-2.16 / 1.27-1.46 / 1.26-1.47, GPU task 211-320 / 186-251 / 134-202 ms/s, raster ops
  2700-3100 / 2600-3100 / 965-1630 per s, png decodes 78-316 / 4-15 / 7-34 per s (modes 0 / 1 / 2). GPU memory
  ~+550 MB with mode 2 (owner, 9 Nov: more RAM/VRAM is fine for less stutter). Same look in side-by-side shots.
  Recorded lobby show (mode 1 vs 0, chat thinning, 24 vs 41 walkers): 0-3 vs 1-39 late output frames per step.
- lobby-qa.html: LED title dots drawn from ImageBitmaps instead of a canvas (?ledbmp=0 = old): removes ~4000 canvas
  snapshots/s, no measurable CPU/GPU change. Kept (harmless).
- Auditorium artifact the owner remembered: in LIVE auditorium.html, when the house lights come up in the film, every
  chatter in the seats (and the seat/aisle lights) vanishes for one frame - an empty dark auditorium for 1/30 s
  (artscan: 59-80 blocks, luma 60 -> 1-9; all 3 live recordings at that moment). Cause: live hides the lit art at
  dim-done, so the first lights-up frame has to decode the whole lit room again and OBS shows a frame before it is
  ready. auditorium-qa.html keeps the lit art drawn under the dim art (8 Nov change): 4 QA recordings from 9 Nov show
  no blackout (worst 5 blocks: the usher's flashlight / phones). The 8 Nov 22:24 QA recording still had it (not checked
  whether that run predates the change). Camera-move "glitches" in all recordings are animated emotes at 2.5x, not rendering faults.
  Fixed on stream with the promotion.
- Lobby mode-2 loops after OBS hides the lobby (cut to the auditorium and back): cut-back freeze 283-300 ms (old way
  300-383 ms, cuttest.mjs with the pages swapped); hidden 90 s then shown (new hidetest.mjs + grabsrc.mjs: OBS's own
  render of the source): loops drawn 1 s after showing (popcorn popping, menus lit) - the GPU canvases survive.
- Auditorium lights changes (new lightcycle.mjs: 4 down/up cycles on one load, full house, 30): 0 late page frames in
  8 lights-downs and 8 lights-ups, worst 34 ms, litter on or off. A trace of a lights-up shows 172 small png decodes
  (56 ms on workers) and one 33 ms GPU task at the first fade step, but no page frame is late. The 1-2 frames of 67 ms
  in the full show are not from the lights change alone; not reproducible this way, left alone.
- Cut back to the lobby (cinema -> lobby, lobby hidden by OBS; new cutprof.mjs = CPU profile across the cut): ~300 ms
  freeze. First lobby frame 121 ms (116 ms waiting on the compositor commit inside rAF), WebGL rain drawArrays 80-165 ms
  in the first 2 s, ~350 ms raster and ~260 ms png decoding in the first 0.3 s. Tried: skip drawing while
  document.hidden (rain, mist, LEDs; simulation kept) - no change (drawArrays 155 vs 166 ms), reverted. With the extra
  rain off (?morerain=0, test only) the freeze is the same (283-317 vs 300-383 ms); the rain only adds small holds
  ~1.3 s later. The freeze is OBS re-rendering a page it hid; the page cannot keep it. Fix = warm the lobby off-canvas
  before the cut, like the panel's "Cut to cinema" (needs a lobby warm-up in obs-bridge.js: not touched, owner's call).

## 9 Nov 2026: L1 street marquee, blockout (Brief 79)
Owner: render the marquee in Blender at full quality, as its own layer over out10 (alpha + light + depth slice), not a
full pack re-render. Brief 79 (Codex) made the layout blockout: `marquee/blockout.png` (Workbench, production camera).
Canopy 4.6 m wide x 0.6 m projection x 1.0 m fascia, soffit 3.1 m, centered on the entrance (u 7.2-11.8, v 9.0-9.6),
two rear risers to the 2.05 m header. Sidewalk is only 1.5 m deep, so it projects less than the L1 mockup.
Stage-px corners in `marquee/marquee_geom.json`. Waiting for owner layout OK. Estimate for the full layer render on
the RTX 3050: 15-30 min at 4K.
- 9 Nov ~19:20: PROMOTED on the owner's OK ("promote whatever you did to prod"): promote-perf.mjs --apply,
  lobby-qa -> lobby, auditorium-qa -> auditorium, control-qa -> control (backups in backups/2026-11-09-perf/).
  Includes the 8-9 Nov fixes, the lobby loops (mode 2) and the LED bitmaps; the auditorium lights-up blackout fix goes
  live with it. The panel's new "Cut to lobby" button is hidden unless control.html?lobbycut=1: it needs
  obs-bridge-qa.js (lobby warm-up), which is not promoted yet. Hosted edition and zip not rebuilt (owner's call).
- Testing from now on at 60 (owner, 9 Nov: the stricter test), with a confirm at 30 in OBS before a promote.
- 9 Nov, owner: "deeper, and no gap between the entrance and the marquee". Blockout B (`marquee/blockout_b.png`,
  `build_marquee_b.py`, `marquee_geom_b.json`): projection 1.2 m (0.3 m short of the curb), soffit flush on the
  2.05 m entrance header, risers removed. Same width 4.6 m, fascia 1.0 m. Waiting for owner layout OK.
- 9 Nov, owner: "Layout OK" for blockout B. Brief 80 started (Codex): one styled final-quality draft
  `qa10/draft25-marquee.png` (dark canopy, red trim, backlit cream letterboards with page-style sample text,
  amber bulb rows, soffit downlights on the wet sidewalk). Codex weekly usage 50% at start.
- Cut back to the lobby with a warm-up (cuttest.mjs PREWARM=5, pages swapped): longest hold 50-83 ms vs 317-333 ms
  plain (3 trials each). New obs-bridge-qa.js (copy of obs-bridge.js + POST /warm-lobby and /cut-to-lobby; lobby
  source found inside the "Lobby" scene, nested scenes included) and control-qa.html "Cut to lobby" (auditorium page,
  shown with ?lobbycut=1). Functional test in the portable OBS with the owner's layout (new bridgetest.mjs, bridge on
  18791): warm puts "Browser" off-canvas into "DinkDonk Cinema" (source active), a second warm says already, the cut
  lands on "Lobby", the warm item is removed, a warm with the lobby on is skipped. First version picked the wrong
  source (any lobby URL) - fixed to search the Lobby scene. Not in the live bridge yet (owner's call).
- 9 Nov: draft 25 done (`qa10/draft25-marquee.png`, 86 s on the RTX 3050, `marquee/marquee_draft.blend`, NOTES-80).
  Read-only Codex critique in `critique-80.md`. Proposed for draft 26: stronger warm soffit pool on the wet sidewalk
  and threshold, brighter bulbs with small halos, faint letter tracks/seams in the board, wet sheen on the roof.
  Text style is page-side (the page draws it live). Waiting for owner.
- 9 Nov ~19:30, owner OK ("all three"): pushed to GitHub (d0490d6: the 8-9 Nov perf pass + queue 49-60 files that were
  live but uncommitted; then the panel/zip fixes below), hosted edition rebuilt + deployed (checked locally on 18772
  first: lobby 74 loops drawn, auditorium filling, no console errors; on the server lobby/control carry the new code,
  previous version kept in /opt/dinkdonk-cinema/previous), zip rebuilt (dist/DinkDonk-Cinema.zip, 775 MB; packaged
  server smoke-tested on 18773). Fixes on the way: "Cut to cinema" hidden in hosted rooms (?k=: no local bridge there);
  package/build.js takes the owner's renamed "Lobby" scene (ships as "Lobby + Poll setup"). Left out of the repo:
  obs-bridge-qa.js, backups/, other sessions' untracked briefs/notes, cloud lock files.
- 9 Nov: draft 26 done (`qa10/draft26-marquee.png`, 91 s, `marquee/marquee_draft26.blend`, NOTES-81). Critique
  (`critique-81.md`): warm sidewalk pool landed; bulb halos and roof wetness only partly; board tracks not visible
  at stream size. Waiting for owner (draft 27 with those three, or OK for the layer render).
- 9 Nov: draft 27 done (`qa10/draft27-marquee.png`, 96 s, `marquee/marquee_draft27.blend`, NOTES-82). Critique
  (`critique-82.md`): bulb halos landed; roof reflection visible but a bit too straight/clean; board tracks only on
  the end face. Waiting for owner.

## 9 Nov 2026: improvement drafts, round 2 (A6-A10, L6-L10)
- Owner asked for graphical improvements to both scenes, then "Yes, all ten" for mockups like the L1-A5 round.
  `concepts/improve2/index.html` (`?s=A6..L10` for one at 1920x1080), PNGs in `concepts/improve2/drafts/`.
  Nothing live changed, no renders, no edits to the pages. Left out on purpose: L2, L5, A4, A5 (not picked on 8 Nov)
  and the marquee (in progress).
- Auditorium: A6 house lights that read as "lights up", A7 chatters lit by the screen row by row, A8 the hall sits
  in a building (halo, plinth, entrance corridor with the waiting line, projector housing; art), A9 the pre-show
  lights the room, A10 curtain reveal at "Film".
  Lobby: L6 chatters take the scene's light (light pass under their feet), L7 wet reflections under chatters,
  L8 headlights catch the rain, L9 neighborhood life (steam, windows, neon buzz), L10 lightning in deluge weather.
- How: every base is a live screenshot with real chat (`shots/`, `shoot.mjs`: headless Edge, 1920x1080). A7, L6, L7
  and L8 are the real page with a throw-away look hack (`hacks/*.js`) run only inside the headless tab, shot as a
  before/after pair a moment apart; the rest is painted over the shot in SVG. The auditorium dark shots use
  `room=0` (a local copy of the hall), so the shared room's phase was never touched.
- Found on the way: in a shared room `director=0` does not keep the camera wide (the room's director still sends
  follows), so the capture presses the page's own W key until the camera is back at 1x. The lobby already dims
  street chatters a flat 16% (`.w.out .em`); L6 replaces that with light by position.
- A8 changed from what was first suggested: a projection booth behind the back wall would cover the rear-left
  seats, so the draft shows an entrance corridor and a small projector housing instead.
- Not done: no perf test of A7/L6/L7 (one filter or copy per chatter). `concepts/improve2/` is untracked like
  `concepts/improve/` (the shots show real chat lines). Waiting for the owner's picks.
- 9 Nov, owner's picks from round 2 (recorded as queue item 63, nothing started on his word): liked L6, L7, L8, L9;
  A7 okay; the A8 entrance corridor "if it looks right" (dim, purple like the cinema, dim lights, maybe posters).
  Not picked: A6, A9, A10, L10, and the rest of A8.
- 9 Nov, owner on draft 27: "It's good, go ahead." Brief 83 started (Codex, local RTX 3050, no cloud): full-quality
  marquee layer set staged in `out10m/` (depth-sliced body, receiver light, optional shadow, 48-phase bulb chase,
  `marquee.json` fragment with letterboard quads), check image `qa10/marquee-layer-check.png`. Next: wire it into
  lobby-qa.html (page draws the live letterboard text), then owner review before live.
- 9 Nov, owner: the scenes need "more life" (like L9); look for more, lobby outside and inside, the auditorium only
  what a real cinema has, DGG memes at most one year old. Suggestions only, nothing built: `roxy3d/memes/LIFE-IDEAS.md`
  (street L11-L19, inside L20-L29, auditorium A11-A18). Sources: DGG wiki API (81 pages created since 9 Nov 2025; the
  emote catalog of 9 Nov 2026) and two weeks of r/Destiny titles (all midterms/drama, not used). Waiting for picks.
- 9 Nov evening, auditorium perf (QA only, nothing live changed, weekly usage at 44% of the 45% cap):
  - Layers: the room is about 150 compositor layers: 84 tiny animated ones (48 dust motes, 36 `zz`) plus about 50
    "Overlap" layers forced by `#bg-dim { will-change: opacity }`. The Overlap layers HELP: with them merged into
    one big layer the GPU thread is pegged (about 920 ms/s, 40 frames/s) against about 560 ms/s at 60. Leave them.
  - Idle cost: the dozers' breath (`div.bod` transform, 20 writes a second on every dozing chatter, about 1,940
    writes/s with 96 dozing) redraws the seating 20 times a second. Hiding the walkers drops idle raster from about
    556 to 46 ms/s. Emote brightness filters are about 15% of it.
  - Tried and taken back out: breath in 8 steps, staggered by depth band (`BANDS`, `bandOf`). One uncontrolled
    comparison went both ways (idle lit better, idle dark worse), so `auditorium-qa.html` is back to the version
    before it; the try is kept as `qa-night/auditorium-qa.breath-try-9nov.html` for a controlled A/B.
  - Measurement noise: holding one pre-show slide (`{cmd:'screen', value:'upnext'}`) made three rounds agree within
    about 10%; lc60 and fadetrace now hold a slide by default (`SLIDE=auto` rotates them again).
  - Fade stutter at 60 fps, NOT settled: with one slide held the fades showed 0-5 late frames per 7 s step
    (20:41-20:47, clean GPU). The run meant to confirm that the slide rotation is the cause (12-104 late per step,
    20:49-20:53) ran while Brief 83's Cycles render held the GPU at 97-99%, so it proves nothing; both files from
    that window are marked SKEWED. Short Cycles drafts at about 19:17, 19:50 and 20:11 may also have touched the
    earlier lc60 runs. Rerun `SLIDE=auto BASE=1 node fadetrace.mjs <qa url> 2 60` against the held-slide runs on
    a free GPU before drawing anything from it.
  - New tools in `qa-night/tools/`: `layers.mjs` (layers by compositing reason, optional CSS to try),
    `layerpaint.mjs` (repaints per layer), `mutcount.mjs` (DOM writes per second by kind), `pageval.mjs`.
    `statecorr.mjs` also samples the active slide. `obslock.mjs` (loaded by every OBS driver) now warns when
    blender.exe is running or the GPU is above 90%, so a skewed run says so in its own result file.
  - Still in the QA copy: the test-only `DIMAB` param. Test server on 18771 and the portable OBS left running.
- 9 Nov 20:58, perf goal stopped at its cap (weekly usage 45%). Test server on 18771 stopped; 18770 untouched. The
  portable test OBS is still open (holding the old QA page). The fade rerun on a free GPU is not done: Brief 83's
  render was still running. To rerun: `STANDBY_PORT=18771 node standby-server.js`, then in `qa-night/tools`
  `SLIDE=auto BASE=1 node fadetrace.mjs "http://127.0.0.1:18771/auditorium-qa.html?everyone=1&bridge=0" 2 60` and the
  same with `SLIDE=upnext`, back to back.
- 9 Nov 21:25, auditorium perf, new goal from the owner (keep going until 60% weekly usage; 46% now). QA copy only,
  nothing live changed. Backup before this stretch: `qa-night/auditorium-qa.before-bandfade-9nov.html`.
  - New measure, `qa-night/tools/pres.mjs`: frames the compositor actually put out (`Display::DrawAndSwap` gaps,
    dropped `PipelineReporter` frames) from the same trace. rAF "late frames" can miss a stall: a fade step's raster
    burst holds back the drawn frame while rAF still fires on time. `fadetrace.mjs` prints it per step,
    `abstate.mjs` per variant. `fadetrace.mjs` also takes `SLIDES=upnext,auto` (slide mode alternates per rep) and
    `EVALS='a|b'` (a page expression alternates per rep); `abstate.mjs` takes `name=js:<expression>` variants.
    `fadetrace.mjs <url> 0 75` just loads and warms the page.
  - In `auditorium-qa.html` now, both with test switches so A and B run on one page load:
    1. Lights fade by depth band (`BANDS`, `bandOf`, `dimClock.text[]`): one strip of the room per frame instead of
       the whole room every 125 ms. `window.__dimBands = 1` = all at once as before. The `DIMAB` param is gone.
    2. Dozers' breath in 8 steps, band by band (`window.__breathSteps = 0` = smooth as before).
  - Counts taken while Cycles renders ran (timings void, counts fair): banded fade rasters about 20% more tiles per
    fade (a tile can hold two strips); stepped breath halves idle tiles/s (1,141 to 573 with a few dozers).
  - Test pages need dozers to be realistic: add `&doze=20` (chatters doze after 16-32 s without a message); a page
    warmed for 60 s otherwise has none, and the breath is what redraws the room 20 times a second on stream.
  - Still open: free-GPU runs of (a) `SLIDES=upnext,auto` held vs rotating slides, (b) banded vs grouped fade,
    (c) stepped vs smooth breath; then OBS at 30. Under a saturated GPU the banded fade looked worse in one rep
    (every frame carries raster), so it must prove itself on a free GPU, and also with OBS encoding.
- 9 Nov, owner: read a full year of r/Destiny (top posts with top comments, and top controversial), drama welcome.
  Done from the Arctic Shift archive (reddit.com blocked): 61,988 posts, 952 read closely with comments by six
  readers, findings checked against the year's titles. Ideas L30-L49 and A19-A21 appended to
  `roxy3d/memes/LIFE-IDEAS.md` with what was left out and why. Suggestions only, nothing built.
- 9 Nov, owner's picks from the Reddit-year ideas, recorded as queue item 65 (nothing started): L30, L31, L32, L38, L39, L40, L44, L46, L47, plus two of his own: L50 golden WEOW with a glowing aura, L51 a "Dogtober 7th" documentary poster.
- 9 Nov: Brief 83 done: `out10m/` (713 files, 15 MB; 24 body + 133 shadow + 135 light slices, 60 chase loops,
  `marquee.json`), 38 min of local GPU, all checks in validation.json passed, out10/ untouched. Wired into
  lobby-qa.html only (backup `backups/2026-11-09-marquee/lobby-qa.html`): `mergeMarquee` adds the slices to the
  occluder stack (plus-lighter for light slices) and the chase to the prop loops; `?marquee=0` turns it off. The page
  writes the street board text from screen 1's film (NOW SHOWING / NEXT UP · title, SCREEN 1 · rating / CHAT'S
  PICK), in 19 depth-band copies so walkers in front cover it correctly, shrunk to fit long titles. The board is a
  soft no-bubble area. Checked with real chat (everyone=1): 292 layers load, none broken, text fits, walkers pass
  under it. Not done: rain impacts under the roof, perf check of the extra 292 imgs + 60 loops, live/hosted/zip.
- 9 Nov ~22:10, perf (goal renewed: until 60% weekly), free-GPU results for the two QA changes (`auditorium-qa.html`,
  nothing promoted):
  - **Banded fade: disproved.** `qa-night/tools/res/fade_bands_free_9nov.txt` (136 chatters, synced 60, two fades
    each way, alternating on one page load): held frames (gaps > 1 vsync between `Display::DrawAndSwap`) 74 strip by
    strip vs 42 whole room at once; GPU raster per 7.5 s step 4.4-5.7 s vs 2.9-4.6 s; tiles 8.8-11.3k vs 5.8-8.4k.
    "Still + lights down" was worse both times (22, 22 vs 4, 12). The whole room at once every 125 ms is the default
    again (`tickBands`: `group = window.__dimBands === 0 ? 1 : BANDS`); `window.__dimBands = 0` = strip by strip, for
    tests only. The fade's first frame still takes the whole room (no frame at the end values, `flashcheck.mjs`).
  - **Stepped breath: confirmed.** `res/breath_ab_free_9nov.txt`, `res/breath_ab_dark_free_9nov.txt` (137 chatters,
    `&doze=20`, 4 rounds x 5 s): GPU raster 372 -> 218-244 ms/s lit, 649 -> 384-440 ms/s dark (-35 to -41%), tiles/s
    about half (1,205 -> 620 lit), page main thread 323 -> 300 ms/s. 60 drawn frames/s and no held frames at idle
    either way, so this is headroom (stream encoder, fades), not a visible fix by itself. With the fade grouped again
    the breath steps for the whole room on the 8 Hz clock. `window.__breathSteps = 0` = smooth as before.
  - Baselines on a free GPU: idle lit, idle dark and a follow with the lights steady all show 0-1 held frames in
    7.5 s at 60. What is left is the fade itself: 0-25 held frames per fade, very different from one fade to the next.
  - Tools: `fadetrace.mjs` takes `REC=1` (the portable OBS records with NVENC while the steps run; the recording is
    deleted) and `KEEP=n` (a step's trace with n or more held frames is kept as `res/trace_keep_<k>.json`);
    `gapwhy.mjs <trace>` lists what was running on each thread while no frame came out. `flashcheck.mjs` checks the
    first frames of a fade.
  - Ideas written down, not built: "mirror world" (cross-fade one composited copy of the room in the target state,
    no raster during a fade) and "compositor camera" (static-target camera moves as a Web Animations transform on
    `#cam`, so the compositor keeps moving while a fade's raster is pending).
  - The owner's PC: `python` now resolves to the installed Python 3.15 (the Windows Store stub sat first in PATH).
- 9 Nov ~22:30, perf: QA copy vs LIVE page, same test, same minute, free GPU, the portable OBS recording with NVENC
  (`REC=1`, stream-like load), 136-138 chatters, `&doze=20`. Held frames = gaps > 1 vsync between drawn frames,
  per 7.5 s step (still+down / follow+up / follow+down / still+up), two reps:
  - 60 fps: LIVE `auditorium.html` 15 / 22 / 9 / 6 and 13 / 1 / 2 / 4 (72 in 8 fades; GPU raster 4.9-5.5 s a step,
    11-12.8k tiles). QA `auditorium-qa.html` 3 / 0 / 0 / 0 and 2 / 1 / 0 / 0 (6 in 8 fades; raster 3.0-4.1 s,
    6.3-9.3k tiles). Without recording the QA copy had 2 held frames in 12 fades. Idle and follow-only: 0 on both.
    (`res/fade_live_rec_9nov.txt`, `res/fade_grouped_rec_9nov.txt`, `res/fade_grouped_keep_9nov.txt`)
  - 30 fps (the owner's OBS setting): 0 held frames on both; QA rasters about 25% less (2.7-3.3 s vs 3.7-4.2 s).
    (`res/fade_qa_rec30_9nov.txt`, `res/fade_live_rec30_9nov.txt`)
  - Why (`gapwhy.mjs` on a live trace): in every held frame the GPU process's main thread was inside a 12-14 ms
    raster flush; the page's main thread was not the limit. On the live page the dozers' smooth breath redraws
    seating strips in the frames between the fade's 8 updates a second, so raster lands in almost every frame; in
    the QA copy the breath steps on the fade's clock, so both redraw in the same frame.
  - Look: `flashcheck.mjs` clean both ways (a fade starts from the room's values, whole room every 125 ms);
    mid-fade screenshots QA vs live match (`qa-night/tools/shots/midfade-sheet-9nov.jpg`).
  - So the QA copy's change (breath in 8 steps on the fade clock, fade whole-room as before) is a promote candidate
    for the "camera moves during light changes" stutter at 60. Not promoted: waits for the owner's OK.
- 9 Nov, late evening, perf (auditorium QA copy unless said; all at 60 fps in the portable OBS, free GPU, mostly with
  NVENC recording; nothing promoted):
  - How a frame gets held: raster and the display compositor share the GPU process's main thread. A commit is shown
    only when its tiles are rastered, and a long raster flush (`CommandBufferStub::OnAsyncFlush`) delays the draw.
    `flushwhat.mjs <trace> [minGap]` splits each held frame into what that thread did and prints a 250 ms timeline.
  - Tried and dropped: a camera run by the compositor / predicted ahead (`res/camahead_ab_9nov.txt`): no gain, since
    the hold is the raster and not the page's main thread. The banded (strip by strip) fade is off again
    (`window.__dimBands = 0` is the test switch); the whole-room fade every 125 ms stays.
  - Live lobby under camera moves: fine, 2 held frames in 8 steps with recording (`res/lobby_cam_live_9nov.txt`,
    `camtrace.mjs`). Pre-show slide rotation: no effect on held frames (`res/slides_ab_rec_9nov.txt`).
  - First lights-down after a page load: Chrome never decodes the dim background while it rests at opacity 0, so it
    decoded at the fade's start (52-59 ms on a worker + 10 ms upload, every first lights-down). The dim background
    now rests at `DIM_WARM` (0.005, invisible) like the pieces' twins: no decode at the fade on 6 of 6 fresh loads.
    Held frames on that fade: within the spread (warm 4, 5, 1, 1, 2, 3; cold 8, 0). `window.__bgWarm = 0` = old
    behavior (test only). `fadetrace.mjs` got `bigdec` (decodes over 15 ms) and `DOWNONLY=<s>`.
    (`res/bgwarm_ab_9nov.txt`, `res/bgwarm_firstdown_9nov.txt`)
  - Layers (`layers.mjs`, `rasterwho.mjs`, new `layerchurn.mjs`): the room is 100-180 compositor layers, most of
    them small "Overlap" layers (pieces, emotes) above `#bg-dim`'s own layer. They are needed: with `#bg-dim` not
    its own layer the room becomes one big layer and every step holds ~200 frames (about 30 fps), raster 6.2-6.7 s
    per 7.5 s against 2.5-3.8 s (`res/bgdim_layer_ab_9nov.txt`). So `#bg-dim { will-change: opacity }` stays.
    Layer churn is small next to the fade's own raster (idle 2-4 layers a second; fade + follow ~20 new and ~120
    resized a second).
  - The longest hold of a lights-down sat at the same place in two kept traces (58 and 69 ms, about 4 s into the
    fade) together with a burst of new layers. Looked for a cause there: no CSS transition or animation starts or
    ends during a fade, no page change is timed there (per 125 ms step the fade writes ~500 twin opacities, 140
    litter filters, 135 emote filters, 117 item filters, 57 lamp parts, the same all 6 s), and layer sets change by
    5-15 layers all the time as chatters walk (pieces are shown where a chatter is behind them). A door opening
    adds about 40 layers at once and drops them a second later. No single trigger found; not reproducible on
    demand.
  - Rainbow names (`.rbt`, a `background-position` animation that repaints every frame): the 4 rainbow names in the
    pre-show credits roll repaint the whole 832x8146 credits layer each frame while they are in its drawn range,
    even when that slide is hidden. Paused vs running on one page load (`res/rbt_ab_9nov.txt`): paint 230 vs 320 ms
    per 7.5 s, ~10% fewer tiles, GPU raster and held frames the same. Too small to change an approved look for.
    New tool `paintwho.mjs [urlPart] [seconds]` (GROUP=1): which layers repaint, how often, how much area.
    Repainted area: idle lit 1.4 MP/s, lights-down 24 MP/s (pieces 17, emotes 2.6, lamps 2.6), idle dark 6 MP/s.

### 10 Nov 2026 (night) - what the fade's brightness filters cost, and three replacements that did not work (Claude, perf goal)

All at 60 synced in the portable OBS, REC on, real chat, blender 0, QA page only. `auditorium-qa.html` is back to
the promote candidate from 9 Nov (stepped breath on the fade clock, warm dim background); nothing new went in.

  - Cost of the filters: about 390 elements carry `filter: brightness()` during a fade (emotes, popcorn/soda,
    litter). With all of them off (test style, wrong look) a fade costs 25% less GPU raster and holds 6 frames
    instead of 24 in 12 steps (`res/nofilter_ab_9nov.txt`). Split (`res/filtersplit_ab_10nov.txt`): emotes about
    14% of the raster, items + litter about 14%.
  - New test switch `&littermin=40`: a full, deterministic litter set (140 pieces) so runs compare.
  - Tried for items + litter, each with the same look as the goal, all dropped:
    1. Lit + dark copy crossfaded by opacity: not the same look (see-through pixels: soft edges, litter shadows;
       a snap when the fade ends). Copy: `qa-night/auditorium-qa.twins-try-10nov.html`.
    2. All 65 fade levels in one sheet, shown through `object-view-box`: Chrome snaps the sheet to pixels, the art
       shifts by part of a pixel from level to level. Copy: `qa-night/auditorium-qa.strips-try-10nov.html`.
    3. Dim frames: every picture baked at 65 levels as its own PNG, `src` swapped per fade step. Look exact (still
       bench in `striplook.mjs`: largest pixel difference 2-3 of 255 at every level). But slower than the filters
       (`res/dimframes_ab_10nov.txt`, A B A B, 16 steps each): GPU raster 4684 vs 4186 ms per step (+12%), image
       decodes 1919 vs 806, late frames 7.3 vs 1.6 per step, gaps over one vsync 128 vs 36 (worst with the camera
       following: 51 vs 3 on lights-up). Every swap is a new image for the compositor (decode + upload), and its
       image cache does not hold 65 x ~78 pictures, so it never warms up. Copy:
       `qa-night/auditorium-qa.frames-try-10nov.html`. The same idea for emotes (background-image swap) was drafted
       but not applied: same cost.
  - Rule from this: a replacement for the filters must not create or swap pictures per fade step.
  - `striplook.mjs` now has a still bench (fixed overlay, three sub-pixel offsets per picture, noise floor 0) for
    exact look comparisons; the live room is too noisy for that (walkers move between shots).

### 10 Nov 2026 (night, later) - the room at rest: baked rest pictures for litter and items (Claude, perf goal)

All at 60 synced in the portable OBS, REC on, real chat, blender 0, QA page only (`auditorium-qa.html`; the live
page is untouched). Backup of the 9 Nov promote candidate without this change:
`qa-night/auditorium-qa.before-twins-10nov.html`.

  - New in `fadetrace.mjs`: `REST=1` measures the room at rest instead of fades (7 s each: idle, camera follows in,
    camera back to wide; lit room, then dark room). `REST=dark` does the dark room only (lights go down once before
    the first rep), for runs with a test style per rep (`EVALS`).
  - Rest baseline, 9 Nov candidate (`res/rest_base_10nov.txt`): no held frames at rest, but the dark room costs
    about twice the GPU raster of the lit one (idle 1663 vs 725 ms per 7 s, follow in 2780 vs 1533, wide out 1372
    vs 667). In the dark every emote, item and litter piece carries a `brightness()` filter (~390), in the lit room
    the 140 litter pieces do; each filter is an offscreen pass whenever that tile is drawn again.
  - Rest bake (in the QA page, on by default; `?restbake=0` = the filters as before, test only):
    - litter has its lit look baked into its bitmap, so no filter in the lit room; during a fade a baked piece gets
      the filter that is left between that picture and the dark look (dark / lit, exact because brightness and
      saturate multiply);
    - when a lights-down has ended, items and litter switch once to pictures with the dark look baked in (class
      `.dk`) and drop the filter; the first update of the next fade switches them back to the lit picture plus the
      fade's filter in the same frame;
    - one switch per fade end, never per fade step (the rule from the dim-frames try); all pictures stay loaded
      (`picKeep`), so a switch of `src` is immediate; emotes keep their filter (animated sprites).
  - Look check: new tool `restlook.mjs <url> <outDir> [waitSecs]` (still bench as in `striplook.mjs`: every litter
    design and item picture, three sub-pixel places, old CSS filter vs what the page shows now, at lit, mid fade
    and dark). Largest pixel difference 3 of 255 or less in every state; the room counts show 0 filters on litter
    and items at rest, lit and dark.
  - Result at rest (`res/restbake_rest_ab_10nov.txt`, A B A B, 2 reps each). Totals are noisy because real chat
    decides how many tiles are drawn again (2,500 to 6,600 per 7 s), so compare GPU raster per redrawn tile, rest
    bake vs old filters: dark idle 0.47 vs 0.52 ms, dark follow in 0.55 vs 0.62, dark wide out 0.40 vs 0.51; lit
    idle 0.32 vs 0.38, lit follow in 0.36 vs 0.46, lit wide out 0.29 vs 0.31. About 10-20% less GPU raster at rest.
    Held frames: none either way (late 0-2 of 420).
  - What is left in the dark room (`res/darkcost_10nov.txt`, `REST=dark`, one page load, a test style per rep): the
    emote filters are about 10% of the dark rest raster and the aisle lamps (box-shadow glows) about 10%, both
    inside the run-to-run noise. With both off the dark room costs the same per tile as the lit one (0.34 ms).
    Not changed: a dark picture per emote was drafted (not applied) but would have to decode some sixty strips on
    the first frame of lights-up, for a 10% gain at rest where no frames are held anyway.
  - Rest bake on fades (`res/restbake_fade_ab_10nov.txt`, A B A B): no regression. GPU raster per tile 0.602 ms
    (rest bake) vs 0.722 (old filters); gaps over 1 vsync 24 vs 43, over 2 vsyncs 7 vs 4, worst 66 vs 51 ms.
    Still open: lights-up after a long dark rest (over 60 s), and the confirmation at 30 in OBS.

### 10 Nov 2026 (night, last) - the first lights-down after a quiet spell: what holds its frames (Claude, perf goal)

Same setup (60 synced, portable OBS, REC on, real chat, blender 0, QA page only).

  - New tool `gapnames.mjs <trace> [minGapMs] [padMs]`: every trace slice (any thread) that overlaps a held frame,
    with count and ms, plus a 0.5 s timeline of the slices matching `GREP` (decodes, uploads, shader work).
    `fadetrace.mjs` got `KEEP=n` (keeps a step's trace with n or more held frames; `KEEP=0` keeps all) and
    `DOWNONLY=<s>` (one lights-down per rep, then s seconds lit).
  - Finding 1, the fade's first frame: the first lights-down after a page load (or a quiet spell) held 2-3 frames
    right at the start (52 + 48 ms), the second one of the same load did not. In the trace 164 room pieces and
    twins that were already shown get decoded again: Chrome drops a decoded picture about 30 s after its last
    use, and a shown piece is only used when its tile is drawn again. The fade's first frame draws the whole room.
  - Finding 2, 4 s into every lights-down: the usher. He appears at the rear portal 4 s after the lights go down,
    inside the tunnel, and his box plus the door's turn on 82 pieces in one frame (shown pieces 484 -> 566), so
    that frame decodes and uploads some 180 pictures in the middle of the fade (46-54 ms held, every time).
  - Try 1, keep-warm (`?keepwarm=0` = off): every shown piece and twin is asked for with `img.decode()` once per
    12 s. Decodes at the fade's start 164 -> 61 (54 -> 15 ms of worker time), but the held frames stay (52 and
    48 ms): the second one is a 50 ms flush on the GPU process's main thread (raster of the whole room plus ~230
    texture uploads), which `decode()` does not keep warm.
  - Fix for finding 2, the entry ramp (in the QA page, on by default; `?entryramp=0` = off, test only): the pieces
    in front of the door and of the tunnel's far end (`entryAhead`, a fixed set worked out once) come up a few at
    a time from 0.5 to 3.0 s after the lights go down, on the frames the fade draws the room anyway, so the usher
    finds them shown. A piece coming up changes nothing on screen (the background holds the same pixels).
    Result on fresh page loads, first lights-down each (`res/entryramp_ab_10nov.txt`, A B A B A B, plus one run
    before): with the ramp no held frame at 4.5 s in 4 of 4 loads (decodes there 26-52, spread over 1-3.5 s
    instead); without it a 51-64 ms gap at 4.5 s in 3 of 3 (81-178 decodes, 189 uploads, 65 ms on the GPU
    process's main thread). The gap at the fade's start (50-64 ms) is in all of them, ramp or not: finding 1.
  - Where finding 1's time goes: one run had only 17 decodes at the start but 179 uploads and still a 53 ms gap,
    all of it on the GPU process's main thread. So the cost is the 180-320 texture uploads of the first whole-room
    frame, not the PNG decoding.
  - Try 2 for finding 1, the touch keep-warm (in the QA page, on by default; `?keepwarm=0` = off, test only; it
    replaces try 1): a shown piece whose place has not been drawn for 10 s gets its dark twin's opacity moved by
    0.0002 (invisible), up to 6 pieces per 250 ms, only at rest. That draws its place again with every piece that
    overlaps it, so both the decoded pictures and their textures stay in Chrome's caches. `window.__warm` counts
    (touched, longest time a shown piece went undrawn: 13.5 s).
    Result on fresh page loads, first lights-down each, at the final rate (`res/touchwarm2_ab_10nov.txt`,
    A B A B A B A B): worst gap with keep-warm 26, 37, 41, 30 ms, never two held frames in a row; without it
    63 + 44, 40 + 41, 35 and 18 ms. Decodes in the fade's first half second 13-65 vs 152-179. With the earlier
    runs at the slower rate (`res/touchwarm_ab_10nov.txt`) a gap of 40 ms or more at the start in 3 of 8 loads
    with keep-warm (single ones, 41-55 ms) vs 5 of 7 without (four of them double, up to 63 ms).
    What is left in the remaining single gap is the page's own work for the first whole-room frame (main thread
    24-30 ms over the gap: style for the lights-down class, lifecycle, paint; then ~46 raster tasks), not the
    GPU process any more (3.6 ms there vs ~55 ms before).
    Cost at rest (`res/touchwarm_rest_ab_10nov.txt`, `REST=1`, A B A B, 24 steps each, at the 10 s age): GPU
    raster per 7 s step 1580 ms with keep-warm vs 1386 without (+14%, inside what chat alone moves it; idle lit
    720 vs 682, idle dark 1618 vs 1756), tiles 3757 vs 3541. Held frames: late 0 either way; one 60 ms gap in
    one "wide out (lit)" step with keep-warm, not seen again. To halve that cost the age went from 10 to 18 s
    (`WARM_AGE = 18000`; Chrome drops a picture after about 30 s).
    At the 18 s age (`res/touchwarm3_ab_10nov.txt`, 60 synced, A B A B A B): worst gap with keep-warm 32, 34 and
    41 ms; without it 71 + 56, 68 + 48 and 58 ms; decodes at the start 53-68 vs 114-250.
    At 30 in OBS (`res/touchwarm3_ab30_10nov.txt`, `FPS=30`, entry ramp and keep-warm together): with both, no
    held frame in 3 of 3 loads (worst 35-37 ms = one frame); without keep-warm one load of three held two frames
    (70 + 63 ms). Keep-warm stays.
  - State of `auditorium-qa.html` after this night: 9 Nov candidate + rest bake + entry ramp + touch keep-warm
    (`WARM_AGE = 18000`, `WARM_TICK = 6`). Backups in `qa-night/`: `auditorium-qa.before-twins-10nov.html` (9 Nov
    candidate), `.before-keepwarm-10nov.html` (rest bake only), `.before-entryramp-10nov.html` (rest bake +
    try 1). The live `auditorium.html` is unchanged. Not promoted: waits for the owner's OK.
  - Still open: the same 82-piece burst when an ordinary newcomer opens the door after a quiet spell in the dark
    (the ramp only runs ahead of the usher); lights-up after a dark rest of over a minute (rest bake and keep-warm
    both untested there; needs a wait mode in `fadetrace.mjs`).

### 10 Nov 2026 (early morning) - lights-up after a long dark rest, and the keep-warm's turn order (Claude, perf goal)

Same setup (60 synced, portable OBS, REC on, real chat, blender 0, QA page only; the live page is untouched).

  - New in `fadetrace.mjs`: `UPAFTER=<s>` does one lights-up per rep after s seconds in the dark (the case left
    open above).
  - Lights-up after 75 s in the dark, fresh page load each (`res/upafter_abc_10nov.txt`; A = QA page as is,
    B = `restbake=0`, C = `keepwarm=0`): worst gaps A 43 and 53 + 47 ms, B 46 and 45 + 51, C 50 and 32. So one or
    two held frames at the fade's first frame in most loads, in every variant, with 112-235 decodes there.
    The rest bake is not the cause (same without it), and the keep-warm did not help in the dark.
  - Why the keep-warm did not help there: a fade draws every piece at the same moment, so afterwards all ~500
    shown pieces came due together 18 s later and went through at 6 per 250 ms; the last ones waited about 30 s
    (`window.__warm.stale` 31.4 s), which is when Chrome drops a decoded picture.
  - Change (QA page): when a fade has ended, the pieces' next turns are spread over 6-18 s from then, and the rate
    is 8 per 250 ms (`WARM_TICK = 8`). Backup of the state before: `qa-night/auditorium-qa.before-warmspread-10nov.html`
    (rest bake + entry ramp + keep-warm at `WARM_AGE = 18000`, `WARM_TICK = 6`).
  - Result, first lights-down on fresh page loads (`res/warmspread_first_ab_10nov.txt`, A B A B A B, B =
    `keepwarm=0`): with keep-warm worst gap 30, 20 and 29 ms, no held frame in 3 of 3 (decodes at the start
    32-49); without it 72 + 49, 66 + 54 and 65 + 49 ms (192 decodes). Better than before the change (32, 34, 41).
  - Result, lights-up after 75 s in the dark (`res/warmspread_up_ac_10nov.txt`, A C A C A C, C = `keepwarm=0`):
    with keep-warm worst gap 33, 36 and 28 ms, no held frame in 3 of 3 (before the change: 43, 53 + 47, 31);
    without it 33, 28 and 79 + 44 ms. Decodes at the start 73-132 vs 179-264. Longest time a shown piece went
    undrawn: 18.3 s in every load (was 31.4 s).
  - Second lights-down 25 s after the first on the same load (`res/warmspread_ab_10nov.txt`, two pairs, and
    `res/warmspread_10nov.txt`): mixed, 18-68 ms with keep-warm vs 24-51 without; the 68 ms one had 287 decodes
    and twice the chat traffic of the others (1179 PNG decodes in the step), so new arrivals rather than the
    resting room. Not followed up.
  - State of `auditorium-qa.html` now: 9 Nov candidate + rest bake + entry ramp + touch keep-warm with the spread
    (`WARM_AGE = 18000`, `WARM_TICK = 8`). Not promoted: waits for the owner's OK. Not yet confirmed at 30 in OBS
    with the spread (the 18 s keep-warm before it was).
  - Still open: the door burst (about 82 pieces in one frame) when an ordinary newcomer comes in after a quiet
    spell in the dark; the single 41-55 ms gap some loads still show at a fade's first frame from the page's own
    style and paint work.
  - At 30 in OBS with the spread (`res/warmspread_first_ab30_10nov.txt`, `res/warmspread_up_ac30_10nov.txt`,
    `FPS=30`): first lights-down with keep-warm no held frame in 3 of 3 loads (worst 35-37 ms = one frame);
    without it two of three loads held two frames (48 + 41, 59 + 52 ms). Lights-up after 75 s in the dark: no
    held frame either way (2 loads each). So the QA page as it stands is confirmed at 60 and at 30.

### 10 Nov 2026 (morning) - a newcomer's door after a quiet spell in the dark (Claude, perf goal)

Same setup (60 synced, portable OBS, REC on, real chat, blender 0, QA page only; the live page is untouched).

  - New in `fadetrace.mjs`: `DOORAFTER=<s>` does one door swing per rep after s seconds in the dark, through a
    test-only hook in the QA page (`window.__doorTest()`: the door swings with nobody behind it; `window.__doorLast`
    = when the door was last used). No fake chatters involved.
  - Measured (`res/doorafter_10nov.txt`, three fresh loads, door unused for 41 s): worst gap 46, 38 and 65 ms, with
    150-170 decodes in that frame and 55-74 ms on the GPU process's main thread. The door turns on the pieces in
    front of it in one frame, and those were not shown, so not kept warm.
  - Change (QA page, on by default; `?entrykeep=0` = off, test only): the way-in pieces (the entry ramp's set, about
    82) stay shown for as long as the room is dark, so the keep-warm covers them. They drop when lights-up starts.
    Backup of the state before: `qa-night/auditorium-qa.before-entrykeep-10nov.html` (and `.before-doortest-10nov.html`
    without the test hook).
  - Result (`res/entrykeep_door_ab_10nov.txt`, A B A B A B, B = `entrykeep=0`): with it worst gap 35, 25 and 18 ms,
    no held frame in 3 of 3 (decodes in that frame 26-105); without it 40, 40 + 64 and 43 + 55 ms (168-190).
  - Lights-up after 75 s in the dark with it (`res/entrykeep_up_ab_10nov.txt`, A C A C, C = `entrykeep=0`): 45 and
    22 ms vs 33 and 32 ms. The 45 ms load had twice the chat traffic (863 PNG decodes in the step vs 283-370), so
    not settled on two loads; more loads below.
  - Three more lights-up pairs (`res/entrykeep_up_ab2_10nov.txt`): with it 19, 45 and 36 ms, without 40, 45 and
    25 ms. Over all five pairs a single gap of 40 ms or more in 2 of 5 loads either way, never two frames in a
    row: no regression, the change stays. That single gap is the one already listed as open (the page's own
    style and paint work for the fade's first frame).
  - State of `auditorium-qa.html` now: 9 Nov candidate + rest bake + entry ramp + touch keep-warm with the spread
    (`WARM_AGE = 18000`, `WARM_TICK = 8`) + way in kept shown in the dark. Test-only parts: `?restbake=0`,
    `?entryramp=0`, `?keepwarm=0`, `?entrykeep=0`, `window.__warm`, `window.__doorTest`, `window.__doorLast`.
    Not promoted: waits for the owner's OK. The way-in change is not yet confirmed at 30 in OBS.
  - Way-in change confirmed at 30 in OBS (`res/entrykeep_door_ab30_10nov.txt`, door swing after 41 s unused in
    the dark, A B A B): with it worst gap 35 and 35 ms (one frame, no held frame in 2 of 2); without it 38 ms and
    49 + 64 ms (two held frames in 1 of 2).

### 10 Nov 2026 (morning, later) - what still decodes at a fade's first frame (Claude, perf goal)

- Open item from above: on some loads the lights-up after 75 s in the dark still holds one or two frames at the
  fade's first frame. The earlier reading ("the page's own style and paint work") was wrong: the held frames are
  full of room-piece decodes.
  - `res/upgap_names_10nov.txt` (4 loads, page as is): worst gaps 51 + 38, 36, 33 and 42 ms. Inside the held
    frames: 113 and 50 `Decode Image` slices (about 25 ms, up to 9-11 ms each).
  - New test read-out `window.__pieceState()` (per piece: lit file, dim file, shown, twin shown, ms since drawn,
    part of the way in), `fadetrace.mjs` `SNAP=<file>` (writes it just before the lights-up in `UPAFTER` mode).
    Matching the decoded sizes to the snapshot (`res/upwho_10nov.txt`, 3 loads; gaps 27, 50 + 42, 45 + 48 ms):
    40, 54 and 76 room pieces decoded at 0.4-0.7 s, nearly all of them pieces that were shown and that the
    keep-warm had marked as drawn 0.5-15 s earlier (median about 4 s). So "everything that overlaps the touched
    piece is drawn with it" does not hold for every piece.
  - Test variant where a touch counts for the touched piece alone (`?warmself=1&warmtick=12&warmage=12000`;
    `res/warmself_up_ab_10nov.txt`, A B A B A B): page as is 51 + 49, 70 + 44 and 42 ms with 88, 105 and 65 pieces
    decoded; variant 48 + 57 ms (101 pieces decoded although each had its own touch 8-11 s before), 33 ms (32)
    and 29 ms (9). Better in 2 of 3 loads, not settled; it costs about ten times more touches at rest (about
    4,900 vs 490 per load) and its raster cost at rest is not measured. Not made the default.
  - Likely cause of the rest (not tested yet): Chrome's GPU picture cache holds at most 2,000 entries, one per
    picture frame, least recently used out first (`cc/tiles/gpu_image_decode_cache.cc`,
    `kNormalMaxItemsInCacheForGpu`). Count on the test page with the lights up and 135 chatters: 1,054 pictures
    on show with 2,340 frames: room pieces 961 (about 1,170 in the dark), emotes 1,357 frames in 71 files (one
    GIF alone has 760 frames, others 178, 128, 112), litter 19. That is over the limit, so animated emotes can
    push still-needed room pieces out however often the pieces are touched.
- Next steps (not started): confirm it with a run without the big animated emotes (or with emote animation
  held); if confirmed, look for a way to keep the long GIFs out of that cache or to cap their frames in the
  dark, without changing the approved looks.
- `auditorium-qa.html` now also has, test only: `?warmage=<ms>`, `?warmtick=<n>`, `?warmself=1`,
  `window.__pieceState`. Defaults unchanged. Backup before these: `qa-night/auditorium-qa.before-piecestate-10nov.html`.
- Weekly usage reached 60%: the goal's stopping point. The QA auditorium waits for the owner's OK to promote.
- Tools kept in `qa-night/tools/`: `decwho.mjs` (which room pieces a trace decoded, against a `SNAP` file),
  `countpics.js` + `countframes.mjs` (pictures on show and their animation frames: `node pageval.mjs "$(cat countpics.js)" > pics.json`,
  then `node countframes.mjs pics.json`).

### 10 Nov 2026 (08:00) - QA auditorium promoted to live (Claude, on the owner's OK)

- Owner: "Yes promote". `auditorium.html` is now the QA auditorium: stepped breath on the fade clock, warm dim
  background, rest bake, entry ramp, touch keep-warm with the spread, way in kept shown in the dark.
  - Backup of the live page before it (9 Nov 19:02 version): `qa-night/auditorium.live-before-promote-10nov.html`.
  - Taken out for live: the read-outs `window.__warm`, `window.__doorLast`, `window.__doorTest`,
    `window.__pieceState` and the tuning switches `?warmage`, `?warmtick`, `?warmself`. Kept as off-switches:
    `?restbake=0`, `?entryramp=0`, `?keepwarm=0`, `?entrykeep=0` (and `window.__breathSteps`, `__bgWarm`,
    `__dimBands`). `auditorium-qa.html` keeps all test parts.
  - Checked before and after at 60 with NVENC recording, 135 chatters, one fade round each: stripped copy
    (`res/promote_check_10nov.txt`) worst gap 33 ms; the new live file through the test server
    (`res/promote_live_10nov.txt`) worst gaps 33, 41, 28 and 37 ms; no gap over two frames, no script errors.
  - Not done (owner's call): repo push, hosted web edition, zip. The live OBS source needs a refresh to load it.
  - Still open: the first-frame gap on some loads after a long dark spell (section above).

### 10 Nov 2026 (08:30) - pushed, hosted web edition deployed, zip rebuilt (Claude, on the owner's "All three")

- Repo: commit `153f3bd` "Auditorium perf pass (9-10 Nov 2026), now live" on `main` (auditorium.html,
  auditorium-qa.html, this log). Left out on purpose: `lobby-qa.html` and `QUEUE-owner.md` (the design-drafts
  session's work in progress).
- Hosted web edition: `web/build.js`, then the build checked locally on 18772 with a test room and real chat (room
  filled, lights down and up from the control page, no page errors), then `web/deploy/deploy.sh`. Service active,
  `healthz` ok, 6 rooms loaded; `auditorium.html` and `lobby.html` on the server have the same SHA-256 as the local
  build (the auditorium also the same as the live file). The version before is in `/opt/dinkdonk-cinema/previous`.
- Zip: `package/build.js` -> `dist/DinkDonk-Cinema.zip` (775 MB). Packaged server started on 18773: auditorium,
  lobby and control answer, the auditorium loads with real chat and no page errors; its `auditorium.html` is the live
  file byte for byte.
- Lobby unchanged in all three (the L1 marquee is not in yet; the design-drafts session held its `lobby.html` edit
  until these builds were done).
