import { fromJS } from 'immutable';

import { TOGGLE_SIDEBAR } from './actions';

const defaultState =  fromJS({
  showSidebar: false,
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return state.set('showSidebar', !state.get('showSidebar'));
    default:
      return state
  }
}