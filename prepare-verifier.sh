#!/bin/bash
BIN=$(cat contracts/out/EcoVerifier.sol/EcoVerifier.json | jq -r '.bytecode.object' | sed 's/^0x//' | tr -d '\n')
ARGS=$($HOME/.foundry/bin/cast abi-encode "constructor(address)" $1 | sed 's/^0x//' | tr -d '\n')
echo -n "$BIN$ARGS" > EcoVerifier.bin
