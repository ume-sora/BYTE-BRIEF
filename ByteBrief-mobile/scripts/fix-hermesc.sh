#!/bin/sh
# Fix hermesc execute permission on EAS (npm install can strip it on Linux).
set -e
HERMESC="node_modules/react-native/sdks/hermesc/linux64-bin/hermesc"
if [ -f "$HERMESC" ]; then
  chmod +x "$HERMESC"
  echo "hermesc: chmod +x done"
else
  echo "hermesc: not found at $HERMESC (optional)"
fi
