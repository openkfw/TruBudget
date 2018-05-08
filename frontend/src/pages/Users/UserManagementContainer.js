import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import UserManagement from "./UserManagement";
import NotFound from "../NotFound/NotFound";
import { canViewUserManagement } from "../../permissions";

class UserManagementContainer extends Component {
  render() {
    //TODO: Change the intents to a more fine grain list
    const canView = canViewUserManagement(this.props.allowedIntents);
    if (canView) {
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
