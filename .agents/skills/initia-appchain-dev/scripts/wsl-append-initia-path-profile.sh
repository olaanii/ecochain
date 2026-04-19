#!/usr/bin/env bash
set -euo pipefail
MARKER="# initia-appchain: minitiad + Go (user install)"
if grep -qF "$MARKER" ~/.profile 2>/dev/null; then
  echo "Already present in ~/.profile"
  exit 0
fi
printf '\n%s\nexport PATH="$HOME/go/bin:$HOME/.local/go-1.23.4/bin:$PATH"\n' "$MARKER" >> ~/.profile
echo "Appended to ~/.profile"
