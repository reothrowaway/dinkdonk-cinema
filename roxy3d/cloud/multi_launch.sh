#!/usr/bin/env bash
# Runs once per pod, no repeated Blender startup per chunk.
set -Eeuo pipefail
BASE="${MULTI_LOCAL_BASE:-/workspace/multi75}"
mkdir -p "$MULTI_ROOT/logs"
exec > >(tee -a "$MULTI_ROOT/logs/${RUNPOD_POD_ID}.log") 2>&1
mountpoint -q /vol || { echo 'Shared /vol is not mounted'; exit 1; }
command -v runpodctl >/dev/null
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq libegl1 libgl1 libglvnd0 libgles2 libxkbcommon0 libsm6 libice6 libxi6 libxrender1 libxxf86vm1 libxfixes3 libxext6 libx11-6 zstd xz-utils >/dev/null
cd "$BASE"
echo "$BUNDLE_SHA256  bundle.tar.gz" | sha256sum --check -
tar -xzf bundle.tar.gz
export BUNDLE_ROOT="$BASE/bundle"
cd "$BUNDLE_ROOT"
sha256sum --check --quiet BUNDLE-SHA256SUMS
mkdir -p .runtime work/cache/temp work/cache/cuda work/cache/optix work/blender-user
export TMPDIR="$BUNDLE_ROOT/work/cache/temp" TEMP="$BUNDLE_ROOT/work/cache/temp" TMP="$BUNDLE_ROOT/work/cache/temp"
export XDG_CACHE_HOME="$BUNDLE_ROOT/work/cache" CUDA_CACHE_PATH="$BUNDLE_ROOT/work/cache/cuda" OPTIX_CACHE_PATH="$BUNDLE_ROOT/work/cache/optix"
export BLENDER_USER_RESOURCES="$BUNDLE_ROOT/work/blender-user" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
VERSION=5.2.3
NAME="blender-${VERSION}-linux-x64.tar.xz"
EXPECTED=78486c018b4443efe5e75ab54c290ed8c15abafd249b862c2c9ce2530a918eec
BLENDER="$BUNDLE_ROOT/.runtime/blender-${VERSION}-linux-x64/blender"
if [[ ! -x "$BLENDER" ]]; then
  # Same release and checksum as the supplied sealed bundle.
  curl --fail --location --retry 3 "https://download.blender.org/release/Blender5.2/$NAME" --output ".runtime/$NAME.partial"
  echo "$EXPECTED  .runtime/$NAME.partial" | sha256sum --check -
  tar -xJf ".runtime/$NAME.partial" -C .runtime
fi
# Each worker owns a process group. The supervisor remains RUNNING until all
# children exit, and the guardian can fence every group at its hard cap.
CORES=$(getconf _NPROCESSORS_ONLN)
THREADS=${THREADS_PER_WORKER:-$(( CORES / ${MAX_WORKERS:-4} ))}
(( THREADS >= 1 )) || THREADS=1
exec python3 "$BASE/multi_supervisor.py" -- "$BLENDER" -b --threads "$THREADS" --python-exit-code 1 --python "$BASE/multi_blender.py"
