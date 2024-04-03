import React from "react";
import { Draggable } from "react-beautiful-dnd";
import _isEmpty from "lodash/isEmpty";

import AttachmentIcon from "@mui/icons-material/Attachment";
import RejectedIcon from "@mui/icons-material/Block";
import DoneIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import OpenIcon from "@mui/icons-material/Remove";
import SwapIcon from "@mui/icons-material/SwapCalls";
import HiddenIcon from "@mui/icons-material/VisibilityOff";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import green from "@mui/material/colors/lightGreen";
import red from "@mui/material/colors/red";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { amountTypes, fromAmountString, isDateReached, toAmountString } from "../../helper.js";
import strings from "../../localizeStrings";
import { canAssignWorkflowItem, canUpdateWorkflowItem, canViewWorkflowItemPermissions } from "../../permissions.js";
import ActionButton from "../Common/ActionButton";
import StyledBadge from "../Common/StyledBadge";

import WorkflowAssigneeContainer from "./WorkflowAssigneeContainer.js";

import "./index.scss";

const styles = {
  text: {
    fontSize: "14px"
  },
  tooltip: {
    margin: "0px",
    padding: "0px 5px 0px 15px"
  },
  tooltipItem: {
    fontSize: "12px",
    margin: "5px 0"
  },
  dots: {
    height: 20,
    width: 20,
    textAlign: "center",
    display: "inline-block",
    position: "absolute",
    zIndex: "20",
    top: "21px",
    left: "16px",
    borderRadius: "10px"
  },
  checkbox: {
    height: 20,
    width: 20,
    textAlign: "center",
    display: "inline-block",
    position: "absolute",
    top: "8px",
    left: "5px",
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
    borderLeft: "2px solid black",
    height: "100%",
    left: "25px",
    bottom: "35px"
  },
  firstLine: {
    position: "absolute",
    borderLeft: "2px solid black",
    height: "38px",
    left: "25px",
    bottom: "35px"
  },
  buttonStyle: {
    minWidth: "30px",
    marginLeft: "5px"
  },
  amountChip: {
    marginLeft: "16px"
  },
  tagChip: {
    color: "theme.palette.tag.main"
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
  tagCell: {
    width: "8%",
    display: "flex",
    alignItems: "center",
    marginLeft: "16px"
  },
  typographs: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%"
  },
  card: {
    marginLeft: "50px",
    marginRight: "10px"
  },
  container: {
    position: "relative"
  },
  containerItem: {
    margin: "0 0 15px 0"
  },
  icon: {
    width: "14px",
    height: "20px"
  },
  hide: {
    opacity: 0
  },
  amountFieldContainer: {
    display: "flex"
  },
  amountField: {
    paddingTop: "4px",
    paddingLeft: "4px"
  },
  setGrabCursor: {
    cursor: "-webkit-grab"
  },
  itemByDefault: {
    marginLeft: "15vh",
    marginRight: "10px",
    marginTop: "15px",
    marginBottom: "15px"
  }
};

const createLine = (isFirst, selectable) => {
  let style = {};
  if (isFirst && selectable) {
    style = styles.firstLine;
  } else {
    style = { ...styles.line, opacity: selectable ? 1 : 0.2 };
  }
  return <div style={style} />;
};

const StepDot = (props) => {
  const {
    sortEnabled,
    status,
    selectable,
    redacted,
    storeWorkflowItemsSelected,
    storeWorkflowItemsBulkAction,
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
  const updateSelectedList = (event) => {
    if (event.target.checked) {
      selectedWorkflowItems.push(currentWorkflowItem);
    } else {
      selectedWorkflowItems.splice(
        selectedWorkflowItems.findIndex((item) => item.data.id === currentWorkflowItem.data.id),
        1
      );
    }
    storeWorkflowItemsSelected(selectedWorkflowItems);
    if (selectedWorkflowItems.length === 0) {
      storeWorkflowItemsBulkAction("");
    }
  };
  return isWorkflowItemSelectable(redacted, sortEnabled, allowedIntents) ? (
    <div style={styles.checkbox}>
      <Checkbox
        onChange={updateSelectedList}
        checked={!!selectedWorkflowItems.find((item) => item.data.id === currentWorkflowItem.data.id)}
        data-test="check-workflowitem"
      />
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
    (i) =>
      i === "workflowitem.intent.listPermissions" ||
      i === "workflowitem.intent.grantPermission" ||
      i === "workflowitem.intent.revokePermission"
  );
  // a user must have assign permissions or all three permission handling permissions
  return allowedIntents.includes("workflowitem.assign") || intents.length === 3 ? true : false;
}

const editWorkflow = (
  {
    id,
    displayName,
    amount,
    exchangeRate,
    amountType,
    currency,
    description,
    _status,
    documents,
    dueDate,
    workflowitemType,
    tags
  },
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
    documents,
    dueDate,
    workflowitemType,
    tags
  );
};

