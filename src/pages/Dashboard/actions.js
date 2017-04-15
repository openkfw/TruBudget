export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const FETCH_NODE_INFORMATION= 'FETCH_NODE_INFORMATION';
export const FETCH_NODE_INFORMATION_SUCCESS = 'FETCH_NODE_INFORMATION_SUCCESS';

export function fetchNodeInformation() {
  return {
    type: FETCH_NODE_INFORMATION,
  }
}
