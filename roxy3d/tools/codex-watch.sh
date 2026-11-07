#!/usr/bin/env bash
# Live, readable view of a running Codex job: its own progress messages and the first line of each command it runs
# (file diffs and command output are skipped). Usage: bash tools/codex-watch.sh [codex-NN.log]   (default: newest)
cd "$(dirname "$0")/.." || exit 1
log=${1:-$(ls -t codex-*.log | head -1)}
echo "watching $log  (Ctrl+C to stop)"
tail -c 300000 -F "$log" | awk '
  $0 == "codex"    { mode = "msg"; printf "\n[%s] Codex:\n", strftime("%H:%M"); fflush(); next }
  $0 == "exec"     { mode = "cmd"; next }
  $0 == "thinking" || $0 == "tokens used" || /^(diff --git|file update)/ { mode = ""; next }
  mode == "cmd"    { c = $0
                     sub(/^"[^"]*powershell\.exe" -Command /, "", c); sub(/ in [A-Z]:\.*$/, "", c)
                     if (length(c) > 150) c = substr(c, 1, 150) "..."
                     print "  > " c; fflush(); mode = ""; next }
  mode == "msg"    { if ($0 == "") mode = ""; else { print "  " $0; fflush() } }
'
