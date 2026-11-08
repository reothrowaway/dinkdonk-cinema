- 7 Nov 2026 (Claude): fly-through blockout tested on 18771 with real chat (53 lobby + 118 seated). Frame 1 and the
  last frame match the lobby/auditorium page projections to <0.1 px. Depth hides cards correctly behind counters,
  queue ropes and seat backs. Player: far-to-near sort, cards fade within ~1.25 units of the lens, people within
  1.4 units of the camera's ground track step aside over the 2 s before it passes (start exactly at their lobby spot).
  Open: glass is in the depth pass (first hit), so everyone inside the lobby seen through the front windows, and the
  cashiers behind the ticket glass, are hidden (speckled by rain on glass). Fix = a depth-only pass without glass/rain.
  QA stills: fly/transition/qa/. Note: the in-app browser only renders while screenshotting when its pane is hidden.
