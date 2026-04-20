#!/usr/bin/env bash
set -euo pipefail

RPC="${NEXT_PUBLIC_INITIA_JSON_RPC:-http://localhost:8545}"

echo "Checking RPC: $RPC"

CHAIN_ID=$(curl -sf -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(int(d['result'],16))")

echo "Chain ID: $CHAIN_ID"

BLOCK=$(curl -sf -X POST "$RPC" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(int(d['result'],16))")

echo "Block:    $BLOCK"
echo "RPC OK"
