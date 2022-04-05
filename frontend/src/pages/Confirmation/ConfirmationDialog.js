import { Button, CircularProgress, DialogActions, Typography } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { withStyles } from "@mui/styles";
import _isEmpty from "lodash/isEmpty";
import React, { useEffect, useState } from "react";
import { getGroupsOfUser, hasUserAssignments, isEmptyDeep, isUserOrGroupPermitted } from "../../helper";
import strings from "../../localizeStrings";

import { ConfirmationDialogCreator } from "./confirmationDialogCreator";

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
    additionalActions,
    requestedPermissions,
    onCancel,
    isListPermissionsRequiredFromApi,
    isFetchingPermissions,
    userAssignments,
    failedAction,
    ...restProps
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

  const resourcesToCheck = getResourcesToCheck(additionalActions);
  const permittedToGrant = isPermittedToGrant(confirmingUser, groups, permissions, resourcesToCheck);

  const confirmationDialogCreator = new ConfirmationDialogCreator(
    {
      ...restProps,
      groups,
      failedAction,
      additionalActions,
      hasAssignments,
      userAssignments,
      requestedPermissions,
      permittedToGrant
    },
    classes.paperRoot,
    open,
    onCancel
  );

  if (hasSufficientPermission(permittedToGrant, additionalActions)) {
    return confirmationDialogCreator.createActionsTableDialog();
  }

  return confirmationDialogCreator.createPermissionRequiredDialog(
    getGrantPermissionUserMap(confirmingUser, getGroupsOfUser(confirmingUser, groups), permissions, resourcesToCheck)
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

function hasSufficientPermission(permittedToGrant, additionalActions) {
  return permittedToGrant || !additionalActionsExist(additionalActions);
}

function isPermittedToGrant(username, groups, permissions, resourcesToCheck) {
  if (isEmptyDeep(permissions)) return true;

  const groupsOfUser = groups.filter(item => item.users.includes(username));

  return resourcesToCheck.every(resource =>
    isUserOrGroupPermitted(username, groupsOfUser, permissions[resource][`${resource}.intent.grantPermission`])
  );
}

function getResourcesToCheck(actions) {
  return actions.reduce((resourcesToCheck, action) => {
    const resource = action.intent.split(".")[0];

    if (!resourcesToCheck.includes(resource)) {
      resourcesToCheck.push(resource);
    }

    return resourcesToCheck;
  }, []);
}

function getGrantPermissionUserMap(username, groups, permissions, resourcesToCheck) {
  return resourcesToCheck.reduce((result, resource) => {
    const permittedUsers = permissions[resource][`${resource}.intent.grantPermission`];

    const permittedUser = permittedUsers[0];

    if (!isUserOrGroupPermitted(username, groups, permittedUsers)) {
      result.push({ permittedUser, resource });
    }

    return result;
  }, []);
}

export default withStyles(styles)(ConfirmationDialog);
