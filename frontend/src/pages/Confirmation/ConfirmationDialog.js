import { Button, CircularProgress, DialogActions, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/core/styles";
import _isEmpty from "lodash/isEmpty";
import React, { useEffect, useState } from "react";

import { formatString, hasUserAssignments, isEmptyDeep, isUserOrGroupPermitted } from "../../helper";
import { createContent, createCloseTexts, createToggleUserContent } from "./confirmationDialogContentCreator";
import strings from "../../localizeStrings";
import DialogButtons from "./DialogButtons";
import ErrorTypography from "./ErrorTypography";

const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible",
    maxWidth: "800px"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "top",
    justifyContent: "center",
    marginRight: "50px"
  },
  loadingIndicator: {
    display: "inline-block",
    position: "relative",
    padding: "50px"
  },
  dialogContent: {
    paddingBottom: "0px"
  }
};

// Implement a new confirmation dialog by setting  title, content and confirmButtonText
const ConfirmationDialog = props => {
  const {
    classes,
    open = false,
    permissions,
    confirmingUser,
    groups,
    executedAdditionalActions,
    additionalActions,
    originalActions,
    requestedPermissions,
    onCancel,
    isListPermissionsRequiredFromApi,
    isFetchingPermissions,
    enabledUsers,
    disabledUsers,
    fetchUserAssignments,
    cleanUserAssignments,
    userAssignments,
    postActions,
    failedAction,
    additionalActionsExecuted,
    executingAdditionalActions,
    failedPostAction,
    postActionsExecuted,
    executingPostActions,
    executedPostActions,
    executeAllActions,
    executedOriginalActions,
    executingOriginalActions,
    originalActionsExecuted,
    failedOriginalAction
  } = props;

  const [hasAssignments, setHasAssignments] = useState(true);
  useEffect(() => {
    setHasAssignments(hasUserAssignments(userAssignments));
  }, [userAssignments]);

  // If permissions are not fetched yet show Loading indicator
  if (isFetchingPermissions) {
    return buildDialogWithLoadingIndicator(
      classes,
      open,
      isListPermissionsRequiredFromApi,
      onCancel,
      requestedPermissions
    );
  }

  let title = strings.confirmation.confirmation_required;
  let content = null;
  let confirmButtonText = strings.common.confirm;

  const permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);
  const marginTop = additionalActionsExist(additionalActions) ? { marginTop: "28px" } : {};
  const actionTableData = {
    originalActions,
    executedOriginalActions,
    executingOriginalActions,
    additionalActions,
    executedAdditionalActions,
    executingAdditionalActions,
    postActions,
    executingPostActions,
    executedPostActions,
    failedAction,
    failedPostAction,
    failedOriginalAction,
    enabledUsers,
    groups
  };

  for(const originalAction of originalActions){
    const intent = originalAction.intent;
    content = null;

    // Payload is defined by the saga which triggers the CONFIRM_INTENT-action
    switch (intent) {
      case "project.assign":
      case "subproject.assign":
      case "workflowitem.assign":
      case "project.createSubproject":
      case "subproject.createWorkflowitem":
      case "project.intent.grantPermission":
      case "project.intent.revokePermission":
      case "subproject.intent.grantPermission":
      case "subproject.intent.revokePermission":
      case "workflowitem.intent.grantPermission":
      case "workflowitem.intent.revokePermission": {
        const { createdContent, createdConfirmButtonText} = createContent(actionTableData, originalAction, marginTop);

        confirmButtonText = createdConfirmButtonText ? createdConfirmButtonText : confirmButtonText;
        content = createdContent;

        break;
      }

      case "project.close":
      case "subproject.close":
      case "workflowitem.close":
        const textContainer = createCloseTexts(intent);

        title = textContainer.closeTitle;
        content = textContainer.closeContent;
        confirmButtonText = textContainer.closeConfirmButtonTest;

        break;

      case "global.enableUser":
      case "global.disableUser": {

        const toggleUserActionTableData = {
          ...actionTableData,
          enabledUsers: [...enabledUsers, ...disabledUsers],
          userAssignments,
          fetchUserAssignments,
          cleanUserAssignments
        };

        const { createdContent, createdTitle, createdConfirmButtonText} =
          createToggleUserContent(toggleUserActionTableData, originalAction, marginTop);

        content = createdContent;
        title = createdTitle;
        confirmButtonText = createdConfirmButtonText;

        break;
      }

      default:
        title = "Not implemented confirmation";
        content = "Confirmation Dialog for " + intent + " is not implemented yet";
        break;
    }
  }

  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={open} data-test="confirmation-dialog">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      {renderErrorInformation(permittedToGrant, additionalActions, failedAction)}
      <DialogButtons
        confirmButtonText={confirmButtonText}
        onConfirm={executeAllActions}
        onCancel={requestedPermissions ? () => onCancel(requestedPermissions) : onCancel}
        confirmDisabled={(!permittedToGrant && additionalActionsExist(additionalActions)) || hasAssignments}
        additionalActions={additionalActions}
        originalActions={originalActions}
        postActions={postActions}
        executedActions={[...executedAdditionalActions, ...executedOriginalActions, ...executedPostActions]}
        actionsAreExecuted={additionalActionsExecuted || originalActionsExecuted || postActionsExecuted}
        executingActions={executingAdditionalActions || executingOriginalActions || executingPostActions}
        failedAction={failedAction}
      />
    </Dialog>
  );
};

function buildDialogWithLoadingIndicator(
  classes,
  open,
  isListPermissionsRequiredFromApi,
  onCancel,
  requestedPermissions
) {
  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={open} data-test="confirmation-dialog">
      {isListPermissionsRequiredFromApi ? (
        <React.Fragment>
          <DialogTitle data-test="confirmation-dialog-title">{strings.confirmation.permissions_required}</DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Typography>{strings.confirmation.list_permissions_required_text}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              onClick={() => onCancel(requestedPermissions)}
              data-test="confirmation-dialog-close"
            >
              {strings.common.close}
            </Button>
          </DialogActions>
        </React.Fragment>
      ) : (
        <div className={classes.loadingContainer}>
          <CircularProgress
            size={50}
            left={0}
            top={0}
            percentage={50}
            color="primary"
            className={classes.loadingIndicator}
          />
        </div>
      )}
    </Dialog>
  );
}

function additionalActionsExist(additionalActions) {
  return !_isEmpty(additionalActions);
}

function renderErrorInformation(permittedToGrant, additionalActions, failedAction) {
  if (!permittedToGrant && additionalActionsExist(additionalActions))
    return <ErrorTypography type="warning" showWarningIcon={true} text={strings.confirmation.no_permission_warning} />;
  if (!_isEmpty(failedAction)) {
    return (
      <ErrorTypography
        type="error"
        text={formatString(strings.confirmation.failed_action_error, failedAction.permission, failedAction.identity)}
      />
    );
  }
  return null;
}

function isPermittedToGrant(username, groups, permissions, actions) {
  if (isEmptyDeep(permissions)) return true;

  const resourcesToCheck = actions.reduce((resourcesToCheck, action) => {
    const resource = action.intent.split(".")[0];
    if (!resourcesToCheck.includes(resource)) {
      resourcesToCheck.push(resource);
    }
    return resourcesToCheck;
  }, []);

  const groupsOfUser = groups.filter(item => item.users.includes(username));

  return resourcesToCheck.every(resource =>
    isUserOrGroupPermitted(username, groupsOfUser, permissions[resource][`${resource}.intent.grantPermission`])
  );
}

export default withStyles(styles)(ConfirmationDialog);
