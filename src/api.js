import axios from 'axios';

export const fetchPeers = () => axios.get('/peerInfo');
export const fetchStreams = () => axios.get('projects/list');
export const postStream = (flowName) => axios.get('/streams/list/item/' + flowName);
export const fetchStreamItems = (flowName) => axios.get('/streams/list/item/' + flowName);
export const postSubProject = (parentProject, subProjectName) => axios.post('/project/create/subproject', { parentStream: parentProject, newStream: subProjectName })
export const postProject = (name, parent, amount, purpose) => axios.post('/project/create', { newStream: name, parent: parent, amount: amount, purpose:purpose})
export const fetchNodeInformation = () => axios.get('/node/information');
