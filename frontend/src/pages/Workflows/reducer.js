// since Immutable can not be tree-shaked, we can simply import it in total to prevent nameclashes (e.g. map)
import Immutable, { fromJS } from "immutable";
import _isEmpty from "lodash/isEmpty";

import { convertToURLQuery } from "../../helper";
import strings from "../../localizeStrings";
import { CONFIRMATION_CANCELLED, CONFIRMATION_CONFIRMED } from "../Confirmation/actions";
import { DELETE_DOCUMENT_SUCCESS } from "../Documents/actions";
import { DISABLE_ALL_LIVE_UPDATES, ENABLE_ALL_LIVE_UPDATES } from "../Navbar/actions";
import { HIDE_HISTORY } from "../Notifications/actions";
import { FETCH_PROJECT_PERMISSIONS, FETCH_PROJECT_PERMISSIONS_SUCCESS } from "../Overview/actions";
import { FETCH_SUBPROJECT_PERMISSIONS, FETCH_SUBPROJECT_PERMISSIONS_SUCCESS } from "../SubProjects/actions";

import {
  ADD_TEMPORARY_WORKFLOWITEM_PERMISSION,
  ADD_WORKFLOWITEM_TAG,
  ASSIGN_WORKFLOWITEM_SUCCESS,
  CLEAR_REJECT_REASON,
  CREATE_WORKFLOW_SUCCESS,
  DEFAULT_WORKFLOW_EXCHANGERATE,
  DELETE_WORKFLOW_DOCUMENT,
  DELETE_WORKFLOW_DOCUMENT_EXTERNAL_LINK,
  DISABLE_LIVE_UPDATES_SUBPROJECT,
  DISABLE_WORKFLOW_EDIT,
  EDIT_WORKFLOW_ITEM_SUCCESS,
  ENABLE_BUDGET_EDIT,
  ENABLE_LIVE_UPDATES_SUBPROJECT,
  ENABLE_WORKFLOW_EDIT,
  FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS,
  FETCH_FIRST_SUBPROJECT_HISTORY_PAGE,
  FETCH_FIRST_SUBPROJECT_HISTORY_PAGE_SUCCESS,
  FETCH_NEXT_SUBPROJECT_HISTORY_PAGE,
  FETCH_NEXT_SUBPROJECT_HISTORY_PAGE_SUCCESS,
  FETCH_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
  FETCH_WORKFLOWITEM_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
  HIDE_REASON_DIALOG,
  HIDE_SUBPROJECT_ASSIGNEES,
  HIDE_SUBPROJECT_CONFIRMATION_DIALOG,
  HIDE_WORKFLOW_DETAILS,
  HIDE_WORKFLOW_DIALOG,
  HIDE_WORKFLOW_PREVIEW,
  HIDE_WORKFLOWITEM_ADDITIONAL_DATA,
  HIDE_WORKFLOWITEM_CONFIRMATION_DIALOG,
  HIDE_WORKFLOWITEM_PERMISSIONS,
  OPEN_HISTORY,
  REMOVE_TEMPORARY_WORKFLOWITEM_PERMISSION,
  REMOVE_WORKFLOWITEM_TAG,
  RESET_SUCCEEDED_WORKFLOWITEMS,
  REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
  SAVE_WORKFLOW_ITEM_BEFORE_SORT,
  SEARCH_TAGS_WORKFLOWITEM,
  SEARCH_TERM_WORKFLOWITEM,
  SET_TOTAL_SUBPROJECT_HISTORY_ITEM_COUNT,
  SET_WORKFLOW_DRAWER_PERMISSIONS,
  SHOW_REASON_DIALOG,
  SHOW_SUBPROJECT_ASSIGNEES,
  SHOW_SUBPROJECT_CONFIRMATION_DIALOG,
  SHOW_WORKFLOW_CREATE,
  SHOW_WORKFLOW_EDIT,
  SHOW_WORKFLOW_PREVIEW,
  SHOW_WORKFLOWITEM_ADDITIONAL_DATA,
  SHOW_WORKFLOWITEM_CONFIRMATION_DIALOG,
  SHOW_WORKFLOWITEM_PERMISSIONS,
  STORE_FILTERED_WORKFLOWITEMS,
  STORE_REJECT_REASON,
  STORE_WORKFLOW_BATCH_ASSIGNEE,
  STORE_WORKFLOWACTIONS,
  SUBMIT_BATCH_FOR_WORKFLOW,
  SUBMIT_BATCH_FOR_WORKFLOW_FAILURE,
  SUBMIT_BATCH_FOR_WORKFLOW_SUCCESS,
  TRIGGER_SUBPROJECT_APPLY_ACTIONS,
  UPDATE_WORKFLOW_ORDER,
  WORKFLOW_AMOUNT,
  WORKFLOW_AMOUNT_TYPE,
  WORKFLOW_ASSIGNEE,
  WORKFLOW_CREATION_STEP,
  WORKFLOW_CURRENCY,
  WORKFLOW_DOCUMENT,
  WORKFLOW_DOCUMENT_EXTERNAL_LINK,
  WORKFLOW_DUEDATE,
  WORKFLOW_EXCHANGERATE,
  WORKFLOW_FUNDING_ORGANIZATION,
  WORKFLOW_MARKDOWN,
  WORKFLOW_NAME,
  WORKFLOW_PURPOSE,
  WORKFLOW_SEARCH_BAR_DISPLAYED,
  WORKFLOW_STATUS,
  WORKFLOW_STORE_SEARCH_TERMS_AS_ARRAY,
  WORKFLOW_TEMPLATE,
  WORKFLOWITEM_TYPE,
  WORKFLOWITEMS_BULK_ACTION,
  WORKFLOWITEMS_SELECTED
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
  workflowitemsBulkAction: "",
  workflowItemsBeforeSort: [],
  parentProject: {},
  workflowToAdd: {
    id: "",
    displayName: "",
    amount: "",
    dueDate: null,
    exchangeRate: 1,
    amountType: "N/A",
    currency: "",
    description: "",
    status: "open",
    documents: [],
    workflowitemType: "general",
    assignee: "",
    tags: [],
    fundingOrganization: "",
    markdown: ""
  },
  showWorkflowPermissions: false,
  idsPermissionsUnassigned: [],
  workflowItemReference: "",
  workflowitemDisplayName: "",
  permissions: { project: {}, subproject: {}, workflowitem: {}, workflowitemId: "" },
  temporaryPermissions: {},
  creationDialogShown: false,
  showDetails: false,
  worflowDetailsInitialTab: 0,
  showDetailsItem: {},
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
  applyActions: true,
  isLiveUpdatesSubprojectEnabled: true,
  subprojectValidator: "",
  hasSubprojectValidator: false,
  fixedWorkflowitemType: "",
  hasFixedWorkflowitemType: false,
  rejectReason: "",
  isRejectReasonDialogShown: false,
  workflowTemplate: "",
  workflowMode: "ordered",
  filteredWorkflowitems: [],
  searchTerm: "",
  searchOnlyTags: false,
  searchTerms: [],
  searchBarDisplayed: true
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS: {
      const { subproject, workflowitems, parentProject } = action;
      return state.merge({
        allowedIntents: fromJS(subproject.allowedIntents),
        assignee: fromJS(subproject.data.assignee),
        created: subproject.data.creationUnixTs,
        currency: subproject.data.currency,
        description: subproject.data.description,
        displayName: subproject.data.displayName,
        filteredWorkflowitems: fromJS(workflowitems),
        fixedWorkflowitemType: subproject.data.workflowitemType,
        hasFixedWorkflowitemType: subproject.data.workflowitemType ? true : false,
        hasSubprojectValidator: subproject.data.validator ? true : false,
        id: subproject.data.id,
        parentProject: fromJS(parentProject),
        projectedBudgets: fromJS(subproject.data.projectedBudgets),
        status: subproject.data.status,
        subprojectValidator: subproject.data.validator,
        workflowItems: fromJS(workflowitems),
        workflowMode: subproject.data.workflowMode
      });
    }
    case FETCH_WORKFLOWITEM_SUCCESS: {
      return state.merge({
        showDetails: true,
        showDetailsItem: action.workflowitem,
        worflowDetailsInitialTab: action.worflowDetailsInitialTab
      });
    }
    case HIDE_WORKFLOW_DETAILS:
      return state.merge({
        showDetails: false,
        showDetailsItem: defaultState.get("showDetailsItem")
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
          .set("documents", fromJS(action.documents))
          .set("dueDate", action.dueDate)
          .set("workflowitemType", action.workflowitemType)
          .set("tags", action.tags)
          .set("fundingOrganization", action.fundingOrganization)
          .set("markdown", action.markdown),
        editDialogShown: true,
        dialogTitle: strings.workflow.edit_item
      });
    case ASSIGN_WORKFLOWITEM_SUCCESS:
      return state.updateIn(["submittedWorkflowItems"], (workflowitems) => [
        ...workflowitems,
        { id: action.workflowitemId, assignee: action.assignee }
      ]);
    case GRANT_WORKFLOWITEM_PERMISSION_SUCCESS:
      return state.updateIn(["submittedWorkflowItems"], (workflowitems) => [
        ...workflowitems,
        { id: action.workflowitemId, identity: action.identity, intent: action.intent }
      ]);
    case REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS:
      return state.updateIn(["submittedWorkflowItems"], (workflowitems) => [
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
        temporaryPermissions: defaultState.get("temporaryPermissions"),
        showWorkflowPermissions: true,
        idsPermissionsUnassigned: state.get("idsPermissionsUnassigned").filter((id) => id !== action.workflowitemId)
      });
    case HIDE_WORKFLOWITEM_PERMISSIONS:
    case CONFIRMATION_CONFIRMED:
      return state.merge({
        workflowItemReference: defaultState.getIn(["workflowItemReference"]),
        workflowitemDisplayName: defaultState.getIn(["workflowitemDisplayName"]),
        showWorkflowPermissions: defaultState.getIn(["showWorkflowPermissions"]),
        permissions: defaultState.getIn(["permissions"]),
        temporaryPermissions: defaultState.get("temporaryPermissions")
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
    case WORKFLOW_ASSIGNEE:
      return state.setIn(["workflowToAdd", "assignee"], action.assignee);
    case WORKFLOW_AMOUNT:
      return state.setIn(["workflowToAdd", "amount"], action.amount);
    case WORKFLOW_EXCHANGERATE:
      return state.setIn(["workflowToAdd", "exchangeRate"], action.exchangeRate);
    case WORKFLOW_AMOUNT_TYPE:
      return state.setIn(["workflowToAdd", "amountType"], action.amountType);
    case WORKFLOW_PURPOSE:
      return state.setIn(["workflowToAdd", "description"], action.description);
    case WORKFLOW_DUEDATE:
      return state.setIn(["workflowToAdd", "dueDate"], action.dueDate);
    case WORKFLOW_CURRENCY:
      return state.merge({
        workflowToAdd: state.getIn(["workflowToAdd"]).set("currency", action.currency)
      });
    case WORKFLOW_FUNDING_ORGANIZATION:
      return state.setIn(["workflowToAdd", "fundingOrganization"], action.fundingOrganization);
    case DEFAULT_WORKFLOW_EXCHANGERATE:
      return state.merge({
        workflowToAdd: state.getIn(["workflowToAdd"]).set("exchangeRate", 1)
      });
    case WORKFLOW_STATUS:
      return state.setIn(["workflowToAdd", "status"], action.status);
    case WORKFLOW_MARKDOWN: {
      return state.setIn(["workflowToAdd", "markdown"], action.markdown);
    }
    case WORKFLOW_DOCUMENT:
      return state.updateIn(["workflowToAdd", "documents"], (documents) =>
        Immutable.List([
          ...documents,
          Immutable.Map({ base64: action.base64, fileName: action.fileName, comment: action.comment })
        ])
      );
    case WORKFLOW_DOCUMENT_EXTERNAL_LINK:
      return state.updateIn(["workflowToAdd", "documents"], (documents) =>
        Immutable.List([
          ...documents,
          Immutable.Map({
            link: action.link,
            fileName: action.fileName,
            linkedFileHash: action.linkedFileHash,
            comment: action.comment
          })
        ])
      );
    case DELETE_WORKFLOW_DOCUMENT_EXTERNAL_LINK:
      return state.updateIn(["workflowToAdd", "documents"], (documents) =>
        documents.filter((item) => item.get("linkedFileHash") !== action.linkedFileHash)
      );
    case DELETE_WORKFLOW_DOCUMENT:
      return state.updateIn(["workflowToAdd", "documents"], (documents) =>
        documents.filter((item) => item.get("base64") !== action.base64)
      );
    case WORKFLOWITEM_TYPE:
      return state.setIn(["workflowToAdd", "workflowitemType"], action.workflowitemType);
    case CREATE_WORKFLOW_SUCCESS:
      return state.updateIn(["idsPermissionsUnassigned"], (workflowitems) => [...workflowitems, action.workflowitemId]);
    case EDIT_WORKFLOW_ITEM_SUCCESS:
      return state.merge({
        workflowToAdd: defaultState.getIn(["workflowToAdd"])
      });
    case SET_WORKFLOW_DRAWER_PERMISSIONS:
      return state.set("tempDrawerPermissions", fromJS(action.permissions));
    case SAVE_WORKFLOW_ITEM_BEFORE_SORT:
      return state.set("workflowItemsBeforeSort", fromJS(action.workflowItems));
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
      return state
        .merge({
          workflowItems: fromJS(action.workflowItems)
        })
        .set("filteredWorkflowitems", fromJS(action.workflowItems));
    case ENABLE_BUDGET_EDIT:
      return state.set("subProjectBudgetEditEnabled", action.budgetEditEnabled);
    case STORE_WORKFLOW_BATCH_ASSIGNEE:
      return state.set("tempDrawerAssignee", action.tempDrawerAssignee);
    case WORKFLOWITEMS_SELECTED: {
      const getSelectedIds = action.workflowItems.map((x) => x.data.id);
      return state.merge({
        selectedWorkflowItems: fromJS(action.workflowItems),
        idsPermissionsUnassigned: state.get("idsPermissionsUnassigned").filter((id) => !getSelectedIds.includes(id))
      });
    }
    case WORKFLOWITEMS_BULK_ACTION:
      return state.set("workflowitemsBulkAction", action.bulkActionType);
    case SHOW_SUBPROJECT_ASSIGNEES:
      return state.set("showSubProjectAssignee", true);
    case HIDE_SUBPROJECT_ASSIGNEES:
      return state.set("showSubProjectAssignee", false);
    case FETCH_FIRST_SUBPROJECT_HISTORY_PAGE:
    case FETCH_NEXT_SUBPROJECT_HISTORY_PAGE:
      return state.set("isHistoryLoading", true);
    case FETCH_NEXT_SUBPROJECT_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: state.get("historyItems").concat(fromJS(action.events).reverse()),
        currentHistoryPage: action.currentHistoryPage,
        isHistoryLoading: false
      });
    case FETCH_FIRST_SUBPROJECT_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: fromJS(action.events).reverse(),
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
      return state.updateIn(["temporaryPermissions", action.permission], (users) => users.push(action.userId));
    case REMOVE_TEMPORARY_WORKFLOWITEM_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], (users) =>
        users.filter((user) => user !== action.userId)
      );
    case DISABLE_ALL_LIVE_UPDATES:
    case DISABLE_LIVE_UPDATES_SUBPROJECT:
      return state.set("isLiveUpdatesSubprojectEnabled", false);
    case ENABLE_ALL_LIVE_UPDATES:
    case ENABLE_LIVE_UPDATES_SUBPROJECT:
      return state.set("isLiveUpdatesSubprojectEnabled", true);
    case STORE_REJECT_REASON:
      return state.set("rejectReason", action.rejectReason);
    case CLEAR_REJECT_REASON:
      return state.set("rejectReason", "");
    case SHOW_REASON_DIALOG:
      return state.merge({
        isRejectReasonDialogShown: true,
        rejectReason: action.rejectReason
      });
    case HIDE_REASON_DIALOG:
      return state.merge({
        isRejectReasonDialogShown: false,
        rejectReason: ""
      });
    case WORKFLOW_TEMPLATE:
      return state.setIn(["workflowTemplate"], action.workflowTemplate);
    case ADD_WORKFLOWITEM_TAG: {
      const tags = state.getIn(["workflowToAdd", "tags"]) || [];
      if (!tags.some((tag) => tag === action.tag)) {
        return state.setIn(["workflowToAdd", "tags"], [...tags, action.tag]);
      }
      return state;
    }
    case REMOVE_WORKFLOWITEM_TAG: {
      const tags = state.getIn(["workflowToAdd", "tags"]);
      return state.setIn(
        ["workflowToAdd", "tags"],
        tags.filter((tag) => tag !== action.tag)
      );
    }
    case SEARCH_TERM_WORKFLOWITEM: {
      const querySearchTerm = convertToURLQuery(action.searchTerm);
      window.history.replaceState("", "Title", "?" + querySearchTerm);
      return state.set("searchTerm", action.searchTerm);
    }
    case WORKFLOW_SEARCH_BAR_DISPLAYED:
      return state.merge({
        searchTerms: defaultState.get("searchTerms"),
        searchBarDisplayed: action.searchBarDisplayed
      });
    case STORE_FILTERED_WORKFLOWITEMS: {
      return state.set("filteredWorkflowitems", fromJS(action.filteredWorkflowitems));
    }
    case WORKFLOW_STORE_SEARCH_TERMS_AS_ARRAY:
      return state.set("searchTerms", fromJS(action.searchTerms));
    case SEARCH_TAGS_WORKFLOWITEM: {
      return state.set("searchOnlyTags", action.tagsOnly);
    }
    case DELETE_DOCUMENT_SUCCESS: {
      const filteredShowDetailsDocuments = state
        .getIn(["showDetailsItem", "data", "documents"], Immutable.List())
        .filter((doc) => doc.id !== action.payload.documentId);

      const filteredWorkflowToAddDocuments = state
        .getIn(["workflowToAdd", "documents"])
        .toJS()
        .filter((doc) => doc.id !== action.payload.documentId);

      return state
        .setIn(["showDetailsItem", "data", "documents"], Immutable.List(filteredShowDetailsDocuments))
        .setIn(["workflowToAdd", "documents"], Immutable.List(filteredWorkflowToAddDocuments));
    }
    default:
      return state;
  }
}
