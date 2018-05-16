import React, { Component } from "react";
import { connect } from "react-redux";

import AssigneeDialog from "../Common/AssigneeDialog";
import { assignSubproject } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class SubProjectAssigneeContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
  }

  assignSubproject = userId => {
    const { projectId, subprojectId } = this.props;
    this.props.assignSubproject(projectId, subprojectId, userId);
  };

  render() {
    return <AssigneeDialog assigneeId={this.props.assignee} users={this.props.users} assign={this.assignSubproject} />;
  }
}

const mapStateToProps = state => {
  return {
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    assignSubproject: (projectId, subprojectId, userId) => dispatch(assignSubproject(projectId, subprojectId, userId)),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectAssigneeContainer)));
