import { fromJS } from 'immutable';
import { FETCH_NODE_PERMISSIONS_SUCCESS, SHOW_ROLES_DIALOG, HIDE_ROLES_DIALOG } from './actions';

const defaultState = fromJS({
  connectedToAdminNode: false,
  rolesDialogShown: false,
});


export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NODE_PERMISSIONS_SUCCESS:
      return state.set('connectedToAdminNode', fromJS(action.admin));
    case SHOW_ROLES_DIALOG:
      return state.set('rolesDialogShown', true);
    case HIDE_ROLES_DIALOG:
      return state.set('rolesDialogShown', false);
    default:
      return state
  }
}
