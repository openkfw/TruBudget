
const axios = require('axios');

const port = process.env.PORT
const rootSecret = process.env.ROOT_SECRET

const API_VERSION = "1.0"


axios.defaults.baseURL = `http://localhost:${port}`

const users = [
  { id: 'thouse', displayName: 'Tom House', password: 'test', organization: 'Ministry of Health', },
  { id: 'pkleffmann', displayName: 'Piet Kleffmann', password: 'test', organization: 'ACMECorp', },
  { id: 'mstein', displayName: 'Mauro Stein', password: 'test', organization: 'UmbrellaCorp' },
  { id: 'jdoe', displayName: 'John Doe', password: 'test', organization: 'Ministry of Finance' },
  { id: 'jxavier', displayName: 'Jane Xavier', password: 'test', organization: 'Ministry of Education' },
  { id: 'dviolin', displayName: 'Dana Violin', password: 'test', organization: 'Centralbank' },
  { id: 'auditUser', displayName: 'Romina Checker', password: 'test', organization: 'Audit' },
];

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


const authenticate = async () => {
  const response = await axios.post('/user.authenticate',
    { "id": "root", "password": rootSecret }
  )
  return response.data
}

const createUser = async (user) => {
  await axios.post('/user.create', {
    ...user
  })
}

const sleep = timeout => (
  new Promise(resolve => setTimeout(resolve, timeout))
);

const handleError = async (err) => {
  if (err.response && err.response.status === 409) {
    console.log('Seems like the users already exist');
  } else {
    console.log(err.message)
    console.log('Blockchain or API are not up yet, sleeping for 5 seconds')
    await sleep(5000);
    await injectUsers();
  }
}

export const injectUsers = async () => {
  try {
    const token = await authenticate()
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    for (const user of users) {
      await createUser(user);
      console.log(`-> added User ${user.displayName}`);
    }
  } catch (err) {
    await handleError(err)
  }
}
