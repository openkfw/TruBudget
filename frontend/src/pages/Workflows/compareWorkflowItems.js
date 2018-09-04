export const compareWorkflowItems = (originalItem, itemToCompare) => {
  function isNewDocument(doc) {
    return doc.hasOwnProperty("base64");
  }

  const changesExceptDocuments = Object.keys(itemToCompare)
    .filter(key => key !== "documents")
    .filter(key => originalItem[key] !== itemToCompare[key])
    .reduce((acc, key) => {
      acc[key] = itemToCompare[key];
      return acc;
    }, {});

  const addedDocuments = Object.keys(itemToCompare.documents || {})
    .map(docId => itemToCompare.documents[docId])
    .filter(isNewDocument);
  return { ...changesExceptDocuments, documents: addedDocuments };
};
