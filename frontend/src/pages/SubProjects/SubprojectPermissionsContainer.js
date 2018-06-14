import React, { Component } from "react";
import { connect } from "react-redux";
import _isEmpty from "lodash/isEmpty";

import PermissionsScreen from "../Common/Permissions/PermissionsScreen";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";
import { subProjectIntentOrder } from "../../permissions";
import {
  hideSubProjectPermissions,
  grantSubProjectPermission,
  revokeSubProjectPermission,
  fetchSubProjectPermissions
} from "./actions";

class SubProjectPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchSubProjectPermissions(nextProps.projectId, nextProps.subprojectId, true);
      this.props.fetchUser();
    }
  }

  grant = (_, permission, user) => {
    this.props.grant(this.props.projectId, this.props.subprojectId, permission, user);
  };

  revoke = (_, permission, user) => {
    this.props.revoke(this.props.projectId, this.props.subprojectId, permission, user);
  };

  isEnabled(allowedIntents) {
    const necessaryIntents = ["subproject.intent.grantPermission", "subproject.intent.revokePermission"];
    return necessaryIntents.some(i => allowedIntents.includes(i));
  }

  getAllowedIntents = () => {
    const { subProjects, subprojectId } = this.props;
    if (subProjects && !_isEmpty(subprojectId)) {
      const { allowedIntents } = subProjects.find(subproject => subproject.data.id === subprojectId);
      return allowedIntents;
    }
    return [];
  };

  render() {
    const allowedIntents = this.getAllowedIntents();
    return (
      <PermissionsScreen
        {...this.props}
        grant={this.grant}
        revoke={this.revoke}
        intentOrder={subProjectIntentOrder}
        disabled={!this.isEnabled(allowedIntents)}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["detailview", "permissions"]),
    subprojectId: state.getIn(["detailview", "idForPermissions"]),
    allowedIntents: state.getIn(["detailview", "allowedIntents"]),
    user: state.getIn(["login", "user"]),
    show: state.getIn(["detailview", "showSubProjectPermissions"]),
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
