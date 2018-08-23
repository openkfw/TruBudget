import { delay } from "redux-saga";
import { put, takeEvery, takeLatest, call, select } from "redux-saga/effects";

import Api from "./api.js";

import {
  CREATE_PROJECT,
  CREATE_PROJECT_SUCCESS,
  FETCH_ALL_PROJECTS_SUCCESS,
  FETCH_ALL_PROJECTS,
  EDIT_PROJECT,
  EDIT_PROJECT_SUCCESS,
  FETCH_PROJECT_PERMISSIONS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  GRANT_PERMISSION,
  GRANT_PERMISSION_SUCCESS,
  REVOKE_PERMISSION_SUCCESS,
  REVOKE_PERMISSION
} from "./pages/Overview/actions";

import { VALIDATE_DOCUMENT, VALIDATE_DOCUMENT_SUCCESS, CLEAR_DOCUMENT } from "./pages/Documents/actions";
import {
  CREATE_SUBPROJECT,
  CREATE_SUBPROJECT_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS,
  ASSIGN_PROJECT_SUCCESS,
  ASSIGN_PROJECT,
  FETCH_PROJECT_HISTORY_SUCCESS,
  FETCH_PROJECT_HISTORY,
  EDIT_SUBPROJECT_SUCCESS,
  EDIT_SUBPROJECT,
  CLOSE_PROJECT,
  CLOSE_PROJECT_SUCCESS,
  REVOKE_SUBPROJECT_PERMISSION_SUCCESS,
  REVOKE_SUBPROJECT_PERMISSION,
  GRANT_SUBPROJECT_PERMISSION,
  GRANT_SUBPROJECT_PERMISSION_SUCCESS,
  FETCH_SUBPROJECT_PERMISSIONS,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS
} from "./pages/SubProjects/actions";
import {
  SHOW_SNACKBAR,
  SNACKBAR_MESSAGE,
  MARK_NOTIFICATION_AS_READ_SUCCESS,
  MARK_NOTIFICATION_AS_READ,
  FETCH_NOTIFICATIONS_WITH_ID_SUCCESS,
  FETCH_NOTIFICATIONS_WITH_ID,
  FETCH_ALL_NOTIFICATIONS,
  FETCH_ALL_NOTIFICATIONS_SUCCESS
} from "./pages/Notifications/actions";
import {
  CREATE_WORKFLOW,
  CREATE_WORKFLOW_SUCCESS,
  FETCH_ALL_SUBPROJECT_DETAILS,
  FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
  FETCH_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION,
  CLOSE_WORKFLOWITEM,
  CLOSE_WORKFLOWITEM_SUCCESS,
  ASSIGN_WORKFLOWITEM_SUCCESS,
  ASSIGN_WORKFLOWITEM,
  ASSIGN_SUBPROJECT_SUCCESS,
  ASSIGN_SUBPROJECT,
  FETCH_SUBPROJECT_HISTORY,
  FETCH_SUBPROJECT_HISTORY_SUCCESS,
  REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
  REVOKE_WORKFLOWITEM_PERMISSION,
  EDIT_WORKFLOW_ITEM_SUCCESS,
  EDIT_WORKFLOW_ITEM,
  REORDER_WORKFLOW_ITEMS,
  REORDER_WORKFLOW_ITEMS_SUCCESS,
  CLOSE_SUBPROJECT,
  CLOSE_SUBPROJECT_SUCCESS
} from "./pages/Workflows/actions";

import {
  LOGIN,
  LOGIN_SUCCESS,
  SHOW_LOGIN_ERROR,
  STORE_ENVIRONMENT,
  LOGOUT_SUCCESS,
  LOGOUT,
  FETCH_USER_SUCCESS,
  FETCH_USER,
  FETCH_ENVIRONMENT_SUCCESS,
  FETCH_ENVIRONMENT,
  STORE_ENVIRONMENT_SUCCESS
} from "./pages/Login/actions";

