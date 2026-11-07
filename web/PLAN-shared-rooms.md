# Plan: one shared, persistent session per room

Status: approved and LIVE 7 Nov 2026 (local 18770 and the hosted edition). Built in `shared/room.js`, both servers,
`shared/cinema.js`/`core.js` (opt-in) and the QA copies (lobby by the Lobby Map session), then promoted to
`lobby.html`, `auditorium.html` and `control.html`. Old live pages: `backups/2026-11-07-pre-shared-rooms-live/`.

## Goal

- A room (one invite key) has **one** lobby and **one** auditorium that keep running on the server.
- Reload or close the page and come back: the same people are still there, with the same emotes. A full lobby stays
  full.
- Two people anywhere with the same room open see the same chatters walk in, wearing the same emotes and saying the
  same lines. In the auditorium they also take the same seats.
- The only way to empty a room is the control panel (Clear lobby / Reset auditorium). One panel action reaches every
  screen of that room.

## How it works today (why a reload starts from empty)

| Part | Lives in | Effect |
|---|---|---|
| DGG chat | server, one connection shared by every screen | Every screen gets the same messages, but only from the moment it opens |
| Who walks in (tag / everyone filter) | each page, from its URL (`?tag=` / `?everyone=1`, `shared/cinema.js`) | Each screen filters chat on its own |
| Crowd: who's in, crowd skipping, caps, seats, lines | each page (`lobby.html` `spawn()` / `crowdSkip()` / `enforceCap()`; `auditorium.html` `onMessage()` / `chooseSeat()`) | Each tab has its own crowd, and it's gone on reload |
| Control panel | server forwards each command to every screen of the room (`/ctl/cmd`) | Shared already, but it only acts on each tab's own crowd |
| Screen state | each screen posts it every 1.5 s; the server keeps it 10 s | Only for the panel; nothing restores it |

## Design: the server decides *what* happens, each page decides *how* it looks

### 1. Room state on the server (new: `shared/room-logic.js` + `web/server.js`)

One pure JavaScript module with no DOM, so both the hosted server and the local `standby-server.js` can load it.
For each room it keeps:

- **Settings:** who walks in (tag nick or everyone), the crowd threshold and the caps. These move from the page URL
  into the room, and the control panel can change them.
- **Lobby roster:** the people in the lobby, each with nick, emote, color, rainbow, room index, detour, a **seed**,
  arrival time, last line and a coarse place (street, ticket line, snack bar, lobby, …).
- **Auditorium roster:** who is seated where (the seat id), the queue outside, phase, shot, lights on, Everyone
  leaves, auto phases.
- **Event log:** numbered events (`walkIn`, `say`, `remove`, `purge`, `combo`, `reset`, `phase`, …). The server
  keeps the last ~500.

Chat goes in on the server. The server applies the walk-in filter and the crowd rules (`crowdSkip` and the caps,
moved out of the lobby). In the auditorium it also picks the seat (`chooseSeat`, moved out of `auditorium.html`; the
server reads the same `cinema_layout_13.json`). It then sends the event to every screen of the room. This keeps
running when no screen is open: people walk in while you're away.

State is saved to disk, `data/room-state/<key>.json`, every few seconds and on shutdown, so it survives a server
restart or redeploy. A revoked room's state is deleted.

### 2. Pages become followers (`lobby-qa.html`, `auditorium-qa.html` first)

- **On load:** `GET /room/snapshot?k=…` returns the whole roster. Everyone in it appears **already at their place**,
  with no walk-in animation. Auditorium: seated in their seat, with the phase and lights as they are. Lobby: at
  their coarse place (they join the back of the ticket line, stand at the snack bar, hang out in the lobby, …).
- **Live:** one server-sent event stream per screen. It replaces the page's own chat walk-ins: `Cinema.onWalkIn` is
  fed by server events instead of the page's own chat filter.
- **Same behavior on every screen:** each walker's random choices (lane, detour, umbrella, group talk, waits) come
  from `rng(seed)` with the seed the server sent. The lobby already has `rng()`, used for props. So every screen sees
  the same person do the same thing. Shared world clutter (traffic, weather, the cat) stays random on each screen.
- **Coarse places:** the OBS screen (or else the biggest screen) already posts each chatter's `status` every 1.5 s.
  The server stores that in the roster, and that's how a reload knows where people are.
