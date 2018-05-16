import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeDialog from "../Common/AssigneeDialog";
import { assignWorkflowItem } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class WorkflowAssigneeContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
  }

  assignWorkflow = userId => {
    const { projectId, subprojectId, workflowitemId } = this.props;
    this.props.assignWorkflow(projectId, subprojectId, workflowitemId, userId);
  };

  getWorkflowAssignee = (workflowItems, selectedId) => {
    if (workflowItems.length === 0 || !selectedId) {
      return "";
    }
    const selectedWorkflowItem = workflowItems.find(workflow => workflow.id === selectedId);
    return selectedWorkflowItem.assignee;
  };

  render() {
    const assignee = this.getWorkflowAssignee(this.props.workflowItems, this.props.workflowitemId);
    return (
      <AssigneeDialog
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
    users: state.getIn(["login", "user"]),
    workflowItems: state.getIn(["workflow", "workflowItems"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignWorkflow: (projectId, subProjectId, workflowId, userId) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, userId)),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowAssigneeContainer)));
