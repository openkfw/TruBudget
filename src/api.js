import axios from 'axios';

export const fetchPeers = () => axios.get('/peerInfo');
export const fetchProjects = () => axios.get('/projects');
export const fetchProjectDetails = (project) => axios.get('/projects/' + project);
export const fetchStreamNames = () => axios.get('/streams/names/');
export const fetchStreamItems = (flowName) => axios.get('/streams/' + flowName);
export const postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectPurpose, subProjectCurrency) => axios.post('/projects/subprojects', { parentStream: parentProject, name: subProjectName, amount: subProjectAmount, purpose: subProjectPurpose, currency: subProjectCurrency, status: 'open' })
export const postProject = (name, amount, purpose, currency) => axios.post('/projects', { name, amount, purpose, currency })
export const fetchNodeInformation = () => axios.get('/nodes');
export const fetchNotifications = (user) => axios.get('/notifications/' + user);
export const fetchWorkflowItems = (subProjectName) => axios.get('/projects/' + subProjectName + '/workflows');
export const login = (username, password) => axios.post('/login', { username, password });
export const fetchUsers = () => axios.get('/users');
export const fetchRoles = () => axios.get('/roles');
export const postWorkflowItem = (stream, workflowItemName, amount, currency, purpose, addData, status, assignee) => axios.post('/projects/subprojects/workflows', { streamName: stream, workflowName: workflowItemName, amount: amount, currency: currency, purpose: purpose, addData: addData, status: status, assignee: assignee })
export const editWorkflowItem = (stream, workflowItemName, amount, currency, purpose, addData, status, assignee, txid, previousState) => axios.post('/projects/subprojects/workflows/' + txid, { streamName: stream, workflowName: workflowItemName, amount: amount, currency: currency, purpose: purpose, addData: addData, status: status, assignee: assignee, previousState: previousState })
export const fetchHistory = (project) => axios.get('/history/' + project);
export const markNotificationAsRead = (user, id, data) => axios.put(`/notifications/${user}/${id}`, data);
