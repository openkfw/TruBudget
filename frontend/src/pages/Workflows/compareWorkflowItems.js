export const compareWorkflowItems = (originalItem, itemToCompare) => {
  const changes = {};
  for (const key of Object.keys(itemToCompare)) {
    if (originalItem[key] !== itemToCompare[key]) {
      if (key === "documents") {
        changes[key] = [];
        for (const index of Object.keys(itemToCompare[key])) {
          if (itemToCompare[key][index].hasOwnProperty("base64")) {
            changes[key].push(itemToCompare[key][index]);
          }
        }
      } else {
        changes[key] = itemToCompare[key];
      }
    }
  }
  return changes;
};
