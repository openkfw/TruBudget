import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import SingleSelection from "../Common/SingleSelection";

import { assignWorkflowItem } from "./actions";

import "./WorkflowAssigneeContainer.scss";

class WorkflowAssigneeContainer extends Component {
  getWorkflowAssignee = (workflowItems, selectedId) => {
    if (workflowItems.length === 0 || !selectedId) {
      return "";
    }
    const selectedWorkflowItem = workflowItems.find((workflow) => workflow.data.id === selectedId);
    return selectedWorkflowItem.data.assignee;
  };

  render() {
    const {
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      workflowitemId,
      workflowitemDisplayName,
      workflowItems,
      users,
      title,
      disabled,
      workflowSortEnabled,
      status,
      assignWorkflowitem,
      hasSubprojectValidator
    } = this.props;
    const assignee = this.getWorkflowAssignee(workflowItems, workflowitemId);

    return (
      <div className="assignee-container" data-test={`workflowitem-assignee-${workflowitemId}`}>
        <SingleSelection
          selectId={assignee}
          disabled={disabled || workflowSortEnabled || hasSubprojectValidator}
          selectableItems={users}
          title={title}
          onSelect={(assigneeId, assigneeDisplayName) =>
            assignWorkflowitem(
              projectId,
              projectDisplayName,
              subprojectId,
              subprojectDisplayName,
              workflowitemId,
              workflowitemDisplayName,
              assigneeId,
              assigneeDisplayName
            )
          }
          workflowSortEnabled={workflowSortEnabled}
          status={status}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    projectId: state.getIn(["workflow", "parentProject", "id"]),
    subprojectId: state.getIn(["workflow", "id"]),
    projectDisplayName: state.getIn(["workflow", "parentProject", "displayName"]),
    subprojectDisplayName: state.getIn(["workflow", "displayName"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    workflowSortEnabled: state.getIn(["workflow", "workflowSortEnabled"]),
    assigner: state.getIn(["login", "id"]),
    hasSubprojectValidator: state.getIn(["workflow", "hasSubprojectValidator"])
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    assignWorkflowitem: (
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      workflowitemId,
      workflowitemDisplayName,
      assigneeId,
      assigneeDisplayName
    ) =>
      dispatch(
        assignWorkflowItem(
          projectId,
          projectDisplayName,
          subprojectId,
          subprojectDisplayName,
          workflowitemId,
          workflowitemDisplayName,
          assigneeId,
          assigneeDisplayName
        )
      )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowAssigneeContainer));
