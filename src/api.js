import axios from 'axios';

export const fetchPeers = () => axios.get('/peerInfo');
export const fetchStreams = () => axios.get('projects/list');
export const postStream = (flowName) => axios.get('/streams/list/item/' + flowName);
export const fetchStreamItems = (flowName) => axios.get('/streams/list/item/' + flowName);
export const postSubProject = (parentProject, subProjectName, subProjectAmount, subProjectPurpose) => axios.post('/project/create/subproject', { parentStream: parentProject, newStream: subProjectName, amount:subProjectAmount, purpose:subProjectPurpose })
export const postProject = (name, parent, amount, purpose) => axios.post('/project/create', { newStream: name, parent: parent, amount: amount, purpose:purpose})
export const fetchNodeInformation = () => axios.get('/node/information');
