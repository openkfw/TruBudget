import { fromJS } from 'immutable';

import { LOGOUT } from '../Login/actions';
import { VALIDATE_DOCUMENT_SUCCESS, ADD_DOCUMENT, ADD_DOCUMENT_SUCCESS, CLEAR_DOCUMENTS, PREFILL_DOCUMENTS } from './actions';
import { CREATE_WORKFLOW_SUCCESS, EDIT_WORKFLOW_SUCCESS } from '../Workflows/actions';

const defaultState = fromJS({
  validatedDocuments: {},
  tempDocuments: []
});

export default function documentsReducer(state = defaultState, action) {
  switch (action.type) {
    case VALIDATE_DOCUMENT_SUCCESS:
      return state.setIn(['validatedDocuments', action.hash], action.validates);
    case ADD_DOCUMENT:
      return state.set('tempDocuments', state.get('tempDocuments').concat([fromJS({ id: action.id, name: action.name })]))
    case ADD_DOCUMENT_SUCCESS:
      const tempDocs = state.get('tempDocuments').update(
        state.get('tempDocuments').findIndex((document) => {
          return document.get("id") === action.id;
        }), (document) => {
          return document.set("hash", action.hash);
        }
      );
      return state.set('tempDocuments', tempDocs);
    case CREATE_WORKFLOW_SUCCESS:
    case EDIT_WORKFLOW_SUCCESS:
    case CLEAR_DOCUMENTS:
      return state.set('tempDocuments', defaultState.get('tempDocuments'));
    case PREFILL_DOCUMENTS:
      return state.set('tempDocuments', fromJS(action.documents));
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
