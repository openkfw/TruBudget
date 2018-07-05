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
unset_alias slave-multichain-cli

unset_alias exec-master
unset_alias exec-slave

unset -f grant
unset -f grant_admin
unset -f grant_user

