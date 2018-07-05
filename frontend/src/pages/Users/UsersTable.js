import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import _sortBy from "lodash/sortBy";
import strings from "../../localizeStrings";

const sortUsers = users => {
  return _sortBy(users, user => user.organization && user.id);
};
const UsersTable = ({ users }) => {
  const sortedUsers = sortUsers(users);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{strings.usersDashboard.organization}</TableCell>
          <TableCell>{strings.usersDashboard.id}</TableCell>
          <TableCell>{strings.usersDashboard.name}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody id="usertablebody">
        {sortedUsers.map(user => {
          return (
            <TableRow id={`user-${user.id}`} key={user.id}>
              <TableCell component="th" scope="row">
                <span>{user.organization}</span>
              </TableCell>
              <TableCell>
                <span>{user.id}</span>
              </TableCell>
              <TableCell>
                <span>{user.displayName}</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export default UsersTable;
