import React, { Component } from "react";
import { connect } from "react-redux";

import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import Groups from "./Groups";
import NotAuthorized from "../Error/NotAuthorized";
import { canViewGroupDashboard } from "../../permissions";
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
  removeInitialUserFromGroup
} from "./actions";

class GroupManagementContainer extends Component {
  componentWillMount() {
    this.props.fetchGroups();
    this.props.fetchUser();
  }
  componentWillUnmount() {}
  render() {
    const canView = canViewGroupDashboard(this.props.allowedIntents);
    if (canView) {
      return <Groups {...this.props} />;
    } else {
      return <NotAuthorized />;
    }
  }
}

const mapStateToProps = state => {
  return {
    userToAdd: state.getIn(["users", "userToAdd"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    users: state.getIn(["login", "user"]),
    groups: state.getIn(["groups", "groups"]),
    groupToAdd: state.getIn(["groups", "groupToAdd"]),
    editMode: state.getIn(["groups", "editMode"]),
    editDialogShown: state.getIn(["groups", "editDialogShown"]),
    editId: state.getIn(["groups", "editId"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchUser: () => dispatch(fetchUser(true)),
    showErrorSnackbar: () => dispatch(showSnackbar(true)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    fetchGroups: () => dispatch(fetchGroups(true)),
    storeGroupName: name => dispatch(storeGroupName(name)),
    storeGroupId: groupId => dispatch(storeGroupId(groupId)),
    addInitialUserToGroup: userId => dispatch(addInitialUserToGroup(userId)),
    removeInitialUserFromGroup: userId => dispatch(removeInitialUserFromGroup(userId)),
    addUser: (groupId, userId) => dispatch(addUser(groupId, userId)),
    removeUserFromGroup: (groupId, userId) => dispatch(removeUser(groupId, userId)),
    createUserGroup: (groupId, name, users) => dispatch(createUserGroup(groupId, name, users)),
    showEditDialog: groupId => dispatch(showEditDialog(groupId)),
    hideEditDialog: () => dispatch(hideEditDialog())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(GroupManagementContainer)));
