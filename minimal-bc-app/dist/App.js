"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const crypto = require("crypto");
const { GetBlock } = require('multichain-api/Commands/GetBlock');
const { Create } = require('multichain-api/Commands/Create');
const { ListStreams } = require('multichain-api/Commands/ListStreams');
const { ListStreamItems } = require('multichain-api/Commands/ListStreamItems');
const { Publish } = require('multichain-api/Commands/Publish');
const { RpcClient } = require('multichain-api/RpcClient');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const multichain = RpcClient({
    protocol: 'http',
    host: 'localhost',
    port: 8000,
    username: 'multichainrpc',
    password: 's750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j'
});
exports.createHashFromData = data => crypto.createHash('sha256').update(data).digest('hex');
router.post("/streams", async (req, res) => {
    const { name } = req.body;
    const response = await multichain(Create('stream', name, true));
    res.send(response.result);
});
router.get("/streams", async (req, res) => {
    const response = await multichain(ListStreams());
    res.send(response.result);
});
router.get("/streams/:streamName/items", async (req, res) => {
    const { streamName } = req.params;
    const response = await multichain(ListStreamItems(streamName));
    res.send(response.result);
});
router.post("/streams/:streamName/items", async (req, res) => {
    const { key, value } = req.body;
    const { streamId } = req.params;
    const response = await multichain(Publish(streamId, key, exports.createHashFromData(value)));
    res.send(response.result);
});
app.use(bodyParser.json());
// to support application/x-www-form-urlencoded forms (e.g. user "login")
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", router);
exports.default = app;
//# sourceMappingURL=App.js.map