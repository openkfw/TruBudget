import { Map } from 'immutable';

import { defaultState as loginState } from './pages/Login/reducer';
import { actionInitialState as actionState } from './reducers';

import { FETCH_USER_SUCCESS, LOGOUT_SUCCESS, ADMIN_LOGOUT_SUCCESS } from './pages/Login/actions';

const STORAGE_KEY = 'state';

const parseFromState = (state) => ({
  loggedInUser: state.getIn(['login', 'loggedInUser']).toJS(),
  jwt: state.getIn(['login', 'jwt']),
  lastAction: state.getIn(['actions', 'lastAction'])
})

const defaultPersistedState = parseFromState(Map({
  login: loginState,
  actions: actionState
}));

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    return serializedState !== null ? JSON.parse(serializedState) : defaultPersistedState
  } catch (error) {
    return defaultPersistedState;
  }
}
export const resetState = () => {
  localStorage.setItem(STORAGE_KEY, defaultPersistedState)
}


export const persistState = (state) => {
  const { lastAction, ...stateToPersist } = parseFromState(state);

  try {
    switch (lastAction) {
      case FETCH_USER_SUCCESS:
        const serializedState = JSON.stringify(stateToPersist)
        localStorage.setItem(STORAGE_KEY, serializedState)
        break;
      case LOGOUT_SUCCESS:
      case ADMIN_LOGOUT_SUCCESS:
        resetState()
        break;
      default:
        break;
    }
  } catch (error) {
    console.log('failed to persist state')
  }
}
