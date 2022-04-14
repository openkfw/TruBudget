import { withStyles } from "@mui/styles";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import PermissionIcon from "@mui/icons-material/LockOpen";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
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
    padding: "4px 10px 4px 2px",
    flexDirection: "column"
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
          {sortedUsers.map(displayUser => {
            return renderUser({ ...props, displayUser });
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

const renderUser = props => {
  const { classes, displayUser } = props;

  return (
    <TableRow data-test={`user-${displayUser.id}`} key={displayUser.id}>
      <TableCell component="th" scope="row">
        {displayUser.id}
      </TableCell>
      <TableCell>{displayUser.displayName}</TableCell>
      <TableCell>{displayUser.organization}</TableCell>
      <TableCell className={classes.flexColumn}>
        <div className={classes.flex}>{renderActionButtons(props)}</div>
      </TableCell>
    </TableRow>
  );
};

const renderActionButtons = props => {
  const {
    displayUser,
    userId,
    allowedIntents,
    showDashboardDialog,
    showPasswordDialog,
    disableUser,
    enableUser,
    isRoot,
    organization
  } = props;

  const isEnabledUser = displayUser.permissions["user.authenticate"].includes(displayUser.id);
  const isRootUserOfSameOrga = isRoot && organization === displayUser.organization;
  const canEditPassword =
    // need to check if user permissions exist yet
    // to make sure this is compatible with older versions
    (displayUser.permissions &&
      displayUser.permissions.hasOwnProperty("user.changePassword") &&
      displayUser.permissions["user.changePassword"].some(x => x === userId) &&
      !isRoot) ||
    isRootUserOfSameOrga;
  const canListUserPermissions = (allowedIntents.includes("global.listPermissions") && !isRoot) || isRootUserOfSameOrga;
  const canEnableUser =
    ((allowedIntents.includes("global.enableUser") && !isRoot) || isRootUserOfSameOrga) && !isEnabledUser;
  const canDisableUser =
    ((allowedIntents.includes("global.disableUser") && !isRoot) || isRootUserOfSameOrga) && isEnabledUser;

  return (
    <>
      {canEditPassword ? (
        <ActionButton
          onClick={() => showPasswordDialog(displayUser.id)}
          title={strings.common.edit}
          icon={<EditIcon />}
          data-test={`edit-user-${displayUser.id}`}
        />
      ) : null}
      {canListUserPermissions ? (
        <ActionButton
          onClick={() => showDashboardDialog("editUserPermissions", displayUser.id)}
          title={strings.common.show_permissions}
          icon={<PermissionIcon />}
          data-test={`edit-user-permissions-${displayUser.id}`}
        />
      ) : null}
      {canEnableUser ? (
        <ActionButton
          onClick={() => {
            enableUser(displayUser.id);
          }}
          title={strings.users.enable_user}
          icon={<CheckCircleIcon />}
          data-test={`enable-user-${displayUser.id}`}
        />
      ) : null}
      {canDisableUser ? (
        <ActionButton
          onClick={() => {
            disableUser(displayUser.id);
          }}
          title={strings.users.disable_user}
          icon={<RemoveCircleIcon />}
          data-test={`disable-user-${displayUser.id}`}
          notVisible={userId === displayUser.id}
        />
      ) : null}
    </>
  );
};

export default withStyles(styles)(UsersTable);
