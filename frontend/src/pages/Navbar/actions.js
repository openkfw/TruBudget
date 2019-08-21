export const TOGGLE_SIDEBAR = "TOGGLE_SIDEBAR";
export const FETCH_STREAM_NAMES = "FETCH_STREAM_NAMES";
export const FETCH_STREAM_NAMES_SUCCESS = "FETCH_STREAM_NAMES_SUCCESS";
export const SET_SELECTED_VIEW = "SET_SELECTED_VIEW";
export const FETCH_ACTIVE_PEERS = "FETCH_ACTIVE_PEERS";
export const FETCH_ACTIVE_PEERS_SUCCESS = "FETCH_ACTIVE_PEERS_SUCCESS";

export const CREATE_BACKUP = "CREATE_BACKUP";
export const CREATE_BACKUP_SUCCESS = "CREATE_BACKUP_SUCCESS";

export const RESTORE_BACKUP = "RESTORE_BACKUP";
export const RESTORE_BACKUP_SUCCESS = "RESTORE_BACKUP_SUCCESS";

export const FETCH_VERSIONS = "FETCH_VERSIONS";
export const FETCH_VERSIONS_SUCCESS = "FETCH_VERSIONS_SUCCESS";

export const EXPORT_DATA = "EXPORT_DATA";
export const EXPORT_DATA_SUCCESS = "EXPORT_DATA_SUCCESS";
export const EXPORT_DATA_FAILED = "EXPORT_DATA_FAILED";

export const SEARCH_TERM = "SEARCH_TERM";
export const SEARCH_BAR_DISPLAYED = "SEARCH_BAR_DISPLAYED";

export const SET_IS_ROOT = "SET_IS_ROOT";

export function toggleSidebar() {
  return {
    type: TOGGLE_SIDEBAR
  };
}

export function fetchActivePeers() {
  return {
    type: FETCH_ACTIVE_PEERS
  };
}

export function fetchStreamNames() {
  return {
    type: FETCH_STREAM_NAMES
  };
}

export function setSelectedView(id, section) {
  return {
    type: SET_SELECTED_VIEW,
    id,
    section
  };
}

export function restoreBackup(file) {
  return {
    type: RESTORE_BACKUP,
    file
  };
}
export function createBackup() {
  return {
    type: CREATE_BACKUP
  };
}
export function fetchVersions() {
  return {
    type: FETCH_VERSIONS
  };
}

export function exportData() {
  return {
    type: EXPORT_DATA
  };
}

export function storeSearchTerm(searchTerm) {
  return {
    type: SEARCH_TERM,
    searchTerm
  };
}

export function storeSearchBarDisplayed(searchBarDisplayed) {
  return {
    type: SEARCH_BAR_DISPLAYED,
    searchBarDisplayed
  };
}

export function setIsRoot(isRoot) {
  return {
    type: SET_IS_ROOT,
    isRoot
  };
}
