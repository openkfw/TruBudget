import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";

import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import {
  storeGroupName,
  storeGroupId,
  addInitialUserToGroup,
  createUserGroup,
  addUser,
  removeUser,
  removeInitialUserFromGroup,
  hideDashboardDialog,
  createUser,
  grantGlobalPermission,
  revokeGlobalPermission,
} from "./actions";

import Dialog from "./Dialog";

class DialogContainer extends Component {
  render() {
    return <Dialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    dashboardDialogShown: state.getIn(["users", "dashboardDialogShown"]),
    dialogType: state.getIn(["users", "dialogType"]),
    editId: state.getIn(["users", "editId"]),
    userToAdd: state.getIn(["users", "userToAdd"]),
    users: state.getIn(["login", "user"]),
    loggedInUserId: state.getIn(["login", "id"]),
    groups: state.getIn(["users", "groups"]),
    groupToAdd: state.getIn(["users", "groupToAdd"]),
    editMode: state.getIn(["users", "editMode"]),
    editDialogShown: state.getIn(["users", "editDialogShown"]),
    globalPermissions: state.getIn(["users", "globalPermissions"]),
    permissionsExpanded: state.getIn(["users", "permissionsExpanded"]),
    allowedIntents: state.getIn(["login", "allowedIntents"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showErrorSnackbar: () => dispatch(showSnackbar(true)),
    storeGroupName: name => dispatch(storeGroupName(name)),
    storeGroupId: groupId => dispatch(storeGroupId(groupId)),
    addInitialUserToGroup: userId => dispatch(addInitialUserToGroup(userId)),
    removeInitialUserFromGroup: userId => dispatch(removeInitialUserFromGroup(userId)),
    addUser: (groupId, userId) => dispatch(addUser(groupId, userId)),
    removeUserFromGroup: (groupId, userId) => dispatch(removeUser(groupId, userId)),
    createUserGroup: (groupId, name, users) => dispatch(createUserGroup(groupId, name, users)),
    createUser: (displayName, organization, username, password) =>
      dispatch(createUser(displayName, organization, username, password)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    hideDashboardDialog: () => dispatch(hideDashboardDialog()),
    grantGlobalPermission: (identity, intent) => dispatch(grantGlobalPermission(identity, intent)),
    revokeGlobalPermission: (identity, intent) => dispatch(revokeGlobalPermission(identity, intent)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(DialogContainer)));
