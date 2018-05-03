import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeDialog from "../Common/AssigneeDialog";
import { hideProjectAssignees, assignProject } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class ProjectAssigneeContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchUser();
    }
  }

  componentWillUnmount() {
    this.props.onClose();
  }

  assignProject = userId => {
    this.props.assignProject(this.props.projectId, userId);
  };

  render() {
    return (
      <AssigneeDialog
        assigneeId={this.props.assignee}
        users={this.props.users}
        title={this.props.title}
        show={this.props.show}
        onClose={this.props.onClose}
        assign={this.assignProject}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["detailview", "showProjectAssignees"]),
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideProjectAssignees()),
    fetchUser: () => dispatch(fetchUser(true)),
    assignProject: (projectId, userId) => dispatch(assignProject(projectId, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectAssigneeContainer)));
