import React from "react";
import { Draggable } from "react-beautiful-dnd";
import _isEmpty from "lodash/isEmpty";

import AttachmentIcon from "@mui/icons-material/Attachment";
import RejectedIcon from "@mui/icons-material/Block";
import DoneIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import OpenIcon from "@mui/icons-material/Remove";
import SwapIcon from "@mui/icons-material/SwapCalls";
import HiddenIcon from "@mui/icons-material/VisibilityOff";
import { Popover } from "@mui/material";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { amountTypes, fromAmountString, isDateReached, toAmountString } from "../../helper.js";
import strings from "../../localizeStrings";
import { canAssignWorkflowItem, canUpdateWorkflowItem, canViewWorkflowItemPermissions } from "../../permissions.js";
import ActionButton from "../Common/ActionButton";
import StyledBadge from "../Common/StyledBadge";

import { ChipStatus } from "./ChipStatus.js";
import WorkflowAssigneeContainer from "./WorkflowAssigneeContainer.js";

import "./WorkflowItem.scss";

const createLine = (isFirst, selectable) => {
  let className = "";
  if (isFirst && selectable) {
    className = "first-line";
  } else {
    className = selectable ? "line" : "line not-selectable";
  }
  return <div className={className} />;
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
    <div className="workflow-checkbox">
      <Checkbox
        onChange={updateSelectedList}
        checked={!!selectedWorkflowItems.find((item) => item.data.id === currentWorkflowItem.data.id)}
        data-test="check-workflowitem"
      />
    </div>
  ) : (
    <Paper className="dots" elevation={2} disabled={selectable}>
      <Icon className={selectable ? "workflow-icon" : "workflow-icon not-selectable"} />
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
    tags,
    fundingOrganization,
    markdown
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
    tags,
    fundingOrganization,
    markdown
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
        className="button-style"
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
          className="button-style"
        >
          <IconButton
            aria-label="show attachment"
            className="default-cursor"
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

const isWorkflowSelectable = (currentWorkflowSelectable, workflowSortEnabled, status, workflowMode) => {
  const workflowSortable = status === "open";
  return workflowSortEnabled ? workflowSortable : workflowMode === "unordered" ? true : currentWorkflowSelectable;
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
    <div className="amount-field-container">
      {isAmountDisplayed ? (
        <div className="chip-container">
          <div>{amountToShow}</div>
          <div className="amount-field">{fromAmountString(exchangeRate) !== 1 ? amountExplaination : null}</div>
        </div>
      ) : null}
      <div>
        <Chip className="amount-chip" label={amountTypes(type)} />
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
  if (status === "closed" && !rejected) {
    return "workflow-item-card green";
  }
  if (status === "closed" && rejected) {
    return "workflow-item-card red";
  }
  if (status !== "closed" && workflowSortEnabled) {
    return "workflow-item-card grab-cursor";
  }
  return "workflow-item-card";
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
    <div className="action-cell">
      <div className="workflow-item-actions">
        <ActionButton
          ariaLabel="show additional data"
          notVisible={additionalDataDisabled || status === "closed"}
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
    disabled,
    workflowMode
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
  const workflowSelectable = isWorkflowSelectable(currentWorkflowSelectable, workflowSortEnabled, status, workflowMode);
  const canEditWorkflow = canUpdateWorkflowItem(allowedIntents) && status !== "closed";
  const infoButton = getInfoButton(props, status, workflowSortEnabled, workflow.data);
  const attachmentButton = getAttachmentButton(props, workflow.data);
  const canAssign = canAssignWorkflowItem(allowedIntents) && status !== "closed";
  const canCloseWorkflow = currentUser === assignee && workflowSelectable && status !== "closed";

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const popoverId = open ? "simple-popover" : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const calculateStatus = (status, workflowSelectable, workflowSortEnabled) => {
    if (workflowSortEnabled) {
      return status;
    } else {
      if (status === "open" && workflowSelectable) {
        return "ongoing";
      } else {
        return status;
      }
    }
  };

  return (
    <div className="workflow-item-container" data-test={`workflowitem-container-${id}`}>
      <Draggable draggableId={`draggable-${id}`} key={id} index={index} isDragDisabled={disabled}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style
            }}
            className="container-item"
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
              className={getCardStyle(workflowSortEnabled, status, rejectReason)}
            >
              <div className="workflow-item-content" data-test={`workflowitem-${id}`}>
                <div className="info-cell">{infoButton}</div>
                <div className="info-cell">{attachmentButton}</div>
                <div className={workflowSelectable ? "workflow-cell" : "workflow-cell not-selectable"}>
                  <Tooltip id="workflow-title" title={displayName}>
                    <Typography variant="body2" className="workflow-item-title">
                      {displayName}
                    </Typography>
                  </Tooltip>
                </div>
                <div className={workflowSelectable ? "budget-cell" : "budget-cell not-selectable"}>
                  <Typography variant="body2" className="typographs" component="div" data-test="workflowitem-amount">
                    {amountType === "N/A"
                      ? amountTypes(amountType)
                      : getAmountField(amount, amountType, exchangeRate, sourceCurrency, targetCurrency)}
                  </Typography>
                </div>
                <div className="status-cell">
                  <ChipStatus status={calculateStatus(status, workflowSelectable, workflowSortEnabled)} />
                </div>
                <div className="workflow-cell" data-test="outside">
                  <WorkflowAssigneeContainer
                    workflowitemId={id}
                    workflowitemDisplayName={displayName}
                    disabled={!canAssign}
                    users={users}
                    assignee={assignee}
                    status={status}
                  />
                </div>
                <div className="tag-cell">
                  {tags.length > 0 && (
                    <div className="tags-row">
                      <div className="tag-chips">
                        <Chip
                          label={tags[0]}
                          size="small"
                          onClick={(event) => {
                            props.storeWorkflowitemSearchTerm(`tag:${event.target.innerText}`);
                          }}
                          sx={{ backgroundColor: (theme) => theme.palette.tag.main, color: "white" }}
                        />
                      </div>
                      <div>
                        <IconButton aria-label="expand" aria-describedby={popoverId} onClick={handleClick}>
                          {open ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                        <Popover
                          id={popoverId}
                          open={open}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "top",
                            horizontal: "left"
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right"
                          }}
                        >
                          <div className="tags-popover">
                            {tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                onClick={(event) => {
                                  props.storeWorkflowitemSearchTerm(`tag:${event.target.innerText}`);
                                }}
                                sx={{ backgroundColor: (theme) => theme.palette.tag.main, color: "white" }}
                              />
                            ))}
                          </div>
                        </Popover>
                      </div>
                    </div>
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

  return (
    <div className="workflow-item-container" data-test={`workflowitem-container-${id}`}>
      <Draggable draggableId={`draggable-${id}`} key={id} index={index} isDragDisabled={disabled}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style
            }}
            className="container-item"
          >
            {createLine(mapIndex === 0, workflowSelectable)}
            <StepDot status={status} selectable={workflowSelectable} redacted={true} />
            <Card
              data-test="redacted-selectable-card"
              elevation={workflowSelectable ? 1 : 0}
              key={mapIndex}
              className="workflow-item-card"
            >
              <div className="workflow-item-content">
                <div className="hidden-icon-container">
                  <IconButton aria-label="Hidden Icon" className="button-style" size="large">
                    <HiddenIcon />
                  </IconButton>
                </div>
                <div
                  className={workflowSelectable ? "redacted-workflow-cell" : "redacted-workflow-cell not-selectable"}
                >
                  <Typography variant="body2" className="typographs">
                    {strings.workflow.workflow_redacted}
                  </Typography>
                </div>
                <div
                  className={workflowSelectable ? "redacted-big-item-style" : "redacted-big-item-style not-selectable"}
                >
                  {null}
                </div>
                <div className="chip-row">{null}</div>
                {null}
              </div>
            </Card>
          </div>
        )}
      </Draggable>
    </div>
  );
};