const getInfoButton = (props, status, workflowSortEnabled, workflow) => {
  const { openWorkflowDetails, projectId, subProjectId } = props;

  const showBadge = status === "open" && isDateReached(workflow.dueDate) && !workflowSortEnabled;
  return (
    <>
      <StyledBadge
        variant="dot"
        invisible={!showBadge}
        data-test={
          showBadge ? `info-warning-badge-enabled-${workflow.id}` : `info-warning-badge-disabled-${workflow.id}`
        }
        style={styles.buttonStyle}
      >
        <IconButton
          aria-label="show info"
          disabled={workflowSortEnabled}
          className={getButtonStyle(workflowSortEnabled, status)}
          onClick={() => openWorkflowDetails(projectId, subProjectId, workflow.id)}
          data-test={`workflowitem-info-button-${workflow.id}`}
          size="large"
        >
          <InfoIcon />
        </IconButton>
      </StyledBadge>
    </>
  );
};

const getAttachmentButton = ({ openWorkflowDetails, projectId, subProjectId }, workflow) => {
  const { documents } = workflow;
  const showAttachFileBadge = documents && documents.length > 0;
  const showToolTip = documents && documents.length > 0 && documents.some((doc) => doc.fileName !== undefined);

  return (
    <div>
      {showAttachFileBadge && showToolTip && (
        <StyledBadge
          variant="dot"
          invisible={!showAttachFileBadge}
          data-test={`attachment-file-badge-show-${workflow.id}`}
          style={styles.buttonStyle}
        >
          <IconButton
            aria-label="show attachment"
            style={{ cursor: "default" }}
            data-test={`workflowitem-attachment-file-button-${workflow.id}`}
            size="large"
            onClick={() => {
              const documentTab = 1;
              openWorkflowDetails(projectId, subProjectId, workflow.id, documentTab);
            }}
          >
            <AttachmentIcon />
          </IconButton>
        </StyledBadge>
      )}
    </div>
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
    <Tooltip data-test={"amount-explanation-" + sourceCurrency} title={amountExplanationTitle}>
      <SwapIcon />
    </Tooltip>
  );
  const isAmountDisplayed = amount !== undefined && exchangeRate !== undefined;
  return (
    <div style={styles.amountFieldContainer}>
      {isAmountDisplayed ? (
        <div style={styles.chipDiv}>
          <div>{amountToShow}</div>
          <div style={styles.amountField}>{fromAmountString(exchangeRate) !== 1 ? amountExplaination : null}</div>
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
      return "hide";
    } else {
      return "hide grab-cursor";
    }
  }
  return "";
};

const getCardStyle = (workflowSortEnabled, status, rejected) => {
  let style = {};
  if (status === "closed" && !rejected) {
    style = { background: green[50] };
  }
  if (status === "closed" && rejected) {
    style = { background: red[50] };
  }
  if (status !== "closed" && workflowSortEnabled) {
    style = { ...style, ...styles.setGrabCursor };
  }
  return style;
};

const renderActionButtons = ({
  canEditWorkflow,
  edit,
  canListWorkflowPermissions,
  showPerm,
  canCloseWorkflow,
  close,
  workflowSortEnabled,
  status,
  showAdditionalData,
  additionalData,
  rejectReason,
  showReasonDialog,
  reject
}) => {
  const additionalDataDisabled = _isEmpty(additionalData) || workflowSortEnabled;
  const editDisabled = !canEditWorkflow || workflowSortEnabled;
  const permissionsDisabled = !canListWorkflowPermissions || workflowSortEnabled;
  const closeDisabled = !canCloseWorkflow || workflowSortEnabled;
  const statusIsClosed = workflowSortEnabled || status === "closed" || closeDisabled;

  return (
    <div style={styles.actionCell}>
      <div style={styles.actions}>
        <ActionButton
          ariaLabel="show additional data"
          notVisible={additionalDataDisabled || status === "closed" || additionalDataDisabled}
          onClick={additionalDataDisabled ? undefined : showAdditionalData}
          icon={<MoreIcon />}
          title={additionalDataDisabled ? "" : strings.common.additional_data}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          data-test="additional-workflowitem-data-icon"
          className={getButtonStyle(workflowSortEnabled, status)}
        />
        <ActionButton
          ariaLabel="edit workflowitem"
          notVisible={workflowSortEnabled || status === "closed" || editDisabled}
          onClick={editDisabled ? undefined : edit}
          icon={<EditIcon />}
          title={editDisabled ? "" : strings.common.edit}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          data-test="edit-workflowitem"
          className={getButtonStyle(workflowSortEnabled, status)}
        />
        {workflowSortEnabled || permissionsDisabled ? null : (
          <ActionButton
            ariaLabel="show workflowitem permissions"
            notVisible={workflowSortEnabled || permissionsDisabled}
            onClick={permissionsDisabled ? undefined : showPerm}
            icon={<PermissionIcon />}
            title={permissionsDisabled ? "" : strings.common.show_permissions}
            workflowSortEnabled={workflowSortEnabled}
            status={status}
            data-test="show-workflowitem-permissions"
            className={getButtonStyle(workflowSortEnabled, status)}
          />
        )}

        {statusIsClosed ? null : (
          <>
            <ActionButton
              ariaLabel="reject workflowitem"
              onClick={closeDisabled ? undefined : reject}
              icon={<RejectedIcon />}
              title={closeDisabled ? "" : strings.common.reject}
              workflowSortEnabled={workflowSortEnabled}
              status={status}
              className={getButtonStyle(workflowSortEnabled, status)}
              data-test="reject-workflowitem"
            />

            <ActionButton
              ariaLabel="close workflowitem"
              onClick={closeDisabled ? undefined : close}
              icon={<DoneIcon />}
              title={closeDisabled ? "" : strings.common.close}
              workflowSortEnabled={workflowSortEnabled}
              status={status}
              className={getButtonStyle(workflowSortEnabled, status)}
              data-test="close-workflowitem"
            />
          </>
        )}

        <ActionButton
          ariaLabel="closed workflowitem reject reason"
          notVisible={status !== "closed" || !rejectReason}
          onClick={rejectReason ? showReasonDialog : undefined}
          icon={<ErrorOutlineIcon />}
          title={strings.common.rejected}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
          className={getButtonStyle(workflowSortEnabled, status)}
          data-test="closed-workflowitem-reject-reason"
        />
      </div>
    </div>
  );
};

export const WorkflowItem = ({
  workflow,
  mapIndex,
  index,
  currentWorkflowSelectable,
  workflowSortEnabled,
  users,
  currentUser,
  ...props
}) => {
  const {
    storeWorkflowItemsSelected,
    storeWorkflowItemsBulkAction,
    selectedWorkflowItems,
    currency: targetCurrency,
    disabled
  } = props;
  const {
    id,
    status,
    displayName,
    amountType,
    amount,
    assignee,
    exchangeRate,
    currency: sourceCurrency,
    rejectReason,
    additionalData,
    tags
  } = workflow.data;
  const allowedIntents = workflow.allowedIntents;
  const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
  const itemStyle = workflowSelectable ? {} : { opacity: 0.31 };
  const canEditWorkflow = canUpdateWorkflowItem(allowedIntents) && status !== "closed";
  const infoButton = getInfoButton(props, status, workflowSortEnabled, workflow.data);
  const attachmentButton = getAttachmentButton(props, workflow.data);
  const canAssign = canAssignWorkflowItem(allowedIntents) && status !== "closed";
  const canCloseWorkflow = currentUser === assignee && workflowSelectable && status !== "closed";

  return (
    <div style={styles.container} data-test={`workflowitem-container-${id}`}>
      <Draggable draggableId={`draggable-${id}`} key={id} index={index} isDragDisabled={disabled}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              ...styles.containerItem
            }}
          >
            {createLine(mapIndex === 0, workflowSelectable)}
            <StepDot
              sortEnabled={workflowSortEnabled}
              status={status}
              selectable={workflowSelectable}
              storeWorkflowItemsSelected={storeWorkflowItemsSelected}
              storeWorkflowItemsBulkAction={storeWorkflowItemsBulkAction}
              currentWorkflowItem={workflow}
              selectedWorkflowItems={selectedWorkflowItems}
              allowedIntents={allowedIntents}
            />
            <Card
              data-test="selectable-card"
              elevation={workflowSelectable ? 1 : 0}
              key={mapIndex}
              style={{ ...getCardStyle(workflowSortEnabled, status, rejectReason), ...styles.card }}
            >
              <div style={styles.workflowContent} data-test={`workflowitem-${id}`}>
                <div style={styles.infoCell}>{infoButton}</div>
                <div style={styles.infoCell}>{attachmentButton}</div>
                <div style={{ ...styles.text, ...styles.workflowCell, ...itemStyle }}>
                  <Typography variant="body2" style={styles.typographs}>
                    {displayName}
                  </Typography>
                </div>
                <div style={{ ...styles.workflowCell, ...itemStyle }}>
                  <Typography variant="body2" style={styles.typographs} component="div" data-test="workflowitem-amount">
                    {amountType === "N/A"
                      ? amountTypes(amountType)
                      : getAmountField(amount, amountType, exchangeRate, sourceCurrency, targetCurrency)}
                  </Typography>
                </div>
                <div style={styles.workflowCell} data-test="outside">
                  <WorkflowAssigneeContainer
                    workflowitemId={id}
                    workflowitemDisplayName={displayName}
                    disabled={!canAssign}
                    users={users}
                    assignee={assignee}
                    status={status}
                  />
                </div>
                <div style={styles.tagCell}>
                  {tags.length > 0 && (
                    <Chip
                      label={tags[0]}
                      size="small"
                      onClick={(event) => {
                        props.storeWorkflowitemSearchTerm(`tag:${event.target.innerText}`);
                      }}
                      sx={{ backgroundColor: (theme) => theme.palette.tag.main, color: "white" }}
                    />
                  )}
                </div>
                {renderActionButtons({
                  canEditWorkflow,
                  edit: editWorkflow.bind(this, workflow.data, props),
                  canListWorkflowPermissions: canViewWorkflowItemPermissions(allowedIntents),
                  showPerm: () => props.showWorkflowItemPermissions(id, displayName),
                  canCloseWorkflow,
                  close: () => props.closeWorkflowItem(id),
                  workflowSortEnabled,
                  status,
                  showAdditionalData: () => props.showWorkflowitemAdditionalData(id),
                  additionalData,
                  rejectReason,
                  showReasonDialog: () => props.showReasonDialog(rejectReason),
                  reject: () => props.rejectWorkflowItem(id)
                })}
              </div>
            </Card>
          </div>
        )}
      </Draggable>
    </div>
  );
};

