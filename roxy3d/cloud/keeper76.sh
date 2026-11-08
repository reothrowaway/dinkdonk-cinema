#!/usr/bin/env bash
# Runs ON a pod (7 Nov 2026). The boot guardian only watches the original worker: once it retires, the pod stops
# after 30 s even if extra workers are mid-chunk, and without the 20-min collection grace if an extra worker did the
# finalize. While any worker lives: point RUNNING at a live one and hold END off; after success mark COMPLETE.
B=/workspace/multi75
PID=$(pgrep -f '[m]ulti_blender.py' | head -1)
ROOT=$(strings /proc/$PID/environ | sed -n 's/^MULTI_ROOT=//p')
while :; do
  [[ -f "$ROOT/queue/SUCCESS.json" ]] && touch "$B/COMPLETE"
  pids=$(pgrep -f '[m]ulti_blender.py' | tr '\n' ' ')
  if [[ -z "${pids// /}" ]]; then
    [[ -f "$B/END" ]] || date +%s > "$B/END"
    echo "$(date +%T) all workers done"; exit 0
  fi
  if ! kill -0 "$(cat "$B/RUNNING" 2>/dev/null)" 2>/dev/null; then
    set -- $pids; echo "$1" > "$B/RUNNING"; rm -f "$B/END"; echo "$(date +%T) RUNNING -> $1"
  fi
  sleep 2
done
