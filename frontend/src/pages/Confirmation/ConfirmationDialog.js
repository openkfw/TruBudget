import { Button, CircularProgress, DialogActions, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Dialogtitle from "@material-ui/core/Dialogtitle";
import { withStyles } from "@material-ui/core/styles";
import _isEmpty from "lodash/isEmpty";
import React, { useEffect, useState } from "react";

import { formatString, hasUserAssignments, isEmptyDeep } from "../../helper";
import strings from "../../localizeStrings";
import DisableUserDialogContent from "../Users/DisableUserDialogContent";
import EnableUserDialogContent from "../Users/EnableUserDialogContent";
import ActionsTable from "./ActionsTable";
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
    enabledUserList,
    disabledUserList,
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
  let permittedToGrant = false;
  const marginTop = additionalActionsExist(additionalActions) ? { marginTop: "28px" } : {};

  originalActions.forEach(originalAction => {
    const { intent, payload } = originalAction;
    content = null;
    // Payload is defined by the saga which triggers the CONFIRM_INTENT-action
    switch (intent) {
      case "project.assign":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = formatString(
            strings.confirmation.permissions_text,
            payload.assignee.displayName,
            strings.common.project,
            payload.project.displayName
          );

          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={enabledUserList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
        }

        content = (
          <>
            {content}
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={enabledUserList}
              />
            </div>
          </>
        );

        break;
      case "subproject.assign":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = formatString(
            strings.confirmation.permissions_text,
            payload.assignee.displayName,
            strings.common.subproject,
            payload.subproject.displayName
          );

          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={enabledUserList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
        }

        content = (
          <>
            {content}
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={enabledUserList}
              />
            </div>
          </>
        );
        break;
      case "workflowitem.assign":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = formatString(
            strings.confirmation.permissions_text,
            payload.assignee.displayName,
            strings.common.workflowitem,
            payload.workflowitem.displayName
          );

          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={enabledUserList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
        }

        content = (
          <>
            {content}
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={enabledUserList}
              />
            </div>
          </>
        );
        break;
      case "subproject.createWorkflowitem":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);
        confirmButtonText = strings.common.create;

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const additionalActionsDialogText = strings.confirmation.additional_permissions_dialog_text;
          content = (
            <>
              <Typography>{additionalActionsDialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={enabledUserList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
        }

        content = (
          <>
            {content}
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={enabledUserList}
              />
            </div>
          </>
        );

        if (!_isEmpty(postActions)) {
          const postActionsDialogText = strings.confirmation.post_actions_dialog_text;
          content = (
            <>
              {content}
              <div style={{ marginTop: "28px" }}>
                <Typography>{postActionsDialogText}</Typography>
                <ActionsTable
                  actions={postActions}
                  executedActions={executedPostActions}
                  executingActions={executingPostActions}
                  failedAction={failedPostAction}
                  userList={enabledUserList}
                />
              </div>
            </>
          );
        }
        break;
      case "project.intent.grantPermission":
      case "project.intent.revokePermission":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = strings.confirmation.additional_permissions_dialog_text;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={enabledUserList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
        }

        content = (
          <>
            {content}
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={enabledUserList}
              />
            </div>
          </>
        );
        break;
      case "subproject.intent.grantPermission":
      case "subproject.intent.revokePermission":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);

        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = strings.confirmation.additional_permissions_dialog_text;

          title = strings.confirmation.additional_permissions_required;
          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={enabledUserList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
        }

        content = (
          <>
            {content}
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={enabledUserList}
              />
            </div>
          </>
        );
        break;

      case "workflowitem.intent.grantPermission":
      case "workflowitem.intent.revokePermission":
        permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, additionalActions);
        // Build Dialog content
        if (additionalActionsExist(additionalActions)) {
          const dialogText = strings.confirmation.additional_permissions_dialog_text;

          content = (
            <>
              <Typography>{dialogText}</Typography>
              <ActionsTable
                actions={additionalActions}
                executedActions={executedAdditionalActions}
                executingActions={executingAdditionalActions}
                failedAction={failedAction}
                userList={enabledUserList}
              />
            </>
          );
          confirmButtonText = strings.confirmation.execute_actions;
        }

        content = (
          <>
            {content}
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={enabledUserList}
              />
            </div>
          </>
        );
        break;
      case "project.close": {
        const dialogText = strings.confirmation.project_close_text;

        title = strings.confirmation.project_close;
        content = <Typography>{dialogText}</Typography>;
        confirmButtonText = strings.confirmation.project_close;
        break;
      }
      case "subproject.close": {
        const dialogText = strings.confirmation.subproject_close_text;

        title = strings.confirmation.subproject_close;
        content = <Typography>{dialogText}</Typography>;
        confirmButtonText = strings.confirmation.subproject_close;
        break;
      }
      case "workflowitem.close": {
        const dialogText = strings.confirmation.workflowitem_close_text;

        title = strings.confirmation.workflowitem_close;
        content = <Typography>{dialogText}</Typography>;
        confirmButtonText = strings.confirmation.workflowitem_close;
        break;
      }
      case "global.disableUser": {
        title = formatString(strings.users.disable_userId, payload.userId);
        content = (
          <>
            <DisableUserDialogContent
              fetchUserAssignments={fetchUserAssignments}
              cleanUserAssignments={cleanUserAssignments}
              userAssignments={userAssignments}
              editId={payload.userId}
            />
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={[...enabledUserList, ...disabledUserList]}
              />
            </div>
          </>
        );
        confirmButtonText = strings.users.disable_user;
        break;
      }
      case "global.enableUser": {
        title = formatString(strings.users.enable_userId, payload.userId);
        content = (
          <>
            <EnableUserDialogContent editId={payload.userId} />
            <div style={marginTop}>
              <Typography>{strings.confirmation.original_actions}</Typography>
              <ActionsTable
                actions={originalActions}
                executedActions={executedOriginalActions}
                executingActions={executingOriginalActions}
                failedAction={failedOriginalAction}
                userList={[...enabledUserList, ...disabledUserList]}
              />
            </div>
          </>
        );
        confirmButtonText = strings.users.enable_user;
        break;
      }
      default:
        title = "Not implemented confirmation";
        content = "Confirmation Dialog for " + intent + " is not implemented yet";
        break;
    }
  });

  return (
    <Dialog classes={{ paper: classes.paperRoot }} open={open} data-test="confirmation-dialog">
      <Dialogtitle>{title}</Dialogtitle>
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
          <Dialogtitle data-test="confirmation-dialog-title">{strings.confirmation.permissions_required}</Dialogtitle>
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
    return <ErrorTypography type="warning" text={strings.confirmation.no_permission_warning} />;
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
  //check permission by username
  const isUserPermitted = resourcesToCheck.every(resource => {
    return permissions[resource][`${resource}.intent.grantPermission`].includes(username);
  });
  if (typeof groups === undefined || groups.length === 0 || groups == null) {
    return isUserPermitted;
  } else {
    //check permission by group
    const filteredGroups = groups.filter(item => item.users.includes(username));
    const groupIds = filteredGroups.map(item => item.groupId);

    const isGroupPermitted = resourcesToCheck.every(resource => {
      return permissions[resource][`${resource}.intent.grantPermission`].some(member => groupIds.includes(member));
    });

    return isUserPermitted || isGroupPermitted;
  }
}

export default withStyles(styles)(ConfirmationDialog);
