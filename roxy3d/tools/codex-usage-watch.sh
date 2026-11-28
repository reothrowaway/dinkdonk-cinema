#!/bin/bash
# Checks Codex weekly usage every 5 min while an Astra job runs. Exits (waking Claude) on: WARN90 (first time >=90% used),
# PAUSE95 (>=95% used), ASTRA_DONE (job log ended). Readings go to usage-watch.log next to the job's log.
O="$1"; T=/c/Users/maxsp/Desktop/Angelthump_H264_4K/standby/roxy3d/tools/codex-usage.sh
while true; do
  r=$(bash "$T" 2>&1 | tail -1); echo "$(date '+%d %b %H:%M') $r" >> "$O/usage-watch.log"
  pct=$(echo "$r" | grep -o 'used: [0-9.]*' | grep -o '[0-9.]*$')
  if [ -n "$pct" ] && awk "BEGIN{exit !($pct>=95)}"; then echo "PAUSE95 $r"; exit 0; fi
  if [ -n "$pct" ] && [ ! -f "$O/.warned90" ] && awk "BEGIN{exit !($pct>=90)}"; then touch "$O/.warned90"; echo "WARN90 $r"; exit 0; fi
  for i in $(seq 10); do grep -q '^exit ' "$O/astra-run.log" 2>/dev/null && { echo "ASTRA_DONE $r"; exit 0; }; sleep 30; done
done
