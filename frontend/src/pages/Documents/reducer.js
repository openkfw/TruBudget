import { fromJS } from "immutable";

import { LOGOUT } from "../Login/actions";
import {
  VALIDATE_DOCUMENT,
  VALIDATE_DOCUMENT_SUCCESS,
  ADD_DOCUMENT,
  ADD_DOCUMENT_SUCCESS,
  CLEAR_DOCUMENT,
  PREFILL_DOCUMENTS
} from "./actions";
import { CREATE_WORKFLOW_SUCCESS, EDIT_WORKFLOW_ITEM_SUCCESS } from "../Workflows/actions";

const defaultState = fromJS({
  validatedDocuments: {},
  hashToValidate: ""
});

export default function documentsReducer(state = defaultState, action) {
  switch (action.type) {
    case VALIDATE_DOCUMENT:
      return state.set("hashToValidate", action.hash);
    case VALIDATE_DOCUMENT_SUCCESS:
      return state.setIn(["validatedDocuments", state.get("hashToValidate")], action.isIdentical);
    case ADD_DOCUMENT:
      return state.set(
        "tempDocuments",
        state.get("tempDocuments").concat([fromJS({ payload: action.payload, name: action.name })])
      );
    case ADD_DOCUMENT_SUCCESS:
      const tempDocs = state.get("tempDocuments").update(
        state.get("tempDocuments").findIndex(document => {
          return document.get("name") === action.name;
        }),
        document => {
          return document.set("hash", action.hash);
        }
      );
      return state.set("tempDocuments", tempDocs);
    case CREATE_WORKFLOW_SUCCESS:
    case EDIT_WORKFLOW_ITEM_SUCCESS:
    case CLEAR_DOCUMENT:
      return state.removeIn(["validatedDocuments", action.document]);
    case PREFILL_DOCUMENTS:
      return state.set("tempDocuments", fromJS(action.documents));
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
