#!/usr/bin/env bash
# Every stop and group-kill is mocked; fixtures exit by themselves. No provider.
set -euo pipefail
cd -- "$(dirname -- "$0")"
HERE=.
mkdir -p qa77
ROOT=$(mktemp -d qa77/guardian-XXXXXX)
mkdir "$ROOT/bin"
cat > "$ROOT/bin/runpodctl" <<'EOF'
#!/usr/bin/env bash
printf '%s %s\n' "$(date +%s)" "$*" >> "$MOCK_CALLS"
EOF
cat > "$ROOT/bin/setsid" <<'EOF'
#!/usr/bin/env bash
exec "$@"
EOF
cat > "$ROOT/env.sh" <<'EOF'
kill() {
  if [[ "$1" == -0 ]]; then builtin kill "$@"; return; fi
  printf '%s\n' "$*" >> "$MOCK_KILLS"
  return 0
}
EOF
chmod +x "$ROOT/bin/runpodctl" "$ROOT/bin/setsid"
export PATH="$ROOT/bin:$PATH" MULTI_BOOT_TEST=1 RUNPOD_POD_ID=offline77 BASH_ENV="$ROOT/env.sh"
export GUARD_POLL_SECONDS=.1 STOP_RETRY_SECONDS=.1 IDLE_SECONDS=1 COLLECT_SECONDS=2 FENCE_SECONDS=.1
for CASE in abandoned-upload idle failed nonfirst-complete hard-cap startup-hang; do
  export MULTI_LOCAL_BASE="$ROOT/$CASE" MULTI_ROOT="$ROOT/$CASE/volume" MOCK_CALLS="$ROOT/$CASE/calls" MOCK_KILLS="$ROOT/$CASE/kills"
  export STARTUP_SECONDS=8 HARD_SECONDS=12
  mkdir -p "$MULTI_ROOT/queue" "$MULTI_LOCAL_BASE/worker-pids"
  if [[ "$CASE" == abandoned-upload ]]; then export STARTUP_SECONDS=1
  else
    cat > "$MULTI_LOCAL_BASE/multi_launch.sh" <<'EOF'
set -u
if [[ "$CASE" == startup-hang ]]; then sleep 3; exit 1; fi
touch "$MULTI_LOCAL_BASE/SUPERVISOR_READY"
if [[ "$CASE" == failed ]]; then exit 42; fi
if [[ "$CASE" == nonfirst-complete ]]; then
  (sleep 1; touch "$MULTI_LOCAL_BASE/w1-ended") &
  (sleep 3; [[ ! -e "$MOCK_CALLS" ]]; printf '{}\n' > "$MULTI_ROOT/queue/SUCCESS.json"; date +%s > "$MULTI_LOCAL_BASE/success-time") &
  wait
elif [[ "$CASE" == hard-cap ]]; then
  printf '9999998\n' > "$MULTI_LOCAL_BASE/worker-pids/w1.pid"
  printf '9999999\n' > "$MULTI_LOCAL_BASE/worker-pids/w2.pid"
  sleep 3
fi
EOF
    touch "$MULTI_LOCAL_BASE/READY"
  fi
  [[ "$CASE" != hard-cap ]] || export HARD_SECONDS=1
  [[ "$CASE" != startup-hang ]] || export STARTUP_SECONDS=1
  export CASE
  rc=0;timeout 20 bash "$HERE/multi_boot.sh" || rc=$?
  [[ "$rc" == 0 || ( "$CASE" == abandoned-upload && "$rc" == 124 ) ]]
  [[ "$(wc -l < "$MOCK_CALLS")" == 1 ]]
  grep -q 'pod stop offline77' "$MOCK_CALLS"
  if [[ "$CASE" == nonfirst-complete ]]; then
    [[ -f "$MULTI_LOCAL_BASE/w1-ended" && -f "$MULTI_LOCAL_BASE/COMPLETE" ]]
    read -r stopped _ < "$MOCK_CALLS"
    (( stopped - $(cat "$MULTI_LOCAL_BASE/success-time") >= 2 ))
  fi
  if [[ "$CASE" == hard-cap ]]; then
    grep -q -- '-TERM -- -9999998' "$MOCK_KILLS"
    grep -q -- '-KILL -- -9999999' "$MOCK_KILLS"
  fi
  printf 'PASS guardian %s\n' "$CASE"
done
printf 'Evidence: %s (stop/group signals mocked; Linux process groups not exercised)\n' "$ROOT"
