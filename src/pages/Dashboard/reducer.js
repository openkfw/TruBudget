import { fromJS } from 'immutable';

import { FETCH_NODE_INFORMATION_SUCCESS } from './actions';

const defaultState =  fromJS({
  nodeInformation: {}
});

export default function dashboardReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NODE_INFORMATION_SUCCESS:
      console.log(action.nodeInformation)
      return state.set('nodeInformation', action.nodeInformation);
    default:
      return state
  }
}
