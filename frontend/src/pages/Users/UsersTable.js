import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import blueGrey from "@material-ui/core/colors/blueGrey";

const UsersTable = ({ users }) => {
  console.log(users);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Organization</TableCell>
          <TableCell>Id</TableCell>
          <TableCell>Display name</TableCell>
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
      {/* <TableBody displayRowCheckbox={false}>
      <TableRow selectable={false}>
        <TableRowColumn>1</TableRowColumn>
        <TableRowColumn>UmbrellaCorp</TableRowColumn>
        <TableRowColumn>Brasil</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>2</TableRowColumn>
        <TableRowColumn>Norwegian Minister of Climate</TableRowColumn>
        <TableRowColumn>Norway</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>3</TableRowColumn>
        <TableRowColumn>ACMECorp</TableRowColumn>
        <TableRowColumn>Germany</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>4</TableRowColumn>
        <TableRowColumn>Ughanda Ministry of Finance</TableRowColumn>
        <TableRowColumn>Ughanda</TableRowColumn>
      </TableRow>
    </TableBody>{" "} */}
    </Table>
  );
};
export default UsersTable;
