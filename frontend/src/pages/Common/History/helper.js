import strings from "../../../localizeStrings";

export const formatPermission = data =>
  `"${strings.permissions[data.intent.replace(/[.]/g, "_")]}"` || `"${data.intent}"`;