import { showLoadingIndicator, hideLoadingIndicator, cancelDebounce } from "./pages/Loading/actions.js";
import {
  CREATE_USER_SUCCESS,
  CREATE_USER,
  FETCH_GROUPS_SUCCESS,
  FETCH_GROUPS,
  CREATE_GROUP_SUCCESS,
  CREATE_GROUP,
  ADD_USER,
  ADD_USER_SUCCESS,
  REMOVE_USER_SUCCESS,
  REMOVE_USER,
  GRANT_ALL_USER_PERMISSIONS_SUCCESS,
  GRANT_ALL_USER_PERMISSIONS
} from "./pages/Users/actions.js";
import {
  FETCH_NODES_SUCCESS,
  FETCH_NODES,
  APPROVE_ORGANIZATION,
  APPROVE_ORGANIZATION_SUCCESS,
  APPROVE_NEW_NODE_FOR_ORGANIZATION,
  APPROVE_NEW_NODE_FOR_ORGANIZATION_SUCCESS
} from "./pages/Nodes/actions.js";
import { FETCH_ACTIVE_PEERS, FETCH_ACTIVE_PEERS_SUCCESS } from "./pages/Navbar/actions.js";

const api = new Api();

function* execute(fn, showLoading = false, errorCallback = undefined) {
  const done = yield handleLoading(showLoading);
  try {
    yield fn();
  } catch (error) {
    if (typeof errorCallback === "function") {
      yield errorCallback(error);
    } else {
      console.error(error);
      yield handleError(error);
    }
  } finally {
    yield done();
  }
}

function* handleError(error) {
  console.error("API-Error: ", error.response || "unknown");
  console.error(error);

  // which status should we use?
  if (error.response.status === 401) {
    yield call(logoutSaga);
  } else if (error.response && error.response.data) {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: error.response.data.error.message
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true
    });
  } else {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: "Disconnected!"
    });
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true
    });
  }
}

const getJwt = state => state.toJS().login.jwt;
const getEnvironment = state => {
  const env = state.getIn(["login", "environment"]);
  if (env) {
    return env;
  }
  return "Test";
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

// SAGAS

export function* createProject(action) {
  yield execute(function*() {
    yield callApi(api.createProject, action.name, action.amount, action.comment, action.currency, action.thumbnail);
    yield put({
      type: CREATE_PROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECTS,
      showLoading: true
    });
  }, true);
}

export function* editProjectSaga({ projectId, changes }) {
  yield execute(function*() {
    yield callApi(api.editProject, projectId, changes);
    yield put({
      type: EDIT_PROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECTS,
      showLoading: true
    });
  }, true);
}

export function* createSubProjectSaga({ projectId, name, amount, description, currency, showLoading }) {
  yield execute(function*() {
    yield callApi(api.createSubProject, projectId, name, `${amount}`, description, currency);
    yield put({
      type: CREATE_SUBPROJECT_SUCCESS
    });
    yield put({
      type: FETCH_ALL_PROJECT_DETAILS,
      projectId,
      showLoading
    });
  }, showLoading);
}

export function* editSubProjectSaga({ projectId, subprojectId, changes }) {
  yield execute(function*() {
    yield callApi(api.editSubProject, projectId, subprojectId, changes);
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
    yield callApi(api.createWorkflowItem, rest);
    yield put({
      type: CREATE_WORKFLOW_SUCCESS
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
    yield call(delay, 4000);
    yield put({
      type: CLEAR_DOCUMENT,
      document: hash
    });
  });
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

export function* fetchAllNotificationsSaga({ showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.fetchNotifications);
    yield put({
      type: FETCH_ALL_NOTIFICATIONS_SUCCESS,
      notifications: data.notifications
    });
  }, showLoading);
}

export function* fetchNotificationWithIdSaga({ fromId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.fetchNotifications, fromId);
    yield put({
      type: FETCH_NOTIFICATIONS_WITH_ID_SUCCESS,
      notifications: data.notifications
    });
  }, showLoading);
}

export function* markNotificationAsReadSaga({ notificationId }) {
  yield execute(function*() {
    yield callApi(api.markNotificationAsRead, notificationId);
    yield put({
      type: MARK_NOTIFICATION_AS_READ_SUCCESS
    });
    yield put({
      type: FETCH_ALL_NOTIFICATIONS,
      showLoading: false
    });
  }, false);
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

export function* fetchProjectHistorySaga({ projectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.viewProjectHistory, projectId);
    yield put({
      type: FETCH_PROJECT_HISTORY_SUCCESS,
      ...data
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

export function* fetchSubprojectHistorySaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.viewSubProjectHistory, projectId, subprojectId);
    yield put({
      type: FETCH_SUBPROJECT_HISTORY_SUCCESS,
      ...data
    });
  }, showLoading);
}

