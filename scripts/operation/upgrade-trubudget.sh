#!/bin/bash

# Get the directory name of the current script file
SCRIPT_DIR="$(dirname -- $(cd "$(dirname -- "$0")" >/dev/null; pwd -P)/$(basename -- "$0"))"

if [ -d "./api/trubudget-config" ] && [ -f "./api/trubudget-config/upgrade.txt" ]; then
  bash $SCRIPT_DIR/start-trubudget.sh --down
fi

