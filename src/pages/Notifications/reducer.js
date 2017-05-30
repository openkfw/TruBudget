import { fromJS } from 'immutable';
import { SHOW_SNACKBAR, SNACKBAR_MESSAGE, FETCH_NOTIFICATIONS_SUCCESS, FETCH_HISTORY_SUCCESS, OPEN_HISTORY } from './actions';
import { LOGOUT } from '../Login/actions';

const defaultState = fromJS({
  list: [],
  showSnackBar: false,
  snackBarMessage: 'New Project added',
  snackBarMessageIsError: false
});


export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_SUCCESS:
      return state.set('list', action.notifications);
    case SHOW_SNACKBAR:
      return state.merge({
        showSnackBar: action.show,
        snackBarMessageIsError: action.isError
      });
    case SNACKBAR_MESSAGE:
      return state.set('snackBarMessage', action.message)
    case FETCH_HISTORY_SUCCESS:
      return state.set('historyItems', action.historyItems);
    case OPEN_HISTORY:
      return state.set('showHistory', action.show);
    case LOGOUT:
      return defaultState
    default:
      return state
  }
}
