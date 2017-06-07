export const VALIDATE_DOCUMENT = 'VALIDATE_DOCUMENT';
export const VALIDATE_DOCUMENT_SUCCESS = 'VALIDATE_DOCUMENT_SUCCESS';

export function validateDocument(hash, payload) {
  return {
    type: VALIDATE_DOCUMENT,
    payload,
    hash
  }
}
