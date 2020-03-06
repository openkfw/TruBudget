import { saveAs } from "file-saver/FileSaver";
import _isEmpty from "lodash/isEmpty";
import { all, call, cancel, delay, put, select, takeEvery, takeLatest, takeLeading } from "redux-saga/effects";
import Api from "./api.js";
import { getExchangeRates } from "./getExchangeRates";
import { formatString, fromAmountString } from "./helper.js";
import strings from "./localizeStrings";
import {
  GET_EXCHANGE_RATES,
  GET_EXCHANGE_RATES_SUCCESS,
  GET_PROJECT_KPIS,
  GET_PROJECT_KPIS_FAIL,
  GET_PROJECT_KPIS_SUCCESS,
  GET_SUBPROJECT_KPIS,
  GET_SUBPROJECT_KPIS_FAIL,
  GET_SUBPROJECT_KPIS_SUCCESS
} from "./pages/Analytics/actions.js";
import {
  CONFIRMATION_REQUIRED,
  EXECUTE_CONFIRMED_ACTIONS,
  EXECUTE_CONFIRMED_ACTIONS_FAILURE,
  EXECUTE_CONFIRMED_ACTIONS_SUCCESS
} from "./pages/Confirmation/actions.js";
import { CLEAR_DOCUMENTS, VALIDATE_DOCUMENT, VALIDATE_DOCUMENT_SUCCESS } from "./pages/Documents/actions";
import { cancelDebounce, hideLoadingIndicator, showLoadingIndicator } from "./pages/Loading/actions.js";
import {
  CHECK_EMAIL_SERVICE,
  CHECK_EMAIL_SERVICE_FAILURE,
  CHECK_EMAIL_SERVICE_SUCCESS,
  FETCH_EMAIL_ADDRESS,
  FETCH_EMAIL_ADDRESS_FAILURE,
  FETCH_EMAIL_ADDRESS_SUCCESS,
  FETCH_ENVIRONMENT,
  FETCH_ENVIRONMENT_SUCCESS,
  FETCH_USER,
  FETCH_USER_SUCCESS,
  LOGIN,
  LOGIN_SUCCESS,
  LOGOUT,
  LOGOUT_SUCCESS,
  SHOW_LOGIN_ERROR,
  STORE_ENVIRONMENT,
  STORE_ENVIRONMENT_SUCCESS
} from "./pages/Login/actions";
import {
  CREATE_BACKUP,
  CREATE_BACKUP_SUCCESS,
  EXPORT_DATA,
  EXPORT_DATA_FAILED,
  EXPORT_DATA_SUCCESS,
  FETCH_ACTIVE_PEERS,
  FETCH_ACTIVE_PEERS_SUCCESS,
  FETCH_VERSIONS,
  FETCH_VERSIONS_SUCCESS,
  RESTORE_BACKUP,
  RESTORE_BACKUP_SUCCESS,
  SAVE_EMAIL_ADDRESS,
  SAVE_EMAIL_ADDRESS_SUCCESS
} from "./pages/Navbar/actions.js";
import {
  APPROVE_NEW_NODE_FOR_ORGANIZATION,
  APPROVE_NEW_NODE_FOR_ORGANIZATION_SUCCESS,
  APPROVE_ORGANIZATION,
  APPROVE_ORGANIZATION_SUCCESS,
  FETCH_NODES,
  FETCH_NODES_SUCCESS
} from "./pages/Nodes/actions.js";
import {
  FETCH_ALL_NOTIFICATIONS,
  FETCH_ALL_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATION_COUNT,
  FETCH_NOTIFICATION_COUNT_SUCCESS,
  LIVE_UPDATE_NOTIFICATIONS,
  LIVE_UPDATE_NOTIFICATIONS_SUCCESS,
  MARK_MULTIPLE_NOTIFICATIONS_AS_READ,
  MARK_MULTIPLE_NOTIFICATIONS_AS_READ_SUCCESS,
  MARK_NOTIFICATION_AS_READ,
  MARK_NOTIFICATION_AS_READ_SUCCESS,
  SHOW_SNACKBAR,
  SNACKBAR_MESSAGE,
  TIME_OUT_FLY_IN
} from "./pages/Notifications/actions";
import {
  CREATE_PROJECT,
  CREATE_PROJECT_SUCCESS,
  EDIT_PROJECT,
  EDIT_PROJECT_SUCCESS,
  FETCH_ALL_PROJECTS,
  FETCH_ALL_PROJECTS_SUCCESS,
  FETCH_PROJECT_PERMISSIONS,
  FETCH_PROJECT_PERMISSIONS_FAILURE,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  GRANT_PERMISSION,
  GRANT_PERMISSION_SUCCESS,
  REVOKE_PERMISSION,
  REVOKE_PERMISSION_SUCCESS
} from "./pages/Overview/actions";
import {
  ASSIGN_PROJECT,
  ASSIGN_PROJECT_SUCCESS,
  CLOSE_PROJECT,
  CLOSE_PROJECT_SUCCESS,
  CREATE_SUBPROJECT,
  CREATE_SUBPROJECT_SUCCESS,
  EDIT_SUBPROJECT,
  EDIT_SUBPROJECT_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_NEXT_PROJECT_HISTORY_PAGE,
  FETCH_NEXT_PROJECT_HISTORY_PAGE_SUCCESS,
  FETCH_SUBPROJECT_PERMISSIONS,
  FETCH_SUBPROJECT_PERMISSIONS_FAILURE,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  GRANT_SUBPROJECT_PERMISSION,
  GRANT_SUBPROJECT_PERMISSION_SUCCESS,
  LIVE_UPDATE_PROJECT,
  REVOKE_SUBPROJECT_PERMISSION,
  REVOKE_SUBPROJECT_PERMISSION_SUCCESS,
  SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT
} from "./pages/SubProjects/actions";
import {
  ADD_USER,
  ADD_USER_SUCCESS,
  CHANGE_USER_PASSWORD_SUCCESS,
  CHECK_AND_CHANGE_USER_PASSWORD,
  CHECK_USER_PASSWORD_ERROR,
  CHECK_USER_PASSWORD_SUCCESS,
  CREATE_GROUP,
  CREATE_GROUP_SUCCESS,
  CREATE_USER,
  CREATE_USER_SUCCESS,
  FETCH_GROUPS,
  FETCH_GROUPS_SUCCESS,
  GRANT_ALL_USER_PERMISSIONS,
  GRANT_ALL_USER_PERMISSIONS_SUCCESS,
  GRANT_GLOBAL_PERMISSION,
  GRANT_GLOBAL_PERMISSION_SUCCESS,
  LIST_GLOBAL_PERMISSIONS,
  LIST_GLOBAL_PERMISSIONS_SUCCESS,
  REMOVE_USER,
  REMOVE_USER_SUCCESS,
  REVOKE_GLOBAL_PERMISSION,
  REVOKE_GLOBAL_PERMISSION_SUCCESS
} from "./pages/Users/actions.js";
import {
  ASSIGN_SUBPROJECT,
  ASSIGN_SUBPROJECT_SUCCESS,
  ASSIGN_WORKFLOWITEM,
  ASSIGN_WORKFLOWITEM_SUCCESS,
  CLOSE_SUBPROJECT,
  CLOSE_SUBPROJECT_SUCCESS,
  CLOSE_WORKFLOWITEM,
  CLOSE_WORKFLOWITEM_SUCCESS,
  CREATE_WORKFLOW,
  CREATE_WORKFLOW_SUCCESS,
  EDIT_WORKFLOW_ITEM,
  EDIT_WORKFLOW_ITEM_SUCCESS,
  FETCH_ALL_SUBPROJECT_DETAILS,
  FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
  FETCH_NEXT_SUBPROJECT_HISTORY_PAGE,
  FETCH_NEXT_SUBPROJECT_HISTORY_PAGE_SUCCESS,
  FETCH_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_FAILURE,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION,
  GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
  HIDE_WORKFLOW_DETAILS,
  LIVE_UPDATE_SUBPROJECT,
  REORDER_WORKFLOW_ITEMS,
  REORDER_WORKFLOW_ITEMS_SUCCESS,
  REVOKE_WORKFLOWITEM_PERMISSION,
  REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
  SET_TOTAL_SUBPROJECT_HISTORY_ITEM_COUNT,
  SHOW_WORKFLOW_PREVIEW,
  STORE_WORKFLOWACTIONS,
  SUBMIT_BATCH_FOR_WORKFLOW,
  SUBMIT_BATCH_FOR_WORKFLOW_FAILURE,
  SUBMIT_BATCH_FOR_WORKFLOW_SUCCESS
} from "./pages/Workflows/actions";
import {
  FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE,
  FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS,
  SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT
} from "./pages/Workflows/WorkflowitemHistoryTab/actions";

