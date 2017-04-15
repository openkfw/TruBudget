import { fromJS } from 'immutable';

import {  SUBPROJECT_NAME } from './actions';

const defaultState =  fromJS({
  streamName: ''
});

export default function creationReducer(state = defaultState, action) {
  switch (action.type) {
    case SUBPROJECT_NAME:
      return state.set('streamName', action.name);
    default:
      return state
  }
}
