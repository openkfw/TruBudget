import { fromJS } from 'immutable';
import { FETCH_USERS_SUCCESS, FETCH_ROLES_SUCCESS, LOGIN_SUCCESS, LOGOUT, STORE_USERNAME, STORE_PASSWORD, SHOW_LOGIN_ERROR, STORE_ENVIRONMENT_SUCCESS } from './actions';

const defaultState = fromJS({
  users: [],
  username: '',
  password: '',
  loggedInUser: {
    role: {
      roleName: '',
      read: false,
      write: false,
      admin: false,
    }
  },
  environment: 'Test',
  loginErrorMessage: '',
  showLoginError: false,
  roles: []
});


export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_USERS_SUCCESS:
      return state.set('users', fromJS(action.users));
    case FETCH_ROLES_SUCCESS:
      return state.set('roles', action.roles);
    case STORE_USERNAME:
      return state.set('username', action.username);
    case STORE_PASSWORD:
      return state.set('password', action.password);
    case LOGIN_SUCCESS:
      return state.set('loggedInUser', action.user);
    case SHOW_LOGIN_ERROR:
      return state.set('loginUnsuccessful', action.show);
    case STORE_ENVIRONMENT_SUCCESS:
      return state.set('environment', action.environment);
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
