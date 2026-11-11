# Page-drawn items (not baked into the Blender renders)

This is the standing list of everything a viewer can see in the lobby and the auditorium that the page draws itself
(HTML/CSS shapes, inline SVG, canvas, or an emote picture standing in for a prop) instead of loading it from a Blender
render pack. Use it to pick items to be made properly in Blender: say "make item X in Blender" and the job starts with
a brief; anything that changes the layout gets a labelled blockout first, then one styled draft, and full renders only
on the owner's word (AGENTS.md, hard rule 6). "Stays live" in the last column means the content changes while the page
runs, so Blender can only supply the base and the page keeps drawing the changing part.

Last updated: 11 Nov 2026

Read from `lobby-qa.html` and `auditorium-qa.html`. The live pages (`lobby.html`, `auditorium.html`) have the same
items (checked 11 Nov 2026, after that afternoon's promotion). Names are classes, element ids and functions, not line
numbers.

## Lobby

All in `lobby-qa.html` (and `lobby.html`). L-numbers are the life ideas in `roxy3d/memes/LIFE-IDEAS.md`.

| Item | What the viewer sees | How it is drawn now | Switch | For a Blender version |
|---|---|---|---|---|
| "Dogtober 7th" poster (L51) | Red and gold documentary poster with a dog silhouette, on the right frame at the corridor's left end | `.pst` div with inline SVG and text, in `#lifefx` (block "lobby props drawn by the page"); covers the render's filler poster "The Blue Hour" | `?posters=0` (both posters) | Print the artwork on the rendered frame. Fully static: can be baked |
| "The J6 Video" poster (L44) | Dark COMING SOON poster on the left frame; a stack of date stickers grows every 3 min (2024, SPRING, SOON, 2026, SOON(tm), AFTER HL3) | `.pst` div with text and `.stk` stickers (`STICKERS`, `stick`), corner cut with `clip-path`; covers the filler poster "Night Ferry" | `?posters=0` | Bake the poster; the sticker rotation stays live (or six baked states). The frame is half hidden, see Notes |
| Slop menu lines (L46) | The SODA and NACHOS boards behind the snack bar read POLITICS SLOP $2.75 / CODE DESTINY: 0% OFF and DRAMA SLOP $5.25 / NOTHINGBURGERS $3.50, 20 s each | `.menut` text strips, one per wall slice (`SLOP`, `buildSlop`); cream background matched to the board by eye | `?slop=0` | Render each board with each line (four board states) and let the page swap them, or a rendered blank strip with live text |
| NEXT SHOWING board text | "NEXT SHOWING: (film) / CHAT'S PICK" on the board on the corridor's back wall, while a poll winner is coming up | `.nb` div (`buildNextBoard`, `applyRooms`); it covers the board's baked text | `?pollscreen=0`, panel "Poll screen on the back wall" | The board is rendered. The title stays live; a blank board face in the render would be cleaner than covering baked text |
| Poll screen: case and cloth | A roll-up projection screen in front of the back wall left of screen 1: metal case, cloth that unrolls, bottom bar, pull cord | `.pscr`, `.pscr-case`, `.pscr-cloth`, `.pscr-bar`, `.pscr-pull` (CSS; `buildPollScreen`) | `?pollscreen=0`; panel "Lower the poll screen" | Model case and cloth; the unroll as a short sprite sheet. The picture on it stays live (see "Poll screen picture") |
| Poll projector | A small grey projector on a bracket high on the corridor's left wall; red LED, glowing vent and lens while it runs; a pale beam to the screen | SVG polygons `.pj-body` and the beam `.pj-beam` (`buildProjector`) | `?pollscreen=0` | Model projector and bracket as a small layer with an "on" light layer; the beam as an additive layer |
| "Bridge out" roadworks board (L30) | A message board on two legs on the far sidewalk: amber dot text BRIDGE OUT; every 10 min BRIDGE REBUILT (green), then BURNED AGAIN (flicker); two blinking beacons, an amber glow on the pavement | `.rwboard` with `.leg`, `.panel`, a `<canvas>` of dots (`textCols`), `.beacon`, `.pool` | `?bridge=0` | Model board, legs, beacons and the light on the pavement. The text has three states: live dots on the rendered panel, or three baked states; the blink as an on/off layer |
| Far skyline (L3) | Dark tower blocks with a few warm windows across the black top-left corner | inline SVG rects in `#skyline` (script block "premiere-night sky (L3)") | `?sky=0` | Static: model or paint the skyline into the background art |
| Dear Leader placeholder portrait (L38) | A small gold-framed portrait with the WEOW emote and a plate DEAR LEADER; only seen when the rendered poster pack is missing | `.dlp` div with `SB.emoteEl('WEOW')`; removed when `out10l` loads (`mergeLeader`) | `?leaderart=0` shows it; `?leader=0` hides poster and placeholder | Done already: the rendered pack `out10l` replaces it. Fallback only |
| Gnome (L40) | A small gnome on the lobby floor at one of several spots; it changes spot during a close-up or after 5 min of the wide shot | the NiceMeMe emote (`SB.emoteEl`, `gnomeEmote`) with a CSS shadow; a CSS-shape gnome (`.gnome i`) until the emote list is in. `GNOME_SPOTS`, `stepGnome` | `?gnome=0` | One gnome sprite with a contact shadow (per spot, if the light should match); the page keeps picking the spot |
| Wet-floor sign (L29) | A yellow A-frame sign with "!" on the lobby floor for 90 s after five chatters came in from the rain within 40 s | `.wetsign` div, a `clip-path` trapezoid (`stepLobbyLife`) | `?lobbylife=0` | One sign sprite with shadow at its fixed spot (u 10.2, v 6.4); the page fades it in and out |
| Nothing-burger cloche (L26) | Every 4 min a snack clerk lifts a silver dome off an empty plate; "nothing." floats up | `.cloche` with `.plate` and `.dome` (CSS, Web Animation; `nothingBurger`) | `?lobbylife=0` | Plate and dome as a short lift sprite sheet on the counter; the page triggers it |
| Buddy plush (claw machine prize) | A small blue blob with eyes, carried by a claw machine winner | `.buddy` CSS shape (`clawTurn`) | `?props=0` (the whole props pack) | An item sprite like the rendered popcorn and soda (`items` in the manifest) |
| Canvasser and clipboard (L32) | Every 9 min Buddy with a clipboard and an umbrella knocks at three shop doors | emote figure (`dggL`; `stepCanvasser`) with a CSS clipboard `.clip`; the umbrella is the rendered sprite | `?canvass=0` (`?canvass=now` test) | The clipboard as an item sprite. The figure is an emote by design |
| Shop door light (L32) | A warm slice of light where the greengrocer's and the noodle shop's door open for the canvasser | two `.doorlight` divs in `#lifefx` (`DOORLIGHTS`) | `?canvass=0` | Render the open-door state (door and light spill) of the two shops as overlays; the page shows them on cue |
| Aristortle (L21) | Every 10 min a small turtle named Aristortle crawls across the lobby | the PepoTurtle emote as a walker with a name (`sendTurtle`) | `?lobbylife=0` | Walk sprite sheets like the cat's, if a real prop is wanted |
| Jannies (mop penguin) | When a DGG mod chats, a penguin with mop and bucket wearing their name mops the lobby | the cpMOP emote picture `assets/cpMOP.webp` as `<img class="em">` (`addJanny`, `initMopper`) | `?janitor=always`, `?janitor=3d`, `?janidle=` | A rendered janitor already exists (`?janitor=3d`); the owner picked the emote (02 Nov 2026) |
| Staff (cashiers, snack clerks, usher) | Emotes behind the counters and at the gate | emote figures (`placeStaff`, `Cinema.defaultEmote('roxy-<role>')`); their caps are rendered item sprites | none | Emotes by design; rendered staff would be a new art job |
| Pigeons (L14) | Four small grey pigeons on the top edges of the two rooftop billboards; they fly up when a bus stops | `.pigeon` CSS shapes, Web Animation (`stepStreet2`) | `?street2=0` | A perched sprite and a fly-up sheet. A few pixels in size: low priority |
| Dog in the window (L19) | A dark head with two ears at the sill of the blue apartment window; it lifts while a bus is near | `.wdog` CSS shapes in `#lifefx` | `?street2=0` | Two small window overlays (head down, head up) |
| Snarkers (L31) | Two heads with binocular glints in the dark window above the blue one; they duck for 15 s of every 50 | `.snark` CSS shapes in `#lifefx` (script block "neighborhood life (L9)") | `?snark=0` (also off with `?life=0`) | Two window overlays (up, ducked) and a glint layer |
| Newspaper (L15) | In gusts a sheet of paper tumbles down the sidewalk | `.paper` div, Web Animation (`stepStreet2`) | `?street2=0` | A tumbling sheet sprite loop; the path stays with the page |
| Siren light bar (L17) | On a WEEWOO or ALARMA combo a sedan speeds past with flashing red and blue blocks on its roof | `.sirenbar` (two glowing `<i>` blocks) pinned to a rendered sedan (`callSiren`, `stepSirens`) | `?chatfx=0` | A police variant of the sedan sprites: light bar and red/blue light frames on the road |
| Marquee board text (L47) | Two lines on the street marquee: NOW SHOWING and the film / SCREEN 1 and the rating; a stock one-liner in the last 12 s of every minute | `.mqtext` bands with `.mq1`, `.mq2` (`buildMarqueeText`, `setMarqueeText`, `MQ_LINES`); the board in `out10m` is rendered blank on purpose | `?marquee1=`, `?marquee2=`, `?mqlines=0`, `?marquee=0`; panel "Marquee line 1/2" | Stays live (film title). Possible: rendered letter tiles used as the font, lit like the board |
| LED door signs | Film title (amber) and rating and head count (red) in dots above each screen door; long titles scroll | one `canvas.led` per sign (`makeLed`, `stepLeds`, `FONT`); housings and unlit dots are rendered (`led_signs`) | none (`?ledbmp=0` is technical) | Stays live. Nothing left to model |
| Film posters by the doors | The film's real poster in each rendered frame beside the screen doors | `.poster` with an `<img>` from the dinkdonk.mov data (`applyRooms`), mapped onto `poster_frames` | none | Stays live (changes with the films). Frames and bulbs are rendered; a rendered glass or shade overlay is possible |
| Poll screen picture | The projected DinkDonk poll: logo, movie cards with posters, countdown, results; grain, flicker and scratches over it | `.pscr-img` HTML (`renderPollScreen`) and `.pscr-film` overlays (`.pscr-grain`, `.pscr-dust`, `.pscr-tint`, `.pscr-vig`, `.pscr-scratch`) | `?pollscreen=0` | Stays live (poll data) |
| TV picture (L18) | The TV on the back bar: blue news screen with a bell, DGG NEWS and a red BREAKING NEWS band that flashes for 8 s | `.tvscr` div (bell emoji and text) in the pack's `screen_quad` (`setupProps`, `breakingNews`, `stepProps`); TV body and glow are rendered (`out10p`) | `?props=0` | Two or three rendered screen pictures (idle, breaking A/B) swapped by the page; or stays live |
| Apartment windows (L9) | Six windows across the street switch on and off over minutes | `.lwin` gradient overlays in `#lifefx` (`wins`) | `?life=0`; `?lifetest=1` shows all | Render the lit and the dark variant of each window as overlays from the scene |
| TV flicker in the blue window (L9) | The blue apartment window flickers like a TV | `.ltv` div in `#skyfx` | `?life=0` | A short rendered flicker loop, or keep |
| Neon dips (L9) | The pink neon and the VIDEO RENTAL sign go dark for an instant every 53 s / 97 s | `.ldip` dark patches over the tubes | `?life=0` | Render a "tube off" variant of both signs, with their light on wall and street; the page flashes it |
| Searchlights (L3) | Two pale beams sweeping the sky from the cinema roof, a glow at the foot of each | `.sbeam.sbA`, `.sbeam.sbB` and two radial-gradient divs in `#skyfx` | `?sky=0` | Model two searchlight units on the roof (the page draws no housing). The beam as a rendered sweep loop, or keep the CSS beam |
| Aircraft warning light (L3) | A red dot blinking on the skyline | `.skyred` in `#skyfx` | `?sky=0` | Bake the lamp with the skyline; the blink as a tiny on/off layer |
| City haze (L3) | A warm orange glow along the top edge | gradient div in `#skyfx` | `?sky=0` | Belongs in the background art or the light loop |
| Purple light on the sidewalk (L4) | The lobby's purple light spilling out of the glass front onto the wet sidewalk | skewed gradient div in `#wetfx` | `?wet=0` | A light effect: bake into the base art and the light loop |
| Puddle light streaks (L4) | Four long colored reflections under the street lamp, the video store, the pink neon and the corner shop, shimmering slowly | `.wstreak` divs in `#wetfx` | `?wet=0` | Bake as wet reflections in the render; the shimmer as an additive loop |
| Steam (L9) | Puffs rising from two roof vents, the noodle shop and two corner roofs | 15 `.puff` divs in `#lifefx` | `?life=0` | Additive steam loop sheets at the five spots |
| Door glow | A warm wedge of light out of a screen door when someone goes in | `.doorglow` div, Web Animation (`doorGlow`) | none | Additive light frames with the rendered door animations (`door_anims`) |
| Arcade flash | A blue flash at the arcade cabinet's screen when a game ends | `.doorglow.arcadeglow` (`arcadeFlash`) | none | Could be part of the rendered arcade screen loops |
| Roof bell rings (L16) | On a DinkDonk combo two gold rings spread from the bell-ringer in the roof sign; DINK / DONK float up | `.bellring` divs in `#fx` (`ringBell`) plus floating text | `?chatfx=0` | The bell-ringer is in the rendered sign; a swing sheet for the bell could replace the rings |
| Puddle splash (L11) | A passing car throws ten drops in arcs at the curb, with a ring on the sidewalk | `.drop` divs and a `.splash` ring (`puddleSplash`) | `?street2=0` | A splash sprite sheet like the rendered `tyre_spray` |
| Step splash rings | A small pale ring at the feet of a walker in the rain or stepping out of the bus or taxi | `.splash` div (`splash`) | none | A small ring sheet; many a minute, so keep it cheap |
| Umbrellas in the wind (L12) | In gusts every umbrella leans; now and then one flips inside out for 1.3 s | CSS transforms on the rendered umbrella sprites (`#world.gust`, `.blown`) | `?street2=0` | A rendered inside-out frame per umbrella color |
| Wet reflections under chatters (L7) | A flipped, faded copy of the emote under a chatter on the wet street | `.refl` with a copy of the emote (block "chatters take the scene's light") | `?refl=0` | Stays live (follows the emote) |
| Scene light on chatters (L6) | Emotes tinted by where they stand: night blue, sodium warm, purple at the glass, warm under the marquee, cooler in the corridor | SVG color-matrix filters picked by `data-lt` (`LOOKS`, `lookAt`, `stepLight`), read from `out10mist/light.png` | `?light=0` | Stays live; nothing to model |
| Golden aura (L50, L27) | A pulsing gold halo with four sparkles behind the golden WEOW or glorp, and a gold name | `.aura` div with `<i>` sparkles (`gild`); the gold face is a cell of DGG's own emote sheet | `?gold=`, `?goldtest=1`, `?goldbus=0` | Stays live; a rendered sparkle loop is possible |
| Floating marks | Short text or an emoji rising from a chatter or a spot: o7, +1 POPCORN, NEW HIGH SCORE, GAME OVER, knock knock, nothing., DRAW!, WON A BUDDY!, BREAKING NEWS, music notes, hey!!, WAIT!!, BONK, janny on duty, GOLDEN WEOW, hearts over the cat, the usher's arrows | `.fl` divs in `#fx` (`floatText`, `floatAt`) | with their feature (`?chatfx=0`, `?lobbylife=0`, `?street2=0`, `?props=0` ...) | Stays live. The emoji could become small rendered icons |
| Restroom stall hearts (queue 57) | Heart emoji floating up out of a stall while two chatters share it | `.heart` emoji divs in `#fx` (`heartPuff`, `stepGag`) | none found | Stays live; an icon sprite is possible |

## Auditorium

All in `auditorium-qa.html` (and `auditorium.html`). A-numbers are the life ideas in `roxy3d/memes/LIFE-IDEAS.md`.

| Item | What the viewer sees | How it is drawn now | Switch | For a Blender version |
|---|---|---|---|---|
| Aisle step lights (A2) | Amber strips on the nosing of every stair tread, with the lights down | `.alamp.nose` divs (`aisleStrip`, `placeAisleLights`), placed from the layout JSON | `?aisle=0` | Emissive strips, with their glow on the treads, in the dim art set. Static: can be baked |
| Row-end lamps (A2) | A small amber lamp at the aisle end of each raised row, with the lights down | `.alamp.dot` divs (`placeAisleLights`) | `?aisle=0` | Small fixtures on the row ends in the lit and the dim art |
| Stage cove strip (A2) | A cool blue strip along the stage edge, with the lights down | `.alamp.cove` (`aisleStrip`) | `?aisle=0` | An emissive cove in the dim art |
| EXIT sign halos (A2) | A red and a green glow round the two EXIT signs, with the lights down | `.alamp.halo` divs at fixed stage px (measured on draft 13) | `?aisle=0` | The signs are rendered; bake their glow into the dim art |
| Litter (queue 60) | Popcorn kernels, tipped popcorn boxes, soda cups, wrappers and napkins pile up on the floor over time (up to 140 pieces) | `img.litter` from inline SVG designs turned into bitmaps (`litterImage`, `rasterLitter`, `stepLitter`) | panel Litter toggle; `?littermin=` (preview) | Render each kind (five kinds, a few variants) as small sprites, lit and dark. Where and when they appear stays live |
| Phones in the dark | A tiny glowing phone in front of a seated chatter who keeps chatting in the dark | `.phone` CSS rectangle with a glow (`noteMessage`, `placeItem`) | `?phones=`, `?chatty=` | An item sprite with its glow; the page switches it on and off |
| Jannies and clean-up crew (A17) | Mop penguins: mods' jannies mop the front floor; two sweep the rows once everyone has left | the cpMOP emote picture `assets/cpMOP.webp` (`addJanny`, `crewWalker` with `mop`) | `?janidle=`; `?hall=0` (the crew) | An emote by the owner's choice. A rendered one would need sheets for this camera |
| Usher, vendor, conductor (A16, A18) | The usher on patrol in the dark, a vendor during seating, the conductor at the start of the film | emote figures (`addUsher`, `sendVendor`, `sendConductor`; the conductor is the DinkDonk emote); usher and conductor wear the rendered `cap_usher`; the vendor carries nothing | `?hall=0` (vendor, conductor); `?kick=` (test) | A vendor tray as an item sprite; rendered staff would be a new art job |
| Pre-show slides | On the screen before the film: "Up next" (title, poster), "Now loading" (film, rating, percent bar, time left), "In the audience" (rolling names) | `#preshow` with `.ps-slide` HTML, mapped onto the screen's corners | panel screen picker; `?slidefade=seq`; `?qb=`, `?qbname=` (test) | Stays live (text and data). A rendered slide background could sit under the text |
| Loading-slide emotes | A meme emote with a caption, chat's top emote riding the progress bar, chat's emotes floating up the screen's edges | emote pictures through `emoteFit` / `SB.emoteEl` (`MEMES`, `nextMeme`, `ride`, `popEmote`) | none | Stays live (emotes) |
| Film screen fill | The green (or, linked to OBS, black) shape where OBS pins the film | SVG `#screenq` / `#screenpoly` (`applyPhase`) | `?screen=green`, `?green=` | Stays live by nature: the film goes there |
| Screen glow (queue 58) | A soft bloom round the screen in the film's color | `#glowbloom` box-shadow (`stepGlow`) | `?glow=<hex>`, `?glow=cycle` (test) | Stays live (the color follows the film) |
| Screen light spill (queue 58) | The film's light on the floor and the front rows | SVG ellipse `#glowspill` / `#spill` (`placeSpill`, `stepGlow`) | same as the glow | Stays live. A rendered "screen light" pass of the room, tinted by the page, would look more real than the ellipse |
| Projector beam (A3) | A soft beam from a port high in the back wall to the screen, tinted by the film | SVG `#pbeam`: three hulls in `#pbeams`, the port glow `#pportc` (`placeBeam`) | `?beam=0` | Model the projection port in the back wall (the page picks the spot itself). The beam as a rendered volumetric layer; the tint stays live |
| Beam dust (A3) | 48 motes drifting inside the beam | `#pdust i` with Web Animations (`placeBeam`) | `?beam=0` | A rendered dust loop, or keep |
| Usher's flashlight | A cone of light from the usher onto a row or a talker, with a bright lens dot | SVG `.beam` in `#names` (`updateBeam`) | none | Stays live (it aims) |
| Row light (A7) | With the lights down the front rows are brighter than the back rows | brightness per row in `--rb` on the emotes (`rowLight`) | `?rowlight=0` | Stays live; nothing to model |
| Dozing z's | "z z Z" drifting up from a sleeping chatter | `.zz` spans in `#names` (`doze`) | `?doze=` (test) | Stays live |
| Floating marks | Text or an emoji rising from a chatter: raised hands, clapping and shocked faces on combos, shh!, out, banned, muted, kicked, popcorn, popcorn! soda!, last call!, roll it!, DINK DONK!, sorry... sorry..., janny on duty, GOLDEN WEOW | `.fl` divs in `#names` (`floatAt`) | `?react=0`, `?hall=0` | Stays live. The emoji could become small rendered icons |
| Golden aura (L50) | A pulsing gold halo with sparkles behind the golden WEOW or glorp, and a gold name | `.aura` div (`gild`) | `?gold=`, `?goldtest=1` | Stays live |

## Already rendered in Blender (for reference)

These come from render packs and are not on the list above.

Lobby:
- `roxy3d/out10`: the background and every piece of scenery walkers pass behind (partitions, box office, snack bar,
  podium, bench, arcade cabinet, standees, palm, street lamp, bus stop, glass front, entrance, restroom with stalls,
  queue ropes, the corridor's bench, fountain, bin and extinguisher); the baked signs (TICKETS, showtime prices,
  SNACK BAR, gate, RESTROOM, the DINK DONK CINEMAS roof sign with the bell-ringer, the WCAT and EatFresh billboards).
- The light loop and the foreground rain videos; the small loops (popcorn popping, menu boards, soda logo, the
  TICKETS letter flicker, arcade screens, poster bulb chases, wet highlights).
- LED sign housings with unlit dots, poster frames, the restroom's red/green occupancy light, door animations
  (screens, restroom, stalls).
- Vehicles (bus, taxi, two sedans) with lights, roof rain, spray and wake; tyre spray.
- Umbrellas (open, folding, with rain; four colors), carried items (popcorn, soda, ticket, stub), staff caps, wet
  footprints.
- The lobby cat (sprite sheets) and the 3D janitor (off by default, `?janitor=3d`).
- `roxy3d/out10m`: the street marquee (body, shadow, light, bulb chase). Its boards are blank; the text is the page's.
- `roxy3d/out10l`: the "Dear Leader" poster with frame, picture light and shadows.
- `roxy3d/out10p`: claw machine (body, header lights), jukebox (body, two neon tubes), TV (body, glow). The picture
  on the TV is the page's.
- Rain and mist: the rain inside the loop videos is rendered. The extra rain (`#rain2`, with the headlight cones of
  L8), the splash mist (`#mist`) and the fallback rain (`#rain`) are page shaders and canvas drawing: effects, not
  props. They read the rendered surface passes in `roxy3d/out10mist`.
- The fly-through to the auditorium (`shared/transition.js`) plays a rendered video with the chatters drawn into it.

Auditorium:
- `roxy3d/qa11` draft 14: the hall (seats, stairs, screen, EXIT signs, the render's own step and stage lights), its
  depth slices, the lights-down twins, the entrance door animation and the entrance corridor (posters, sconces,
  runner). A few popcorn groups on the floor are baked into the render.
- Popcorn, soda and the usher's cap are the lobby's rendered item sprites (`roxy3d/out10`).

## For the next Blender re-render (owner, 11 Nov 2026)

Things the owner wants changed that only a re-render of the lobby art can fix. Together with the page-drawn items
above ("web graphics to Blender"), this is the list for the next lobby render job (brief, blockout where the layout
changes, one draft, full render only on the owner's word).

- **Reflections everywhere it is wet.** The street has rich baked reflections; the outside walls, roofs and other
  wet surfaces (sidewalks by the walls, roof slabs, ledges, the alley) have almost none, so the scene looks uneven.
  Give them the same wet, reflective look as the street.
- **Remove the "ABSOLUTE CINEMA" lettering** on the brick wall right of the cinema (above the EXIT door and the
  DELIVERIES gate): it makes no sense there.
- **The cargo bay (DELIVERIES roller gate) is blocked by a building in front of it.** Free its approach (move the
  gate or the building), so a delivery could actually reach it. Layout change: blockout first.
- **Walls' top faces in the occluder pictures.** The wall occluders hold only the face; the top is see-through, so
  emotes behind a wall show over its top. The page now covers the thin walls' tops with a piece of the background
  (`walltops`, 11 Nov), but not the snack bar's back wall (`partition_right`, its footprint holds signs and boards).
  A re-render with the tops in the occluders fixes all of them.
- **Claw machine behind the glass** (props pack `out10p`, NOTES-94): its darkest parts come out a little too light
  under the page's two glass layers, and its light pieces sit above the glass (a chatter at the machine gets its teal
  line across them). Fix when the glass is re-rendered.

## Notes

Placement conflicts with the render:
- The "J6 Video" poster hangs on the render's left frame, which is half behind the poll projector, and the restroom
  wall stands in front of its lower left corner. The text sits in the lower half for that reason and the corner is
  cut along the wall's outline (`clip-path`). A Blender version should decide first whether this frame is the right
  place (layout change: blockout first).
- The walls' top faces are not part of the occluder pictures (only the wall's face is). Anything behind a wall can
  show over its top; that is why the poster needed the cut, and why an emote can look as if it stood in a wall. The
  clean fix is a re-render of the occluders with their tops (owner's call).
- From this camera the street marquee's roof hides the lobby floor between the box office and the entrance. The
  turtle's route, the wet-floor sign and three gnome spots were moved off it; a new floor prop there would not be seen.
- The poll screen hangs in front of the cardboard standee left of screen 1 and covers the NEXT SHOWING board while it
  is down; the standee's cut-out is hidden for that time.
- The props pack takes the cat's and the gnome's spots next to the claw machine and the jukebox (`mergeProps`).
- The dog and the TV flicker share the blue apartment window; the snarkers are in the window above it.

Things to know before baking:
- Most street and wall items are placed in stage pixels measured on the current render (apartment windows, neon
  dips, pigeons, dog, snarkers, shop door lights, the two posters, the slop lines, the bell-ringer's spot, the EXIT
  halos "of draft 13"). A re-render with another camera or layout means measuring them again.
- The slop lines are cut into one piece per wall slice so the clerks still sort in front of them. A baked board needs
  the same slices.
- The page drawings are flat: no shading from the scene's lights. They hold at the wide shot and look plainer than the
  art around them at a 2-4x zoom (noted for the board, the heads, the door light, the pigeons and the dog).
- Walkers walk through the gnome and the wet-floor sign; neither blocks a route.
- The auditorium render already has its own step lights and stage lights; the page's aisle lights are drawn on top.

Fallback drawings (normally not visible; only with `?art=flat` or when a pack does not load):
- Lobby: the flat canvas lobby (`#bg`, `buildProps`: counters, glass, bus shelter, street lamp, a ROXY blade sign),
  the title boxes `.sign` (hidden since the LED signs), the hanging signs TICKETS, SNACK BAR menu and gate arrows
  (`flatSigns`), the restroom sign `.wcsign`, and CSS versions of the umbrella (`.umb`), staff cap (`.hat`), popcorn
  (`.carry`), ticket and stub (`.ticket`, `.stub`) and wet footprint (`.wetprint`).
- Auditorium: without dim art the room is darkened with one flat brightness filter (`.lights-flat`).

Changed on 11 Nov 2026 (in the QA copies and, since about 16:00, in the live pages): the gnome is the NiceMeMe emote
(before: a CSS-shape gnome), the J6 poster's corner is cut and its stickers sit 8 px further right, the second NACHOS
line is NOTHINGBURGERS $3.50 (before: DAY 1 HATERS EAT FREE), and the searchlights sweep faster and wider.

Not listed on purpose: the chatters themselves, their names and speech bubbles, the director's camera moves.
