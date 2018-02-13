import { fromJS, Map } from 'immutable';

import { FETCH_NODE_INFORMATION_SUCCESS } from './actions';

const defaultState = fromJS({
  nodeInformation: Map()
});

export default function dashboardReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NODE_INFORMATION_SUCCESS:
      return state.update('nodeInformation', nodes => nodes.merge(action.nodeInformation));

    default:
      return state
  }
}
