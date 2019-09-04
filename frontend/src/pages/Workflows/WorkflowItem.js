import Card from "@material-ui/core/Card";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import green from "@material-ui/core/colors/lightGreen";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import DoneIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import PermissionIcon from "@material-ui/icons/LockOpen";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import OpenIcon from "@material-ui/icons/Remove";
import SwapIcon from "@material-ui/icons/SwapCalls";
import HiddenIcon from "@material-ui/icons/VisibilityOff";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import { SortableElement } from "react-sortable-hoc";
import ActionButton from "../Common/ActionButton";

import { amountTypes, fromAmountString, toAmountString } from "../../helper.js";
import strings from "../../localizeStrings";
import {
  canAssignWorkflowItem,
  canCloseWorkflowItem,
  canUpdateWorkflowItem,
  canViewWorkflowItemPermissions
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
    width: "25%"
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
    minWidth: "30px",
    marginLeft: "5px"
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
    justifyContent: "space-between",
    overflow: "hidden",
    padding: "4px 8px 4px 4px"
  },
  infoCell: {
    width: "8%",
    display: "flex",
    alignItems: "center"
  },
  workflowCell: {
    width: "25%",
    display: "flex",
    alignItems: "center"
  },
  actionCell: {
    width: "20%",
    display: "flex",
    alignItems: "center"
  },
  typographs: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%"
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

const StepDot = props => {
  const {
    sortEnabled,
    status,
    selectable,
    redacted,
    storeWorkflowItemsSelected,
    selectedWorkflowItems,
    currentWorkflowItem,
    allowedIntents
  } = props;
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
  const updateSelectedList = event => {
    if (event.target.checked) {
      selectedWorkflowItems.push(currentWorkflowItem);
    } else {
      selectedWorkflowItems.splice(selectedWorkflowItems.indexOf(currentWorkflowItem), 1);
    }
    storeWorkflowItemsSelected(selectedWorkflowItems);
  };
  return isWorkflowItemSelectable(redacted, sortEnabled, allowedIntents) ? (
    <div style={styles.checkbox}>
      <Checkbox onChange={updateSelectedList} />
    </div>
  ) : (
    <Paper style={styles.dots} elevation={2} disabled={selectable}>
      <Icon style={{ ...styles.icon, opacity: selectable ? 1 : 0.3 }} />
    </Paper>
  );
};

function isWorkflowItemSelectable(redacted, sortenabled, allowedIntents) {
  if (redacted || !sortenabled) {
    return false;
  }
  const intents = allowedIntents.filter(
    i =>
      i === "workflowitem.intent.listPermissions" ||
      i === "workflowitem.intent.grantPermission" ||
      i === "workflowitem.intent.revokePermission"
  );
  // a user must have assign permissions or all three permission handling permissions
  return allowedIntents.includes("workflowitem.assign") || intents.length === 3 ? true : false;
}
const editWorkflow = (
  { id, displayName, amount, exchangeRate, amountType, currency, description, status, documents },
  props
) => {
  // Otherwise we need to deal with undefined which causes errors in the editDialog
  const workflowitemAmount = amount ? amount : "";
  const workflowitemCurrency = currency ? currency : props.currency;
  exchangeRate = parseFloat(exchangeRate);
  props.showEditDialog(
    id,
    displayName,
    toAmountString(workflowitemAmount),
    exchangeRate,
    amountType,
    description,
    workflowitemCurrency,
    documents
  );
};