export const RedactedWorkflowItem = ({
  workflow,
  mapIndex,
  index,
  currentWorkflowSelectable,
  workflowSortEnabled,
  disabled
}) => {
  const { id, status } = workflow.data;
  const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status);
  const itemStyle = workflowSelectable ? { padding: 0 } : { padding: 0, opacity: 0.3 };

  return (
    <div style={styles.container} data-test={`workflowitem-container-${id}`}>
      <Draggable draggableId={`draggable-${id}`} key={id} index={index} isDragDisabled={disabled}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              ...styles.containerItem
            }}
          >
            {createLine(mapIndex === 0, workflowSelectable)}
            <StepDot status={status} selectable={workflowSelectable} redacted={true} />
            <Card
              data-test="redacted-selectable-card"
              elevation={workflowSelectable ? 1 : 0}
              key={mapIndex}
              style={styles.card}
            >
              <div style={styles.workflowContent}>
                <div style={{ flex: 1 }}>
                  <IconButton aria-label="Hidden Icon" style={styles.buttonStyle} size="large">
                    <HiddenIcon />
                  </IconButton>
                </div>
                <div style={{ ...styles.text, ...styles.workflowCell, ...itemStyle }}>
                  <Typography variant="body2" style={styles.typographs}>
                    {strings.workflow.workflow_redacted}
                  </Typography>
                </div>
                <div style={{ ...itemStyle, flex: 5 }}>{null}</div>
                <div style={{ ...styles.chipRow, flex: 2 }}>{null}</div>
                {null}
              </div>
            </Card>
          </div>
        )}
      </Draggable>
    </div>
  );
};
