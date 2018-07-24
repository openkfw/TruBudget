import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignWorkflowItem } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { withStyles } from "@material-ui/core";

const styles = {
  assigneeContainer: {
    width: "80%"
  }
};

class WorkflowAssigneeContainer extends Component {
  assignWorkflow = identity => {
    const { projectId, subprojectId, workflowitemId } = this.props;
    this.props.assignWorkflow(projectId, subprojectId, workflowitemId, identity);
  };

  getWorkflowAssignee = (workflowItems, selectedId) => {
    if (workflowItems.length === 0 || !selectedId) {
      return "";
    }
    const selectedWorkflowItem = workflowItems.find(workflow => workflow.data.id === selectedId);
    return selectedWorkflowItem.data.assignee;
  };

  render() {
    const { workflowItems, workflowitemId, users, title, classes, disabled } = this.props;
    const assignee = this.getWorkflowAssignee(workflowItems, workflowitemId);
    return (
      <div className={classes.assigneeContainer}>
        <AssigneeSelection
          assigneeId={assignee}
          disabled={disabled}
          users={users}
          title={title}
          assign={this.assignWorkflow}
        />
      </div>
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
    assignWorkflow: (projectId, subProjectId, workflowId, identity) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, identity))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withInitialLoading(toJS(withStyles(styles)(WorkflowAssigneeContainer)))
);
