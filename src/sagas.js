import { put, takeEvery, takeLatest } from 'redux-saga/effects'
import { fetchPeers, fetchStreams, fetchStreamItems, postSubProject, postProject, fetchNodeInformation, fetchNotifications } from './api.js';

import { FETCH_PEERS, FETCH_PEERS_SUCCESS } from './pages/Navbar/actions';
import { FETCH_STREAMS, FETCH_STREAMS_SUCCESS, CREATE_PROJECT } from './pages/Overview/actions';
import { FETCH_STREAM_ITEMS, FETCH_STREAM_ITEMS_SUCCESS, CREATE_SUBPROJECT_ITEM } from './pages/ProjectDetails/SubProjects/actions';
import { FETCH_NODE_INFORMATION, FETCH_NODE_INFORMATION_SUCCESS } from './pages/Dashboard/actions';
import { FETCH_NOTIFICATIONS, FETCH_NOTIFICATIONS_SUCCESS } from './pages/Notifications/actions';

export function* fetchPeersSaga(action) {
  const peers = yield fetchPeers();
  yield put({
    type: FETCH_PEERS_SUCCESS,
    peers: peers.data
  });
}

export function* fetchStreamItemsSaga(action) {
  const streamItems = yield fetchStreamItems(action.streamName);

  yield put({
    type: FETCH_STREAM_ITEMS_SUCCESS,
    streamItems: streamItems.data
  });
}

export function* fetchStreamsSaga(action) {
  const streams = yield fetchStreams();
  yield put({
    type: FETCH_STREAMS_SUCCESS,
    streams: streams.data
  });
}

export function* createProject(action) {
  console.log('Action Amount' + action.amount);
  yield postProject(action.name, action.parent, action.amount, action.purpose);
  const streams = yield fetchStreams();
  yield put({
    type: FETCH_STREAMS_SUCCESS,
    streams: streams.data
  });

}
export function* createSubProjectSaga(action) {
  yield postSubProject(action.parentName, action.subProjectName, action.subProjectAmount, action.subProjectPurpose);
  const streamItems = yield fetchStreamItems(action.parentName);

  yield put({
    type: FETCH_STREAM_ITEMS_SUCCESS,
    streamItems: streamItems.data
  });
}

export function* fetchNodeInformationSaga() {
  const nodeInformation = yield fetchNodeInformation()
  yield put({
    type: FETCH_NODE_INFORMATION_SUCCESS,
    nodeInformation: nodeInformation.data
  });
}

export function* fetchNotificationSaga({user}) {
  const notifications = yield fetchNotifications(user)
  yield put({
    type: FETCH_NOTIFICATIONS_SUCCESS,
    notifications: notifications.data
  })
}

export function* watchFetchPeers() {
  yield takeEvery(FETCH_PEERS, fetchPeersSaga)
}

export function* watchFetchStreams() {
  yield takeEvery(FETCH_STREAMS, fetchStreamsSaga)
}

export function* watchFetchStreamItems() {
  yield takeEvery(FETCH_STREAM_ITEMS, fetchStreamItemsSaga)
}

export function* watchCreateSubProject() {
  yield takeEvery(CREATE_SUBPROJECT_ITEM, createSubProjectSaga)
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

export default function* rootSaga() {
  yield [
    watchFetchPeers(),
    watchFetchStreams(),
    watchFetchStreamItems(),
    watchCreateSubProject(),
    watchCreateProject(),
    watchFetchNodeInformation(),
    watchFetchNotifications(),
  ]
}
