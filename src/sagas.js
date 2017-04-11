import { put, takeEvery } from 'redux-saga/effects'
import { fetchPeers, fetchStreams, fetchStreamItems } from './api.js';

import { FETCH_PEERS, FETCH_PEERS_SUCCESS } from './pages/Navbar/actions';
import { FETCH_STREAMS, FETCH_STREAMS_SUCCESS } from './pages/Overview/actions';
import { FETCH_STREAM_ITEMS, FETCH_STREAM_ITEMS_SUCCESS } from './pages/Detailview/WorkflowList/actions';


export function* fetchPeersSaga(action) {
  const peers = yield fetchPeers();
  yield put({
    type: FETCH_PEERS_SUCCESS,
    peers: peers.data
  });
}

export function* fetchStreamItemsSaga(action) {
  const streamItems = yield fetchStreamItems(action.pathName);

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

export function* watchFetchPeers() {
  yield takeEvery(FETCH_PEERS, fetchPeersSaga)
}

export function* watchFetchStreams() {
  yield takeEvery(FETCH_STREAMS, fetchStreamsSaga)
}

export function* watchFetchStreamItems() {
  yield takeEvery(FETCH_STREAM_ITEMS, fetchStreamItemsSaga)
}


export default function* rootSaga() {
  yield [
    watchFetchPeers(),
    watchFetchStreams(),
    watchFetchStreamItems()
  ]
}
