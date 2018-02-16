import { defaultState } from './pages/Login/reducer';

import { FETCH_USER_SUCCESS, LOGOUT_SUCCESS, ADMIN_LOGOUT_SUCCESS } from './pages/Login/actions';

const STORAGE_KEY = 'state';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    return undefined;
  }
}
export const resetState = () => {
  localStorage.setItem(STORAGE_KEY, defaultState)
}

export const saveState = (action, state) => {
  try {
    switch (action) {
      case FETCH_USER_SUCCESS:
        const serializedState = JSON.stringify(state)
        localStorage.setItem(STORAGE_KEY, serializedState)
        break;
      case LOGOUT_SUCCESS:
        resetState()
        break;
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
