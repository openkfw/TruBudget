import { default as supportedCurrencies } from "./currency";
const axios = require("axios");

export async function getExchangeRates(baseCurrency = "EUR", currencies = Object.keys(supportedCurrencies)) {
  currencies = currencies.filter(currency => currency in supportedCurrencies);
  const date = new Date();
  const today = date.toISOString().split("T")[0];
  const yesterday = new Date(date - 86400000).toISOString().split("T")[0];
  const instance = axios.create();
  delete instance.defaults.headers.common["Authorization"];
  const response = await instance.get(
    "https://sdw-wsrest.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?startPeriod=" + yesterday + "&endPeriod=" + today,
    { headers: {} }
  );
  let index = 0;
  const series = response.data.dataSets[0].series;
  const exchangeRates = {};
  for (const _key in series) {
    const currency = response.data.structure.dimensions.series[1].values[index].id;
    const exchangeRate = series["0:" + index + ":0:0:0"].observations[0][0];
    if (currencies.includes(currency)) {
      exchangeRates[currency] = exchangeRate;
    }
    index += 1;
  }
  exchangeRates["EUR"] = 1;
  exchangeRates["XOF"] = 655.957;
  if (baseCurrency !== "EUR") {
    const baseRate = exchangeRates[baseCurrency];
    for (const key in exchangeRates) {
      exchangeRates[key] = exchangeRates[key] / baseRate;
    }
    exchangeRates[baseCurrency] = 1;
  }
  return exchangeRates;
}

// getExchangeRates("BRL").then(a => console.log(a));

export default getExchangeRates;
