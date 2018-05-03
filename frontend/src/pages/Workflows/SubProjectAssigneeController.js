import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeDialog from "../Common/AssigneeDialog";
import { hideSubProjectAssignee, assignSubproject } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class SubProjectAssigneeController extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchUser();
    }
  }

  componentWillUnmount() {
    this.props.onClose();
  }

  assignSubproject = userId => {
    const { projectId, subprojectId } = this.props;
    this.props.assignSubproject(projectId, subprojectId, userId);
  };

  render() {
    return (
      <AssigneeDialog
        assigneeId={this.props.assignee}
        users={this.props.users}
        show={this.props.show}
        onClose={this.props.onClose}
        assign={this.assignSubproject}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["workflow", "showSubProjectAssignee"]),
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideSubProjectAssignee()),
    assignSubproject: (projectId, subprojectId, userId) => dispatch(assignSubproject(projectId, subprojectId, userId)),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectAssigneeController)));
