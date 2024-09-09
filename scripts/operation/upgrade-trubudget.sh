#!/bin/bash

timestamp=$(date +%F_%T)
echo "Checking for upgrades ($timestamp)"

# Get the directory name of the current script file
SCRIPT_DIR="$(dirname -- $(cd "$(dirname -- "$0")" >/dev/null; pwd -P)/$(basename -- "$0"))"

# Find docker
dockerCmd="$1"

# Check if the trubudget-config directory exists and the upgrade_version.txt file exists in docker container
# NEW_VERSION=$($dockerCmd exec trubudget-operation-alpha-api-1 cat /home/node/src/trubudget-config/upgrade_version.txt)

# Create file indicating upradable app if it doesn't exist
if [ -d "$SCRIPT_DIR/../../api/src/trubudget-config" ] && [ ! -f "$SCRIPT_DIR/../../api/src/trubudget-config/upgradable.txt" ]; then
  echo "App is upgradable, creating file indicating upgradable app"
  echo "App is upgradable" > $SCRIPT_DIR/../../api/src/trubudget-config/upgradable.txt
fi

RUNNING_CONTAINERS=$($dockerCmd ps)
# Check if file indicatig upgrade request exists
if [ -d "$SCRIPT_DIR/../../api/src/trubudget-config" ] && [ -f "$SCRIPT_DIR/../../api/src/trubudget-config/upgrade_version.txt" ]; then
  echo "Upgrading TruBudget"
# Check if the trubudget is not running
elif [[ ${RUNNING_CONTAINERS} != *"trubudget-operation-alpha-api"* ]]; then
  echo "TruBudget is not running"
else 
  echo "No upgrade requested"
  exit 0
fi

# Define the path to your .env file
ENV_FILE="$SCRIPT_DIR/.env"

# change .env file
cp $ENV_FILE $ENV_FILE.bak

# Assign the provided version to a variable
NEW_VERSION=$(cat $SCRIPT_DIR/../../api/src/trubudget-config/upgrade_version.txt)

# Check if the version argument is provided
if [ -z "$NEW_VERSION" ]; then
  echo "No version provided"
else
  echo "Upgrading to version $NEW_VERSION"

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
fi


# Remove the backup file created by sed
rm -f "${ENV_FILE}.bak"

#Remove the upgrade.txt file
rm -f $SCRIPT_DIR/../../api/src/trubudget-config/upgrade_version.txt

# Restart the trubudget
bash $SCRIPT_DIR/start-trubudget.sh $@



