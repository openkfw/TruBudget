import React, { Component } from "react";
import { connect } from "react-redux";

import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import Users from "./Users";
import NotAuthorized from "../Error/NotAuthorized";
import { canViewUserDashboard } from "../../permissions";
import { setUsername, setPassword, setDisplayName, setOrganization, createUser, resetUserToAdd } from "./actions";
import { fetchUser } from "../Login/actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";

class UserManagementContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
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
    organization: state.getIn(["login", "organization"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
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
    resetState: () => dispatch(resetUserToAdd())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
