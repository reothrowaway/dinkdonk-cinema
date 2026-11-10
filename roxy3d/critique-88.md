# Second opinion on draft 14 (corridor), 10 Nov 2026

Read-only critique by a Claude Fable 5.2 agent at high effort (the first under the owner's new rule). Judged by eye
against `qa11/cinema_draft_13.png` and `out10/full.png`, with the luminance figures in NOTES-88; no pixels measured.

| Question | Verdict |
|---|---|
| Same cinema as lobby | Partly. Plum wall, frames and posters match; the floor reads blue-black, so only the wall carries the purple. |
| Dimmer, not a black hole | Wall yes. Floor no: at mean 10/255 it looks about as dark as the empty background, so the open near edge dissolves. |
| 32 px figure on floor | Bright emotes read; dark ones will not, and all lack a visible ground plane, worst toward the left edge. |
| Sconces / posters | Posters read clearly, GLORP included. Sconces read as small amber tiles with no light pool on the wall. |
| Sits back or pulls | Sits back. The white poster mats are the brightest spots but stay below the hall's seat signs. |

1. Lift floor and runner about 1.6x (mean 10 to about 16-17, still roughly 65% of the hall carpet), so the near edge
   separates from the background.
2. Shift the runner from blue/plum about halfway toward the lobby's purple carpet.
3. Raise each sconce's point light about 3x (3 W to 8-10 W) for a soft pool roughly one poster wide; keep face emission.
