# Movie suggestions from chat: plan

Status: **plan only, nothing built** (15 Nov 2026). Decisions are the owner's, from the brainstorm the same day.

## What it does

While the owner has suggestions open, chat suggests films. Each suggestion is looked up on dinkdonk.mov (TMDB data),
checked against the filters, and an approved film is added to the owner's open dinkdonk.mov poll builder at once. The
owner reviews the builder and presses **Create** himself. Chat sees accepted films and stamped rejections on the
lobby's poll screen. The bot never writes in chat.

## Decisions

| Topic | Decision |
|---|---|
| How to suggest | `!movie <title> [year]`, `@arealhumanbean <title>`, or an IMDb link with either |
| Who | anyone in chat |
| Chat replies | none (silent) |
| Opening / closing | owner, by hand, from the control panel; no timer |
| Into the builder | instantly, one by one, up to the cap; the rest wait on a bench in the panel |
| Entries per person | 2 (panel setting); more = rejected, stamp NO ENTRIES LEFT (no replacing) |
| Unclear title | most popular TMDB match; the card shows the year |
| Ratings | TMDB score + TMDB vote count from dinkdonk only; no OMDb key, no IMDb/RT |
| Watched before | not watched in the last 365 days, from dinkdonk's watch history |
| Content limits | max runtime, films only, release window, ban list (films + genres), each with an on/off switch |
| Removing films | owner only (panel or builder); no mod chat commands. A removed film refunds the entry and isn't re-added this round |
| On stream | accepted films on the lobby poll screen (as today); rejections as a short-lived stamped strip under the list |
| Not wanted | public list page, backers count, losers' head start, auto-close timer, bot account |

## Panel settings (defaults)

| Setting | Default |
|---|---|
| Entries per person | 2 |
| Builder cap | 12 |
| Min TMDB score | 6.8 |
| Min TMDB votes | 2,000 |
| Not watched within | 365 days |
| Max runtime | 2h45 (on) |
| Films only | on |
| Release window | not newer than 3 months, not older than 1950 (on) |
| Ban list | empty; film titles + genre checkboxes |
| Triggers | `!movie` on, tag on |

## Stamps (rejection reasons)

NO ENTRIES LEFT · NOT FOUND · SCORE TOO LOW · TOO FEW VOTES · WATCHED <month year> · TOO LONG · NOT A MOVIE ·
TOO NEW · TOO OLD · BANNED · ALREADY IN · REMOVED (the owner took it out this round) · POLL FULL (goes to the bench
instead, shown as BENCH)

## How the pieces fit

```
DGG relay (ws 18765) --MSG--> standby-server.js / movie-suggest.js   (parse, entries, open/closed, filters, state)
                                  |  ^
              pending lookups     |  |  TMDB results (from dinkdonk's own search, same-origin)
                                  v  |
                    dinkdonk tab: userscript (search, add to builder, report builder contents)
                                  |
lobby poll screen <-- /dd/draft.json (as today) + /ms/state.json (stamps)
control.html      <-- /ms/state.json, --> /ms/cmd (open, close, remove, bench swap, settings)
```

- **Chat on the server.** The pages read chat from the relay today; the server doesn't. A new module
  `movie-suggest.js` opens its own connection to the same relay (`ws://127.0.0.1:18765/__dgg_chat_ws`, Node 26 has
  `WebSocket` built in) and only reads `MSG` frames, and only while suggestions are open.
- **Lookups in the tab.** TMDB data comes from dinkdonk.mov, so the userscript does the lookups with the site's own
  search, inside the owner's logged-in tab. If the tab is closed, suggestions wait as "pending" and are looked up
  when it reopens.
- **Filtering on the server**, so the rules live in one place with the panel settings. Watch history comes from
  `dinkdonk.js` (already cached).
