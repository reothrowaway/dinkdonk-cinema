# Owner's queued changes (do NOT start yet)

Collected 02 Nov 2026 ~10:15, after the fresh GPT-6 Astra (xhigh) feedback (reviews/fresh-xhigh-feedback.md).
The owner will look at the final out8b pass first and then add more changes; do all of these together
with those, not before.

1. **Billboard panel better integrated** (fresh feedback #1, owner agrees): today it reads as a heavy,
   layered frame pasted on, crowding the Screen 3/4 signs. Make it part of the venue/tower (slimmer, physical
   billboard construction, maybe a cinema-style label like "Coming Attractions"). Open question for the owner
   when we do it: the green aperture x1296 y40 576x324 is used by OBS - keep it exactly, or may it move/resize?
2. **Movie signs in the walls' isometric perspective** (owner): the five screen title signs (and their DOM
   text) are flat, screen-aligned rectangles; they should sit on the wall planes like the posters do (skewed
   to the u = 0 / v = 0 walls). Needs Codex (rendered marquee boxes) + page (text transformed onto the plane).
3. **Remove the top-left HUD text** (owner): no "INTERMISSION"/standby wording, no schedule bar (clock +
   next movie night). Fresh feedback #3 (return message) and #4 (schedule bar) are rejected. Check with the
   owner whether the "The Roxy" neon logo goes too.
4. **Gate sign as a physical directional sign** (fresh feedback #5, owner agrees): the "◀ 1-2 · 3-5 ▶" box
   looks like a UI pagination control; make it a real cinema wayfinding sign with distinct left/right groups
   (Codex re-renders the baked sign).
5. **More restrained ambient animation** (fresh feedback #6, owner agrees): gentle puddle ripples, occasional
   single-tube neon flicker, popcorn machines, janitor idle (most exist - extend and make them more visible),
   rain softer around text; never everything moving at once.

## Round 2 feedback (02 Nov ~11:00) - for the NEXT pass (after out9 lands), do not start yet
6. **Speech only in conversations.** Chatters no longer spawn with a bubble. They come in and do their thing
   (tickets, popcorn); then, instead of going straight to the screen, they hang around, walk up to another
   chatter (or a group of 3+) and chat - bubbles appear only then, for everyone in that conversation.
7. **Only three screens, all on the right.** Scrap screens 1-2 on the left (they would sit in the neighbour's
   building). Keep screens 3-5 (right wing) -> they become screens 1-3. The background buildings top-right are
   replaced by the exterior of those three auditoriums (their roofs/walls as a continuation of the cinema,
   not fully built).
8. **Left wing becomes the restroom.** The left side keeps only the restroom: its own rectangular room
   (reaching to where the ticket area ends), built in 3D and cut away like the lobby: toilet stalls, sinks,
   mirrors, etc. Walkers use it for real (stall doors).
   Owner's answers (11:05): messages sent while not in a conversation are SAVED and said at the next chat (a
   new message makes them go find a group); restroom = the left wing strip from the back corner to where the
   ticket counter ends (3-4 stalls, sinks + mirrors, hand dryer), the front-left corner stays lobby; the three
   screens show the last 3 films from dinkdonk.mov, newest on screen 1. Items 1-5 above were already sent to
   Codex in BRIEF-11-pass9 (out9) - re-check them in out9.
   Item 7 detail (owner, 11:30, with screenshot): right now the three doors look like "portal doors" with an
   apartment block directly behind them. Behind the right-wing wall there must be the three big auditorium
   boxes themselves (taller than the corridor wall, roofs with HVAC/projection booths, plain exterior walls),
   so the doors obviously lead into large halls. The apartment/tower block behind goes; the rooftop billboard
   (ad surface) moves onto the auditorium roof or another spot that stays clear of the walkers.

## Round 3 feedback (02 Nov ~12:15, after seeing out9) - next pass
9. Ticket queue marked with stanchions + red velvet ropes (the page queue slots follow the rope lane).
10. Snack counter populated: cash registers, napkin/straw dispensers, cup stacks, candy display case, tip jar,
    nacho cheese pump etc. - looks alive.
11. Doors open into a dark space (black vestibule / curtain), not a brick wall.
12. Corridors less empty: cardboard standees of other films, etc. (Claude to suggest a set).
13. Janitor = a DGG emote (inside joke) instead of the 3D janitor - owner pastes the emote name/image.
14. The cinema is called DINK DONK (as in dinkdonk.mov), with a neon of the DinkDonk emote. Placement open:
    over the entrance would block the view into the lobby - Claude to propose options.
15. The front wall beside the bus stop (next to the restroom, front of the left wing) is still the low
    half-height wall - make it full height like the rest of the front.
16. WORKFLOW: Codex does a quick DRAFT first (fast still render, no loops/sprites) for owner feedback, and only
    then the full render - shorter time between feedback rounds.
   Owner's answers (12:20): DINK DONK = big rooftop neon on the new auditorium block ("DINK DONK" letters + the
   DinkDonk emote in tubes), the entrance blade gets a small DinkDonk emote neon; d.gg stays as a small nod
   elsewhere (bus line "d.gg transit", a shop or street sign); the left-wing front wall = solid full-height
   wall (brick/plaster, maybe a small high window) - the restroom inside is mostly hidden from the camera.
   Corridor ideas from Claude (to confirm in the draft): cardboard standees of other films, a "coming soon"
   lightbox, a bench, a drinking fountain, an exit sign, a fire extinguisher, carpet runners, a trash can.
   Item 13 detail (12:25): the janitor emote is 7TV "cpMOP" (Club Penguin penguin mopping, animated,
   https://cdn.7tv.app/emote/01HVYG5N680004JB4FF7766GF8/4x.webp; local copy roxy3d/ref/janitor-emote/4x.webp).
   Page-side: the janitor NPC becomes this emote (same spots/routes, mops at each spot, waddles between them,
   mirrored by direction, contact shadow) - no Codex render needed; the 3D janitor sheets stay unused.

## Later (owner, 02 Nov ~12:55, after draft 2)
17. The big back-building roof is liked as is. Later: add decay/wear to it and the rain effects on it
    (puddle ripples, splashes, run-off) - not in pass 10.

## Round 4 feedback on draft 2 (02 Nov ~13:15) - collecting, do not start yet
18. Top-left neighbour: the low annex between the brick apartment block and the restroom covers the apartment
    block's windows - makes no sense. Instead the apartment block itself extends all the way to the restroom
    wall (one continuous building), and that part has NO windows facing the cinema (a blank party wall).
19. The corridor walls (the corner junction by the WC / 1-3 signs and the back walls) look empty - dress them:
    framed one-sheets of classic/fictional films, a "NOW SHOWING / COMING SOON" board, a wall clock, fire alarm
    + extinguisher cabinet, a framed cinema-history photo or two, a vending machine or payphone in the corner,
    more sconces / a neon accent - things attached to the walls, without blocking walker routes.
20. Roofs (the big theatre roof and the other roofs): more decay and imperfection now, not later - stains,
    patched felt, rust streaks, pooled water, debris, a tarp, a bent vent, moss/grime in corners, uneven
    parapet caps. Small charming flaws in the animation too: e.g. the AC fans spin in the loop, but one of
    them is dead (not spinning), another one wobbles; one sign tube flickers. (Supersedes item 17's "later".)
21. (owner sent 3 crops, no text - Claude's reading, to confirm) Surface details look fake/drawn:
    a) roof puddles are flat dark ovals (stickers) - make irregular, soft-edged, reflective (sky/neon), shallow;
    b) the thin ellipse rings on the street/sidewalk read as drawn outlines, not ripples - remove the static
       rings; ripples only as faint animated rings in the loop;
    c) road cracks are black scribble lines - make them subtle sealed asphalt cracks/tar snakes, lower contrast,
       broken, catching a little wet light.
    Owner confirmed (13:25): "most puddles and lines don't look natural, they look artificial" - rework all
    puddles, rings and crack lines across the scene (roofs, street, sidewalk), not just the cropped spots.
