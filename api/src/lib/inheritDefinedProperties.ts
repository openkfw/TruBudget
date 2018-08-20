import deepcopy from "./deepcopy";
import { isEmpty } from "./emptyChecks";

export function inheritDefinedProperties(dst: object, src: object, properties?: string[]): void {
  if (isEmpty(src)) return;
  (properties || Object.keys(src)).forEach(prop => {
    const val = src[prop];
    if (isEmpty(val)) return;
    dst[prop] = prop === "documents" ? deepcopyDocuments(val) : deepcopy(val);
  });
}

const deepcopyDocuments = documents => {
  const mappedDocs = documents.map(document => {
    if (document.hasOwnProperty("displayName")) {
      return {
        description: document.displayName,
        hash: document.payload,
      };
    } else {
      return {
        description: document.description,
        hash: document.hash,
      };
    }
  });
  return JSON.parse(JSON.stringify(mappedDocs));
};
