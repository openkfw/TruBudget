import React from "react";
import { Iterable } from "immutable";
import dayjs from "dayjs";

import OpenIcon from "@material-ui/icons/Remove";
import DoneIcon from "@material-ui/icons/Check";

import indigo from "@material-ui/core/colors/indigo";

import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _cloneDeep from "lodash/cloneDeep";
import _isUndefined from "lodash/isUndefined";
import _isString from "lodash/isString";

import accounting from "accounting";
import strings from "./localizeStrings";
import currencies from "./currency";
const numberFormat = {
  decimal: ".",
  thousand: ",",
  precision: 2
};

const statusColors = [indigo[100], indigo[300]];

export const toJS = WrappedComponent => wrappedComponentProps => {
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

const getCurrencyFormat = currency => ({
  ...numberFormat,
  ...currencies[currency]
});

export const compareObjects = (items, itemToAdd) => {
  if (!_isEmpty(items)) {
    const itemToAddClone = _cloneDeep(itemToAdd);
    const originalItem = items.find(item => item.data.id === itemToAdd.id);
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

export const formatAmountString = (amount, currency) => {
  if (_isString(amount) && amount.trim().length <= 0) {
    return "";
  }
  return amount;
};
export const getCurrencies = () => {
  return Object.keys(currencies).map(currency => {
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
    return accounting.formatNumber(amount, numberFormat.precision, numberFormat.thousand, numberFormat.decimal);
  }

  return accounting.formatMoney(amount, getCurrencyFormat(currency));
};

export const tsToString = ts => {
  let dateString = dayjs.unix(ts).format("MMM D, YYYY");
  return dateString;
};

export const unixTsToString = ts => {
  let dateString = dayjs.unix(ts).format("MMM D, YYYY");
  return dateString;
};

export const statusMapping = status => {
  switch (status) {
    case "closed":
      return strings.common.closed;
    case "open":
      return strings.common.open;
    default:
      return "unknown";
  }
};

export const amountTypes = amountType => {
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
  open: <OpenIcon />
};

export const roleMapper = {
  approver: strings.common.approver,
  bank: strings.common.bank,
  assignee: strings.common.assignee
};

export const createDoughnutData = (labels, data, colors = statusColors) => ({
  labels,
  datasets: [
    {
      data: data,
      backgroundColor: colors,
      hoverBackgroundColor: colors
    }
  ]
});

export const calculateUnspentAmount = items => {
  const amount = items.reduce((acc, item) => {
    return acc + parseFloat(item.data.amount, 10);
  }, 0);
  return amount;
};

export const getCompletionRatio = subprojects => {
  const completedSubprojects = getCompletedSubprojects(subprojects);
  const percentageCompleted = completedSubprojects.length / subprojects.length * 100;
  return percentageCompleted > 0 ? percentageCompleted : 0;
};

const getCompletedSubprojects = subprojects => {
  const completedSubprojects = subprojects.filter(subproject => {
    return subproject.data.status === "closed";
  });
  return completedSubprojects;
};

export const getCompletionString = subprojects => {
  const completedSubprojects = getCompletedSubprojects(subprojects);
  return strings.formatString(
    strings.subproject.subproject_completion_string,
    completedSubprojects.length,
    subprojects.length
  );
};

export const formatString = (text, ...args) => {
  return strings.formatString(text, ...args);
};
export const formatUpdateString = (identifier, createdBy, data) => {
  let string = strings.formatString(strings.history.changed_by, identifier, createdBy);
  const changes = Object.keys(data)
    .map(key => formatString(strings.history.to, key, data[key]))
    .join(", ");
  return string.concat(changes);
};

export const calculateWorkflowBudget = workflows => {
  return workflows.reduce(
    (acc, workflow) => {
      const { amount, amountType, status } = workflow.data;
      const parsedAmount = parseFloat(amount, 10);
      const next = {
        assigned: amountType === "allocated" ? acc.assigned + parsedAmount : acc.assigned,
        disbursed: amountType === "disbursed" ? acc.disbursed + parsedAmount : acc.disbursed,
        currentDisbursement:
          amountType === "disbursed" && status === "closed"
            ? acc.currentDisbursement + parsedAmount
            : acc.currentDisbursement
      };
      return next;
    },
    {
      assigned: 0,
      disbursed: 0,
      currentDisbursement: 0
    }
  );
};

export const getNotAssignedBudget = (amount, assignedBudget, disbursedBudget) => {
  const notAssigned = amount - assignedBudget - disbursedBudget;
  return notAssigned >= 0 ? notAssigned : 0;
};

export const getProgressInformation = items => {
  let startValue = {
    open: 0,
    closed: 0
  };
  const projectStatus = items.reduce((acc, item) => {
    const status = item.data.status;
    return {
      open: status === "open" ? acc.open + 1 : acc.open,
      closed: status === "closed" ? acc.closed + 1 : acc.closed
    };
  }, startValue);
  return projectStatus;
};

export const preselectCurrency = (parentCurrency, setCurrency) => {
  const preSelectedCurrency = _isUndefined(parentCurrency) ? "EUR" : parentCurrency;
  setCurrency(preSelectedCurrency);
};

export const createTaskData = (items, type) => {
  const projectStatus = getProgressInformation(items);
  return createDoughnutData([strings.common.open, strings.common.closed], [projectStatus.open, projectStatus.closed]);
};