22. The back alley (right of the lobby, between the cinema and RECORDS & REPAIR / the apartments): make it a
    real back alley - dumpster(s), trash bags, a recycling bin, the cinema's emergency exit door (with a lit
    EXIT sign, maybe propped open with a brick), loading door, pallets, crates, a puddle with neon reflection,
    steam from a vent, graffiti/tags, a fire escape. Floor: not neat tiles - cracked, patched, uneven asphalt/
    concrete with potholes and grime, wet. (Owner: more things will come here later.)
23. The short white dashes all over the front glass are the "static rain traces" Codex baked into the panes in
    draft 1/2 - they read as random white rectangles. Remove them from the still; water on the glass only comes
    from the animated glass-water overlays (soft runnels/beads), and those must not look like dashes either.
24. Living windows on EVERY apartment/neighbour building (not just the video-rental block): lights switching
    on/off, a flickering bulb, TV glow changing colour, a silhouette walking past behind the curtain, a curtain
    moving, a cat on a sill, someone at a window smoking (ember), a party window with coloured light...
    Plan: these must not repeat every 6 s, so Codex delivers per-window data (`windows: [{quad_px, z_index,
    lit, building}]` for every visible window) + a small kit of additive/straight-alpha sprite sheets for each
    event type in window perspective; the page schedules random events per window over minutes (a few at a
    time, never everywhere at once), lights change state and stay changed.
25. Far top-left (left of the video-rental block, the cropped "REPAIR" building at the frame edge): doesn't make
    sense as a cut-off building - replace it with a small cafe: shopfront facing the street, a lit sign, and a
    little outdoor seating area on the sidewalk (tables, chairs, closed or open umbrellas/parasols, a menu
    A-board, string lights), wet from the rain, keeping the walker spawn lane (u ~ -6, v 9.78-10.05) clear.
26. The end of the back alley (right of screen 3, below the theatre building) is a flat black wall/void. It must be
    the cinema's own exterior side/back wall (same masonry as the theatre building), lit by the alley, with
    graffiti/tags, drainpipe, the emergency exit (item 22), a grimy service light - no black surfaces.
