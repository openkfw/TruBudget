import { fromJS } from "immutable";
import { LOGOUT } from "../Login/actions";
import { GET_SUBPROJECT_KPIS_SUCCESS, RESET_KPIS, OPEN_ANALYTICS_DIALOG, CLOSE_ANALYTICS_DIALOG } from "./actions";

/**
 * SubprojectAnalytics should provide a dashboard which visualizes aggregate informations about the selected Subproject
 * - Projected Budget: Planned budget according to agreements and other budget planning documents.
 * - Assigned Budget: "Calculation : Sum of assigned budgets of subproject (only of closed workflow items).
 *   May exceed (projected) budget (subproject) Definition : Budget reserved for one specific activity as fixed in contract with subcontrator."
 * - Disbursed Budget: Sum of payments of subproject (only of closed workflow items). Not allowed to exceed assigned budget.
 * - Indication Assigned Budget: Assigned budget / projected budget
 * - Indication Disbursed Budget:  Disbursed budget / assigned budget
 */

const defaultState = fromJS({
  subProjectCurrency: "EUR",
  projectedBudgets: [], // contains budget objects
  assignedBudget: 0,
  disbursedBudget: 0,
  indicatedAssignedBudget: 0,
  indicatedDisbursedBudget: 0,
  dialogOpen: false
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case GET_SUBPROJECT_KPIS_SUCCESS:
      return state.merge({
        subProjectCurrency: action.subProjectCurrency,
        projectedBudgets: fromJS(action.projectedBudgets),
        assignedBudget: action.assignedBudget,
        disbursedBudget: action.disbursedBudget,
        indicatedAssignedBudget: 0,
        indicatedDisbursedBudget: action.assignedBudget ? action.disbursedBudget / action.assignedBudget : 0
      });
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
