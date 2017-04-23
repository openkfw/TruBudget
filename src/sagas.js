import {put, takeEvery, takeLatest} from 'redux-saga/effects'

import {
  fetchPeers,
  fetchProjects,
  fetchProjectDetails,
  postSubProject,
  postProject,
  fetchNodeInformation,
  fetchNotifications,
  fetchWorkflowItems,
  postWorkflowItem,
  editWorkflowItem,
  fetchUsers,
  login
} from './api.js';

import {FETCH_PEERS, FETCH_PEERS_SUCCESS} from './pages/Navbar/actions';
import {FETCH_PROJECTS, FETCH_PROJECTS_SUCCESS, CREATE_PROJECT} from './pages/Overview/actions';
import {FETCH_PROJECT_DETAILS, FETCH_PROJECT_DETAILS_SUCCESS, CREATE_SUBPROJECT_ITEM} from './pages/ProjectDetails/SubProjects/actions';
import {FETCH_NODE_INFORMATION, FETCH_NODE_INFORMATION_SUCCESS} from './pages/Dashboard/actions';
import {FETCH_NOTIFICATIONS, FETCH_NOTIFICATIONS_SUCCESS} from './pages/Notifications/actions';
import {FETCH_WORKFLOW_ITEMS, FETCH_WORKFLOW_ITEMS_SUCCESS, CREATE_WORKFLOW, EDIT_WORKFLOW} from './pages/WorkflowDetailsContainer/Workflow/actions';
import {FETCH_USERS, FETCH_USERS_SUCCESS, LOGIN, LOGIN_SUCCESS} from './pages/Login/actions';

export function * fetchPeersSaga(action) {
  const peers = yield fetchPeers();
  yield put({type: FETCH_PEERS_SUCCESS, peers: peers.data});
}

export function * fetchProjectDetailsSaga(action) {
  const projectDetails = yield fetchProjectDetails(action.project);

  yield put({type: FETCH_PROJECT_DETAILS_SUCCESS, projectDetails: projectDetails.data});
}

export function * fetchProjectsSaga(action) {
  const projects = yield fetchProjects();
  yield put({type: FETCH_PROJECTS_SUCCESS, projects: projects.data});
}

export function * fetchWorkflowItemsSaga(action) {
  const workflowItems = yield fetchWorkflowItems(action.streamName);
  yield put({type: FETCH_WORKFLOW_ITEMS_SUCCESS, workflowItems: workflowItems.data})
}

export function * createProject(action) {
  yield postProject(action.name, action.amount, action.purpose, action.currency);
  const projects = yield fetchProjects();
  yield put({type: FETCH_PROJECTS_SUCCESS, projects: projects.data});

}
export function * createSubProjectSaga(action) {
  yield postSubProject(action.parentName, action.subProjectName, action.subProjectAmount, action.subProjectPurpose, action.subProjectCurrency);
  const projectDetails = yield fetchProjectDetails(action.parentName);

  yield put({type: FETCH_PROJECT_DETAILS_SUCCESS, projectDetails: projectDetails.data});
}

export function * createWorkflowItemSaga(action) {
  yield postWorkflowItem(action.stream, action.workflowName, action.amount, action.currency, action.purpose, action.addData, action.state, action.assignee);
  const workflowItems = yield fetchWorkflowItems(action.stream);
  yield put({type: FETCH_WORKFLOW_ITEMS_SUCCESS, workflowItems: workflowItems.data})
}

export function * editWorkflowItemSaga(action) {
  yield editWorkflowItem(action.stream, action.workflowName, action.amount, action.currency, action.purpose, action.addData, action.state, action.assignee, action.txid);
  const workflowItems = yield fetchWorkflowItems(action.stream);
  yield put({type: FETCH_WORKFLOW_ITEMS_SUCCESS, workflowItems: workflowItems.data})
}

export function * fetchNodeInformationSaga() {
  const nodeInformation = yield fetchNodeInformation()
  yield put({type: FETCH_NODE_INFORMATION_SUCCESS, nodeInformation: nodeInformation.data});
}

export function * fetchNotificationSaga({user}) {
  const notifications = yield fetchNotifications(user)
  yield put({type: FETCH_NOTIFICATIONS_SUCCESS, notifications: notifications.data})
}

export function * fetchUsersSaga() {
  const users = yield fetchUsers();
  yield put({type: FETCH_USERS_SUCCESS, users: users.data})
}

export function * loginSaga({user}) {
  yield login(user.username, user.password);
  yield put({type: LOGIN_SUCCESS, user})
}

export function * watchFetchPeers() {
  yield takeEvery(FETCH_PEERS, fetchPeersSaga)
}

export function * watchFetchProjects() {
  yield takeEvery(FETCH_PROJECTS, fetchProjectsSaga)
}

export function * watchFetchProjectDetails() {
  yield takeEvery(FETCH_PROJECT_DETAILS, fetchProjectDetailsSaga)
}

export function * watchFetchWorkflowItems() {
  yield takeEvery(FETCH_WORKFLOW_ITEMS, fetchWorkflowItemsSaga)
}

export function * watchCreateSubProject() {
  yield takeEvery(CREATE_SUBPROJECT_ITEM, createSubProjectSaga)
}

export function * watchCreateWorkflowItem() {
  yield takeEvery(CREATE_WORKFLOW, createWorkflowItemSaga)
}

export function * watchEditWorkflowItem() {
  yield takeEvery(EDIT_WORKFLOW, editWorkflowItemSaga)
}

export function * watchCreateProject() {
  yield takeEvery(CREATE_PROJECT, createProject)
}

export function * watchFetchNodeInformation() {
  yield takeEvery(FETCH_NODE_INFORMATION, fetchNodeInformationSaga)
}

export function * watchFetchNotifications() {
  yield takeLatest(FETCH_NOTIFICATIONS, fetchNotificationSaga)
}

export function * watchFetchUsers() {
  yield takeLatest(FETCH_USERS, fetchUsersSaga)
}

export function * watchLogin() {
  yield takeLatest(LOGIN, loginSaga)
}

export default function * rootSaga() {
  yield[
    watchFetchPeers(),
    watchFetchProjects(),
    watchFetchProjectDetails(),
    watchCreateSubProject(),
    watchCreateWorkflowItem(),
    watchEditWorkflowItem(),
    watchCreateProject(),
    watchFetchNodeInformation(),
    watchFetchNotifications(),
    watchFetchWorkflowItems(),
    watchFetchUsers(),
    watchLogin()]
}