27. Wall tops / cutaway: the purple band running along the top of the corridor walls (above the doors, under
    the theatre building's brick) is ambiguous. Make it read like a Sims cutaway: the walls are cut, and the cut
    shows the wall's cross-section - a clean cap showing the wall's thickness (plaster/brick core, the inner
    purple finish on the inside face, the outer brick/stucco on the outside), consistently on every cut wall
    (corridor walls, restroom walls, partitions, the left wing), so it's obvious we look into the building.

## Memes (02 Nov ~13:40)
28. Owner approved the whole Top 12 of memes/SHORTLIST.md (alley graffiti, inside posters/boards, billboard,
    shelter, bus side, poster wall, shop sign). Not implemented yet.

## Round 5 feedback on draft 3 (02 Nov ~13:50)
29. Top-left apartment block roof (the part extended to the restroom wall): it reads as an extra piece added
    on - the seam line between old and new roof is visible. Make it one continuous roof (same felt, no join
    line, one parapet all round). The rooftop kit (AC units, vents, skylights, hatch, pipes) is bunched
    together - spread it out across the whole roof in a believable layout.
30. WORKFLOW: drafts must show the real wet look (reflections, puddles, water on roofs/street) - render drafts as
    one final-quality frame with the wet materials and one composited weather frame, as long as that stays
    a few minutes (not ~30 min per frame).
    Owner (13:55): resolution doesn't matter for drafts - 720p is fine if it saves time. Draft standard from now
    on: ONE 1280x720 frame at final quality (final samples, wet materials, reflections) + one composited weather
    frame (rain, splashes, puddle reflections) = the real look, target ~1-2 min per draft.
31. The street reflection of the entrance blade sign doesn't match the sign: the big green smear on the road is
    left over from the old d.gg neon colours; the reflection must come from the current DinkDonk blade (yellow hood,
    green face, gold bell, "DD") - colours and shape - and likewise every reflection must match its real source
    (rooftop DINK DONK neon, cafe, shops). The new 720p final-quality drafts with one weather frame exist to check
    exactly this: rain, splashes on the ground, puddle reflections, wet roofs.

## Round 6 feedback on draft 4 (02 Nov ~14:35)
32. Reflections are real (Cycles ray-traced from the current scene, no proxy lights) but read as fake: under the
    DD blade the wet asphalt acts as a near-perfect mirror, so the reflection is a crisp copy of the emote ("looks
    like the image of the emote"); elsewhere small lights become round red/green blobs (isotropic roughness).
    Fix in the material, not with fakes: rough asphalt base with varied/micro roughness and grain, a thin water
    film of varying thickness on top (true puddles only in low spots, sharp-ish edges), fine rain-impact
    micro-ripple normals everywhere, so neon reflections stretch into long broken vertical streaks with roughly
    the source colour/shape, like a real rainy street (also sidewalk and roofs).
33. KEEP the ray-traced periodic ripples (owner loved the first 16 frames). Scene-wide water audit: draft 4 put
    ripples only on materials matched by name (puddle water, asphalt, paving, roof felt, wet stone/concrete) -
    everything else stayed dry-looking (e.g. the bus-shelter roof, AC unit tops). Every upward-facing outdoor
    surface gets the right rain response by material: water/puddles -> ripple rings; roof felt/asphalt/paving ->
    wet sheen + rings in puddles; metal (AC tops, shelter roof, dumpster lids, sign boxes, railings, fire
    escapes) -> beading, small splash crowns, drips falling off edges; glass (skylights, shelter roof) -> beads
    and runnels; fabric (awnings, cafe parasols) -> soaked darker look, drips off the hems; ledges/sills/parapet
    caps -> sheen, splashes, run-off streaks down the walls. Codex delivers a coverage map (which surfaces get
    which response) so nothing is missed.
34. Owner (14:50): the leftover noise in the ripple clip may actually read as tiny raindrops hitting the
    water ("rain drops come in all sizes; the small ones just make this noise effect"). Plan: keep the render
    itself clean (render noise is random everywhere - walls, dry interiors - and VP9 turns it into blocks), and
    add that effect on purpose: a fine micro-impact layer on WET surfaces only (tiny short-lived specular
    glints/pinpricks of many sizes, density following the rain), so it looks like small drops, stays seamless
    and compresses cleanly. Show it next to the noisy version in a draft so the owner can pick.

## Round 7 feedback on draft 5 (02 Nov ~16:15) - collecting
35. Move the YEE vs PEPE turf-war graffiti from the alley into the RESTROOM: vandalism on the stall partitions,
    stall doors, tiles or mirror - Sharpie/marker scrawl and a bit of scratched etching, the way public restrooms
    get tagged (YEE NEVA LOSE crossed out by PEPE WINS, the tiny dino re-tag), small and messy, readable at a glance
    when zoomed. The alley keeps ABSOLUTE CINEMA on the back wall.
Claude's own notes on draft 5 (to fix in the same round): the bus destination still says "95 ROXY" (make it the
d.gg transit line); the CABGE sign overlaps the NOODLES sign (give the greengrocer its own frontage); the
LOOKALIKE / RE-ELECT posters and the PEPE graffiti are on free-standing boards in the alley - paste/spray them
onto real walls; ripples read as ring outlines in a still - check they stay soft.
36. Rooftop DinkDonk emote neon = classic 2-state neon animation: two separate tube sets that switch on/off
    alternately - state A arm + bell DOWN, state B arm raised with the bell UP (Pepe ringing the bell). The off
    set stays visible as dark unlit glass. In the final it runs as part of the loop (state change ~2-3x/s, or a
    ring rhythm: up-down-up-down-pause); in the draft show both states.
37. New ad with the DGG emote "EatFresh" (ref: roxy3d/ref/eatfresh-emote/EatFresh.png + EatFresh-x12.png: a blue
    chibi character with rosy cheeks biting a sub sandwich): the emote + slogan "EAT OUR FRESH NOTHING BURGERS"
    (or close), 90s fast-food ad style, parody only - no real sandwich-chain logo, name, colours or typeface.
    Placement: a good free ad surface (second billboard, a bus side, the poster wall, a shop window poster).
38. The small DinkDonk emote neon on the entrance blade by the bus stop duplicates the big rooftop one: reimagine
    it as a different DGG meme neon, or remove it. Claude's proposal: the shortlist alternate #25 "Anything
    else?" as a small script neon (owner to confirm).
    Owner (16:25): yes - the entrance blade neon becomes "Anything else?" (small script neon, shortlist #25).
39. Back alley still too clean: really rough pavement (broken, heaved and patched asphalt/concrete, potholes with
    water, crumbling edges, oil stains, weeds in cracks, grime gradients along the walls) and loose litter ON the
    ground - flattened/unfolded soggy cardboard, scattered papers and flyers, a wet newspaper, crushed cups and cans,
    cigarette butts, a takeaway box - not trash bags. Wet and stuck to the ground, catching a bit of light; keep
    the walker/route areas readable.
40. Bus stop too simple: a proper 90s bus shelter - steel frame with scratched/etched glass or perspex side and
    back panels, a curved or flat roof with a lit route header ("95 / d.gg transit"), a bench (slatted or perch
    seat), the ad lightbox (keep the travel ad + PICK ONE call box), a route map/timetable case, a stop pole with
    its sign, a litter bin, maybe some stickers, a bit of graffiti and gum. Riders still step out of the bus at the
    stop and walk off along the sidewalk - keep that path clear; people may sit on the bench (page can use it).
41. Bus route number (owner: "keep a two-digit number related to DGG, you choose"): Claude picked 05 from the
    meme session's candidates (memes/SHORTLIST.md "Bus route number"): "Movie in 5". Destination "05  DINK DONK",
    plates "DGG 05", shelter timetable "Route 05 - every 5 min". Alternatives if the owner prefers: 13, 11.

## Round 8 feedback on draft 6 (02 Nov ~17:05) - collecting
42. Close-ups in drafts: use the same isometric camera, just zoomed (smaller ortho scale centred on the spot) -
    never extra angled "review" cameras (owner noticed the different perspectives).
43. The WCAT billboard (liked) moves from the theatre roof (top right) to the roof of the top-left apartment block,
    as a rooftop billboard facing the other way (northwest-pointing / the other iso axis, readable from this
    camera). Picture = the actual DGG emote "wcat" (ref roxy3d/ref/wcat-emote/wcat.png + wcat-x12.png: a beige cat
    in a dark suit, white shirt, red tie, holding a brown briefcase), painted large in billboard style. Copy is
    about business, e.g. "WCAT & ASSOCIATES - for all your bidness needs" / "let's do bidness." The theatre-roof
    billboard spot becomes free for another ad (EatFresh or a later meme).
    Style (owner, 17:10): the billboard matches the emote's serious-business tone - not mostly white: dark,
    rich ground (deep navy/charcoal or oxblood, maybe a subtle pinstripe or marble), gold serif lettering with a
    slight bevel/foil look, a thin gold rule/frame, small "EST." or "ATTORNEYS & ADVISORS"-style secondary line;
    lit by gooseneck lamps; weathered like everything else.
44. Wayfinding signs at the junction ("WC ◀" and "▶ 1-3" hanging sign) and the restroom sign read as floating.
    Either attach them clearly (flat on a wall, or a projecting blade on a visible bracket/ceiling rod) or drop
    them - owner is fine with not showing them at all.
    Copy (owner, 17:20): the billboard shows ONLY the wcat emote and the slogan "IT'S JUST BUSINESS." - no
    "WCAT & ASSOCIATES", no secondary lines. Same serious style (dark rich ground, gold serif lettering, gold rule).
45. Walls: the cutaway approach is fine (owner keeps the low cuts) - but make cut heights continuous: the
    tickets wall (box-office back, half height) and the restroom walls next to it (cut lower, showing a sink) must
    follow one rule - neighbouring/connected wall runs share the same cut height, with the wall-thickness cap.
46. Theatre doors: classic padded doors (diamond-button upholstered leather/vinyl, brass push and kick plates), no
    lit porthole windows (owner agreed, 17:30).

## Round 9 feedback on draft 7 (02 Nov ~17:55) - collecting
47. Move the EatFresh "nothing burgers" billboard from the theatre roof to the top-left apartment roof, to the
    right of the wcat billboard (same facing, a pair of rooftop billboards side by side); the theatre roof then has
    only the DINK DONK neon (and its kit).

## Ideas (05 Nov)
48. Frame-rate test: show how the whole lobby (and auditorium) would look with everything at 24 fps and at 48 fps -
    walking, hops, vehicles, camera, bubbles, the baked loops (now 24 fps) and the extra rain. Idea only, not started.

## To do later (08 Nov) - owner: "these are all things to do, not right now"
49. Poll zoom follows the panel's Zoom amount: done in lobby-qa.html (fit zoom x amount / 1.85, capped at 4x, slider
    re-aims live; PROGRESS 8 Nov). Waiting for the owner's OK to make it live in lobby.html. Note: at the default the
    poll already fills the view at ~4x, so the slider only zooms the poll out.
     -> 8 Nov first pass: still QA only, goes live with the rest on the owner OK.
50. Director: prefer chatters whose message contains "vote" when picking who to follow (the room's server director in
    shared/room.js for local + hosted, and the page fallback director in lobby.html). Idea only, not started.
     -> 8 Nov: built in QA (room voteFollow + lobby-qa fallback). Awaiting OK to go live.
51. Poll screen: show the poll's countdown (time left until it closes) on the lobby's roll-up poll screen. Idea only,
    not started.
     -> 8 Nov: built in QA (big countdown next to the poll title). Awaiting OK to go live.
52. Auditorium: every Yee emote always gets a front-row seat. Double-check it when this item comes up: the rule
    exists today (shared/room.js YEE_EMOTES, "the front (wheelchair) row is theirs", mirrored from auditorium.html),
    but check the emote list covers all Yee emotes in DGG's current emote list, and what happens when the front row
    is full or someone switches to/from a Yee emote. Not started.
    + Owner 8 Nov: the front row is ONLY for Yee emotes. Today shared/room.js chooseSeat() falls back to any free
    seat when the rest is full ("if (!free.length) free = all..."), so non-Yee chatters can end up in the front row.
    Fix: non-Yee never get a front-row seat (they wait outside when the other rows are full); same rule in
    auditorium.html's own (fallback) seating.
     -> 8 Nov: fixed in shared/room.js (live at the next server start) + auditorium-qa.html. Yee list complete.
53. Control panel: one button right at the top that empties both the lobby and the auditorium (zero people) in one
    go. Today they are separate (Clear lobby / Reset auditorium, each only when that scene is picked). Needs a
    confirm step (it can't be undone) and the same for the hosted panel (per room). Not started.
     -> 8 Nov: built in control-qa.html (top button, confirm). Awaiting OK to go live.
54. Control panel: pick what the auditorium's cinema screen shows right now (e.g. the pre-show slides like "Next movie
    coming up" / "In the audience" / "The feature will begin shortly", or the film), instead of it only following
    the phase automatically. Local and hosted panel. Not started; first list what the screen can show today.
     -> 8 Nov: built in QA (Auto / 3 slides / The film). Awaiting OK to go live.
55. Fly-through first cut of the evening: OBS doesn't load the auditorium browser source until its scene is first
    shown (8 Nov bridge log: the auditorium connected 15 s after the 08:15:43 cut), so the first cut lands on a
    loading auditorium. Plan (option 1, recommended): when Fly starts, obs-bridge.js places the auditorium source in
    the lobby scene outside the canvas (counts as shown, loads off-screen; ~50 s flight vs ~15 s load) and removes
    that item after the cut - no permanent scene change, no extra GPU the rest of the night. (Option 2: keep it
    off-canvas in the lobby scene permanently.) Hosted edition: same via the panel's OBS link. Test with a fresh OBS
    start. Not started.
     -> 8 Nov: built (obs-bridge /warm-cinema + hosted shim), fake-OBS tested. Needs a real OBS test from a fresh start.
56. Lobby director: besides chatters, now and then focus on interesting spots - the billboards, the staff emotes
    selling tickets and snacks (cashiers, clerks), and other things worth a look - for a short set time, max ~7 s,
    then back to wide / the next pick. Local and hosted (the room's server director picks; the page frames it, like
    "Zoom to the poll"). First list candidate spots with the owner. Not started.
     -> 8 Nov: built in QA with 11 candidate spots (billboards, sign, cashiers, snack, usher, posters, cat, shelter). Owner to confirm the list.
57. Lobby gag: every once in a while two chatters go into the restroom together, both into the same stall, and
    heart emojis float up out of it; the director follows them for the whole bit, max 30 s total, then back to
    normal. Rare (not every visit), same on every screen (the room decides who and when), local and hosted.
    Not started.
     -> 8 Nov: built in QA (room-picked, hearts, director max 30 s). Awaiting OK to go live.
58. Auditorium during the film: the cinema screen should glow and light the room - a soft bloom around the screen,
    and the film's light spilling onto the floor, the front rows/seats, the walls and the seated chatters, following
    the film's brightness/colour (owner screenshot 8 Nov: the film sits flat in a dark room). The film is the VLC
    capture pinned in OBS (corner pin), so the glow likely needs to come from the film itself (OBS-side filter, or a
    sampled average colour sent to the page). Look options + a draft first. Not started.
     -> 8 Nov: draft (bloom + floor spill, fixed colour) in auditorium-qa; qa-queue-0811/58-glow-draft.jpg. Owner to pick the look, then film-colour sampling.
     -> 8 Nov: owner OK'd the look ("Looks right"). Film-colour sampling built (obs-bridge + hosted shim/server), fake-OBS tested. Awaiting OK to go live; needs a real-OBS look during a film.
59. BLESSTINY, WAOW and NOBULLY are directional emotes but face the wrong way: shared/emote-facing.json has all
    three as "front"
    (treated as non-directional, never flipped). Fix = set each to "left" or "right" to match which way its art faces
    (check the image), so walkers turn it like the other directional emotes. Small, shared by lobby + auditorium +
    hosted. Not started.
     -> 8 Nov: done (all three "left"), shared file, live.
60. Auditorium litter over time: about 10 min after the theater is 60% full, popcorn and other litter (cups, boxes,
    wrappers) gradually appear on the floor and steps; a control-panel toggle turns it on/off (and clears it). Note:
    the draft 13 render already has a few baked popcorn groups (qa11/cinema_layout_13.json "litter"); this adds
    page-drawn litter on top. Same on every screen (room state), local + hosted. Not started.
     -> 8 Nov: built in QA (room clock + panel toggle + drawn litter). Awaiting OK to go live.
61. Owner 8 Nov picked from the improvement drafts (concepts/improve/, PNGs in drafts/): lobby L1 street marquee
    over the doors (art: blockout first), L3 premiere-night sky (searchlights, skyline, haze), L4 wet-street light
    (lobby spill + puddle streaks); auditorium A1 film lights the room (= item 58), A2 aisle/step/cove/exit lights,
    A3 projector beam. Not picked: L2, L5, A4, A5. Build page layers in the -qa copies first.
    -> 8 Nov: L3, L4, A2, A3 built in QA (lobby-qa.html, auditorium-qa.html). A1 was already live (item 58). L1 waits
    for a blockout. -> 8 Nov ~19:45: L3, L4, A2, A3 live (owner "Go live"); hosted deployed ~20:00 (owner OK). Zip not rebuilt. L1 later (owner).
    -> 9 Nov: owner wants L1 rendered in Blender at full quality as its own layer (not a pack re-render). Blockout
    done (Brief 79, marquee/blockout.png); waiting for layout OK.

-> 8 Nov 2026: items 49-60 promoted to the live pages (owner "Go live"). Server + bridge parts take effect at the next
   start-all.bat; hosted edition and zip not rebuilt yet.
62. Owner 8 Nov: every chatter who falls asleep (dozes off in the auditorium) turns into the BEARSLEEP emote (DGG
    emote "BEARSLEEP", exists in the emote list); back to their own emote when they wake up (they chat again or the
    lights come up). Hook: auditorium.html setDoze (w.dozing, ~line 1321). Same on every screen (room state), local +
    hosted. Not started (owner: "in the future").
63. Owner 9 Nov, picks from the round-2 improvement drafts (concepts/improve2/, PNGs in drafts/). "Don't do anything
    yet": recorded only, nothing started.
    Liked: lobby L6 chatters take the scene's light, L7 wet reflections under chatters, L8 headlights catch the rain,
    L9 neighborhood life (steam, windows, neon buzz).
    Okay: auditorium A7 chatters lit by the screen, row by row.
    Nice if it looks right: the entrance corridor from A8 ("the hole that leads into the cinema"). Owner's brief for
    it: dim, less lit than the hall, the same purple look as the cinema, maybe posters on the walls and some really
    dim lights. The A8 draft's corridor was too bright (pink neon line, bright posters). It is art: blockout first.
    Not picked: A6 house lights, A9 pre-show lights the room, A10 curtain reveal, L10 lightning, and the rest of A8
    (halo, plinth, projector housing) unless the owner says otherwise.
    Answered 9 Nov: the corridor is only a way in. Chatters on their way to a seat walk through it; nobody waits
    in it. People waiting for a seat (full house) stay out of it, in the lobby or wherever they wait today.
64. Owner 9 Nov: the scenes need more life (he liked L9's windows and steam for that reason). Keep looking for it:
    lobby outside and inside the cinema; the auditorium stays a real cinema (not much can be added); DGG memes from
    the wiki, the subreddit and elsewhere, at most one year old. Suggestions are in roxy3d/memes/LIFE-IDEAS.md
    (L11-L29, A11-A18). Nothing picked or started yet.
    + 9 Nov, owner on item 64: "I really like all of this" (L11-L29, A11-A18), then asked for a full year of
    r/Destiny, drama included ("don't try to avoid it"). Round 2 is in the same file: L30-L49, A19-A21. Still
    nothing picked for building, and nothing started.
65. Owner 9 Nov, picks from the Reddit-year ideas (roxy3d/memes/LIFE-IDEAS.md, round 2). Recorded only.
    Liked: L30 bridge out, L31 snarkers across the street, L32 the canvasser, L38 Dear Leader portrait, L39 salute
    the janny, L40 the gnome, L44 coming soon: the J6 video, L46 slop on the menu, L47 marquee one-liners.
    Added by him:
    - L50 Golden WEOW: once in a while a chatter who posts WEOW walks in as the golden WEOW, with a glowing aura,
      clearly different from every other emote (in chat the gold roll is about 0.41%). Open: the odds in the lobby.
    - L51 a poster for an upcoming documentary called "Dogtober 7th" (the community's name for the Hasan and Kaya
      clip). He asked for it by name. Build note: no name and no likeness on the poster.
    Not picked: L33-L37, L41-L43, L45, L48, L49, A19-A21.
    + 9 Nov, owner on L50: odds 1 in 20 ("1 in 10 is fine. No, actually 1 in 20 is fine"). WEOW stays in the normal
      default pool for chatters who posted no emote ("that's fine, you shouldn't change that"). Assumed: the gold roll
      is for chatters who posted WEOW, as he first described it; default-pool WEOW walkers stay plain.
    + 9 Nov, owner corrects the L50 assumption: any chatter wearing WEOW has the 1 in 20 gold roll, "it doesn't have
      to be one that specifically typed it". So default-pool WEOW walkers roll too. The line above about posted-only
      no longer holds.
66. Owner 10 Nov: the lobby control panel should have an option to control the text on the street marquee (item 61,
    L1). "Don't start yet." Recorded only. Today the board writes screen 1's film by itself (lobby-qa.html,
    setMarqueeText in applyRooms). Open, ask before building: free text for both lines or presets, and whether the
    automatic film text comes back when the field is cleared. Related: L47 marquee one-liners (item 65).
    + 10 Nov, item 61 L1: the marquee is live in lobby.html (local only; push, hosted and zip wait for the owner).
    + 10 Nov, item 66 done: "Marquee line 1/2" in the panel's Scene settings (lobby), 40 characters each, empty =
      the automatic film text, "-" = a blank line. Live locally (lobby.html, control.html, shared/settings.js).
67. Open, owner 10 Nov "Not now": the marquee at 60 fps. At 30 it is clean; at 60 the 451 small pinned light pieces
    (out10m/merged/pin) still put 10-47 frames per camera move one frame late. Fix = far fewer blended pieces (one
    per occluder, or fewer z-levels), then one more run by the perf session. Not started.
    + 10 Nov, owner: "start enacting your changes". Batch 1 built in lobby-qa.html only (PROGRESS, 10 Nov "life ideas,
      batch 1"): L50 golden WEOW, L47 marquee one-liners, L39 salute the janny (item 65) and L9 neighborhood life
      (item 63). Screenshots in concepts/life/. Waiting for the owner's OK to make it live in lobby.html.
    + 10 Nov ~11:20: batch 1 is live in lobby.html (owner: "Go live now"). Not pushed, not on the hosted edition,
      not in the zip. No OBS smoothness run yet.
    + 10 Nov, batch 2 built in the QA copies only (PROGRESS, "life ideas, batch 2"): L6 scene light on chatters and
      L7 wet reflections in lobby-qa.html, A7 row light in auditorium-qa.html (item 63). Needs an OBS smoothness run
      before going live. Screenshots in concepts/life/.
    + 10 Nov, owner: no performance checks until the build is done ("we'll leave them for when you are actually
      done"). Batch 3 built in lobby-qa.html only (PROGRESS, "life ideas, batch 3"): L8 headlights in the rain
      (item 63), L31 snarkers, L30 bridge-out board, L32 the canvasser (item 65). Screenshots in concepts/life/.
      Still to build from the picks: L38 Dear Leader portrait, L40 the gnome, L44 J6 video poster, L46 slop menu,
      L51 Dogtober 7th poster, the entrance corridor (A8, art), golden WEOW in the auditorium, then L11-L29 and
      A11-A18. Live so far: batch 1 only.
    + 10 Nov, batch 4 built in lobby-qa.html only (PROGRESS, "life ideas, batch 4"): L38 Dear Leader portrait (owner:
      "Destiny's WEOW face"), L44 J6 video poster, L51 Dogtober 7th poster, L46 slop menu, L40 the gnome. Left from
      the picks: entrance corridor (art), golden WEOW in the auditorium, then L11-L29 and A11-A18.
68. Owner 10 Nov, on L38 (after seeing the page-drawn portrait): "for the dear leader poster, it should be done really
    nicely, like old soviet iconography, etc and on blender fully baked in." So: a properly designed propaganda-style
    poster of Destiny (WEOW face), modelled and rendered in Blender as part of the lobby art (its own rendered layer
    over out10, like the marquee pack out10m), not a page drawing. The page-drawn portrait in lobby-qa.html is a
    placeholder until then and must not go live as the final. Art workflow applies: placement blockout, then one
    styled draft, a second-opinion critique, full render only on the owner's word. Open: where it hangs and how big.
    + 10 Nov, owner on item 68: the poster hangs by the box office. Brief 84 started (Codex): placement blockout,
      leader/blockout.png. Codex weekly usage 55% before the start.
    + 10 Nov ~13:10: blockout done (leader/blockout.png). The wall is only 1.2 m high: poster 0.66 x 0.99 m, 40 px
      wide, standing almost on the floor; walkers in front cover its lower part. Waiting for the owner's layout OK.
    + 10 Nov, owner: "Keep it on the wall" = layout OK for the Brief 84 blockout (0.66 x 0.99 m on the low wall).
    + 10 Nov ~13:20: poster design shown (leader/poster-design-sheet.png). Waiting for the owner's OK, then the
      styled Blender draft.
    + 10 Nov ~13:25, owner: design OK ("Yes, render it"). Brief 85 started: styled draft qa10/draft28-leader.png.
    + 10 Nov ~14:20: draft 28 done (qa10/draft28-leader.png). Waiting for the owner's OK; the layer render only on
      his word. Open: Codex's credit balance dropped ~61 during the run although the weekly figure is 59%.
    + 10 Nov ~14:30, owner: the poster says "DEAR LEADER", not "OUR". Artwork changed; draft 29 re-rendering locally.
    + 10 Nov ~15:26: draft 29 (DEAR LEADER) done, qa10/draft29-leader.png. Waiting for the owner's OK for the layer render.
    + 10 Nov ~15:35, owner: "Yes, render layer" (draft 29 approved). Critique done (critique-86.md); Brief 86 started:
      layer pack out10l/. Then the page side: load it in lobby-qa.html in place of the placeholder.
    + 10 Nov ~16:10: layer pack out10l rendered (6 images) and loaded in lobby-qa.html in place of the placeholder.
      QA only. To do at promotion: out10l in package/art.js, docs, the room's peek list.
    + 10 Nov ~16:40, item 64 (owner: "The liked lists"): batch 5 built in the QA copies only: A11-A13 the crowd reacts to
      combos and applauds at lights-up, L16 roof bell, L17 sirens, L22 pet the cat. Left: L11-L15, L18-L21, L23-L29, A14-A18.
    + 10 Nov ~17:15, item 64: batch 6 built in lobby-qa.html only: L11 puddle splash, L12 umbrellas in the wind, L13
      missed the bus, L14 pigeons, L15 newspaper, L19 dog in the window. L18 (TV) not built: needs an art change.
      Left: L20, L21, L23-L29, A14-A18.
    + 10 Nov ~18:00, item 64: batch 7 built in lobby-qa.html only: L20 emote walks, L23 dancers (no jukebox), L27 golden
      glorp (1 in 20 like WEOW), L21 Aristortle, L26 nothing burger, L28 quickdraw, L29 wet-floor sign.
      Left: A14-A18 in the hall; L18, L24, L25 and the L23 jukebox need art.
    + 10 Nov ~18:50, item 64: batch 8 built in auditorium-qa.html only: A14 snack run, A15 latecomers, A16 aisle vendor,
      A17 clean-up crew (untested), A18 the conductor. The page-side part of the liked lists is done; what is left
      needs art (L18, L23 jukebox, L24, L25, the A8 corridor) or is the golden WEOW in the auditorium.
    + 10 Nov ~19:00, owner: "Art items first". Brief 87 started: corridor blockout (qa11/corridor/blockout.png).
    + 10 Nov ~19:10: corridor blockout done (qa11/corridor/blockout.png): 2.2 m wide, 7.5 m in frame, far wall with 3
      poster frames and 2 lights, near side open, runs out of the left edge. Waiting for the owner's layout OK.
    + 10 Nov ~19:20, owner: corridor "Layout OK". Brief 88 started: styled draft qa11/cinema_draft_14_corridor.png.
69. Owner 10 Nov: art jobs (briefs, drafts, renders, critiques) go to Claude Fable 5.2 at high effort from now on, not
    to Codex. AGENTS.md updated. Brief 88 (already running in Codex) finishes as started.
    + 10 Nov ~19:50: corridor draft 14 done (qa11/cinema_draft_14_corridor.png). Critique and Brief 89 (lobby props
      blockout) are running as Fable 5.2 high agents.
    + 10 Nov ~20:05, owner: "Keep draft 14" (corridor look approved as rendered; critique fixes not taken). Brief 90
      started: full set as draft 14 (qa11/cinema_draft_14*.png, cinema_layout_14.json), Fable 5.2 high agent.
    + 10 Nov ~21:20: corridor full set delivered (auditorium draft 14, Brief 90) and wired into auditorium-qa.html
      (QA default draft=14; arrivals walk the corridor, the door opens when they reach it). QA only.
    + 10 Nov ~21:20: lobby props blockout done (props/blockout.png, Brief 89): TV fits; claw machine only behind the
      storefront glass, jukebox only small at the snack bar's east end. Waiting for the owner's layout OK.
    + 10 Nov ~21:35, owner: props layout OK, "All three as shown". Brief 91 started: styled draft qa10/draft30-props.png.
70. Owner 10 Nov, on the props blockout picture: "i really like the style on it" (the grey clay-model look of the
    Workbench preview with dark outlines and flat colour accents). Noted only; he asked what it is, not for anything
    to be built. Possible uses if he wants: a blueprint/model view of the lobby or auditorium as its own scene or card.
    Later the same evening, offered a clean picture in that style: "yes, make one, does it have to be with no colors?"
    Answer: no. Brief 92 makes two stills of the lobby in that look, one grey and one in the scene's own flat colours
    (`style/lobby_model_grey.png`, `style/lobby_model_color.png`). Pictures only; what to use them for is his call.
    Both shown 10 Nov; asked whether he wants the auditorium in the same look: "Not now". Do not start it unasked.
71. Owner 10 Nov (~20:45): "Keep going until 72% usage, dggware is deferred for now, do 5 and then 6 but skip the
    performance check. That will be handled by another session later." (Weekly usage at that moment: 62%.) Props
    layer render on RunPod, max $2 ("Do 2"). Order: props layers -> props in the QA lobby -> golden WEOW in the
    auditorium -> corridor checks -> go live (batches 2-8, poster pack, draft 14, props; backups first) -> docs ->
    push, hosted deploy, zip. No OBS performance run in this session. DGGWare screens (L25) deferred.
72. Owner 10 Nov (~21:40): "Golden weow will also be in the lobby right? It should always arrive by bus, and the
    director should always follow this chatter when it arrives". (It has been in the lobby since batch 1.) Built
    and live the same evening: `GOLD_BUS`, `goldRide`; `?goldbus=0` turns it off.
    + 11 Nov ~01:15: the three lobby props (L18 TV, L23 jukebox, L24 claw machine) are live: pack `out10p/`,
      `?props=0` turns them off. Pushed, hosted deploy and zip rebuilt (they now also have the golden bus).
      Left of item 64/71: DGGWare screens (L25, deferred), the fly-through (corridor and props missing in it,
      deferred), the OBS performance run (another session). Owner to decide: push `memes/LIFE-IDEAS.md` or not.
    + 11 Nov, owner on `memes/LIFE-IDEAS.md`: "Push it". Committed and pushed the same day.
