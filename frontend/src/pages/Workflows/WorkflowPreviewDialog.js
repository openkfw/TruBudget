import React from "react";

import Card from "@material-ui/core/Card";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import { withStyles } from "@material-ui/core";

import strings from "../../localizeStrings";

import PreviewDialog from "../Common/PreviewDialog";

const styles = {
  cellFormat: {
    fontSize: "14px",
    alignSelf: "center",
    textAlign: "center",
    flex: "0 0 150px",
    padding: "0px 0px 0px 8px"
  },
  transactionMessages: {
    fontSize: "14px",
    borderRight: "1px solid rgba(224, 224, 224, 1)",
    borderBottom: "unset",
    flex: "0 0 150px",
    padding: "0px 0px 0px 8px"
  },
  notUpdated: {
    color: "lightgrey"
  },
  rowHeight: {
    height: "40px"
  },
  flexbox: {
    display: "flex"
  },
  failed: {
    textDecorationLine: "line-through",
    backgroundColor: "red"
  },
  succeed: {
    display: "flex",
    backgroundColor: "green"
  },
  flexboxColumn: {
    display: "flex",
    flexDirection: "column"
  }
};

const editWorkflowitems = props => {
  // actions.map(action => {
  //   if (action.intent !== undefined && !workflowitemIdsRevoked.includes(action.id)) {
  //     fetchWorkflowItemPermissions(action.projectId, action.id, true);
  //     const identities = currentWorkflowitemPermissions[action.intent];
  //     if (identities !== undefined) {
  //       identities.map(identity => {
  //         revokeWorkflowItemPermission(action.projectId, action.subprojectId, action.id, action.intent, identity);
  //       });
  //     }
  //     workflowitemIdsRevoked.push(action.id);
  //   }
  //   if ("intent" in action) {
  //     grantWorkflowItemPermission(action.projectId, action.subprojectId, action.id, action.intent, action.identity);
  //   } else {
  //     assignWorkflow(action.projectId, action.subprojectId, action.id, action.assignee);
  //   }
  // });
};

const getTableEntries = props => {
  const {
    selectedWorkflowItems,
    tempDrawerPermissions,
    tempDrawerAssignee,
    projectId,
    subprojectId,
    succeededWorkflowGrant,
    succeededWorkflowAssign,
    classes
  } = props;
  const actions = [];
  const table = [];
  const assignAction = "assign";
  const grantAction = "grantPermission";
  selectedWorkflowItems.forEach((item, index) => {
    const assignSucceeded = succeededWorkflowAssign.includes(item.data.id);
    if (tempDrawerAssignee !== "") {
      actions.push({
        projectId,
        subprojectId,
        action: assignAction,
        id: item.data.id,
        displayName: item.data.displayName,
        assignee: tempDrawerAssignee
      });
      table.push(
        <TableRow
          className={assignSucceeded ? classes.succeed : classes.flexbox}
          style={{ height: "unset", borderBottom: "unset" }}
          key={index + assignAction + tempDrawerAssignee}
        >
          <TableCell className={classes.transactionMessages}>{item.data.displayName}</TableCell>
          <TableCell className={classes.transactionMessages}>{assignAction}</TableCell>
          <TableCell className={classes.transactionMessages} />
          <TableCell className={classes.transactionMessages}>{tempDrawerAssignee}</TableCell>
        </TableRow>
      );
    }
    for (const intent in tempDrawerPermissions) {
      if (tempDrawerPermissions[intent] !== []) {
        const grantSucceeded = succeededWorkflowGrant.some(
          action => action.id === item.data.id && action.intent === intent
        );
        tempDrawerPermissions[intent].forEach(identity => {
          actions.push({
            projectId,
            subprojectId,
            action: grantAction,
            id: item.data.id,
            displayName: item.data.displayName,
            intent: intent,
            identity: identity
          });
          table.push(
            <TableRow
              className={grantSucceeded ? classes.succeed : classes.flexbox}
              style={{ height: "unset", borderBottom: "unset" }}
              key={index + grantAction + intent + identity}
            >
              <TableCell className={classes.transactionMessages}>{item.data.displayName}</TableCell>
              <TableCell className={classes.transactionMessages}>{grantAction}</TableCell>
              <TableCell className={classes.transactionMessages}>{intent}</TableCell>
              <TableCell className={classes.transactionMessages}>{identity}</TableCell>
            </TableRow>
          );
        });
      }
    }
  });
  return table;
};

const WorkflowPreviewDialog = props => {
  const { classes, previewDialogShown, hideWorkflowItemPreview, resetSucceededWorkflowitems, ...rest } = props;

  const preview = (
    <Card>
      <Table data-test="ssp-table">
        <TableHead>
          <TableRow style={{ display: "flex" }} className={classes.rowHeight}>
            <TableCell className={classes.cellFormat}>Display-Name</TableCell>
            <TableCell className={classes.cellFormat}>Intent</TableCell>
            <TableCell className={classes.cellFormat}>Grant-Permission</TableCell>
            <TableCell className={classes.cellFormat}>User</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className={classes.flexboxColumn}>{getTableEntries(props)}</TableBody>
      </Table>
    </Card>
  );

  const onCancel = () => {
    hideWorkflowItemPreview();
    resetSucceededWorkflowitems();
  };

  return (
    <div>
      <PreviewDialog
        title={strings.workflow.workflow_title}
        dialogShown={previewDialogShown}
        onDialogCancel={() => onCancel()}
        onDialogSubmit={editWorkflowitems}
        preview={preview}
        {...rest}
      />
    </div>
  );
};

export default withStyles(styles)(WorkflowPreviewDialog);
