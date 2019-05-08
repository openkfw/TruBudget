#!/bin/bash

prog="$0"

function usage() {
    echo "$prog [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]"
    echo
    echo "Looks into all top-level package directories and bumps the version according to the given value."
    echo "For JS/TS projects the script writes the new version back to the package.json, package-lock.json, and, if present, npm-shrinkwrap.json files."
}

if [[ $# -ne 1 ]]; then
    usage
    exit 0
fi

git diff-index --quiet HEAD || { echo "commit or stash your changes first" 1>&2; exit 1; }

for dir in */; do
    (cd "$dir" && [[ -e package.json ]] && npm version "$@")
done

git status
