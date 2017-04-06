export const FETCH_STREAMS = 'FETCH_STREAMS';
export const FETCH_STREAMS_SUCCESS = 'FETCH_STREAMS_SUCCESS';

export function fetchStreams() {
  return {
    type: FETCH_STREAMS,
  }
}