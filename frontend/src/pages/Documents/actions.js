export const VALIDATE_DOCUMENT = "VALIDATE_DOCUMENT";
export const VALIDATE_DOCUMENT_SUCCESS = "VALIDATE_DOCUMENT_SUCCESS";
export const ADD_DOCUMENT = "ADD_DOCUMENT";
export const ADD_DOCUMENT_SUCCESS = "ADD_DOCUMENT_SUCCESS";
export const CLEAR_DOCUMENTS = "CLEAR_DOCUMENTS";

export function validateDocument(hash, base64String, id) {
  return {
    type: VALIDATE_DOCUMENT,
    base64String: base64String,
    hash: hash,
    id: id
  };
}
export function addDocument(payload, filename) {
  return {
    type: ADD_DOCUMENT,
    payload,
    filename
  };
}

export function clearDocuments(hash) {
  return {
    type: CLEAR_DOCUMENTS,
    document: hash
  };
}
