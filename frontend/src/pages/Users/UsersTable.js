import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import _sortBy from "lodash/sortBy";
import PermissionIcon from "@material-ui/icons/LockOpen";
import IconButton from "@material-ui/core/IconButton";
import strings from "../../localizeStrings";
import { withStyles } from "@material-ui/core";


const styles={
  iconColor: {
    color: "black"
  }
}
const sortUsers = users => {
  return _sortBy(users, user => user.organization && user.id);
};

const UsersTable = ({ classes, users, showDashboardDialog }) => {
  const sortedUsers = sortUsers(users.filter(u => u.isGroup !== true));
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.id}</TableCell>
            <TableCell>{strings.common.name}</TableCell>
            <TableCell>{strings.usersDashboard.organization}</TableCell>
            <TableCell/>
          </TableRow>
        </TableHead>
        <TableBody id="usertablebody">
          {sortedUsers.map(user => {
            return (
              <TableRow id={`user-${user.id}`} key={user.id}>
                <TableCell component="th" scope="row">
                  {user.id}
                </TableCell>
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.organization}</TableCell>
                <TableCell>
                  <IconButton onClick={() => showDashboardDialog("editUser", user.id)}>
                    <PermissionIcon className={classes.iconColor} />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};
export default withStyles(styles) (UsersTable);
