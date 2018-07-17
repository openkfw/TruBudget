#!/bin/bash

set -e

jobPodsJson=$(kubectl get pod -l job-name=trubudget-test-provisioning -n $1 -a -o json)

state=$(echo $jobPodsJson | jq '.items[].status.containerStatuses[0].state' || "")
status=$(echo $state | jq '.terminated.reason')

if [ -n "${state}" ] && [ -n "${status}" ]; then
  exitCode=$(echo $state | jq '.terminated.exitCode')
  status=$(echo $state | jq '.terminated.reason')
  
  echo "Job completed. Status: ${status}. Exit code: ${exitCode}"
  kubectl delete job chrome -n my-end-to-end-tests --ignore-not-found=true --force=true --now=true
  exit $(printf "%d" $exitCode)
fi