# Brief 68: the v7 pull-back renders black - diagnose, fix, render that part locally

The v7 draft is rendering on a pod right now (bundle-67, FLY_MODE=draft, 960x540, odd frames). Peeked draft frames
A185 and A187 are **pure black** (mean 0.0003, max 1/255) while their depth pass is valid (near 18169, far 20003:
the city is in front of the long-lens far camera). Files: `fly/v7/peek/fly67-0e1cab2ece6b4ff8/00185.*`, `00187.*`.
In the old production render (flythrough65) the same part of the route was fine. Suspect: a v7 change, most likely
the Opus preset "fog seen by camera rays only" (camera rays now cross ~18,000 units of fog volume with extinction
but no lit in-scattering), or exposure/clip settings for the far long-lens camera. Do not touch the running pod.

1. Find the cause on this PC (render single frames of `fly/v7/` at 540p draft settings): which setting makes A185
   black, and the exact range of affected frames in the whole route (check every 10th frame of A16-A450 at least).
2. Fix it in `fly/v7/` without changing the approved look elsewhere (if needed, drop "fog camera-only" just for the
   far long-lens part, or limit the fog's effect with distance, as long as frame 1 still matches the live lobby and
   the street/lobby frames are unchanged). Report the before/after for A185 and one street frame.
3. Render the affected range locally in **draft settings** (960x540, odd frames only, same as the pod draft) into
   `fly/v7/local-draft/` with the same frame numbering and depth outputs as the pod draft, so Claude can splice
   them into the pod draft.
4. Rebuild the bundle as `cloud/roxy-cloud-bundle-68.tar.gz` with the fix (both modes, same commands as Brief 67)
   for the final, smoke-test it, and give the checksum.
Notes in `NOTES-68.md`. Write only inside `roxy3d/fly/v7/` (new files or the fix), `roxy3d/cloud/` (new bundle) and
`roxy3d/NOTES-68.md`. No pod, no cloud. STATUS line, stop.