const api = new Api();

// SELECTORS
const getSelfId = state => {
  return state.getIn(["login", "id"]);
};
const getEmailAddress = state => {
  return state.getIn(["login", "emailAddress"]);
};
const getJwt = state => state.toJS().login.jwt;
const getEnvironment = state => {
  const env = state.getIn(["login", "environment"]);
  if (env) {
    return env;
  }
  return "Test";
};
const getProjectHistoryState = state => {
  return {
    currentHistoryPage: state.getIn(["detailview", "currentHistoryPage"]),
    historyPageSize: state.getIn(["detailview", "historyPageSize"]),
    totalHistoryItemCount: state.getIn(["detailview", "totalHistoryItemCount"])
  };
};
const getSubprojectHistoryState = state => {
  return {
    currentHistoryPage: state.getIn(["workflow", "currentHistoryPage"]),
    historyPageSize: state.getIn(["workflow", "historyPageSize"]),
    totalHistoryItemCount: state.getIn(["workflow", "totalHistoryItemCount"])
  };
};
const getWorkflowitemHistoryState = state => {
  return {
    currentHistoryPage: state.getIn(["workflowitemDetails", "currentHistoryPage"]),
    historyPageSize: state.getIn(["workflowitemDetails", "historyPageSize"]),
    totalHistoryItemCount: state.getIn(["workflowitemDetails", "totalHistoryItemCount"])
  };
};
const getConfirmedState = state => {
  return state.getIn(["confirmation", "confirmed"]);
};

function* execute(fn, showLoading = false, errorCallback = undefined) {
  const done = yield handleLoading(showLoading);
  try {
    yield fn();
  } catch (error) {
    if (typeof errorCallback === "function") {
      yield errorCallback(error);
    } else {
      // eslint-disable-next-line no-console
      console.error(error);
      yield handleError(error);
    }
  } finally {
    yield done();
  }
}

function* showSnackbarSuccess() {
  yield put({
    type: SHOW_SNACKBAR,
    show: true,
    isError: false,
    isWarning: false
  });
}

function* showSnackbarWarning() {
  yield put({
    type: SHOW_SNACKBAR,
    show: true,
    isError: false,
    isWarning: true
  });
}

function* handleError(error) {
  // eslint-disable-next-line no-console
  console.error("API-Error: ", error.response || "No response from API");

  if (error.response && error.response.status === 401) {
    // which status should we use?
    yield call(logoutSaga);
  } else if (error.response && error.response.data && error.response.data.error.message) {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: error.response.data.error.message
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true,
      isWarning: false
    });
  } else if (error.response && error.response.data && error.response.data.message) {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: error.response.data.message
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true,
      isWarning: false
    });
  } else {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: strings.common.disconnected
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true,
      isWarning: false
    });
  }
}

const getNotificationState = state => {
  return {
    currentNotificationPage: state.getIn(["notifications", "currentNotificationPage"]),
    numberOfNotificationPages: state.getIn(["notifications", "numberOfNotificationPages"]),
    notificationPageSize: state.getIn(["notifications", "notificationPageSize"])
  };
};

function* callApi(func, ...args) {
  const token = yield select(getJwt);
  yield call(api.setAuthorizationHeader, token);
  const env = yield select(getEnvironment);
  // TODO dont set the environment on each call
  const prefix = env === "Test" ? "/test" : "/prod";
  yield call(api.setBaseUrl, prefix);
  const { data } = yield call(func, ...args);
  return data;
}

let loadingCounter = 0;

function* handleLoading(showLoading) {
  if (showLoading) {
    loadingCounter++;
    yield put(showLoadingIndicator());
    return function* done() {
      loadingCounter--;
      if (!loadingCounter) {
        yield put(cancelDebounce());
        yield put(hideLoadingIndicator());
      }
    };
  } else {
    return function*() {};
  }
}

function* getBatchFromSubprojectTemplate(projectId, subprojectId, resources, selectedAssignee, permissions) {
  if (_isEmpty(selectedAssignee) && _isEmpty(permissions)) {
    return;
  }
  const possible = [];
  const notPossible = [];
  let action = {};
  const assignAction = strings.common.assign;
  const grantAction = strings.common.grant;
  const revokeAction = strings.common.revoke;
  const self = yield select(getSelfId);

  for (const r of resources) {
    // add assign action first
    if (selectedAssignee !== "") {
      action = {
        action: assignAction,
        id: r.data.id,
        displayName: r.data.displayName,
        assignee: selectedAssignee
      };
      if (r.data.status === "closed") {
        notPossible.push(action);
      } else {
        possible.push(action);
      }
    }
    // add grant permission actions next
    // TODO: add subprojectId
    const { data } = yield callApi(api.listWorkflowItemPermissions, projectId, subprojectId, r.data.id);
    const permissionsForResource = data;
    for (const intent in permissions) {
      if (_isEmpty(permissions[intent])) {
        continue;
      }
      const notRevokedIdentities = [];
      let revokeIdentities = [];
      for (const index in permissions[intent]) {
        const identity = permissions[intent][index];
        action = {
          action: grantAction,
          id: r.data.id,
          displayName: r.data.displayName,
          intent,
          identity
        };
        possible.push(action);
        notRevokedIdentities.push(identity);
      }
      // add revoke permission actions last
      revokeIdentities = permissionsForResource[intent].filter(i => !notRevokedIdentities.includes(i) && i !== self);
      for (const revokeIdentity in revokeIdentities) {
        action = {
          action: revokeAction,
          id: r.data.id,
          displayName: r.data.displayName,
          intent,
          identity: revokeIdentities[revokeIdentity]
        };
        possible.push(action);
      }
    }
  }

  return {
    possible,
    notPossible
  };
}

// SAGAS

export function* fetchVersionsSaga() {
  yield execute(function*() {
    const { data } = yield callApi(api.fetchVersions);
    data["frontend"] = { release: process.env.REACT_APP_VERSION };
    yield put({
      type: FETCH_VERSIONS_SUCCESS,
      versions: data
    });
  });
}

export function* createProjectSaga(action) {
  yield execute(function*() {
    yield callApi(
      api.createProject,
      action.name,
      action.comment,
      action.thumbnail,
      action.projectedBudgets,
      action.tags
    );
    yield showSnackbarSuccess();
    yield put({
      type: CREATE_PROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECTS,
      showLoading: true
    });
  }, true);
}

export function* editProjectSaga({ projectId, changes, deletedProjectedBudgets = [] }) {
  yield execute(function*() {
    // TODO: Change call format
    // const { deletedProjectedBudgets = [], projectedBudgets = [], ...rest } = changes;
    const { projectedBudgets = [], ...rest } = changes;

    if (Object.values(rest).some(value => value !== undefined)) {
      yield callApi(api.editProject, projectId, rest);
    }

    for (const budget of projectedBudgets) {
      yield callApi(
        api.updateProjectBudgetProjected,
        projectId,
        budget.organization,
        budget.currencyCode,
        budget.value
      );
    }
    for (const budget of deletedProjectedBudgets) {
      yield callApi(api.deleteProjectBudgetProjected, projectId, budget.organization, budget.currencyCode);
    }
    yield showSnackbarSuccess();
    yield put({
      type: EDIT_PROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECTS,
      showLoading: true
    });
  }, true);
}

