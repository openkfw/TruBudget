import { fromJS } from "immutable";
import {
  FETCH_PROJECT_PERMISSIONS,
  FETCH_PROJECT_PERMISSIONS_FAILURE,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  GRANT_PROJECT_PERMISSION_SUCCESS,
  REVOKE_PROJECT_PERMISSION_SUCCESS,
  GRANT_PROJECT_PERMISSION_FAILURE,
  REVOKE_PROJECT_PERMISSION_FAILURE
} from "../Overview/actions";
import {
  ASSIGN_PROJECT_SUCCESS,
  ASSIGN_PROJECT_FAILURE,
  CLOSE_PROJECT_SUCCESS,
  CLOSE_PROJECT_FAILURE,
  FETCH_SUBPROJECT_PERMISSIONS,
  FETCH_SUBPROJECT_PERMISSIONS_FAILURE,
  GRANT_SUBPROJECT_PERMISSION_FAILURE,
  REVOKE_SUBPROJECT_PERMISSION_FAILURE,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  GRANT_SUBPROJECT_PERMISSION_SUCCESS,
  REVOKE_SUBPROJECT_PERMISSION_SUCCESS
} from "../SubProjects/actions";
import {
  ASSIGN_SUBPROJECT_SUCCESS,
  ASSIGN_WORKFLOWITEM_SUCCESS,
  ASSIGN_SUBPROJECT_FAILURE,
  ASSIGN_WORKFLOWITEM_FAILURE,
  CLOSE_SUBPROJECT_SUCCESS,
  CLOSE_WORKFLOWITEM_SUCCESS,
  CLOSE_SUBPROJECT_FAILURE,
  CLOSE_WORKFLOWITEM_FAILURE,
  FETCH_WORKFLOWITEM_PERMISSIONS,
  FETCH_WORKFLOWITEM_PERMISSIONS_FAILURE,
  FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION_SUCCESS,
  REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS,
  GRANT_WORKFLOWITEM_PERMISSION_FAILURE,
  REVOKE_WORKFLOWITEM_PERMISSION_FAILURE,
  CREATE_WORKFLOW_SUCCESS,
  CREATE_WORKFLOW
} from "../Workflows/actions";
import { DISABLE_USER_SUCCESS, ENABLE_USER_SUCCESS, ENABLE_USER_FAILURE, DISABLE_USER_FAILURE } from "../Users/actions";
import {
  ACTION_UPDATE_REQUIRED,
  CONFIRMATION_CANCELLED,
  CONFIRMATION_CONFIRMED,
  CONFIRMATION_FINISHED,
  CONFIRMATION_REQUIRED,
  EXECUTE_CONFIRMED_ADDITIONAL_ACTIONS,
  EXECUTE_CONFIRMED_ADDITIONAL_ACTIONS_FAILURE,
  EXECUTE_CONFIRMED_ADDITIONAL_ACTIONS_SUCCESS,
  EXECUTING_ORIGINAL_ACTIONS,
  EXECUTING_ORIGINAL_ACTIONS_FAILURE,
  EXECUTING_ORIGINAL_ACTIONS_SUCCESS,
  EXECUTE_CONFIRMED_POST_ACTIONS,
  EXECUTE_CONFIRMED_POST_ACTIONS_FAILURE,
  EXECUTE_CONFIRMED_POST_ACTIONS_SUCCESS,
  STORE_ACTIONS,
  STORE_POST_ACTIONS,
  STORE_REQUESTED_PERMISSIONS,
  VALIDATION_ERROR_MESSAGE_RESET
} from "./actions";

import { validate } from "./validation";

// original Actions = intents the user has actually requested
// additional Actions = view/list permission intents which are required to execute all original actions
const defaultState = fromJS({
  open: false,
  project: { listPermissionsNeeded: false },
  subproject: { listPermissionsNeeded: false },
  workflowitem: { listPermissionsNeeded: false },
  permissions: { project: {}, subproject: {}, workflowitem: {} },
  isFetchingProjectPermissions: false,
  isFetchingSubprojectPermissions: false,
  isFetchingWorkflowitemPermissions: false,
  confirmed: undefined,
  originalActions: [],
  executedOriginalActions: [],
  originalActionsIncreased: false,
  additionalActions: [],
  postActions: [],
  executedAdditionalActions: [],
  additionalActionsExecuted: false,
  executingAdditionalActions: false,
  isListPermissionsRequiredFromApi: false,
  failedAction: {},
  requestedPermissions: {},
  isPayloadValidationFailed: false,
  postActionsExecuted: false,
  executingPostActions: false,
  executedPostActions: [],
  failedPostAction: [],
  originalActionsExecuted: false,
  executingOriginalActions: false,
  failedOriginalAction: []
});

