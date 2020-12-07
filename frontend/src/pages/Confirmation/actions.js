export const CONFIRMATION_REQUIRED = "CONFIRMATION_REQUIRED";
export const CONFIRMATION_CONFIRMED = "CONFIRMATION_CONFIRMED";
export const CONFIRMATION_CANCELLED = "CONFIRMATION_CANCELLED";
export const STORE_ACTIONS = "STORE_ACTIONS";
export const STORE_POST_ACTIONS = "STORE_POST_ACTIONS";
export const STORE_REQUESTED_PERMISSIONS = "STORE_REQUESTED_PERMISSIONS";
export const EXECUTE_CONFIRMED_ACTIONS = "EXECUTE_CONFIRMED_ACTIONS";
export const EXECUTE_CONFIRMED_ACTIONS_FAILURE = "EXECUTE_CONFIRMED_ACTIONS_FAILURE";
export const EXECUTE_CONFIRMED_ACTIONS_SUCCESS = "EXECUTE_CONFIRMED_ACTIONS_SUCCESS";
export const ACTION_UPDATE_REQUIRED = "ACTION_UPDATE_REQUIRED";
export const VALIDATION_ERROR_MESSAGE = "VALIDATION_ERROR_MESSAGE";
export const VALIDATION_ERROR_MESSAGE_RESET = "VALIDATION_ERROR_MESSAGE_RESET";

// permissions = tempPermissions in Permissionsdialog before confirmation
// permissiondialogs can rebuild temporary permission state
export function cancelConfirmation(permissions) {
  return {
    type: CONFIRMATION_CANCELLED,
    permissions
  };
}

export function confirmConfirmation() {
  return {
    type: CONFIRMATION_CONFIRMED
  };
}

export function additionalActionUpdateRequired(required) {
  return {
    type: ACTION_UPDATE_REQUIRED,
    required
  };
}

export function storeAdditionalActions(actions) {
  return {
    type: STORE_ACTIONS,
    actions
  };
}

export function storePostActions(actions) {
  return {
    type: STORE_POST_ACTIONS,
    actions
  };
}

export function storeRequestedPermissions(permissions) {
  return {
    type: STORE_REQUESTED_PERMISSIONS,
    permissions
  };
}

export function showValidationErrorMessage() {
  return { type: VALIDATION_ERROR_MESSAGE };
}

export function executeAdditionalActions(actions, projectId = "", subprojectId = "", showLoading = false) {
  return {
    type: EXECUTE_CONFIRMED_ACTIONS,
    actions,
    projectId,
    subprojectId,
    showLoading
  };
}
