import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import withInitialLoading from "../Loading/withInitialLoading";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import {
  addInitialUserToGroup,
  addUser,
  createUser,
  createUserGroup,
  grantGlobalPermission,
  hideDashboardDialog,
  hidePasswordDialog,
  removeInitialUserFromGroup,
  removeUser,
  revokeGlobalPermission,
  storeNewPassword,
  storeNewPasswordConfirmation,
  storeNewPasswordsMatch,
  storeUserPassword,
  setUsernameInvalid,
  storeGroupId,
  storeGroupName,
  addTemporaryPermission,
  removeTemporaryPermission
} from "./actions";
import Dialog from "./Dialog";
import PasswordDialog from "./PasswordDialog";

class DialogContainer extends Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.dialogType === "editUserPermissions" &&
      !this.props.dashboardDialogShown &&
      prevProps.dashboardDialogShown
    ) {
      this.props.listGlobalPermissions();
    }
  }

  render() {
    return (
      <div>
        {this.props.dashboardDialogShown ? <Dialog {...this.props} /> : null}

        {this.props.passwordDialogShown ? (
          <PasswordDialog
            classes={this.props.classes}
            passwordDialogShown={this.props.passwordDialogShown}
            editId={this.props.editId}
            storeSnackbarMessage={this.props.storeSnackbarMessage}
            authenticationFailed={this.props.authenticationFailed}
            checkAndChangeUserPassword={this.props.checkAndChangeUserPassword}
            hidePasswordDialog={this.props.hidePasswordDialog}
            userId={this.props.userId}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    dashboardDialogShown: state.getIn(["users", "dashboardDialogShown"]),
    passwordDialogShown: state.getIn(["users", "passwordDialogShown"]),
    dialogType: state.getIn(["users", "dialogType"]),
    editId: state.getIn(["users", "editId"]),
    userToAdd: state.getIn(["users", "userToAdd"]),
    enabledUsers: state.getIn(["login", "enabledUsers"]),
    disabledUsers: state.getIn(["login", "disabledUsers"]),
    loggedInUserId: state.getIn(["login", "id"]),
    groups: state.getIn(["users", "groups"]),
    groupToAdd: state.getIn(["users", "groupToAdd"]),
    editMode: state.getIn(["users", "editMode"]),
    editDialogShown: state.getIn(["users", "editDialogShown"]),
    globalPermissions: state.getIn(["users", "globalPermissions"]),
    temporaryGlobalPermissions: state.getIn(["users", "temporaryGlobalPermissions"]),
    permissionsExpanded: state.getIn(["users", "permissionsExpanded"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    wrongPasswordGiven: state.getIn(["users", "wrongPasswordGiven"]),
    userPassword: state.getIn(["users", "userPassword"]),
    newPassword: state.getIn(["users", "newPassword"]),
    newPasswordConfirmation: state.getIn(["users", "newPasswordConfirmation"]),
    newPasswordsMatch: state.getIn(["users", "newPasswordsMatch"]),
    usernameInvalid: state.getIn(["users", "usernameInvalid"]),
    authenticationFailed: state.getIn(["users", "authenticationFailed"])
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
    hidePasswordDialog: () => dispatch(hidePasswordDialog()),
    grantGlobalPermission: (identity, intent) => dispatch(grantGlobalPermission(identity, intent)),
    revokeGlobalPermission: (identity, intent) => dispatch(revokeGlobalPermission(identity, intent)),
    storeUserPassword: password => dispatch(storeUserPassword(password)),
    storeNewPassword: password => dispatch(storeNewPassword(password)),
    storeNewPasswordConfirmation: password => dispatch(storeNewPasswordConfirmation(password)),
    storeNewPasswordsMatch: newPasswordsMatch => dispatch(storeNewPasswordsMatch(newPasswordsMatch)),
    setUsernameInvalid: usernameInvalid => dispatch(setUsernameInvalid(usernameInvalid)),
    addTemporaryPermission: (permission, userId) => dispatch(addTemporaryPermission(permission, userId)),
    removeTemporaryPermission: (permission, userId) => dispatch(removeTemporaryPermission(permission, userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(DialogContainer)));
