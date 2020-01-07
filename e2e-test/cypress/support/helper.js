import _isString from "lodash/isString";

import accounting from "accounting";

const numberFormat = {
  decimal: ".",
  thousand: ",",
  precision: 2
};

const currencies = {
  EUR: { symbol: "€", format: "%v %s" },
  USD: { symbol: "$", format: "%s %v" },
  BRL: { symbol: "R$", format: "%s %v" },
  XOF: { symbol: "CFA", format: "%s %v" },
  DKK: { symbol: "kr.", format: "%v %s" }
};

const getCurrencyFormat = currency => ({
  ...numberFormat,
  ...currencies[currency]
});

export function toAmountString(amount, currency) {
  if (_isString(amount) && amount.trim().length <= 0) {
    return "";
  }
  if (!currency) {
    return accounting.formatNumber(amount, numberFormat.precision, numberFormat.thousand, numberFormat.decimal);
  }

  return accounting.formatMoney(amount, getCurrencyFormat(currency));
}
