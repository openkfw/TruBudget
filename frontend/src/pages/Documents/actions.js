export const VALIDATE_DOCUMENT = 'VALIDATE_DOCUMENT';
export const VALIDATE_DOCUMENT_SUCCESS = 'VALIDATE_DOCUMENT_SUCCESS';
export const ADD_DOCUMENT = 'ADD_DOCUMENT';
export const ADD_DOCUMENT_SUCCESS = 'ADD_DOCUMENT_SUCCESS';
export const CLEAR_DOCUMENTS = 'CLEAR_DOCUMENTS';
export const PREFILL_DOCUMENTS = 'PREFILL_DOCUMENTS';

export function validateDocument(hash, payload) {
  return {
    type: VALIDATE_DOCUMENT,
    payload,
    hash
  }
}
export function addDocument(payload, filename) {
  return {
    type: ADD_DOCUMENT,
    payload,
    filename
  }
}

export function clearDocuments() {
  return {
    type: CLEAR_DOCUMENTS,
  }
}

export function prefillDocuments(documents = []) {
  return {
    type: PREFILL_DOCUMENTS,
    documents
  }
}
