#!/bin/bash

echo "Checking for upgrades"

# Get the directory name of the current script file
SCRIPT_DIR="$(dirname -- $(cd "$(dirname -- "$0")" >/dev/null; pwd -P)/$(basename -- "$0"))"

# Find docker
dockerCmd="$1"

# Check if the trubudget-config directory exists and the upgrade_version.txt file exists in docker container
NEW_VERSION=$($dockerCmd exec trubudget-operation-alpha-api-1 cat /home/node/src/trubudget-config/upgrade_version.txt)

if [ -d "$SCRIPT_DIR/../../api/src/trubudget-config" ] && [ -f "$SCRIPT_DIR/../../api/src/trubudget-config/upgrade_version.txt" ]; then
  # Define the path to your .env file
  ENV_FILE="$SCRIPT_DIR/.env"

  # change .env file
  cp $ENV_FILE $ENV_FILE.bak

  # Assign the provided version to a variable
  NEW_VERSION=$(cat $SCRIPT_DIR/../../api/src/trubudget-config/upgrade_version.txt)

  # Check if the version argument is provided
  if [ -z "$NEW_VERSION" ]; then
    exit 0
  fi

  if grep -q "TAG=$NEW_VERSION" "$ENV_FILE"; then
      echo "Same version $NEW_VERSION is already running"

      #Remove the upgrade.txt file
      rm -f $SCRIPT_DIR/../../api/src/trubudget-config/upgrade_version.txt
      exit 0
  fi

  # Use sed to replace the line starting with TAG=
  cat $ENV_FILE | sed -e "s/^TAG=.*/TAG=$NEW_VERSION/" 2>&1 | tee $ENV_FILE

  # Print success message
  echo "Updated TAG to $NEW_VERSION in $ENV_FILE"

  cat $ENV_FILE

  # Optionally, remove the backup file created by sed
  rm -f "${ENV_FILE}.bak"

  #Remove the upgrade.txt file
  rm -f $SCRIPT_DIR/../../api/src/trubudget-config/upgrade_version.txt

  # Restart the trubudget
  bash $SCRIPT_DIR/start-trubudget.sh $@
  
fi

