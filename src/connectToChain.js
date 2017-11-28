const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');

const masterIP = process.env.MASTER_API || '127.0.0.1';
const masterPort = process.env.MASTER_API_PORT || '8080';
const chainName = process.env.CHAINNAME || 'ACMECorpChain';
const masterChainIP = process.env.MASTERNODE_IP || '127.0.0.2';
const masterChainPort = process.env.NETWORK_PORT || 7447;
const organization = process.env.ORGANIZATION || 'testorg';

let address = undefined;

const relax = async (ms) => new Promise(res => setInterval(res, ms))

const startMultichainDaemon = () => {
    const mc = spawn('multichaind', [`${chainName}@${masterChainIP}:${masterChainPort}`, " -shrinkdebugfilesize"]);
    mc.stdout.on('data', (data) => {
        const regex = new RegExp('[0-9a-zA-Z]{30,40}');
        const match = regex.exec(data);
        if (match) address = match[0];
    })

    mc.on('close', async (code) => {
        if (code === 1) {
            console.log(`>>> Connect: Failed to connect to Master. Retry in 5 Seconds...`);
            await relax(5000);
            startMultichainDaemon();
        } else {
            console.log('>>> Connect: Success!');
        }
    });
}

const waitForAddress = async () => {
    await relax(5000);
    if (!address) await waitForAddress();
}

const askMasterForPermissions = (address, organization) => axios.post(`http://${masterIP}:${masterPort}/nodes/`, {
    address,
    organization,
});

const registerNodeAtMaster = async () => {
    try {
        await waitForAddress();
        console.log(`>>> Access: Requesting Master to grant access for me (${address})`);
        await askMasterForPermissions(address, organization);
        console.log('>>> Access: Success!');
    } catch (error) {
        console.log(">>> Access: Error. Retry in 5 seconds ...");
        await relax(5000);
        await registerNodeAtMaster();
    }
}

startMultichainDaemon();
setTimeout(registerNodeAtMaster, 5000);




