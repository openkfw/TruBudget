import axios from "axios";
import * as winston from "winston";

const retryIntervalMs = 5000;

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function waitUntilReady(port: number): Promise<void> {
  let isReady = false;
  while (!isReady) {
    try {
      await axios.get(`http://localhost:${port}/api/readiness`);
      isReady = true;
    } catch (err) {
      winston.error(`API not ready yet (${err}) - retry in ${retryIntervalMs} ms.`);
      await timeout(retryIntervalMs);
    }
  }
}