export function* createSubProjectSaga({ projectId, name, description, currency, projectedBudgets, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.createSubProject, projectId, name, description, currency, projectedBudgets);
    yield showSnackbarWarning();
    yield put({
      type: CREATE_SUBPROJECT_SUCCESS,
      subprojectId: data.subproject.id
    });
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS,
      projectId,
      showLoading
    });
  }, showLoading);
}

export function* editSubProjectSaga({ projectId, subprojectId, changes, deletedProjectedBudgets = [] }) {
  yield execute(function*() {
    const { projectedBudgets = [], ...rest } = changes;

    if (Object.values(rest).some(value => value !== undefined)) {
      yield callApi(api.editSubProject, projectId, subprojectId, rest);
    }

    for (const budget of projectedBudgets) {
      yield callApi(
        api.updateSubprojectBudgetProjected,
        projectId,
        subprojectId,
        budget.organization,
        budget.currencyCode,
        budget.value
      );
    }

    for (const budget of deletedProjectedBudgets) {
      yield callApi(
        api.deleteSubprojectBudgetProjected,
        projectId,
        subprojectId,
        budget.organization,
        budget.currencyCode
      );
    }

    yield showSnackbarSuccess();
    yield put({
      type: EDIT_SUBPROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS,
      projectId,
      showLoading: true
    });
  }, true);
}

export function* createWorkflowItemSaga({ type, ...rest }) {
  yield execute(function*() {
    const { data } = yield callApi(api.createWorkflowItem, rest);
    yield showSnackbarWarning();
    yield put({
      type: CREATE_WORKFLOW_SUCCESS,
      workflowitemId: data.workflowitem.id
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId: rest.projectId,
      subprojectId: rest.subprojectId,
      showLoading: true
    });
  });
}

export function* editWorkflowItemSaga({ projectId, subprojectId, workflowitemId, changes }) {
  yield execute(function*() {
    yield callApi(api.editWorkflowItem, projectId, subprojectId, workflowitemId, changes);
    yield showSnackbarSuccess();
    yield put({
      type: EDIT_WORKFLOW_ITEM_SUCCESS
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId: projectId,
      subprojectId: subprojectId,
      showLoading: true
    });
  });
}

export function* reorderWorkflowitemsSaga({ projectId, subprojectId, ordering }) {
  yield execute(function*() {
    yield callApi(api.reorderWorkflowitems, projectId, subprojectId, ordering);
    yield put({
      type: REORDER_WORKFLOW_ITEMS_SUCCESS
    });
  }, true);
}

export function* validateDocumentSaga({ base64String, hash }) {
  yield execute(function*() {
    const { data } = yield callApi(api.validateDocument, base64String, hash);
    yield put({
      type: VALIDATE_DOCUMENT_SUCCESS,
      isIdentical: data.isIdentical
    });
  }, true);
}

export function* setEnvironmentSaga(action) {
  yield execute(function*() {
    yield put({
      type: STORE_ENVIRONMENT_SUCCESS,
      environment: action.environment,
      productionActive: action.productionActive
    });
    yield put({
      type: FETCH_ENVIRONMENT
    });
  });
}

export function* getEnvironmentSaga() {
  yield execute(function*() {
    const env = yield select(getEnvironment);
    yield put({
      type: FETCH_ENVIRONMENT_SUCCESS,
      environment: env,
      productionActive: env === "Test" ? false : true
    });
  });
}

export function* executeConfirmedActionsSaga({ showLoading, projectId, subprojectId, actions }) {
  yield execute(function*() {
    const permissionsChange = {
      projectId: "",
      subprojectId: "",
      workflowitemId: ""
    };
    for (const index in actions) {
      const action = actions[index];
      try {
        switch (action.intent) {
          case "project.intent.grantPermission":
            yield callApi(api.grantProjectPermissions, action.id, action.permission, action.identity);
            yield put({
              type: GRANT_PERMISSION_SUCCESS,
              id: action.id,
              intent: action.intent,
              permission: action.permission,
              identity: action.identity
            });
            permissionsChange.projectId = action.id;
            break;
          case "subproject.intent.grantPermission":
            yield callApi(api.grantSubProjectPermissions, projectId, action.id, action.permission, action.identity);
            yield put({
              type: GRANT_SUBPROJECT_PERMISSION_SUCCESS,
              id: action.id,
              intent: action.intent,
              permission: action.permission,
              identity: action.identity
            });
            permissionsChange.subprojectId = action.id;
            break;
          case "workflowitem.intent.grantPermission":
            yield callApi(
              api.grantWorkflowItemPermissions,
              projectId,
              subprojectId,
              action.id,
              action.permission,
              action.identity
            );
            yield put({
              type: GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
              id: action.id,
              intent: action.intent,
              permission: action.permission,
              identity: action.identity
            });
            permissionsChange.workflowitemId = action.id;
            break;
          default:
            break;
        }
      } catch (error) {
        yield put({
          type: EXECUTE_CONFIRMED_ACTIONS_FAILURE,
          id: action.id,
          displayName: action.displayName,
          identity: action.identity,
          intent: action.intent,
          permission: action.permission
        });
        throw error;
      }
    }
    const { projectId: pId, subprojectId: subpId, workflowitemId: wId } = permissionsChange;
    if (pId !== "") {
      yield call(() => fetchProjectPermissionsSaga({ projectId: pId, showLoading: false }));
    }
    if (subpId !== "") {
      yield call(() => fetchSubProjectPermissionsSaga({ projectId, subprojectId: subpId, showLoading: false }));
    }
    if (wId !== "")
      yield call(() =>
        fetchWorkflowItemPermissionsSaga({
          projectId,
          subprojectId,
          workflowitemId: wId,
          showLoading: false
        })
      );
    yield put({
      type: EXECUTE_CONFIRMED_ACTIONS_SUCCESS
    });
  }, showLoading);
}

export function* fetchNotificationsSaga({ showLoading, notificationPage }) {
  yield execute(function*() {
    const { data: notificationCountData } = yield callApi(api.fetchNotificationCounts);
    const { notificationPageSize } = yield select(getNotificationState);

    const totalNotificationCount = notificationCountData.total;

    const numberOfNotificationPages =
      notificationPageSize !== 0 ? Math.ceil(totalNotificationCount / notificationPageSize) : 1;

    const isLastNotificationPage = notificationPage + 1 === numberOfNotificationPages;
    const offset = 0 - (notificationPage + 1) * notificationPageSize;
    const itemsToFetch = isLastNotificationPage
      ? totalNotificationCount - notificationPage * notificationPageSize
      : notificationPageSize;
    const { data } = yield callApi(api.fetchNotifications, offset, itemsToFetch);
    yield put({
      type: FETCH_ALL_NOTIFICATIONS_SUCCESS,
      notifications: data.notifications,
      currentNotificationPage: notificationPage,
      totalNotificationCount: totalNotificationCount
    });
  }, showLoading);
}

export function* fetchNotificationCountsSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.fetchNotificationCounts);
    yield put({
      type: FETCH_NOTIFICATION_COUNT_SUCCESS,
      unreadNotificationCount: data.unread,
      notificationCount: data.total
    });
  }, showLoading);
}

export function* markNotificationAsReadSaga({ notificationId, notificationPage }) {
  yield execute(function*() {
    yield callApi(api.markNotificationAsRead, notificationId);
    yield put({
      type: MARK_NOTIFICATION_AS_READ_SUCCESS
    });
    yield put({
      type: FETCH_ALL_NOTIFICATIONS,
      showLoading: true,
      notificationPage
    });
    yield put({
      type: FETCH_NOTIFICATION_COUNT
    });
  }, true);
}

