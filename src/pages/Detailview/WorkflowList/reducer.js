import { fromJS } from 'immutable';

import { FETCH_STREAM_ITEMS_SUCCESS } from './actions';

const defaultState =  fromJS({
  streamItems: []
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_STREAM_ITEMS_SUCCESS:
      return state.set('streamItems', action.streamItems);
    default:
      return state
  }
}
