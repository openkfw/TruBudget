import React from "react";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import Card from "@mui/material/Card";

import { capitalize } from "../../helper";
import strings from "../../localizeStrings";

import "./PermissionRequired.scss";

const PermissionRequired = (props) => {
  const { actions, grantPermissionUserMap } = props;
  const unpermittedActions = actions.filter((action) => !action.isUserPermitted);
  const unpermittedIntents = unpermittedActions.filter(
    (value, index, array) => array.findIndex((action) => action.intent === value.intent) === index
  );

  return (
    <React.Fragment>
      <Typography>{strings.confirmation.no_permission_warning}</Typography>
      <IntentTable unpermittedIntents={unpermittedIntents} className="permission-required-table" />

      <Typography>{strings.confirmation.no_permission_help}</Typography>
      <UsersTable grantPermissionUserMap={grantPermissionUserMap} className="permission-required-table" />
    </React.Fragment>
  );
};

const IntentTable = ({ unpermittedIntents, className }) => (
  <Card className={className}>
    <TableContainer>
      <Table data-test="permission-required-intent-table">
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.type}</TableCell>
            <TableCell>{strings.common.name}</TableCell>
            <TableCell>{strings.common.permission}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{unpermittedIntents.map(createIntentTableRow)}</TableBody>
      </Table>
    </TableContainer>
  </Card>
);

const createIntentTableRow = (action, index) => {
  const type = strings.common[action.intent.split(".")[0]];

  return (
    <TableRow key={index + "-" + action.displayName + "-" + action.intent}>
      <TableCell>{type}</TableCell>
      <TableCell>{action.displayName}</TableCell>
      <TableCell>{strings.permissions[action.intent.replace(/\./g, "_")]}</TableCell>
    </TableRow>
  );
};

const UsersTable = ({ grantPermissionUserMap, className }) => (
  <Card className={className}>
    <TableContainer>
      <Table data-test="permission-required-user-table">
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.type}</TableCell>
            <TableCell>{strings.confirmation.user_group}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{grantPermissionUserMap.map(createUsersTableRow)}</TableBody>
      </Table>
    </TableContainer>
  </Card>
);

const createUsersTableRow = ({ permittedUser, resource }, index) => {
  return (
    <TableRow key={index + "-" + resource + "-" + permittedUser}>
      <TableCell>{capitalize(resource)}</TableCell>
      <TableCell>{permittedUser}</TableCell>
    </TableRow>
  );
};

export default PermissionRequired;