const getInfoButton = ({ openWorkflowDetails }, status, workflowSortEnabled, workflow) => {
  return (
    <IconButton
      className="workflowitem-info-button"
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

const getAmountField = (amount, type, exchangeRate, sourceCurrency, targetCurrency) => {
  const amountToShow = toAmountString(amount * exchangeRate, targetCurrency);

  const amountExplanationTitle = toAmountString(amount, sourceCurrency) + " x " + exchangeRate;
  const amountExplaination = (
    <Tooltip data-test="amount-explanation" title={amountExplanationTitle}>
      <SwapIcon />
    </Tooltip>
  );
  const isAmountDisplayed = amount !== undefined && exchangeRate !== undefined;
  return (
    <div>
      {isAmountDisplayed ? (
        <div style={styles.chipDiv}>
          <div>{amountToShow}</div>
          <div
            style={{
              paddingTop: "4px",
              paddingLeft: "4px"
            }}
          >
            {fromAmountString(exchangeRate) !== 1 ? amountExplaination : null}
          </div>
        </div>
      ) : null}
      <div>
        <Chip style={styles.amountChip} label={amountTypes(type)} />
      </div>
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
  status,
  showAdditionalData,
  additionalData
) => {
  const additionalDataDisabled = _isEmpty(additionalData) || workflowSortEnabled;
  const editDisabled = !canEditWorkflow || workflowSortEnabled;
  const permissionsDisabled = !canListWorkflowPermissions || workflowSortEnabled;

  const closeDisabled = !canCloseWorkflow || workflowSortEnabled;
  return (
    <div style={styles.actionCell}>
      <div style={styles.actions}>
        <ActionButton
          notVisible={additionalDataDisabled || status === "closed" || additionalDataDisabled}
          onClick={additionalDataDisabled ? undefined : showAdditionalData}
          icon={<MoreIcon />}
          title={additionalDataDisabled ? "" : strings.common.additional_data}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          data-test="additional-workflowitem-data-icon"
          iconButtonStyle={getButtonStyle(workflowSortEnabled, status)}
        />
        <ActionButton
          notVisible={workflowSortEnabled || status === "closed" || editDisabled}
          onClick={editDisabled ? undefined : edit}
          icon={<EditIcon />}
          title={editDisabled ? "" : strings.common.edit}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          data-test="edit-workflowitem"
          iconButtonStyle={getButtonStyle(workflowSortEnabled, status)}
        />
        <ActionButton
          notVisible={workflowSortEnabled || permissionsDisabled}
          onClick={permissionsDisabled ? undefined : showPerm}
          icon={<PermissionIcon />}
          title={permissionsDisabled ? "" : strings.common.show_permissions}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          data-test="show-workflowitem-permissions"
          iconButtonStyle={getButtonStyle(workflowSortEnabled, status)}
        />
        <ActionButton
          notVisible={workflowSortEnabled || status === "closed" || closeDisabled}
          onClick={closeDisabled ? undefined : close}
          icon={<DoneIcon />}
          title={closeDisabled ? "" : strings.common.close}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          iconButtonStyle={getButtonStyle(workflowSortEnabled, status)}
        />
      </div>
    </div>
  );
};

export const WorkflowItem = SortableElement(
  ({ workflow, mapIndex, index, currentWorkflowSelectable, workflowSortEnabled, parentProject, users, ...props }) => {
    const { storeWorkflowItemsSelected, selectedWorkflowItems, currency: targetCurrency } = props;
    const {
      id,
      status,
      displayName,
      amountType,
      amount,
      assignee,
      exchangeRate,
      currency: sourceCurrency,
      additionalData
    } = workflow.data;
    const allowedIntents = workflow.allowedIntents;
    const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
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
        <StepDot
          sortEnabled={workflowSortEnabled}
          status={status}
          selectable={workflowSelectable}
          storeWorkflowItemsSelected={storeWorkflowItemsSelected}
          currentWorkflowItem={workflow}
          selectedWorkflowItems={selectedWorkflowItems}
          allowedIntents={allowedIntents}
        />
        <Card
          elevation={workflowSelectable ? 1 : 0}
          key={mapIndex}
          style={{ ...getCardStyle(workflowSortEnabled, status), ...styles.card }}
        >
          <div style={{ ...tableStyle, ...styles.workflowContent }}>
            <div style={styles.infoCell}>{infoButton}</div>
            <div style={{ ...itemStyle, ...styles.text, ...styles.workflowCell }}>
              <Typography variant="body2" style={styles.typographs}>
                {displayName}
              </Typography>
            </div>
            <div style={{ ...itemStyle, ...styles.listText, ...styles.workflowCell }}>
              <Typography variant="body2" style={styles.typographs} component="div" data-test="workflowitem-amount">
                {amountType === "N/A"
                  ? amountTypes(amountType)
                  : getAmountField(amount, amountType, exchangeRate, sourceCurrency, targetCurrency)}
              </Typography>
            </div>
            <div style={{ ...styles.listText, ...styles.workflowCell }} data-test="outside">
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
              status,
              () => props.showWorkflowitemAdditionalData(id),
              additionalData
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
        <StepDot status={status} selectable={workflowSelectable} redacted={true} />
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
