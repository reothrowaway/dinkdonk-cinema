# Cinema looks

The standalone shader is [cinema-looks.shader](cinema-looks.shader). The owner's workspace also includes an [offline comparison](index.html) with OBS captures for all thirteen looks. Select a scene and move the slider to reveal the original from the left. The capture files stay local because they contain real chat.

## Promoted to QA

The **DinkDonk Cinema Looks QA** OBS scene collection opens in the lobby. Each room has one look enabled. To compare looks, open **Filters** on the browser source listed below, switch the active look off, then switch the desired look on. Leave **Key #00ff00** enabled in the auditorium.

| Room and source | Enabled when opened | Other QA looks |
|---|---|---|
| Lobby · Browser | Neon rain 85% | After-hours mall 75%, Chrome & cyan 65%, Miami dusk 65%, Ultraviolet arcade 60%, Curved CRT 65% |
| Auditorium · Browser 3 | Pearl diffusion 55% | 35 mm midnight 70% |

[Watch all eight QA settings](qa/looks-comparison.mp4). Each wipe compares the same OBS frame with the effect off and on. The [local collection](qa/DinkDonk_Cinema_Looks_QA.json) points at the workspace shader. After a reboot, run [Start Looks QA](qa/Start%20Looks%20QA.cmd) to start the QA rooms and real-chat relay on ports 18791 and 18792. A second launch leaves the first running. If the collection needs to be recreated after moving the workspace, run `node qa/build-looks-qa.cjs` from this directory and import the resulting JSON in OBS.

All thirteen looks are in the comparison below. Pink halation overlaps the warmer lobby grades. Anamorphic neon and Star-filter glass draw highlights across the lettering. VHS rental softens the edges of lettering and emotes, and Milk-glass pastels lifts the blacks that separate the seat rows.

## Try the shader in OBS

1. Use the cinema scene collection you want to experiment with. Open the **Filters** dialog for the complete lobby scene.
2. Add **User-defined shader** from obs-shaderfilter. Enable **Load shader text from file** and choose `cinema-looks.shader` from this directory.
3. Choose a **Cinema look** and set **Strength (%)**. A strength of zero provides the original picture. Switching the filter off bypasses the processing entirely.
4. For the auditorium, choose where the effect belongs. A filter on the complete scene grades the auditorium and visible movie together. **Curved CRT** can bend them together in this placement. A filter on the auditorium browser source can keep the movie's original colors. Put the existing green **Color Key** first in the processing order, add the look after it, and enable **Keep film cutout aligned**. This preserves the keyed alpha and disables the barrel warp on this plate. Keep the live corner-pin filter on the separate film source.
5. **Film fullscreen** is a separate scene. A look attached only to the lobby or auditorium ends when OBS cuts to that scene.

The addon is the same obs-shaderfilter plugin used by the project's film corner pin. The shader runs inside OBS on the streamer's PC. The hosted web preview and the control panel do not apply it. Each scene can have its own preset and strength.

## The looks

For one movie night, try **Neon rain at 85%** on the Normal lobby and **Pearl diffusion at 55%** on the auditorium. Check the neon letters and their pavement reflection in the lobby. In the auditorium, watch the pale wall sconces over the back seats. For a more overt change, compare **Ultraviolet arcade** against Normal and Moody using the same shot.

| Preset | Where to look |
|---|---|
| Neon rain | A slight bow in the marquee and roofline, cool glossy pavement and rose-colored bloom around the signs. A combined lens, light and color treatment. |
| After-hours mall | Pink light pooling near the lobby entrance and cooler turquoise in the shadows. |
| Pearl diffusion | Broad, soft halos around bulbs. In the auditorium, compare the wall lights with the neighboring dark seats. |
| Chrome & cyan | Cool, high-contrast edges on the ticket counter and reflected signs. |
| Pink halation | Coral-red light just outside the brightest sign lettering. |
| Miami dusk | Warm apricot highlights against violet shadows, especially around the concessions. |
| Anamorphic neon | Thin horizontal blue streaks from hot lights. Strong across the marquee. |
| Star-filter glass | Small diagonal glints around bright points. Most noticeable on the exposed bulbs. |
| Curved CRT | Barrel curvature, fine scanlines, edge color separation. Best judged against the long roof and screen edges. |
| VHS rental | Color trails slightly behind bright shapes, with a light, fixed grain. |
| Milk-glass pastels | Faded lavender shadows and pale mint highlights. The room's deepest blacks lift. |
| Ultraviolet arcade | Saturated magenta highlights and deep indigo shadows. Try the Moody lobby for the most pronounced version. |
| 35 mm midnight | Warm highlights, fine grain and gradual corner falloff. A quieter auditorium look. |

Shine here comes from bright pixels already in the shot. The shader can spread or sharpen a painted reflection. A new reflection from an object outside the image would need different scene art.

## Reference scenes

The Normal lobby, Moody lobby, and seated auditorium comparisons use real-chat captures from 24 Nov 2026. The film-alignment view uses an archived film-phase auditorium plate and a stationary registration pattern behind the exported OBS color key. The scene previews are at 85% strength and the film-alignment previews are at 100%.

The [18-second motion comparison](cinema-looks-in-motion.mp4) shows **Neon rain at 85%** in the Normal lobby and **Pearl diffusion at 55%** in the auditorium. Both halves of each shot use the same live browser input. The captioned export is silent. The [QA report](QA-results.md) includes native-resolution film registration results and render measurements.
