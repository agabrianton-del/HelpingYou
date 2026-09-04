#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

workflow_dir=".github/workflows"

invalid_uses=0
while IFS= read -r line; do
  if [[ "$line" =~ uses:[[:space:]]+\./ ]]; then
    continue
  fi

  if [[ ! "$line" =~ @[0-9a-f]{40}([[:space:]]*#.*)?$ ]]; then
    echo "Unpinned workflow action: $line" >&2
    invalid_uses=1
  fi
done < <(grep -RIn '^[[:space:]]*uses:' "$workflow_dir" --exclude='*.md' || true)

invalid_images=0
while IFS= read -r line; do
  if [[ ! "$line" =~ @sha256:[0-9a-f]{64} ]]; then
    echo "Unpinned workflow container image: $line" >&2
    invalid_images=1
  fi
done < <(grep -RIn '^[[:space:]]*image:' "$workflow_dir" || true)

while IFS= read -r line; do
  if [[ ! "$line" =~ @sha256:[0-9a-f]{64} ]]; then
    echo "Unpinned docker run image in workflow: $line" >&2
    invalid_images=1
  fi
done < <(grep -RIn 'docker run ' "$workflow_dir" || true)

if [[ "$invalid_uses" -ne 0 || "$invalid_images" -ne 0 ]]; then
  exit 1
fi
