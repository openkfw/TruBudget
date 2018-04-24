import { fromJS } from 'immutable';
import { SHOW_SNACKBAR, SNACKBAR_MESSAGE, FETCH_NOTIFICATIONS_SUCCESS, FETCH_HISTORY_SUCCESS, OPEN_HISTORY } from './actions';
import { LOGOUT } from '../Login/actions';
import { FETCH_UPDATES_SUCCESS } from '../LiveUpdates/actions';
import { FETCH_ALL_PROJECT_DETAILS_SUCCESS } from '../SubProjects/actions';
import { FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS } from '../Workflows/actions';

const defaultState = fromJS({
  list: [],
  showHistory: false,
  showSnackBar: false,
  snackBarMessage: 'New Project added',
  snackBarMessageIsError: false,
  historyItems: []
});


export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_UPDATES_SUCCESS:
    case FETCH_NOTIFICATIONS_SUCCESS:
      return state.set('list', fromJS(action.notifications));
    case SHOW_SNACKBAR:
      return state.merge({
        showSnackBar: action.show,
        snackBarMessageIsError: action.isError
      });
    case SNACKBAR_MESSAGE:
      return state.set('snackBarMessage', action.message)
    case FETCH_HISTORY_SUCCESS:
      return state.set('historyItems', fromJS(action.historyItems));
    case OPEN_HISTORY:
      return state.set('showHistory', action.show);
    case LOGOUT:
      return defaultState
    default:
      return state
  }
}
