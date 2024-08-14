#!/bin/bash

echo "Checking for upgrades"

# Get the directory name of the current script file
SCRIPT_DIR="$(dirname -- $(cd "$(dirname -- "$0")" >/dev/null; pwd -P)/$(basename -- "$0"))"

if [ -d "$SCRIPT_DIR/../../api/trubudget-config" ] && [ -f "$SCRIPT_DIR/../../api/trubudget-config/upgrade_version.txt" ]; then
  # Define the path to your .env file
  ENV_FILE="$SCRIPT_DIR/.env"

  # change .env file
  cp $ENV_FILE $ENV_FILE.bak

  # Assign the provided version to a variable
  NEW_VERSION=$(cat $SCRIPT_DIR/../../api/trubudget-config/upgrade_version.txt)

  # Check if the version argument is provided
  if [ -z "$NEW_VERSION" ]; then
    exit 0
  fi

  # Use sed to replace the line starting with TAG=
  sed -E "s/^TAG=.*/TAG=$NEW_VERSION/" $ENV_FILE

  # Print success message
  echo "Updated TAG to $NEW_VERSION in $ENV_FILE"

  # Optionally, remove the backup file created by sed
  rm -f "${ENV_FILE}.bak"

  #Remove the upgrade.txt file
  rm -f $SCRIPT_DIR/../../api/trubudget-config/upgrade.txt

  # Restart the trubudget
  bash $SCRIPT_DIR/start-trubudget.sh $@

  

fi

