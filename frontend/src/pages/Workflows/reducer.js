// since Immutable can not be tree-shaked, we can simply import it in total to prevent nameclashes (e.g. map)
import Immutable, { fromJS } from "immutable";
import _isEmpty from "lodash/isEmpty";
import strings from "../../localizeStrings";
import { CONFIRMATION_CANCELLED, CONFIRMATION_CONFIRMED } from "../Confirmation/actions";
import { HIDE_HISTORY } from "../Notifications/actions";
import { FETCH_PROJECT_PERMISSIONS, FETCH_PROJECT_PERMISSIONS_SUCCESS } from "../Overview/actions";
import { FETCH_SUBPROJECT_PERMISSIONS, FETCH_SUBPROJECT_PERMISSIONS_SUCCESS } from "../SubProjects/actions";
import {
  ADD_TEMPORARY_WORKFLOWITEM_PERMISSION,
  ASSIGN_WORKFLOWITEM_SUCCESS,
  CREATE_WORKFLOW_SUCCESS,
  DEFAULT_WORKFLOW_EXCHANGERATE,
  DISABLE_WORKFLOW_EDIT,
  EDIT_WORKFLOW_ITEM_SUCCESS,
  ENABLE_BUDGET_EDIT,
  ENABLE_WORKFLOW_EDIT,
  FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
  FETCH_NEXT_SUBPROJECT_HISTORY_PAGE,
  FETCH_NEXT_SUBPROJECT_HISTORY_PAGE_SUCCESS,
  FETCH_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
  HIDE_SUBPROJECT_ASSIGNEES,
  HIDE_SUBPROJECT_CONFIRMATION_DIALOG,
  HIDE_WORKFLOWITEM_ADDITIONAL_DATA,
  HIDE_WORKFLOWITEM_CONFIRMATION_DIALOG,
  HIDE_WORKFLOWITEM_PERMISSIONS,
  HIDE_WORKFLOW_DETAILS,
  HIDE_WORKFLOW_DIALOG,
  HIDE_WORKFLOW_PREVIEW,
  OPEN_HISTORY,
  REMOVE_TEMPORARY_WORKFLOWITEM_PERMISSION,
  RESET_SUCCEEDED_WORKFLOWITEMS,
  REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
  SAVE_WORKFLOW_ITEM_BEFORE_SORT,
  SET_TOTAL_SUBPROJECT_HISTORY_ITEM_COUNT,
  SET_WORKFLOW_DRAWER_PERMISSIONS,
  SHOW_SUBPROJECT_ASSIGNEES,
  SHOW_SUBPROJECT_CONFIRMATION_DIALOG,
  SHOW_WORKFLOWITEM_ADDITIONAL_DATA,
  SHOW_WORKFLOWITEM_CONFIRMATION_DIALOG,
  SHOW_WORKFLOWITEM_PERMISSIONS,
  SHOW_WORKFLOW_CREATE,
  SHOW_WORKFLOW_DETAILS,
  SHOW_WORKFLOW_EDIT,
  SHOW_WORKFLOW_PREVIEW,
  STORE_WORKFLOWACTIONS,
  STORE_WORKFLOW_ASSIGNEE,
  SUBMIT_BATCH_FOR_WORKFLOW,
  SUBMIT_BATCH_FOR_WORKFLOW_FAILURE,
  SUBMIT_BATCH_FOR_WORKFLOW_SUCCESS,
  TRIGGER_SUBPROJECT_APPLY_ACTIONS,
  UPDATE_WORKFLOW_ORDER,
  WORKFLOWITEMS_SELECTED,
  WORKFLOW_AMOUNT,
  WORKFLOW_AMOUNT_TYPE,
  WORKFLOW_CREATION_STEP,
  WORKFLOW_CURRENCY,
  WORKFLOW_DOCUMENT,
  WORKFLOW_EXCHANGERATE,
  WORKFLOW_NAME,
  WORKFLOW_PURPOSE,
  WORKFLOW_STATUS
} from "./actions";

const historyPageSize = 50;

