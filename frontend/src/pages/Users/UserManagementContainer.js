import React, { Component } from "react";
import { connect } from "react-redux";

import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import UserManagement from "./UserManagement";
import NotAuthorized from "../Error/NotAuthorized";
import { canViewUserManagement } from "../../permissions";
import {
  switchTabs,
  setUsername,
  setPassword,
  setDisplayName,
  setOrganization,
  createUser,
  fetchNodes,
  resetUserToAdd
} from "./actions";
import { fetchUser } from "../Login/actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";

class UserManagementContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
    this.props.fetchNodes();
  }
  componentWillUnmount() {
    this.props.resetState();
  }
  render() {
    const canView = canViewUserManagement(this.props.allowedIntents);
    if (canView) {
      return <UserManagement {...this.props} />;
    } else {
      return <NotAuthorized />;
    }
  }
}

const mapStateToProps = state => {
  return {
    tabIndex: state.getIn(["users", "tabIndex"]),
    userToAdd: state.getIn(["users", "userToAdd"]),
    nodes: state.getIn(["users", "nodes"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    users: state.getIn(["login", "user"]),
    organization: state.getIn(["login", "organization"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    switchTabs: index => dispatch(switchTabs(index)),
    fetchUser: () => dispatch(fetchUser(true)),
    fetchNodes: () => dispatch(fetchNodes(true)),
    setDisplayName: displayName => dispatch(setDisplayName(displayName)),
    setOrganization: organization => dispatch(setOrganization(organization)),
    setUsername: username => dispatch(setUsername(username)),
    setPassword: password => dispatch(setPassword(password)),
    createUser: (displayName, organization, username, password) =>
      dispatch(createUser(displayName, organization, username, password)),
    showErrorSnackbar: () => dispatch(showSnackbar(true)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    resetState: () => dispatch(resetUserToAdd())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
