import { put, takeEvery } from 'redux-saga/effects'
import { fetchPeers, fetchStreams } from './api.js';

import { FETCH_PEERS, FETCH_PEERS_SUCCESS } from './pages/Navbar/actions';
import { FETCH_STREAMS, FETCH_STREAMS_SUCCESS } from './pages/Overview/actions';

export function* fetchPeersSaga(action) {
  const peers = yield fetchPeers();
  yield put({
    type: FETCH_PEERS_SUCCESS,
    peers: peers.data
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

export default function* rootSaga() {
  yield [
    watchFetchPeers(),
    watchFetchStreams()
  ]
}