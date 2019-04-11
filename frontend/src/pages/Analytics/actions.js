export const GET_SUBPROJECT_KPIS = "GET_SUBPROJECT_KPIS";
export const GET_SUBPROJECT_KPIS_SUCCESS = "GET_SUBPROJECT_KPIS_SUCCESS";
export const GET_SUBPROJECT_KPIS_FAIL = "GET_SUBPROJECT_KPIS_FAIL";

export const STORE_EXCHANGE_RATE = "STORE_EXCHANGE_RATE";

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

export function resetKPIs() {
  return {
    type: RESET_KPIS
  };
}

export function storeExchangeRate(organization, currency, exchangeRate) {
  return {
    type: STORE_EXCHANGE_RATE,
    organization,
    currency,
    exchangeRate
  };
}

export function openAnalyticsDialog() {
  return { type: OPEN_ANALYTICS_DIALOG };
}

export function closeAnalyticsDialog() {
  return { type: CLOSE_ANALYTICS_DIALOG };
}
