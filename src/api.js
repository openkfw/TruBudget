import axios from 'axios';

export const fetchPeers = () => axios.get('/peerInfo');
export const fetchStreams = () => axios.get('/streams/list');
export const fetchStreamItems = () => axios.get('/streams/list/item/root');
