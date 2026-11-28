# Cinema mods

For in-room stories with real chatters, open the [event screenings](events.html) or read the [staging and QA notes](EVENTS.md). Each screening includes the full video and a link to its QA room.

Open [the local screening room](index.html) to play any of the 24 mods on either room. **Show original take** plays a separate capture of that room. Camera position, people, and chat can differ between takes. The clips loop and include native playback controls. Watch [the 72-second overview](all-24.mp4) for a side-by-side tour of both rooms, or open [the contact sheet](all-24.jpg) for all 24 in the lobby.

For a first pass, try **Prism Cathedral** in the lobby, **Horizon Drive** in the lobby, **Mirrorball Ballroom** in the auditorium, and **Laser Choir** in both. The first three break up or rearrange the room itself. Laser Choir keeps the architecture legible while the lighting responds to the audience.

## Try a shader in OBS

The [OBS shader pack](cinema-mods-obs.zip) contains all three shader files. Extract them to a persistent folder before choosing one in OBS.

1. Open a test copy of the lobby or auditorium scene. In **Filters**, add **User-defined shader**. The project already uses the obs-shaderfilter plugin for its film corner pin.
2. Enable **Load shader text from file**. Choose [cinema-machines.shader](cinema-machines.shader) for the 20 machines below, [reconstruction.shader](reconstruction.shader) for Vector Rebuild and Mercury Bath, or [infinity-foyer.shader](infinity-foyer.shader) for the moving mirror tunnel. When trying another shader file, add a fresh filter for that file and enable it on its own. This avoids OBS retaining the previous file's compiled effect.
3. Pick the name in the dropdown where available. The gallery shows **Mix 100%** and **Motion speed 1.0**. Try 60% for a more legible room. Speed 0 fixes the shader’s movement while the underlying source continues to play. Toggle the filter’s eye to bypass the effect completely.
4. Put the shader on the whole scene for a treated room, speech, and film. To keep the movie clean, put it on the **auditorium browser source after the color key** in processing order. Keep the separate film source and its corner pin in their usual positions. The gallery uses a whole-scene effect during the preshow.

## Laser Choir

Laser Choir is a browser-scene mod. With the local standby server running, open [the QA lobby](http://127.0.0.1:18770/lobby-qa.html?everyone=1&ctl=0&bridge=0&mod=laser-choir) or [the QA auditorium](http://127.0.0.1:18770/auditorium-qa.html?everyone=1&ctl=0&bridge=0&mod=laser-choir). These preview links disable the director and OBS bridge. Remove `mod=laser-choir` to return to the ordinary QA room.

The lobby uses both rooftop searchlight positions. The auditorium reads the projector location and four screen corners from the room and clips the laser fan around the screen. It needs the auditorium projector beam enabled. Each real chat burst sends a wave down the beams, with a 2.6-second cooldown. Reduced-motion mode holds the fans still and suppresses the pulse. The implementation is in [laser-choir.js](laser-choir.js).

## The first four

| Mod | What moves |
|---|---|
| Vector Rebuild | A diagonal frontier passes through the set. A neon wire drawing on an isometric grid replaces the original architecture behind it. |
| Mercury Bath | The room’s lighting supplies relief for moving violet, cyan, and silver reflections. |
| Infinity Foyer | The picture repeats in nested mirrored frames around a drifting vanishing point. |
| Laser Choir | Anchored light fans swing across the roof and projector, with pulses from real chat. |

## The 20 additional machines

| Machine | What happens |
|---|---|
| Prism Cathedral | The room folds into six revolving stained-light wedges around a fixed optical center. |
| Scanline Elevator | Horizontal floors slide in opposing directions across a traveling wave. |
| Lenticular Marquee | Vertical louvers catch a moving light and reveal alternating mirrored viewpoints. |
| Black Hole Matinee | A dark lens bends the room around a moving amber accretion ring. |
| Folding Screen | Broad diagonal pleats hinge open and shut like a folding paper set. |
| Pin Matrix | The room becomes a field of raised, lit pins. Each pin grows with the brightness beneath it. |
| Ribbon Plotter | A bank of cyan oscilloscope traces redraws the room, row by row. |
| Leaded Glass | Moving irregular panes sample the room, with dark leading and glints on the glass. |
| Thermal Receipt | A cream paper print resolves into fine black hatching under a traveling print head. |
| Contact Printer | The live room travels through two columns of perforated film, each with its own exposure. |
| Tidal Glass | Interfering waves bend the picture and make caustic light move over its surface. |
| Horizon Drive | A striped sun crosses the picture and a neon perspective road reflects the room below the horizon. |
| Mirrorball Ballroom | A faceted disco ball reflects fragments of the room as it turns in front of the set. |
| Poster Peel | A diagonal corner curls back to expose a second, blue-ink impression of the room. |
| Parallax Cutouts | Highlights and midtones slide as separate paper cutouts and cast offset shadows. |
| Silk Facets | A rippling triangular fabric samples the scene one facet at a time. |
| Laser Topography | Brightness becomes elevation, crossed by colored, moving contour lines. |
| Pinball Optics | Three rolling glass lenses magnify and invert different parts of the room. |
| Warp Gate | Marquee lights stretch toward the edges as luminous rings travel out from the center. |
| Glyph Cascade | The picture breaks into columns of emissive glyphs with falling cyan and pink signal heads. |

## Performance and film checks

See [the test results](QA-results.md) for per-mode measurements, frame counters, film alignment, and the gallery verification. The [original 13 looks](../vaporwave/README.md) remain available in their own gallery.
