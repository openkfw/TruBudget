import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";

import { fetchUser } from "../Login/actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import {
  fetchGroups,
  storeGroupName,
  storeGroupId,
  addInitialUserToGroup,
  createUserGroup,
  addUser,
  showEditDialog,
  hideEditDialog,
  removeUser,
  removeInitialUserFromGroup,
  hideDashboardDialog,
  createUser
} from "./actions";

import DashboardDialog from "./DashboardDialog";

class DashboardDialogContainer extends Component {
  componentWillMount() {
    this.props.fetchGroups();
    this.props.fetchUser();
  }

  render() {
    return <DashboardDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    currentStep: state.getIn(["overview", "currentStep"]),
    projectToAdd: state.getIn(["overview", "projectToAdd"]),
    dialogTitle: state.getIn(["overview", "dialogTitle"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    dashboardDialogShown: state.getIn(["users", "dashboardDialogShown"]),
    dialogType: state.getIn(["users", "dialogType"]),
    editId: state.getIn(["users", "editId"]),
    userToAdd: state.getIn(["users", "userToAdd"]),

    users: state.getIn(["login", "user"]),
    groups: state.getIn(["groups", "groups"]),
    groupToAdd: state.getIn(["groups", "groupToAdd"]),
    editMode: state.getIn(["groups", "editMode"]),
    editDialogShown: state.getIn(["groups", "editDialogShown"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchUser: () => dispatch(fetchUser(true)),
    showErrorSnackbar: () => dispatch(showSnackbar(true)),
    fetchGroups: () => dispatch(fetchGroups(true)),
    storeGroupName: name => dispatch(storeGroupName(name)),
    storeGroupId: groupId => dispatch(storeGroupId(groupId)),
    addInitialUserToGroup: userId => dispatch(addInitialUserToGroup(userId)),
    removeInitialUserFromGroup: userId => dispatch(removeInitialUserFromGroup(userId)),
    addUser: (groupId, userId) => dispatch(addUser(groupId, userId)),
    removeUserFromGroup: (groupId, userId) => dispatch(removeUser(groupId, userId)),
    showEditDialog: groupId => dispatch(showEditDialog(groupId)),
    hideEditDialog: () => dispatch(hideEditDialog()),

    createUserGroup: (groupId, name, users) => dispatch(createUserGroup(groupId, name, users)),
    createUser: (displayName, organization, username, password) =>
      dispatch(createUser(displayName, organization, username, password)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),

    hideDashboardDialog: () => dispatch(hideDashboardDialog())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(DashboardDialogContainer)));
