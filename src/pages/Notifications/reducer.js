import { fromJS } from 'immutable';

import { FETCH_NOTIFICATIONS_SUCCESS } from './actions';

const defaultState = fromJS({
  list: []
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_SUCCESS:
      return state.set('list', action.notifications);
    default:
      return state
  }
}
