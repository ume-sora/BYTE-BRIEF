#!/bin/bash
echo "=== pre-install: fixing hermesc permissions ==="
HERMESC_PATH="$EAS_BUILD_WORKINGDIR/node_modules/react-native/sdks/hermesc/linux64-bin/hermesc"
if [ -f "$HERMESC_PATH" ]; then
  chmod +x "$HERMESC_PATH"
  echo "hermesc chmod +x done"
else
  echo "hermesc not found yet (will retry in post-install)"
fi

