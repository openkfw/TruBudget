import React from "react";
import { SortableElement } from "react-sortable-hoc";
import { Table, TableBody, TableRow, TableRowColumn } from "material-ui/Table";
import { Card } from "material-ui/Card";
import Avatar from "material-ui/Avatar";

import InfoIcon from "@material-ui/icons/InfoOutline";
import HiddenIcon from "@material-ui/icons/VisibilityOff";
import OpenIcon from "@material-ui/icons/Remove";
import DoneIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import PermissionIcon from "@material-ui/icons/LockOpen";
import Paper from "material-ui/Paper";
import Chip from "material-ui/Chip";
import IconButton from "material-ui/IconButton";
import { toAmountString, amountTypes } from "../../helper.js";
import { ACMECorpLightgrey, ACMECorpSuperLightgreen, ACMECorpLightblue } from "../../colors.js";
import strings from "../../localizeStrings";
import {
  canViewWorkflowItemPermissions,
  canUpdateWorkflowItem,
  canCloseWorkflowItem,
  canAssignWorkflowItem
} from "../../permissions.js";

const styles = {
  in_progress: {
    backgroundColor: ACMECorpLightgrey
  },
  in_review: {
    backgroundColor: ACMECorpLightblue
  },
  closed: {
    backgroundColor: ACMECorpSuperLightgreen
  },
  text: {
    fontSize: "14px"
  },
  open: {},
  dots: {
    height: 20,
    width: 20,
    textAlign: "center",
    display: "inline-block",
    position: "absolute",
    top: "14px",
    left: "-35px"
  },
  actions: {
    display: "flex",
    justifyContent: "center"
  },
  line: {
    position: "absolute",
    borderLeft: "2px",
    borderLeftStyle: "solid",
    borderLeftColor: "black",
    height: "100%",
    left: "-26px",
    bottom: "30px"
  },
  firstLine: {
    position: "absolute",
    borderLeft: "2px solid",
    borderLeftColor: "black",
    height: "34px",
    left: "-26px",
    bottom: "30px"
  },
  editButtons: {
    minWidth: "40px",
    marginLeft: "5px",
    marginRight: "5px",
    backgroundColor: "white"
  },
  infoButton: {
    minWidth: "40px",
    marginLeft: "5px",
    marginRight: "5px"
  },
  amountChip: {
    marginLeft: "16px"
  },
  statusChip: {
    marginLeft: "4px"
  },
  chipLabel: {
    fontSize: 10
  },
  chipDiv: {
    display: "flex",
    alignItems: "center"
  },
  redacted: {
    fontStyle: "italic"
  },
  chip: {
    margin: 4
  },
  chipRow: {
    paddingLeft: 10
  }
};

const createLine = (isFirst, selectable) => {
  const lineStyle =
    isFirst && selectable
      ? styles.firstLine
      : {
          ...styles.line,
          opacity: selectable ? 1 : 0.2
        };

  return <div style={lineStyle} />;
};

const StepDot = ({ status, selectable }) => {
  let Icon;
  switch (status) {
    case "open":
      Icon = OpenIcon;
      break;
    case "closed":
      Icon = DoneIcon;
      break;
    default:
      Icon = OpenIcon;
  }
  return (
    <Paper style={styles.dots} zDepth={2} circle={true}>
      <Icon style={{ width: "14px", height: "20px", opacity: selectable ? 1 : 0.3 }} />
    </Paper>
  );
};

const editWorkflow = ({ id, displayName, amount, amountType, currency, description, status, documents }, props) => {
  props.storeWorkflowName(displayName);
  props.storeWorkflowAmount(amount);
  props.storeWorkflowAmountType(amountType);
  props.storeWorkflowCurrency(currency);
  props.storeWorkflowComment(description);
  props.storeWorkflowStatus(status);
  props.storeWorkflowTxid(id);
  props.openWorkflowDialog(true);
  props.prefillDocuments(documents);
};

const getInfoButton = ({ workflowSortEnabled, openWorkflowDetails }, workflow) => {
  if (!workflowSortEnabled) {
    return (
      <IconButton style={styles.infoButton} onTouchTap={() => openWorkflowDetails(workflow.txid)}>
        <InfoIcon />
      </IconButton>
    );
  }
};
const isWorkflowSelectable = (currentWorkflowSelectable, workflowSortEnabled, status) => {
  const workflowSortable = status === "open";
  return workflowSortEnabled ? workflowSortable : currentWorkflowSelectable;
};

const getAmountField = (amount, type) => {
  const noBudgetAllocated = type === "N/A";
  const amountToShow = noBudgetAllocated ? amountTypes(type) : amount;

  return (
    <div style={styles.chipDiv}>
      <div>{amountToShow}</div>
      {noBudgetAllocated ? null : <Chip style={styles.amountChip}>{amountTypes(type)}</Chip>}
    </div>
  );
};

