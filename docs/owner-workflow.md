# How the owner uses DinkDonk Cinema

The streamer runs the screens on their own Windows PC, in OBS. This page describes that setup and the day-to-day
workflow, including how the AI agents are used. For code details see the other docs in this folder.

## The streaming setup

| Piece | What it is |
|---|---|
| OBS profile | "Angelthump h264 1440p" (1440p canvas) |
| OBS scene collection | "Moobies 1440p poll": a **copy** of the original "Moobies 1440p", which is never edited |
| Lobby scene | a browser source with `lobby.html` (nested as "Lobby (src)"), plus "Lobby + Poll setup" (lobby next to the dinkdonk.mov poll builder) |
| Cinema scene | "DinkDonk Cinema": a browser source with `auditorium.html`, plus "Film screen (src)", a VLC capture of the movie |
| Film on the screen | `obs-bridge.js` takes the screen corners from the auditorium page and moves the VLC capture onto them with the "Corner pin (live)" filter. It needs the obs-shaderfilter plugin. |
| Chat | a local Destiny.gg relay (the DSA OBS overlay) on port 18765, kept outside this repo |
| Control | `control.html` in a normal browser: pick the scene, run the director, send commands |

`start-all.bat` starts everything, and anything already running is left alone:

1. the chat relay (port 18765)
2. the standby server, `start-standby.bat` (port 18770)
3. the OBS bridge, `start-obs-bridge.bat` (port 18790)
4. OBS with the right profile and collection

It then opens the control panel. VLC (the movie) is opened by hand.

### Browser source URLs

| Source | URL | Notes |
|---|---|---|
| Lobby, 16:9 | `http://127.0.0.1:18770/lobby.html` | the default |
| Lobby, squarer | `…/lobby.html?fit=cover` | fills a squarer source (for example about 2028x1440) by cropping the sides instead of showing black bars. `fitx=<x>` sets where the wide shot is centred. |
| Auditorium | `http://127.0.0.1:18770/auditorium.html` | |

Old URLs with `roxy.html` still work; they redirect to `lobby.html` and keep their options. All URL options are
listed in [lobby.md](lobby.md) and [auditorium.md](auditorium.md).

Keep "hardware acceleration" on for browser sources in OBS. The lobby uses WebGL and video loops.

### Cinema filters

The Lobby and Auditorium cards in the control panel each have a filter dropdown. Pick a look to hold it, or pick
Off for the original image. Turn on **Director chooses filters** to rotate the looks again. Each room starts with
rotation enabled at 30 seconds per look. The interval is adjustable from 5 to 600 seconds.

For the same controls directly in a scene, use OBS **Interact**, then press **Shift+F**. Close the menu with Escape.
You can also open a separate browser view of that room with `filtercontrols=1` in its URL. The room page applies the look to the art, chatters and bubbles in every browser. The auditorium preserves the green film cutout. Off restores the original picture.

### Cinema events

In **Timed events** on the Lobby or Auditorium card, leave **Auto** on for the director to pick shows. To cue one yourself, choose it in the dropdown and click **Run event**. This works with Auto off. The request waits up to 90 seconds for the current show, suitable guests and the right room phase. The panel reports when it plays or when the room can’t stage it. Turning Auto off during an automatic show stops it. Cinema filters have their own controls.

The lobby choices are Black Hole Matinee, Mirrorball Ballroom, Infinity Foyer, Glyph Cascade (PEPE WINS), PEPE vs. YEE, Restroom rendezvous, Quickdraw, Nothing Burger, Aristortle crossing, Marquee photo, Share an umbrella, Dish Night giveaway, VHS tape swap and Free movie poster. In **Free movie poster**, one guest visits the corridor bin, opens a poster from a rated film in the watch log, and carries the roll away. If the artwork is unavailable, the sheet keeps its printed film title and year. In VHS tape swap, two guests meet on the carpet outside the screens and exchange cassettes labeled with two films the cinema has shown. In Dish Night, the cashier gives a patterned saucer to a real ticket buyer. The design changes each week, and the buyer carries it away with their ticket. In Share an umbrella, a gust turns an umbrella inside out and a second guest offers shelter on the sidewalk. In Marquee photo, a chatter takes a sidewalk portrait of one or two other guests. The director waits for their emotes to load. Open the [event screening room](../concepts/cinema-mods/events.html) for named previews. In Glyph Cascade eight chatters draw their own cards, raise them overhead and tuck them away. In Aristortle crossing the camera follows the turtle out to the street and a passing vehicle hits it. Automatic fights and Quickdraw use the matching emotes. When you click **Run event**, the director can fill missing roles using two distinct active chatter identities.

