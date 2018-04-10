import { put, takeEvery, takeLatest, call, select } from 'redux-saga/effects'

import Api from './api.js';
import { FETCH_UPDATES, FETCH_UPDATES_SUCCESS } from './pages/LiveUpdates/actions';
import { FETCH_PEERS, FETCH_PEERS_SUCCESS, FETCH_STREAM_NAMES, FETCH_STREAM_NAMES_SUCCESS } from './pages/Navbar/actions';
import { FETCH_PROJECTS, FETCH_PROJECTS_SUCCESS, CREATE_PROJECT, CREATE_PROJECT_SUCCESS, FETCH_ALL_PROJECTS_SUCCESS, FETCH_ALL_PROJECTS } from './pages/Overview/actions';


import { FETCH_PROJECT_DETAILS, FETCH_PROJECT_DETAILS_SUCCESS, CREATE_SUBPROJECT, CREATE_SUBPROJECT_SUCCESS, FETCH_ALL_PROJECT_DETAILS_SUCCESS, FETCH_ALL_PROJECT_DETAILS } from './pages/SubProjects/actions';
import { FETCH_NODE_INFORMATION, FETCH_NODE_INFORMATION_SUCCESS } from './pages/Dashboard/actions';
import { FETCH_NOTIFICATIONS, FETCH_NOTIFICATIONS_SUCCESS, MARK_NOTIFICATION_AS_READ, MARK_NOTIFICATION_AS_READ_SUCCESS, SHOW_SNACKBAR, SNACKBAR_MESSAGE } from './pages/Notifications/actions';
import { FETCH_WORKFLOW_ITEMS, FETCH_WORKFLOW_ITEMS_SUCCESS, CREATE_WORKFLOW, EDIT_WORKFLOW, CREATE_WORKFLOW_SUCCESS, EDIT_WORKFLOW_SUCCESS, FETCH_HISTORY_SUCCESS, FETCH_HISTORY, POST_WORKFLOW_SORT, POST_WORKFLOW_SORT_SUCCESS, ENABLE_WORKFLOW_SORT, POST_SUBPROJECT_EDIT, POST_SUBPROJECT_EDIT_SUCCESS, FETCH_ALL_SUBPROJECT_DETAILS, FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS } from './pages/Workflows/actions';

import { FETCH_USERS, FETCH_USERS_SUCCESS, FETCH_ROLES, FETCH_ROLES_SUCCESS, LOGIN, LOGIN_SUCCESS, SHOW_LOGIN_ERROR, STORE_ENVIRONMENT, LOGOUT_SUCCESS, LOGOUT, FETCH_USER_SUCCESS, FETCH_USER, ADMIN_LOGIN, ADMIN_LOGOUT, ADMIN_LOGOUT_SUCCESS, ADMIN_LOGIN_SUCCESS, SHOW_ADMIN_LOGIN_ERROR, FETCH_ADMIN_USER_SUCCESS, FETCH_ENVIRONMENT_SUCCESS, FETCH_ENVIRONMENT, STORE_ENVIRONMENT_SUCCESS } from './pages/Login/actions';
import { VALIDATE_DOCUMENT, VALIDATE_DOCUMENT_SUCCESS, ADD_DOCUMENT, ADD_DOCUMENT_SUCCESS } from './pages/Documents/actions';
import { FETCH_NODE_PERMISSIONS, FETCH_NODE_PERMISSIONS_SUCCESS, ADD_USER, ADD_USER_SUCCESS, ADD_ROLE_SUCCESS, ADD_ROLE } from './pages/Admin/actions';
import { showLoadingIndicator, hideLoadingIndicator, cancelDebounce } from './pages/Loading/actions.js';


const api = new Api();

function* handleError(error) {
  if (error.response.status === 401) {
    yield call(logoutSaga)
  } else if (error.response) {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: error.response.data
    })
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true
    })
  } else {
    yield put({
      type: SNACKBAR_MESSAGE,
      message: "Disconnected!"
    })
    yield put({
      type: SHOW_SNACKBAR,
      show: true,
      isError: true
    })
  }
}

const getJwt = (state) => state.toJS().login.jwt
const getEnvironment = (state) => {
  const env = state.toJS().login.environment
  if (env) {
    return env;
  }
  return 'Test'
}

