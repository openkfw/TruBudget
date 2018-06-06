import React, { Component } from "react";
import { connect } from "react-redux";

import PermissionsScreen from "../Common/Permissions/PermissionsScreen";
import {
  fetchSubProjectPermissions,
  hideSubProjectPermissions,
  grantSubProjectPermission,
  revokeSubProjectPermission
} from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";
import { subProjectIntentOrder } from "../../permissions";

class SubProjectPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchSubProjectPermissions(this.props.projectId, this.props.subProjectId, true);
      this.props.fetchUser();
    }
  }

  grant = (_, permission, user) => {
    this.props.grant(this.props.projectId, this.props.subProjectId, permission, user);
  };

  revoke = (_, permission, user) => {
    this.props.revoke(this.props.projectId, this.props.subProjectId, permission, user);
  };

  render() {
    return (
      <PermissionsScreen {...this.props} grant={this.grant} revoke={this.revoke} intentOrder={subProjectIntentOrder} />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["workflow", "permissions"]),
    user: state.getIn(["login", "user"]),
    show: state.getIn(["workflow", "showSubProjectPermissions"]),
    id: state.getIn(["workflow", "id"]),
    myself: state.getIn(["login", "id"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideSubProjectPermissions()),
    grant: (pId, sId, permission, user) => dispatch(grantSubProjectPermission(pId, sId, permission, user, true)),
    revoke: (pId, sId, permission, user) => dispatch(revokeSubProjectPermission(pId, sId, permission, user, true)),
    fetchSubProjectPermissions: (pId, sId, showLoading) => dispatch(fetchSubProjectPermissions(pId, sId, showLoading)),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectPermissionsContainer)));
