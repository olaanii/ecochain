#!/bin/bash
set -euo pipefail

ECO_REWARD="${1:-}"
ECO_VERIFIER="${2:-}"
OPERATOR_KEY="${INITIA_OPERATOR_KEY:-gas-station}"
KEYRING_BACKEND="${INITIA_KEYRING_BACKEND:-test}"
CHAIN_ID="${INITIA_CHAIN_ID:-ecochain105}"
TX_GAS="${INITIA_TX_GAS:-2000000}"
TX_FEES="${INITIA_TX_FEES:-1000GAS}"

if [[ -z "$ECO_REWARD" || -z "$ECO_VERIFIER" ]]; then
	echo "Usage: $(basename "$0") <eco_reward_address> <eco_verifier_address>" >&2
	exit 1
fi

if ! initiad keys show "$OPERATOR_KEY" --keyring-backend "$KEYRING_BACKEND" >/dev/null 2>&1; then
	echo "Missing key '$OPERATOR_KEY' in the '$KEYRING_BACKEND' keyring." >&2
	echo "Set INITIA_OPERATOR_KEY to a funded account before running this script." >&2
	exit 1
fi

echo "Authorizing Verifier $ECO_VERIFIER on $ECO_REWARD..."
CALLDATA="$($HOME/.foundry/bin/cast calldata "setVerifier(address,bool)" "$ECO_VERIFIER" true)"
minitiad tx evm call "$ECO_REWARD" "$CALLDATA" --from "$OPERATOR_KEY" --keyring-backend "$KEYRING_BACKEND" --gas "$TX_GAS" --fees "$TX_FEES" --chain-id "$CHAIN_ID" -y
sleep 2

echo "Task 1..."
# 20 ECO
CALLDATA="$($HOME/.foundry/bin/cast calldata "setTask(string,uint256)" "low_impact_commute" 20000000000000000000)"
minitiad tx evm call "$ECO_VERIFIER" "$CALLDATA" --from "$OPERATOR_KEY" --keyring-backend "$KEYRING_BACKEND" --gas "$TX_GAS" --fees "$TX_FEES" --chain-id "$CHAIN_ID" -y
sleep 2

echo "Task 2..."
# 5 ECO
CALLDATA="$($HOME/.foundry/bin/cast calldata "setTask(string,uint256)" "recycling_pickup" 5000000000000000000)"
minitiad tx evm call "$ECO_VERIFIER" "$CALLDATA" --from "$OPERATOR_KEY" --keyring-backend "$KEYRING_BACKEND" --gas "$TX_GAS" --fees "$TX_FEES" --chain-id "$CHAIN_ID" -y
sleep 2

echo "Task 3..."
# 50 ECO
CALLDATA="$($HOME/.foundry/bin/cast calldata "setTask(string,uint256)" "energy_saving_goal" 50000000000000000000)"
minitiad tx evm call "$ECO_VERIFIER" "$CALLDATA" --from "$OPERATOR_KEY" --keyring-backend "$KEYRING_BACKEND" --gas "$TX_GAS" --fees "$TX_FEES" --chain-id "$CHAIN_ID" -y
