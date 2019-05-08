import { withStyles } from "@material-ui/core/styles";
import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import AssigneeSelection from "../Common/AssigneeSelection";
import { assignSubproject } from "./actions";

const styles = {};

class SubProjectAssigneeContainer extends Component {
  assignSubproject = identity => {
    const { projectId, subprojectId } = this.props;
    this.props.assignSubproject(projectId, subprojectId, identity);
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
    assignSubproject: (projectId, subprojectId, identity) =>
      dispatch(assignSubproject(projectId, subprojectId, identity))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(withStyles(styles)(SubProjectAssigneeContainer)));
