import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeDialog from "../Common/AssigneeDialog";
import { hideWorkflowAssignee, assignWorkflowItem } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class WorkflowAssigneeContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchUser();
    }
  }

  componentWillUnmount() {
    this.props.onClose();
  }

  assignWorkflow = userId => {
    const { projectId, subprojectId, workflowRefId } = this.props;
    this.props.assignWorkflow(projectId, subprojectId, workflowRefId, userId);
  };

  getWorkflowAssignee = (workflowItems, selectedId) => {
    if (workflowItems.length === 0 || !selectedId) {
      return "";
    }
    const selectedWorkflowItem = workflowItems.find(workflow => workflow.id === selectedId);
    return selectedWorkflowItem.assignee;
  };

  render() {
    const assignee = this.getWorkflowAssignee(this.props.workflowItems, this.props.workflowRefId);
    return (
      <AssigneeDialog
        assigneeId={assignee}
        users={this.props.users}
        title={this.props.title}
        show={this.props.show}
        assign={this.assignWorkflow}
        onClose={this.props.onClose}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["workflow", "showWorkflowAssignee"]),
    users: state.getIn(["login", "user"]),
    workflowRefId: state.getIn(["workflow", "workflowItemReference"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignWorkflow: (projectId, subProjectId, workflowId, userId) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, userId)),
    onClose: () => dispatch(hideWorkflowAssignee()),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowAssigneeContainer)));