- **Adding to the builder** by driving the builder's own search box and picking the result with the matching TMDB
  id, not by inserting hidden inputs (the page's controller may keep its own list).
- **Removals.** The userscript already reports the builder's list (`/dd/draft`). The server compares it with what it
  added; a film that vanished was removed by the owner: refund the entry, block the film for this round.
- **State** in `cache/movie-suggest.json` (`movie-suggest-<port>.json` off 18770), like `poll-draft.js`.

## Builder check (15 Nov 2026, read-only, done)

Looked at `https://dinkdonk.mov/create` in the owner's logged-in Chrome; searched "Dune" and "Alien", selected
nothing, created nothing (0 options in the form afterwards).

- **Search** is `POST /api/tmdb/search` (internal, uses the logged-in session; the form also carries a CSRF token).
  The box takes a title, an IMDb id or an IMDb URL, plus an optional year and a Movie/TV switch.
- **Each result already shows everything the filters need:** title + year, age rating, runtime ("1h 57m"),
  language, genres, TMDB score as a percent with review count ("81.76% (17,141 reviews)"), **last watched**
  ("8 months, 8 days ago") and **times watched**. So runtime needs no second request, and the 1-year rule can use
  the result itself, not only the history feed.
- Results come 2 per page ("Page 1 of 674"); the first result is the most popular match, which is what we want.
- Each result's **Select** button carries `data-duplicate` (the page already knows if a film is in the list), and
  the form listens for `tmdb-search:select -> create-poll#addFromSearch`. So the userscript adds a film by clicking
  that result's Select, like the owner would.
- The score is shown as a percent (81.76% = TMDB 8.2). Panel setting "Min TMDB score 6.8" = 68%.
- **Official API** (`/api/docs`): `POST /api/create` creates a whole poll from `{type:"movie", tmdbId}` options,
  with an API key, for moderators/conductors/whitelisted accounts. Its option data includes `rating`, `votes`,
  `runtime`, `genres`, `imdbId`, `lastWatched`, `playCount`. There is no public search endpoint, and the owner
  wants to press Create himself, so the plan stays with the builder tab. The API is a fallback if driving the page
  turns out fragile (the key would live in an environment variable, never in a file).
- Not found: a maximum number of options. Keep the cap at 12 unless the site refuses more.
- Seen on the front page: polls titled "Movie Night - robopoller" by another conductor (Nuddel), so someone already
  runs an automatic poller of some kind. Worth asking how theirs picks films before we finalize.

## Steps

0. ~~Builder check~~ (done, above).
1. **`movie-suggest.js` + server routes** — built 15 Nov 2026 (not live until 18770 restarts). Routes:
   - `GET /ms/state.json`: `{ rev, open, round, settings, schema, counts, items[], events[] }` (panel + lobby stamps).
   - `POST /ms/cmd` (same-origin JSON, like `/ctl/cmd`): `open` (`fresh`), `close`, `newRound`, `remove {id}`,
     `promote {id}`, `setting {key, value}` (`value: null` = default), `settingsReset`.
   - Userscript (header `X-DD-Draft: 1`, like `/dd/draft`): `GET /ms/work` → `{ open, dryRun, lookups: [{id, query,
     year, imdb}], adds: [{id, tmdbId, title, year}] }`; `POST /ms/lookup {id, result}` or `{id, notFound: true}` or
     `{id, error}` (3 errors = NOT FOUND); `POST /ms/added {id, ok}` (3 failures = bench, "could not add").
   - `result` fields: `tmdbId, type, title, year, releaseDate, runtime ("1h 57m") or runtimeMin, genres[], scorePct,
     votes, lastWatched ("8 months, 8 days ago") or lastWatchedDays, playCount, poster, duplicate`.
   - Chat: the server's existing relay connection (the shared room's) now also feeds `movieSuggest.chatFrame`; it
     runs even with `STANDBY_ROOM=0`. Only `MSG` frames, only while open. Tag trigger = tag name at the start of a
     message. Removals: `/dd/draft` posts call `syncBuilder` (15 s grace after an add).
   - Watched rule: the result's `lastWatched` first, else dinkdonk's history search by title (+ year).
   - State: `cache/movie-suggest.json` (`movie-suggest-<port>.json` off 18770). Reopening within 3 h keeps the round.
   - Checked: module logic (parser, entries + refund, every filter, cap/bench, removal + bench move-up, lookup
     timeout, dry run) and the routes on 18771 (header/origin refusals, source file not served). Not yet with real
     chat: the relay was offline during the test.
