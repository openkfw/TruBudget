import { Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Close";
import DoneIcon from "@material-ui/icons/Done";
import TBDIcon from "@material-ui/icons/Remove";
import _isEqual from "lodash/isEqual";
import React from "react";
import strings from "../../localizeStrings";

/**
 ** @actions Displayed by the table in following format
 **
 ** action: {
 **   displayName: string - Display Name of the project/subproject/workflowitem
 **   intent: string      - e.g. project.intent.listPermissions
 **
 ** }
 */

const styles = {
  card: {
    marginTop: "24px"
  },
  tableBody: {
    display: "flex",
    flexDirection: "column"
  },
  textRow: {
    display: "flex",
    height: "40px"
  },
  headerRow: {
    display: "flex",
    height: "40px"
  },
  headerCell: {
    fontSize: "16px",
    textAlign: "left",
    flex: "1",
    borderBottom: "unset",
    padding: "0px"
  },
  columnHeaderCell: {
    fontSize: "14px",
    fontWeight: "bold",
    alignSelf: "center",
    flex: "1",
    padding: "0px 0px 4px 8px"
  },
  tableRow: {
    display: "flex",
    height: "30px",
    borderBottom: "unset"
  },
  tableCell: {
    fontSize: "14px",
    borderBottom: "unset",
    padding: "0px 0px 0px 8px",
    flex: 1
  }
};

function generateHeader(classes) {
  return (
    <TableRow className={classes.headerRow} key={"header"}>
      <TableCell key={"header-type"} className={classes.columnHeaderCell} style={{ flex: 3 }}>
        {strings.common.type}
      </TableCell>
      <TableCell key={"header-displayName"} className={classes.columnHeaderCell} style={{ flex: 8 }}>
        {strings.common.name}
      </TableCell>
      <TableCell key={"header-permission"} className={classes.columnHeaderCell} style={{ flex: 5 }}>
        {strings.common.permission}
      </TableCell>
      <TableCell key={"header-identity"} className={classes.columnHeaderCell} style={{ flex: 3 }}>
        {strings.confirmation.user_group}
      </TableCell>
      <TableCell key={"header-status"} className={classes.columnHeaderCell} style={{ textAlign: "right" }}>
        {strings.common.status}
      </TableCell>
    </TableRow>
  );
}

function generateActions(classes, actions, executedActions, failedAction, userList) {
  const actionsTable = [];
  actions.forEach((action, index) => {
    const type = strings.common[action.intent.split(".")[0]];
    const user = userList.find(user => user.id === action.identity);
    actionsTable.push(
      <TableRow className={classes.tableRow} key={index + "-" + action.displayName + "-" + action.permission}>
        <TableCell key={index + "-type"} className={classes.tableCell} style={{ flex: 3 }}>
          {type}
        </TableCell>
        <TableCell key={index + "-displayName"} className={classes.tableCell} style={{ flex: 8 }}>
          {action.displayName}
        </TableCell>
        <TableCell key={index + "-permission"} className={classes.tableCell} style={{ flex: 5 }}>
          {makePermissionReadable(action.permission)}
        </TableCell>
        <TableCell key={index + "-userName"} className={classes.tableCell} style={{ flex: 3 }}>
          {user ? user.displayName : ""}
        </TableCell>
        <TableCell
          key={index + "-status"}
          className={classes.tableCell}
          style={{ textAlign: "right", position: "relative", bottom: "4px" }}
        >
          {getStatusIcon(executedActions, failedAction, action)}
        </TableCell>
      </TableRow>
    );
  });
  return actionsTable;
}

function getStatusIcon(executedActions, failedAction, action) {
  if (executedActions === undefined || _isEqual(action, failedAction)) {
    return <ErrorIcon />;
  } else {
    if (actionExecuted(executedActions, action)) {
      return <DoneIcon />;
    } else {
      return <TBDIcon />;
    }
  }
}

const actionExecuted = (executedActions, action) => {
  return executedActions.some(
    item =>
      action.id === item.id &&
      action.identity === item.identity &&
      action.intent === item.intent &&
      action.permission === item.permission
  );
};

function makePermissionReadable(intent) {
  const splittedString = intent.split(".");
  return strings.intents[splittedString[splittedString.length - 1]] || splittedString[splittedString.length - 1];
}

const ActionsTable = props => {
  const { classes, actions, executedActions, executingActions, failedAction, userList } = props;
  return actions ? (
    <React.Fragment>
      <Card className={classes.card}>
        <Table data-test="actions-table">
          <TableHead data-test="actions-table-head" key={"wrapper"}>
            {generateHeader(classes)}
          </TableHead>
          <TableBody data-test="actions-table-body" className={classes.tableBody}>
            {generateActions(classes, actions, executedActions, failedAction, userList)}
          </TableBody>
        </Table>
      </Card>
      {executingActions ? <LinearProgress color="primary" /> : null}
    </React.Fragment>
  ) : null;
};

export default withStyles(styles)(ActionsTable);
