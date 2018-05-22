import React from "react";
import { SortableContainer } from "react-sortable-hoc";
import { WorkflowItem, RedactedWorkflowItem } from "./WorkflowItem";

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
    <div
      style={{
        width: "100%",
        height: "20%",
        margin: "0 auto",
        overflow: "auto",
        backgroundColor: "#f3f3f3",
        border: "1px solid #EFEFEF",
        borderRadius: 3
      }}
    >
      {sortableItems}
    </div>
  );
});

export default WorkflowList;
