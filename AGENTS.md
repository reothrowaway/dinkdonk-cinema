# Instructions for AI coding agents

This file is for any AI agent working in this repo (Claude Code, Codex, Cursor, Copilot, …). `CLAUDE.md` points
here. Read this file first, then the doc in `docs/` for the area you're touching.

## What this is

DinkDonk Cinema is a set of browser pages that run as **OBS browser sources** while the streamer waits for (and
runs) a DinkDonk movie night. People in Destiny.gg (DGG) chat become small walkers wearing their emote.

| Scene | File | Art |
|---|---|---|
| Lobby (main screen): a pre-rendered isometric late-90s cinema on a rainy night | `lobby.html` | `roxy3d/out10s/` (base and mist, Brief 96, 13 Nov 2026: claw machine in the arcade's place; `?artdir=out10r` = the one before) with props pack `roxy3d/out10ps/` (jukebox, TV), `roxy3d/out10mist/`, `roxy3d/out10m/` (street marquee), `roxy3d/out10l/` ("Dear Leader" poster), `roxy3d/out10p/` (claw machine, jukebox, TV). Second look, the dark "moody lobby" (Brief 104, 18 Nov 2026): `roxy3d/out10t/` + `out10tps/`, `out10tm/`, `out10tl/`, picked by the panel's "Lobby look" or `?look=moody` (old `?look=gamer` still works) |
| Auditorium: seats, lights down and up, the film pinned onto the big screen | `auditorium.html` | `roxy3d/qa11/` (draft 14 = draft 13 + the entrance corridor) |

`roxy.html` and `roxy-qa.html` are **redirect stubs** left over from the old name. Never edit them, and never put
code in them. The `roxy3d/` folder keeps its old name on purpose: briefs, scripts and paths depend on it.

Docs: [docs/README.md](docs/README.md) (index), [docs/owner-workflow.md](docs/owner-workflow.md) (how the owner
uses it), [docs/lobby.md](docs/lobby.md), [docs/auditorium.md](docs/auditorium.md),
[docs/server-and-shared.md](docs/server-and-shared.md), [docs/art-pipeline.md](docs/art-pipeline.md).

## Run and check

```bash
node standby-server.js            # serves this folder on http://127.0.0.1:18770 (start-all.bat starts everything)
```

- Lobby: `http://127.0.0.1:18770/lobby.html?everyone=1`
- Auditorium: `http://127.0.0.1:18770/auditorium.html?everyone=1`
- Control panel: `http://127.0.0.1:18770/control.html`

Chat comes from a local DGG relay on `ws://127.0.0.1:18765`, which is not part of this repo. If the relay is
offline, say so. Don't switch to fake chat instead.

There is no build step and no test suite. To check a change, load the page with `?everyone=1`, wait for real chat
to fill it, and look at it (screenshot) and at the browser console (it should show no errors).

## Hard rules

1. **Live vs QA copies.** `lobby.html` and `auditorium.html` are what OBS shows on stream. Try risky or
   experimental work in `lobby-qa.html` or `auditorium-qa.html` first. Back up a live file before replacing it.
2. **Real chat only.** Show and test scenes with `?everyone=1`. Never use `?demo=1` (scripted fake chatters) or
   synthetic chat floods. That applies to screenshots, QA and performance runs.
3. **Keep the full render resolution.** The 1920x1080 layout, the 2x art and the canvases sized to
   devicePixelRatio × zoom are there so director zoom-ins stay sharp. A performance fix must not lower them.
4. **Don't stop the server on port 18770** while the owner may be streaming. For a package smoke test, pick a
   free port from your assigned range under “Working together” and stop your test process afterwards.
5. **OBS.** The live scene collection is the owner's. Edit only a copy of its JSON (under
   `%APPDATA%\obs-studio\basic\scenes`), and only while OBS has a different collection loaded, because OBS
   overwrites the file it has loaded.
