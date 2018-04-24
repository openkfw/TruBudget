const axios = require("axios");

import { provisionUsers } from "./users";
import { provisionProjects } from "./projects";
import { sleep } from "./lib";
import * as winston from "winston";
import { MultichainClient } from "../multichain";

const DEFAULT_API_VERSION = "1.0";

axios.defaults.transformRequest = [
  (data, headers) => {
    if (typeof data === "object") {
      return {
        apiVersion: DEFAULT_API_VERSION,
        data: { ...data }
      };
    } else {
      return data;
    }
  },
  ...axios.defaults.transformRequest
];

const isReady = async axios => {
  const delaySec = 10;
  let isReady = false;
  while (!isReady) {
    try {
      await axios.get("/health");
      isReady = true;
    } catch (_err) {
      console.log(`The TruBudget API is not ready yet, trying again in ${delaySec}`);
      sleep(delaySec * 1000);
    }
  }
  console.log(`The TruBudget API is now ready.`);
};

const authenticate = async (axios, userId: string, rootSecret: string) => {
  const response = await axios.post("/user.authenticate", { id: userId, password: rootSecret });
  const body = response.data;
  if (body.apiVersion !== "1.0") throw Error("unexpected API version");
  return body.data.token;
};

function timeout(ms) {
  return () => new Promise(resolve => setTimeout(resolve, ms));
}

export const provisionBlockchain = async (port: number, rootSecret: string, multichainClient: MultichainClient) => {
  axios.defaults.baseURL = `http://localhost:${port}`;
  axios.defaults.timeout = 5000;

  let connected = false
  while (!connected) {
    try {
      winston.info('Checking multichain availability...')
      let info = await multichainClient.getInfo()
      winston.info(`Connected to ${info.nodeaddress}`)
      connected = true
    } catch (err) {
      winston.error('Error while checking multichain, retrying after pause...', err)
      await timeout(5000)
    }
  }

  let token = await authenticate(axios, "root", rootSecret);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  await provisionUsers(axios);
  token = await authenticate(axios, "mstein", "test");
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  await provisionProjects(axios);
};
