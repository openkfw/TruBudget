import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import EditIcon from "@material-ui/icons/Edit";
import _sortBy from "lodash/sortBy";
import React from "react";

import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";
import { UserGroupsEmptyState } from "./UsersGroupsEmptyStates";

const sortGroups = groups => {
  return _sortBy(groups, group => group.id && group.displayName);
};

const GroupsTable = ({ groups, showDashboardDialog, allowedIntents, userId }) => {
  const sortedGroups = sortGroups(groups);

  return sortedGroups.length > 0 ? (
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
            const isAllowedToEditGroup =
              group.permissions["group.addUser"]?.includes(userId) &&
              group.permissions["group.removeUser"]?.includes(userId);
            return (
              <TableRow data-test={`group-${group.groupId}`} key={group.groupId}>
                <TableCell component="th" scope="row">
                  {group.groupId}
                </TableCell>
                <TableCell>{group.displayName}</TableCell>
                <TableCell>{group.users.length}</TableCell>
                <TableCell>
                  <div style={{ display: "flex" }}>
                    <ActionButton
                      notVisible={!isAllowedToEditGroup}
                      onClick={() => showDashboardDialog("editGroup", group.groupId)}
                      title={strings.common.edit}
                      icon={<EditIcon />}
                      data-test={`edit-group-${group.groupId}`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  ) : (
    <UserGroupsEmptyState />
  );
};
export default GroupsTable;
