import React from "react";
import { SortableElement } from "react-sortable-hoc";

import Card from "@material-ui/core/Card";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import DoneIcon from "@material-ui/icons/Check";
import HiddenIcon from "@material-ui/icons/VisibilityOff";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import EditIcon from "@material-ui/icons/Edit";
import OpenIcon from "@material-ui/icons/Remove";
import Paper from "@material-ui/core/Paper";
import PermissionIcon from "@material-ui/icons/LockOpen";
import Typography from "@material-ui/core/Typography";
import green from "@material-ui/core/colors/lightGreen";
import Checkbox from "@material-ui/core/Checkbox";

import { toAmountString, amountTypes } from "../../helper.js";
import strings from "../../localizeStrings";
import {
  canViewWorkflowItemPermissions,
  canUpdateWorkflowItem,
  canCloseWorkflowItem,
  canAssignWorkflowItem
} from "../../permissions.js";
import WorkflowAssigneeContainer from "./WorkflowAssigneeContainer.js";

const styles = {
  text: {
    fontSize: "14px"
  },
  dots: {
    height: 20,
    width: 20,
    textAlign: "center",
    display: "inline-block",
    position: "absolute",
    top: "17px",
    left: "16px",
    borderRadius: "10px"
  },
  checkbox: {
    height: 20,
    width: 20,
    textAlign: "center",
    display: "inline-block",
    position: "absolute",
    top: "6px",
    left: "2px",
    borderRadius: "10px"
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    width: "100%"
  },
  actionButton: {
    width: "33%"
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

  workflowContent: {
    display: "flex",

    alignItems: "center",
    padding: "4px 8px 4px 4px"
  },
  workflowCell: {
    flex: 1
  },
  card: {
    marginLeft: "50px",
    marginRight: "10px",
    marginTop: "15px",
    marginBottom: "15px"
  },
  container: {
    position: "relative"
  },
  icon: {
    width: "14px",
    height: "20px"
  },
  hide: {
    opacity: 0
  },
  setGrabCursor: {
    cursor: "-webkit-grab"
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

const StepDot = ({ sortenabled, status, selectable }) => {
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
  return !sortenabled ? (
    <Paper style={styles.dots} elevation={2} disabled={selectable}>
      <Icon style={{ ...styles.icon, opacity: selectable ? 1 : 0.3 }} />
    </Paper>
  ) : (
    <div style={styles.checkbox}>
      <Checkbox disabled={!selectable} />
    </div>
  );
};

const editWorkflow = ({ id, displayName, amount, amountType, currency, description, status, documents }, props) => {
  // Otherwise we need to deal with undefined which causes errors in the editDialog
  const workflowitemAmount = amount ? amount : "";
  const workflowitemCurrency = currency ? currency : props.currency;
  props.showEditDialog(
    id,
    displayName,
    toAmountString(workflowitemAmount),
    amountType,
    description,
    workflowitemCurrency,
    documents
  );
};

const getInfoButton = ({ openWorkflowDetails }, status, workflowSortEnabled, workflow) => {
  return (
    <IconButton
      data-test="workflowitemInfoButton"
      disabled={workflowSortEnabled}
      style={{ ...getButtonStyle(workflowSortEnabled, status), ...styles.infoButton }}
      onClick={() => openWorkflowDetails(workflow.id)}
    >
      <InfoIcon />
    </IconButton>
  );
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

const getButtonStyle = (workflowSortEnabled, status) => {
  if (workflowSortEnabled) {
    if (status === "closed") {
      return { ...styles.hide };
    } else {
      return { ...styles.hide, ...styles.setGrabCursor };
    }
  }
  return {};
};

const getCardStyle = (workflowSortEnabled, status) => {
  let style;
  if (status === "closed") {
    style = { background: green[50] };
  } else {
    if (workflowSortEnabled) {
      style = { ...styles.setGrabCursor };
    }
  }
  return style;
};

const renderActionButtons = (
  canEditWorkflow,
  edit,
  canListWorkflowPermissions,
  showPerm,
  canCloseWorkflow,
  close,
  selectable,
  workflowSortEnabled,
  status
) => {
  return (
    <div style={{ flex: 2 }}>
      <div style={styles.actions}>
        <div style={styles.actionButton}>
          {status !== "closed" ? (
            <Tooltip
              id="tooltip-wedit"
              title={!canEditWorkflow || workflowSortEnabled ? "" : strings.common.edit}
              // Otherwise the tooltip is shacking
              PopperProps={{ style: { pointerEvents: "none" } }}
              disableFocusListener={!canEditWorkflow || workflowSortEnabled}
              disableHoverListener={!canEditWorkflow || workflowSortEnabled}
              disableTouchListener={!canEditWorkflow || workflowSortEnabled}
            >
              <div>
                <IconButton
                  onClick={!canEditWorkflow || workflowSortEnabled ? undefined : edit}
                  style={getButtonStyle(workflowSortEnabled, status)}
                  disabled={!canEditWorkflow || workflowSortEnabled}
                >
                  <EditIcon />
                </IconButton>
              </div>
            </Tooltip>
          ) : null}
        </div>
        <div style={styles.actionButton}>
          <Tooltip
            id="tooltip-wpermissions"
            title={!canListWorkflowPermissions || workflowSortEnabled ? "" : strings.common.show_permissions}
            // Otherwise the tooltip is shacking
            PopperProps={{ style: { pointerEvents: "none" } }}
            disableFocusListener={!canListWorkflowPermissions || workflowSortEnabled}
            disableHoverListener={!canListWorkflowPermissions || workflowSortEnabled}
            disableTouchListener={!canListWorkflowPermissions || workflowSortEnabled}
          >
            <div>
              <IconButton
                onClick={!canListWorkflowPermissions || workflowSortEnabled ? undefined : showPerm}
                style={getButtonStyle(workflowSortEnabled, status)}
                disabled={!canListWorkflowPermissions || workflowSortEnabled}
              >
                <PermissionIcon />
              </IconButton>
            </div>
          </Tooltip>
        </div>
        <div style={styles.actionButton}>
          {status !== "closed" ? (
            <Tooltip
              id="tooltip-wclose"
              title={!canCloseWorkflow || workflowSortEnabled ? "" : strings.common.close}
              // Otherwise the tooltip is shacking
              PopperProps={{ style: { pointerEvents: "none" } }}
              disableFocusListener={!canCloseWorkflow || workflowSortEnabled}
              disableHoverListener={!canCloseWorkflow || workflowSortEnabled}
              disableTouchListener={!canCloseWorkflow || workflowSortEnabled}
            >
              <div>
                <IconButton
                  onClick={!canCloseWorkflow || workflowSortEnabled ? undefined : close}
                  style={getButtonStyle(workflowSortEnabled, status)}
                  disabled={!canCloseWorkflow || workflowSortEnabled}
                >
                  <DoneIcon />
                </IconButton>
              </div>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const WorkflowItem = SortableElement(
  ({
    workflow,
    mapIndex,
    index,
    currentWorkflowSelectable,
    workflowSortEnabled,
    showWorkflowItemAssignee,
    parentProject,
    users,
    ...props
  }) => {
    const { id, status, displayName, amountType, assignee, currency } = workflow.data;
    const allowedIntents = workflow.allowedIntents;
    const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
    const amount = toAmountString(workflow.data.amount, currency);
    const tableStyle = styles[status];
    const subprojectId = props.id;
    const itemStyle = workflowSelectable
      ? {}
      : {
          opacity: 0.3
        };

    const showEdit = canUpdateWorkflowItem(allowedIntents) && status !== "closed";
    const showClose = canCloseWorkflowItem(allowedIntents) && workflowSelectable && status !== "closed";
    const infoButton = getInfoButton(props, status, workflowSortEnabled, workflow.data);

    const canAssign = canAssignWorkflowItem(allowedIntents) && status !== "closed";

    return (
      <div style={styles.container}>
        {createLine(mapIndex === 0, workflowSelectable)}
        <StepDot sortenabled={workflowSortEnabled} status={status} selectable={workflowSelectable} />
        <Card
          elevation={workflowSelectable ? 1 : 0}
          key={mapIndex}
          style={{ ...getCardStyle(workflowSortEnabled, status), ...styles.card }}
        >
          <div style={{ ...tableStyle, ...styles.workflowContent }}>
            <div style={{ flex: 1 }}>{infoButton}</div>
            <div style={{ ...itemStyle, ...styles.text, flex: 4 }}>
              <Typography variant="body2">{displayName}</Typography>
            </div>
            <div style={{ ...itemStyle, ...styles.listText, flex: 4 }}>
              <Typography variant="body2" component="div">
                {getAmountField(amount, amountType)}
              </Typography>
            </div>
            <div style={{ ...styles.listText, flex: 4 }}>
              <WorkflowAssigneeContainer
                projectId={parentProject ? parentProject.id : ""}
                subprojectId={subprojectId}
                workflowitemId={id}
                disabled={!canAssign}
                users={users}
                assignee={assignee}
                status={status}
              />
            </div>
            {renderActionButtons(
              showEdit,
              editWorkflow.bind(this, workflow.data, props),
              canViewWorkflowItemPermissions(allowedIntents),
              () => props.showWorkflowItemPermissions(id),
              showClose,
              () => props.closeWorkflowItem(id),
              currentWorkflowSelectable,
              workflowSortEnabled,
              status
            )}
          </div>
        </Card>
      </div>
    );
  }
);

export const RedactedWorkflowItem = SortableElement(
  ({ workflow, mapIndex, index, permissions, currentWorkflowSelectable, workflowSortEnabled, ...props }) => {
    const { status } = workflow.data;
    const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);

    const tableStyle = styles[status];

    const itemStyle = workflowSelectable ? { padding: 0 } : { padding: 0, opacity: 0.3 };

    return (
      <div style={styles.container}>
        {createLine(mapIndex === 0, workflowSelectable)}
        <StepDot status={status} selectable={workflowSelectable} />
        <Card elevation={workflowSelectable ? 1 : 0} key={mapIndex} style={styles.card}>
          <div style={{ ...tableStyle, ...styles.workflowContent }}>
            <div style={{ flex: 1 }}>
              <IconButton style={styles.infoButton}>
                <HiddenIcon />
              </IconButton>
            </div>
            <div style={{ ...itemStyle, ...styles.text, flex: 5 }}>
              <Typography variant="body2">{strings.workflow.workflow_redacted}</Typography>
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
