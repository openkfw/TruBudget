import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import _sortBy from "lodash/sortBy";
import EditIcon from "@material-ui/icons/Edit";
import strings from "../../localizeStrings";

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
                  {group.groupId}
                </TableCell>
                <TableCell>{group.displayName}</TableCell>
                <TableCell>{group.users.length}</TableCell>
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
export default GroupsTable;
