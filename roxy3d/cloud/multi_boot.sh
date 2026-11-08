#!/usr/bin/env bash
# Embedded in pod create's docker command: armed before the first SSH/upload.
# No account key is copied. Uses RunPod's pod-local runpodctl credentials.
set -u
export RUNPOD_NO_UPDATE_CHECK=1
BASE="${MULTI_LOCAL_BASE:-/workspace/multi75}"
[[ -d "$BASE" ]] || mkdir -p "$BASE"
START=$(date +%s)
stop_self() {
  # Sync shared commits before stopping; retry transient control-plane failures.
  timeout 30 sync || true
  while :; do
    if timeout 30 runpodctl pod stop "$RUNPOD_POD_ID" >/dev/null 2>&1 ||
       timeout 30 runpodctl stop pod "$RUNPOD_POD_ID" >/dev/null 2>&1; then return; fi
    sleep "${STOP_RETRY_SECONDS:-30}"
  done
}
guardian() {
  while :; do
    NOW=$(date +%s)
    if (( NOW - START >= ${HARD_SECONDS:-21600} )); then break; fi
    # Success belongs to the queue, not to the original/first Blender process.
    if [[ -f "$MULTI_ROOT/queue/SUCCESS.json" && ! -f "$BASE/COMPLETE" ]]; then
      touch "$BASE/COMPLETE"
      printf '%s\n' "$NOW" > "$BASE/END"
    fi
    if [[ ! -f "$BASE/SUPERVISOR_READY" && ! -f "$BASE/COMPLETE" ]] && (( NOW - START >= ${STARTUP_SECONDS:-1800} )); then break; fi
    if [[ -f "$BASE/END" ]]; then
      END=$(cat "$BASE/END")
      GRACE=${IDLE_SECONDS:-30}
      [[ -f "$BASE/COMPLETE" ]] && GRACE=${COLLECT_SECONDS:-1200}
      (( NOW - END >= GRACE )) && break
    elif [[ -f "$BASE/RUNNING" ]] && ! kill -0 "$(cat "$BASE/RUNNING")" 2>/dev/null; then
      printf '%s\n' "$NOW" > "$BASE/END"
    fi
    sleep "${GUARD_POLL_SECONDS:-5}"
  done
  # Fence the writer before stopping; a hard cap cannot race more commits.
  touch "$BASE/FENCED"
  for pidfile in "$BASE"/worker-pids/*.pid; do
    [[ -f "$pidfile" ]] && kill -TERM -- "-$(cat "$pidfile")" 2>/dev/null || true
  done
  if [[ -f "$BASE/RUNNING" ]]; then kill -TERM -- "-$(cat "$BASE/RUNNING")" 2>/dev/null || true; fi
  sleep "${FENCE_SECONDS:-5}"
  for pidfile in "$BASE"/worker-pids/*.pid; do
    [[ -f "$pidfile" ]] && kill -KILL -- "-$(cat "$pidfile")" 2>/dev/null || true
  done
  if [[ -f "$BASE/RUNNING" ]]; then kill -KILL -- "-$(cat "$BASE/RUNNING")" 2>/dev/null || true; fi
  stop_self
}
guardian >"$BASE/guardian.log" 2>&1 &
GUARD=$!
printf '%s\n' "$GUARD" > "$BASE/GUARD"
# Preserve the base image's SSH/key/runpodctl setup.
if [[ "${MULTI_BOOT_TEST:-0}" != 1 ]]; then /start.sh >"$BASE/base.log" 2>&1 & fi
while [[ ! -f "$BASE/READY" ]]; do
  kill -0 "$GUARD" 2>/dev/null || exit 124
  sleep 2
done
if [[ "${MULTI_READER:-0}" == 1 ]]; then
  touch "$BASE/SUPERVISOR_READY"
  setsid bash -c 'while :; do sleep 30; done' >"$BASE/launch.log" 2>&1 &
else
  setsid bash "$BASE/multi_launch.sh" >"$BASE/launch.log" 2>&1 &
fi
WORKER=$!
printf '%s\n' "$WORKER" > "$BASE/RUNNING"
wait "$WORKER"; CODE=$?
if [[ -f "$MULTI_ROOT/queue/SUCCESS.json" ]]; then touch "$BASE/COMPLETE"; fi
[[ -f "$BASE/END" ]] || printf '%s\n' "$(date +%s)" > "$BASE/END"
wait "$GUARD"
