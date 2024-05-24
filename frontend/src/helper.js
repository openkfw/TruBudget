import React from "react";
import accounting from "accounting";
import dayjs from "dayjs";
import { Iterable } from "immutable";
import _cloneDeep from "lodash/cloneDeep";
import _every from "lodash/every";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _isObject from "lodash/isObject";
import _isString from "lodash/isString";
import _isUndefined from "lodash/isUndefined";
import _map from "lodash/map";

import RejectedIcon from "@mui/icons-material/Block";
import DoneIcon from "@mui/icons-material/Check";
import OpenIcon from "@mui/icons-material/Remove";

import currencies from "./currency";
import strings from "./localizeStrings";

export const toJS = (WrappedComponent) => (wrappedComponentProps) => {
  const KEY = 0;
  const VALUE = 1;

  const propsJS = Object.entries(wrappedComponentProps).reduce((newProps, wrappedComponentProp) => {
    newProps[wrappedComponentProp[KEY]] = Iterable.isIterable(wrappedComponentProp[VALUE])
      ? wrappedComponentProp[VALUE].toJS()
      : wrappedComponentProp[VALUE];
    return newProps;
  }, {});

  return <WrappedComponent {...propsJS} />;
};

const getCurrencyFormat = (currency) => ({
  ...strings.format.numberFormat,
  ...currencies[currency],
  format: strings.format.currencyPositon
});

export const compareObjects = (items, itemToAdd) => {
  if (!_isEmpty(items)) {
    const itemToAddClone = _cloneDeep(itemToAdd);
    const originalItem = items.find((item) => item.data.id === itemToAdd.id);
    if (originalItem) {
      const changes = {};
      for (const key of Object.keys(itemToAddClone)) {
        if (!_isEqual(originalItem.data[key], itemToAddClone[key])) {
          changes[key] = itemToAddClone[key];
        }
      }
      return changes;
    } else {
      return itemToAdd;
    }
  }
  return itemToAdd;
};

export const fromAmountString = (amount, currency) => {
  // Unformatting an empty string will result in an error
  // we use '' as default value for number fields to prevent users from an unerasable 0
  if (_isString(amount) && amount.trim().length <= 0) {
    return "";
  }
  return accounting.unformat(amount, getCurrencyFormat(currency).decimal);
};

export const getDisplayNameFromUsers = (id, users) => {
  if (!users) return "";
  const user = users.find((user) => user.id === id);
  return user.displayName;
};

export const getCurrencies = () => {
  return Object.keys(currencies).map((currency) => {
    return {
      primaryText: currency,
      value: currency
    };
  });
};

export const toAmountString = (amount, currency) => {
  if (_isString(amount) && amount.trim().length <= 0) {
    return "";
  }
  if (!currency) {
    return accounting.formatNumber(
      amount,
      strings.format.numberFormat.precision,
      strings.format.numberFormat.thousand,
      strings.format.numberFormat.decimal
    );
  }

  return accounting.formatMoney(amount, getCurrencyFormat(currency));
};

export const validateLanguagePattern = (amount) => {
  return strings.format.numberRegex.test(amount.toString(10));
};

export const numberSignsRegex = /^[0-9,.-]*$/;

export const unixTsToString = (ts) => {
  let dateString = dayjs.unix(ts).format("D MMM YYYY HH:mm");
  return dateString;
};

export const stringToUnixTs = (date) => {
  let ts = dayjs(date).unix() ?? 0;
  return ts;
};

export const statusMapping = (status) => {
  switch (status) {
    case "closed":
      return strings.common.closed;
    case "rejected":
      return strings.common.rejected;
    case "open":
      return strings.common.open;
    default:
      return "unknown";
  }
};

export const amountTypes = (amountType) => {
  switch (amountType) {
    case "N/A":
      return strings.workflow.workflow_budget_status_na;
    case "allocated":
      return strings.workflow.workflow_budget_status_allocated;
    case "disbursed":
      return strings.workflow.workflow_budget_status_disbursed;
    default:
      break;
  }
};

