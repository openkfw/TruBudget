import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignSubproject } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";

class SubProjectAssigneeContainer extends Component {
  assignSubproject = userId => {
    const { projectId, subprojectId } = this.props;
    this.props.assignSubproject(projectId, subprojectId, userId);
  };

  render() {
    return (
      <AssigneeSelection assigneeId={this.props.assignee} users={this.props.users} assign={this.assignSubproject} />
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    assignSubproject: (projectId, subprojectId, userId) => dispatch(assignSubproject(projectId, subprojectId, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectAssigneeContainer)));
