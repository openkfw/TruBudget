import { fromJS } from 'immutable';

import { TOGGLE_SIDEBAR, FETCH_PEERS_SUCCESS, FETCH_STREAM_NAMES_SUCCESS, SET_SELECTED_VIEW } from './actions';
import { FETCH_NOTIFICATIONS_SUCCESS } from '../Notifications/actions';
import { FETCH_UPDATES_SUCCESS } from '../LiveUpdates/actions';
import { LOGOUT } from '../Login/actions';

const defaultState = fromJS({
  showSidebar: false,
  peers: [],
  unreadNotifications: 0,
  streamNames: {},
  selectedId: '',
  selectedSection: '',
});

const countUnreadNotifications = (notifications) => notifications.reduce((acc, { data }) => {
  return data.done === false ? acc + 1 : acc;
}, 0);

export default function navbarReducer (state = defaultState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return state.set('showSidebar', !state.get('showSidebar'));
    case FETCH_PEERS_SUCCESS:
      return state.set('peers', action.peers);
    case FETCH_NOTIFICATIONS_SUCCESS:
      return state.set('unreadNotifications', countUnreadNotifications(action.notifications));
    case FETCH_STREAM_NAMES_SUCCESS:
      return state.set('streamNames', fromJS(action.streamNames));
    case SET_SELECTED_VIEW:
      return state.merge({
        selectedId: action.id,
        selectedSection: action.section,
      });
    case FETCH_UPDATES_SUCCESS:
      return state.merge({
        peers: action.peers,
        unreadNotifications: countUnreadNotifications(action.notifications),
        streamNames: action.streamNames
      })
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
