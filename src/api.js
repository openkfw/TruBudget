import axios from 'axios';
import _ from 'lodash';
const devMode = process.env.NODE_ENV === 'development';

console.log(`API is running in ${devMode ? "development" : "production"} mode`)

const TOKEN_NAME = 'jwt_token';
const ENV_PREFIX = "environment_prefix";

class Api {

  constructor() {
    this.setAuthorizationHeader(this.getToken());
    axios.defaults.baseURL = this.prefix;
    //rename
    const storedPrefix = this.getEnvironmentPrefix();
    const prefix = !_.isEmpty(storedPrefix) ? storedPrefix : '/test';
    this.prefix = devMode ? '' : prefix;
  }


  getToken = () => localStorage.getItem(TOKEN_NAME)
  setToken = (data) => localStorage.setItem(TOKEN_NAME, data)
  removeToken = () => localStorage.removeItem(TOKEN_NAME);

  getEnvironmentPrefix = () => localStorage.getItem(ENV_PREFIX);
  setEnvironmentPrefix = (prefix) => localStorage.setItem(ENV_PREFIX, prefix);
  setDefaultEnvironmentPrefix = () => localStorage.setItem(ENV_PREFIX, '/test');

  getEnvironment = () => {
    const prefix = this.getEnvironmentPrefix()
    return prefix === '/test' ? 'Test' : 'Prod'
  }

  setAdminToken = (token) => sessionStorage.setItem('admin_jwt', token);
  removeAdminToken = (token) => {
    sessionStorage.removeItem('admin_jwt', token)
  };

  setAuthorizationHeader = (token) => {
    axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  }

  activateProduction = (active) => {
    if (!devMode) {
      const prefix = active ? '/api' : '/test';
      this.setEnvironmentPrefix(prefix)

    }
    const prefix = active ? '/api' : '/test';
    this.setEnvironmentPrefix(prefix)
    return active;
  }

  login = async (username, password) => {
    const { data } = await axios.post(`${this.prefix}/login`, { username, password })
    const { jwtToken, user } = data;
    this.setToken(jwtToken);
    this.setAuthorizationHeader(jwtToken);
    return user;
  }

  loginAdmin = async (username, password) => {
    const { data } = await axios.post(`${this.prefix}/login`, { username, password })
    const { jwtToken, user } = data;
    this.setAdminToken(jwtToken);
    this.setAuthorizationHeader(jwtToken);
    return user;
  }


  addUser = (username, fullName, avatar, password, role) => axios.post(`${this.prefix}/users`, {
    id: username,
    name: fullName,
    avatar_back: avatar,
    password,
    role,
    avatar
  })
  addRole = (id, organization, read, write, admin) => axios.post(`${this.prefix}/roles`, {
    id,
    organization,
    read,
    write,
    admin
  })
  fetchPermissions = () => axios.get(`${this.prefix}/permissions`);
  fetchPeers = () => axios.get(`${this.prefix}/peers`);
  fetchProjects = () => axios.get(`${this.prefix}/projects`);
  fetchProjectDetails = (project) => axios.get(`${this.prefix}/projects/` + project);
  fetchStreamNames = () => axios.get(`${this.prefix}/projects/mapping`);
  fetchStreamItems = (flowName) => axios.get(`${this.prefix}/streams/` + flowName);
  postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectComment, subProjectCurrency) => axios.post(`${this.prefix}/subprojects`, {
    parentStream: parentProject,
    name: subProjectName,
    amount: subProjectAmount,
    comment: subProjectComment,
    currency: subProjectCurrency,
    status: `open`
  })
  postProject = (name, amount, comment, currency, approver, assignee, bank, thumbnail) => axios.post(`${this.prefix}/projects`, {
    name,
    amount,
    comment,
    currency,
    approver,
    assignee,
    bank,
    thumbnail
  })
  fetchNodeInformation = () => axios.get(`${this.prefix}/nodes`);
  fetchNotifications = (user) => axios.get(`${this.prefix}/notifications/` + user);
  fetchWorkflowItems = (subProjectName) => axios.get(`${this.prefix}/subprojects/` + subProjectName);
  // fetch the user to the existing JWToken
  fetchUser = () => axios.get(`${this.prefix}/users/mapping`)
  fetchUsers = () => axios.get(`${this.prefix}/users`);
  fetchRoles = () => axios.get(`${this.prefix}/roles`);
  postWorkflowItem = (stream, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, type, approvalRequired) => axios.post(`${this.prefix}/workflows`, {
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
  editWorkflowItem = (stream, key, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, txid, previousState, type, approvalRequired) => axios.put(`${this.prefix}/workflows/` + workflowItemName, {
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
  fetchHistory = (project) => axios.get(`${this.prefix}/history/` + project);
  markNotificationAsRead = (user, id, data) => axios.put(`${this.prefix}/notifications/${user}/${id}`, data);
  postWorkflowSort = (streamName, workflowOrder) => axios.put(`${this.prefix}/subprojects/` + streamName + `/sort`, {
    order: workflowOrder
  });
  editSubProject = (parentProject, subProjectName, status, amount) => axios.put(`${this.prefix}/subprojects/` + subProjectName, {
    parent: parentProject,
    status: status,
    amount: amount
  });
  hashDocument = (payload) => {
    const data = new FormData();
    data.append(`doc`, payload);
    return axios.post(`${this.prefix}/documents`, data)
  };
  validateDocument = (payload, hash) => {
    const data = new FormData();
    data.append(`doc`, payload);
    return axios.post(`${this.prefix}/documents/` + hash, data)
  };
}

export default Api;
