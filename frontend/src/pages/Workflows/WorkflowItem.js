import React from "react";
import { SortableElement } from "react-sortable-hoc";
import Table, { TableBody, TableRow, TableCell } from "material-ui/Table";
import Card from "material-ui/Card";
import Avatar from "material-ui/Avatar";
import Typography from "@material-ui/core/Typography";

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
    top: "18px",
    left: "16px",
    borderRadius: "10px"
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
    left: "25px",
    bottom: "34px"
  },
  firstLine: {
    position: "absolute",
    borderLeft: "2px solid",
    borderLeftColor: "black",
    height: "38px",
    left: "25px",
    bottom: "34px"
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
  },
  workflowContent: {
    display: "flex",

    alignItems: "center",
    padding: "4px 8px 4px 4px"
  },
  workflowCell: {
    flex: 1
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
    <Paper style={styles.dots} elevation={2} disabled={selectable}>
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
      <IconButton style={styles.infoButton} onClick={() => openWorkflowDetails(workflow.txid)}>
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
      {noBudgetAllocated ? null : <Chip style={styles.amountChip} label={amountTypes(type)} />}
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
    <div style={{ flex: 2 }}>
      <div style={styles.actions}>
        <IconButton disabled={!canEditWorkflow} onClick={edit} style={canEditWorkflow ? {} : hideStyle}>
          <EditIcon />
        </IconButton>
        <IconButton disabled={!canListWorkflowPermissions} onClick={showPerm}>
          <PermissionIcon />
        </IconButton>
        <IconButton disabled={!canCloseWorkflow} onClick={close} style={canCloseWorkflow ? {} : hideStyle}>
          <DoneIcon />
        </IconButton>
      </div>
    </div>
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
    const itemStyle = workflowSelectable
      ? {}
      : {
          opacity: 0.3
        };

    const showEdit = canUpdateWorkflowItem(allowedIntents) && status !== "closed";
    const showClose = canCloseWorkflowItem(allowedIntents) && workflowSelectable && status !== "closed";
    const infoButton = getInfoButton(props, workflow);

    const canAssign = canAssignWorkflowItem(allowedIntents) && status !== "closed";

    return (
      <div style={{ position: "relative" }}>
        {createLine(mapIndex === 0, workflowSelectable)}
        <StepDot status={status} selectable={workflowSelectable} />
        <Card
          elevation={workflowSelectable ? 1 : 0}
          key={mapIndex}
          style={{
            marginLeft: "50px",
            marginRight: "10px",
            marginTop: "15px",
            marginBottom: "15px"
          }}
        >
          <div style={{ ...tableStyle, ...styles.workflowContent }}>
            <div style={{ flex: 1 }}>{infoButton}</div>
            <div style={{ ...itemStyle, ...styles.text, flex: 5 }}>
              <Typography variant="body1">{displayName}</Typography>
            </div>
            <div style={{ ...itemStyle, ...styles.listText, flex: 5 }}>
              <Typography variant="body1" component="div">
                {getAmountField(amount, amountType)}
              </Typography>
            </div>
            <div style={{ ...styles.listText, ...styles.chipRow, flex: 2 }}>
              <Chip
                onClick={canAssign ? () => showWorkflowItemAssignee(id, assignee) : undefined}
                avatar={<Avatar src="/lego_avatar_male1.jpg" />}
                label={assignee}
              />
            </div>
            {renderActionButtons(
              showEdit,
              editWorkflow.bind(this, workflow, props),
              canViewWorkflowItemPermissions(allowedIntents),
              () => props.showWorkflowItemPermissions(id),
              showClose,
              () => props.closeWorkflowItem(id),
              currentWorkflowSelectable
            )}
          </div>
        </Card>
      </div>
    );
  }
);

export const RedactedWorkflowItem = SortableElement(
  ({ workflow, mapIndex, index, permissions, currentWorkflowSelectable, workflowSortEnabled, ...props }) => {
    const { status } = workflow;
    const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
    const tableStyle = styles[status];

    const itemStyle = workflowSelectable ? { padding: 0 } : { padding: 0, opacity: 0.3 };

    return (
      <div style={{ position: "relative" }}>
        {createLine(mapIndex === 0, workflowSelectable)}
        <StepDot status={status} selectable={workflowSelectable} />
        <Card
          elevation={workflowSelectable ? 1 : 0}
          key={mapIndex}
          style={{
            marginLeft: "50px",
            marginRight: "10px",
            marginTop: "15px",
            marginBottom: "15px"
          }}
        >
          <div style={{ ...tableStyle, ...styles.workflowContent }}>
            <div style={{ flex: 1 }}>
              <IconButton style={styles.infoButton}>
                <HiddenIcon />
              </IconButton>
            </div>
            <div style={{ ...itemStyle, ...styles.text, flex: 5 }}>
              <Typography variant="body1">{strings.workflow.workflow_redacted}</Typography>
            </div>
            <div style={{ ...itemStyle, ...styles.listText, flex: 5 }}>{null}</div>
            <div style={{ ...styles.listText, ...styles.chipRow, flex: 2 }}>{null}</div>
            {null}
          </div>
        </Card>
      </div>
    );
  }
);
