#!/bin/bash
set -ev

Help()
{
    # Display Help
    echo
    echo "Help"
    echo "This script publishes images to our private registry or to docker hub depending on the GITHUB_EVENT_NAME"
    echo "Event names:"
    echo "pull_request: If a pull request is updated images are built and pushed to our private registry"
    echo "push(main): If a pull request is merged images are built and pushed to private registry (on pull request close) and docker hub (on main push)"
    echo "release:      If a release is published images are pushed to docker hub including the :latest and the :[version] tag (e.g. :v1.10.0)"
    echo
    echo "Hint: Make sure you are in the current directory of the Dockerfile"
    echo
    echo "Syntax: $(basename "$0") [option]"
    echo "Example: $(basename "$0") --project api -in trubudget/api"
    echo "options:"
    echo "-p  | --project           The project folder name"
    echo "-in | --image-name        The name of the docker image which shall be pushed (e.g. trubudget/api)"
    echo "-rt | --release-version   The version number of the release tag which shall be pushed to docker hub"
    echo "-h  | --help              Print the help section"
    echo
}

while [ "$1" != "" ]; do
    case $1 in
        -p|--project)
            PROJECT_NAME="$2"
            echo "$PROJECT_NAME"
            shift # past argument
            shift # past value
        ;;
        -in|--image-name)
            IMAGE_NAME="$2"
            echo "$IMAGE_NAME"
            shift # past argument
            shift # past value
        ;;
        -rt|--release-version)
            RELEASE_VERSION="$2"
            echo "$IMAGE_NAME"
            shift # past argument
            shift # past value
        ;;
        -h|--help)
            Help
            exit 1
        ;;
        *)    # unknown option
            shift # past argument
        ;;
    esac
done

export BUILDTIMESTAMP=$(date -Iseconds)
# Get github branch value
# Value is found on different locations depending on the github event
if [ -n "$GITHUB_HEAD_REF" ]; then
    export GITHUB_BRANCH="$GITHUB_HEAD_REF"
fi
export TAG="$IMAGE_NAME:$GITHUB_BRANCH"
if [[ "$GITHUB_EVENT_NAME" = "release" ]];
then
    # placeholder so docker build is working correctly
    TAG="release"
fi

# build docker image with TAG
docker build --build-arg BUILDTIMESTAMP="$BUILDTIMESTAMP" --build-arg CI_COMMIT_SHA="$GITHUB_SHA" --tag "$TAG" -f Dockerfile .

# if a pull request is updated
if [[ "$GITHUB_EVENT_NAME" = "pull_request" ]] || ([[ "$GITHUB_BRANCH" = "2.0.0-release" ]] && [[ "$GITHUB_EVENT_NAME" = "push" ]]);
then
    # log into private registry
    echo "$PRIVATE_REGISTRY_PASSWORD" | docker login -u "$PRIVATE_REGISTRY_USERNAME" --password-stdin "$PRIVATE_REGISTRY"
    # push to private registry including the GITHUB_RUN_ID tag
    export TAG_BUILD_PRIVATE="$PRIVATE_REGISTRY_BASE/$IMAGE_NAME:t_$GITHUB_RUN_ID"
    echo "Image pushed: $TAG_BUILD_PRIVATE"
    docker tag "$TAG" "$TAG_BUILD_PRIVATE"
    docker push "$TAG_BUILD_PRIVATE" >/dev/null 2>&1
fi

# if main branch is updated
if [[ "$GITHUB_BRANCH" = "main" ]] && [[ "$GITHUB_EVENT_NAME" = "push" ]];
then
    # log into docker hub
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    docker push "$TAG"
fi

# if new release is published push 2 images:
# - :latest
# - :RELEASE_VERSION (e.g. :v1.10.0)
if [[ "$GITHUB_EVENT_NAME" = "release" ]];
then
    export TAG_LATEST="$IMAGE_NAME":latest
    export TAG_RELEASE="$IMAGE_NAME:$RELEASE_VERSION"
    # log into docker hub
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
    docker tag "$TAG" "$TAG_RELEASE"
    docker push "$TAG_RELEASE"
    docker tag "$TAG" "$TAG_LATEST"
    docker push "$TAG_LATEST"
fi