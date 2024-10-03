import { fromJS } from "immutable";

import { APP_LATEST_VERSION_FETCHED } from "../Overview/actions";

import {
  FETCH_EMAIL_SERVICE_VERSION,
  FETCH_EMAIL_SERVICE_VERSION_FAILURE,
  FETCH_EMAIL_SERVICE_VERSION_SUCCESS,
  FETCH_EXPORT_SERVICE_VERSION,
  FETCH_EXPORT_SERVICE_VERSION_FAILURE,
  FETCH_EXPORT_SERVICE_VERSION_SUCCESS,
  FETCH_VERSIONS,
  FETCH_VERSIONS_FAILURE,
  FETCH_VERSIONS_SUCCESS,
  SET_STORAGE_SERVICE_AVAILABLE
} from "./actions";

const defaultState = fromJS({
  versions: {
    frontend: {},
    api: {},
    blockchain: {},
    multichain: {},
    emailService: {},
    exportService: {},
    storage: {}
  },
  isFetchingVersions: false,
  isFetchingEmailVersion: false,
  isFetchingExportVersion: false,
  storageServiceAvailable: false,
  latestVersion: null
});

export default function nodeDashboardReducer(state = defaultState, action) {
  switch (action.type) {
    case APP_LATEST_VERSION_FETCHED:
      if (action.version) {
        return state.set("latestVersion", action.version.version);
      }
      return state;
    case FETCH_VERSIONS:
      return state.set("isFetchingVersions", true);
    case FETCH_VERSIONS_SUCCESS:
      return state
        .mergeIn(["versions"], {
          ...action.versions
        })
        .set("isFetchingVersions", false);
    case FETCH_VERSIONS_FAILURE:
      return state.set("isFetchingVersions", false);
    case FETCH_EMAIL_SERVICE_VERSION:
      return state.set("isFetchingEmailVersion", true);
    case FETCH_EMAIL_SERVICE_VERSION_SUCCESS:
      return state
        .mergeIn(["versions"], {
          emailService: { release: action.release, ping: action.ping }
        })
        .set("isFetchingEmailVersion", false);
    case FETCH_EMAIL_SERVICE_VERSION_FAILURE:
      return state.set("isFetchingEmailVersion", false);
    case FETCH_EXPORT_SERVICE_VERSION:
      return state.set("isFetchingExportVersion", true);
    case FETCH_EXPORT_SERVICE_VERSION_SUCCESS:
      return state
        .mergeIn(["versions"], {
          exportService: { release: action.release, ping: action.ping }
        })
        .set("isFetchingExportVersion", false);
    case FETCH_EXPORT_SERVICE_VERSION_FAILURE:
      return state.set("isFetchingExportVersion", false);
    case SET_STORAGE_SERVICE_AVAILABLE:
      return state.set("storageServiceAvailable", action.isAvailable);
    default:
      return state;
  }
}
