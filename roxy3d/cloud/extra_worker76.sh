#!/usr/bin/env bash
# Start one more Blender worker on this pod (7 Nov 2026, owner: use the GPU fully). Runs ON the pod via ssh.
# Copies the running worker's exact environment; only the worker name differs. Usage: bash extra_worker76.sh <suffix>
set -euo pipefail
SUF="$1"
PID=$(pgrep -f 'multi_blender.py' | head -1)
[[ -n "$PID" ]] || { echo "no running worker"; exit 1; }
POD=$(tr '\0' '\n' < /proc/$PID/environ | sed -n 's/^RUNPOD_POD_ID=//p')
ROOT=$(tr '\0' '\n' < /proc/$PID/environ | sed -n 's/^MULTI_ROOT=//p')
CWD=$(readlink /proc/$PID/cwd); EXE=$(readlink /proc/$PID/exe)
mapfile -d '' ENVV < /proc/$PID/environ
cd "$CWD"
nohup setsid env -i "${ENVV[@]}" RUNPOD_POD_ID="$POD-$SUF" "$EXE" -b --python-exit-code 1 --python /workspace/multi75/multi_blender.py \
  > "$ROOT/logs/$POD-$SUF.log" 2>&1 < /dev/null &
echo "started worker $POD-$SUF pid $!"
