import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import UserManagement from "./UserManagement";
import NotFound from "../NotFound/NotFound";

class UserManagementContainer extends Component {
  render() {
    //TODO: Change the intents to a more fine grain list
    const canViewUsers = this.props.allowedIntents.indexOf("global.createUser") > -1;
    if (canViewUsers) {
      return <UserManagement {...this.props} />;
    } else {
      return <NotFound />;
    }
  }
}

const mapStateToProps = state => {
  return {
    allowedIntents: state.getIn(["login", "allowedIntents"])
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
