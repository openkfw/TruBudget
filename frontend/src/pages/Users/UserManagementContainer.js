import React, { Component } from "react";
import { connect } from "react-redux";

import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import Users from "./Users";
import NotAuthorized from "../Error/NotAuthorized";
import { canViewUserDashboard } from "../../permissions";
import {
  setUsername,
  setPassword,
  setDisplayName,
  setOrganization,
  resetUserToAdd,
  setTabIndex,
  showDashboardDialog,
  fetchGroups,
  storeGroupName,
  storeGroupId,
  addInitialUserToGroup,
  removeInitialUserFromGroup,
  addUser,
  removeUser,
  createUserGroup,
  showEditDialog,
  hideEditDialog,
  setAdminPermissions,
  grantAllUserPermissions
} from "./actions";
import { fetchUser } from "../Login/actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";

class UserManagementContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
    this.props.fetchGroups();
  }
  componentWillUnmount() {
    this.props.resetState();
  }
  render() {
    const canView = canViewUserDashboard(this.props.allowedIntents);
    if (canView) {
      return <Users {...this.props} />;
    } else {
      return <NotAuthorized />;
    }
  }
}

const mapStateToProps = state => {
  return {
    nodes: state.getIn(["users", "nodes"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    users: state.getIn(["login", "user"]),
    organization: state.getIn(["login", "organization"]),
    tabIndex: state.getIn(["users", "tabIndex"]),
    groups: state.getIn(["users", "groups"]),
    groupToAdd: state.getIn(["users", "groupToAdd"]),
    editMode: state.getIn(["users", "editMode"]),
    editDialogShown: state.getIn(["users", "editDialogShown"]),
    editId: state.getIn(["users", "editId"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    //copid from Project
    fetchUser: () => dispatch(fetchUser(true)),
    setDisplayName: displayName => dispatch(setDisplayName(displayName)),
    setOrganization: organization => dispatch(setOrganization(organization)),
    setUsername: username => dispatch(setUsername(username)),
    setPassword: password => dispatch(setPassword(password)),

    showErrorSnackbar: () => dispatch(showSnackbar(true)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    resetState: () => dispatch(resetUserToAdd()),
    setTabIndex: value => dispatch(setTabIndex(value)),
    fetchGroups: () => dispatch(fetchGroups(true)),
    storeGroupName: name => dispatch(storeGroupName(name)),
    storeGroupId: groupId => dispatch(storeGroupId(groupId)),
    addInitialUserToGroup: userId => dispatch(addInitialUserToGroup(userId)),
    removeInitialUserFromGroup: userId => dispatch(removeInitialUserFromGroup(userId)),
    addUser: (groupId, userId) => dispatch(addUser(groupId, userId)),
    removeUserFromGroup: (groupId, userId) => dispatch(removeUser(groupId, userId)),
    createUserGroup: (groupId, name, users) => dispatch(createUserGroup(groupId, name, users)),
    showEditDialog: groupId => dispatch(showEditDialog(groupId)),
    hideEditDialog: () => dispatch(hideEditDialog()),
    setAdminPermissions: hasAdminPermissions => dispatch(setAdminPermissions(hasAdminPermissions)),
    grantAllUserPermissions: userId => dispatch(grantAllUserPermissions(userId)),

    showDashboardDialog: (dialogType, editId) => dispatch(showDashboardDialog(dialogType, editId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
