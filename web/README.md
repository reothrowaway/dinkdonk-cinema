# DinkDonk Cinema, hosted edition

The lobby (`lobby.html`) and the auditorium (`auditorium.html`) served from one server, so other streamers only need
OBS: no Node.js, no chat relay, no bridge, no unzipping. Each streamer gets a private invite link.

Live at `https://2-29-56-208.sslip.io/` since 5 Nov 2026 (Hetzner server `dinkdonk-cinema`, Helsinki).

## For streamers (what to send them along with their invite link)

1. In OBS: **Tools › WebSocket Server Settings** › tick **Enable WebSocket server**. Click **Show Connect Info**
   for the password.
2. Optional, for the film on the cinema screen: install
   [obs-shaderfilter](https://github.com/exeldro/obs-shaderfilter/releases) and restart OBS.
3. Open the invite link in Chrome/Edge **on the PC that runs OBS**. Enter the OBS password, click **Connect**, and
   allow "local network access" if the browser asks.
4. Pick the source your film plays in (window capture, game capture, media source, anything), choose who walks in, and
   click **Create scenes in OBS**. You get *DinkDonk Lobby*, *DinkDonk Cinema* and a helper scene *Film screen (src)*,
   sized to your canvas.
5. Every stream: switch to those scenes. The **control panel** link (on the setup page, or Alt+C on the lobby or auditorium page in a browser) runs the camera, the
   automatic director and the auditorium phases (seating › lights down › film › lights up). It works on a phone too.
6. **OBS 33 and newer:** keep the control panel open in the browser on the OBS PC during the film. Its top line
   should say "OBS connected · server connected". (Newer OBS doesn't let websites inside OBS reach OBS itself, so the
   panel passes the screen position on. OBS 32 and older don't need this.)

Without the WebSocket server or the plugin everything still runs; the cinema screen just stays green.

## How it works

| Piece | Where |
|---|---|
| Pages and art | `site/` on the server; the build copies only what the two pages load (`package/art.js`) |
| Destiny.gg chat | one upstream connection on the server, shared with every open screen (`/__dgg_chat_ws`) |
| Emotes, dinkdonk.mov data | fetched once on the server and cached (`/dgg/*`, `/dd/*`) |
| Control panel | per room (`/ctl/*?k=KEY`): each streamer drives only their own screens |
| Scene settings | the panel's "Scene settings" card (bubble look, rain, mist, janitor, crowd, doze, …; `shared/settings.js`, copied next to `server.js` by the build): per room, saved in `DATA/settings/<key>.json`, sent to the room's screens on connect and on every change; the screens' URL options stay the defaults. Revoking a room deletes them |
| Film on the screen | `web/shim.js`, injected into the pages, answers the auditorium's bridge calls itself: it talks to OBS directly (`ws://127.0.0.1:4455`, password in the URL's `#fragment`, which never leaves the PC) or, if OBS blocks that, relays the corners through the server to the control panel (`/__bridge`) |
| Fly-through to the auditorium | the panel's **Fly to the auditorium** plays the lobby's fly-through with the room's chatters (`shared/transition.js`; the video and camera table come from `package/art.js`; seated people from `/ctl/room-roster`). At the end the lobby inside OBS posts the cut; `shim.js` sends it to `/ctl/cut-to-cinema`, the server hands it to the room's control panel (the relay host with the streamer's OBS link), and the panel cuts OBS to *DinkDonk Cinema* (Cut, then their transition back). Needs the control panel open with "OBS connected", and the auditorium source with "Refresh browser when scene becomes active" off (setup.html creates it that way since 7 Nov 2026; re-run setup to fix older scenes). Without a panel the lobby holds the last frame for 20 s |
| Room keys | `/var/lib/dinkdonk-cinema/rooms.json` on the server, managed on `/admin.html` |
| DinkDonk poll screen | each room has its own poll (`/dd/draft.json?k=`, `poll-draft.js`, saved in `DATA/poll-draft.json`) and its own roll-up screen. The streamer installs their poll script from their control panel (*Install your poll script*: `/dd/poll-script.user.js?k=KEY`, the userscript with this server and their room key filled in), and it posts the poll they build on dinkdonk.mov to `/dd/draft?k=KEY`, so it only changes their room. Votes and results come from dinkdonk.mov, read by the server every 20 s per open poll |

The pages themselves are the same files as the local version: `web/build.js` copies them unchanged (two small text
patches, checked at build time) and the server adds the shim.

## Admin

- **Invites:** `https://2-29-56-208.sslip.io/admin.html`, with the admin token. *Create invite link* gives a
  `setup.html?k=…` link for one streamer; *Revoke* stops it (their screens go quiet straight away).
- **Admin token:** printed once by the first deploy; also in `/etc/dinkdonk-cinema.env` on the server.
- **Logs:** `ssh root@2.29.56.208 journalctl -u dinkdonk-cinema -f`
- **Health:** `https://2-29-56-208.sslip.io/healthz`

## Deploy

From Git Bash in this repo (needs SSH access to the server, see below):

```bash
bash web/deploy/deploy.sh
```

It builds `../dist/web`, uploads it (about 725 MB, all of it each time), and switches the server over to it; the
previous version stays in `/opt/dinkdonk-cinema/previous`. The first run also sets the server up
(`deploy/setup-server.sh`): Node, Caddy with a Let's Encrypt certificate, a firewall (SSH, HTTP, HTTPS only),
key-only SSH, automatic security updates, a `dinkdonk` system user and the systemd service.

Own domain instead of sslip.io: point its A record at 2.29.56.208, then
`DD_DOMAIN=cinema.example.com FORCE_SETUP=1 bash web/deploy/deploy.sh`.

### Server access (one time)

The deploy script uses its own key, `~/.ssh/dinkdonk_cinema_v2_ed25519`, made only for this server. Its public half
has to be in root's `~/.ssh/authorized_keys` on the server once (or the server created or rebuilt with it):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDEoLNTutyRUV01mG0H4/L2IyTBBhkBLbkd3lxlQHMAu dinkdonk-cinema
```

## Local test

```bash
node web/build.js
cd ../dist/web && PORT=18772 ADMIN_TOKEN=local-test-token-0123456789abcdef node server.js
```

Then create a room on `http://127.0.0.1:18772/admin.html` and open its setup link.