On **Lights up** with the projector on **Auto**, the auditorium shows the latest rated film in the DinkDonk watch log. The card uses its recorded score and vote count.

In **Auditorium → Cinema screen shows**, choose **Framing chart · Flat 1.85:1** or **Scope 2.39:1** to check the projected picture. The white edge marks the full frame. The solid amber and dashed pale blue rectangles sit 2% and 5% inside each edge. The circle and cross mark the picture center. Select **Auto** to resume the pre-show, or use **Film** or **Movie** to start the feature.

Choose **Close house curtains** in the same picker to draw the red velvet across the screen. Pick a slide to reveal it, select **Auto** to reveal the pre-show, or start the feature with **Film** or **Movie**. You can reverse the curtains during travel. A new auditorium inherits the held position. The intermission clock opens the curtains for the countdown and restores them afterward. Viewers using reduced motion see each position immediately.

Open **Auditorium → House notice** to preview a message of up to 120 characters. **Project notice** puts the card on every connected auditorium. You can edit and project it again. **Withdraw notice** restores the screen choice from before the first notice. During an intermission the countdown stays visible and the notice comes up afterward. Selecting another screen, starting Film or Movie, or resetting the room clears the published message.

In **Auditorium → Audience silhouette**, choose **Start guessing round** during Seating or Lights up with the screen on Auto. The shared room waits for a seated guest, then projects their emote in silhouette for up to 16 seconds. Viewers type `!guess` followed by the emote name in DGG chat. A first-letter hint appears halfway through. The first correct guess reveals the emote and credits the viewer and the person wearing it. With no correct answer, the timer reveals the emote. After seven more seconds the pre-show resumes. **End round**, Film and other screen cues give the projector back immediately.

For a break, open **Auditorium → Intermission clock**, choose 5, 10 or 15 minutes, then **Start break**. Every connected auditorium uses the same deadline, including screens opened during the break. At zero the projector asks the audience to take their seats. **End break** restores the previous screen selection. **Film**, **Movie** or an explicit screen selection also dismisses the clock. A source configured to stay green keeps that setting. External movie playback is controlled separately.

**Interval ice creams** sends a capped usher to an occupied aisle seat during a timed break. The usher carries a tray, serves a tub, and walks back to the entrance. Automatic events try once per break as soon as an aisle guest is ready, with at least 50 seconds left. You can also select the event and run it by hand. Ending the break clears the service.

In the auditorium, Laser Choir performs during seating or lights-up, the aisle vendor visits during seating, and the popcorn run needs a seated guest during the film. In **Pass the popcorn**, two guests in neighboring seats share one bucket during Seating or Lights up. The director waits until one guest has popcorn and the other has a free hand or a drink.

**Festival beach ball** runs during Seating with the projector on Auto. Two or three seated guests tap an inflatable ball across the seats and back to its owner. Select it under Auditorium events or let it run in the automatic rotation. A film cue clears the ball.

**Audience rainstorm** is a 24-second Foley performance during Seating on Auto. The projector cues nearby seated guests to brush their palms, snap their fingers, and pat their knees as the shower builds and fades. The original stereo track follows their gestures. Run it from Auditorium events or leave it in the automatic rotation. A film cue clears the arms, cue card, and audio.

**Paris in 3-D** is a silent 29-second travelogue during Seating on Auto. Seated guests lift handheld cardboard viewers for the 1900 Avenue de l’Opéra stereograph. The camera shows the audience, the house screen and the registered plate straight-on. With red/cyan glasses, wear red over your left eye. Reduced motion keeps the house wide. Choose **Paris stereoscope** in the mutoscope to study both original views at your own pace.

Open **Show caller · event cue list** under Now in the control panel to prepare a sequence across both rooms. Choose a room and event, add an optional standby note, and move uncalled cues into order. **GO** calls one event and waits for that screen’s receipt. The desk shows waiting, playing, finished or interrupted. **Release this cue** stops tracking the call and lets you move on while the room director handles the existing request. **Rearm list** makes a completed list ready for another show. The list is saved in this browser. Reloading the panel resumes tracking and the operator presses GO for each new call.

