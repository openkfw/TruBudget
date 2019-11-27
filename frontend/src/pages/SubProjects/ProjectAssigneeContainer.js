import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignProject } from "./actions";

class ProjectAssigneeContainer extends Component {
  render() {
    const { assignee, users, disabled, projectId, projectDisplayName, assignProject } = this.props;

    return (
      <React.Fragment>
        <AssigneeSelection
          assigneeId={assignee}
          users={users}
          disabled={disabled}
          assign={(assigneeId, assigneeDisplayName) =>
            assignProject(projectId, projectDisplayName, assigneeId, assigneeDisplayName)
          }
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    projectId: state.getIn(["detailview", "id"]),
    projectDisplayName: state.getIn(["detailview", "projectName"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignProject: (projectId, projectDisplayName, assigneeId, assigneeDisplayName) =>
      dispatch(assignProject(projectId, projectDisplayName, assigneeId, assigneeDisplayName))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ProjectAssigneeContainer));
