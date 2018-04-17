const axios = require("axios");

import { provisionUsers } from "./users";
import { provisionProjects } from "./projects";
import { sleep } from "./lib";

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

const authenticate = async (axios, userId: string, rootSecret: string) => {
  try {
    const response = await axios.post("/user.authenticate", { id: userId, password: rootSecret });
    const body = response.data;
    if (body.apiVersion !== "1.0") throw Error("unexpected API version");
    const { token } = body.data;
    return token;
  } catch (err) {
    console.log(err);
    console.log("Seems that BC is not up yet, will wait 10 secs");
    sleep(10000);
    authenticate(axios, userId, rootSecret);
  }
};

export const provisionBlockchain = async (port: number, rootSecret: string) => {
  axios.defaults.baseURL = `http://localhost:${port}`;
  axios.defaults.timeout = 20000;
  let token = await authenticate(axios, "root", rootSecret);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  await provisionUsers(axios);
  token = await authenticate(axios, "mstein", "test");
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  await provisionProjects(axios);
};
