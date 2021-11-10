#!/bin/bash
# example: bash bump-tag-versions.sh 1.0.0
trubudget_version=$1

if [ -z ${trubudget_version} ]; then
    echo "Usage: bash bump-tag-versions.sh [TAG-VERSION]"
    echo "Example: bash bump-tag-versions.sh 1.0.0"
    exit 0
fi
trubudget_projects=('frontend' 'api' 'blockchain' 'e2e-test' 'provisioning' 'excel-export-service' 'email-notification-service' 'storage-service')

for project in "${trubudget_projects[@]}"; do
    eval "cd $project"
    echo "Bumping $project ..."
    eval "perl -pi -e 's/\"version\": .*/\"version\": \"$trubudget_version\",/' ./package.json"
    eval "npm install --no-audit"
    echo "Auditing only production dependencies ..."
    eval "npm audit --production"
    eval "cd .."
done