**Rising house organ** runs during Seating on Auto, once a guest has taken a seat. The pit opens, the player console rises for the house overture, and its paper roll and keys move with the music before the lift descends. Run it from Auditorium events or leave it in rotation. A film cue stops the music and clears the pit. If a web browser blocks sound, a click in the auditorium during the overture joins the performance already in progress.

During **Lights up** with the projector on **Auto**, **Visual applause** brings two to four nearby seated guests into view. Each raises both hands and turns their wrists as the next guest joins in. Choose it under Auditorium events or leave it in the automatic rotation. With reduced motion, the camera stays in place and the hands turn gently.

For a festival-style discussion, choose **Lights up** and leave the projector on **Auto**. **Audience Q&A microphone** sends a capped volunteer down the stair to a real chatter in an aisle seat. The projector shows who has the microphone. The volunteer collects it and walks back through the entrance. The event can run automatically or from **Run event** with Auto events switched off.

For a moderated discussion, choose **Lights up → Auto** and open **Audience question desk → Open Q&A**. The projector invites viewers to type `!ask` and a question of up to 160 characters in chat. Each viewer can have one question waiting, and the desk holds twenty at a time. The host can also add an opening question. Choose **Project** to display a waiting question and **Mark projected question answered** to return to the invitation. **Dismiss** removes a waiting item. Refreshing the panel preserves the active session. Ending the Q&A, replacing the projection, leaving Lights up, or restarting the room clears it.

### Movie-night extras

The [Cinema guide](../concepts/cinema-guide/index.html) lists upcoming DinkDonk sessions in your time zone or the published cinema time zone. Choose **Save .ics** beside a session or download the whole upcoming schedule. Untitled slots retain their published start and end times.

**Your first visit** in the guide uses still artwork from the two rooms. Select a lobby landmark, follow the example route to row F, or move the lighting divider to compare the same seats with the house lights up and down. Each stop has its own link. **Print all three stops** makes a landscape guide with one stop per page.

**Movie-night bingo** in the guide has decks for the lobby and the film. Mark what you see and tap again to undo. Three in a line wins. Copy the game link and give each viewer a different card number, or use **Print four cards** to deal a blank set on one sheet. Each browser remembers its cards and marks for that game. The card also works offline when opened from the downloaded package.

Open **Mutoscope** in the cinema guide to turn through the eleven gallop cards from Eadweard Muybridge’s 1878 print of Sallie Gardner. Drag the crank, use the arrow keys, or select **Run reel**. **Standing pose** displays the separate twelfth photograph. The reel runs locally.

Open **Paris stereoscope** from the mutoscope to inspect both photographs on the original 1900 card. Use the arrow keys on the photograph to step between eyes. Choose **Red/cyan** for glasses with red over the left eye, or **Stereo pair** for parallel viewing. **Cross-eye order** reverses the pair. Align on the opera house or the horse omnibus to see how their distances affect the overlap.

The **Thaumatrope workshop** in the mutoscope lets you draw on either face of a two-sided paper toy. Use **Both faces** to align the drawings or turn the disc with the slider. Each design keeps its edits on this device. **Print cut-out toy** produces both discs, alignment and string-hole marks, and assembly instructions on one sheet. The back artwork is already inverted for assembly.

From the mutoscope, open **Foley bench**. Try the low and high shell sounds with **A** and **L** or the two pads. Choose **Record take** and tap after the three-count as the horse runs. The browser remembers the last completed four-second take. You can replay it against the same photographs or save a mono 48 kHz WAV. Canceling or recording an empty take keeps the previous performance.

Open **Projection booth** from the guide to practice a 35 mm reel change. Guided mode holds each cue. In timed mode the upper-right dot appears for four frames at 24 fps. Press **M** to start the incoming motor and **C** to change projectors, or use the two buttons. Leaving the tab pauses the reel.

Open **Reel timing sheet** in the booth to time a 35 mm four-perf or 16 mm print. Enter each reel’s picture footage and extra frames, then choose the projection speed. The sheet shows the duration of each reel, the elapsed time at its end, and the total picture time. The last pair of digits counts frames. The browser saves the sheet locally when storage is available. Open **Share one print between two screens** to allow for reel preparation and a courier’s round trips. Each delivery shows how early or late it reaches Booth B and the earliest uninterrupted second screening.