6. **Art workflow** (details in [docs/art-pipeline.md](docs/art-pipeline.md)):
   - A draft is **one** final-quality still from the fixed camera (lobby 1280x720 with the weather frame;
     auditorium 1920x1080). No close-ups,
     clips, extra audits or comparisons unless the owner asks.
   - Layout changes start as a quick labelled **blockout** (plain boxes). Styled drafts come only after the owner
     approves the layout.
   - Before writing the next brief, get a read-only second-opinion critique of the latest draft (from a
     Claude Opus 5.5 agent, see [model assignments for art](#model-assignments-for-art)) and say which points you took.
   - Run **full renders** only when the owner says so. Stage new packs in a separate folder (such as `out10i/`),
     verify them, back up the current pack, then promote.
   - For an experimental prop redesign in the lobby or the auditorium, work on the experimental branch. Show three labeled images in order:
     **1. Original Blender render**, **2. Researched ImageGen design draft**, **3. Updated Blender render**.
     Research the actual subject and its setting before generating the concept. Match the camera, framing and
     exterior lighting of the Blender renders and deliver the editable `.blend` alongside the comparison.
   - Have an independent reviewer compare the third image with the second at the size the prop has in its room. Fix material differences
     in Blender, render again and have the reviewer check the result. Report what changed and what still differs.
     Follow the [prop redesign workflow](docs/art-pipeline.md#lobby-and-auditorium-prop-redesigns).
   - Never redo something the owner already approved.
7. **Cloud GPU (RunPod)** costs real money. Use it only when the owner asks. Stay inside the credit the owner names,
   delete pods and volumes afterwards, and never put API keys in files.
8. **Files are byte-exact.** Art packs carry SHA-256 manifests, and `.gitattributes` turns off line-ending
   conversion. Don't re-save, re-encode or reformat art or manifests by hand.
9. **No computer use.** Agents (Codex included) must not drive other apps on the owner's PC (browser, history, media players); check videos by decoding frames.
10. **This repo is public.** No passwords, tokens, API keys, stream keys, OBS websocket passwords, account IDs or
   billing details, in code or in docs. The parent folder contains the owner's private OBS and server files.
   Open or copy one of those files only when the owner asks for that exact file. Keep it out of this public repo
   unless the owner explicitly asks to commit that file and it meets the requirements above.
11. **Git.** Owner, 13 Nov 2026: a finished, checked change goes everywhere in the same turn (see "Shipping"
    below); half-done work is not committed. Auditorium art in `roxy3d/qa11/` is ignored as a folder;
    add exactly the files the page loads with the recipe in [README.md](README.md). Draft, QA and old pack folders
    stay local.

## How the owner likes to work

- Short, concrete answers in American English. Dates look like "5 Nov 2026".
- When a decision is needed, ask **one** question at a time and give options. Put the recommended option first.
- Show results (a screenshot or one draft image) before moving on to the next thing.
- If you don't know a DGG meme, an emote, or what dinkdonk.mov is, search the web. Don't guess.
- Log what you changed, and why, in `roxy3d/PROGRESS.md` (newest at the bottom, with the date). Queued owner
  requests live in `roxy3d/QUEUE-owner.md`.
- Several agents may work at once (see "Working together" below). Stay inside the area you were asked
  to work on.
- **"Lobby and auditorium" means both rooms** (owner, 28 Nov 2026). Rules, workflows and design assignments for
  the rooms apply to the lobby and the auditorium alike. Don't narrow one to a single room unless the owner says so.

## Model assignments for art

**Lobby and auditorium Blender design (owner, 28 Nov 2026).** Assign the design pass to **GPT-6.2 Astra** with
**high effort** and **normal speed** (default service tier). This applies to both rooms: the lobby and the
auditorium, their scenes and their props. Astra researches the
subject, develops the ImageGen concept, builds the editable Blender model, renders the draft and revises it
after independent visual review. When a lobby or auditorium design request starts in Claude, hand the design brief to Astra.

**Other Claude-led Blender work** (outside the lobby and auditorium design pass). The owner’s 12 Nov assignment uses Claude Fable 5.2 at high effort for this work.
Claude Opus 5.5 handles QA, critiques, checks, packing reviews and page work. Astra
works on all of it too (see "Working together"). Fable's part is what the Codex CLI
used to do in Blender: building and editing the scenes from the numbered briefs (`roxy3d/BRIEF-NN-*.md`),
blockouts, styled drafts, and the layer and production renders. In Claude Code that is a subagent with the model set
to Fable 5.2 and the effort set to high (Agent tool: `model: "fable"`, `effort: "high"`), given the brief as its task
and run in the background. It writes only inside `roxy3d/` and reports in `roxy3d/NOTES-NN.md`, exactly as Codex
did. The read-only second-opinion critique of a draft goes to an Opus 5.5 agent (`model: "opus"`), or is skipped
when the owner says so. Claude runs Fable’s assigned Blender jobs directly through the Claude Code agent tool.

A brief states what to change, what must stay the same, the exact deliverable (for example the single draft
image) and "write only inside roxy3d/". It ends with a STATUS line.

## Working together: Claude and GPT 6.2 Astra

Owner, 27 Nov 2026: GPT 6.2 Astra (OpenAI) is a full collaborator on the whole project: pages, server, hosting,
packaging, art, Blender, QA and performance. Both agents can pick up or review each other's work, subject to the
art assignments above. Claude Code (Opus 5.5, Fable 5.2) and Astra work in the same
folder on the same PC, often at the same time.

- **Why two agents: even weekly usage** (owner, 28 Nov 2026). The point of working with both is to split the work so
  the weekly usage of the Claude and the OpenAI accounts is spent about evenly, not to have one agent do almost
  everything. Divide tasks between the two. Before taking on a large job, consider which side has more weekly usage
  left, and hand the job (or a self-contained part of it) to the other agent when its side has more room.
- **Claude orchestrates** (owner, 28 Nov 2026). Claude Code (Opus 5.5) is the main orchestrator: it plans the work,
  divides it between itself and Astra along the line above, hands Astra its briefs and checks the results.
  Claude runs an Astra job with `codex exec` (owner, 28 Nov 2026): model `gpt-6.2-astra`, high effort, default
  service tier, from a brief file (`roxy3d/ASTRA-NN-*.md`) on the job's own branch and worktree. GPT-6.2 Astra needs
  Codex CLI 0.172 or newer (0.159 and 0.167 were refused); run `codex update` from PowerShell, not Git Bash, if the
  CLI falls behind. Each job keeps one Codex session: Claude notes the session id in `PROGRESS.md` and sends
  follow-ups with `codex exec resume <id>`, so Astra keeps its context. Astra ends with a STATUS line; Claude then
  checks the result. A new job starts a new session that reads this file, `PROGRESS.md` and its brief.
- **Watch Astra's weekly usage** (owner, 28 Nov 2026). Claude checks the Codex weekly usage
  (`bash roxy3d/tools/codex-usage.sh`) before handing Astra a job, when it reports progress, at least once per
  working session, and every 5 minutes while an Astra job runs (owner, 28 Nov 2026; Claude starts
  `bash roxy3d/tools/codex-usage-watch.sh <job output folder>` in the background, which logs each reading and wakes
  Claude at 90% used, at 95% used and when the job ends). As soon as less than 10% remains (90% or more used), Claude tells the owner so the owner can act.
  Astra pauses at a clean point when 5% or less remains (95% or more used), owner, 28 Nov 2026.
  The owner has Codex usage resets: a low reading is a reason to tell the owner, not to move work away from Astra.
- **Hand-offs.** Leave work so the other agent can continue it without asking: a `PROGRESS.md` entry with what
  changed, what was checked, and what is open or unverified. Notes from art jobs go in `roxy3d/NOTES-NN.md` as before.
- **Second opinions.** A read-only critique or review by the other agent is welcome (drafts, risky changes to shared
  files, perf conclusions). Say which of its points you took.
- **Disagreements.** If you think the other agent's change is wrong, say so in `PROGRESS.md` or to the owner with the
  evidence; don't quietly undo it.

This file is the memory they share: `CLAUDE.md` loads it for Claude, and Codex-style tools read `AGENTS.md` on their
own. An agent's private memory does not reach the other one, so **when the owner gives a standing rule, add it to
this file (in the right section) and commit it.** Project history lives in `roxy3d/PROGRESS.md`, open owner requests
in `roxy3d/QUEUE-owner.md`, area details in `docs/`.

- **Say what you're on.** Before you edit, start a server, or use the GPU, add one line to `WORKING-ON.md` in this
  folder (local, not committed): who, what, which files or ports, since when. Remove your line when you're done.
  Read it first, and don't edit files someone else has listed. If you need them, tell the owner.
- **Uncommitted changes may be someone else's.** Check `git status` / `git diff` before editing a file. Never
  revert, reformat or overwrite another agent's uncommitted work. Commit only your own changes: stage your own files
  and hunks (for `PROGRESS.md`, only your entry), not `git add -A`.
- **Shared files** (`shared/*.js`, `control.html`, `standby-server.js`, `web/server.js`) are live the moment they
  are saved. Edit a copy, `node --check` it, then swap it in at once. Write with LF line endings (`newline='\n'` in
  Python); a Windows rewrite once turned whole files into CRLF.
- **Ports.** 18770 (live server), 18765 (chat relay) and 18790 (OBS bridge) are the owner's. Test servers: Claude
  uses 18771-18779, Astra 18780-18789. Stop your own test servers, relays and headless browsers by exact PID when
  you finish, and check that none are left. Never stop another agent's processes.
- **One GPU (RTX 3050).** Before a render, perf run or headless browser batch, check `WORKING-ON.md` and
  `nvidia-smi` for a running `blender.exe`. Timing taken while another job uses the GPU doesn't count.

## Owner's standing rules

From the owner, 7-18 Nov 2026. They apply to every agent.

### Shipping
- Owner, 27 Nov 2026: develop new ideas from the overnight research session in a separate experimental branch and checkout. Share that branch for review. Promotion to main, the hosted cinema and the release zip waits for the owner's direction.
- A finished, checked change goes to all four copies in the same turn: the local live files, the GitHub repo
  (commit + push), the hosted edition (`bash web/deploy/deploy.sh`, then compare the server's files with the local
  build by SHA-256), and the zip (`node package/build.js`, then smoke-test it on a spare port: a fresh room's
  auditorium must reach its seats, not only load). Skip a copy only when the change can't reach it, and say so.
- Back up a live file before replacing it. QA copies first for risky work.

### Services and processes
- The live server (18770), chat relay (18765) and OBS bridge (18790) always run in their own visible console window,
  started with `explorer.exe "<full path>.bat"` (`start-standby.bat`, `start-obs-bridge.bat`). Never run them hidden.
  To restart one, stop exactly that PID, start the .bat again, then check the port.
- Never tree-kill (`taskkill /T`) near the live server: on 10 Nov 2026 one likely took 18770 down. Kill exact PIDs,
  then check 18770 again a few seconds later.
- When a `.bat` is ready for the owner, give the owner a one-line command to run it: `explorer.exe "<full path>.bat"`.
- Godot runs with `--headless` only. Never flash a window on the owner's screen; compare JSON, not stills.

### Performance and OBS
- **Depend on OBS as little as possible** (owner, 28 Nov 2026). Use OBS only for what needs its scenes: the scene
  switches and cinema transitions (fly-through cut, screen shots T1/T2/T3) and the film capture they show. Visual
  effects such as the cinema filters belong in the page itself, so they show in any browser, not only in OBS.
- The owner's OBS browser sources run at a steady 30 fps on purpose (style). Never suggest changing that. Test at 60 (the
  stricter test), confirm at 30 in the portable QA OBS, and add an uncapped leg (no fps limit) to every perf pass.
  Report all three.
- Keep QA runs free of Windows private/public network access prompts. Reuse the established portable OBS and browser
  helper executable paths across runs. Keep run-specific configurations and measurements separate from the binaries.
- During performance checks, repeatedly zoom from a wide shot to a tight close-up and back in both rooms. In the
  auditorium, also measure the lights going down and coming up, including zooms during the fades. Report frame
  timing during the moves and fades separately from the settled-room baseline.
- Preserve visual fidelity when fixing stutter. Compare the original and candidate at wide and close framing and during lighting changes before promoting a performance fix.
- During extended Codex runs, check the account’s weekly usage and pause at a clean point with 5% remaining (owner, 28 Nov 2026).
- More RAM or VRAM for less stutter is fine; note the memory cost in `PROGRESS.md`.
- Check the baseline against what a normal scene should look like (people outside, chatting, at the jukebox), using
  a page that has been open a while and the room record (`/ctl/room-state`, `/ctl/room-roster`). Fix causes, not
  symptoms.
- After any change to a transition (`shared/transition*.js`, the fly-through), record it in the portable QA OBS
  (`roxy3d/qa-night/obs-portable`) with real chat and give the owner the video. Never touch the owner's live OBS.
- For timed lobby and auditorium events, show the owner a video of the full event. Have a second reviewer watch
  the recorded action at stream size, including where the chatters stand and whether their reactions are readable.
  The QA event screening room is `concepts/cinema-mods/events.html`. It lists automatic events and named previews.
- Each room’s control-panel card has a default-on automatic event switch, a dropdown of its released performances and a **Run event** button. The director can run one selected show with Auto off and respects the route and room phase. Automatic matchups require the matching emotes. For a manually requested PEPE vs. YEE or Quickdraw, fill missing roles using distinct active chatters’ names, with temporary costumes or performers. Keep PEPE vs. YEE and other standalone timed skits in the room director’s rotation. Black Hole cries, Infinity Foyer and poster remarks use the lobby’s normal incoming chatter-message path and speech queue.
- The lobby and auditorium render their cinema filters in the page. Use the original OBS shader captures in
  `concepts/vaporwave/index.html` and the **DinkDonk Cinema Looks QA** collection as visual references.
  Promote page looks to the QA pages and events to the QA room. Identify which events run on the timer.
- In the live Lobby and Auditorium, each room's Cinema filters dropdown can hold any of the thirteen looks or
  switch them off. Its filter director defaults on, changing the look every 30 seconds. Test manual selection,
  independent room settings, and the auditorium's keyed film cutout when changing those controls.

### Design and content
- Any new design starts with a Google Images search of the owner's exact wording; use the results as reference.
- Improvements should add life (people, staff, small motion, chat reactions), not lighting or polish. The auditorium
  is "just a cinema": only what a real audience or staff would do.
- DGG memes: research them, nothing older than one year. Drama is welcome as winks. Leave out deaths, private
  people, sex-crime or minors accusations, slurs and terror jokes.
- Before any paid final render (RunPod), run automated motion, flash and rain checks plus a cheap full-length draft.
  On RunPod use several Blender workers per GPU (aim for ~100% GPU) and pick the data center with the best
  availability over the fastest GPU.

Older briefs, notes and docs (`docs/art-pipeline.md`, `docs/owner-workflow.md`) still describe the Codex CLI calls
that made the art up to Brief 88; read "Codex" there as "the render agent".

## Map

| Path | What |
|---|---|
| `lobby.html`, `auditorium.html` | live scenes |
| `lobby-qa.html`, `auditorium-qa.html`, `control-qa.html` | QA copies |
| `control.html` | control panel (scene, director, commands) |
| `shared/` | `core.js` (SB: stage, chat, emotes, chat tokens), `cinema.js` (walkers), `live.js`, `emote-facing.json` |
| `standby-server.js` | local server (static files, video byte ranges, control events, DGG/dinkdonk data) |
| `obs-bridge.js` | pins the film capture onto the auditorium screen through obs-websocket |
| `dinkdonk.js` | dinkdonk.mov film data |
| `lan-proxy.js` | optional view-only proxy for phones and tablets |
| `package/` | builds the shareable zip; `package/art.js` lists the art the pages load |
| `web/` | hosted edition, live at https://2-29-56-208.sslip.io (see web/README.md) |
| `roxy3d/` | art: briefs, notes, Blender scripts and `.blend` files, packs, cloud render helper |
| `intro-dinkdonk/` | the DINK DONK intro video |
| `hall-*.html`, `cinema-*.html`, `0*-*.html`, `concepts/` | earlier concepts (not live) |
