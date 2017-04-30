import { fromJS } from 'immutable';
import { SHOW_SNACKBAR, SNACKBAR_MESSAGE, FETCH_NOTIFICATIONS_SUCCESS } from './actions';
import { LOGOUT } from '../Login/actions';

const defaultState = fromJS({
  list: [],
  showSnackBar: false,
  snackBarMessage:'New Project added'
});


export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_SUCCESS:
      return state.set('list', action.notifications);
    case SHOW_SNACKBAR:
      return state.set('showSnackBar', action.show);
    case SNACKBAR_MESSAGE:
      return state.set('snackBarMessage', action.message)
    case LOGOUT:
      return defaultState
    default:
      return state
  }
}
