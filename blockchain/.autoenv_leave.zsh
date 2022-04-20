function set_alias() {
  echo "alias $@"
  alias "$@"
}

function unset_alias() {
  echo "unalias $@"
  unalias "$@"
}


set_alias Dc='docker-compose'

unset_alias multichain-cli
unset_alias beta-multichain-cli

unset_alias exec-alpha
unset_alias exec-beta

unset -f grant
unset -f grant_admin
unset -f grant_user

