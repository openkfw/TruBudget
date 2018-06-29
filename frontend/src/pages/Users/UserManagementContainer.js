import React, { Component } from "react";
import { connect } from "react-redux";

import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import UserManagement from "./UserManagement";
import NotFound from "../NotFound/NotFound";
import { canViewUserManagement } from "../../permissions";
import { switchTabs, setUsername, setPassword, setDisplayName, setOrganization, createUser } from "./actions";
import { fetchUser } from "../Login/actions";

class UserManagementContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
  }

  render() {
    //TODO: Change the intents to a more fine grain list
    // const canView = canViewUserManagement(this.props.allowedIntents);
    // if (canView) {
    console.log(this.props.userToAdd);
    return <UserManagement {...this.props} />;
    // } else {
    //   return <NotFound />;
    // }
  }
}

const mapStateToProps = state => {
  return {
    tabIndex: state.getIn(["users", "tabIndex"]),
    userToAdd: state.getIn(["users", "userToAdd"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    switchTabs: index => dispatch(switchTabs(index)),
    fetchUser: () => dispatch(fetchUser(true)),
    setDisplayName: displayName => dispatch(setDisplayName(displayName)),
    setOrganization: organization => dispatch(setOrganization(organization)),
    setUsername: username => dispatch(setUsername(username)),
    setPassword: password => dispatch(setPassword(password)),
    createUser: (displayName, organization, username, password) =>
      dispatch(createUser(displayName, organization, username, password))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
