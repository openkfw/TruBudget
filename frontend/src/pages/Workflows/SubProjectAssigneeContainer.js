import { withStyles } from "@material-ui/core/styles";
import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignSubproject } from "./actions";

const styles = {};

class SubProjectAssigneeContainer extends Component {
  render() {
    const {
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      assignee,
      disabled,
      users,
      assignSubproject
    } = this.props;

    return (
      <AssigneeSelection
        assigneeId={assignee}
        users={users}
        disabled={disabled}
        assign={(assigneeId, assigneeDisplayName) =>
          assignSubproject(
            projectId,
            projectDisplayName,
            subprojectId,
            subprojectDisplayName,
            assigneeId,
            assigneeDisplayName
          )
        }
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    projectId: state.getIn(["workflow", "parentProject", "id"]),
    subprojectId: state.getIn(["workflow", "id"]),
    projectDisplayName: state.getIn(["workflow", "parentProject", "displayName"]),
    subprojectDisplayName: state.getIn(["workflow", "displayName"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignSubproject: (
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      assigneeId,
      assigneeDisplayName
    ) =>
      dispatch(
        assignSubproject(
          projectId,
          projectDisplayName,
          subprojectId,
          subprojectDisplayName,
          assigneeId,
          assigneeDisplayName
        )
      )
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(withStyles(styles)(SubProjectAssigneeContainer)));
