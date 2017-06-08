import { put, takeEvery, takeLatest } from 'redux-saga/effects'

import {
  fetchPeers,
  fetchProjects,
  fetchProjectDetails,
  postSubProject,
  postProject,
  fetchNodeInformation,
  fetchNotifications,
  markNotificationAsRead,
  fetchWorkflowItems,
  postWorkflowItem,
  editWorkflowItem,
  fetchUsers,
  fetchRoles,
  login,
  fetchStreamNames,
  fetchHistory,
  postWorkflowSort,
  editSubProject,
  validateDocument,
  hashDocument

} from './api.js';

import { FETCH_PEERS, FETCH_PEERS_SUCCESS, FETCH_STREAM_NAMES, FETCH_STREAM_NAMES_SUCCESS } from './pages/Navbar/actions';
import { FETCH_PROJECTS, FETCH_PROJECTS_SUCCESS, CREATE_PROJECT, CREATE_PROJECT_SUCCESS } from './pages/Overview/actions';
import { FETCH_PROJECT_DETAILS, FETCH_PROJECT_DETAILS_SUCCESS, CREATE_SUBPROJECT_ITEM, CREATE_SUBPROJECT_ITEM_SUCCESS } from './pages/SubProjects/actions';
import { FETCH_NODE_INFORMATION, FETCH_NODE_INFORMATION_SUCCESS } from './pages/Dashboard/actions';
import { FETCH_NOTIFICATIONS, FETCH_NOTIFICATIONS_SUCCESS, MARK_NOTIFICATION_AS_READ, MARK_NOTIFICATION_AS_READ_SUCCESS, SHOW_SNACKBAR, SNACKBAR_MESSAGE } from './pages/Notifications/actions';
import { FETCH_WORKFLOW_ITEMS, FETCH_WORKFLOW_ITEMS_SUCCESS, CREATE_WORKFLOW, EDIT_WORKFLOW, CREATE_WORKFLOW_SUCCESS, EDIT_WORKFLOW_SUCCESS, FETCH_HISTORY_SUCCESS, FETCH_HISTORY, POST_WORKFLOW_SORT, POST_WORKFLOW_SORT_SUCCESS, ENABLE_WORKFLOW_SORT, POST_SUBPROJECT_EDIT, POST_SUBPROJECT_EDIT_SUCCESS } from './pages/Workflows/actions';

import { FETCH_USERS, FETCH_USERS_SUCCESS, FETCH_ROLES, FETCH_ROLES_SUCCESS, LOGIN, LOGIN_SUCCESS } from './pages/Login/actions';
import { VALIDATE_DOCUMENT, VALIDATE_DOCUMENT_SUCCESS, ADD_DOCUMENT, ADD_DOCUMENT_SUCCESS } from './pages/Documents/actions';

function* handleError(error) {
  if (error.response) {
    yield put({ type: SNACKBAR_MESSAGE, message: error.response.data })
    yield put({ type: SHOW_SNACKBAR, show: true, isError: true })
  } else {
    yield put({ type: SNACKBAR_MESSAGE, message: "Disconnected!" })
    yield put({ type: SHOW_SNACKBAR, show: true, isError: true })
  }
}

