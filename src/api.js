import axios from 'axios';
import _ from 'lodash';
const devMode = process.env.NODE_ENV === 'development';

console.log(`API is running in ${devMode ? "development" : "production"} mode`)

const TOKEN_NAME = 'jwt_token';
const ENV_PREFIX = "environment_prefix";
const testPrefix = '/test';
const prodPrefix = '/api';
class Api {

  setAuthorizationHeader = (token) => {
    axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  }

  setBaseUrl = (url) => {
    if (!devMode) {
      axios.defaults.baseURL = url
    }
  }

  login = async (username, password) => {
    const { data } = await axios.post(`/login`, { username, password })
    return data;
  }

  loginAdmin = async (username, password) => {
    const { data } = await axios.post(`/login`, { username, password })
    return data;
  }


  addUser = (username, fullName, avatar, password, role) => axios.post(`/users`, {
    id: username,
    name: fullName,
    avatar_back: avatar,
    password,
    role,
    avatar
  })
  addRole = (id, organization, read, write, admin) => axios.post(`/roles`, {
    id,
    organization,
    read,
    write,
    admin
  })
  fetchPermissions = () => axios.get(`/permissions`);
  fetchPeers = () => axios.get(`/peers`);

  fetchProjects = () => axios.get(`/projects`);
  fetchProjectDetails = (project) => axios.get(`/projects/` + project);
  fetchStreamNames = () => axios.get(`/projects/mapping`);
  fetchStreamItems = (flowName) => axios.get(`/streams/` + flowName);
  postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectComment, subProjectCurrency) => axios.post(`/subprojects`, {
    parentStream: parentProject,
    name: subProjectName,
    amount: subProjectAmount,
    comment: subProjectComment,
    currency: subProjectCurrency,
    status: `open`
  })
  postProject = (name, amount, comment, currency, approver, assignee, bank, thumbnail) => axios.post(`/projects`, {
    name,
    amount,
    comment,
    currency,
    approver,
    assignee,
    bank,
    thumbnail
  })
  fetchNodeInformation = () => axios.get(`/nodes`);
  fetchNotifications = (user) => axios.get(`/notifications/` + user);
  fetchWorkflowItems = (subProjectName) => axios.get(`/subprojects/` + subProjectName);
  // fetch the user to the existing JWToken
  fetchUser = () => axios.get(`/users/mapping`)
  fetchUsers = () => axios.get(`/users`);
  fetchRoles = () => axios.get(`/roles`);
  postWorkflowItem = (stream, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, type, approvalRequired) => axios.post(`/workflows`, {
    streamName: stream,
    workflowName: workflowItemName,
    amount,
    amountType,
    currency,
    comment,
    documents,
    status,
    assignee,
    type,
    approvalRequired
  })
  editWorkflowItem = (stream, key, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, txid, previousState, type, approvalRequired) => axios.put(`/workflows/` + workflowItemName, {
    streamName: stream,
    key,
    workflowName: workflowItemName,
    amount,
    amountType,
    currency,
    comment,
    documents,
    status,
    assignee,
    previousState,
    type,
    approvalRequired
  })
  fetchHistory = (project) => axios.get(`/history/` + project);
  markNotificationAsRead = (user, id, data) => axios.put(`/notifications/${user}/${id}`, data);
  postWorkflowSort = (streamName, workflowOrder) => axios.put(`/subprojects/` + streamName + `/sort`, {
    order: workflowOrder
  });
  editSubProject = (parentProject, subProjectName, status, amount) => axios.put(`/subprojects/` + subProjectName, {
    parent: parentProject,
    status: status,
    amount: amount
  });
  hashDocument = (payload) => {
    const data = new FormData();
    data.append(`doc`, payload);
    return axios.post(`/documents`, data)
  };
  validateDocument = (payload, hash) => {
    const data = new FormData();
    data.append(`doc`, payload);
    return axios.post(`/documents/` + hash, data)
  };
}

export default Api;
