import _isEmpty from "lodash/isEmpty";
import _uniq from "lodash/uniq";
import React, { Component } from "react";
import { connect } from "react-redux";
import { formatString, toJS } from "../../helper";
import strings from "../../localizeStrings";
import { subProjectIntentOrder } from "../../permissions";
import PermissionDialog from "../Common/Permissions/PermissionDialog";
import withInitialLoading from "../Loading/withInitialLoading";
import { fetchUser } from "../Login/actions";
import { fetchGroups } from "../Users/actions";
import {
  addTemporaryPermission,
  fetchSubProjectPermissions,
  grantSubProjectPermission,
  hideSubProjectPermissions,
  removeTemporaryPermission,
  revokeSubProjectPermission
} from "./actions";

class SubProjectPermissionsContainer extends Component {
  componentDidMount() {
    this.props.fetchSubProjectPermissions(this.props.projectId, this.props.subprojectId, true);
    this.props.fetchUser();
    this.props.fetchGroups();
  }

  shouldComponentUpdate() {
    return !this.props.isConfirmationDialogOpen;
  }

  grant = (permission, granteeId, granteeName) => {
    this.props.grant(
      this.props.projectId,
      this.props.projectDisplayName,
      this.props.subprojectId,
      this.props.subprojectDisplayName,
      permission,
      granteeId,
      granteeName
    );
  };

  revoke = (permission, revokeeId, revokeeName) => {
    this.props.revoke(
      this.props.projectId,
      this.props.projectDisplayName,
      this.props.subprojectId,
      this.props.subprojectDisplayName,
      permission,
      revokeeId,
      revokeeName
    );
  };

  hasOnlyViewPermissions(allowedIntents) {
    const necessaryIntents = ["subproject.intent.grantPermission", "subproject.intent.revokePermission"];
    return necessaryIntents.every(i => !allowedIntents.includes(i));
  }

  /*
   * Submit is disabled in the following cases
   *  - Temporary permissions are added: Submit disabled if grant permissions are missing
   *  - Temporary permissions are removed: Submit disabled if revoke permissions are missing
   */
  isSubmitDisabled(allowedIntents, subprojectPermissions, temporaryPermissions) {
    if (_isEmpty(temporaryPermissions)) return true;

    const hasGrantPermissions = allowedIntents.includes("subproject.intent.grantPermission");
    const hasRevokePermissions = allowedIntents.includes("subproject.intent.revokePermission");
    const temporaryPermissionsAdded = Object.keys(subprojectPermissions).some(intent =>
      temporaryPermissions[intent].some(id => !subprojectPermissions[intent].includes(id))
    );
    const temporaryPermissionsRemoved = Object.keys(subprojectPermissions).some(intent =>
      subprojectPermissions[intent].some(id => !temporaryPermissions[intent].includes(id))
    );

    if ((!hasGrantPermissions && temporaryPermissionsAdded) || (!hasRevokePermissions && temporaryPermissionsRemoved)) {
      return true;
    } else {
      return false;
    }
  }

  getAllowedIntents = () => {
    const { permissions, myself, groups } = this.props;
    // get all permission that are assigned to the user
    const userPermissions = Object.keys(permissions).filter(intent => permissions[intent].includes(myself));
    if (typeof groups === undefined || groups.length === 0 || groups == null) {
      return userPermissions;
    } else {
      // get all groups where the user belongs to
      const filteredGroups = groups.filter(item => {
        return item.users.includes(myself);
      });
      const groupIds = filteredGroups.map(item => item.groupId);
      // get all permissions from groups the user belongs to
      const groupPermissions = Object.keys(permissions).filter(intent =>
        permissions[intent].some(member => groupIds.includes(member))
      );
      // remove duplicate permission (if User is in multiple groups with same permissions)
      const combinedPermissions = _uniq([...groupPermissions, ...userPermissions]);
      return combinedPermissions;
    }
  };

  render() {
    const allowedIntents = this.getAllowedIntents();

    const {
      permissions,
      temporaryPermissions,
      permissionDialogShown,
      hidePermissionDialog,
      removeTemporaryPermission,
      addTemporaryPermission,
      subprojectId,
      userList,
      subprojectDisplayName
    } = this.props;

    return (
      <PermissionDialog
        myself={this.props.myself}
        title={formatString(strings.permissions.dialog_title, subprojectDisplayName)}
        permissions={permissions}
        temporaryPermissions={temporaryPermissions}
        open={permissionDialogShown}
        hidePermissionDialog={hidePermissionDialog}
        removeTemporaryPermission={removeTemporaryPermission}
        addTemporaryPermission={addTemporaryPermission}
        id={subprojectId}
        grant={this.grant}
        revoke={this.revoke}
        intentOrder={subProjectIntentOrder}
        disabledUserSelection={this.hasOnlyViewPermissions(allowedIntents)}
        disabledSubmit={this.isSubmitDisabled(allowedIntents, this.props.permissions, this.props.temporaryPermissions)}
        userList={userList}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["detailview", "permissions", "subproject"]),
    temporaryPermissions: state.getIn(["detailview", "temporaryPermissions"]),
    projectId: state.getIn(["detailview", "id"]),
    projectDisplayName: state.getIn(["detailview", "projectName"]),
    subprojectId: state.getIn(["detailview", "idForPermissions"]),
    subprojectDisplayName: state.getIn(["detailview", "displayNameForPermissions"]),
    myself: state.getIn(["login", "id"]),
    userList: state.getIn(["login", "user"]),
    allowedIntents: state.getIn(["detailview", "allowedIntents"]),
    permissionDialogShown: state.getIn(["detailview", "showSubProjectPermissions"]),
    isConfirmationDialogOpen: state.getIn(["confirmation", "open"]),
    groups: state.getIn(["users", "groups"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hidePermissionDialog: () => dispatch(hideSubProjectPermissions()),
    grant: (pId, pName, sId, sName, permission, granteeId, granteeName) =>
      dispatch(grantSubProjectPermission(pId, pName, sId, sName, permission, granteeId, granteeName, true)),
    revoke: (pId, pName, sId, sName, permission, revokeeId, revokeeName) =>
      dispatch(revokeSubProjectPermission(pId, pName, sId, sName, permission, revokeeId, revokeeName, true)),
    fetchSubProjectPermissions: (pId, sId, showLoading) => dispatch(fetchSubProjectPermissions(pId, sId, showLoading)),
    fetchUser: () => dispatch(fetchUser(true)),
    addTemporaryPermission: (subprojectId, permission, userId) =>
      dispatch(addTemporaryPermission(subprojectId, permission, userId)),
    removeTemporaryPermission: (subprojectId, permission, userId) =>
      dispatch(removeTemporaryPermission(subprojectId, permission, userId)),
    fetchGroups: () => dispatch(fetchGroups(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectPermissionsContainer)));
