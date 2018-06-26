function run_vim() {
    if which vim; then
        vim "$@"
    else
        apt update && apt install -y vim && vim "$@"
    fi
}

alias l='ls -lha --color=yes'
alias vim=run_vim
