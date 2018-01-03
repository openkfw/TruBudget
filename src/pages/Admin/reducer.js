import { fromJS } from 'immutable';
import { FETCH_NODE_PERMISSIONS_SUCCESS } from './actions';

const defaultState = fromJS({
    connectedToAdminNode: false,
});


export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NODE_PERMISSIONS_SUCCESS:
      return state.set('connectedToAdminNode', fromJS(action.admin));
    default:
      return state
  }
}
