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
  createUser,
  resetUserToAdd,
  setTabIndex,
  showDashboardDialog
} from "./actions";
import { fetchUser } from "../Login/actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import {
  fetchGroups,
  storeGroupName,
  storeGroupId,
  addInitialUserToGroup,
  removeInitialUserFromGroup,
  addUser,
  removeUser,
  createUserGroup,
  showEditDialog,
  hideEditDialog
} from "../Groups/actions";

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
    userToAdd: state.getIn(["users", "userToAdd"]),
    nodes: state.getIn(["users", "nodes"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    users: state.getIn(["login", "user"]),
    organization: state.getIn(["login", "organization"]),
    tabIndex: state.getIn(["users", "tabIndex"]),
    groups: state.getIn(["groups", "groups"]),
    groupToAdd: state.getIn(["groups", "groupToAdd"]),
    editMode: state.getIn(["groups", "editMode"]),
    editDialogShown: state.getIn(["groups", "editDialogShown"]),
    editId: state.getIn(["groups", "editId"])
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
    createUser: (displayName, organization, username, password) =>
      dispatch(createUser(displayName, organization, username, password)),
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


    showDashboardDialog: (content) => dispatch(showDashboardDialog(content))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