export function* fetchProjectPermissionsSaga({ projectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listProjectIntents, projectId);

    yield put({
      type: FETCH_PROJECT_PERMISSIONS_SUCCESS,
      permissions: data || {}
    });
  }, showLoading);
}

export function* fetchSubProjectPermissionsSaga({ projectId, subprojectId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listSubProjectPermissions, projectId, subprojectId);

    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
      permissions: data || {}
    });
  }, showLoading);
}

export function* fetchWorkflowItemPermissionsSaga({ projectId, workflowitemId, showLoading }) {
  yield execute(function*() {
    const { data } = yield callApi(api.listWorkflowItemPermissions, projectId, workflowitemId);
    yield put({
      type: FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
      permissions: data || {}
    });
  }, showLoading);
}

export function* grantPermissionsSaga({ projectId, intent, identity, showLoading }) {
  yield execute(function*() {
    yield callApi(api.grantProjectPermissions, projectId, intent, identity);

    yield put({
      type: GRANT_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_PROJECT_PERMISSIONS,
      projectId
    });
  }, showLoading);
}

export function* revokePermissionsSaga({ projectId, intent, identity, showLoading }) {
  yield execute(function*() {
    yield callApi(api.revokeProjectPermissions, projectId, intent, identity);

    yield put({
      type: REVOKE_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_PROJECT_PERMISSIONS,
      projectId
    });
  }, showLoading);
}

