#!/usr/bin/env bash
# Local Bash guardian test: every pod-control call is replaced by a log writer.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
if command -v cygpath >/dev/null; then HERE=$(cygpath -u "$HERE"); fi
ROOT=$(mktemp -d "$HERE/qa75/guardian-XXXXXX")
mkdir "$ROOT/bin"
cat > "$ROOT/bin/runpodctl" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$MOCK_CALLS"
EOF
# Git Bash lacks setsid; real Linux uses the native utility. This test's worker
# exits immediately, so no process-group behavior is claimed here.
cat > "$ROOT/bin/setsid" <<'EOF'
#!/usr/bin/env bash
exec "$@"
EOF
chmod +x "$ROOT/bin/runpodctl" "$ROOT/bin/setsid"
export PATH="$ROOT/bin:$PATH" MULTI_BOOT_TEST=1 RUNPOD_POD_ID=offline-pod
export GUARD_POLL_SECONDS=.1 STOP_RETRY_SECONDS=.1 IDLE_SECONDS=1 COLLECT_SECONDS=2
export STARTUP_SECONDS=1 HARD_SECONDS=10
for CASE in abandoned-upload idle failed complete; do
  export MULTI_LOCAL_BASE="$ROOT/$CASE" MULTI_ROOT="$ROOT/$CASE/volume" MOCK_CALLS="$ROOT/$CASE/calls"
  mkdir "$MULTI_LOCAL_BASE"
  mkdir "$MULTI_ROOT"
  mkdir "$MULTI_ROOT/queue"
  if [[ "$CASE" != abandoned-upload ]]; then
    if [[ "$CASE" == failed ]]; then printf 'exit 42\n' > "$MULTI_LOCAL_BASE/multi_launch.sh"
    else printf 'exit 0\n' > "$MULTI_LOCAL_BASE/multi_launch.sh"; fi
    touch "$MULTI_LOCAL_BASE/READY"
  fi
  [[ "$CASE" != complete ]] || printf '{}\n' > "$MULTI_ROOT/queue/SUCCESS.json"
  RC=0
  timeout 15 bash "$HERE/multi_boot.sh" || RC=$?
  if [[ "$CASE" == abandoned-upload ]]; then [[ "$RC" == 124 ]]; else [[ "$RC" == 0 ]]; fi
  [[ "$(cat "$MOCK_CALLS")" == 'pod stop offline-pod' ]]
  printf 'PASS guardian %s: one mocked stop, no provider call\n' "$CASE"
done
printf 'Evidence: %s\n' "$ROOT"
