import React from 'react';
import moment from 'moment';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InProgressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import accounting from 'accounting';
import _ from 'lodash';
import strings from './localizeStrings'
import currencies from './currency';

import { taskStatusColorPalette, budgetStatusColorPalette, workflowBudgetColorPalette } from './colors';

const getCurrencyFormat = (currency) => ({
  decimal: ".",
  thousand: ",",
  precision: 2,
  ...currencies[currency]
})

export const fromAmountString = (amount, currency) => {
  // Unformatting an empty string will result in an error
  // we use '' as default value for number fields to prevent users from an unerasable 0
  if (_.isString(amount) && amount.trim().length <= 0) {
    return '';
  }
  return accounting.unformat(amount, getCurrencyFormat(currency).decimal);
}

export const getCurrencies = (parentCurrency) => {
  return ['EUR', 'USD', 'BRL'].map((currency) => {
    const disabled = !_.isEmpty(parentCurrency) && !(parentCurrency === currency);
    return {
      disabled,
      primaryText: currency,
      value: currency,
    }
  })
}



export const toAmountString = (amount, currency) => accounting.formatMoney(amount, getCurrencyFormat(currency));

export const tsToString = (ts) => {
  let dateString = moment(ts, 'x').format("MMM D, YYYY");
  return dateString;
}
export const typeMapping = {
  workflow: strings.workflow.workflow_type_workflow,
  transaction: strings.workflow.workflow_type_transaction
}

export const statusMapping = (status) => {
  switch (status) {
    case 'done':
      return strings.common.done
    case 'in_review':
      return strings.common.in_review
    case 'in_progress':
      return strings.common.in_progress
    case 'open':
      return strings.common.open
    default:
      break;
  }
}

export const amountTypes = (amountType) => {
  switch (amountType) {
    case 'na':
      return strings.workflow.workflow_budget_status_na;
    case 'allocated':
      return strings.workflow.workflow_budget_status_allocated;
    case 'disbursed':
      return strings.workflow.workflow_budget_status_disbursed;
    default:
      break;
  }
}

export const statusIconMapping = {
  done: <DoneIcon />,
  'in_progress': <InProgressIcon />,
  open: <OpenIcon />,
}

const actionMapping = (assignee, bank, approver, type) => ({
  'in_review_workflow': `${strings.workflow.workflow_action_in_review} ${approver}`,
  'in_review_transaction': `${strings.workflow.workflow_action_in_review} ${bank}`,
  // pending: `${strings.workflow.workflow_action_pending_approval} ${bank}`,
  'in_progress': `${strings.workflow.workflow_action_open_in_progress}  ${assignee}`,
  open: `${strings.workflow.workflow_action_open_in_progress} ${assignee}`,
})

export const roleMapper = {
  'approver': strings.common.approver,
  'bank': strings.common.bank,
  'assignee': strings.common.assignee
}



const createDoughnutData = (labels, data, colors = taskStatusColorPalette) => ({
  labels,
  datasets: [
    {
      data: data,
      backgroundColor: colors,
      hoverBackgroundColor: colors,
    }
  ]
});

export const calculateUnspentAmount = (items) => {
  const amount = items.reduce((acc, item) => {
    return acc + parseInt(item.details.amount, 10)
  }, 0);
  return amount;
}

export const getCompletionRatio = (subprojects) => {
  const completedSubprojects = getCompletedSubprojects(subprojects);
  const percentageCompleted = (completedSubprojects.length / subprojects.length) * 100
  return percentageCompleted > 0 ? percentageCompleted : 0;
}

const getCompletedSubprojects = (subprojects) => {
  const completedSubprojects = subprojects.filter((subproject) => {
    return subproject.details.status === "done";
  })
  return completedSubprojects;
}

export const getCompletionString = (subprojects) => {
  const completedSubprojects = getCompletedSubprojects(subprojects);
  return strings.formatString(strings.subproject.subproject_completion_string, completedSubprojects.length, subprojects.length)
}

