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
     Claude Opus 5.5 agent, see "Who renders the art") and say which points you took.
   - Run **full renders** only when the owner says so. Stage new packs in a separate folder (such as `out10i/`),
     verify them, back up the current pack, then promote.
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

## Which Claude model does what

**Owner, 12 Nov 2026: on Claude's side, Claude Fable 5.2 (high effort) is used only for the Blender design work;
everything else Claude does (QA, critiques, checks, packing reviews, page work) is done by Claude Opus 5.5.** Astra
works on all of it too (see "Working together"). Fable's part is what the Codex CLI
used to do in Blender: building and editing the scenes from the numbered briefs (`roxy3d/BRIEF-NN-*.md`),
blockouts, styled drafts, and the layer and production renders. In Claude Code that is a subagent with the model set
to Fable 5.2 and the effort set to high (Agent tool: `model: "fable"`, `effort: "high"`), given the brief as its task
and run in the background. It writes only inside `roxy3d/` and reports in `roxy3d/NOTES-NN.md`, exactly as Codex
did. The read-only second-opinion critique of a draft goes to an Opus 5.5 agent (`model: "opus"`), or is skipped
when the owner says so. Claude does not start `codex exec` jobs for its art work (this is only about how Claude runs
its own Blender jobs; it doesn't limit GPT 6.2 Astra, see below).

A brief states what to change, what must stay the same, the exact deliverable (for example the single draft
image) and "write only inside roxy3d/". It ends with a STATUS line.

## Working together: Claude and GPT 6.2 Astra

Owner, 27 Nov 2026: GPT 6.2 Astra (OpenAI) is a full collaborator on the whole project: pages, server, hosting,
packaging, art, Blender, QA and performance. Neither agent owns an area; both work from the same rules, and either
one can pick up, review or finish the other's work. Claude Code (Opus 5.5, Fable 5.2) and Astra work in the same
folder on the same PC, often at the same time.

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
- The owner's OBS browser sources run at a steady 30 fps on purpose (style). Never suggest changing that. Test at 60 (the
  stricter test), confirm at 30 in the portable QA OBS, and add an uncapped leg (no fps limit) to every perf pass.
  Report all three.
- During performance checks, repeatedly zoom from a wide shot to a tight close-up and back in both rooms. In the
  auditorium, also measure the lights going down and coming up, including zooms during the fades. Report frame
  timing during the moves and fades separately from the settled-room baseline.
- More RAM or VRAM for less stutter is fine; note the memory cost in `PROGRESS.md`.
- Check the baseline against what a normal scene should look like (people outside, chatting, at the jukebox), using
  a page that has been open a while and the room record (`/ctl/room-state`, `/ctl/room-roster`). Fix causes, not
  symptoms.
- After any change to a transition (`shared/transition*.js`, the fly-through), record it in the portable QA OBS
  (`roxy3d/qa-night/obs-portable`) with real chat and give the owner the video. Never touch the owner's live OBS.
- For timed lobby and auditorium events, show the owner a video of the full event. Have a second reviewer watch
  the recorded action at stream size, including where the chatters stand and whether their reactions are readable.
  The QA event screening room is `concepts/cinema-mods/events.html`. It lists automatic events and named previews.
- The original vaporwave looks are OBS filters. Compare them in `concepts/vaporwave/index.html`; the
  **DinkDonk Cinema Looks QA** collection holds the selected presets and strengths for each room. Promotion to QA
  puts a look in that collection or an event in the QA room. Identify which events run on the timer.

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
