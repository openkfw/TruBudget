const axios = require("axios");

import { provisionUsers } from "./users";
import { provisionProjects } from "./projects";

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

const authenticate = async (axios, rootSecret: string) => {
  const response = await axios.post("/user.authenticate", { id: "root", password: rootSecret });
  const body = response.data;
  if (body.apiVersion !== "1.0") throw Error("unexpected API version");
  const { token } = body.data;
  console.log(token);
  return token;
};

export const provisionBlockchain = async (port: number, rootSecret: string) => {
  axios.defaults.baseURL = `http://localhost:${port}`;
  axios.defaults.timeout = 20000;
  const token = await authenticate(axios, rootSecret);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  await provisionUsers(axios);
  await provisionProjects(axios);
};
