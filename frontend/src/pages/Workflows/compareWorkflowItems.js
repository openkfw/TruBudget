import { toAmountString } from "../../helper";

export const compareWorkflowItems = (originalItem, itemToCompare) => {
  function isNewDocument(doc) {
    return !Object.hasOwn(doc, "id");
  }

  const modifiedOriginalItem = {
    ...originalItem,
    amount: toAmountString(originalItem.amount)
  };

  const modifiedItemToCompare = {
    ...itemToCompare,
    exchangeRate: itemToCompare.exchangeRate ? itemToCompare.exchangeRate.toString() : undefined
  };

  const changesExceptDocuments = Object.keys(modifiedItemToCompare)
    .filter((key) => key !== "documents")
    .filter((key) => modifiedOriginalItem[key] !== modifiedItemToCompare[key])
    .reduce((acc, key) => {
      acc[key] = modifiedItemToCompare[key];
      return acc;
    }, {});

  const addedDocuments = Object.keys(itemToCompare.documents || {})
    .map((docId) => itemToCompare.documents[docId])
    .filter(isNewDocument);

  return { ...changesExceptDocuments, documents: addedDocuments };
};
