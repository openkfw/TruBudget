import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import strings from "../../../localizeStrings";
import PermissionTable from "./PermissionsTable";

const createActions = (permissions, temporayPermissions) => {
  const actions = [];
  Object.keys(permissions).forEach(key => {
    const permissionIds = permissions[key];
    const temporaryPermissionIds = temporayPermissions[key];

    const revokeIds = permissionIds.filter(id => !temporaryPermissionIds.includes(id));
    if (revokeIds.length > 0) actions.push({ type: "revoke", permission: key, userIds: revokeIds });
    const grantIds = temporaryPermissionIds.filter(id => !permissionIds.includes(id));
    if (grantIds.length > 0) actions.push({ type: "grant", permission: key, userIds: grantIds });
  });

  return actions;
};

const PermissionDialog = props => {
  const { temporaryPermissions, permissions, open, disabledSubmit, disabledUserSelection, userList } = props;
  return (
    <Dialog disableRestoreFocus data-test="permission-container" open={open} onClose={props.hidePermissionDialog}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <PermissionTable {...props} userList={userList} disabled={disabledUserSelection} />
      </DialogContent>
      <DialogActions>
        <Button data-test="permission-close" color="secondary" onClick={props.hidePermissionDialog}>
          {strings.common.cancel}
        </Button>
        <Button
          disabled={disabledSubmit}
          data-test="permission-submit"
          color="primary"
          onClick={
            !_isEmpty(permissions) && JSON.stringify(temporaryPermissions) !== JSON.stringify(permissions)
              ? () => {
                  const actions = createActions(permissions, temporaryPermissions);
                  actions.forEach(action => {
                    if (action.type === "grant") {
                      action.userIds.forEach(user => {
                        props.grant(action.permission, user);
                      });
                    } else if (action.type === "revoke") {
                      action.userIds.forEach(user => {
                        props.revoke(action.permission, user);
                      });
                    } else console.error("Not a recognized action", action.type);
                  });
                }
              : props.hidePermissionDialog
          }
        >
          {strings.common.submit}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionDialog;
