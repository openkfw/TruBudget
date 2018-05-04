import React, { Component } from "react";
import { connect } from "react-redux";
import PermissionsScreen from "../Common/Permissions/PermissionsScreen";
import { fetchWorkflowItemPermissions, grantWorkflowItemPermission, hideWorkflowItemPermissions } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";
import { workflowItemIntentOrder } from "../../permissions";

class WorkflowItemPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchWorkflowItemPermissions(nextProps.projectId, nextProps.wId, true);
      this.props.fetchUser();
    }
  }

  grantPermission = (_, permission, user) => {
    this.props.grantPermission(this.props.projectId, this.props.wId, permission, user);
  };

  render() {
    return (
      <PermissionsScreen {...this.props} grantPermission={this.grantPermission} intentOrder={workflowItemIntentOrder} />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["workflow", "permissions"]),
    user: state.getIn(["login", "user"]),
    show: state.getIn(["workflow", "showWorkflowPermissions"]),
    wId: state.getIn(["workflow", "workflowItemReference"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideWorkflowItemPermissions()),
    grantPermission: (pId, wId, permission, user) =>
      dispatch(grantWorkflowItemPermission(pId, wId, permission, user, true)),
    fetchWorkflowItemPermissions: (pId, wId, showLoading) =>
      dispatch(fetchWorkflowItemPermissions(pId, wId, showLoading)),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowItemPermissionsContainer)));