export const getAllocationRatio = (spentAmount, projectAmount) => {
  const allocationRatio = (spentAmount / projectAmount) * 100
  return allocationRatio > 0 ? allocationRatio : 0;
}
export const calculateWorkflowBudget = (workflows) => {
  return workflows.reduce((acc, workflow) => {
    const { amount, amountType, status } = workflow.data;
    const next = {
      assigned: amountType === 'allocated' ? acc.assigned + amount : acc.assigned,
      disbursed: amountType === 'disbursed' ? acc.disbursed + amount : acc.disbursed,
      currentDisbursement: amountType === 'disbursed' && status === 'done' ? acc.currentDisbursement + amount : acc.currentDisbursement,
    }
    return next;
  }, {
      assigned: 0,
      disbursed: 0,
      currentDisbursement: 0
    })
}

export const createAmountData = (projectAmount, subProjects) => {
  const subProjectsAmount = calculateUnspentAmount(subProjects)
  const unspent = projectAmount - subProjectsAmount;
  return createDoughnutData([strings.common.assigned, strings.common.not_assigned], [subProjectsAmount, unspent < 0 ? 0 : unspent], budgetStatusColorPalette);
}

export const getNotAssignedBudget = (amount, assignedBudget, disbursedBudget) => {
  const notAssigned = amount - assignedBudget - disbursedBudget;
  return notAssigned >= 0 ? notAssigned : 0;
}

export const createSubprojectAmountData = (subProjectAmount, workflows) => {
  const { assigned, disbursed } = calculateWorkflowBudget(workflows);


  const budgetLeft = getNotAssignedBudget(subProjectAmount, assigned, disbursed);
  return createDoughnutData([strings.common.not_assigned_budget, strings.common.assigned_budget, strings.common.disbursed_budget], [budgetLeft, assigned, disbursed], workflowBudgetColorPalette)
}

export const getProgressInformation = (items) => {
  let startValue = {
    open: 0,
    inProgress: 0,
    inReview: 0,
    done: 0
  }
  const projectStatus = items.reduce((acc, item) => {
    const status = item.details.status;
    return {
      open: status === 'open' ? acc.open + 1 : acc.open,
      inProgress: status === 'in_progress' ? acc.inProgress + 1 : acc.inProgress,
      inReview: status === 'in_review' ? acc.inReview + 1 : acc.inReview,
      done: status === 'done' ? acc.done + 1 : acc.done,
    };
  }, startValue);
  return projectStatus;
}

export const preselectCurrency = (parentCurrency, setCurrency) => {
  const preSelectedCurrency = _.isUndefined(parentCurrency) ? 'EUR' : parentCurrency
  setCurrency(preSelectedCurrency)

}
export const createTaskData = (items, type) => {
  const projectStatus = getProgressInformation(items)
  if (type === 'workflows') {
    return createDoughnutData([strings.common.open, strings.common.in_progress, strings.common.in_review, strings.common.done], [projectStatus.open, projectStatus.inProgress, projectStatus.inReview, projectStatus.done]);
  }
  return createDoughnutData([strings.common.open, strings.common.in_progress, strings.common.done], [projectStatus.open, projectStatus.inProgress, projectStatus.done]);
}

export const getNextIncompletedItem = (items) => {
  return items.find((item) => item.details.status === 'open' | item.details.status === 'in_progress' | item.details.status === 'in_review');
}

export const getNextAction = (item, assignee, bank, approver) => {
  if (!_.isUndefined(item) && !_.isUndefined(item.details.status)
    && !_.isEmpty(item.details.status)) {
    if (item.details.status === 'in_review') {
      // Decide if transaction or workflow to show the right reviewer
      const action = item.details.status + '_' + item.details.type
      return actionMapping(assignee, bank, approver)[action]
    }
    return actionMapping(assignee, bank, approver)[item.details.status]
  } else {
    return strings.workflow.workflow_no_actions
  }
}

export const isAdminNode = (nodePermissions) => {
  return nodePermissions.indexOf('admin');
}

export const getAssignedOrganization = (definedRoles, assignedRoles) => assignedRoles.reduce((acc, assignedRole, index) => {
  const organization = definedRoles.find((role) => assignedRole === role.role);
  if (!_.isEmpty(organization)) {
    const assignedOrganization = organization.organization
    const nextString = index ? `, ${assignedOrganization}` : `${assignedOrganization}`
    return acc + nextString;
  }
  return "";
}, "")
