import moment from 'moment';

export const toAmountString = (inputAmount, currency) => {
  let decimals = ',00'
  let tempCurrency = ' €'
  let formattedAmount = '0'
  if (inputAmount !== 0){
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
  let dateString = moment(ts, 'x').format("D-MMM-YYYY");
  return dateString;
}

export const statusMapping = {
  done: 'Done',
  'in_progress': 'In progress',
  open: 'Open'
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

export const createAmountData = (projectAmount, subProjects) => {

  const subProjectsAmount = subProjects.reduce((acc, subProject) => {
    return acc + parseInt(subProject.details.amount, 10)
  }, 0);

  const unspent = projectAmount - subProjectsAmount;
  return createDoughnutData(["Spent", "Unspent"], [subProjectsAmount, unspent]);
}



export const createTaskData = (subProjects) => {
  let startValue = {
    open: 0,
    inProgress: 0,
    done: 0
  }
  const projectStatus = subProjects.reduce((acc, subProject) => {
    const status = subProject.details.status;
    return {
      open: status === 'open' ? acc.open + 1 : acc.open,
      inProgress: status === 'in_progress' ? acc.inProgress + 1 : acc.inProgress,
      done: status === 'done' ? acc.done + 1 : acc.done,
    };
  }, startValue);

  return createDoughnutData(["Open", "In progress", "Done"], [projectStatus.open, projectStatus.inProgress, projectStatus.done]);
}
