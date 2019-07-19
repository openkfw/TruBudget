import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import EditIcon from "@material-ui/icons/Edit";
import _sortBy from "lodash/sortBy";
import React from "react";

import strings from "../../localizeStrings";

const styles = {
  icon: {
    color: "black"
  }
};
const sortGroups = groups => {
  return _sortBy(groups, group => group.id && group.displayName);
};
const GroupsTable = ({ groups, showDashboardDialog, classes, allowedIntents }) => {
  const editGroupDisplayed = allowedIntents.includes("global.createGroup");

  const sortedGroups = sortGroups(groups);

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.id}</TableCell>
            <TableCell>{strings.common.name}</TableCell>
            <TableCell>{strings.users.users}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody data-test="grouptablebody">
          {sortedGroups.map(group => {
            return (
              <TableRow data-test={`group-${group.groupId}`} key={group.groupId}>
                <TableCell component="th" scope="row">
                  {group.groupId}
                </TableCell>
                <TableCell>{group.displayName}</TableCell>
                <TableCell>{group.users.length}</TableCell>
                <TableCell>
                  {editGroupDisplayed ? (
                    <IconButton onClick={() => showDashboardDialog("editGroup", group.groupId)}>
                      <EditIcon className={classes.icon} />
                    </IconButton>
                  ) : null}
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
