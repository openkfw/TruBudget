import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import _sortBy from "lodash/sortBy";
import blueGrey from "@material-ui/core/colors/blueGrey";
import EditIcon from "@material-ui/icons/Edit";
import strings from "../../localizeStrings";
import { withStyles, IconButton } from "@material-ui/core";

const styles = {
  title: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    height: "50px",
    alignItems: "center",
    backgroundColor: blueGrey[50]
  }
};
const sortGroups = groups => {
  return _sortBy(groups, group => group.id && group.displayName);
};
const GroupsTable = ({ groups, showDashboardDialog, classes }) => {
  const sortedGroups = sortGroups(groups);

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.id}</TableCell>
            <TableCell>{strings.common.name}</TableCell>
            <TableCell>{strings.usersDashboard.users}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody id="grouptablebody">
          {sortedGroups.map(group => {
            return (
              <TableRow id={`group-${group.groupId}`} key={group.groupId}>
                <TableCell component="th" scope="row">
                  <span>{group.groupId}</span>
                </TableCell>
                <TableCell>
                  <span>{group.displayName}</span>
                </TableCell>
                <TableCell>
                  <span>{group.users.length}</span>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => showDashboardDialog("editGroup", group.groupId)}>
                    <EditIcon />
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
export default withStyles(styles)(GroupsTable);
