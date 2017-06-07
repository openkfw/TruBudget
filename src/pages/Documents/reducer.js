import { fromJS } from 'immutable';

import { LOGOUT } from '../Login/actions';
import { VALIDATE_DOCUMENT, VALIDATE_DOCUMENT_SUCCESS } from './actions';

const defaultState = fromJS({
  hashedDocuments: [
    {
      name: 'Test document',
      hash: '2cc708f9516b51b1ab2b593c4f73d1e652dd2a0f923244fcd28c426b59d7ceb3'
    }
  ],
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
