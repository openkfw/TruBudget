const axios = require("axios");

const getRate = series => {
  // catch non existing series
  if (!series) return 0;

  const observations = series.observations ? Object.values(series.observations) : [];
  const rateObservations = observations.find(obs => obs.length);
  if (!rateObservations) return 0;
  const rate = rateObservations.find(rObs => typeof rObs === "number");

  return rate ? rate : 0;
};

export async function getExchangeRates(baseCurrency = "EUR") {
  const instance = axios.create();
  delete instance.defaults.headers.common["Authorization"];
  const response = await instance.get(
    "https://sdw-wsrest.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?lastNObservations=1",
    { headers: {} }
  );
  const series = response.data.dataSets[0].series;
  const exchangeRates = {};
  for (let index = 0; index < Object.keys(series).length; index++) {
    // TODO: what happens if you the currency is not where we expect it to be?
    const currency = response.data.structure.dimensions.series[1].values[index].id;
    const exchangeRate = getRate(series["0:" + index + ":0:0:0"]);
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

export default getExchangeRates;
