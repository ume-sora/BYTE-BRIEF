#!/bin/sh
# Expo Metro resolves hermesc to react-native/sdks/hermesc/<platform>-bin/hermesc.
# The published react-native npm package often omits linux64-bin; EAS Linux then fails.
# Official Hermes releases ship linux CLI only up through v0.13.0 (newer tags have no asset).
set -e
HERMESC_DIR="node_modules/react-native/sdks/hermesc/linux64-bin"
HERMESC="${HERMESC_DIR}/hermesc"
# Newest GitHub release that includes hermes-cli-linux.tar.gz (root contains ./hermesc).
DEFAULT_URL="https://github.com/facebook/hermes/releases/download/v0.13.0/hermes-cli-linux.tar.gz"
URL="${HERMES_CLI_LINUX_URL:-$DEFAULT_URL}"

case "$(uname -s)" in
  Linux)
    mkdir -p "$HERMESC_DIR"
    if [ ! -f "$HERMESC" ] || [ ! -s "$HERMESC" ]; then
      echo "hermesc: downloading linux prebuilt (Hermes CLI tarball)..."
      tmp="$(mktemp -d)"
      curl -fL "$URL" -o "${tmp}/cli.tar.gz"
      tar -xzf "${tmp}/cli.tar.gz" -C "$tmp"
      if [ ! -f "${tmp}/hermesc" ]; then
        echo "hermesc: archive did not contain ./hermesc" >&2
        exit 1
      fi
      cp "${tmp}/hermesc" "$HERMESC"
      rm -rf "$tmp"
    fi
    chmod +x "$HERMESC"
    echo "hermesc: OK at $HERMESC"
    ;;
  *)
    if [ -f "$HERMESC" ]; then
      chmod +x "$HERMESC"
      echo "hermesc: chmod +x done"
    else
      echo "hermesc: skip (host is not Linux; no $HERMESC)"
    fi
    ;;
esac
