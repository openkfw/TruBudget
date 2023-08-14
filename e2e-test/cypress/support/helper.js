import accounting from "accounting";
import _isString from "lodash/isString";

export const currencies = {
  ARS: { symbol: "Arg$" },
  AUD: { symbol: "$A" },
  BGN: { symbol: "lev" },
  BRL: { symbol: "R$" },
  CAD: { symbol: "Can$" },
  CHF: { symbol: "Sw F" },
  CNY: { symbol: "CN¥" },
  CZK: { symbol: "Kč" },
  DKK: { symbol: "DKr" },
  DZD: { symbol: "DA" },
  ETB: { symbol: "Br" },
  EUR: { symbol: "€" },
  GBP: { symbol: "£" },
  HKD: { symbol: "HK$" },
  HUF: { symbol: "Ft" },
  IDR: { symbol: "Rp" },
  ILS: { symbol: "₪" },
  INR: { symbol: "₹" },
  ISK: { symbol: "ISK" },
  JPY: { symbol: "JP¥" },
  KRW: { symbol: "₩" },
  MAD: { symbol: "DH" },
  MXN: { symbol: "Mex$" },
  MYR: { symbol: "RM" },
  NOK: { symbol: "nkr" },
  NZD: { symbol: "$NZ" },
  PHP: { symbol: "₱" },
  PLN: { symbol: "zł" },
  QAR: { symbol: "QR" },
  RON: { symbol: "lei" },
  RUB: { symbol: "₽" },
  SAR: { symbol: "SAR" },
  SEK: { symbol: "SKr" },
  SGD: { symbol: "S$" },
  THB: { symbol: "฿" },
  TND: { symbol: "DT" },
  TRY: { symbol: "₺" },
  TWD: { symbol: "NT$" },
  USD: { symbol: "$" },
  XOF: { symbol: "CFA" },
  ZAR: { symbol: "R" }
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
