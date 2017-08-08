import axios from 'axios';

class Api {
  prefix = '/api';

  activateProduction = (active) => {
    this.prefix = active ? '/api' : '/test';
  }

  fetchPeers = () => axios.get(`${this.prefix}/peers`);
  fetchProjects = () => axios.get(`${this.prefix}/projects`);
  fetchProjectDetails = (project) => axios.get(`${this.prefix}/projects/` + project);
  fetchStreamNames = () => axios.get(`${this.prefix}/projects/mapping`);
  fetchStreamItems = (flowName) => axios.get(`${this.prefix}/streams/` + flowName);
  postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectComment, subProjectCurrency) => axios.post(`${this.prefix}/subprojects`, { parentStream: parentProject, name: subProjectName, amount: subProjectAmount, comment: subProjectComment, currency: subProjectCurrency, status: `open` })
  postProject = (name, amount, comment, currency, approver, assignee, bank) => axios.post(`${this.prefix}/projects`, { name, amount, comment, currency, approver, assignee, bank })
  fetchNodeInformation = () => axios.get(`${this.prefix}/nodes`);
  fetchNotifications = (user) => axios.get(`${this.prefix}/notifications/` + user);
  fetchWorkflowItems = (subProjectName) => axios.get(`${this.prefix}/subprojects/` + subProjectName);
  login = (username, password) => axios.post(`${this.prefix}/login`, { username, password })
  fetchUsers = () => axios.get(`${this.prefix}/users`);
  fetchRoles = () => axios.get(`${this.prefix}/roles`);
  postWorkflowItem = (stream, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, type) => axios.post(`${this.prefix}/workflows`, { streamName: stream, workflowName: workflowItemName, amount, amountType, currency, comment, documents, status, assignee, type })
  editWorkflowItem = (stream, key, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, txid, previousState, type) => axios.put(`${this.prefix}/workflows/` + workflowItemName, { streamName: stream, key, workflowName: workflowItemName, amount, amountType, currency, comment, documents, status, assignee, previousState, type })
  fetchHistory = (project) => axios.get(`${this.prefix}/history/` + project);
  markNotificationAsRead = (user, id, data) => axios.put(`${this.prefix}/notifications/${user}/${id}`, data);
  postWorkflowSort = (streamName, workflowOrder) => axios.put(`${this.prefix}/subprojects/` + streamName + `${this.prefix}/sort`, { order: workflowOrder });
  editSubProject = (parentProject, subProjectName, status, amount) => axios.put(`${this.prefix}/subprojects/` + subProjectName, { parent: parentProject, status: status, amount: amount });
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
