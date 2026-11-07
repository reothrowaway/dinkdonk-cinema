#!/usr/bin/env bash
# Prints the newest Codex usage numbers from Codex's own session logs (~/.codex/sessions): weekly limit used,
# when it resets, and the credit balance (credits are spent only once the weekly limit is at 100%).
# Codex sometimes rewrites old session files, so the newest reading is chosen by its timestamp, not by file date.
line=$(for f in $(ls -t ~/.codex/sessions/*/*/*/*.jsonl 2>/dev/null | head -8); do grep '"rate_limits"' "$f" | tail -1; done |
  awk -F'"timestamp":"' 'NF > 1 { split($2, t, "\""); print t[1] "\t" $0 }' | sort | tail -1 | cut -f2-)
[ -z "$line" ] && { echo "no Codex usage data found"; exit 1; }
used=$(grep -o '"primary":{"used_percent":[0-9.]*' <<<"$line" | grep -o '[0-9.]*$')
reset=$(grep -o '"primary":{[^}]*"resets_at":[0-9]*' <<<"$line" | grep -o '[0-9]*$')
bal=$(grep -o '"balance":"[0-9.]*"' <<<"$line" | grep -o '[0-9.]*' | head -1)
ts=$(grep -o '"timestamp":"[^"]*"' <<<"$line" | head -1 | cut -d'"' -f4)
echo "codex weekly used: ${used}%  resets: $(date -d @"$reset" '+%d %b %Y %H:%M')  credits: ${bal:-n/a}  (as of $ts)"