2. **Userscript 0.4** (`userscripts/dinkdonk-poll-draft.user.js`) — built 15 Nov 2026. Keeps the read side; on the
   builder page it polls `GET /ms/work` (2 s while open, 5 s closed, 10 s when the server doesn't answer), local
   server only (skipped when `ROOM_KEY` is set).
   - Lookups: the site's own `POST /api/tmdb/search` (FormData `csrfToken, searchType=movie, year, query, page=1`;
     answer `{code: 200, data: [{type, tmdb_id, imdb_id, title, release_date, runtime (min), genres, languages,
     vote_average (0-10), vote_count, last_watched ("YYYY-MM-DD hh:mm:ss"), play_count, poster_path, …}]}`). Top
     result goes to `/ms/lookup`; no result with a year → retried with the year as part of the title.
     `reauthRequired` → badge "dinkdonk wants you to log in again".
   - Adds: dispatches `tmdb-search:select` `{detail: {item}}` on the search element with the raw search item; the
     form's `create-poll#addFromSearch` adds it exactly like Select (checked 15 Nov: "Alien - (1979)", 1 option,
     then removed with its X; the live draft stayed empty). Reports `/ms/added` only once the option is in the form.
   - A small corner badge "Chat suggestions open (dry run)" on the builder page while open.
   - Searches movies only, so TV suggestions come back NOT FOUND or as a film of the same name.
   - Install/update: control panel → *Install your poll script* (`/dd/poll-script.user.js`). Against a server
     without `/ms/` routes it stays quiet.
3. **Panel card** in `control-qa.html` — built 15 Nov 2026 (backup `backups/control-qa.before-movie-suggest.html`).
   "Movie suggestions (chat)" card (hidden on servers without `/ms/`): Open/Close, New round, a status line
   (round, n/cap in the builder, bench, rejected, DRY RUN), filter All / In the builder / Bench / Rejected, a row per
   suggestion (poster, film + runtime + genres, who, status or stamp, TMDB score + votes, Remove / Add now), and
   "Rules" with every setting. Remove in the panel also takes the film out of the dinkdonk builder: `work()` returns
   `removes: [{id, tmdbId}]`, the userscript clicks that option's X and posts `POST /ms/removed {id}`.
   Checked on 18771 with test entries: list, filters, Remove, a rule change and the dry-run switch.
4. **Lobby stamp strip** in `lobby-qa.html` — built 15 Nov 2026 (backup `backups/lobby-qa.before-movie-stamps.html`).
   A strip along the bottom of the poll screen, only while suggestions are open and the poll is still being built.
   The posters get less height while it's there. With nothing new it says "SUGGEST A MOVIE IN CHAT: !movie Title (year)
   or arealhumanbean Title · 2 per person". A rejected film shows there for 9 s with a red rubber stamp (TOO LONG,
   WATCHED MAR 2026, …), two at most at once. The page reads `GET /ms/state.json?lite=1` (open, entries, triggers,
   tag, the round's last 6 rejections) with the poll screen's 2 s read. Owner removals are not stamped on stream.
   Checked on 18771 at 1920x1080 (stamps from a test entry, then the hint).
5. **Dry run** on a real stream night: suggestions open, the userscript in "log only" mode (looks up and decides,
   adds nothing), so thresholds can be tuned on real chat.
6. **Promote** QA copies to live, docs (`docs/server-and-shared.md`, `docs/lobby.md`), then ship everywhere
   (commit/push, hosted, zip) on the owner's OK.

## Later / open

- Hosted edition: each room would need its own relay connection or chat source; local first.
- Abuse: alt accounts can get around the entry limit (owner chose "anyone"); a "chatted before opening" setting can
  be added if it becomes a problem.
- dinkdonk.mov may limit the number of poll options; the cap must not exceed it (step 0).