In **Caption desk**, play the sync leader or open a local video. Pause at a sound or line, mark the in and out times with **I** and **O**, enter the words, and choose **Add cue**. **Play cue** previews its timing against the picture. Plain-text SRT and WebVTT files import into the current sheet and either format can be saved. The browser remembers saved cues for each clip. Reopen the same local file to continue editing it.

In the booth, **Picture & sound sync** plays a downloadable nine-second reference through your recording setup. At 24 fps, the picture marked 2 and the 1 kHz stereo tone coincide on frame 144. First picture begins on frame 192. Use the two cue buttons and frame controls to inspect the reference, or import the MP4 into your editor alongside a recording.

Open **Framing bench** to inspect a local clip on a constant-height screen. Choose Academy, 16:9, Flat or Scope, then compare **Fit whole frame** with **Fill aperture** at the same playback position. The readout measures empty space in the aperture or pixels removed from the decoded source. The file stays in your browser.

From the projection booth, open **House organ**. Play the labeled keys by touch, mouse, or computer keyboard. The Flute, Diapason and Reed stops change the sound of held notes. Choose the range from C3 through C6, or click **Play house overture** for an original eight-bar tune with pedal bass and accompaniment. **Stop sound** releases the keyboard and cancels the tune. The organ plays in the browser where you opened it.

In **Auditorium → House organ sing-along**, choose **Play Save Me a Seat** during Seating or Lights up with the screen on Auto. A bouncing ball marks each syllable of the 18-second song. A screen joining midway picks up at the current lyric. The pre-show resumes at the end, or you can choose **Stop song**. If the browser starts the film silently, click the projected picture or focus it and press Enter to hear the organ.

Choose **Double bill** from the guide to program two films from the watch log. Pick each feature yourself or ask for a pair with a shared genre or release year. Set the intermission to 5, 10 or 15 minutes. When the archive lists both runtimes, the playbill adds the break to the full program time. Open **Program notes** to write an introduction for each film. This browser remembers each note when you use the film in another bill. Clear **Include notes on playbill** to keep the introductions for the host. Choose **Print playbill** to print the program or save it as a PDF from your browser.

Choose **Audience favorites** to browse the recent public ballots matched to films in the watch log. Pick a minimum turnout and an opening or second feature slot, then select a film title. Each film uses its latest valid ballot. Averages are shown to two decimals and equal displayed scores share a rank.

Choose **Mystery screening** to put the selected pair on an audience clue sheet. It shows the available release year, runtime and genre, using title length or first letter as extra hints when a film has sparse metadata. Reveal either title when the audience is ready. **Print clues** gives guests space to write their guesses and omits both answers and the host's program notes, even after an on-screen reveal.

Choose **Make an invitation** to create a handbill for the selected pair. Set a headline, venue and optional showtime. Save a full-size PNG, print four handbills on one sheet or copy a plain-text invitation. A time that occurs twice offers both UTC offsets. The handbill remembers its details for this pair in this browser.

Open **Running order** from the double-bill planner to time the show you selected. Set the local start and optional finish deadline, then check the minutes for the welcome, films, interval and discussion. An unlisted film runtime needs a value before you can start. Set an optional segment to zero to skip it. **Start program now** records the first actual time. Advance at each cue to update the expected finish and the spare time or overrun. **Undo last cue** corrects a mistimed click. The browser remembers the running sheet after a reload, and **Print cue sheet** includes the times recorded so far.

In a server running the experimental branch, open `/concepts/ticket-counter/index.html` to make a souvenir PNG for a screening from the DinkDonk watch log. Pick the title and screening time, then choose **Save ticket PNG**. Each stub uses the screening's watch-log number and New York time. Choose **Stamp passport** for a screening you attended. Your browser keeps one stamp per screening. You can remove individual stamps or print the collection.

Open **Film diary** in the cinema guide to record a viewing. From the ticket counter, **Write diary entry** fills in the film and the New York screening date. Each visit has its own date, performance, note and optional red-ink favorite mark. Keep multiple visits to the same title to see their order. Entries stay in the current browser and are available when the watch log is offline. **Print diary** prints the entries or saves them through the browser’s PDF printer.

The guide’s **Screening calendar** groups movie screenings from the current watch log by their New York dates. Select a day to see every time and title or open an individual ticket. The arrows move between archived months. Inside the calendar, arrow keys move by one day or one week. **Print monthly program** prints the overview followed by a complete listing for that month. A previously opened calendar also works from the saved watch log while offline.

