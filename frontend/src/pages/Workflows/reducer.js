import { fromJS } from "immutable";

import {
  WORKFLOW_NAME,
  WORKFLOW_AMOUNT,
  WORKFLOW_AMOUNT_TYPE,
  WORKFLOW_DOCUMENT,
  WORKFLOW_PURPOSE,
  WORKFLOW_CURRENCY,
  CREATE_WORKFLOW_SUCCESS,
  EDIT_WORKFLOW_ITEM_SUCCESS,
  SHOW_WORKFLOW_DETAILS,
  UPDATE_WORKFLOW_SORT,
  ENABLE_WORKFLOW_SORT,
  ENABLE_BUDGET_EDIT,
  SUBPROJECT_AMOUNT,
  WORKFLOW_CREATION_STEP,
  FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
  WORKFLOW_STATUS,
  SHOW_WORKFLOWITEM_PERMISSIONS,
  HIDE_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
  SHOW_SUBPROJECT_ASSIGNEES,
  HIDE_SUBPROJECT_ASSIGNEES,
  FETCH_SUBPROJECT_HISTORY,
  FETCH_SUBPROJECT_HISTORY_SUCCESS,
  HIDE_WORKFLOW_DIALOG,
  SHOW_WORKFLOW_EDIT,
  SHOW_WORKFLOW_CREATE,
  HIDE_WORKFLOW_DETAILS,
  SAVE_WORKFLOW_ITEM_BEFORE_SORT,
  SET_HISTORY_OFFSET,
  SHOW_WORKFLOW_PREVIEW,
  HIDE_WORKFLOW_PREVIEW,
  WORKFLOWITEMS_SELECTED,
  SET_WORKFLOW_DRAWER_PERMISSIONS,
  ASSIGN_WORKFLOWITEM_SUCCESS,
  STORE_WORKFLOW_ASSIGNEE,
  GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
  RESET_SUCCEEDED_WORKFLOWITEMS
} from "./actions";
import strings from "../../localizeStrings";
import { LOGOUT } from "../Login/actions";
import { fromAmountString } from "../../helper";
import { HIDE_HISTORY } from "../Notifications/actions";

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
  workflowItemsBeforeSort: [],
  parentProject: {},
  workflowToAdd: {
    id: "",
    displayName: "",
    amount: "",
    amountType: "N/A",
    currency: "",
    description: "",
    status: "open",
    documents: []
  },
  showWorkflowPermissions: false,
  workflowItemReference: "",
  permissions: {},
  tempDrawerPermissions: {},
  creationDialogShown: false,
  showDetails: false,
  showDetailsItemId: "",
  showHistory: false,
  offset: 0,
  limit: 30,
  currentStep: 0,
  workflowSortEnabled: false,
  workflowType: "workflow",
  workflowApprovalRequired: true,
  subProjectBudgetEditEnabled: false,
  roles: [],
  historyItems: [],
  isHistoryLoading: false,
  showWorkflowAssignee: false,
  workflowAssignee: "",
  showSubProjectAssignee: false,
  editDialogShown: false,
  dialogTitle: strings.workflow.add_item,
  previewDialogShown: false,
  selectedWorkflowItems: [],
  succeededWorkflowAssign: [],
  succeededWorkflowGrant: []
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS:
      const { subproject, workflowitems, parentProject } = action;
      return state.merge({
        id: subproject.data.id,
        created: subproject.data.creationUnixTs,
        displayName: subproject.data.displayName,
        description: subproject.data.description,
        status: subproject.data.status,
        amount: fromAmountString(subproject.data.amount),
        currency: subproject.data.currency,
        allowedIntents: fromJS(subproject.allowedIntents),
        assignee: fromJS(subproject.data.assignee),
        workflowItems: fromJS(workflowitems),
        parentProject: fromJS(parentProject)
      });
    case SHOW_WORKFLOW_EDIT:
      return state.merge({
        workflowToAdd: state
          .getIn(["workflowToAdd"])
          .set("id", action.id)
          .set("displayName", action.displayName)
          .set("amount", action.amount)
          .set("amountType", action.amountType)
          .set("description", action.description)
          .set("currency", action.currency)
          .set("documents", fromJS(action.documents)),
        editDialogShown: true,
        dialogTitle: strings.workflow.edit_item
      });
    case ASSIGN_WORKFLOWITEM_SUCCESS:
      return state.updateIn(["succeededWorkflowAssign"], succeededActions => [
        ...succeededActions,
        action.workflowitemId
      ]);
    case GRANT_WORKFLOWITEM_PERMISSION_SUCCESS:
      return state.updateIn(["succeededWorkflowGrant"], succeededActions => [
        ...succeededActions,
        { id: action.workflowitemId, intent: action.intent }
      ]);
    case RESET_SUCCEEDED_WORKFLOWITEMS:
      return state.merge({
        succeededWorkflowAssign: defaultState.get("succeededWorkflowAssign"),
        succeededWorkflowGrant: defaultState.get("succeededWorkflowGrant")
      });
    case SHOW_WORKFLOW_CREATE:
      return state.merge({ creationDialogShown: true, dialogTitle: strings.workflow.add_item });
    case HIDE_WORKFLOW_DIALOG:
      return state.merge({
        editDialogShown: false,
        creationDialogShown: false,
        workflowToAdd: defaultState.getIn(["workflowToAdd"]),
        currentStep: defaultState.get("currentStep")
      });

    case SHOW_WORKFLOWITEM_PERMISSIONS:
      return state.merge({
        workflowItemReference: action.wId,
        permissions: fromJS({}),
        showWorkflowPermissions: true
      });
    case HIDE_WORKFLOWITEM_PERMISSIONS:
      return state.merge({
        workflowItemReference: defaultState.getIn(["workflowItemReference"]),
        showWorkflowPermissions: false
      });

    case FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS:
      return state.set("permissions", fromJS(action.permissions));
    case WORKFLOW_CREATION_STEP:
      return state.set("currentStep", action.step);
    case WORKFLOW_NAME:
      return state.setIn(["workflowToAdd", "displayName"], action.name);
    case WORKFLOW_AMOUNT:
      return state.setIn(["workflowToAdd", "amount"], action.amount);
    case WORKFLOW_AMOUNT_TYPE:
      return state.setIn(["workflowToAdd", "amountType"], action.amountType);
    case WORKFLOW_PURPOSE:
      return state.setIn(["workflowToAdd", "description"], action.description);
    case WORKFLOW_CURRENCY:
      return state.setIn(["workflowToAdd", "currency"], action.currency);
    case WORKFLOW_STATUS:
      return state.setIn(["workflowToAdd", "status"], action.status);
    case WORKFLOW_DOCUMENT:
      return state.updateIn(["workflowToAdd", "documents"], documents => [
        ...documents,
        { id: action.id, base64: action.base64 }
      ]);
    case SUBPROJECT_AMOUNT:
      return state.set("subProjectAmount", action.amount);
    case CREATE_WORKFLOW_SUCCESS:
    case EDIT_WORKFLOW_ITEM_SUCCESS:
      return state.merge({
        workflowToAdd: defaultState.getIn(["workflowToAdd"])
      });
    case SET_WORKFLOW_DRAWER_PERMISSIONS:
      return state.set("tempDrawerPermissions", fromJS(action.permissions));
    case SAVE_WORKFLOW_ITEM_BEFORE_SORT:
      return state.set("workflowItemsBeforeSort", fromJS(action.workflowItems));
    case SHOW_WORKFLOW_DETAILS:
      return state.merge({
        showDetails: true,
        showDetailsItemId: action.id
      });
    case HIDE_WORKFLOW_DETAILS:
      return state.merge({
        showDetails: false,
        showDetailsItemId: defaultState.getIn("showDetailsItemId")
      });
    case ENABLE_WORKFLOW_SORT:
      return state.set("workflowSortEnabled", action.sortEnabled);
    case UPDATE_WORKFLOW_SORT:
      return state.merge({
        workflowItems: fromJS(action.workflowItems)
      });
    case ENABLE_BUDGET_EDIT:
      return state.set("subProjectBudgetEditEnabled", action.budgetEditEnabled);
    case STORE_WORKFLOW_ASSIGNEE:
      return state.set("workflowAssignee", action.assignee);
    case WORKFLOWITEMS_SELECTED:
      return state.set("selectedWorkflowItems", fromJS(action.workflowItems));
    case SHOW_SUBPROJECT_ASSIGNEES:
      return state.set("showSubProjectAssignee", true);
    case HIDE_SUBPROJECT_ASSIGNEES:
      return state.set("showSubProjectAssignee", false);
    case SET_HISTORY_OFFSET:
      return state.set("offset", action.offset);
    case FETCH_SUBPROJECT_HISTORY:
      return state.set("isHistoryLoading", true);
    case FETCH_SUBPROJECT_HISTORY_SUCCESS:
      return state.merge({
        historyItems: [...state.get("historyItems"), ...fromJS(action.events)],
        historyItemsCount: action.historyItemsCount,
        isHistoryLoading: false,
        offset: action.offset
      });
    case HIDE_HISTORY:
      return state.merge({
        historyItems: fromJS([]),
        offset: 0
      });
    case SHOW_WORKFLOW_PREVIEW:
      return state.set("previewDialogShown", true);
    case HIDE_WORKFLOW_PREVIEW:
      return state.set("previewDialogShown", false);
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
