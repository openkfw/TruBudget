import { fromJS } from 'immutable';
import { FETCH_ALL_PROJECTS_SUCCESS } from '../Overview/actions';
import { HIDE_LOADING_INDICATOR, SHOW_LOADING_INDICATOR, RESET_LOADING_INDICATOR } from './actions';
import { LOGOUT } from '../Login/actions';
import { FETCH_ALL_PROJECT_DETAILS, FETCH_ALL_PROJECT_DETAILS_SUCCESS } from '../SubProjects/actions';


const defaultState = fromJS({
  loadingVisible: false,
  loadingID: 0,
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case SHOW_LOADING_INDICATOR:
      return state.merge({ 'loadingVisible': true, loadingID: action.ts });
    case HIDE_LOADING_INDICATOR:
      if (state.get('loadingID') === action.ts) {
        return state.merge({ 'loadingVisible': defaultState.get('loadingVisible'), loadingID: defaultState.get('loadingID') });
      }
    case RESET_LOADING_INDICATOR:
      return state.merge({ 'loadingID': 0, loadingVisible: false })
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