export function* markMultipleNotificationsAsReadSaga({ notificationIds, notificationPage }) {
  yield execute(function*() {
    yield callApi(api.markMultipleNotificationsAsRead, notificationIds);
    yield put({
      type: MARK_MULTIPLE_NOTIFICATIONS_AS_READ_SUCCESS
    });
    yield put({
      type: FETCH_ALL_NOTIFICATIONS,
      showLoading: true,
      notificationPage
    });
    yield put({
      type: FETCH_NOTIFICATION_COUNT
    });
  }, true);
}

export function* loginSaga({ user }) {
  function* login() {
    const { data } = yield callApi(api.login, user.username, user.password);

    yield put({
      type: LOGIN_SUCCESS,
      ...data
    });
    yield put({
      type: SHOW_LOGIN_ERROR,
      show: false
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: false,
      isError: false,
      isWarning: false
    });
  }
  function* onLoginError(error) {
    yield put({
      type: SHOW_LOGIN_ERROR,
      show: true
    });
    yield handleError(error);
  }
  yield execute(login, true, onLoginError);
}

export function* createUserSaga({ displayName, organization, username, password }) {
  yield execute(function*() {
    yield callApi(api.createUser, displayName, organization, username, password);
    yield put({
      type: CREATE_USER_SUCCESS
    });
    yield put({
      type: FETCH_USER,
      show: true
    });
  }, true);
}

export function* grantAllUserPermissionsSaga({ userId }) {
  yield execute(function*() {
    yield callApi(api.grantAllUserPermissions, userId);
    yield put({
      type: GRANT_ALL_USER_PERMISSIONS_SUCCESS
    });
  }, false);
}

export function* grantGlobalPermissionSaga({ identity, intent }) {
  yield execute(function*() {
    yield callApi(api.grantGlobalPermission, identity, intent);
    yield put({
      type: GRANT_GLOBAL_PERMISSION_SUCCESS
    });
    yield put({
      type: LIST_GLOBAL_PERMISSIONS
    });
  }, true);
}

export function* revokeGlobalPermissionSaga({ identity, intent }) {
  yield execute(function*() {
    yield callApi(api.revokeGlobalPermission, identity, intent);
    yield put({
      type: REVOKE_GLOBAL_PERMISSION_SUCCESS
    });
    yield put({
      type: LIST_GLOBAL_PERMISSIONS
    });
  }, true);
}

export function* listGlobalPermissionSaga() {
  yield execute(function*() {
    const { data } = yield callApi(api.listGlobalPermissions);
    yield put({
      type: LIST_GLOBAL_PERMISSIONS_SUCCESS,
      data
    });
  }, true);
}

export function* fetchUserSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listUser);
    yield put({
      type: FETCH_USER_SUCCESS,
      user: data.items
    });
  }, showLoading);
}

export function* fetchGroupSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listGroup);
    yield put({
      type: FETCH_GROUPS_SUCCESS,
      groups: data.groups
    });
  }, showLoading);
}

export function* createGroupSaga({ groupId, name, users }) {
  yield execute(function*() {
    yield callApi(api.createGroup, groupId, name, users);
    yield put({
      type: CREATE_GROUP_SUCCESS
    });
    yield put({
      type: FETCH_GROUPS,
      show: true
    });
  }, true);
}

export function* addUserToGroupSaga({ groupId, userId }) {
  yield execute(function*() {
    yield callApi(api.addUserToGroup, groupId, userId);
    yield put({
      type: ADD_USER_SUCCESS
    });
    yield put({
      type: FETCH_GROUPS,
      show: true
    });
  }, true);
}

export function* changeUserPasswordSaga({ username, newPassword }) {
  yield execute(function*() {
    yield callApi(api.changeUserPassword, username, newPassword);
    yield put({
      type: CHANGE_USER_PASSWORD_SUCCESS
    });
    yield showSnackbarSuccess();
  }, true);
}

export function* checkUserPasswordSaga({ username, password }) {
  function* checkPassword() {
    yield callApi(api.login, username, password);
    yield put({
      type: CHECK_USER_PASSWORD_SUCCESS
    });
  }

  function* onPasswordCheckError(error) {
    yield put({
      type: CHECK_USER_PASSWORD_ERROR
    });

    throw error;
  }
  yield execute(checkPassword, true, onPasswordCheckError);
}

export function* checkAndChangeUserPasswordSaga({ username, actingUser, currentPassword, newPassword }) {
  try {
    yield checkUserPasswordSaga({ username: actingUser, password: currentPassword });
    yield changeUserPasswordSaga({ username, newPassword });
  } catch (error) {
    yield handleError(error);
  }
}

export function* removeUserFromGroupSaga({ groupId, userId }) {
  yield execute(function*() {
    yield callApi(api.removeUserFromGroup, groupId, userId);
    yield put({
      type: REMOVE_USER_SUCCESS
    });
    yield put({
      type: FETCH_GROUPS,
      show: true
    });
  }, true);
}

export function* fetchNodesSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listNodes);
    yield put({
      type: FETCH_NODES_SUCCESS,
      nodes: data.nodes
    });
  }, showLoading);
}

export function* approveNewOrganizationSaga({ organization, showLoading }) {
  yield execute(function*() {
    yield callApi(api.approveNewOrganization, organization);
    yield put({
      type: APPROVE_ORGANIZATION_SUCCESS
    });
    yield put({
      type: FETCH_NODES,
      show: true
    });
  }, showLoading);
}

export function* approveNewNodeForOrganizationSaga({ address, showLoading }) {
  yield execute(function*() {
    yield callApi(api.approveNewNodeForOrganization, address);
    yield put({
      type: APPROVE_NEW_NODE_FOR_ORGANIZATION_SUCCESS
    });
    yield put({
      type: FETCH_NODES,
      show: true
    });
  }, showLoading);
}

export function* logoutSaga() {
  yield execute(function*() {
    yield put({
      type: LOGOUT_SUCCESS
    });
  });
}

export function* fetchAllProjectsSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listProjects);

    yield put({
      type: FETCH_ALL_PROJECTS_SUCCESS,
      projects: data.items
    });
  }, showLoading);
}

export function* fetchAllProjectDetailsSaga({ projectId, showLoading }) {
  yield execute(function*() {
    const projectDetails = yield callApi(api.viewProjectDetails, projectId);
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS_SUCCESS,
      ...projectDetails.data
    });
  }, showLoading);
}

export function* fetchNextProjectHistoryPageSaga({ projectId, showLoading }) {
  yield execute(function*() {
    const { currentHistoryPage, historyPageSize, totalHistoryItemCount } = yield select(getProjectHistoryState);

    let offset = 0;
    if (totalHistoryItemCount === 0) {
      // Before the first call, we don't know how many history items there are
      // so we fetch a fixed number of the latest items
      offset = -historyPageSize;
    } else {
      // After the first call we just fetch each page
      // If the offset is below 0, we have reached the last page
      // and can fetch the first events
      offset = Math.max(0, totalHistoryItemCount - (currentHistoryPage + 1) * historyPageSize);
    }

    // If the offset is 0, we are on the last page and only need to fetch the remaining items
    const isLastPage = offset === 0;
    const remainingItems = totalHistoryItemCount - currentHistoryPage * historyPageSize;
    // If the remaining items are 0, it means that the total number of history items
    // is a multiple of the page size and we need to fetch a whole page
    const limit = isLastPage && remainingItems !== 0 ? remainingItems : historyPageSize;

    const { historyItemsCount, events } = yield callApi(api.viewProjectHistory, projectId, offset, limit);
    const lastHistoryPage = historyPageSize !== 0 ? Math.ceil(historyItemsCount / historyPageSize) : 1;
    const isFirstPage = totalHistoryItemCount === 0 && historyItemsCount !== 0;
    if (isFirstPage) {
      yield put({
        type: SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT,
        totalHistoryItemsCount: historyItemsCount,
        lastHistoryPage
      });
    }

    yield put({
      type: FETCH_NEXT_PROJECT_HISTORY_PAGE_SUCCESS,
      events,
      currentHistoryPage: currentHistoryPage + 1
    });
  }, showLoading);
}

export function* fetchNextSubprojectHistoryPageSaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    const { currentHistoryPage, historyPageSize, totalHistoryItemCount } = yield select(getSubprojectHistoryState);

    let offset = 0;
    if (totalHistoryItemCount === 0) {
      // Before the first call, we don't know how many history items there are
      // so we fetch a fixed number of the latest items
      offset = -historyPageSize;
    } else {
      // After the first call we just fetch each page
      // If the offset is below 0, we have reached the last page
      // and can fetch the first events
      offset = Math.max(0, totalHistoryItemCount - (currentHistoryPage + 1) * historyPageSize);
    }

    // If the offset is 0, we are on the last page and only need to fetch the remaining items
    const isLastPage = offset === 0;
    const remainingItems = totalHistoryItemCount - currentHistoryPage * historyPageSize;
    // If the remaining items are 0, it means that the total number of history items
    // is a multiple of the page size and we need to fetch a whole page
    const limit = isLastPage && remainingItems !== 0 ? remainingItems : historyPageSize;

    const { historyItemsCount, events } = yield callApi(
      api.viewSubProjectHistory,
      projectId,
      subprojectId,
      offset,
      limit
    );
    const lastHistoryPage = historyPageSize !== 0 ? Math.ceil(historyItemsCount / historyPageSize) : 1;
    const isFirstPage = totalHistoryItemCount === 0 && historyItemsCount !== 0;
    if (isFirstPage) {
      yield put({
        type: SET_TOTAL_SUBPROJECT_HISTORY_ITEM_COUNT,
        totalHistoryItemsCount: historyItemsCount,
        lastHistoryPage
      });
    }

    yield put({
      type: FETCH_NEXT_SUBPROJECT_HISTORY_PAGE_SUCCESS,
      events,
      currentHistoryPage: currentHistoryPage + 1
    });
  }, showLoading);
}

export function* fetchNextWorkflowitemHistoryPageSaga({ projectId, subprojectId, workflowitemId, showLoading }) {
  yield execute(function*() {
    const { currentHistoryPage, historyPageSize, totalHistoryItemCount } = yield select(getWorkflowitemHistoryState);

    let offset = 0;
    if (totalHistoryItemCount === 0) {
      // Before the first call, we don't know how many history items there are
      // so we fetch a fixed number of the latest items
      offset = -historyPageSize;
    } else {
      // After the first call we just fetch each page
      // If the offset is below 0, we have reached the last page
      // and can fetch the first events
      offset = Math.max(0, totalHistoryItemCount - (currentHistoryPage + 1) * historyPageSize);
    }

    // If the offset is 0, we are on the last page and only need to fetch the remaining items
    const isLastPage = offset === 0;
    const remainingItems = totalHistoryItemCount - currentHistoryPage * historyPageSize;
    // If the remaining items are 0, it means that the total number of history items
    // is a multiple of the page size and we need to fetch a whole page
    const limit = isLastPage && remainingItems > 0 ? remainingItems : historyPageSize;

    const { historyItemsCount, events } = yield callApi(
      api.viewWorkflowitemHistory,
      projectId,
      subprojectId,
      workflowitemId,
      offset,
      limit
    );
    const lastHistoryPage = historyPageSize !== 0 ? Math.ceil(historyItemsCount / historyPageSize) : 1;
    const isFirstPage = totalHistoryItemCount === 0 && historyItemsCount !== 0;
    if (isFirstPage) {
      yield put({
        type: SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT,
        totalHistoryItemsCount: historyItemsCount,
        lastHistoryPage
      });
    }

    yield put({
      type: FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS,
      events,
      currentHistoryPage: currentHistoryPage + 1
    });
  }, showLoading);
}

export function* fetchAllSubprojectDetailsSaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.viewSubProjectDetails, projectId, subprojectId);
    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
      ...data
    });
  }, showLoading);
}

export function* fetchProjectPermissionsSaga({ projectId, showLoading }) {
  yield execute(function*() {
    let response;
    try {
      response = yield callApi(api.listProjectIntents, projectId);
    } catch (error) {
      yield put({
        type: FETCH_PROJECT_PERMISSIONS_FAILURE,
        message: error.message
      });
      throw error;
    }

    yield put({
      type: FETCH_PROJECT_PERMISSIONS_SUCCESS,
      permissions: response.data || {}
    });
  }, showLoading);
}

export function* fetchSubProjectPermissionsSaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    let response;
    try {
      response = yield callApi(api.listSubProjectPermissions, projectId, subprojectId);
    } catch (error) {
      yield put({
        type: FETCH_SUBPROJECT_PERMISSIONS_FAILURE,
        message: error.message
      });
      throw error;
    }

    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
      permissions: response.data || {}
    });
  }, showLoading);
}

export function* fetchWorkflowItemPermissionsSaga({ projectId, subprojectId, workflowitemId, showLoading }) {
  yield execute(function*() {
    let response;
    try {
      response = yield callApi(api.listWorkflowItemPermissions, projectId, subprojectId, workflowitemId);
    } catch (error) {
      yield put({
        type: FETCH_WORKFLOWITEM_PERMISSIONS_FAILURE,
        message: error.message
      });
      throw error;
    }
    yield put({
      type: FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
      permissions: response.data || {}
    });
  }, showLoading);
}

export function* grantPermissionsSaga({
  projectId,
  projectDisplayName,
  intent,
  granteeId,
  granteeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (!confirmed) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "project.intent.grantPermission",
        payload: {
          intent,
          project: { id: projectId, displayName: projectDisplayName },
          grantee: { id: granteeId, displayName: granteeDisplayName }
        }
      });
      yield cancel();
    }
    yield callApi(api.grantProjectPermissions, projectId, intent, granteeId);

    yield put({
      type: GRANT_PERMISSION_SUCCESS,
      id: projectId,
      intent: "project.intent.grantPermission",
      permission: intent,
      identity: granteeId
    });

    yield put({
      type: FETCH_PROJECT_PERMISSIONS,
      projectId
    });
  }, showLoading);
}

export function* revokePermissionsSaga({
  projectId,
  projectDisplayName,
  intent,
  revokeeId,
  revokeeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "project.intent.revokePermission",
        payload: {
          intent,
          project: { id: projectId, displayName: projectDisplayName },
          revokee: { id: revokeeId, displayName: revokeeDisplayName }
        }
      });
      yield cancel();
    }
    yield callApi(api.revokeProjectPermissions, projectId, intent, revokeeId);

    yield put({
      type: REVOKE_PERMISSION_SUCCESS,
      id: projectId,
      intent: "project.intent.revokePermission",
      permission: intent,
      identity: revokeeId
    });

    yield put({
      type: FETCH_PROJECT_PERMISSIONS,
      projectId
    });
  }, showLoading);
}

