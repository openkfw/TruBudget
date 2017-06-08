import axios from 'axios';

export const fetchPeers = () => axios.get('/peerInfo');
export const fetchProjects = () => axios.get('/projects');
export const fetchProjectDetails = (project) => axios.get('/projects/' + project);
export const fetchStreamNames = () => axios.get('/streams/names/');
export const fetchStreamItems = (flowName) => axios.get('/streams/' + flowName);
export const postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectPurpose, subProjectCurrency) => axios.post('/projects/subprojects', { parentStream: parentProject, name: subProjectName, amount: subProjectAmount, purpose: subProjectPurpose, currency: subProjectCurrency, status: 'open' })
export const postProject = (name, amount, purpose, currency, approver, assignee, bank) => axios.post('/projects', { name, amount, purpose, currency, approver, assignee, bank })
export const fetchNodeInformation = () => axios.get('/nodes');
export const fetchNotifications = (user) => axios.get('/notifications/' + user);
export const fetchWorkflowItems = (subProjectName) => axios.get('/projects/' + subProjectName + '/workflows');
export const login = (username, password) => axios.post('/login', { username, password });
export const fetchUsers = () => axios.get('/users');
export const fetchRoles = () => axios.get('/roles');
export const postWorkflowItem = (stream, workflowItemName, amount, currency, purpose, documents, status, assignee, type) => axios.post('/projects/subprojects/workflows', { streamName: stream, workflowName: workflowItemName, amount, currency, purpose, documents, status, assignee, type })
export const editWorkflowItem = (stream, key, workflowItemName, amount, currency, purpose, documents, status, assignee, txid, previousState, type) => axios.post('/projects/subprojects/workflows/' + txid, { streamName: stream, key, workflowName: workflowItemName, amount, currency, purpose, documents, status, assignee, previousState, type })
export const fetchHistory = (project) => axios.get('/history/' + project);
export const markNotificationAsRead = (user, id, data) => axios.put(`/notifications/${user}/${id}`, data);

export const postWorkflowSort = (streamName, workflowOrder) => axios.post('/sort', { streamName: streamName, order: workflowOrder });
export const editSubProject = (parentProject, subProjectName, status, amount) => axios.post('/projects/subprojects/edit', { parent: parentProject, subProjectName: subProjectName, status: status, amount: amount });
export const hashDocument = (payload) => {
  const data = new FormData();
  data.append('doc', payload);
  return axios.post('/documents', data)
};
export const validateDocument = (payload, hash) => {
  const data = new FormData();
  data.append('doc', payload);
  data.append('hash', hash);
  return axios.post('/documents/validate', data)
};

