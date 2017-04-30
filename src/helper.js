export const toAmountString = (inputAmount, currency) => {
  var decimals = ',00'
  var tempCurrency = ' €'
  var formattedAmount = '0'
  if (typeof inputAmount !== "undefined" && inputAmount.includes('.')) {
    decimals = inputAmount.substr(inputAmount.indexOf('.'), inputAmount.length - 1);
    decimals = decimals.replace('.', ',');
    if (decimals.length === 2) {
      decimals += '0';
    }
  }
  if (currency === 'USD') {
    tempCurrency = " $"
  }
  formattedAmount = parseInt(inputAmount, 10).toLocaleString();
  return formattedAmount + decimals + tempCurrency;
};

export const statusMapping = {
  done: 'Done',
  'in_progress': 'In progress',
  open: 'Open'
}
