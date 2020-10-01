import { fromJS } from "immutable";
import {
  FETCH_EMAIL_SERVICE_VERSION,
  FETCH_EMAIL_SERVICE_VERSION_FAILURE,
  FETCH_EMAIL_SERVICE_VERSION_SUCCESS,
  FETCH_EXPORT_SERVICE_VERSION,
  FETCH_EXPORT_SERVICE_VERSION_FAILURE,
  FETCH_EXPORT_SERVICE_VERSION_SUCCESS,
  FETCH_VERSIONS,
  FETCH_VERSIONS_FAILURE,
  FETCH_VERSIONS_SUCCESS
} from "./actions";

const defaultState = fromJS({
  versions: {
    frontend: {},
    api: {},
    blockchain: {},
    multichain: {},
    emailService: {},
    exportService: {}
  },
  isFetchingVersions: false,
  isFetchingEmailVersion: false,
  isFetchingExportVersion: false
});

export default function nodeDashboardReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_VERSIONS:
      return state.set("isFetchingVersions", true);
    case FETCH_VERSIONS_SUCCESS:
      return state
        .mergeIn(["versions"], {
          frontend: action.versions.frontend,
          api: action.versions.api,
          blockchain: action.versions.blockchain,
          multichain: action.versions.multichain
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
    default:
      return state;
  }
}
