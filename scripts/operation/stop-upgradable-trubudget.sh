#!/bin/bash

# Get the directory name of the current script file
SCRIPT_DIR="$(dirname -- $(cd "$(dirname -- "$0")" >/dev/null; pwd -P)/$(basename -- "$0"))"

crontab -l | grep -E -v "\*\/3 \* \* \* \* \/bin\/bash ${SCRIPT_DIR}\/upgrade-trubudget\.sh.*" | head -1 | crontab -
