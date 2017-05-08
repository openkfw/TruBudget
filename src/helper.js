import React from 'react';
import moment from 'moment';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InProgressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';

export const toAmountString = (inputAmount, currency) => {
  let decimals = ',00'
  let tempCurrency = ' €'
  let formattedAmount = '0'
  if (inputAmount !== 0) {
    if (typeof inputAmount !== "undefined" && inputAmount.includes('.')) {
      decimals = inputAmount.substr(inputAmount.indexOf('.'), inputAmount.length - 1);
      decimals = decimals.replace('.', ',');
      if (decimals.length === 2) {
        decimals += '0';
      }
    }
  }
  if (currency === 'USD') {
    tempCurrency = " $"
  }
  formattedAmount = parseInt(inputAmount, 10).toLocaleString();
  return formattedAmount + decimals + tempCurrency;
};

export const tsToString = (ts) => {
  let dateString = moment(ts, 'x').format("D.MMM.YYYY");
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


const createDoughnutData = (labels, data) => ({
  labels,
  datasets: [
    {
      data: data,
      backgroundColor: [
        "#FF6384", "#36A2EB", "#FFCE56"
      ],
      hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
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
  return createDoughnutData(["Spent", "Unspent"], [subProjectsAmount, unspent]);
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