- **Fallback:** if the server can't be reached, the page runs on its own as it does today, so the stream never goes
  blank. On reconnect it asks for the events it missed (by number), or for a fresh snapshot if it's too far behind.

### 3. Control panel

- New **Clear lobby** command (the lobby has no reset today). Auditorium **Reset** keeps working but now clears the
  server roster.
- `remove`, `say`/`add`, phase, lights, Everyone leaves and auto become changes to the room state. The server then
  sends them out, so every screen and every future reload agrees.
- New in the panel: a "Who walks in" setting (tag / everyone) for the room.
- Automatic phase changes (download ≥ 90 % → lights down, complete → film) are sent by the screens to the server,
  which applies each one only once.

### 4. What will still differ between two screens

- Exact pixel positions can drift a little. The pages animate on their own frame clocks, and buses and taxis are
  local. People, emotes, lines, order, lines joined, seats and phases are the same.
- The camera moves on each screen's own frame clock, so a zoom can start a few frames apart. The shot itself (who is
  followed, wide or zoomed) is the same; see "Shared director" below.

### 5. Shared director (decided 7 Nov 2026)

- The room's director runs on the server. It picks who to follow and when, using the room's settings (`every`,
  `zoom`, on or off), and sends `follow <nick>` or `wide` events to every screen of that page.
- It picks from the roster: recent arrivals and people who just talked first. It skips anyone whose coarse place (from
  the OBS screen's `status`) is out of sight: on the bus, in a taxi, going in, in the tunnel.
- "Follow the next arrival" happens on the server: the next `walkIn` event carries `follow: true`.
- Panel camera commands (Wide shot, Follow someone, Follow next, director on/off, every, zoom) become room state.
  Every screen moves together, and a reload comes back on the current shot.
- If a screen can't find the followed chatter (still loading, or drifted out of view), it holds the wide shot until
  the next pick. It never picks someone else on its own.
- The page's own director code stays only as the fallback for when the server can't be reached.

Pixel-exact mirroring would need one screen (the OBS one) to stream positions 5-10 times a second, with the other
screens only drawing. That means separating simulation from drawing across ~3,700 lines of `lobby.html`. Not
recommended unless step 1 still looks too different.

## Steps

1. `shared/room-logic.js`: walk-in filter, crowd rules, caps, seat choice, the director and the event log, with Node checks that
   use recorded real chat (no synthetic floods, per AGENTS.md).
2. `web/server.js`: room state per key, snapshot and event-stream routes, saving to disk, revoke cleanup.
   `standby-server.js` gets the same, with one fixed room, so the local OBS setup has continuity too.
3. `auditorium-qa.html`: snapshot load (seated at once), server-fed arrivals, server seats, phase via the room. The
   auditorium is the easier page, so it goes first.
4. `lobby-qa.html`: snapshot load at coarse places, server-fed arrivals with seeds, Clear lobby, crowd rules
   removed from the page.
5. `control-qa.html`: Clear lobby, the "Who walks in" setting, and a view of the room state instead of one screen's
   state.
6. Check with real chat (`?everyone=1`): two tabs side by side, reload one, close everything for 5 minutes and
   reopen, restart the server, clear from a phone panel. Screenshots of both tabs.
7. Promote the QA copies to live, after a backup and with the owner's go-ahead. Rebuild `web/`, and deploy (needs SSH
   to the Hetzner server).

The lobby page work (step 4) goes through the "Lobby Map" session, which owns lobby changes. Before editing
`shared/*.js`, `control.html` or `standby-server.js`, check that no other session is changing them.

## Open questions for the owner (one at a time)

1. ~~Lobby: same people or pixel-identical?~~ **Decided 7 Nov 2026: same people, emotes, lines and order is
   enough.** No position streaming.
2. ~~Camera and director: per screen or shared?~~ **Decided 7 Nov 2026: one shared director per room** (section 5).
3. ~~Local edition too, or hosted only first?~~ **Decided 7 Nov 2026: both at the same time.** `standby-server.js`
   gets the same room logic with one fixed room; its state goes to `cache/room-state.json`.
4. ~~While no screen is open, do people keep walking in?~~ **Decided 7 Nov 2026: yes, keep filling.** Each person
   keeps only their latest line; nothing is replayed when a screen opens.

All open questions are answered. Next: build steps 1-6 in QA copies, then show the owner before anything goes live.