export function* fetchPeersSaga(action) {
  try {
    const peers = yield fetchPeers();
    yield put({ type: FETCH_PEERS_SUCCESS, peers: peers.data });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchProjectDetailsSaga(action) {
  try {
    const projectDetails = yield fetchProjectDetails(action.project);
    yield put({ type: FETCH_PROJECT_DETAILS_SUCCESS, projectDetails: projectDetails.data });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchProjectsSaga() {
  try {
    const projects = yield fetchProjects();
    yield put({ type: FETCH_PROJECTS_SUCCESS, projects: projects.data });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchWorkflowItemsSaga(action) {
  try {
    const workflowItems = yield fetchWorkflowItems(action.streamName);
    yield put({ type: FETCH_WORKFLOW_ITEMS_SUCCESS, workflowItems: workflowItems.data })
  } catch (error) {
    yield handleError(error);
  }
}

export function* createProject(action) {
  try {
    yield postProject(action.name, action.amount, action.purpose, action.currency, action.approver, action.assignee, action.bank);
    yield put({ type: CREATE_PROJECT_SUCCESS });
    yield put({ type: FETCH_PROJECTS });
  } catch (error) {
    yield handleError(error);
  }
}
export function* createSubProjectSaga(action) {
  try {
    yield postSubProject(action.parentName, action.subProjectName, action.subProjectAmount, action.subProjectPurpose, action.subProjectCurrency);
    yield put({ type: CREATE_SUBPROJECT_ITEM_SUCCESS });
    yield put({ type: FETCH_PROJECT_DETAILS, project: action.parentName });
  } catch (error) {
    yield handleError(error);
  }
}

export function* createWorkflowItemSaga(action) {
  try {
    yield postWorkflowItem(action.stream, action.workflowName, action.amount, action.currency, action.purpose, action.documents, action.state, action.assignee, action.workflowType);
    yield put({ type: CREATE_WORKFLOW_SUCCESS });
    yield put({ type: FETCH_WORKFLOW_ITEMS, streamName: action.stream });
  } catch (error) {
    yield handleError(error);
  }
}

export function* editWorkflowItemSaga(action) {
  try {
    yield editWorkflowItem(action.stream, action.key, action.workflowName, action.amount, action.currency, action.purpose, action.documents, action.state, action.assignee, action.txid, action.previousState, action.workflowType);
    yield put({ type: EDIT_WORKFLOW_SUCCESS });
    yield put({ type: FETCH_WORKFLOW_ITEMS, streamName: action.stream });
  } catch (error) {
    yield handleError(error);
  }
}

export function* editSubProjectSaga(action) {
  try {
    yield editSubProject(action.parent, action.streamName, action.status, action.amount);
    yield put({ type: POST_SUBPROJECT_EDIT_SUCCESS });
    yield put({ type: FETCH_WORKFLOW_ITEMS, streamName: action.streamName });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchNodeInformationSaga() {
  try {
    const nodeInformation = yield fetchNodeInformation()
    yield put({ type: FETCH_NODE_INFORMATION_SUCCESS, nodeInformation: nodeInformation.data });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchNotificationSaga({ user }) {
  try {
    const notifications = yield fetchNotifications(user)
    yield put({ type: FETCH_NOTIFICATIONS_SUCCESS, notifications: notifications.data })
  } catch (error) {
    yield handleError(error);
  }
}

export function* postWorkflowSortSaga({ streamName, order, sortEnabled }) {
  try {
    yield postWorkflowSort(streamName, order);
    yield put({ type: POST_WORKFLOW_SORT_SUCCESS });
    yield put({ type: FETCH_WORKFLOW_ITEMS, streamName });
    yield put({ type: ENABLE_WORKFLOW_SORT, sortEnabled });
  } catch (error) {
    yield handleError(error);
  }
}

export function* markNotificationAsReadSaga({ user, id, data }) {
  try {
    yield markNotificationAsRead(user, id, data);
    yield put({ type: MARK_NOTIFICATION_AS_READ_SUCCESS });
    yield put({ type: FETCH_NOTIFICATIONS, user });
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchUsersSaga() {
  try {
    const users = yield fetchUsers();
    yield put({ type: FETCH_USERS_SUCCESS, users: users.data })
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchRolesSaga() {
  try {
    const roles = yield fetchRoles();
    yield put({ type: FETCH_ROLES_SUCCESS, roles: roles.data })
  } catch (error) {
    yield handleError(error);
  }
}

export function* loginSaga({ user }) {
  try {
    yield login(user.username, user.password);
    yield put({ type: LOGIN_SUCCESS, user })
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchStreamNamesSaga() {
  try {
    const streamNames = yield fetchStreamNames();
    yield put({ type: FETCH_STREAM_NAMES_SUCCESS, streamNames: streamNames.data })
  } catch (error) {
    yield handleError(error);
  }
}

export function* fetchHistorySaga({ project }) {
  try {
    const history = yield fetchHistory(project);
    yield put({ type: FETCH_HISTORY_SUCCESS, historyItems: history.data })
  } catch (error) {
    yield handleError(error);
  }
}

export function* validateDocumentSaga({ payload, hash }) {
  try {
    const response = yield validateDocument(payload, hash);
    yield put({ type: VALIDATE_DOCUMENT_SUCCESS, validates: response.data.validates, hash })
  } catch (error) {
    yield handleError(error);
  }
}

export function* addDocumentSaga({ id, payload }) {
  try {
    const hash = yield hashDocument(payload);
    yield put({ type: ADD_DOCUMENT_SUCCESS, hash: hash.data, id })
  } catch (error) {
    yield handleError(error);
  }
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
  yield takeEvery(CREATE_SUBPROJECT_ITEM, createSubProjectSaga)
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

export function* watchFetchStreamNames() {
  yield takeLatest(FETCH_STREAM_NAMES, fetchStreamNamesSaga)
}

export function* watchValidateDocument() {
  yield takeLatest(VALIDATE_DOCUMENT, validateDocumentSaga)
}

export function* watchAddDocument() {
  yield takeLatest(ADD_DOCUMENT, addDocumentSaga)
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
      watchFetchStreamNames(),
      watchFetchHistory(),
      watchPostWorkflowSort(),
      watchEditSubProject(),
      watchValidateDocument(),
      watchAddDocument()
    ]
  } catch (error) {
    console.log(error);
  }
}
