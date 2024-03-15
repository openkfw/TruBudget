import { fromJS } from "immutable";

import { CLEAR_DOCUMENTS, VALIDATE_DOCUMENT, VALIDATE_DOCUMENT_FE, VALIDATE_DOCUMENT_SUCCESS } from "./actions";

const defaultState = fromJS({
  validatedDocuments: {},
  documentToValidate: {}
});

export default function documentsReducer(state = defaultState, action) {
  switch (action.type) {
    case VALIDATE_DOCUMENT:
      return state.set("documentToValidate", { id: action.id, hash: action.hash });
    case VALIDATE_DOCUMENT_FE:
      return state.set("documentToValidate", { id: action.documentId, hash: action.hash });
    case VALIDATE_DOCUMENT_SUCCESS:
      return state.setIn(["validatedDocuments", state.getIn(["documentToValidate"]).id], action.isIdentical);
    case CLEAR_DOCUMENTS:
      return state.set("validatedDocuments", defaultState.get("validatedDocuments"));
    default:
      return state;
  }
}
