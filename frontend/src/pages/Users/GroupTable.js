import React from "react";
import _sortBy from "lodash/sortBy";

import EditIcon from "@mui/icons-material/Edit";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";

import { UserGroupsEmptyState } from "./UsersGroupsEmptyStates";

const sortGroups = (groups) => {
  return _sortBy(groups, (group) => group.id && group.displayName);
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
          {sortedGroups.map((group) => {
            const isAllowedToEditGroup =
              group.permissions["group.addUser"]?.includes(userId) &&
              group.permissions["group.removeUser"]?.includes(userId);
            return (
              <TableRow data-test={`group-${group.groupId}`} key={group.groupId}>
                <TableCell component="th" scope="row" data-test="group-id">
                  {group.groupId}
                </TableCell>
                <TableCell data-test="group-name">{group.displayName}</TableCell>
                <TableCell data-test="group-user-length">{group.users.length}</TableCell>
                <TableCell>
                  <div style={{ display: "flex" }}>
                    <ActionButton
                      ariaLabel="show dashboard"
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
