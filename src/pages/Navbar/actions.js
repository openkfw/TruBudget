export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const FETCH_PEERS = 'FETCH_PEERS';
export const FETCH_PEERS_SUCCESS = 'FETCH_PEERS_SUCCESS';

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