export function* grantSubProjectPermissionsSaga({ projectId, subprojectId, intent, identity, showLoading }) {
  yield execute(function*() {
    yield callApi(api.grantSubProjectPermissions, projectId, subprojectId, intent, identity);

    yield put({
      type: GRANT_SUBPROJECT_PERMISSION_SUCCESS
    });

    yield put({
      type: FETCH_SUBPROJECT_PERMISSIONS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* revokeSubProjectPermissionsSaga({ projectId, subprojectId, intent, identity, showLoading }) {
  yield execute(function*() {
    yield callApi(api.revokeSubProjectPermissions, projectId, subprojectId, intent, identity);

    yield put({
      type: REVOKE_SUBPROJECT_PERMISSION_SUCCESS
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
  subprojectId,
  workflowitemId,
  intent,
  identity,
  showLoading
}) {
  yield execute(function*() {
    yield callApi(api.grantWorkflowItemPermissions, projectId, subprojectId, workflowitemId, intent, identity);

    yield put({
      type: GRANT_WORKFLOWITEM_PERMISSION_SUCCESS
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
  subprojectId,
  workflowitemId,
  intent,
  identity,
  showLoading
}) {
  yield execute(function*() {
    yield callApi(api.revokeWorkflowItemPermissions, projectId, subprojectId, workflowitemId, intent, identity);

    yield put({
      type: REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS
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

export function* assignWorkflowItemSaga({ projectId, subprojectId, workflowitemId, assigneeId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.assignWorkflowItem, projectId, subprojectId, workflowitemId, assigneeId);
    yield put({
      type: ASSIGN_WORKFLOWITEM_SUCCESS
    });
    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* assignSubprojectSaga({ projectId, subprojectId, assigneeId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.assignSubproject, projectId, subprojectId, assigneeId);
    yield put({
      type: ASSIGN_SUBPROJECT_SUCCESS
    });

    yield put({
      type: FETCH_ALL_SUBPROJECT_DETAILS,
      projectId,
      subprojectId,
      showLoading: true
    });
  }, showLoading);
}

export function* assignProjectSaga({ projectId, assigneeId, showLoading }) {
  yield execute(function*() {
    yield callApi(api.assignProject, projectId, assigneeId);
    yield put({
      type: ASSIGN_PROJECT_SUCCESS
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

// WATCHERS

export function* watchFetchAllSubprojectDetails() {
  yield takeEvery(FETCH_ALL_SUBPROJECT_DETAILS, fetchAllSubprojectDetailsSaga);
}

export function* watchFetchSubprojectHistory() {
  yield takeEvery(FETCH_SUBPROJECT_HISTORY, fetchSubprojectHistorySaga);
}

export function* watchFetchAllProjectDetails() {
  yield takeEvery(FETCH_ALL_PROJECT_DETAILS, fetchAllProjectDetailsSaga);
}
export function* watchFetchProjectHistorySaga() {
  yield takeEvery(FETCH_PROJECT_HISTORY, fetchProjectHistorySaga);
}

export function* watchFetchAllProjects() {
  yield takeEvery(FETCH_ALL_PROJECTS, fetchAllProjectsSaga);
}

export function* watchCreateSubProject() {
  yield takeEvery(CREATE_SUBPROJECT, createSubProjectSaga);
}

export function* watchEditSubProject() {
  yield takeEvery(EDIT_SUBPROJECT, editSubProjectSaga);
}

export function* watchCreateWorkflowItem() {
  yield takeEvery(CREATE_WORKFLOW, createWorkflowItemSaga);
}

export function* watchEditWorkflowItem() {
  yield takeEvery(EDIT_WORKFLOW_ITEM, editWorkflowItemSaga);
}

export function* watchReorderWorkflowItems() {
  yield takeEvery(REORDER_WORKFLOW_ITEMS, reorderWorkflowitemsSaga);
}

export function* watchCreateProject() {
  yield takeEvery(CREATE_PROJECT, createProject);
}

export function* watchEditProject() {
  yield takeEvery(EDIT_PROJECT, editProjectSaga);
}

export function* watchFetchAllNotifications() {
  yield takeEvery(FETCH_ALL_NOTIFICATIONS, fetchAllNotificationsSaga);
}

export function* watchFetchNotificationsWithId() {
  yield takeEvery(FETCH_NOTIFICATIONS_WITH_ID, fetchNotificationWithIdSaga);
}

export function* watchMarkNotificationAsRead() {
  yield takeEvery(MARK_NOTIFICATION_AS_READ, markNotificationAsReadSaga);
}

export function* watchLogin() {
  yield takeLatest(LOGIN, loginSaga);
}

export function* watchCreateUser() {
  yield takeEvery(CREATE_USER, createUserSaga);
}

export function* watchGrantAllUserPermissions() {
  yield takeEvery(GRANT_ALL_USER_PERMISSIONS, grantAllUserPermissionsSaga);
}
export function* watchFetchUser() {
  yield takeEvery(FETCH_USER, fetchUserSaga);
}
export function* watchFetchGroups() {
  yield takeEvery(FETCH_GROUPS, fetchGroupSaga);
}

export function* watchCreateGroup() {
  yield takeEvery(CREATE_GROUP, createGroupSaga);
}

export function* watchAddUserToGroup() {
  yield takeEvery(ADD_USER, addUserToGroupSaga);
}
export function* watchRemoveUserFromGroup() {
  yield takeEvery(REMOVE_USER, removeUserFromGroupSaga);
}

export function* watchFetchNodes() {
  yield takeEvery(FETCH_NODES, fetchNodesSaga);
}
export function* watchApproveNewOrganization() {
  yield takeEvery(APPROVE_ORGANIZATION, approveNewOrganizationSaga);
}

export function* watchApproveNewNodeForOrganization() {
  yield takeEvery(APPROVE_NEW_NODE_FOR_ORGANIZATION, approveNewNodeForOrganizationSaga);
}

export function* watchLogout() {
  yield takeEvery(LOGOUT, logoutSaga);
}

export function* watchSetEnvironment() {
  yield takeLatest(STORE_ENVIRONMENT, setEnvironmentSaga);
}

export function* watchGetEnvironment() {
  yield takeLatest(FETCH_ENVIRONMENT, getEnvironmentSaga);
}

export function* watchFetchProjectPermissions() {
  yield takeLatest(FETCH_PROJECT_PERMISSIONS, fetchProjectPermissionsSaga);
}

export function* watchFetchSubProjectPermissions() {
  yield takeLatest(FETCH_SUBPROJECT_PERMISSIONS, fetchSubProjectPermissionsSaga);
}
export function* watchFetchWorkflowItemPermissions() {
  yield takeLatest(FETCH_WORKFLOWITEM_PERMISSIONS, fetchWorkflowItemPermissionsSaga);
}
export function* watchGrantPermissions() {
  yield takeEvery(GRANT_PERMISSION, grantPermissionsSaga);
}
export function* watchRevokePermissions() {
  yield takeEvery(REVOKE_PERMISSION, revokePermissionsSaga);
}
export function* watchGrantSubProjectPermissions() {
  yield takeEvery(GRANT_SUBPROJECT_PERMISSION, grantSubProjectPermissionsSaga);
}
export function* watchRevokeSubProjectPermissions() {
  yield takeEvery(REVOKE_SUBPROJECT_PERMISSION, revokeSubProjectPermissionsSaga);
}
export function* watchGrantWorkflowitemPermissions() {
  yield takeEvery(GRANT_WORKFLOWITEM_PERMISSION, grantWorkflowItemPermissionsSaga);
}
export function* watchRevokeWorkflowitemPermissions() {
  yield takeEvery(REVOKE_WORKFLOWITEM_PERMISSION, revokeWorkflowItemPermissionsSaga);
}
export function* watchCloseProject() {
  yield takeEvery(CLOSE_PROJECT, closeProjectSaga);
}
export function* watchCloseSubproject() {
  yield takeEvery(CLOSE_SUBPROJECT, closeSubprojectSaga);
}
export function* watchCloseWorkflowItem() {
  yield takeEvery(CLOSE_WORKFLOWITEM, closeWorkflowItemSaga);
}
export function* watchAssignWorkflowItem() {
  yield takeEvery(ASSIGN_WORKFLOWITEM, assignWorkflowItemSaga);
}
export function* watchAssignSubproject() {
  yield takeEvery(ASSIGN_SUBPROJECT, assignSubprojectSaga);
}
export function* watchAssignProject() {
  yield takeEvery(ASSIGN_PROJECT, assignProjectSaga);
}
export function* watchFetchAcitvePeers() {
  yield takeLatest(FETCH_ACTIVE_PEERS, fetchActivePeersSaga);
}
export function* watchValidateDocument() {
  yield takeEvery(VALIDATE_DOCUMENT, validateDocumentSaga);
}

export default function* rootSaga() {
  try {
    yield [
      // Global
      watchFetchUser(),
      watchCreateUser(),
      watchLogin(),
      watchLogout(),
      watchSetEnvironment(),
      watchGetEnvironment(),
      watchFetchNodes(),
      watchApproveNewOrganization(),
      watchApproveNewNodeForOrganization(),
      watchFetchGroups(),
      watchCreateGroup(),
      watchAddUserToGroup(),
      watchRemoveUserFromGroup(),
      watchGrantAllUserPermissions(),

      // Project
      watchCreateProject(),
      watchFetchAllProjects(),
      watchFetchAllProjectDetails(),
      watchFetchProjectPermissions(),
      watchGrantPermissions(),
      watchRevokePermissions(),
      watchAssignProject(),
      watchFetchProjectHistorySaga(),
      watchEditProject(),
      watchCloseProject(),

      // Subproject
      watchCreateSubProject(),
      watchEditSubProject(),
      watchFetchAllSubprojectDetails(),
      watchFetchSubProjectPermissions(),
      watchGrantSubProjectPermissions(),
      watchRevokeSubProjectPermissions(),
      watchAssignSubproject(),
      watchFetchSubprojectHistory(),
      watchCloseSubproject(),

      // Workflow
      watchCreateWorkflowItem(),
      watchEditWorkflowItem(),
      watchReorderWorkflowItems(),
      watchFetchWorkflowItemPermissions(),
      watchGrantWorkflowitemPermissions(),
      watchRevokeWorkflowitemPermissions(),
      watchCloseWorkflowItem(),
      watchAssignWorkflowItem(),
      watchValidateDocument(),

      // Notifications
      watchFetchAllNotifications(),
      watchFetchNotificationsWithId(),
      watchMarkNotificationAsRead(),

      // Peers
      watchFetchAcitvePeers()
    ];
  } catch (error) {
    console.log(error);
  }
}
