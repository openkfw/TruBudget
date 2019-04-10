import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignProject } from "./actions";

class ProjectAssigneeContainer extends Component {
  assignProject = identity => {
    this.props.assignProject(this.props.projectId, identity);
  };

  render() {
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
    assignProject: (projectId, identity) => dispatch(assignProject(projectId, identity))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ProjectAssigneeContainer));