export function* grantSubProjectPermissionsSaga({
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  intent,
  granteeId,
  granteeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "subproject.intent.grantPermission",
        payload: {
          intent,
          project: { id: projectId, displayName: projectDisplayName },
          subproject: { id: subprojectId, displayName: subprojectDisplayName },
          grantee: { id: granteeId, displayName: granteeDisplayName }
        }
      });
      yield cancel();
    }
    yield callApi(api.grantSubProjectPermissions, projectId, subprojectId, intent, granteeId);

    yield put({
      type: GRANT_SUBPROJECT_PERMISSION_SUCCESS,
      id: subprojectId,
      intent: "subproject.intent.grantPermission",
      permission: intent,
      identity: granteeId
    });

    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* revokeSubProjectPermissionsSaga({
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  intent,
  revokeeId,
  revokeeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "subproject.intent.revokePermission",
        payload: {
          intent,
          project: { id: projectId, displayName: projectDisplayName },
          subproject: { id: subprojectId, displayName: subprojectDisplayName },
          revokee: { id: revokeeId, displayName: revokeeDisplayName }
        }
      });
      yield cancel();
    }
    yield callApi(api.revokeSubProjectPermissions, projectId, subprojectId, intent, revokeeId);

    yield put({
      type: REVOKE_SUBPROJECT_PERMISSION_SUCCESS,
      id: subprojectId,
      intent: "subproject.intent.revokePermission",
      permission: intent,
      identity: revokeeId
    });

    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* grantWorkflowItemPermissionsSaga({
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  workflowitemId,
  workflowitemDisplayName,
  intent,
  granteeId,
  granteeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "workflowitem.intent.grantPermission",
        payload: {
          intent,
          project: { id: projectId, displayName: projectDisplayName },
          subproject: { id: subprojectId, displayName: subprojectDisplayName },
          workflowitem: { id: workflowitemId, displayName: workflowitemDisplayName },
          grantee: { id: granteeId, displayName: granteeDisplayName }
        }
      });
      yield cancel();
    }
    yield callApi(api.grantWorkflowItemPermissions, projectId, subprojectId, workflowitemId, intent, granteeId);
    yield put({
      type: GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
      id: workflowitemId,
      intent: "workflowitem.intent.grantPermission",
      permission: intent,
      identity: granteeId
    });

    yield put({
      type: FETCH_WORKFLOWITEM_PERMISSIONS,
      projectId,
      subprojectId,
      workflowitemId,
      showLoading: true
    });
  }, showLoading);
}

export function* revokeWorkflowItemPermissionsSaga({
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  workflowitemId,
  workflowitemDisplayName,
  intent,
  revokeeId,
  revokeeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "workflowitem.intent.revokePermission",
        payload: {
          intent,
          project: { id: projectId, displayName: projectDisplayName },
          subproject: { id: subprojectId, displayName: subprojectDisplayName },
          workflowitem: { id: workflowitemId, displayName: workflowitemDisplayName },
          revokee: { id: revokeeId, displayName: revokeeDisplayName }
        }
      });
      yield cancel();
    }
    yield callApi(api.revokeWorkflowItemPermissions, projectId, subprojectId, workflowitemId, intent, revokeeId);

    yield put({
      type: REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
      id: workflowitemId,
      intent: "workflowitem.intent.revokePermission",
      permission: intent,
      identity: revokeeId
    });

    yield put({
      type: FETCH_WORKFLOWITEM_PERMISSIONS,
      projectId,
      subprojectId,
      workflowitemId,
      showLoading: true
    });
  }, showLoading);
}

export function* closeProjectSaga({ projectId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.closeProject, projectId);
    yield put({ type: CLOSE_PROJECT_SUCCESS });

    yield put({
      type: FETCH_ALL_PROJECT_DETAILS,
      projectId,
      showLoading
    });
  }, showLoading);
}

export function* closeSubprojectSaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.closeSubproject, projectId, subprojectId);
    yield put({ type: CLOSE_SUBPROJECT_SUCCESS });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading
    });
  }, showLoading);
}

export function* closeWorkflowItemSaga({ projectId, subprojectId, workflowitemId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.closeWorkflowItem, projectId, subprojectId, workflowitemId);

    yield put({
      type: CLOSE_WORKFLOWITEM_SUCCESS
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading
    });
  }, showLoading);
}

export function* fetchWorkflowActionsSaga({
  projectId,
  subprojectId,
  ressources,
  selectedAssignee,
  permissions,
  showLoading
}) {
  yield execute(function*() {
    const actions = yield getBatchFromSubprojectTemplate(
      projectId,
      subprojectId,
      ressources,
      selectedAssignee,
      permissions
    );
    yield put({
      type: STORE_WORKFLOWACTIONS,
      actions
    });
  }, showLoading);
}

export function* submitBatchForWorkflowSaga({ projectId, subprojectId, actions, showLoading }) {
  yield execute(function*() {
    for (const index in actions) {
      const action = actions[index];
      try {
        switch (action.action) {
          case strings.common.assign:
            yield callApi(api.assignWorkflowItem, projectId, subprojectId, action.id, action.assignee);
            yield put({
              type: ASSIGN_WORKFLOWITEM_SUCCESS,
              workflowitemId: action.id,
              assignee: action.assignee
            });
            break;

          case strings.common.grant:
            yield callApi(
              api.grantWorkflowItemPermissions,
              projectId,
              subprojectId,
              action.id,
              action.intent,
              action.identity
            );
            yield put({
              type: GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
              workflowitemId: action.id,
              intent: action.intent,
              identity: action.identity
            });
            break;

          case strings.common.revoke:
            yield callApi(
              api.revokeWorkflowItemPermissions,
              projectId,
              subprojectId,
              action.id,
              action.intent,
              action.identity
            );
            yield put({
              type: REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
              workflowitemId: action.id,
              intent: action.intent,
              identity: action.identity
            });
            break;

          default:
            break;
        }
      } catch (error) {
        yield put({
          type: SUBMIT_BATCH_FOR_WORKFLOW_FAILURE,
          workflowitemId: action.id,
          assignee: action.assignee,
          identity: action.identity,
          intent: action.intent
        });
        throw error;
      }
    }
    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading: false
    });
    yield put({
      type: SUBMIT_BATCH_FOR_WORKFLOW_SUCCESS
    });
  }, showLoading);
}

export function* assignWorkflowItemSaga({
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  workflowitemId,
  workflowitemDisplayName,
  assigneeId,
  assigneeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "workflowitem.assign",
        payload: {
          project: { id: projectId, displayName: projectDisplayName },
          subproject: { id: subprojectId, displayName: subprojectDisplayName },
          workflowitem: { id: workflowitemId, displayName: workflowitemDisplayName },
          assignee: { id: assigneeId, displayName: assigneeDisplayName }
        }
      });
      yield cancel();
    }

    yield callApi(api.assignWorkflowItem, projectId, subprojectId, workflowitemId, assigneeId);
    yield put({
      type: ASSIGN_WORKFLOWITEM_SUCCESS,
      workflowitemId,
      assignee: assigneeId
    });
    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* assignSubprojectSaga({
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  assigneeId,
  assigneeDisplayName,
  showLoading
}) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "subproject.assign",
        payload: {
          project: { id: projectId, displayName: projectDisplayName },
          subproject: { id: subprojectId, displayName: subprojectDisplayName },
          assignee: { id: assigneeId, displayName: assigneeDisplayName }
        }
      });
      yield cancel();
    }

    yield callApi(api.assignSubproject, projectId, subprojectId, assigneeId);
    yield put({
      type: ASSIGN_SUBPROJECT_SUCCESS,
      intent: "subproject.assign",
      id: subprojectId,
      identity: assigneeId
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* assignProjectSaga({ projectId, projectDisplayName, assigneeId, assigneeDisplayName, showLoading }) {
  yield execute(function*() {
    const confirmed = yield select(getConfirmedState);
    if (confirmed !== true) {
      yield put({
        type: CONFIRMATION_REQUIRED,
        intent: "project.assign",
        payload: {
          project: { id: projectId, displayName: projectDisplayName },
          assignee: { id: assigneeId, displayName: assigneeDisplayName }
        }
      });
      yield cancel();
    }

    yield callApi(api.assignProject, projectId, assigneeId);
    yield put({
      type: ASSIGN_PROJECT_SUCCESS,
      intent: "project.assign",
      id: projectId,
      identity: assigneeId
    });
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS,
      projectId,
      showLoading: true
    });
  }, showLoading);
}

export function* fetchActivePeersSaga({ showLoading = false }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listActiveNodes);
    yield put({
      type: FETCH_ACTIVE_PEERS_SUCCESS,
      activePeers: data.peers
    });
  }, showLoading);
}
export function* hideWorkflowDetailsSaga() {
  yield execute(function*() {
    yield put({
      type: CLEAR_DOCUMENTS
    });
  });
}

export function* createBackupSaga({ showLoading = true }) {
  yield execute(function*() {
    const data = yield callApi(api.createBackup);
    saveAs(data, "backup.gz");
    yield put({
      type: CREATE_BACKUP_SUCCESS
    });
  }, showLoading);
}

