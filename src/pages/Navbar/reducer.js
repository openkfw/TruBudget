import { fromJS } from 'immutable';

import { TOGGLE_SIDEBAR, FETCH_PEERS_SUCCESS } from './actions';

const defaultState =  fromJS({
  showSidebar: false,
  peers: []
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return state.set('showSidebar', !state.get('showSidebar'));
    case FETCH_PEERS_SUCCESS:
      return state.set('peers', action.peers);
    default:
      return state
  }
}