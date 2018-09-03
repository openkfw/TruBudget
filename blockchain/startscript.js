const shell = require('shelljs');

const ORGANIZATION= process.env.ORGANIZATION || "MyOrga"
const CHAINNAME = process.env.CHAINNAME || "TruBudgetChain"
const RPC_PORT=process.env.RPC_PORT || 8000
const RPC_USER = process.env.RPC_USER || "multichainrpc"
const RPC_PASSWORD = process.env.RPC_PASSWORD || "this-is-insecure-change-it"
const RPC_ALLOW_IP = process.env.RPC_ALLOW_IP || "0.0.0.0/0"

const EXTERNAL_IP = process.env.EXTERNAL_IP
const P2P_HOST = process.env.P2P_HOST
const P2P_PORT = process.env.P2P_PORT || 7447

const API_PROTO = process.env.API_PROTO
const API_HOST = process.env.API_HOST
const API_PORT = process.env.API_PORT


const multichainDir="/root/.multichain"
let isMaster = !P2P_HOST? true : false;
let blockNotifyArg = process.env.BLOCKNOTIFY_SCRIPT ? `-blocknotify=${BLOCKNOTIFY_SCRIPT}`: ""
let externalIpArg = process.env.EXTERNAL_IP ? `-externalip=${EXTERNAL_IP}`: "";
let connectArg = !isMaster?`${CHAINNAME}@${P2P_HOST}:${P2P_PORT}`: '';


if (isMaster) {
  shell.exec(`multichain-util create ${CHAINNAME} -anyone-can-connect=false -anyone-can-send=false -anyone-can-receive=true -anyone-can-receive-empty=true -anyone-can-create=false -anyone-can-issue=false -anyone-can-admin=false -anyone-can-mine=false -anyone-can-activate=false-mining-diversity=0.3 -mine-empty-rounds=1 -protocol-version=20002 -admin-consensus-upgrade=.51 -admin-consensus-admin=.51 -admin-consensus-activate=.51 -admin-consensus-mine=.51 -admin-consensus-create=0 -admin-consensus-issue=0 -root-stream-open=false`)
}

// else
//     program="node /home/node/src/connectToChain.js"
//     export API_PROTO
//     export API_HOST
//     export API_PORT
//     export CHAINNAME
// fi


shell.mkdir('-p', multichainDir)

shell.exec(`cat <<EOF >"${multichainDir}/multichain.conf"
rpcport=${RPC_PORT}
rpcuser=${RPC_USER}
rpcpassword=${RPC_PASSWORD}
rpcallowip=${RPC_ALLOW_IP}
EOF
`)


shell.mkdir('-p', `${multichainDir}/${CHAINNAME}`)
shell.cp(`${multichainDir}/multichain.conf`, `${multichainDir}/${CHAINNAME}`)
console.log(`multichaind -txindex \
${externalIpArg} \
${blockNotifyArg} \
-port="${P2P_PORT}" \
-autosubscribe=streams \
${connectArg}`)

shell.exec(`multichaind -txindex ${CHAINNAME} \
 ${externalIpArg} \
 ${blockNotifyArg} \
 -port=${P2P_PORT} \
 -autosubscribe=streams \
 ${connectArg}`)




// exec $program \
// -txindex \
// $externalIpArg \
// $blockNotifyArg \
// -port="$P2P_PORT" \
// -autosubscribe=streams \
// $connectArg
