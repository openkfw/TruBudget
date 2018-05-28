import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignSubproject } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { withStyles } from "@material-ui/core";
const styles = {};

class SubProjectAssigneeContainer extends Component {
  assignSubproject = userId => {
    const { projectId, subprojectId } = this.props;
    this.props.assignSubproject(projectId, subprojectId, userId);
  };

  render() {
    const { assignee, disabled, users } = this.props;
    return <AssigneeSelection assigneeId={assignee} disabled={disabled} users={users} assign={this.assignSubproject} />;
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

export default connect(mapStateToProps, mapDispatchToProps)(
  withInitialLoading(toJS(withStyles(styles)(SubProjectAssigneeContainer)))
);
