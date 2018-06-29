import React, { Component } from "react";
import { connect } from "react-redux";

import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import UserManagement from "./UserManagement";
import NotFound from "../NotFound/NotFound";
import { canViewUserManagement } from "../../permissions";
import { switchTabs } from "./actions";
import { fetchUser } from "../Login/actions";

class UserManagementContainer extends Component {
  componentWillMount() {
    this.props.fetchUser();
  }

  render() {
    //TODO: Change the intents to a more fine grain list
    // const canView = canViewUserManagement(this.props.allowedIntents);
    // if (canView) {
    return <UserManagement {...this.props} />;
    // } else {
    //   return <NotFound />;
    // }
  }
}

const mapStateToProps = state => {
  return {
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    tabIndex: state.getIn(["users", "tabIndex"]),
    users: state.getIn(["login", "user"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    switchTabs: index => dispatch(switchTabs(index)),
    fetchUser: () => dispatch(fetchUser(true))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(UserManagementContainer)));
