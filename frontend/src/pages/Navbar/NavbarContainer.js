import React, { Component } from "react";
import { connect } from "react-redux";

import { toggleSidebar } from "./actions";
import { logout } from "../Login/actions";

import Navbar from "./Navbar";
import { toJS } from "../../helper";

class NavbarContainer extends Component {
  componentWillMount() {}
  render() {
    return (
      <Navbar
        {...this.props}
        unreadNotifications={this.props.notifications.reduce((acc, n) => (n.isRead ? acc : acc + 1), 0)}
      />
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onToggleSidebar: () => dispatch(toggleSidebar()),
    logout: () => dispatch(logout())
  };
};

const mapStateToProps = state => {
  return {
    showSidebar: state.getIn(["navbar", "showSidebar"]),
    peers: state.getIn(["navbar", "peers"]),
    notifications: state.getIn(["notifications", "notifications"]),
    route: state.getIn(["route", "locationBeforeTransitions"]),
    streamNames: state.getIn(["navbar", "streamNames"]),
    displayName: state.getIn(["login", "displayName"]),
    organization: state.getIn(["login", "organization"]),
    avatar: state.getIn(["login", "avatar"]),
    avatarBackground: state.getIn(["login", "avatarBackground"]),
    currentProject: state.getIn(["navbar", "currentProject"]),
    currentSubProject: state.getIn(["navbar", "currentSubProject"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NavbarContainer));
