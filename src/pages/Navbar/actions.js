export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const FETCH_PEERS = 'FETCH_PEERS';
export const FETCH_PEERS_SUCCESS = 'FETCH_PEERS_SUCCESS';
export const FETCH_STREAM_NAMES = 'FETCH_STREAM_NAMES';
export const FETCH_STREAM_NAMES_SUCCESS = 'FETCH_STREAM_NAMES_SUCCESS';
export const SET_SELECTED_VIEW = 'SET_SELECTED_VIEW';

export function toggleSidebar() {
  return {
    type: TOGGLE_SIDEBAR,
  }
}

export function fetchPeers() {
  return {
    type: FETCH_PEERS,
  }
}

export function fetchStreamNames() {
  return {
    type: FETCH_STREAM_NAMES
  }
}

export function setSelectedView(id, section) {
  return {
    type: SET_SELECTED_VIEW,
    id,
    section
  }
}
