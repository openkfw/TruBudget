import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import strings from "../../localizeStrings";

const UsersTable = ({ users }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{strings.adminDashboard.organization}</TableCell>
          <TableCell>{strings.adminDashboard.id}</TableCell>
          <TableCell>{strings.adminDashboard.name}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map(user => {
          return (
            <TableRow key={user.id}>
              <TableCell component="th" scope="row">
                {user.organization}
              </TableCell>
              <TableCell> {user.id} </TableCell>
              <TableCell> {user.displayName}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export default UsersTable;
