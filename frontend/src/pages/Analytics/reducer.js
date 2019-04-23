import { fromJS } from "immutable";
import { LOGOUT } from "../Login/actions";
import {
  GET_SUBPROJECT_KPIS_SUCCESS,
  GET_PROJECT_KPIS_SUCCESS,
  RESET_KPIS,
  OPEN_ANALYTICS_DIALOG,
  CLOSE_ANALYTICS_DIALOG,
  STORE_DISPLAY_CURRENCY,
  GET_EXCHANGE_RATES_SUCCESS
} from "./actions";

/**
 * Analytics should provide a dashboard which visualizes aggregate informations about the selected Project/Subproject
 * Project:
 * - Total Budget: Sum of projected budgets
 * - Projected Budget: Sum of projected budgets of all subprojects
 * - Assigned Budget: Sum of allocated budgets of all subprojects.
 *   May exceed (projected) budget (subproject) Definition : Budget reserved for one specific activity as fixed in contract with subcontrator."
 * - Disbursed Budget: Sum of payments(disbursed budgets) of project (only of closed workflow items). Not allowed to exceed assigned budget.
 * Subproject:
 * - Projected Budget: Planned budget according to agreements and other budget planning documents.
 * - Assigned Budget: "Calculation : Sum of assigned budgets of subproject (only of closed workflow items).
 *   May exceed (projected) budget (subproject) Definition : Budget reserved for one specific activity as fixed in contract with subcontrator."
 * - Disbursed Budget: Sum of payments of subproject (only of closed workflow items). Not allowed to exceed assigned budget.
 */

const defaultState = fromJS({
  currency: "EUR",
  project: {
    totalBudget: [],
    projectedBudget: [],
    assignedBudget: [],
    disbursedBudget: []
  },
  subproject: {
    currency: "EUR",
    projectedBudgets: [], // contains budget objects
    assignedBudget: 0,
    disbursedBudget: 0
  },
  dialogOpen: false,
  exchangeRates: {}
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case GET_PROJECT_KPIS_SUCCESS:
      return state.merge({
        project: {
          totalBudget: fromJS(action.totalBudget),
          projectedBudget: fromJS(action.projectedBudget),
          assignedBudget: fromJS(action.assignedBudget),
          disbursedBudget: fromJS(action.disbursedBudget)
        }
      });
    case GET_SUBPROJECT_KPIS_SUCCESS:
      return state.merge({
        subproject: {
          currency: action.subProjectCurrency,
          projectedBudgets: fromJS(action.projectedBudgets),
          assignedBudget: action.assignedBudget,
          disbursedBudget: action.disbursedBudget
        }
      });
    case GET_EXCHANGE_RATES_SUCCESS:
      return state.set("exchangeRates", fromJS(action.exchangeRates));
    case STORE_DISPLAY_CURRENCY:
      return state.setIn(["currency"], action.currency);
    case OPEN_ANALYTICS_DIALOG:
      return state.set("dialogOpen", true);
    case CLOSE_ANALYTICS_DIALOG:
      return state.set("dialogOpen", false);
    case LOGOUT:
    case RESET_KPIS:
      return defaultState;
    default:
      return state;
  }
}
