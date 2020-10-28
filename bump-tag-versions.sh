#!/bin/bash
trubudget_version=$1

if [ -z ${trubudget_version} ]; then
  echo "Usage: bash bump-tag-versions.sh [TAG-VERSION]"
  exit 0
fi
trubudget_projects=('frontend' 'api' 'blockchain' 'e2e-test' 'provisioning' 'excel-export' 'email-notification')
 
for project in "${trubudget_projects[@]}"
do
  eval "cd $project"
  eval "sed -i '/\"version\": \"/c\"version\": \"$trubudget_version\",' ./package.json"
  eval "npm install"
  eval "cd .."
done