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
  getWorkflowAssignee = (workflowItems, selectedId) => {
    if (workflowItems.length === 0 || !selectedId) {
      return "";
    }
    const selectedWorkflowItem = workflowItems.find(workflow => workflow.data.id === selectedId);
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
      classes,
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
      <div className={classes.assigneeContainer} data-test={`workflowitem-assignee-${workflowitemId}`}>
        <AssigneeSelection
          assigneeId={assignee}
          disabled={disabled || workflowSortEnabled || hasSubprojectValidator}
          users={users}
          title={title}
          assign={(assigneeId, assigneeDisplayName) =>
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

const mapStateToProps = state => {
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

const mapDispatchToProps = dispatch => {
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

export default connect(mapStateToProps, mapDispatchToProps)(toJS(withStyles(styles)(WorkflowAssigneeContainer)));
