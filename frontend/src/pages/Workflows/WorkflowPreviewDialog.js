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

const WorkflowPreviewDialog = props => {
  const {
    selectedWorkflowItems,
    tempDrawerPermissions,
    hideWorkflowItemPreview,
    previewDialogShown,
    classes,
    grantWorkflowItemPermission,
    workflowAssignee,
    assignWorkflow,
    location,
    succeededWorkflowGrant,
    succeededWorkflowAssign,
    resetSucceededWorkflowitems,
    ...rest
  } = props;
  const permissions = tempDrawerPermissions;
  const actions = [];
  const projectId = location.pathname.split("/")[2];
  const subproject = location.pathname.split("/")[3];
  const editWorkflowitems = () => {
    actions.map(action => {
      if ("intent" in action) {
        grantWorkflowItemPermission(action.projectId, action.subprojectId, action.id, action.intent, action.identity);
      } else {
        assignWorkflow(action.projectId, action.subprojectId, action.id, action.assignee);
      }
    });
  };

  const getTableEntries = (
    workflowItems,
    permissions,
    workflowAssignee,
    projectId,
    subprojectId,
    succeededWorkflowGrant,
    succeededWorkflowAssign
  ) => {
    const table = [];
    const assignAction = "assign";
    const grantAction = "grantPermission";
    workflowItems.map((item, index) => {
      const assignSucceeded = succeededWorkflowAssign.includes(item.data.id);
      if (workflowAssignee !== "") {
        actions.push({
          projectId,
          subprojectId,
          action: assignAction,
          id: item.data.id,
          displayName: item.data.displayName,
          assignee: workflowAssignee
        });
        table.push(
          <TableRow
            className={assignSucceeded ? classes.succeed : classes.flexbox}
            style={{ height: "unset", borderBottom: "unset" }}
            key={index + assignAction + workflowAssignee}
          >
            <TableCell className={classes.transactionMessages}>{item.data.displayName}</TableCell>
            <TableCell className={classes.transactionMessages}>{assignAction}</TableCell>
            <TableCell className={classes.transactionMessages} />
            <TableCell className={classes.transactionMessages}>{workflowAssignee}</TableCell>
          </TableRow>
        );
      }
      for (const intent in permissions) {
        if (permissions[intent] !== []) {
          const grantSucceeded = succeededWorkflowGrant.some(
            action => action.id === item.data.id && action.intent === intent
          );
          permissions[intent].map(identity => {
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
        <TableBody className={classes.flexboxColumn}>
          {getTableEntries(
            selectedWorkflowItems,
            permissions,
            workflowAssignee,
            projectId,
            subproject,
            succeededWorkflowGrant,
            succeededWorkflowAssign
          )}
        </TableBody>
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
        onDialogCancel={onCancel}
        onDialogSubmit={editWorkflowitems}
        preview={preview}
        {...rest}
      />
    </div>
  );
};

export default withStyles(styles)(WorkflowPreviewDialog);
