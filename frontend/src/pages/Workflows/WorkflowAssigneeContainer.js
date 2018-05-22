import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignWorkflowItem } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";

class WorkflowAssigneeContainer extends Component {
  assignWorkflow = userId => {
    const { projectId, subprojectId, workflowitemId } = this.props;
    this.props.assignWorkflow(projectId, subprojectId, workflowitemId, userId);
  };

  getWorkflowAssignee = (workflowItems, selectedId) => {
    if (workflowItems.length === 0 || !selectedId) {
      return "";
    }
    const selectedWorkflowItem = workflowItems.find(workflow => workflow.data.id === selectedId);
    return selectedWorkflowItem.data.assignee;
  };

  render() {
    const assignee = this.getWorkflowAssignee(this.props.workflowItems, this.props.workflowitemId);
    return (
      <AssigneeSelection
        assigneeId={assignee}
        users={this.props.users}
        title={this.props.title}
        assign={this.assignWorkflow}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    workflowItems: state.getIn(["workflow", "workflowItems"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignWorkflow: (projectId, subProjectId, workflowId, userId) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowAssigneeContainer)));
