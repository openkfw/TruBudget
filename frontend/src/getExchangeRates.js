import axios from "axios";

import config from "./config";

const forexUrl = window?.injectedEnv?.REACT_APP_EXCHANGE_RATE_URL || config.exchangeRateUrl;

const getRate = (series) => {
  // catch non existing series
  if (!series) return 0;

  const observations = series.observations ? Object.values(series.observations) : [];
  const rateObservations = observations.find((obs) => obs.length);
  if (!rateObservations) return 0;
  const rate = rateObservations.find((rObs) => typeof rObs === "number");

  return rate ? rate : 0;
};

export async function getExchangeRates(baseCurrency = "EUR") {
  const instance = axios.create();
  delete instance.defaults.headers.common["Authorization"];
  const response = await instance.get(forexUrl, { headers: {} });
  const exchangeRates = {};
  if (response.data && response.data.dataSets && response.data.dataSets.length) {
    const series = response.data.dataSets[0].series;
    for (let index = 0; index < Object.keys(series).length; index++) {
      const currency = response.data.structure.dimensions.series[1].values[index].id;
      if (currency) {
        const exchangeRate = getRate(series["0:" + index + ":0:0:0"]);
        exchangeRates[currency] = exchangeRate;
      }
    }

    exchangeRates["EUR"] = 1;
    // Hardcoded exchange rates
    exchangeRates["XOF"] = 655.957;
    exchangeRates["KES"] = 114.882;
    exchangeRates["TND"] = 3.2924;
    exchangeRates["ETB"] = 47.156;

    // fixed exchange rate in reference to USD
    if (exchangeRates["USD"]) {
      exchangeRates["QAR"] = 3.64 * exchangeRates["USD"];
      exchangeRates["SAR"] = 3.75 * exchangeRates["USD"];
    }

    if (baseCurrency !== "EUR" && exchangeRates[baseCurrency]) {
      const baseRate = exchangeRates[baseCurrency];
      for (const key in exchangeRates) {
        exchangeRates[key] = exchangeRates[key] / baseRate;
      }
      exchangeRates[baseCurrency] = 1;
    }

    return exchangeRates;
  } else {
    throw new Error();
  }
}

export default getExchangeRates;