export const statusIconMapping = {
  closed: <DoneIcon />,
  rejected: <RejectedIcon />,
  open: <OpenIcon />
};

export const formatString = (text, ...args) => {
  return strings.formatString(text, ...args);
};

export const preselectCurrency = (parentCurrency, setCurrency) => {
  const preSelectedCurrency = _isUndefined(parentCurrency) ? "EUR" : parentCurrency;
  setCurrency(preSelectedCurrency);
};

export const formattedTag = (tag) => {
  return tag.replace(/[\s#]/g, "");
};

export const shortenedDisplayName = (displayName) => {
  const maxLength = 50;
  if (displayName.length > maxLength) {
    return displayName.slice(0, maxLength) + "...";
  }
  return displayName;
};

export function makePermissionReadable(intent) {
  return strings.permissions[intent.replace(/[.]/g, "_")] || intent;
}

export const isDateReached = (date) => {
  if (date === undefined) {
    return false;
  }
  return dayjs().isSameOrAfter(date, "day");
};

export const isEmailAddressValid = (emailAddress) => {
  const validEmailAddressRegex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return validEmailAddressRegex.test(emailAddress);
};

export const convertToURLQuery = (searchBarString) => {
  return searchBarString
    .replace(/[:]/g, "=")
    .replace(/[ ]/g, "&")
    .replace(/[&]{2,}/g, "&");
};

export const convertToSearchBarString = (urlQueryString) => {
  return urlQueryString.replace(/[=]/g, ":").replace(/[&]/g, " ");
};

export const hasUserAssignments = (assignments) => {
  const hasHiddenAssignments =
    assignments.hiddenAssignments !== undefined &&
    (assignments.hiddenAssignments.hasHiddenProjects === true ||
      assignments.hiddenAssignments.hasHiddenSubprojects === true ||
      assignments.hiddenAssignments.hasHiddenWorkflowitems === true);

  return (
    !_isEmpty(assignments.projects) ||
    !_isEmpty(assignments.subprojects) ||
    !_isEmpty(assignments.workflowitems) ||
    hasHiddenAssignments
  );
};

/*
 * isEmptyDeep(obj) checks all nested properties of the object.
 * If every property is empty, it returns true, otherwise false
 * A property can be an object or array
 * If property values are falsy (0, false), it is not considered as empty
 */
export const isEmptyDeep = (obj) => {
  if (_isObject(obj)) {
    if (Object.keys(obj).length === 0) return true;
    return _every(_map(obj, (v) => isEmptyDeep(v)));
  } else if (_isString(obj)) {
    return !obj.length;
  }
  return false;
};

export const getGroupsOfUser = (user, groups) => {
  return groups.filter((group) => group.users.includes(user));
};

export const isUserOrGroupPermitted = (user, groupsOfUser, permittedUsersAndGroups = []) => {
  return permittedUsersAndGroups.some((id) => id === user || groupsOfUser.find((group) => group.groupId === id));
};

export const capitalize = (string) => string.replace(/^\w/, (c) => c.toUpperCase());

export const getLoginErrorFromResponse = (status, data) => {
  // 400: User not found or password wrong.
  // 403: User is disabled.
  // 500: Proxy error OR ID/password field is empty OR Api not found.
  // Default: Incorrect username or password
  switch (status) {
    case 400:
      return strings.common.incorrect_username_or_password;
    case 403:
      return strings.common.login_disabled;
    case 404:
      return strings.login.user_not_found;
    case 500:
      if (data.includes("ECONNREFUSED", 0)) {
        return strings.common.login_proxy_error;
      }
      if (data.includes("ENOTFOUND", 0)) {
        return strings.common.login_api_error;
      } else {
        return strings.common.login_data_error;
      }
    default:
      return strings.common.incorrect_username_or_password;
  }
};

export function base64ToBlob(base64, type = "application/octet-stream") {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes], { type });
}
