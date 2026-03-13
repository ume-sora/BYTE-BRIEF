#!/bin/bash
echo "=== post-install: fixing hermesc permissions ==="
HERMESC_PATH="$EAS_BUILD_WORKINGDIR/node_modules/react-native/sdks/hermesc/linux64-bin/hermesc"
if [ -f "$HERMESC_PATH" ]; then
  chmod +x "$HERMESC_PATH"
  echo "hermesc chmod +x done"
  ls -la "$HERMESC_PATH"
else
  echo "ERROR: hermesc not found at $HERMESC_PATH"
  find "$EAS_BUILD_WORKINGDIR/node_modules/react-native/sdks" -name "hermesc" 2>/dev/null || true
fi

