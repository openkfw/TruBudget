#!/bin/bash
set -ev

export BUILDTIMESTAMP=$(date -Iseconds)
export TAG=trubudget/$PROJECT_NAME:$TRAVIS_BRANCH
export TAG_BUILD=trubudget/$PROJECT_NAME:$TRAVIS_BUILD_ID
export TAG_LATEST=trubudget/$PROJECT_NAME:latest

docker build --build-arg BUILDTIMESTAMP=$BUILDTIMESTAMP --build-arg CI_COMMIT_SHA=$TRAVIS_COMMIT --tag $TAG -f Dockerfile .

if [ "$TRAVIS_BRANCH" = "master" ];
then
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  docker push $TAG
else
  echo "$PRIVATE_REGISTRY_PASSWORD" | docker login -u "$PRIVATE_REGISTRY_USERNAME" --password-stdin "$PRIVATE_REGISTRY"
  docker tag "$TAG" "$TAG_BUILD"
  docker push "$TAG_BUILD"
fi

if [ -n "$TRAVIS_TAG" ];
then
  docker tag "$TAG" "$TAG_LATEST"
  docker push "$TAG_LATEST"
fi