const defaultState = fromJS({
  id: "",
  displayName: "",
  description: "",
  status: "open",
  amount: 0,
  currency: "",
  projectedBudgets: [],
  created: 0,
  allowedIntents: [],
  workflowItems: [],
  workflowItemsBeforeSort: [],
  parentProject: {},
  workflowToAdd: {
    id: "",
    displayName: "",
    amount: "",
    exchangeRate: 1,
    amountType: "N/A",
    currency: "",
    description: "",
    status: "open",
    documents: []
  },
  showWorkflowPermissions: false,
  idsPermissionsUnassigned: [],
  workflowItemReference: "",
  workflowitemDisplayName: "",
  permissions: { project: {}, subproject: {}, workflowitem: {}, workflowitemId: "" },
  temporaryPermissions: {},
  creationDialogShown: false,
  showDetails: false,
  showDetailsItemId: "",
  showHistory: false,
  currentStep: 0,
  workflowSortEnabled: false,
  workflowType: "workflow",
  workflowApprovalRequired: true,
  subProjectBudgetEditEnabled: false,
  roles: [],
  historyItems: [],
  isHistoryLoading: false,
  totalHistoryItemCount: 0,
  historyPageSize: historyPageSize,
  currentHistoryPage: 0,
  lastHistoryPage: 1,
  showWorkflowAssignee: false,
  showSubProjectAssignee: false,
  editDialogShown: false,
  dialogTitle: strings.workflow.add_item,
  previewDialogShown: false,
  selectedWorkflowItems: [],
  tempDrawerPermissions: {},
  tempDrawerAssignee: "",
  workflowActions: {},
  submittedWorkflowItems: [],
  failedWorkflowItem: {},
  submitDone: false,
  submitInProgress: false,
  idForInfo: "",
  isWorkflowitemAdditionalDataShown: false,
  confirmation: {
    subproject: {
      visible: false,
      actions: [],
      assignee: { id: "", displayName: "" }
    },
    workflowitem: {
      visible: false,
      id: "",
      actions: [],
      assignee: { id: "", displayName: "" }
    }
  },
  isFetchingProjectPermissions: false,
  isFetchingSubProjectPermissions: false,
  isFetchingWorkflowitemPermissions: false,
  permittedToGrant: false,
  applyActions: true
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
        currency: subproject.data.currency,
        allowedIntents: fromJS(subproject.allowedIntents),
        assignee: fromJS(subproject.data.assignee),
        workflowItems: fromJS(workflowitems),
        parentProject: fromJS(parentProject),
        projectedBudgets: fromJS(subproject.data.projectedBudgets)
      });
    case SHOW_WORKFLOW_EDIT:
      return state.merge({
        workflowToAdd: state
          .getIn(["workflowToAdd"])
          .set("id", action.id)
          .set("displayName", action.displayName)
          .set("amount", action.amount)
          .set("exchangeRate", action.exchangeRate || state.getIn(["workflowToAdd", "exchangeRate"]))
          .set("amountType", action.amountType)
          .set("description", action.description)
          .set("currency", action.currency)
          .set("documents", fromJS(action.documents)),
        editDialogShown: true,
        dialogTitle: strings.workflow.edit_item
      });
    case ASSIGN_WORKFLOWITEM_SUCCESS:
      return state.updateIn(["submittedWorkflowItems"], workflowitems => [
        ...workflowitems,
        { id: action.workflowitemId, assignee: action.assignee }
      ]);
    case GRANT_WORKFLOWITEM_PERMISSION_SUCCESS:
      return state.updateIn(["submittedWorkflowItems"], workflowitems => [
        ...workflowitems,
        { id: action.workflowitemId, identity: action.identity, intent: action.intent }
      ]);
    case REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS:
      return state.updateIn(["submittedWorkflowItems"], workflowitems => [
        ...workflowitems,
        { id: action.workflowitemId, identity: action.identity, intent: action.intent }
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
        workflowItemReference: action.workflowitemId,
        workflowitemDisplayName: action.workflowitemDisplayName,
        permissions: defaultState.get("permissions"),
        temporaryPermissions: defaultState.getIn("temporaryPermissions"),
        showWorkflowPermissions: true,
        idsPermissionsUnassigned: state.get("idsPermissionsUnassigned").filter(id => id !== action.workflowitemId)
      });
    case HIDE_WORKFLOWITEM_PERMISSIONS:
    case CONFIRMATION_CONFIRMED:
      return state.merge({
        workflowItemReference: defaultState.getIn(["workflowItemReference"]),
        workflowitemDisplayName: defaultState.getIn(["workflowitemDisplayName"]),
        showWorkflowPermissions: defaultState.getIn(["showWorkflowPermissions"]),
        permissions: defaultState.getIn(["permissions"]),
        temporaryPermissions: defaultState.getIn("temporaryPermissions")
      });

    case SHOW_WORKFLOWITEM_ADDITIONAL_DATA:
      return state.merge({
        idForInfo: fromJS(action.wId),
        isWorkflowitemAdditionalDataShown: true
      });
    case HIDE_WORKFLOWITEM_ADDITIONAL_DATA:
      return state.set("isWorkflowitemAdditionalDataShown", false);
    case FETCH_PROJECT_PERMISSIONS:
      return state.set("isFetchingProjectPermissions", true);
    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "project"], fromJS(action.permissions))
        .set("isFetchingProjectPermissions", false);
    case FETCH_SUBPROJECT_PERMISSIONS:
      return state.set("isFetchingSubprojectPermissions", true);
    case FETCH_SUBPROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "subproject"], fromJS(action.permissions))
        .set("isFetchingSubprojectPermissions", false);
    case FETCH_WORKFLOWITEM_PERMISSIONS:
      return state
        .set("isFetchingWorkflowitemPermissions", true)
        .setIn(["permissions", "workflowitemId"], action.workflowitemId);
    case FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "workflowitem"], fromJS(action.permissions))
        .set("temporaryPermissions", fromJS(action.permissions))
        .set("isFetchingWorkflowitemPermissions", false);
    case WORKFLOW_CREATION_STEP:
      return state.set("currentStep", action.step);
    case WORKFLOW_NAME:
      return state.setIn(["workflowToAdd", "displayName"], action.name);
    case WORKFLOW_AMOUNT:
      return state.setIn(["workflowToAdd", "amount"], action.amount);
    case WORKFLOW_EXCHANGERATE:
      return state.setIn(["workflowToAdd", "exchangeRate"], action.exchangeRate);
    case WORKFLOW_AMOUNT_TYPE:
      return state.setIn(["workflowToAdd", "amountType"], action.amountType);
    case WORKFLOW_PURPOSE:
      return state.setIn(["workflowToAdd", "description"], action.description);
    case WORKFLOW_CURRENCY:
      return state.merge({
        workflowToAdd: state.getIn(["workflowToAdd"]).set("currency", action.currency)
      });
    case DEFAULT_WORKFLOW_EXCHANGERATE:
      return state.merge({
        workflowToAdd: state.getIn(["workflowToAdd"]).set("exchangeRate", 1)
      });
    case WORKFLOW_STATUS:
      return state.setIn(["workflowToAdd", "status"], action.status);
    case WORKFLOW_DOCUMENT:
      return state.updateIn(["workflowToAdd", "documents"], documents =>
        Immutable.List([...documents, Immutable.Map({ id: action.id, base64: action.base64 })])
      );
    case CREATE_WORKFLOW_SUCCESS:
      return state.updateIn(["idsPermissionsUnassigned"], workflowitems => [...workflowitems, action.workflowitemId]);
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
    case ENABLE_WORKFLOW_EDIT:
      return state.merge({
        workflowSortEnabled: true,
        submitDone: defaultState.get("submitDone")
      });
    case DISABLE_WORKFLOW_EDIT:
      return state.merge({
        workflowSortEnabled: defaultState.get("workflowSortEnabled"),
        selectedWorkflowItems: defaultState.get("selectedWorkflowItems"),
        tempDrawerPermissions: defaultState.get("tempDrawerPermissions"),
        tempDrawerAssignee: defaultState.get("tempDrawerAssignee"),
        workflowActions: defaultState.get("workflowActions"),
        submittedWorkflowItems: defaultState.get("submittedWorkflowItems")
      });
    case SUBMIT_BATCH_FOR_WORKFLOW_SUCCESS:
      return state.merge({
        submitDone: true,
        submitInProgress: defaultState.get("submitInProgress")
      });
    case SUBMIT_BATCH_FOR_WORKFLOW_FAILURE:
      return state.merge({
        failedWorkflowItem: {
          id: action.workflowitemId,
          assignee: action.assignee,
          identity: action.identity,
          intent: action.intent
        },
        submitDone: true,
        submitInProgress: defaultState.get("submitInProgress")
      });
    case SUBMIT_BATCH_FOR_WORKFLOW:
      return state.merge({
        submitInProgress: true
      });
    case SHOW_SUBPROJECT_CONFIRMATION_DIALOG:
      return state.merge({
        confirmation: {
          subproject: {
            visible: true,
            actions: fromJS(action.actions),
            assignee: fromJS(action.assignee)
          },
          workflowitem: defaultState.getIn(["confirmation", "workflowitem"])
        },
        permittedToGrant: action.permittedToGrant,
        applyActions: true
      });
    case HIDE_SUBPROJECT_CONFIRMATION_DIALOG:
      return state.set("confirmation", defaultState.get("confirmation"));
    case SHOW_WORKFLOWITEM_CONFIRMATION_DIALOG:
      return state.merge({
        confirmation: {
          subproject: defaultState.getIn(["confirmation", "subproject"]),
          workflowitem: {
            visible: true,
            id: action.id,
            actions: fromJS(action.actions),
            assignee: fromJS(action.assignee)
          }
        },
        permittedToGrant: action.permittedToGrant,
        applyActions: true
      });
    case HIDE_WORKFLOWITEM_CONFIRMATION_DIALOG:
      return state.set("confirmation", defaultState.get("confirmation"));
    case TRIGGER_SUBPROJECT_APPLY_ACTIONS:
      return state.set("applyActions", !state.get("applyActions"));
    case UPDATE_WORKFLOW_ORDER:
      return state.merge({
        workflowItems: fromJS(action.workflowItems)
      });
    case ENABLE_BUDGET_EDIT:
      return state.set("subProjectBudgetEditEnabled", action.budgetEditEnabled);
    case STORE_WORKFLOW_ASSIGNEE:
      return state.set("tempDrawerAssignee", action.assignee);
    case WORKFLOWITEMS_SELECTED:
      const getSelectedIds = action.workflowItems.map(x => x.data.id);
      return state.merge({
        selectedWorkflowItems: fromJS(action.workflowItems),
        idsPermissionsUnassigned: state.get("idsPermissionsUnassigned").filter(id => !getSelectedIds.includes(id))
      });
    case SHOW_SUBPROJECT_ASSIGNEES:
      return state.set("showSubProjectAssignee", true);
    case HIDE_SUBPROJECT_ASSIGNEES:
      return state.set("showSubProjectAssignee", false);
    case FETCH_NEXT_SUBPROJECT_HISTORY_PAGE:
      return state.set("isHistoryLoading", true);
    case FETCH_NEXT_SUBPROJECT_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: state.get("historyItems").concat(fromJS(action.events).reverse()),
        currentHistoryPage: action.currentHistoryPage,
        isHistoryLoading: false
      });
    case SET_TOTAL_SUBPROJECT_HISTORY_ITEM_COUNT:
      return state.merge({
        totalHistoryItemCount: action.totalHistoryItemsCount,
        lastHistoryPage: action.lastHistoryPage
      });
    case HIDE_HISTORY:
      return state.merge({
        historyItems: fromJS([]),
        showHistory: false,
        lastHistoryPage: defaultState.get("lastHistoryPage"),
        currentHistoryPage: defaultState.get("currentHistoryPage"),
        totalHistoryItemCount: defaultState.get("totalHistoryItemCount")
      });
    case STORE_WORKFLOWACTIONS:
      return state.set("workflowActions", fromJS(action.actions));
    case SHOW_WORKFLOW_PREVIEW:
      return state.merge({
        previewDialogShown: true,
        submittedWorkflowItems: defaultState.get("submittedWorkflowItems")
      });
    case HIDE_WORKFLOW_PREVIEW:
      return state.merge({
        previewDialogShown: defaultState.get("previewDialogShown"),
        submittedWorkflowItems: defaultState.get("submittedWorkflowItems")
      });
    case CONFIRMATION_CANCELLED:
      return state.set(
        "temporaryPermissions",
        !_isEmpty(action.permissions) && !_isEmpty(action.permissions.workflowitem)
          ? fromJS(action.permissions.workflowitem)
          : defaultState.get("temporaryPermissions")
      );
    case OPEN_HISTORY:
      return state.set("showHistory", true).set("isHistoryLoading", true);
    case ADD_TEMPORARY_WORKFLOWITEM_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users => users.push(action.userId));
    case REMOVE_TEMPORARY_WORKFLOWITEM_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users =>
        users.filter(user => user !== action.userId)
      );
    default:
      return state;
  }
}
