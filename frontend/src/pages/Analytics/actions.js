export const GET_PROJECT_KPIS = "GET_PROJECT_KPIS";
export const GET_PROJECT_KPIS_SUCCESS = "GET_PROJECT_KPIS_SUCCESS";
export const GET_PROJECT_KPIS_FAIL = "GET_PROJECT_KPIS_FAIL";
export const GET_SUBPROJECT_KPIS = "GET_SUBPROJECT_KPIS";
export const GET_SUBPROJECT_KPIS_SUCCESS = "GET_SUBPROJECT_KPIS_SUCCESS";
export const GET_SUBPROJECT_KPIS_FAIL = "GET_SUBPROJECT_KPIS_FAIL";
export const GET_EXCHANGE_RATES = "GET_EXCHANGE_RATES";
export const GET_EXCHANGE_RATES_SUCCESS = "GET_EXCHANGE_RATES_SUCCESS";

export const STORE_EXCHANGE_RATE = "STORE_EXCHANGE_RATE";
export const STORE_DISPLAY_CURRENCY = "STORE_DISPLAY_CURRENCY";

export const OPEN_ANALYTICS_DIALOG = "OPEN_ANALYTICS_DIALOG";
export const CLOSE_ANALYTICS_DIALOG = "CLOSE_ANALYTICS_DIALOG";
export const RESET_KPIS = "RESET_KPIS";

export function getSubProjectKPIs(projectId, subProjectId) {
  return {
    type: GET_SUBPROJECT_KPIS,
    projectId,
    subProjectId
  };
}

export function getProjectKPIs(projectId) {
  return {
    type: GET_PROJECT_KPIS,
    projectId
  };
}

export function resetKPIs() {
  return {
    type: RESET_KPIS
  };
}

export function getExchangeRates(baseCurrency) {
  return {
    type: GET_EXCHANGE_RATES,
    baseCurrency
  };
}

export function storeDisplayCurrency(currency) {
  return {
    type: STORE_DISPLAY_CURRENCY,
    currency
  };
}

export function openAnalyticsDialog() {
  return { type: OPEN_ANALYTICS_DIALOG };
}

export function closeAnalyticsDialog() {
  return { type: CLOSE_ANALYTICS_DIALOG };
}
