#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
if [[ -n "${MULTI_PYTHON:-}" ]]; then
  PY="$MULTI_PYTHON"
elif [[ -x "$HERE/../../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe" ]]; then
  PY="$HERE/../../tools/blender-5.2.3-windows-x64/5.2/python/bin/python.exe"
elif command -v python3 >/dev/null; then
  PY=python3
else
  echo 'Python 3.12+ required; set MULTI_PYTHON.' >&2; exit 2
fi
export PYTHONDONTWRITEBYTECODE=1
# Do not pass /vol paths as argv through MSYS's native argument rewriting.
exec "$PY" "$HERE/multi.py" "$@"
