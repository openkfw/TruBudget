import axios from 'axios';

export const fetchPeers = () => axios.get('/peers');
export const fetchProjects = () => axios.get('/projects');
export const fetchProjectDetails = (project) => axios.get('/projects/' + project);
export const fetchStreamNames = () => axios.get('/projects/mapping');
export const fetchStreamItems = (flowName) => axios.get('/streams/' + flowName);
export const postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectComment, subProjectCurrency) => axios.post('/subprojects', { parentStream: parentProject, name: subProjectName, amount: subProjectAmount, comment: subProjectComment, currency: subProjectCurrency, status: 'open' })
export const postProject = (name, amount, comment, currency, approver, assignee, bank) => axios.post('/projects', { name, amount, comment, currency, approver, assignee, bank })
export const fetchNodeInformation = () => axios.get('/nodes');
export const fetchNotifications = (user) => axios.get('/notifications/' + user);
export const fetchWorkflowItems = (subProjectName) => axios.get('/subprojects/' + subProjectName);
export const login = (username, password) => axios.post('/login', { username, password });
export const fetchUsers = () => axios.get('/users');
export const fetchRoles = () => axios.get('/roles');
export const postWorkflowItem = (stream, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, type) => axios.post('/workflows', { streamName: stream, workflowName: workflowItemName, amount, amountType, currency, comment, documents, status, assignee, type })
export const editWorkflowItem = (stream, key, workflowItemName, amount, amountType, currency, comment, documents, status, assignee, txid, previousState, type) => axios.put('/workflows/' + workflowItemName, { streamName: stream, key, workflowName: workflowItemName, amount, amountType, currency, comment, documents, status, assignee, previousState, type })
export const fetchHistory = (project) => axios.get('/history/' + project);
export const markNotificationAsRead = (user, id, data) => axios.put(`/notifications/${user}/${id}`, data);

export const postWorkflowSort = (streamName, workflowOrder) => axios.put('/subprojects/' + streamName + '/sort', { order: workflowOrder });
export const editSubProject = (parentProject, subProjectName, status, amount) => axios.put('/subprojects/' + subProjectName, { parent: parentProject, status: status, amount: amount });

export const hashDocument = (payload) => {
  const data = new FormData();
  data.append('doc', payload);
  return axios.post('/documents', data)
};

export const validateDocument = (payload, hash) => {
  const data = new FormData();
  data.append('doc', payload);
  return axios.post('/documents/' + hash, data)
};

