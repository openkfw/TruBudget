#!/bin/bash
# We cannot modify your .git folder where the hooks are stored in
# but we can set you default hooksPath so we can apply git-secrets to following hooks:
# commit-msg
# pre-commit
# prepare-commit-msg

cd "$(dirname "${BASH_SOURCE[0]}")"
FILE="./git-secrets-patterns"
YELLOW='\033[1;33m'

is_patterns_installed() {
    installedPatterns=$(git config --get-all secrets.patterns | sed ':a;N;$!ba;s/[\n\s]//g')
    gitSecretsPatterns=$(cat $FILE | sed ':a;N;$!ba;s/[\n\s]//g')
    if [[ "$installedPatterns" == "$gitSecretsPatterns" ]]; then
        return 1 # false
    else
        return 0 # true
    fi
}

if [[ ! $(command -v git-secrets) ]]; then
    echo -e "${YELLOW}Warning: awslabs/git-secrets not installed"
    echo -e "${YELLOW}See 'https://github.com/awslabs/git-secrets#installing-git-secrets' for further information"
else
    if [[ ! $(git config --get core.hooksPath) == ".githooks" ]]; then
        git config core.hooksPath .githooks
        chmod +x "./commit-msg"
        chmod +x "./pre-commit"
        chmod +x "./prepare-commit-msg"
        echo "git config: core.hooksPath set to .githooks"
    fi
    if is_patterns_installed; then
        while IFS= read line; do
            git-secrets --add "$line"
        done <"$FILE"
        git-secrets --add "$line"
        echo "git config: git-secret-patterns set to listet patterns in '.githooks/git-secret-patterns'"
    fi
fi
