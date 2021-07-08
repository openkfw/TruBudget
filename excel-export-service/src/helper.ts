import strings from "./localizeStrings";

export const statusMapping = (status) => {
  switch (status) {
    case "closed":
      return strings.common.closed;
    case "open":
      return strings.common.open;
    default:
      return "unknown";
  }
};

export const workflowItemTypeMapping = (type) => {
  switch (type) {
    case "general":
      return strings.common.general;
    case "restricted":
      return strings.common.restricted;
    default:
      return "";
  }
};

export const amountTypesMapping = (amountType) => {
  switch (amountType) {
    case "N/A":
      return strings.workflowitem.na;
    case "allocated":
      return strings.workflowitem.allocated;
    case "disbursed":
      return strings.workflowitem.disbursed;
    default:
      break;
  }
};
