import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeDialog from "../Common/AssigneeDialog";
import { assignProject } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class ProjectAssigneeContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
  }

  assignProject = userId => {
    this.props.assignProject(this.props.projectId, userId);
  };

  render() {
    return (
      <AssigneeDialog
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
  return {
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchUser: () => dispatch(fetchUser(true)),
    assignProject: (projectId, userId) => dispatch(assignProject(projectId, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectAssigneeContainer)));
