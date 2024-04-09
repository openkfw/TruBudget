import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import _isEmpty from "lodash/isEmpty";

import DoneIcon from "@mui/icons-material/Check";
import ReorderIcon from "@mui/icons-material/Reorder";
import Fab from "@mui/material/Fab";

import { canReorderWorkflowItems } from "../../permissions.js";

import { StrictModeDroppable as Droppable } from "./StrictModeDroppable.js";
import { RedactedWorkflowItem, WorkflowItem } from "./WorkflowItem";

import "./WorkflowList.scss";

const renderSortButton = (props) => (
  <Fab
    aria-label="enable workflowitem sort"
    size="small"
    disabled={
      !canReorderWorkflowItems(props.allowedIntents) ||
      props.status === "closed" ||
      _isEmpty(props.workflowItems) ||
      props.searchTerm.length > 0
    }
    onClick={() => handleEnableWorkflowEdit(props)}
    className="edit-button"
    data-test="enable-workflowitem-sort"
  >
    <ReorderIcon />
  </Fab>
);

const handleEnableWorkflowEdit = (props) => {
  const workflowItemIds = [];
  props.workflowItems.map((item) => workflowItemIds.push(item.data.id));
  props.saveWorkflowItemsBeforeSort(workflowItemIds);
  props.enableWorkflowEdit();
};

const renderSubmitSortButton = (props) => (
  <Fab
    aria-label="submit workflowitem sort"
    size="small"
    onClick={() => handleSubmitEdit(props)}
    className="edit-button"
    data-test="submit-workflowitem-sort"
  >
    <DoneIcon />
  </Fab>
);

const handleSubmitEdit = (props) => {
  const currentWorkflowItemIds = [];
  props.workflowItems.map((item) => currentWorkflowItemIds.push(item.data.id));
  const hasChanged =
    currentWorkflowItemIds.find((id, index) => props.workflowItemsBeforeSort[index] !== id) !== undefined;
  if (hasChanged) {
    props.reorderWorkflowItems(props.projectId, props.subProjectId, props.workflowItems);
  }
  props.disableWorkflowEdit();
};

const renderSortableItems = ({ workflowItems, ...props }) => {
  let nextWorkflowNotSelectable = false;

  return workflowItems.map((workflow, index) => {
    const { displayName, amount, status } = workflow.data;
    const redacted = displayName === null && amount === null;
    const currentWorkflowSelectable = !nextWorkflowNotSelectable;

    if (!nextWorkflowNotSelectable) {
      nextWorkflowNotSelectable = status === "open";
    }
    return redacted ? (
      <RedactedWorkflowItem
        disabled={!props.workflowSortEnabled || status !== "open"}
        key={`item-${index}`}
        index={index}
        mapIndex={index}
        workflow={workflow}
        currentWorkflowSelectable={currentWorkflowSelectable}
        {...props}
      />
    ) : (
      <WorkflowItem
        disabled={!props.workflowSortEnabled || status !== "open"}
        key={`item-${index}`}
        index={index}
        mapIndex={index}
        workflow={workflow}
        currentWorkflowSelectable={currentWorkflowSelectable}
        {...props}
      />
    );
  });
};

const WorkflowList = (props) => {
  const { onSortEnd } = props;
  const onDragEnd = (result) => {
    onSortEnd({ oldIndex: result.source.index, newIndex: result.destination.index });
  };

  const sortableItems = renderSortableItems(props);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="workflow-list-container">
            <div className="edit-button-container">
              {!props.workflowSortEnabled ? renderSortButton(props) : renderSubmitSortButton(props)}
            </div>
            <div className="sortable-container">{sortableItems}</div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default WorkflowList;
