const axios = require("axios");

export async function getExchangeRates(baseCurrency = "EUR") {
  const date = new Date();
  const today = date.toISOString().split("T")[0];
  const yesterday = new Date(date - 86400000).toISOString().split("T")[0];
  const instance = axios.create();
  delete instance.defaults.headers.common["Authorization"];
  const response = await instance.get(
    "https://sdw-wsrest.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?startPeriod=" + yesterday + "&endPeriod=" + today,
    { headers: {} }
  );
  const series = response.data.dataSets[0].series;
  const exchangeRates = {};
  for (let index = 0; index < Object.keys(series).length; index++) {
    const currency = response.data.structure.dimensions.series[1].values[index].id;
    const exchangeRate = series["0:" + index + ":0:0:0"].observations[0][0];
    exchangeRates[currency] = exchangeRate;
  }
  exchangeRates["EUR"] = 1;
  exchangeRates["XOF"] = 655.957;
  exchangeRates["KES"] = 114.882;
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
