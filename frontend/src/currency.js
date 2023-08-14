// These are the currencies that are available in the frontend
// If there is a new currency added, please make sure to also add it to the list of currencies in the end-to-end test
// See ../e2e-test/currencies_spec.js

import strings from "./localizeStrings.js";

const currencies = {
  ARS: { symbol: "Arg$", format: strings.format.numberFormat },
  AUD: { symbol: "$A", format: strings.format.numberFormat },
  BGN: { symbol: "lev", format: strings.format.numberFormat },
  BRL: { symbol: "R$", format: strings.format.numberFormat },
  CAD: { symbol: "Can$", format: strings.format.numberFormat },
  CHF: { symbol: "Sw F", format: strings.format.numberFormat },
  CNY: { symbol: "CN¥", format: strings.format.numberFormat },
  CZK: { symbol: "Kč", format: strings.format.numberFormat },
  DKK: { symbol: "DKr", format: strings.format.numberFormat },
  DZD: { symbol: "DA", format: strings.format.numberFormat },
  ETB: { symbol: "Br", format: strings.format.numberFormat },
  EUR: { symbol: "€", format: strings.format.numberFormat },
  GBP: { symbol: "£", format: strings.format.numberFormat },
  HKD: { symbol: "HK$", format: strings.format.numberFormat },
  HUF: { symbol: "Ft", format: strings.format.numberFormat },
  IDR: { symbol: "Rp", format: strings.format.numberFormat },
  ILS: { symbol: "₪", format: strings.format.numberFormat },
  INR: { symbol: "₹", format: strings.format.numberFormat },
  ISK: { symbol: "ISK", format: strings.format.numberFormat },
  JPY: { symbol: "JP¥", format: strings.format.numberFormat },
  KRW: { symbol: "₩", format: strings.format.numberFormat },
  MAD: { symbol: "DH", format: strings.format.numberFormat },
  MXN: { symbol: "Mex$", format: strings.format.numberFormat },
  MYR: { symbol: "RM", format: strings.format.numberFormat },
  NOK: { symbol: "nkr", format: strings.format.numberFormat },
  NZD: { symbol: "$NZ", format: strings.format.numberFormat },
  PHP: { symbol: "₱", format: strings.format.numberFormat },
  PLN: { symbol: "zł", format: strings.format.numberFormat },
  QAR: { symbol: "QR", format: strings.format.numberFormat },
  RON: { symbol: "lei", format: strings.format.numberFormat },
  RUB: { symbol: "₽", format: strings.format.numberFormat },
  SAR: { symbol: "SAR", format: strings.format.numberFormat },
  SEK: { symbol: "SKr", format: strings.format.numberFormat },
  SGD: { symbol: "S$", format: strings.format.numberFormat },
  THB: { symbol: "฿", format: strings.format.numberFormat },
  TND: { symbol: "DT", format: strings.format.numberFormat },
  TRY: { symbol: "₺", format: strings.format.numberFormat },
  TWD: { symbol: "NT$", format: strings.format.numberFormat },
  USD: { symbol: "$", format: strings.format.numberFormat },
  XOF: { symbol: "CFA", format: strings.format.numberFormat },
  ZAR: { symbol: "R", format: strings.format.numberFormat }
};

export default currencies;
