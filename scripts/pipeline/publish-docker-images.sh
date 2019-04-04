#!/bin/bash
set -ev

export BUILDTIMESTAMP=$(date -Iseconds)
export TAG=trubudget/"$PROJECT_NAME":"$TRAVIS_BRANCH"

docker build --build-arg BUILDTIMESTAMP="$BUILDTIMESTAMP" --build-arg CI_COMMIT_SHA="$TRAVIS_COMMIT" --tag "$TAG" -f Dockerfile .

if [[ "$TRAVIS_EVENT_TYPE" = "pull_request" ]];
then
  echo "$PRIVATE_REGISTRY_PASSWORD" | docker login -u "$PRIVATE_REGISTRY_USERNAME" --password-stdin "$PRIVATE_REGISTRY"
  export TAG_BUILD_PRIVATE="$PRIVATE_REGISTRY_BASE/trubudget/$PROJECT_NAME:t_$TRAVIS_BUILD_ID"
  docker tag "$TAG" "$TAG_BUILD_PRIVATE"
  echo "Pushing [private]/trubudget/$PROJECT_NAME:$TRAVIS_BUILD_ID"
  docker push "$TAG_BUILD_PRIVATE" >/dev/null 2>&1
fi

if [[ "$TRAVIS_BRANCH" = "master" ]] && [[ "$TRAVIS_EVENT_TYPE" = "push" ]];
then
  echo "Enter Master Path"
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  docker push "$TAG"
fi

if [[ -n "$TRAVIS_TAG" ]];
then
  echo "Enter TAG Path"
  export TAG_LATEST=trubudget/"$PROJECT_NAME":latest
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  docker tag "$TAG" "$TAG_LATEST"
  docker push "$TAG"
  docker push "$TAG_LATEST"
fi