#!/usr/bin/env bash
# deploy.sh — Deploy hardened EcoChain contracts to the configured EVM network.
#
# Usage:
#   PRIVATE_KEY=0x...  ORACLE_ADDRESS=0x...  bash scripts/deploy.sh [--broadcast]
#
# Or add PRIVATE_KEY and ORACLE_ADDRESS to .env, then:
#   bash scripts/deploy.sh --broadcast
#
# Without --broadcast the script runs in dry-run mode (no tx submitted).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load .env if present
if [[ -f "$ROOT/.env" ]]; then
  set -a
  source "$ROOT/.env"
  set +a
fi

FORGE="$HOME/.foundry/bin/forge"
RPC="${NEXT_PUBLIC_INITIA_JSON_RPC:-http://localhost:8545}"
BROADCAST_FLAG=""

for arg in "$@"; do
  case "$arg" in
    --broadcast) BROADCAST_FLAG="--broadcast --slow" ;;
  esac
done

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "ERROR: PRIVATE_KEY is not set."
  echo "  Add it to .env:  PRIVATE_KEY=0x<your-hex-key>"
  exit 1
fi

if [[ -z "${ORACLE_ADDRESS:-}" ]]; then
  echo "ERROR: ORACLE_ADDRESS is not set."
  echo "  Add it to .env:  ORACLE_ADDRESS=0x<oracle-evm-address>"
  exit 1
fi

echo "═══════════════════════════════════════"
echo " EcoChain Contract Deploy"
echo " RPC     : $RPC"
echo " Broadcast: ${BROADCAST_FLAG:-DRY RUN}"
echo "═══════════════════════════════════════"

OUTPUT=$("$FORGE" script script/deploy.s.sol:DeployEcochain \
  --rpc-url "$RPC" \
  $BROADCAST_FLAG \
  -vvvv \
  2>&1)

echo "$OUTPUT"

# Extract deployed addresses from JSON block in stdout and write to registry.
JSON=$(echo "$OUTPUT" | sed -n '/=== DEPLOYED ADDRESSES ===/,/^}/p' | tail -n +2)

if [[ -n "$JSON" && -n "$BROADCAST_FLAG" ]]; then
  REGISTRY="$ROOT/src/lib/contracts/addresses.json"
  mkdir -p "$(dirname "$REGISTRY")"
  echo "$JSON" > "$REGISTRY"
  echo ""
  echo "✓ Address registry written to src/lib/contracts/addresses.json"
fi
