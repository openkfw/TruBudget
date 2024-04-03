import React from "react";
import _sortBy from "lodash/sortBy";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import PermissionIcon from "@mui/icons-material/LockOpen";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";

import { DisabledUserEmptyState } from "./UsersGroupsEmptyStates";

import "./UsersTable.scss";

const sortUsers = (users) => {
  return _sortBy(users, (user) => user.organization && user.id);
};

const UsersTable = (props) => {
  const { users, CustomEmptyState } = props;
  let sortedUsers = sortUsers(users.filter((u) => u.isGroup !== true));

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
          {sortedUsers.map((displayUser) => {
            return renderUser({ ...props, displayUser });
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

const renderUser = (props) => {
  const { displayUser } = props;

  return (
    <TableRow data-test={`user-${displayUser.id}`} key={displayUser.id}>
      <TableCell component="th" scope="row">
        {displayUser.id}
      </TableCell>
      <TableCell>{displayUser.displayName}</TableCell>
      <TableCell>{displayUser.organization}</TableCell>
      <TableCell className="actions-column">
        <div className="actions">{renderActionButtons(props)}</div>
      </TableCell>
    </TableRow>
  );
};

const renderActionButtons = (props) => {
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
      Object.hasOwn(displayUser.permissions, "user.changePassword") &&
      displayUser.permissions["user.changePassword"].some((x) => x === userId) &&
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
          ariaLabel="show password"
          onClick={() => showPasswordDialog(displayUser.id)}
          title={strings.common.edit}
          icon={<EditIcon />}
          data-test={`edit-user-${displayUser.id}`}
        />
      ) : null}
      {canListUserPermissions ? (
        <ActionButton
          ariaLabel="show dashboard"
          onClick={() => showDashboardDialog("editUserPermissions", displayUser.id)}
          title={strings.common.show_permissions}
          icon={<PermissionIcon />}
          data-test={`edit-user-permissions-${displayUser.id}`}
        />
      ) : null}
      {canEnableUser ? (
        <ActionButton
          ariaLabel="enable user"
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
          ariaLabel="disable user"
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

export default UsersTable;
