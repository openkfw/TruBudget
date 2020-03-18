#!/bin/bash
# DEPRECATED - use npm audit --audit-level instead
set -e

if [[ "$TRAVIS_EVENT_TYPE" = "cron" ]] || (git diff --name-only "$TRAVIS_COMMIT_RANGE" | grep -q "$PROJECT_NAME/");
then
  node -e '
  const { exec } = require("child_process");
  exec("npm audit --json", (err, stdout, stderr) => {
    if (!stdout && err) {
      console.error(err);
      process.exit(1);
    }

    const result = JSON.parse(stdout);
    if (result && result.metadata && result.metadata.vulnerabilities && result.metadata.vulnerabilities.high && result.metadata.vulnerabilities.high > 0) {
      console.error("NPM Audit found high vulnerabilities:", result.metadata.vulnerabilities);
      process.exit(1);
    }

    console.log("Everything OK. No high vulnerabilities found.");
  });';
else
  echo "No file changes found in $PROJECT_NAME and not triggered by cron. Skipping audit.";
fi