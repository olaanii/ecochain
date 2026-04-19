#!/usr/bin/env bash
set -euo pipefail

INITIA_HOME_DIR="${INITIA_HOME:-$HOME/.initia}"
KEYRING_BACKEND="${INITIA_KEYRING_BACKEND:-test}"
KEY_NAMES=("${INITIA_GAS_STATION_KEY_NAME:-gas-station}" "weave.GasStation")
deleted_key="false"

for key_name in "${KEY_NAMES[@]}"; do
  if initiad keys show "$key_name" --home "$INITIA_HOME_DIR" --keyring-backend "$KEYRING_BACKEND" >/dev/null 2>&1; then
    echo "Deleting stale key '$key_name' from $INITIA_HOME_DIR (backend: $KEYRING_BACKEND)..."
    initiad keys delete "$key_name" --home "$INITIA_HOME_DIR" --keyring-backend "$KEYRING_BACKEND" -y
    deleted_key="true"
  fi
done

if [[ "$deleted_key" == "false" ]]; then
  echo "No gas-station key was found in $INITIA_HOME_DIR (backend: $KEYRING_BACKEND)."
fi

echo "Rerun the weave launch after this cleanup."