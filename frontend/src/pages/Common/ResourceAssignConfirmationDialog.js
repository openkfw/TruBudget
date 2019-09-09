import { Table, TableBody, TableCell, TableRow, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";

import { formatString, makePermissionReadable } from "../../helper";
import strings from "../../localizeStrings";
import ConfirmationDialog from "./ConfirmationDialog";

const styles = {
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
    padding: "0px 0px 0px 8px"
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
  },
  warning: {
    backgroundColor: "rgb(255, 165, 0, 0.7)",
    color: "black",
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: "orange",
    padding: "2px",
    textAlign: "center"
  }
};

const addHeader = (classes, table, text) => {
  table.push(
    <React.Fragment key={"wrapper"}>
      <TableRow className={classes.textRow} key={"text"}>
        <TableCell className={classes.headerCell}>
          <Typography>{text}</Typography>
        </TableCell>
      </TableRow>
      <TableRow className={classes.headerRow} key={"header"}>
        <TableCell className={classes.columnHeaderCell} style={{ flex: 3 }}>
          {strings.common.type}
        </TableCell>
        <TableCell className={classes.columnHeaderCell} style={{ flex: 5 }}>
          {strings.common.name}
        </TableCell>
        <TableCell className={classes.columnHeaderCell} style={{ flex: 6 }}>
          {strings.common.permission}
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
  return table;
};

const addActions = (classes, table, actions) => {
  actions.forEach((action, index) => {
    const type = strings.common[action.intent.split(".")[0]];
    table.push(
      <TableRow
        className={classes.tableRow}
        key={index + "-" + action.displayName + "-" + action.action + "-" + action.identity}
      >
        <TableCell className={classes.tableCell} style={{ flex: 3 }}>
          {type}
        </TableCell>
        <TableCell className={classes.tableCell} style={{ flex: 5 }}>
          {action.displayName}
        </TableCell>
        <TableCell className={classes.tableCell} style={{ flex: 6 }}>
          {makePermissionReadable(action.intent)}
        </TableCell>
      </TableRow>
    );
  });
  return table;
};

const getContent = (classes, actions, text, permittedToGrant) => {
  let table = [];
  table = addHeader(classes, table, text);
  table = addActions(classes, table, actions);
  const warningText = "Warning: You don't have permission to execute all listed actions!";
  return (
    <div>
      <Table>
        <TableBody className={classes.tableBody}>{table}</TableBody>
      </Table>
      {!permittedToGrant ? <Typography style={styles.warning}>{warningText}</Typography> : null}
    </div>
  );
};

const ResourceAssignConfirmationDialog = props => {
  const { classes, title, open, assignee, actions, onConfirm, onCancel, permittedToGrant, resource } = props;
  const text = formatString(strings.confirmation.assigning_text, assignee.displayName || "", resource.toLowerCase());
  return (
    <ConfirmationDialog
      title={title}
      open={open}
      content={getContent(classes, actions, text, permittedToGrant, resource)}
      intent={strings.confirmation.grant_and_assign}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmDisabled={!permittedToGrant}
    />
  );
};

export default withStyles(styles)(ResourceAssignConfirmationDialog);
