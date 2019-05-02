import { withStyles } from "@material-ui/core/styles";
import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignWorkflowItem } from "./actions";

const styles = {
  assigneeContainer: {
    width: "100%",
    cursor: "-webkit-grab"
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
    const { workflowItems, workflowitemId, users, title, classes, disabled, workflowSortEnabled, status } = this.props;
    const assignee = this.getWorkflowAssignee(workflowItems, workflowitemId);
    return (
      <div className={`${classes.assigneeContainer} workflowitem-assignee`} data-test="inside">
        <AssigneeSelection
          assigneeId={assignee}
          disabled={disabled || workflowSortEnabled}
          users={users}
          title={title}
          assign={this.assignWorkflow}
          workflowSortEnabled={workflowSortEnabled}
          status={status}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    workflowSortEnabled: state.getIn(["workflow", "workflowSortEnabled"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignWorkflow: (projectId, subProjectId, workflowId, identity) =>
      dispatch(assignWorkflowItem(projectId, subProjectId, workflowId, identity))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(withStyles(styles)(WorkflowAssigneeContainer)));
