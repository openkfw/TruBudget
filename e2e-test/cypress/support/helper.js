import accounting from "accounting";
import _isString from "lodash/isString";

export const currencies = {
  EUR: { symbol: "€" },
  USD: { symbol: "$" },
  BRL: { symbol: "R$" },
  XOF: { symbol: "CFA" },
  DKK: { symbol: "kr." }
};

export const languages = ["en-gb", "fr", "pt", "de", "ka"];

const getFormat = (currency, language) => {
  switch (language) {
    case "en-gb":
      return { format: "%s %v", ...currencies[currency], decimal: ".", thousand: ",", precision: 2 };
    case "fr":
    case "pt":
    case "de":
      return { format: "%v %s", ...currencies[currency], decimal: ".", thousand: ",", precision: 2 };
    default:
      return { format: "%s %v", ...currencies[currency], decimal: ".", thousand: ",", precision: 2 };
  }
};

export function toAmountString(amount, currency, language = "en-gb") {
  if (_isString(amount) && amount.trim().length <= 0) {
    return "";
  }
  const format = getFormat(currency, language);
  if (!currency) {
    return accounting.formatNumber(amount, format);
  } else {
    return accounting.formatMoney(amount, format);
  }
}
