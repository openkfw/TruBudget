import { fromJS } from 'immutable';
import { FETCH_USERS_SUCCESS, FETCH_ROLES_SUCCESS, LOGIN_SUCCESS, LOGOUT } from './actions';

const defaultState = fromJS({
  users: [],
  loggedInUser: {},
  roles: []
});


export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_USERS_SUCCESS:
      return state.set('users', action.users);
    case FETCH_ROLES_SUCCESS:
      return state.set('roles', action.roles);
    case LOGIN_SUCCESS:
      return state.set('loggedInUser', action.user);
    case LOGOUT:
      return state.set('loggedInUser', defaultState.get('loggedInUser'));
    default:
      return state
  }
}
