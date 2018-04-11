import { Map, fromJS } from 'immutable';

import { defaultState as loginState } from './pages/Login/reducer';
import { actionInitialState as actionState } from './reducers';

import { FETCH_USER_SUCCESS, LOGOUT_SUCCESS, ADMIN_LOGOUT_SUCCESS, FETCH_ADMIN_USER_SUCCESS, LOGIN_SUCCESS, STORE_ENVIRONMENT_SUCCESS, SET_LANGUAGE } from './pages/Login/actions';

const STORAGE_KEY = 'state';

const parseActions = (state) => state.getIn(['actions', 'lastAction'])

const parseFromState = (state) => ({
  login: {
    jwt: state.getIn(['login', 'jwt']),
    environment: state.getIn(['login', 'environment']),
    productionActive: state.getIn(['login', 'productionActive']),
    language: state.getIn(['login', 'language']),
    id: state.getIn(['login', 'id']),
    displayName: state.getIn(['login', 'displayName']),
    organization: state.getIn(['login', 'organization']),
    allowedIntents: state.getIn(['login', 'allowedIntents']).toJS(),
  }
})

const defaultPersistedState = Map({
  login: loginState,
  actions: actionState
});


export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    return serializedState !== null ? defaultPersistedState.mergeDeep(fromJS(JSON.parse(serializedState))) : defaultPersistedState
  } catch (error) {
    return defaultPersistedState;
  }
}

const setStorage = (state) => {
  console.log(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const persistState = (state) => {
  const action = parseActions(state);
  try {
    switch (action) {
      case LOGIN_SUCCESS:
      case STORE_ENVIRONMENT_SUCCESS:
      case SET_LANGUAGE:
      case LOGOUT_SUCCESS:
      case ADMIN_LOGOUT_SUCCESS:
        const stateToPersist = parseFromState(state);
        setStorage(stateToPersist)
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error)
    console.log('failed to persist state')
  }
}