Play **Which came out first?** at `/concepts/preshow-quiz/index.html` before the film. Pick a title to guess or click **Reveal years** to let chat guess aloud. **Next pair** deals two more films from the watch log. You can open the page separately or add its URL as an OBS browser source and use **Interact**.

### Who shows up

Open **Seating plan** in the control panel's Room card to find a chatter by name or inspect any seat. The chart uses the auditorium's actual rows and aisle gaps. Seats are counted from the left within each block, facing the screen. The room assigns seats before guests finish walking to them. Use the arrow keys to move between seats and Enter to select one. The chart refreshes while it is open.

Choose an assigned seat and **Step out and hold seat** to issue a re-entry pass. The guest walks out through the entrance and a paper **HELD** card marks their seat. Choose **Show held seat** beside their name in the people list to frame the empty chair. **Return to seat** in the seating plan brings them back to the same place. If you recall them while they are leaving, they finish the outbound walk and come back. The shared room remembers the reservation for screens opened later.

By default only chatters who tag the streamer's DGG name walk in. `everyone=1` lets all chatters in. When the owner
is shown a scene (a screenshot or a link), it is always with `everyone=1` and real chat, never the scripted
`demo=1`.

## A movie night

1. Run `start-all.bat`. Check that OBS has loaded the "Moobies 1440p poll" collection.
2. While waiting, show the lobby. Chatters walk in from the street, queue at the box office and snack bar, and talk
   in speech bubbles. The dinkdonk.mov poll goes next to the lobby ("Lobby + Poll setup"); the lobby has no green
   screen of its own.
3. Switch to the cinema scene: in the control panel (scene Lobby) press **Fly to the auditorium**. The lobby plays the
   ~50 s fly-through with the chatters in it (shared/transition.js), and at the end `obs-bridge.js` cuts OBS to
   "DinkDonk Cinema" on the matching frame. (Switching by hand still works.) The auditorium source ("Browser 3") must
   keep "Refresh browser when scene becomes active" **off**, or it reloads and shows black at the cut. Then pick
   **Auditorium** in the panel and check that the director is on.
4. The auditorium runs its phases: people take their seats, the lights go down, the film shows on the big screen,
   and the lights come back up. The OBS bridge shows the VLC film on the screen only during the film phase.

## Working with AI agents

The owner builds this with Claude Code and the Codex CLI:

- **One session per area.** A lobby session owns `lobby.html`; a cinema session owns the auditorium; a QA session
  works only on the `-qa` copies; a packaging session owns `package/` and `web/`. Lobby problems found elsewhere are
  passed to the lobby session instead of being fixed on the side.
- **Lobby and auditorium Blender design.** GPT-6.2 Astra handles research, ImageGen concepts, editable models, renders and
  revisions at high effort and normal speed (default service tier). Claude routes lobby and auditorium design briefs to Astra.
  A separate reviewer compares the rendered result with the selected design.
- **Drafts:**
  - For a lobby scene draft, show one 1280x720 image for owner feedback.
  - For a prop redesign in either room, show the original Blender render, the researched ImageGen concept and the independently reviewed Blender render in that order. Include the editable model and a short account of the critic’s findings and fixes. [Prop review](art-pipeline.md#lobby-and-auditorium-prop-redesigns)
  - Layout changes start as a plain-box blockout.
  - Each draft gets a read-only Codex critique before the next brief.
  - Full renders (the final art pack) happen only when the owner says "final render". Big renders go to a rented
    cloud GPU (RunPod) within a set credit.
- **Overnight goals.** The owner sometimes leaves a goal, such as "keep improving the auditorium until it's good
  or weekly usage reaches N %". Agents then work alone, log everything in `roxy3d/PROGRESS.md`, and send nothing
  until morning.
- **Queued requests** that shouldn't start yet go in `roxy3d/QUEUE-owner.md`.
- **Style.** Short answers, one question at a time with options, and results shown before moving on.

## Sharing it with others

- **Zip package.** `node package/build.js` builds `../dist/DinkDonk-Cinema/` and a zip with the two scenes, only
  the art they load, the server, the OBS bridge, the chat relay and ready-made OBS scene collections. Rebuild it
  after changes; don't edit the package by hand.
- **Hosted edition** (`web/`, in progress). The same pages served from a web server with per-streamer room keys,
  so other streamers need only OBS.
- **This repo.** For collaborators. Large render folders stay on the owner's PC (see [README.md](../README.md)).
