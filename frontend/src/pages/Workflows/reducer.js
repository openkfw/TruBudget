import { fromJS } from "immutable";

import {
  SHOW_WORKFLOW_DIALOG,
  WORKFLOW_NAME,
  WORKFLOW_AMOUNT,
  WORKFLOW_AMOUNT_TYPE,
  WORKFLOW_PURPOSE,
  WORKFLOW_CURRENCY,
  WORKFLOW_TXID,
  CREATE_WORKFLOW_SUCCESS,
  EDIT_WORKFLOW_SUCCESS,
  SHOW_WORKFLOW_DETAILS,
  UPDATE_WORKFLOW_SORT,
  ENABLE_WORKFLOW_SORT,
  ENABLE_BUDGET_EDIT,
  SUBPROJECT_AMOUNT,
  WORKFLOW_CREATION_STEP,
  FETCH_ALL_SUBPROJECT_DETAILS,
  FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
  CANCEL_WORKFLOW_DIALOG,
  WORKFLOW_STATUS,
  SHOW_SUBPROJECT_PERMISSIONS,
  HIDE_SUBPROJECT_PERMISSIONS,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  SHOW_WORKFLOWITEM_PERMISSIONS,
  HIDE_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS
} from "./actions";

import { LOGOUT } from "../Login/actions";
import { fromAmountString } from "../../helper";

const defaultState = fromJS({
  id: "",
  displayName: "",
  description: "",
  status: "open",
  amount: 0,
  currency: "EUR",
  created: 0,
  allowedIntents: [],
  workflowItems: [],
  parentProject: {},
  workflowToAdd: {
    name: "",
    amount: "",
    amountType: "N/A",
    currency: "",
    comment: "",
    status: "open",
    txId: ""
  },
  showSubProjectPermissions: false,
  showWorkflowPermissions: false,
  workflowItemReference: "",
  permissions: {},

  workflowDialogVisible: false,
  editMode: false,
  showDetails: false,
  showDetailsItemId: "",
  showHistory: false,
  currentStep: 0,
  workflowSortEnabled: false,
  workflowType: "workflow",
  workflowApprovalRequired: true,
  subProjectBudgetEditEnabled: false,
  roles: [],
  historyItems: []
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS:
      const { subproject, workflowitems, parentProject } = action;
      return state.merge({
        id: subproject.id,
        created: subproject.creationUnixTs,
        displayName: subproject.displayName,
        description: subproject.description,
        status: subproject.status,
        amount: fromAmountString(subproject.amount),
        currency: subproject.currency,
        allowedIntents: fromJS(subproject.allowedIntents),
        workflowItems: fromJS(workflowitems),
        parentProject: fromJS(parentProject)
      });
    case SHOW_WORKFLOW_DIALOG:
      return state.merge({
        workflowDialogVisible: action.show,
        editMode: action.editMode
      });
    case CANCEL_WORKFLOW_DIALOG:
      return state.merge({
        workflowDialogVisible: action.show,
        workflowToAdd: defaultState.getIn(["workflowToAdd"]),
        editMode: defaultState.get("editMode"),
        currentStep: defaultState.get("currentStep")
      });
    case SHOW_SUBPROJECT_PERMISSIONS:
      return state.merge({
        permissions: fromJS({}),
        showSubProjectPermissions: true,
        showWorkflowPermissions: false
      });
    case SHOW_WORKFLOWITEM_PERMISSIONS:
      return state.merge({
        workflowItemReference: action.wId,
        permissions: fromJS({}),
        showSubProjectPermissions: false,
        showWorkflowPermissions: true
      });
    case HIDE_WORKFLOWITEM_PERMISSIONS:
      return state.merge({
        workflowItemReference: defaultState.getIn(["workflowItemReference"]),
        showWorkflowPermissions: false
      });
    case HIDE_SUBPROJECT_PERMISSIONS:
      return state.set("showSubProjectPermissions", false);
    case FETCH_SUBPROJECT_PERMISSIONS_SUCCESS:
    case FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS:
      return state.set("permissions", fromJS(action.permissions));
    case WORKFLOW_CREATION_STEP:
      return state.set("currentStep", action.step);
    case WORKFLOW_NAME:
      return state.setIn(["workflowToAdd", "name"], action.name);
    case WORKFLOW_AMOUNT:
      return state.setIn(["workflowToAdd", "amount"], action.amount);
    case WORKFLOW_AMOUNT_TYPE:
      return state.setIn(["workflowToAdd", "amountType"], action.amountType);
    case WORKFLOW_PURPOSE:
      return state.setIn(["workflowToAdd", "comment"], action.comment);
    case WORKFLOW_CURRENCY:
      return state.setIn(["workflowToAdd", "currency"], action.currency);
    case WORKFLOW_STATUS:
      return state.setIn(["workflowToAdd", "status"], action.status);
    case WORKFLOW_TXID:
      return state.setIn(["workflowToAdd", "txId"], action.txid);
    case SUBPROJECT_AMOUNT:
      return state.set("subProjectAmount", action.amount);
    case CREATE_WORKFLOW_SUCCESS:
    case EDIT_WORKFLOW_SUCCESS:
      return state.merge({
        workflowToAdd: defaultState.getIn(["workflowToAdd"]),
        workflowState: defaultState.get("workflowState"),
        editMode: defaultState.get("editMode")
      });
    case SHOW_WORKFLOW_DETAILS:
      return state.merge({
        showDetails: action.show,
        showDetailsItemId: action.txid
      });
    case ENABLE_WORKFLOW_SORT:
      return state.set("workflowSortEnabled", action.sortEnabled);
    case UPDATE_WORKFLOW_SORT:
      return state.merge({
        workflowItems: action.workflowItems
      });
    case ENABLE_BUDGET_EDIT:
      return state.set("subProjectBudgetEditEnabled", action.budgetEditEnabled);
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
