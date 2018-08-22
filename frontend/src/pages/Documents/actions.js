export const VALIDATE_DOCUMENT = "VALIDATE_DOCUMENT";
export const VALIDATE_DOCUMENT_SUCCESS = "VALIDATE_DOCUMENT_SUCCESS";
export const ADD_DOCUMENT = "ADD_DOCUMENT";
export const ADD_DOCUMENT_SUCCESS = "ADD_DOCUMENT_SUCCESS";
export const CLEAR_DOCUMENT = "CLEAR_DOCUMENT";
export const PREFILL_DOCUMENTS = "PREFILL_DOCUMENTS";

export function validateDocument(hash, base64String) {
  return {
    type: VALIDATE_DOCUMENT,
    base64String,
    hash
  };
}
export function addDocument(payload, filename) {
  return {
    type: ADD_DOCUMENT,
    payload,
    filename
  };
}

export function clearDocument(hash) {
  return {
    type: CLEAR_DOCUMENT,
    document: hash
  };
}

export function prefillDocuments(documents = []) {
  return {
    type: PREFILL_DOCUMENTS,
    documents
  };
}