const renderActionButtons = (
  canEditWorkflow,
  edit,
  canListWorkflowPermissions,
  showPerm,
  canCloseWorkflow,
  close,
  selectable
) => {
  const hideStyle = {
    opacity: 0
  };

  return (
    <TableRowColumn colSpan={3}>
      <div style={styles.actions}>
        <IconButton disabled={!canEditWorkflow} onTouchTap={edit} style={canEditWorkflow ? {} : hideStyle}>
          <EditIcon />
        </IconButton>
        <IconButton disabled={!canListWorkflowPermissions} onTouchTap={showPerm}>
          <PermissionIcon />
        </IconButton>
        <IconButton disabled={!canCloseWorkflow} onTouchTap={close} style={canCloseWorkflow ? {} : hideStyle}>
          <DoneIcon />
        </IconButton>
      </div>
    </TableRowColumn>
  );
};

export const WorkflowItem = SortableElement(
  ({
    workflow,
    mapIndex,
    index,
    permissions,
    currentWorkflowSelectable,
    workflowSortEnabled,
    showWorkflowItemAssignee,
    ...props
  }) => {
    const { id, status, displayName, amountType, allowedIntents, assignee } = workflow;
    const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
    const amount = toAmountString(workflow.amount, workflow.currency);
    const tableStyle = styles[status];
    const itemStyle = workflowSelectable ? {} : { opacity: 0.3 };

    const showEdit = canUpdateWorkflowItem(allowedIntents) && status !== "closed";
    const showClose = canCloseWorkflowItem(allowedIntents) && workflowSelectable && status !== "closed";
    const infoButton = getInfoButton(props, workflow);

    const canAssign = canAssignWorkflowItem(allowedIntents) && status !== "closed";

    return (
      <Card
        zDepth={workflowSelectable ? 1 : 0}
        key={mapIndex}
        style={{
          marginLeft: "50px",
          marginRight: "10px",
          marginTop: "15px",
          marginBottom: "15px",
          position: "relative"
        }}
      >
        {createLine(mapIndex === 0, workflowSelectable)}
        <StepDot status={status} selectable={workflowSelectable} />
        <Table>
          <TableBody displayRowCheckbox={false}>
            <TableRow style={tableStyle} selectable={false} disabled={workflowSelectable}>
              <TableRowColumn colSpan={1}>{infoButton}</TableRowColumn>
              <TableRowColumn style={{ ...itemStyle, ...styles.text }} colSpan={3}>
                {displayName}
              </TableRowColumn>
              <TableRowColumn style={{ ...itemStyle, ...styles.listText }} colSpan={3}>
                {getAmountField(amount, amountType)}
              </TableRowColumn>
              <TableRowColumn style={{ ...styles.listText, ...styles.chipRow }} colSpan={2}>
                {canAssign ? (
                  <Chip onClick={() => showWorkflowItemAssignee(id, assignee)}>
                    <Avatar src="/lego_avatar_male1.jpg" />
                    {assignee}
                  </Chip>
                ) : (
                  <Chip>
                    <Avatar src="/lego_avatar_male1.jpg" />
                    {assignee}
                  </Chip>
                )}
              </TableRowColumn>
              {renderActionButtons(
                showEdit,
                editWorkflow.bind(this, workflow, props),
                canViewWorkflowItemPermissions(allowedIntents),
                () => props.showWorkflowItemPermissions(id),
                showClose,
                () => props.closeWorkflowItem(id),
                currentWorkflowSelectable
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    );
  }
);

export const RedactedWorkflowItem = SortableElement(
  ({ workflow, mapIndex, index, permissions, currentWorkflowSelectable, workflowSortEnabled, ...props }) => {
    const { status } = workflow;
    const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
    const tableStyle = styles[status];

    const itemStyle = workflowSelectable ? {} : { opacity: 0.3 };

    return (
      <Card
        zDepth={workflowSelectable ? 1 : 0}
        key={mapIndex}
        style={{
          marginLeft: "50px",
          marginRight: "10px",
          marginTop: "15px",
          marginBottom: "15px",
          position: "relative"
        }}
      >
        {createLine(mapIndex === 0, workflowSelectable)}
        <StepDot status={status} selectable={workflowSelectable} />
        <Table>
          <TableBody displayRowCheckbox={false}>
            <TableRow style={tableStyle} selectable={false} disabled={workflowSelectable}>
              <TableRowColumn colSpan={1}>
                <IconButton style={styles.infoButton}>
                  <HiddenIcon />
                </IconButton>
              </TableRowColumn>
              <TableRowColumn style={{ ...itemStyle, ...styles.listText, ...styles.redacted }} colSpan={3}>
                {strings.workflow.workflow_redacted}
              </TableRowColumn>
              <TableRowColumn style={{ ...itemStyle, ...styles.listText }} colSpan={3}>
                {null}
              </TableRowColumn>
              <TableRowColumn style={{ ...itemStyle, ...styles.listText }} colSpan={2}>
                {null}
              </TableRowColumn>
              <TableRowColumn colSpan={3}>{null}</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    );
  }
);
