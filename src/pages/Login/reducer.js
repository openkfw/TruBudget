import { fromJS } from 'immutable';
import moment from 'moment';
import * as localeFR from 'moment/locale/fr';
import * as localeEN from 'moment/locale/en-gb';
import strings from '../../localizeStrings';


import { FETCH_USERS_SUCCESS, FETCH_ROLES_SUCCESS, LOGIN_SUCCESS, LOGOUT, STORE_USERNAME, STORE_PASSWORD, SHOW_LOGIN_ERROR, STORE_ENVIRONMENT_SUCCESS, SET_LANGUAGE } from './actions';

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
  productionActive: false,
  loginErrorMessage: '',
  showLoginError: false,
  roles: [],
  language: 'en-gb'
});

const setLanguage = (state) => {
  moment.locale(state.get('language'));
  strings.setLanguage(state.get('language'));
}

setLanguage(defaultState)


export default function loginReducer (state = defaultState, action) {
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
      return state.merge({ environment: action.environment, productionActive: action.productionActive })
    case SET_LANGUAGE:
      const newState = state.set('language', action.language);
      setLanguage(newState);
      return newState;
    case LOGOUT:
      const newDefaultState = defaultState.set('language', state.get('language'))
      return newDefaultState;
    default:
      return state
  }
}
