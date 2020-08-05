import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import withInitialLoading from "../Loading/withInitialLoading";
import { fetchUser } from "../Login/actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import {
  addInitialUserToGroup,
  addUser,
  checkAndChangeUserPassword,
  createUserGroup,
  fetchGroups,
  grantAllUserPermissions,
  listPermissions,
  removeInitialUserFromGroup,
  removeUser,
  resetUserToAdd,
  setAdminPermissions,
  setDisplayName,
  setOrganization,
  setPassword,
  setTabIndex,
  setUsername,
  showDashboardDialog,
  showPasswordDialog,
  storeGroupId,
  storeGroupName,
  enableUser,
  disableUser
} from "./actions";
import Users from "./Users";

class UserManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDataFetched: false
    };
  }

  componentDidMount() {
    this.props.fetchUser();
    this.props.fetchGroups();
    if (this.props.allowedIntents.includes("global.listPermissions")) {
      this.props.listGlobalPermissions();
    }
    this.setState({ isDataFetched: true });
  }
  componentWillUnmount() {
    this.props.resetState();
  }
  render() {
    return !this.state.isDataFetched ? <div /> : <Users {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    enabledUsers: state.getIn(["login", "enabledUsers"]),
    disabledUsers: state.getIn(["login", "disabledUsers"]),
    userId: state.getIn(["login", "id"]),
    organization: state.getIn(["login", "organization"]),
    tabIndex: state.getIn(["users", "tabIndex"]),
    groups: state.getIn(["users", "groups"]),
    groupToAdd: state.getIn(["users", "groupToAdd"]),
    editMode: state.getIn(["users", "editMode"]),
    editDialogShown: state.getIn(["users", "editDialogShown"]),
    editId: state.getIn(["users", "editId"]),
    isRoot: state.getIn(["navbar", "isRoot"]),
    isDataLoading: state.getIn(["loading", "loadingVisible"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
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
    setAdminPermissions: hasAdminPermissions => dispatch(setAdminPermissions(hasAdminPermissions)),
    grantAllUserPermissions: userId => dispatch(grantAllUserPermissions(userId)),
    showDashboardDialog: (dialogType, editId) => dispatch(showDashboardDialog(dialogType, editId)),
    showPasswordDialog: editId => dispatch(showPasswordDialog(editId)),
    listGlobalPermissions: () => dispatch(listPermissions()),
    checkAndChangeUserPassword: (actingUser, username, userPassword, newPassword) =>
      dispatch(checkAndChangeUserPassword(actingUser, username, userPassword, newPassword)),
    enableUser: userId => dispatch(enableUser(userId)),
    disableUser: userId => dispatch(disableUser(userId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
