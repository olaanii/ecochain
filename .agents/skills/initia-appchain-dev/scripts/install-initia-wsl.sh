#!/usr/bin/env bash
# One-shot Initia CLI setup for WSL (no sudo). Aligns with install-tools.sh versions.
set -euo pipefail

# Pinned weave matches skill install-tools.sh; initiad tracks current GitHub release naming (Linux_x86_64 / static).
INITIAD_VERSION="v1.4.0"
WEAVE_VERSION="v0.3.5"
GO_VERSION="1.23.4"

INSTALL_DIR="${HOME}/.local/bin"
GO_ROOT="${HOME}/.local/go-${GO_VERSION}"

mkdir -p "${INSTALL_DIR}"

echo "[1/4] weave (${WEAVE_VERSION}) -> ${INSTALL_DIR}"
WEAVE_URL="https://github.com/initia-labs/weave/releases/download/${WEAVE_VERSION}/weave-${WEAVE_VERSION#v}-linux-amd64.tar.gz"
curl -fsSL -o /tmp/weave.tar.gz "${WEAVE_URL}"
tar -xzf /tmp/weave.tar.gz -C "${INSTALL_DIR}"
chmod +x "${INSTALL_DIR}/weave"
rm -f /tmp/weave.tar.gz

echo "[2/4] initiad (${INITIAD_VERSION}) -> ${INSTALL_DIR}"
INITIAD_ASSET="initia_${INITIAD_VERSION}_Linux_x86_64_static.tar.gz"
INITIAD_URL="https://github.com/initia-labs/initia/releases/download/${INITIAD_VERSION}/${INITIAD_ASSET}"
if ! curl -fsSL -o /tmp/initiad.tar.gz "${INITIAD_URL}"; then
  INITIAD_ASSET="initia_${INITIAD_VERSION}_Linux_x86_64.tar.gz"
  INITIAD_URL="https://github.com/initia-labs/initia/releases/download/${INITIAD_VERSION}/${INITIAD_ASSET}"
  curl -fsSL -o /tmp/initiad.tar.gz "${INITIAD_URL}"
fi
tar -xzf /tmp/initiad.tar.gz -C "${INSTALL_DIR}" initiad
chmod +x "${INSTALL_DIR}/initiad"
rm -f /tmp/initiad.tar.gz

echo "[3/4] Go ${GO_VERSION} (user-local) -> ${GO_ROOT}"
if [[ ! -x "${GO_ROOT}/bin/go" ]]; then
  curl -fsSL -o /tmp/go.tgz "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
  rm -rf "${GO_ROOT}"
  mkdir -p "$(dirname "${GO_ROOT}")"
  tar -C "$(dirname "${GO_ROOT}")" -xzf /tmp/go.tgz
  mv "$(dirname "${GO_ROOT}")/go" "${GO_ROOT}"
  rm -f /tmp/go.tgz
fi
export PATH="${GO_ROOT}/bin:${PATH}"
export GOPATH="${HOME}/go"
export GOBIN="${GOPATH}/bin"
mkdir -p "${GOBIN}"

echo "[4/4] minitiad from minievm (make install)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "${WORKDIR}"' EXIT
git clone --depth 1 https://github.com/initia-labs/minievm.git "${WORKDIR}/minievm"
(cd "${WORKDIR}/minievm" && make install)

MARKER="# initia-appchain PATH (added by install-initia-wsl.sh)"
BASHRC="${HOME}/.bashrc"
PATH_BLOCK="${MARKER}
export PATH=\"\${HOME}/.local/bin:\${HOME}/go/bin:\${HOME}/.local/go-${GO_VERSION}/bin:\${PATH}\"
"
if ! grep -qF "${MARKER}" "${BASHRC}" 2>/dev/null; then
  printf '\n%s\n' "${PATH_BLOCK}" >> "${BASHRC}"
  echo "Appended PATH block to ${BASHRC}"
else
  echo "PATH block already present in ${BASHRC}"
fi

PROFILE="${HOME}/.profile"
PROFILE_MARKER="# initia-appchain: minitiad + Go (user install)"
if ! grep -qF "${PROFILE_MARKER}" "${PROFILE}" 2>/dev/null; then
  printf '\n%s\nexport PATH="$HOME/go/bin:$HOME/.local/go-%s/bin:$PATH"\n' "${PROFILE_MARKER}" "${GO_VERSION}" >> "${PROFILE}"
  echo "Appended Go/minitiad PATH to ${PROFILE} (for non-interactive WSL)"
fi

export PATH="${INSTALL_DIR}:${GOBIN}:${GO_ROOT}/bin:${PATH}"

echo "--- verify ---"
command -v weave && weave version
command -v initiad && initiad version
command -v minitiad && minitiad version --long | head -20
