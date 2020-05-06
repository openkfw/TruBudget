import Fab from "@material-ui/core/Fab";
import DoneIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import _isEmpty from "lodash/isEmpty";
import React from "react";
import { SortableContainer } from "react-sortable-hoc";

import { canReorderWorkflowItems } from "../../permissions.js";
import { RedactedWorkflowItem, WorkflowItem } from "./WorkflowItem";

const styles = {
  editButtonContainer: {
    position: "absolute",
    top: "72px",
    left: "7px"
  },
  editButton: {
    position: "relative",
    zIndex: 2
  },
  workflowItemsContainer: {
    width: "100%",
    height: "20%",
    margin: "0 auto",
    overflow: "auto",
    backgroundColor: "#f3f3f3",
    border: "1px solid #EFEFEF",
    borderRadius: 3
  }
};

const renderSortButton = props => (
  <Fab
    size="small"
    disabled={
      !canReorderWorkflowItems(props.allowedIntents) || props.status === "closed" || _isEmpty(props.workflowItems)
    }
    onClick={() => handleEnableWorkflowEdit(props)}
    style={styles.editButton}
  >
    <EditIcon />
  </Fab>
);

const handleEnableWorkflowEdit = props => {
  const workflowItemIds = [];
  props.workflowItems.map(item => workflowItemIds.push(item.data.id));
  props.saveWorkflowItemsBeforeSort(workflowItemIds);
  props.enableWorkflowEdit();
};

const renderSubmitSortButton = props => (
  <Fab size="small" onClick={() => handleSubmitEdit(props)} style={styles.editButton}>
    <DoneIcon />
  </Fab>
);

const handleSubmitEdit = props => {
  const currentWorkflowItemIds = [];
  props.workflowItems.map(item => currentWorkflowItemIds.push(item.data.id));
  const hasChanged =
    currentWorkflowItemIds.find((id, index) => props.workflowItemsBeforeSort[index] !== id) !== undefined;
  if (hasChanged) {
    props.reorderWorkflowItems(props.projectId, props.subProjectId, props.workflowItems);
  }
  props.disableWorkflowEdit();
};

const getSortableItems = ({ workflowItems, ...props }) => {
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

const WorkflowList = SortableContainer(props => {
  const sortableItems = getSortableItems(props);
  return (
    <div style={styles.workflowItemsContainer}>
      <div style={styles.editButtonContainer}>
        {!props.workflowSortEnabled ? renderSortButton(props) : renderSubmitSortButton(props)}
      </div>
      {sortableItems}
    </div>
  );
});

export default WorkflowList;
