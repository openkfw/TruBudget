// These are the currencies that are available in the frontend
// If there is a new currency added, please make sure to also add it to the list of currencies in the end-to-end test
// See ../e2e-test/currencies_spec.js

import strings from "./localizeStrings.js";

const currencies = {
  EUR: { symbol: "€", format: strings.format.numberFormat },
  USD: { symbol: "$", format: strings.format.numberFormat },
  BRL: { symbol: "R$", format: strings.format.numberFormat },
  XOF: { symbol: "CFA", format: strings.format.numberFormat },
  DKK: { symbol: "kr.", format: strings.format.numberFormat }
};

export default currencies;
