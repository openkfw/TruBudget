import axios from 'axios';

export const fetchPeers = () => axios.get('/peerInfo');
export const fetchStreams = () => axios.get('projects/list');
export const postStream = (flowName) => axios.get('/streams/list/item/' + flowName);
export const fetchStreamItems = (flowName) => axios.get('/streams/list/item/' + flowName);
export const postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectPurpose, subProjectCurrency) => axios.post('/projects/create/subproject', { parentStream: parentProject, newStream: subProjectName, amount:subProjectAmount, purpose:subProjectPurpose, currency: subProjectCurrency })
export const postProject = (name, parent, amount, purpose, currency) => axios.post('/projects/create', { newStream: name, parent: parent, amount: amount, purpose:purpose, currency: currency})
export const fetchNodeInformation = () => axios.get('/nodes/information');
export const fetchNotifications = (user) => axios.get('/notifications/' + user);
export const fetchWorkflowItems = (subProjectName) => axios.get('/projects/list/'+subProjectName+'/workflows');
export const login = (username, password) => axios.post('/login', {username, password});
export const fetchUsers = () => axios.get('/users');
