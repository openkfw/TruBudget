import { fromJS } from 'immutable';

import { FETCH_STREAMS_SUCCESS } from './actions';

const defaultState =  fromJS({
  streams: []
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_STREAMS_SUCCESS:
      return state.set('streams', action.streams);
    default:
      return state
  }
}