import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignProject } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";

class ProjectAssigneeContainer extends Component {
  assignProject = userId => {
    this.props.assignProject(this.props.projectId, userId);
  };

  render() {
    console.log(this.props);
    return (
      <AssigneeSelection
        assigneeId={this.props.assignee}
        users={this.props.users}
        disabled={this.props.disabled}
        title={this.props.title}
        assign={this.assignProject}
      />
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    assignProject: (projectId, userId) => dispatch(assignProject(projectId, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectAssigneeContainer)));
