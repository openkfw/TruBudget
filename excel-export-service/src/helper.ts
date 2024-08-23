import strings from "./localizeStrings";
import log from "./logger";

export const statusMapping = (status): string => {
  log.debug({ status }, "Mapping status");

  switch (status) {
    case "closed":
      return strings.common.closed;
    case "open":
      return strings.common.open;
    default:
      return "unknown";
  }
};

export const workflowItemTypeMapping = (type): string => {
  log.debug({ type }, "Mapping workflowitem type");

  switch (type) {
    case "general":
      return strings.common.general;
    case "restricted":
      return strings.common.restricted;
    default:
      return "unknown";
  }
};

export const workflowModeMapping = (type): string => {
  log.debug({ type }, "Mapping workflow mode");

  switch (type) {
    case "ordered":
      return strings.subproject.workflow_mode_ordered;
    case "unordered":
      return strings.subproject.workflow_mode_unordered;
    default:
      return strings.subproject.workflow_mode_ordered;
  }
};

export const amountTypesMapping = (amountType): string => {
  log.debug({ amountType }, "Mapping ammount type");

  switch (amountType) {
    case "N/A":
      return strings.workflowitem.na;
    case "allocated":
      return strings.workflowitem.allocated;
    case "disbursed":
      return strings.workflowitem.disbursed;
    default:
      return "unknown";
  }
};
