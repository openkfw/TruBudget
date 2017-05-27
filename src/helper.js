import React from 'react';
import moment from 'moment';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InProgressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import accounting from 'accounting';

import currencies from './currency';

import { taskStatusColorPalette, budgetStatusColorPalette } from './colors';

const getCurrencyFormat = (currency) => ({ decimal: ".", thousand: "", precision: 2, ...currencies[currency] })

export const fromAmountString = (amount, currency) => accounting.unformat(amount, getCurrencyFormat(currency).decimal);
export const toAmountString = (amount, currency) => accounting.formatMoney(amount, getCurrencyFormat(currency));

export const tsToString = (ts) => {
  let dateString = moment(ts, 'x').format("MMM D, YYYY");
  return dateString;
}

export const statusMapping = {
  done: 'Done',
  'in_progress': 'In progress',
  open: 'Open'
}
export const statusIconMapping = {
  done: <DoneIcon />,
  'in_progress': <InProgressIcon />,
  open: <OpenIcon />,
}


const createDoughnutData = (labels, data, colors = taskStatusColorPalette, ) => ({
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

export const createAmountData = (projectAmount, subProjects) => {
  const subProjectsAmount = calculateUnspentAmount(subProjects)
  const unspent = projectAmount - subProjectsAmount;
  const spentText = unspent < 0 ? "Overspent" : "Unspent"
  return createDoughnutData(["Spent", spentText], [subProjectsAmount, unspent < 0 ? 0 : unspent], budgetStatusColorPalette);
}

export const getProgressInformation = (items) => {
  let startValue = {
    open: 0,
    inProgress: 0,
    done: 0
  }
  const projectStatus = items.reduce((acc, item) => {
    const status = item.details.status;
    return {
      open: status === 'open' ? acc.open + 1 : acc.open,
      inProgress: status === 'in_progress' ? acc.inProgress + 1 : acc.inProgress,
      done: status === 'done' ? acc.done + 1 : acc.done,
    };
  }, startValue);
  return projectStatus;
}


export const createTaskData = (items) => {
  const projectStatus = getProgressInformation(items)
  return createDoughnutData(["Open", "In progress", "Done"], [projectStatus.open, projectStatus.inProgress, projectStatus.done]);
}

export const getNextIncompletedItem = (items) => {
  return items.find((item) => item.details.status === 'open' | item.details.status === 'in_progress');
}
