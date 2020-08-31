import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import EditIcon from "@material-ui/icons/Edit";
import PermissionIcon from "@material-ui/icons/LockOpen";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import _sortBy from "lodash/sortBy";
import React from "react";
import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";
import { DisabledUserEmptyState } from "./UsersGroupsEmptyStates";

const styles = {
  flex: {
    justifyContent: "flex-end",
    display: "flex"
  },
  flexColumn: {
    padding:"4px 10px 4px 2px",
    flexDirection: "column",
   
  }
};

const sortUsers = users => {
  return _sortBy(users, user => user.organization && user.id);
};

const UsersTable = props => {
  const { users, CustomEmptyState } = props;
  let sortedUsers = sortUsers(users.filter(u => u.isGroup !== true));

  if (sortedUsers.length === 0) {
    return <CustomEmptyState /> || <DisabledUserEmptyState />;
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.id}</TableCell>
            <TableCell>{strings.common.name}</TableCell>
            <TableCell>{strings.common.organization}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody id="usertablebody">
          {sortedUsers.map(user => {
            return renderUser({ ...props, user });
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

const renderUser = props => {
  const { classes, user } = props;

  return (
    <TableRow data-test={`user-${user.id}`} key={user.id}>
      <TableCell component="th" scope="row">
        {user.id}
      </TableCell>
      <TableCell>{user.displayName}</TableCell>
      <TableCell>{user.organization}</TableCell>
      <TableCell className={classes.flexColumn}>
        <div className={classes.flex}>{renderActionButtons(props)}</div>
      </TableCell>
    </TableRow>
  );
};

const renderActionButtons = props => {
  const {
    user,
    userId,
    allowedIntents,
    showDashboardDialog,
    showPasswordDialog,
    isRoot,
    disableUser,
    enableUser
  } = props;

  const isEnabledUser = user.permissions["user.authenticate"].includes(user.id);
  const canEditPassword =
    // need to check if user permissions exist yet
    // to make sure this is compatible with older versions
    (user.permissions &&
      user.permissions.hasOwnProperty("user.changePassword") &&
      user.permissions["user.changePassword"].some(x => x === userId)) ||
    isRoot;
  const canListUserPermissions = allowedIntents.includes("global.listPermissions") || isRoot;
  const canEnableUser = (allowedIntents.includes("global.enableUser") || isRoot) && !isEnabledUser;
  const canDisableUser = (allowedIntents.includes("global.disableUser") || isRoot) && isEnabledUser;

  return (
    <>
      {canEditPassword ? (
        <ActionButton
          onClick={() => showPasswordDialog(user.id)}
          title={strings.common.edit}
          icon={<EditIcon />}
          data-test={`edit-user-${user.id}`}
        />
      ) : null}
      {canListUserPermissions ? (
        <ActionButton
          onClick={() => showDashboardDialog("editUserPermissions", user.id)}
          title={strings.common.show_permissions}
          icon={<PermissionIcon />}
          data-test={`edit-user-permissions-${user.id}`}
        />
      ) : null}
      {canEnableUser ? (
        <ActionButton
          onClick={() => {
            enableUser(user.id);
          }}
          title={strings.users.enable_user}
          icon={<CheckCircleIcon />}
          data-test={`enable-user-${user.id}`}
        />
      ) : null}
      {canDisableUser ? (
        <ActionButton
          onClick={() => {
            disableUser(user.id);
          }}
          title={strings.users.disable_user}
          icon={<RemoveCircleIcon />}
          data-test={`disable-user-${user.id}`}
        />
      ) : null}
    </>
  );
};

export default withStyles(styles)(UsersTable);
