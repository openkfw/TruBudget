#!/bin/bash
set -e

if git diff --name-only "$TRAVIS_COMMIT_RANGE" | grep -q "$PROJECT_NAME/" || ["$TRAVIS_EVENT_TYPE" = 'cron'];
then
  node -e '
  const { exec } = require("child_process");
  exec("npm audit --json", (err, stdout, stderr) => {
    if (!stdout && err) {
      console.error(err);
      process.exit(1);
    }
    const {
      metadata: { vulnerabilities }
    } = JSON.parse(stdout);

    if (vulnerabilities.high > 0) {
      console.error("NPM Audit found high vulnerabilities:", vulnerabilities);
      process.exit(1);
    }
  });';
else
  echo "No file changes found in $PROJECT_NAME and not triggered by cron. Skipping audit.";
fi