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
  formattedAmount = parseInt(inputAmount).toLocaleString();
  return formattedAmount + decimals + tempCurrency;
};

