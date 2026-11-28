# WIN A BUDDY

[View the three-stage comparison](three-stage-review.jpg). Left to right, it shows the [original Blender cabinet](original-machine.png), the warm ImageGen concept based on the product photos, and the [updated Blender render](machine-detail.png). Both Blender renders use the same studio camera and exterior lights.

The prize is modeled after the 2026 Buddy Plushie. The official front photograph defined the swept fringe, pink cheek patches and wide red heart. The side and back photographs established the depth of the head, the seated pose and the low edge of the hair. The hair and body are simplified for the isometric camera. [Front](https://store.destiny.gg/cdn/shop/files/Buddy_Front_a07ed1af-72f5-48bd-be91-71639f6dbb85.png?v=1779989754) · [Side](https://store.destiny.gg/cdn/shop/files/Buddy_Side_2.png?v=1780071242) · [Back](https://store.destiny.gg/cdn/shop/files/Buddy_Back.png?v=1779990103)

The [March 1996 SMART advertisement](https://elibrary.arcade-museum.com/magazines/pm/PlayMeter-1996-03/PlayMeter-1996-03-067.pdf) shows contemporary prize crane cabinets. The two [ImageGen studies](concepts.jpg) explored the lighting using the existing cabinet render and the three product photographs. The Blender draft uses the warm treatment, a dark display liner and nine copies of the seated prize.

Open [buddy-claw.blend](buddy-claw.blend) in Blender 5.2.3. The cabinet scene opens at the lobby camera angle. Switch to **Buddy plush | model studio** to edit the toy at the origin. Each of the nine prizes in the cabinet uses that collection.

- [Buddy from three angles](buddy-turnaround.jpg) shows the same Blender model rotated in a studio.
- [Cabinet detail](machine-detail.png) is a studio render of the editable cabinet.
- [1280 × 720 lobby placement](lobby-draft.png) uses the pixel difference between two Cycles renders of the cabinet area from the fixed lobby camera, applied to the existing draft 34 weather still. The public lobby continues to use its approved art pack.

To rebuild locally, open the project's archived roxy3d/rerender96/lobby_draft34.blend as the input to Blender in background mode. Pass -P roxy3d/build_buddy_claw_study.py followed by -- and an output directory. The builder writes a self-contained model and the studio and lobby render buffers. Run assemble.py with that output directory, the original roxy3d/qa10/draft34-check.png, and your destination directory to recreate the two comparison images. The assembler uses Pillow and NumPy.
