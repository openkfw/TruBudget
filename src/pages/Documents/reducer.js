import { fromJS } from 'immutable';

import { LOGOUT } from '../Login/actions';
import { VALIDATE_DOCUMENT, VALIDATE_DOCUMENT_SUCCESS } from './actions';

const defaultState = fromJS({
  hashedDocuments: [],
  hashToValidate: '',
  validatedHash: '',
});

export default function documentsReducer(state = defaultState, action) {
  switch (action.type) {
    case VALIDATE_DOCUMENT:
      return state.set('hashToValidate', action.hash)
    case VALIDATE_DOCUMENT_SUCCESS:
      return state.set('validatedHash', action.hash)
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
