import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import EditIcon from "@material-ui/icons/Edit";
import PermissionIcon from "@material-ui/icons/LockOpen";
import _sortBy from "lodash/sortBy";
import React from "react";

import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";
import { UserEmptyState } from "./UsersGroupsEmptyStates";

const styles = {
  iconColor: {
    color: "black"
  }
};
const sortUsers = users => {
  return _sortBy(users, user => user.organization && user.id);
};

const UsersTable = ({
  classes,
  users,
  permissionIconDisplayed,
  showDashboardDialog,
  showPasswordDialog,
  userId,
  isRoot,
  isDataLoading
}) => {
  const sortedUsers = sortUsers(users.filter(u => u.isGroup !== true));

  return sortedUsers.length > 0 ? (
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
        {isDataLoading ? null : (
          <TableBody id="usertablebody">
            {sortedUsers.map(user => {
              const canEditPassword =
                // need to check if user permissions exist yet
                // to make sure this is compatible with older versions
                user.permissions &&
                user.permissions.hasOwnProperty("user.changePassword") &&
                user.permissions["user.changePassword"].some(x => x === userId);

              return (
                <TableRow data-test={`user-${user.id}`} key={user.id}>
                  <TableCell component="th" scope="row">
                    {user.id}
                  </TableCell>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.organization}</TableCell>
                  <TableCell>
                    <div style={{ display: "flex" }}>
                      <ActionButton
                        notVisible={!permissionIconDisplayed}
                        onClick={() => showDashboardDialog("editUserPermissions", user.id)}
                        title={strings.common.show_permissions}
                        icon={<PermissionIcon />}
                        data-test={`edit-user-permissions-${user.id}`}
                      />
                      <ActionButton
                        onClick={() => showPasswordDialog(user.id)}
                        notVisible={!canEditPassword && !isRoot}
                        title={strings.common.edit}
                        icon={<EditIcon />}
                        data-test={`edit-user-${user.id}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        )}
      </Table>
    </Paper>
  ) : (
    <UserEmptyState />
  );
};
export default withStyles(styles)(UsersTable);
