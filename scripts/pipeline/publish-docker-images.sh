#!/bin/bash
set -ev

export BUILDTIMESTAMP=$(date -Iseconds)
if [ -n "$GITHUB_HEAD_REF" ]; then
  export GITHUB_BRANCH="$GITHUB_HEAD_REF"
fi
export TAG=trubudget/"$PROJECT_NAME":"$GITHUB_BRANCH"

if [[ "$GITHUB_EVENT_NAME" = "release" ]]; then
  TAG=trubudget/"$PROJECT_NAME":"$SOURCE_TAG"
fi
echo "/trubudget/$PROJECT_NAME:t_$GITHUB_RUN_ID"

docker build --build-arg BUILDTIMESTAMP="$BUILDTIMESTAMP" --build-arg CI_COMMIT_SHA="$GITHUB_SHA" --tag "$TAG" -f Dockerfile .

if [[ "$GITHUB_EVENT_NAME" = "pull_request" ]];
then
  echo "$PRIVATE_REGISTRY_PASSWORD" | docker login -u "$PRIVATE_REGISTRY_USERNAME" --password-stdin "$PRIVATE_REGISTRY"
  export TAG_BUILD_PRIVATE="$PRIVATE_REGISTRY_BASE/trubudget/$PROJECT_NAME:t_$GITHUB_RUN_ID"
  docker tag "$TAG" "$TAG_BUILD_PRIVATE"
  docker push "$TAG_BUILD_PRIVATE" >/dev/null 2>&1
fi

if [[ "$GITHUB_BRANCH" = "master" ]] && [[ "$GITHUB_EVENT_NAME" = "push" ]];
then
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  docker push "$TAG"
fi

if [[ "$GITHUB_EVENT_NAME" = "release" ]];
then
  export TAG_LATEST=trubudget/"$PROJECT_NAME":latest
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  docker tag "$TAG" "$TAG_LATEST"
  docker push "$TAG"
  docker push "$TAG_LATEST"
fi