export default function confirmationReducer(state = defaultState, action) {
  switch (action.type) {
    case CONFIRMATION_REQUIRED:
      const { project, subproject, workflowitem } = action.payload;
      const isPayloadValidationFailed = validate(action.intent, action.payload);
      if (isPayloadValidationFailed) {
        return state.merge({ isPayloadValidationFailed });
      }
      return state.merge({
        open: true,
        confirmed: false,
        originalActions: state
          .updateIn(["originalActions"], intent => [
            ...intent,
            {
              intent: action.intent,
              ...action
              // permission: action.permission,
              // identity: action.identity,
              // displayName: action.displayName,
              // id: action.id,
              // payload: action.payload
            }
          ])
          .get("originalActions"),
        project: project || defaultState.get("project"),
        subproject: subproject || defaultState.get("subproject"),
        workflowitem: workflowitem || defaultState.get("workflowitem"),
        permissions: defaultState.get("permissions")
      });
    case CONFIRMATION_CONFIRMED:
      return state.set("confirmed", true).set("open", true);
    case CONFIRMATION_FINISHED:
      return defaultState.set("confirmed", false).set("open", false);
    case VALIDATION_ERROR_MESSAGE_RESET: {
      return defaultState.set("isPayloadValidationFailed", false);
    }
    case FETCH_PROJECT_PERMISSIONS:
      return state.set("isFetchingProjectPermissions", true);
    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "project"], action.permissions)
        .set("isFetchingProjectPermissions", defaultState.get("isFetchingProjectPermissions"));
    case FETCH_SUBPROJECT_PERMISSIONS:
      return state.set("isFetchingSubprojectPermissions", true);
    case FETCH_SUBPROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "subproject"], action.permissions)
        .set("isFetchingSubprojectPermissions", defaultState.get("isFetchingSubprojectPermissions"));
    case FETCH_WORKFLOWITEM_PERMISSIONS:
      return state
        .set("isFetchingWorkflowitemPermissions", true)
        .setIn(["permissions", "workflowitemId"], action.workflowitemId);
    case FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "workflowitem"], action.permissions)
        .set("isFetchingWorkflowitemPermissions", defaultState.get("isFetchingWorkflowitemPermissions"));
    case ACTION_UPDATE_REQUIRED:
      return state.set("originalActionsIncreased", action.required);

    case EXECUTE_CONFIRMED_ADDITIONAL_ACTIONS:
      return state.set("executingAdditionalActions", true);
    case EXECUTE_CONFIRMED_ADDITIONAL_ACTIONS_SUCCESS:
      return state.set("additionalActionsExecuted", true).set("executingAdditionalActions", false);
    case EXECUTE_CONFIRMED_ADDITIONAL_ACTIONS_FAILURE:
      return state
        .set("additionalActionsExecuted", true)
        .set("executingAdditionalActions", false)
        .set("failedAction", {
          id: action.id,
          displayName: action.displayName,
          identity: action.identity,
          intent: action.intent,
          permission: action.permission
        });

    case EXECUTING_ORIGINAL_ACTIONS:
      return state.set("executingOriginalActions", true);
    case EXECUTING_ORIGINAL_ACTIONS_SUCCESS:
      console.log(action);
      return state
        .set("originalActionsExecuted", true)
        .set("executingOriginalActions", false)
        .set("executedOriginalActions", [
          ...state.get("executedOriginalActions"),
          {
            id: action.id,
            displayName: action.displayName,
            identity: action.identity,
            intent: action.intent,
            permission: action.permission
          }
        ]);
    case EXECUTING_ORIGINAL_ACTIONS_FAILURE:
      return state
        .set("originalActionsExecuted", true)
        .set("executingOriginalActions", false)
        .set("failedOriginalAction", {
          id: action.id,
          displayName: action.displayName,
          identity: action.identity,
          intent: action.intent,
          permission: action.permission
        });

    case EXECUTE_CONFIRMED_POST_ACTIONS:
      return state.set("executingPostActions", true);
    case EXECUTE_CONFIRMED_POST_ACTIONS_SUCCESS:
      return state.set("postActionsExecuted", true).set("executingPostActions", false);
    case EXECUTE_CONFIRMED_POST_ACTIONS_FAILURE:
      return state
        .set("postActionsExecuted", true)
        .set("executingPostActions", false)
        .set("failedPostAction", {
          id: action.id,
          displayName: action.displayName,
          identity: action.identity,
          intent: action.intent,
          permission: action.permission
        });

    case STORE_ACTIONS:
      return state.set("additionalActions", fromJS(action.actions));
    case STORE_POST_ACTIONS:
      return state.set("postActions", fromJS(action.actions));
    case ASSIGN_PROJECT_SUCCESS:
    case ASSIGN_SUBPROJECT_SUCCESS:
    case ASSIGN_WORKFLOWITEM_SUCCESS:
    case CLOSE_PROJECT_SUCCESS:
    case CLOSE_SUBPROJECT_SUCCESS:
    case CLOSE_WORKFLOWITEM_SUCCESS:
    case GRANT_PROJECT_PERMISSION_SUCCESS:
    case REVOKE_PROJECT_PERMISSION_SUCCESS:
    case GRANT_SUBPROJECT_PERMISSION_SUCCESS:
    case REVOKE_SUBPROJECT_PERMISSION_SUCCESS:
    case GRANT_WORKFLOWITEM_PERMISSION_SUCCESS:
    case REVOKE_WORKFLOWITEM_PERMISSION_SUCCESS:
    case ENABLE_USER_SUCCESS:
    case DISABLE_USER_SUCCESS:
    case CREATE_WORKFLOW_SUCCESS:
      let updatedExecutedActions, executedActionsType;
      // If action is an additional view permission action add it to "executingAdditionalActions" state
      if (state.get("executingAdditionalActions") === true) {
        executedActionsType = "executedAdditionalActions";
        updatedExecutedActions = state
          .updateIn([executedActionsType], executedActions => [
            ...executedActions,
            { intent: action.intent, id: action.id, identity: action.identity, permission: action.permission }
          ])
          .get(executedActionsType);
      } else if (state.get("executingPostActions") === true) {
        // If action is an post action add it to "executedPostActions" state
        executedActionsType = "executedPostActions";
        updatedExecutedActions = state
          .updateIn([executedActionsType], executedActions => [
            ...executedActions,
            { intent: action.intent, id: action.id, identity: action.identity, permission: action.permission }
          ])
          .get(executedActionsType);
      }
      return state.set(executedActionsType, updatedExecutedActions);

    case FETCH_PROJECT_PERMISSIONS_FAILURE:
    case FETCH_SUBPROJECT_PERMISSIONS_FAILURE:
    case FETCH_WORKFLOWITEM_PERMISSIONS_FAILURE:
      if (action.message === "Request failed with status code 403")
        return state.set("isListPermissionsRequiredFromApi", true);
      return state;
    case STORE_REQUESTED_PERMISSIONS:
      return state.set("requestedPermissions", action.permissions);
    case CONFIRMATION_CANCELLED:
      return defaultState;
    case ASSIGN_PROJECT_FAILURE:
    case ASSIGN_SUBPROJECT_FAILURE:
    case ASSIGN_WORKFLOWITEM_FAILURE:
    case CLOSE_PROJECT_FAILURE:
    case CLOSE_SUBPROJECT_FAILURE:
    case CLOSE_WORKFLOWITEM_FAILURE:
    case GRANT_PROJECT_PERMISSION_FAILURE:
    case GRANT_WORKFLOWITEM_PERMISSION_FAILURE:
    case GRANT_SUBPROJECT_PERMISSION_FAILURE:
    case REVOKE_PROJECT_PERMISSION_FAILURE:
    case REVOKE_SUBPROJECT_PERMISSION_FAILURE:
    case REVOKE_WORKFLOWITEM_PERMISSION_FAILURE:
    case ENABLE_USER_FAILURE:
    case DISABLE_USER_FAILURE:
      return defaultState.set("open", true);

    default:
      return state;
  }
}
