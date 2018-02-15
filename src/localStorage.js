import { defaultState } from './pages/Login/reducer';

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

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serializedState)
  } catch (error) {
    console.log('failed to persist state')
  }
}
