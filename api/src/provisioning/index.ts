const axios = require('axios');

import { provisionUsers } from "./users";
import { provisionProjects } from "./projects";

const rootSecret = process.env.ROOT_SECRET
const port = process.env.PORT

const API_VERSION = "1.0"


axios.defaults.baseURL = `http://localhost:${port}`

axios.defaults.transformRequest = [
  (data, headers) => {
    if (typeof data === 'object') {
      return {
        apiVersion: API_VERSION,
        data: { ...data }
      }
    } else {
      return data;
    }
  },
  ...axios.defaults.transformRequest
]

export const sleep = timeout => (
  new Promise(resolve => setTimeout(resolve, timeout))
);

const authenticate = async (axios) => {
  const response = await axios.post('/user.authenticate',
    { "id": "root", "password": rootSecret }
  )
  return response.data
}

export const provisionBlockchain = async () => {
  const token = await authenticate(axios)
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  await provisionUsers(axios)
  await provisionProjects(axios)
}