export function* restoreBackupSaga({ file, showLoading = true }) {
  yield execute(function*() {
    const env = yield select(getEnvironment);
    const token = yield select(getJwt);
    const prefix = env === "Test" ? "/test" : "/prod";
    yield call(api.restoreFromBackup, prefix, token, file);
    yield put({
      type: RESTORE_BACKUP_SUCCESS
    });
    yield put({
      type: LOGOUT
    });
  }, showLoading);
}

// LiveUpdate Sagas
export function* liveUpdateProjectSaga({ projectId }) {
  yield execute(function*() {
    yield fetchAllProjectDetailsSaga({ projectId, loading: false });
  }, false);
}

export function* liveUpdateSubProjectSaga({ projectId, subprojectId }) {
  yield execute(function*() {
    yield fetchAllSubprojectDetailsSaga({ projectId, subprojectId, loading: false });
  }, false);
}

export function* liveUpdateNotificationsSaga({ showLoading, offset }) {
  yield execute(function*() {
    const { data } = yield callApi(api.fetchNotifications, offset);
    yield put({
      type: LIVE_UPDATE_NOTIFICATIONS_SUCCESS,
      newNotifications: data.notifications
    });
    yield delay(5000);
    yield put({
      type: TIME_OUT_FLY_IN
    });
  }, showLoading);
}

export function* getProjectKPIsSaga({ projectId, showLoading = true }) {
  yield execute(function*() {
    const {
      data: {
        project: {
          data: { projectedBudgets }
        },
        subprojects
      }
    } = yield callApi(api.viewProjectDetails, projectId);

    try {
      const subprojectBudgets = (yield all(
        subprojects.map(subproject => callApi(api.viewSubProjectDetails, projectId, subproject.data.id))
      )).map(subprojectDetails => {
        const currency = subprojectDetails.data.subproject.data.currency;
        const projected = subprojectDetails.data.subproject.data.projectedBudgets;
        const workflowBudgets = subprojectDetails.data.workflowitems.reduce(
          (acc, next) => {
            if (!next.data.amountType) {
              const error = new Error("redacted");
              error.name = "redacted";
              throw error;
            }
            const { amountType, status, amount, exchangeRate } = next.data;
            if (amountType === "allocated" && status === "closed" && amount) {
              return {
                ...acc,
                allocated: acc.allocated + fromAmountString(amount) * (exchangeRate || 1)
              };
            }

            if (amountType === "disbursed" && status === "closed" && amount) {
              return {
                ...acc,
                disbursed: acc.disbursed + fromAmountString(amount) * (exchangeRate || 1)
              };
            }

            return acc;
          },
          {
            allocated: 0,
            disbursed: 0
          }
        );
        return {
          projected,
          currency,
          disbursed: workflowBudgets.disbursed,
          allocated: workflowBudgets.allocated
        };
      });
      const projectBudgets = subprojectBudgets.reduce(
        (acc, next) => {
          if (next.disbursed !== 0) {
            acc.disbursed.push({ budget: next.disbursed, currency: next.currency });
          }
          if (next.allocated !== 0) {
            acc.allocated.push({ budget: next.allocated, currency: next.currency });
          }
          if (next.projected.length !== 0) {
            acc.projectedOfSubprojects.push(next.projected);
          }
          return {
            disbursed: acc.disbursed,
            allocated: acc.allocated,
            projectedOfSubprojects: acc.projectedOfSubprojects
          };
        },
        { disbursed: [], allocated: [], projectedOfSubprojects: [] }
      );

      yield put({
        type: GET_EXCHANGE_RATES,
        baseCurrency: projectedBudgets[0] ? projectedBudgets[0].currencyCode : "EUR"
      });

      yield put({
        type: GET_PROJECT_KPIS_SUCCESS,
        assignedBudget: projectBudgets.allocated,
        disbursedBudget: projectBudgets.disbursed,
        projectedBudget: projectBudgets.projectedOfSubprojects,
        totalBudget: projectedBudgets,
        displayCurrency: projectedBudgets[0] ? projectedBudgets[0].currencyCode : "EUR"
      });
    } catch (error) {
      if (error.name === "redacted") {
        yield put({
          type: GET_PROJECT_KPIS_FAIL,
          reason: "redacted"
        });
      } else {
        throw error;
      }
    }
  }, showLoading);
}

export function* getSubProjectKPIs({ projectId, subProjectId, showLoading = true }) {
  yield execute(function*() {
    const {
      data: {
        workflowitems = [],
        subproject: {
          data: { projectedBudgets = [], currency = "EUR" }
        }
      }
    } = yield callApi(api.viewSubProjectDetails, projectId, subProjectId);
    yield put({
      type: GET_EXCHANGE_RATES,
      baseCurrency: currency
    });
    try {
      const workflowBudgets = workflowitems.reduce(
        (acc, next) => {
          if (!next.data.amountType) {
            const error = new Error("redacted");
            error.name = "redacted";
            throw error;
          }
          const { amountType, status, amount, exchangeRate } = next.data;
          if (amountType === "allocated" && status === "closed" && amount) {
            return {
              ...acc,
              assignedBudget: acc.assignedBudget + fromAmountString(amount) * exchangeRate
            };
          }

          if (amountType === "disbursed" && status === "closed" && amount) {
            return {
              ...acc,
              disbursedBudget: acc.disbursedBudget + fromAmountString(amount) * exchangeRate
            };
          }

          return acc;
        },
        { assignedBudget: 0, disbursedBudget: 0 }
      );

      const response = {
        subProjectCurrency: currency,
        projectedBudgets: projectedBudgets,
        assignedBudget: workflowBudgets.assignedBudget,
        disbursedBudget: workflowBudgets.disbursedBudget
      };
      yield put({
        type: GET_SUBPROJECT_KPIS_SUCCESS,
        ...response
      });
    } catch (error) {
      if (error.name === "redacted") {
        yield put({
          type: GET_SUBPROJECT_KPIS_FAIL,
          reason: "redacted"
        });
      } else {
        throw error;
      }
    }
  }, showLoading);
}

export function* getExchangeRatesSaga({ baseCurrency, showLoading = true }) {
  yield execute(function*() {
    const exchangeRates = yield getExchangeRates(baseCurrency);
    yield put({
      type: GET_EXCHANGE_RATES_SUCCESS,
      exchangeRates
    });
  }, showLoading);
}

function* exportDataSaga() {
  yield execute(
    function*() {
      const data = yield callApi(api.export);
      saveAs(data, "TruBudget_Export.xlsx");
      yield put({
        type: EXPORT_DATA_SUCCESS
      });
    },
    true,
    function*(error) {
      yield put({
        type: EXPORT_DATA_FAILED,
        error
      });
      yield put({
        type: SNACKBAR_MESSAGE,
        message: "Exporting data failed!"
      });
      yield put({
        type: SHOW_SNACKBAR,
        show: true,
        isError: true,
        isWarning: false
      });
    }
  );
}
function* saveEmailAddressSaga({ emailAddress }) {
  yield execute(
    function*() {
      const id = yield select(getSelfId);
      const currentEmailAddress = yield select(getEmailAddress);
      if (currentEmailAddress.length > 0) {
        yield callApi(api.updateEmailAddress, id, emailAddress);
      } else {
        yield callApi(api.insertEmailAddress, id, emailAddress);
      }
      yield put({
        type: SAVE_EMAIL_ADDRESS_SUCCESS
      });
      yield put({
        type: SNACKBAR_MESSAGE,
        message: formatString(strings.notification.email_saved, emailAddress)
      });
      yield put({
        type: SHOW_SNACKBAR,
        show: true,
        isError: false
      });
      yield fetchEmailAddressSaga();
    },
    true,
    function*(error) {
      yield put({
        type: SNACKBAR_MESSAGE,
        message: strings.notification.save_email_error
      });
      yield put({
        type: SHOW_SNACKBAR,
        show: true,
        isError: true
      });
    }
  );
}

