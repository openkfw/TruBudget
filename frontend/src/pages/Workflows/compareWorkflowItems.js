import _isEmpty from "lodash/isEmpty";

export const compareWorkflowItems = (originalItem, itemToCompare) => {
  const changes = {};
  for (const key of Object.keys(itemToCompare)) {
    if (originalItem[key] !== itemToCompare[key]) {
      if (key === "documents") {
        changes[key] = [];
        for (const index of Object.keys(itemToCompare[key])) {
          if (itemToCompare[key][index].hasOwnProperty("payload")) {
            changes[key].push(itemToCompare[key][index]);
          }
          // let changedDoc = {};
          // for (const key2 of Object.keys(itemToCompare[key][index])) {
          //   if (originalItem[key][index][key2] !== itemToCompare[key][index][key2]) {
          //     changedDoc = itemToCompare[key][index];
          //     break;
          //   }
          // }
          // if (!_isEmpty(changedDoc)) {
          //   if (changes[key] === undefined) changes[key] = [];
          //   changes[key].push(itemToCompare[key][index]);
          // }
        }
      } else {
        changes[key] = itemToCompare[key];
      }
    }
  }
  return changes;
};
