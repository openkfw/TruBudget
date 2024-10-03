export const FETCH_VERSIONS = "FETCH_VERSIONS";
export const FETCH_VERSIONS_SUCCESS = "FETCH_VERSIONS_SUCCESS";
export const FETCH_VERSIONS_FAILURE = "FETCH_VERSIONS_FAILURE";

export const FETCH_EMAIL_SERVICE_VERSION = "FETCH_EMAIL_SERVICE_VERSION";
export const FETCH_EMAIL_SERVICE_VERSION_FAILURE = "FETCH_EMAIL_SERVICE_VERSION_FAILURE";
export const FETCH_EMAIL_SERVICE_VERSION_SUCCESS = "FETCH_EMAIL_SERVICE_VERSION_SUCCESS";

export const FETCH_EXPORT_SERVICE_VERSION = "FETCH_EXPORT_SERVICE_VERSION";
export const FETCH_EXPORT_SERVICE_VERSION_FAILURE = "FETCH_EXPORT_SERVICE_VERSION_FAILURE";
export const FETCH_EXPORT_SERVICE_VERSION_SUCCESS = "FETCH_EXPORT_SERVICE_VERSION_SUCCESS";
export const SET_STORAGE_SERVICE_AVAILABLE = "SET_STORAGE_SERVICE_AVAILABLE";

export const APP_LATEST_VERSION = "APP_LATEST_VERSION";
export const UPGRADE_TO_LATEST_VERSION = "UPGRADE_TO_LATEST_VERSION";

export function fetchVersions() {
  return {
    type: FETCH_VERSIONS
  };
}
export function fetchEmailServiceVersion() {
  return {
    type: FETCH_EMAIL_SERVICE_VERSION
  };
}
export function fetchExportServiceVersion() {
  return {
    type: FETCH_EXPORT_SERVICE_VERSION
  };
}

export function setStorageServiceAvailable(isAvailable) {
  return {
    type: SET_STORAGE_SERVICE_AVAILABLE,
    isAvailable
  };
}

export function fetchAppLatestVersion() {
  return {
    type: APP_LATEST_VERSION
  };
}

export function upgradeAppToLatestVersion(version) {
  return {
    type: UPGRADE_TO_LATEST_VERSION,
    version
  };
}
