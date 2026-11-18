# Brief 104e - Gamer lobby: production bundle + local smoke (stage 3 prep, NO cloud)

17 Nov 2026. Render agent: Claude Fable 5.2, high effort. Owner approved draft 37 (`qa10/draft37-gamer-lobby.png`,
`lobby104/lobby_draft37.blend`) for the full render: "alrighty go ahead". The gamer lobby is a SECOND lobby option
beside the normal one (queue 90): the normal lobby (`out10s` + `out10ps`, `out10m`, `out10l`, `out10mist`) stays
byte-identical and is not re-rendered; the fountain and all Brief 104 content exist only in the new pack.

**This brief builds and tests the production job locally. It does NOT start any cloud pod.** Claude runs RunPod
afterwards with the owner's money limit (the scripts must refuse to start without `MAX_HOURS`).

## Read first
`NOTES-104.md` (all stages, especially "Stage 3 - the full pack" and the stage 2c notes), `reviews/review-104-draft37.md`,
`NOTES-96.md` stage 3 (bundle layout, `make_prod_scene96.py`, `build_bundle96.py`, `run96-*.sh`, `pack96.py`,
`smoke96`), `cloud/cloud-render.sh` header, `cloud/multi_blender.py`, `../docs/art-pipeline.md` sections 2-4,
`out10s/manifest.json` (incl. `brief96.page_must`).

## Scene changes on top of draft 37 (production scene only, no new draft)
From the critique (taken by Claude): fountain rock about 1.3x lighter and the kicker on the falls, not the bowl;
register spot cones 5-8 deg wider or aimed ~0.15 m closer to the counter so each pool runs into the kick panel;
corridor wall plaster stays OFF the interior receiver list; keep "no light inside another light's plane"; light
linking at most 60 with no warning line.

## The pack (stage 3 plan of NOTES-104, variant A)
- New pack folder `out10t/` (base pack, contract of `out10s` plus `brief104` manifest block) and its own props pack
  `out10tps/` (jukebox tubes, TV glow solved under the new light). Name any other new folder `out10t*`.
- Rendered again: backgrounds (48 phases + wrap + dry), both light loops, all occluders and slices (jukebox as a depth
  piece), the door sheets that show the interior, restroom light states if they differ, the mist maps **including
  `light.png`** (the page tints and lifts chatters from it; it must carry the magenta/cyan pools so walkers get their
  colour), claw chase, jukebox tubes, TV glow, marquee chase solved again, wet-floor sign sprite and the item sprites
  that stand in lobby light if they differ by more than 2/255.
- Point 6: no `wet_*` loops (keep a merged sheet only for a parent that passes 8/255 on more than a few pixels); marquee
  light and shadow, poster light and shadow, jukebox/TV light and shadow baked into the scene pictures; manifest says
  so (`brief104.baked`), and lists what the page must do (`brief104.page_must`).
- Carried over byte-identical from `out10s` where the plan says so (vehicles, umbrellas, cat, janitor, rain, etc.),
  checked as the plan says.
- Several Blender workers per GPU (the helper's `WORKERS=auto`, `MAX_WORKERS`); aim for ~100% GPU use.

## Deliverables (write only inside roxy3d/)
1. `lobby104/` production scene (`make_prod_scene104.py`), bundle `lobby104/roxy-cloud-bundle-104.tar.gz` (+ `.sha256`)
   for the multi-pod helper unchanged (`cloud/` not edited), and `lobby104/run104-test.sh` (canary items, one pod) and
   `lobby104/run104-final.sh` (all items, several pods), both refusing to start without `MAX_HOURS`.
2. A local smoke through the helper's worker on a handful of items (one of each kind), result passing the helper's
   collection check; local Blender one job at a time.
3. The home pack step `lobby104/pack104.py`, written and run on the smoke result into a scratch folder (not `out10t/`
   yet), proving the manifest, checksums and validation come out right.
4. A fresh estimate from the smoke timings: item count, GPU-hours on an RTX 4090 class card with several workers per
   GPU, wall time on 5 pods, and a dollar range; and the exact commands for Claude (test, then final) with the
   `MAX_HOURS` each needs for a total budget of **$6** (say if $6 is not enough).
5. "Stage 3 prep" section in `NOTES-104.md`. End with a STATUS line.

## Rules
Write only inside `roxy3d/`. Never modify `out10*` packs that exist today, `qa11/`, pages, `cloud/`, existing drafts or
existing .blend files. Local RTX 3050, one Blender job at a time: check `tasklist` for `blender.exe` and Godot before
each run. Blender in background mode (`-b`) only; never a visible Blender or Godot window. **No cloud: do not run
`runpodctl` or the run scripts.** No API keys in files. No commit or push. Temporary files outside the project,
deleted after. Then stop.