function* callApi(func, ...args) {
  const token = yield select(getJwt)
  yield call(api.setAuthorizationHeader, token)
  const env = yield select(getEnvironment)
  const prefix = env === 'Test' ? '/test' : '/api';
  yield call(api.setBaseUrl, prefix)
  return yield call(func, ...args);
}

function* handleLoading(showLoading) {
  if (showLoading) {
    yield put(showLoadingIndicator())
    return function* done() {
      yield put(cancelDebounce())
      yield put(hideLoadingIndicator())
    }
  } else {
    return function* () { }
  }
}

const chill = async (ms) => new Promise(res => setTimeout(res, ms))

////////////////////// Specific Sagas start here /////////////////

export function* fetchPeersSaga(action) {
  try {
    const peers = yield callApi(api.fetchPeers);
    yield put({
      type: FETCH_PEERS_SUCCESS,
      peers: peers.data
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchProjectDetailsSaga(action) {
  try {
    const projectDetails = yield callApi(api.fetchProjectDetails, action.project)
    yield put({
      type: FETCH_PROJECT_DETAILS_SUCCESS,
      projectDetails: projectDetails.data
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchProjectsSaga() {
  try {
    const projects = yield callApi(api.fetchProjects)
    yield put({
      type: FETCH_PROJECTS_SUCCESS,
      projects: projects.data
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchWorkflowItemsSaga(action) {
  try {
    const workflowItems = yield callApi(api.fetchWorkflowItems, action.streamName);
    yield put({
      type: FETCH_WORKFLOW_ITEMS_SUCCESS,
      workflowItems: workflowItems.data
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* createProject(action) {
  try {
    yield callApi(api.postProject, action.name, action.amount, action.comment, action.currency, action.approver, action.assignee, action.bank, action.thumbnail);
    yield put({
      type: CREATE_PROJECT_SUCCESS
    });
    yield put({
      type: FETCH_PROJECTS
    });
  } catch (error) {
    yield handleError(error);
  }
}
export function* createSubProjectSaga(action) {
  try {
    yield callApi(api.postSubProject, action.parentName, action.subProjectName, action.subProjectAmount, action.subProjectComment, action.subProjectCurrency);
    yield put({
      type: CREATE_SUBPROJECT_SUCCESS
    });
    yield put({
      type: FETCH_PROJECT_DETAILS,
      project: action.parentName
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* createWorkflowItemSaga(action) {
  const { stream, workflowName, amount, amountType, currency, comment, documents, state, workflowType, approvalRequired } = action;
  try {
    yield callApi(api.postWorkflowItem, stream, workflowName, amount, amountType, currency, comment, documents, state, workflowType, approvalRequired);
    yield put({
      type: CREATE_WORKFLOW_SUCCESS
    });
    yield put({
      type: FETCH_WORKFLOW_ITEMS,
      streamName: action.stream
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* editWorkflowItemSaga(action) {
  const { stream, key, workflowName, amount, amountType, currency, comment, documents, state, txid, previousState, workflowType, approvalRequired } = action;
  try {
    yield callApi(api.editWorkflowItem, stream, key, workflowName, amount, amountType, currency, comment, documents, state, txid, previousState, workflowType, approvalRequired);
    yield put({
      type: EDIT_WORKFLOW_SUCCESS
    });
    yield put({
      type: FETCH_WORKFLOW_ITEMS,
      streamName: action.stream
    });
  } catch (error) {
    yield handleError(error);
  }
}


export function* editSubProjectSaga(action) {
  try {
    yield callApi(api.editSubProject, action.parent, action.streamName, action.status, action.amount);
    yield put({
      type: POST_SUBPROJECT_EDIT_SUCCESS
    });
    yield put({
      type: FETCH_WORKFLOW_ITEMS,
      streamName: action.streamName
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* setEnvironmentSaga(action) {
  try {
    yield put({
      type: STORE_ENVIRONMENT_SUCCESS,
      environment: action.environment,
      productionActive: action.productionActive
    })
    yield put({
      type: FETCH_ENVIRONMENT
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* getEnvironmentSaga() {
  try {
    const env = yield select(getEnvironment);
    yield put({
      type: FETCH_ENVIRONMENT_SUCCESS,
      environment: env,
      productionActive: env === 'Test' ? false : true
    });
  } catch (error) {
    yield handleError(error)
  }
}



export function* fetchNodeInformationSaga() {
  try {
    const nodeInformation = yield callApi(api.fetchNodeInformation)
    yield put({
      type: FETCH_NODE_INFORMATION_SUCCESS,
      nodeInformation: nodeInformation.data
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchNotificationSaga({ user }) {
  try {
    const notifications = yield callApi(api.fetchNotifications, user)
    yield put({
      type: FETCH_NOTIFICATIONS_SUCCESS,
      notifications: notifications.data
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* postWorkflowSortSaga({ streamName, order, sortEnabled }) {
  try {
    yield callApi(api.postWorkflowSort, streamName, order);
    yield put({
      type: POST_WORKFLOW_SORT_SUCCESS
    });
    yield put({
      type: FETCH_WORKFLOW_ITEMS,
      streamName
    });
    yield put({
      type: ENABLE_WORKFLOW_SORT,
      sortEnabled
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* markNotificationAsReadSaga({ user, id, data }) {
  try {
    yield callApi(api.markNotificationAsRead, user, id, data);
    yield put({
      type: MARK_NOTIFICATION_AS_READ_SUCCESS
    });
    yield put({
      type: FETCH_NOTIFICATIONS,
      user
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchUsersSaga() {
  try {
    const users = yield callApi(api.fetchUsers)
    yield put({
      type: FETCH_USERS_SUCCESS,
      users: users.data
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* addUserSaga({ username, fullName, avatar, password, role }) {
  try {
    yield callApi(api.addUser, username, fullName, avatar, password, role);
    yield put({
      type: FETCH_USERS
    })
    yield put({
      type: ADD_USER_SUCCESS
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* addRoleSaga({ name, organization, read, write, admin }) {
  try {
    yield callApi(api.addRole, name, organization, read, write, admin);
    yield put({
      type: FETCH_ROLES
    });
    yield put({
      type: ADD_ROLE_SUCCESS
    })
  } catch (error) {
    yield handleError(error);
  }
}


export function* fetchRolesSaga() {
  try {
    const roles = yield callApi(api.fetchRoles);
    yield put({
      type: FETCH_ROLES_SUCCESS,
      roles: roles.data
    })
  } catch (error) {
    yield handleError(error);
  }
}


export function* loginSaga({ user }) {
  const done = yield handleLoading(true);
  try {
    const jwt = yield callApi(api.login, user.username, user.password);
    yield call(chill, 1250);

    yield put({
      type: LOGIN_SUCCESS,
      jwt,
    })
    yield put({
      type: SHOW_LOGIN_ERROR,
      show: false
    })
  } catch (error) {
    console.log(error)
    yield put({
      type: SHOW_LOGIN_ERROR,
      show: true
    })
  } finally {
    yield done();
  }

}


export function* adminLoginSaga({ user }) {
  try {
    const data = yield callApi(api.loginAdmin, user.username, user.password);
    yield put({
      type: FETCH_ADMIN_USER_SUCCESS,
      user: {
        username: data.user.id,
        ...data.user
      },
      jwt: data.jwtToken,
    })
    yield put({
      type: ADMIN_LOGIN_SUCCESS
    })
    yield put({
      type: SHOW_ADMIN_LOGIN_ERROR,
      show: false
    })
  } catch (error) {
    console.log(error)
    yield put({
      type: SHOW_ADMIN_LOGIN_ERROR,
      show: true
    })
  }
}

export function* fetchUserWithJwtSaga({ showLoading }) {
  const done = yield handleLoading(showLoading);
  try {
    yield call(api.fetchUser);
    yield call(chill, 1250);
    yield put({
      type: LOGIN_SUCCESS
    })
  } catch (error) {
    yield handleError(error);
  } finally {
    yield done();
  }
}

export function* logoutSaga() {
  try {
    yield put({
      type: LOGOUT_SUCCESS
    })
  } catch (error) {
    console.log(error)
    yield handleError(error);
  }
}

export function* adminLogoutSaga() {
  try {
    yield put({
      type: ADMIN_LOGOUT_SUCCESS
    })
  } catch (error) {
    console.log(error)
    yield handleError(error);
  }
}




export function* fetchStreamNamesSaga() {
  try {
    const streamNames = yield callApi(api.fetchStreamNames)
    yield put({
      type: FETCH_STREAM_NAMES_SUCCESS,
      streamNames: streamNames.data
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchHistorySaga({ project }) {
  try {
    const history = yield callApi(api.fetchHistory, project);
    yield put({
      type: FETCH_HISTORY_SUCCESS,
      historyItems: history.data
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* validateDocumentSaga({ payload, hash }) {
  try {
    const response = yield callApi(api.validateDocument, payload, hash);
    yield put({
      type: VALIDATE_DOCUMENT_SUCCESS,
      validates: response.data.validates,
      hash
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* addDocumentSaga({ id, payload }) {
  try {
    const hash = yield callApi(api.hashDocument, payload);
    yield put({
      type: ADD_DOCUMENT_SUCCESS,
      hash: hash.data,
      id
    })
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchUpdatesSaga({ user }) {
  try {
    const notifications = yield callApi(api.fetchNotifications, user);
    const users = yield callApi(api.fetchUsers);
    const peers = yield callApi(api.fetchPeers);
    const streamNames = yield callApi(api.fetchStreamNames)
    const projects = yield callApi(api.fetchProjects);
    yield put({
      type: FETCH_UPDATES_SUCCESS,
      users: users.data,
      peers: peers.data,
      notifications: notifications.data,
      streamNames: streamNames.data,
      projects: projects.data,
    });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchNodePermissionsSaga() {
  const permissions = yield callApi(api.fetchPermissions);
  yield put({
    type: FETCH_NODE_PERMISSIONS_SUCCESS,
    permissions: permissions.data
  })
}


export function* fetchAllProjectsSaga({ showLoading }) {
  const done = yield handleLoading(showLoading);
  const projects = yield callApi(api.fetchProjects)
  const roles = yield callApi(api.fetchRoles);
  yield put({
    type: FETCH_ALL_PROJECTS_SUCCESS,
    projects: projects.data,
    roles: roles.data
  });
  yield done();
}



export function* fetchAllProjectDetailsSaga({ projectId, showLoading }) {
  const done = yield handleLoading(showLoading);
  const projectDetails = yield callApi(api.fetchProjectDetails, projectId)
  const history = yield callApi(api.fetchHistory, projectId);
  const roles = yield callApi(api.fetchRoles);

  yield put({
    type: FETCH_ALL_PROJECT_DETAILS_SUCCESS,
    projectDetails: projectDetails.data,
    historyItems: history.data,
    roles: roles.data
  });
  yield done();


}

export function* fetchAllSubprojectDetailsSaga({ subprojectId, showLoading }) {
  const done = yield handleLoading(showLoading);
  const workflowItems = yield callApi(api.fetchWorkflowItems, subprojectId)
  const history = yield callApi(api.fetchHistory, subprojectId);
  const roles = yield callApi(api.fetchRoles);
  yield put({
    type: FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
    workflowItems: workflowItems.data,
    historyItems: history.data,
    roles: roles.data
  });
  yield done();
}

export function* watchFetchAllSubprojectDetails() {
  yield takeEvery(FETCH_ALL_SUBPROJECT_DETAILS, fetchAllSubprojectDetailsSaga);
}

export function* watchFetchAllProjectDetails() {
  yield takeEvery(FETCH_ALL_PROJECT_DETAILS, fetchAllProjectDetailsSaga);
}
export function* watchFetchAllProjects() {
  yield takeEvery(FETCH_ALL_PROJECTS, fetchAllProjectsSaga);
}

export function* watchFetchPeers() {
  yield takeEvery(FETCH_PEERS, fetchPeersSaga)
}

export function* watchFetchProjects() {
  yield takeEvery(FETCH_PROJECTS, fetchProjectsSaga)
}

export function* watchFetchProjectDetails() {
  yield takeEvery(FETCH_PROJECT_DETAILS, fetchProjectDetailsSaga)
}

export function* watchFetchWorkflowItems() {
  yield takeEvery(FETCH_WORKFLOW_ITEMS, fetchWorkflowItemsSaga)
}

export function* watchFetchHistory() {
  yield takeEvery(FETCH_HISTORY, fetchHistorySaga)
}

export function* watchCreateSubProject() {
  yield takeEvery(CREATE_SUBPROJECT, createSubProjectSaga)
}

export function* watchCreateWorkflowItem() {
  yield takeEvery(CREATE_WORKFLOW, createWorkflowItemSaga)
}

export function* watchEditWorkflowItem() {
  yield takeEvery(EDIT_WORKFLOW, editWorkflowItemSaga)
}

export function* watchEditSubProject() {
  yield takeEvery(POST_SUBPROJECT_EDIT, editSubProjectSaga)
}

export function* watchCreateProject() {
  yield takeEvery(CREATE_PROJECT, createProject)
}

export function* watchFetchNodeInformation() {
  yield takeEvery(FETCH_NODE_INFORMATION, fetchNodeInformationSaga)
}

export function* watchFetchNotifications() {
  yield takeLatest(FETCH_NOTIFICATIONS, fetchNotificationSaga)
}
export function* watchPostWorkflowSort() {
  yield takeLatest(POST_WORKFLOW_SORT, postWorkflowSortSaga)
}
export function* watchMarkNotificationAsRead() {
  yield takeLatest(MARK_NOTIFICATION_AS_READ, markNotificationAsReadSaga)
}

export function* watchFetchUsers() {
  yield takeLatest(FETCH_USERS, fetchUsersSaga)
}

export function* watchFetchRoles() {
  yield takeLatest(FETCH_ROLES, fetchRolesSaga)
}

export function* watchLogin() {
  yield takeLatest(LOGIN, loginSaga)
}

export function* watchAdminLogin() {
  yield takeLatest(ADMIN_LOGIN, adminLoginSaga)
}

export function* watchFetchUser() {
  yield takeEvery(FETCH_USER, fetchUserWithJwtSaga)
}

export function* watchAddUser() {
  yield takeEvery(ADD_USER, addUserSaga)
}

export function* watchAddRole() {
  yield takeEvery(ADD_ROLE, addRoleSaga)
}

export function* watchLogout() {
  yield takeEvery(LOGOUT, logoutSaga);
}

export function* watchAdminLogout() {
  yield takeLatest(ADMIN_LOGOUT, adminLogoutSaga);
}

export function* watchFetchStreamNames() {
  yield takeLatest(FETCH_STREAM_NAMES, fetchStreamNamesSaga)
}

export function* watchValidateDocument() {
  yield takeLatest(VALIDATE_DOCUMENT, validateDocumentSaga)
}

export function* watchAddDocument() {
  yield takeLatest(ADD_DOCUMENT, addDocumentSaga)
}
export function* watchSetEnvironment() {
  yield takeLatest(STORE_ENVIRONMENT, setEnvironmentSaga)
}

export function* watchGetEnvironment() {
  yield takeLatest(FETCH_ENVIRONMENT, getEnvironmentSaga)
}

export function* watchFetchUpdates() {
  yield takeLatest(FETCH_UPDATES, fetchUpdatesSaga)
}

export function* watchFetchNodePermissions() {
  yield takeLatest(FETCH_NODE_PERMISSIONS, fetchNodePermissionsSaga)
}




export default function* rootSaga() {
  try {
    yield [
      watchFetchPeers(),
      watchFetchProjects(),
      watchFetchProjectDetails(),
      watchCreateSubProject(),
      watchCreateWorkflowItem(),
      watchEditWorkflowItem(),
      watchCreateProject(),
      watchFetchNodeInformation(),
      watchFetchNotifications(),
      watchMarkNotificationAsRead(),
      watchFetchWorkflowItems(),
      watchFetchUsers(),
      watchFetchRoles(),
      watchLogin(),
      watchAdminLogin(),
      watchFetchUser(),
      watchLogout(),
      watchAdminLogout(),
      watchFetchStreamNames(),
      watchFetchHistory(),
      watchPostWorkflowSort(),
      watchEditSubProject(),
      watchValidateDocument(),
      watchAddDocument(),
      watchSetEnvironment(),
      watchGetEnvironment(),
      watchFetchUpdates(),
      watchFetchNodePermissions(),
      watchAddUser(),
      watchAddRole(),
      watchFetchAllProjects(),
      watchFetchAllProjectDetails(),
      watchFetchAllSubprojectDetails(),
    ]
  } catch (error) {
    console.log(error);
  }
}
