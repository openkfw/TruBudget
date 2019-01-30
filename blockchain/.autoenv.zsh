function set_alias() {
  echo "alias $@"
  alias "$@"
}

chainname=TrubudgetChain

export HOST_IP="$(ifconfig en0 inet | grep 'inet ' | awk '{ print $2 }')"

[[ -r my-docker-compose.yml ]] \
  && set_alias Dc='docker-compose -f my-docker-compose.yml'

set_alias multichain-cli="Dc exec master-node multichain-cli $chainname"
set_alias slave-multichain-cli="Dc exec slave-node multichain-cli $chainname"

set_alias exec-master='Dc exec master-node bash'
set_alias exec-slave='Dc exec slave-node bash'

echo function grant
function grant() {
  local address="$1"
  local permissions="$2"
  multichain-cli grant "$address" "$permissions"
}

echo function grant_admin
function grant_admin() {
  local address="$1"
  grant "$address" connect,send,receive,issue,create,mine,activate,admin
}

echo function grant_user
function grant_user() {
  local address="$1"
  grant "$address" connect,send,receive
}
