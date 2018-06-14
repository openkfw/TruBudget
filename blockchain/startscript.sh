#!/bin/bash

# Settings for all nodes:
ORGANIZATION="${ORGANIZATION}"
CHAINNAME="${CHAINNAME:-DockerChain}"
RPC_PORT="${RPC_PORT:-8000}"
RPC_USER="${RPC_USER:-multichainrpc}"
RPC_PASSWORD="${RPC_PASSWORD:-this-is-insecure-change-it}"
RPC_ALLOW_IP="${RPC_ALLOW_IP:-0.0.0.0/0}"

# Settings for the master node:
EXTERNAL_IP="${EXTERNAL_IP}"

# Settings for other nodes:
P2P_HOST="${P2P_HOST}"
P2P_PORT="${P2P_PORT:-7447}"
API_PROTO="${API_PROTO:-https}"
API_HOST="${API_HOST:-$P2P_HOST}"
API_PORT="${API_PORT:-8080}"

# ---

function die() {
    echo "$@"
    exit 1
}

function ensure() {
    local var="$1"
    [[ -z "${!var}" ]] && die "$var not set."
}

ensure ORGANIZATION

is_master=
[[ -z "$P2P_HOST" ]] && is_master=1

blocknotify_arg=
[[ -n "$BLOCKNOTIFY_SCRIPT" ]] && blocknotify_arg="-blocknotify=\"$BLOCKNOTIFY_SCRIPT %s\""

external_ip_arg=
[[ -n "$EXTERNAL_IP" ]] && external_ip_arg="-externalip=$EXTERNAL_IP"

connect_arg="$CHAINNAME"
[[ $is_master ]] || connect_arg="${CHAINNAME}@${P2P_HOST}:${P2P_PORT}"

if [[ $is_master ]]; then
    multichain-util create $CHAINNAME \
    -anyone-can-connect=false \
    -anyone-can-send=false \
    -anyone-can-receive=true \
    -anyone-can-receive-empty=true \
    -anyone-can-create=false \
    -anyone-can-issue=false \
    -anyone-can-admin=false \
    -anyone-can-mine=false \
    -anyone-can-activate=false\
    -mining-diversity=0.8  \
    -mine-empty-rounds=1 \
    -protocol-version=20002 \
    -admin-consensus-upgrade=1 \
    -admin-consensus-admin=1 \
    -admin-consensus-activate=1 \
    -admin-consensus-mine=1 \
    -admin-consensus-create=1 \
    -admin-consensus-issue=1 \
    -root-stream-open=false

    # Reducing the target-adjust-freq ??, since we are permissioned
    # ENV PARAM_TARGET_ADJUST_FREQ='target-adjust-freq|-1'

    program=multichaind
else
    program="node /home/node/src/connectToChain.js"
    export API_PROTO
    export API_HOST
    export API_PORT
    export CHAINNAME
fi

# Passing the RPC config as runtime parameter below DOES NOT WORK as of
# MultiChain 2.0 alpha 2; also, we need the config for multichain-cli, too.
multichain_dir="/root/.multichain"
mkdir -p "$multichain_dir"
cat <<EOF >"${multichain_dir}/multichain.conf"
rpcport=$RPC_PORT
rpcuser=$RPC_USER
rpcpassword=$RPC_PASSWORD
rpcallowip=$RPC_ALLOW_IP
EOF

# By copying the configuration to the chain directory, we prevent multichaind from
# initializing the file with random values.
mkdir -p "${multichain_dir}/${CHAINNAME}/"
cp "${multichain_dir}/multichain.conf" "${multichain_dir}/${CHAINNAME}/"

exec $program \
-txindex \
$external_ip_arg \
$blocknotify_arg \
-port="$P2P_PORT" \
-autosubscribe=streams \
$connect_arg