function* fetchEmailAddressSaga() {
  yield execute(
    function*() {
      const id = yield select(getSelfId);
      const data = yield callApi(api.getEmailAddress, id);
      yield put({
        type: FETCH_EMAIL_ADDRESS_SUCCESS,
        emailAddress: data.user.emailAddress
      });
    },
    true,
    function*(error) {
      yield put({
        type: FETCH_EMAIL_ADDRESS_FAILURE,
        error
      });
    }
  );
}

function* checkEmailServiceSaga() {
  yield execute(
    function*() {
      yield callApi(api.checkEmailService);
      yield put({
        type: CHECK_EMAIL_SERVICE_SUCCESS
      });
    },
    true,
    function*(error) {
      yield put({
        type: CHECK_EMAIL_SERVICE_FAILURE,
        error
      });
    }
  );
}

export default function* rootSaga() {
  try {
    yield all([
      // Global
      yield takeLatest(LOGIN, loginSaga),
      yield takeEvery(LOGOUT, logoutSaga),
      yield takeEvery(CREATE_USER, createUserSaga),
      yield takeEvery(GRANT_ALL_USER_PERMISSIONS, grantAllUserPermissionsSaga),
      yield takeEvery(FETCH_USER, fetchUserSaga),
      yield takeEvery(FETCH_GROUPS, fetchGroupSaga),
      yield takeEvery(CREATE_GROUP, createGroupSaga),
      yield takeEvery(ADD_USER, addUserToGroupSaga),
      yield takeEvery(REMOVE_USER, removeUserFromGroupSaga),
      yield takeEvery(FETCH_NODES, fetchNodesSaga),
      yield takeEvery(APPROVE_ORGANIZATION, approveNewOrganizationSaga),
      yield takeEvery(APPROVE_NEW_NODE_FOR_ORGANIZATION, approveNewNodeForOrganizationSaga),
      yield takeLatest(STORE_ENVIRONMENT, setEnvironmentSaga),
      yield takeLatest(FETCH_ENVIRONMENT, getEnvironmentSaga),
      yield takeLatest(GRANT_GLOBAL_PERMISSION, grantGlobalPermissionSaga),
      yield takeLatest(REVOKE_GLOBAL_PERMISSION, revokeGlobalPermissionSaga),
      yield takeLatest(LIST_GLOBAL_PERMISSIONS, listGlobalPermissionSaga),

      // Users
      yield takeEvery(CHECK_AND_CHANGE_USER_PASSWORD, checkAndChangeUserPasswordSaga),

      // LiveUpdates
      yield takeLeading(LIVE_UPDATE_PROJECT, liveUpdateProjectSaga),
      yield takeLeading(LIVE_UPDATE_SUBPROJECT, liveUpdateSubProjectSaga),
      yield takeLeading(LIVE_UPDATE_NOTIFICATIONS, liveUpdateNotificationsSaga),

      // Project
      yield takeEvery(FETCH_ALL_PROJECTS, fetchAllProjectsSaga),
      yield takeEvery(CREATE_PROJECT, createProjectSaga),
      yield takeEvery(EDIT_PROJECT, editProjectSaga),
      yield takeLatest(FETCH_PROJECT_PERMISSIONS, fetchProjectPermissionsSaga),
      yield takeEvery(GRANT_PERMISSION, grantPermissionsSaga),
      yield takeEvery(REVOKE_PERMISSION, revokePermissionsSaga),
      yield takeEvery(ASSIGN_PROJECT, assignProjectSaga),
      yield takeEvery(FETCH_NEXT_PROJECT_HISTORY_PAGE, fetchNextProjectHistoryPageSaga),
      yield takeEvery(CLOSE_PROJECT, closeProjectSaga),
      yield takeEvery(FETCH_ALL_PROJECT_DETAILS, fetchAllProjectDetailsSaga),

      // Subproject
      yield takeEvery(FETCH_ALL_SUBPROJECT_DETAILS, fetchAllSubprojectDetailsSaga),
      yield takeEvery(CREATE_SUBPROJECT, createSubProjectSaga),
      yield takeEvery(EDIT_SUBPROJECT, editSubProjectSaga),
      yield takeLatest(FETCH_SUBPROJECT_PERMISSIONS, fetchSubProjectPermissionsSaga),
      yield takeEvery(GRANT_SUBPROJECT_PERMISSION, grantSubProjectPermissionsSaga),
      yield takeEvery(FETCH_NEXT_SUBPROJECT_HISTORY_PAGE, fetchNextSubprojectHistoryPageSaga),
      yield takeEvery(REVOKE_SUBPROJECT_PERMISSION, revokeSubProjectPermissionsSaga),
      yield takeEvery(CLOSE_SUBPROJECT, closeSubprojectSaga),
      yield takeEvery(ASSIGN_SUBPROJECT, assignSubprojectSaga),

      // Workflow
      yield takeEvery(CREATE_WORKFLOW, createWorkflowItemSaga),
      yield takeEvery(EDIT_WORKFLOW_ITEM, editWorkflowItemSaga),
      yield takeEvery(REORDER_WORKFLOW_ITEMS, reorderWorkflowitemsSaga),
      yield takeLatest(FETCH_WORKFLOWITEM_PERMISSIONS, fetchWorkflowItemPermissionsSaga),
      yield takeEvery(GRANT_WORKFLOWITEM_PERMISSION, grantWorkflowItemPermissionsSaga),
      yield takeEvery(REVOKE_WORKFLOWITEM_PERMISSION, revokeWorkflowItemPermissionsSaga),
      yield takeEvery(CLOSE_WORKFLOWITEM, closeWorkflowItemSaga),
      yield takeEvery(ASSIGN_WORKFLOWITEM, assignWorkflowItemSaga),
      yield takeEvery(HIDE_WORKFLOW_DETAILS, hideWorkflowDetailsSaga),
      yield takeEvery(VALIDATE_DOCUMENT, validateDocumentSaga),
      yield takeEvery(SHOW_WORKFLOW_PREVIEW, fetchWorkflowActionsSaga),
      yield takeEvery(SUBMIT_BATCH_FOR_WORKFLOW, submitBatchForWorkflowSaga),
      yield takeEvery(FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE, fetchNextWorkflowitemHistoryPageSaga),

      // Notifications
      yield takeEvery(FETCH_ALL_NOTIFICATIONS, fetchNotificationsSaga),
      yield takeEvery(FETCH_NOTIFICATION_COUNT, fetchNotificationCountsSaga),
      yield takeEvery(MARK_NOTIFICATION_AS_READ, markNotificationAsReadSaga),
      yield takeEvery(MARK_MULTIPLE_NOTIFICATIONS_AS_READ, markMultipleNotificationsAsReadSaga),

      // Confirmation
      yield takeEvery(EXECUTE_CONFIRMED_ACTIONS, executeConfirmedActionsSaga),

      // Peers
      yield takeLatest(FETCH_ACTIVE_PEERS, fetchActivePeersSaga),

      // System
      yield takeLatest(CREATE_BACKUP, createBackupSaga),
      yield takeLatest(RESTORE_BACKUP, restoreBackupSaga),
      yield takeLatest(FETCH_VERSIONS, fetchVersionsSaga),

      // Analytics
      yield takeLeading(GET_SUBPROJECT_KPIS, getSubProjectKPIs),
      yield takeLeading(GET_PROJECT_KPIS, getProjectKPIsSaga),
      yield takeLeading(GET_EXCHANGE_RATES, getExchangeRatesSaga),
      yield takeLeading(EXPORT_DATA, exportDataSaga),

      //Email
      yield takeEvery(SAVE_EMAIL_ADDRESS, saveEmailAddressSaga),
      yield takeEvery(FETCH_EMAIL_ADDRESS, fetchEmailAddressSaga),
      yield takeEvery(CHECK_EMAIL_SERVICE, checkEmailServiceSaga)
    ]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);

    yield rootSaga();
  }
}
