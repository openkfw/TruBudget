#!/bin/bash

# Get the directory name of the current script file
SCRIPT_DIR="$(dirname -- $(cd "$(dirname -- "$0")" >/dev/null; pwd -P)/$(basename -- "$0"))"

# Check if any of the parameters is equal to "-d"
if [[ ! " $@ " =~ " --no-log " ]]; then
  # Add "-d" to the parameters
  set -- "$@" "--no-log"
fi

# Run start-trubudget.sh with all parameters
sh "$SCRIPT_DIR/start-trubudget.sh" "$@"

# Clear old records from crontab
crontab -l | grep -E -v "\*\/3 \* \* \* \* \/bin\/bash ${SCRIPT_DIR}\/upgrade-trubudget\.sh.*" | head -1 | crontab -

dockerCmd=$(which docker)

# Create cron job to run upgrade script every 5 minutes
(crontab -l ; echo "*/3 * * * * /bin/bash ${SCRIPT_DIR}/upgrade-trubudget.sh ${dockerCmd} $@ 1> ${SCRIPT_DIR}/cronjob.output 2> ${SCRIPT_DIR}/cronjob.err") | crontab -
