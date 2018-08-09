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
  createUser
} from "./actions";

import DashboardDialog from "./DashboardDialog";

class DashboardDialogContainer extends Component {
  render() {
    return <DashboardDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    dashboardDialogShown: state.getIn(["users", "dashboardDialogShown"]),
    dialogType: state.getIn(["users", "dialogType"]),
    editId: state.getIn(["users", "editId"]),
    userToAdd: state.getIn(["users", "userToAdd"]),
    users: state.getIn(["login", "user"]),
    groups: state.getIn(["users", "groups"]),
    groupToAdd: state.getIn(["users", "groupToAdd"]),
    editMode: state.getIn(["users", "editMode"]),
    editDialogShown: state.getIn(["users", "editDialogShown"])
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
    hideDashboardDialog: () => dispatch(hideDashboardDialog())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(DashboardDialogContainer)));
