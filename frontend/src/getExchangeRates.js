import { default as supportedCurrencies } from "./currency";
const axios = require("axios");

async function getExchangeRate(baseCurrency, currency) {
  const date = new Date();
  const today = date.toISOString().split("T")[0];
  const yesterday = new Date(date - 86400000).toISOString().split("T")[0];
  const instance = axios.create();
  delete instance.defaults.headers.common["Authorization"];
  const response = await instance.get(
    "https://sdw-wsrest.ecb.europa.eu/service/data/EXR/D." +
      currency +
      "." +
      baseCurrency +
      ".SP00.A?startPeriod=" +
      yesterday +
      "&endPeriod=" +
      today,
    { headers: {} }
  );
  return response.data.dataSets[0].series["0:0:0:0:0"].observations[0][0];
}

export async function getExchangeRates(baseCurrency, currencies) {
  currencies = currencies.filter(currency => currency in supportedCurrencies && baseCurrency !== currency);
  return currencies.reduce(async (objPromise, currency) => {
    // ignore unknown currencies
    const obj = await objPromise;
    obj[currency] = await getExchangeRate(baseCurrency, currency);
    return obj;
  }, Promise.resolve({}));
}

// getExchangeRates("EUR", ["EUR", "BRL", "USD", "ESD", "ASD", "DKK"]).then(a => console.log(a));
export default getExchangeRates;
