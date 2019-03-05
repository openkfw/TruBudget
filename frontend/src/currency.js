// These are the currencies that are available in the frontend
// If there is a new currency added, please make sure to also add it to the list of currencies in the end-to-end test
// See ../e2e-test/currencies_spec.js
const currencies = {
  EUR: { symbol: "€", format: "%v %s" },
  USD: { symbol: "$", format: "%s %v" },
  BRL: { symbol: "R$", format: "%s %v" },
  XOF: { symbol: "CFA", format: "%s %v" },
  DKK: { symbol: "kr.", format: "%v %s" }
};

export default currencies;
