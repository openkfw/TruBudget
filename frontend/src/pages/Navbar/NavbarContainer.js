import isEmpty from "lodash/isEmpty";
import queryString from "query-string";
import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import { checkEmailService, logout } from "../Login/actions";
import FlyInNotifications from "../Notifications/FlyInNotifications";
import {
  createBackup,
  exportData,
  fetchActivePeers,
  fetchVersions,
  restoreBackup,
  setIsRoot,
  showUserProfile,
  storeSearchBarDisplayed,
  storeSearchTerm,
  toggleSidebar
} from "./actions";
import { convertToSearchBarString } from "./convertSearchTerm";
import Navbar from "./Navbar";

class NavbarContainer extends Component {
  componentDidMount() {
    this.props.fetchActivePeers();
    this.props.fetchVersions();
    this.props.checkEmailService();

    if (this.props.userId === "root") {
      this.props.setIsRoot(true);
    }
    if (this.props.location.search) {
      const queryParameter = queryString.parse(this.props.location.search);
      const searchTermString = convertToSearchBarString(queryString.stringify(queryParameter));
      this.props.storeSearchTerm(searchTermString);
      this.props.storeSearchBarDisplayed(true);
    }
  }

  render() {
    return (
      <div>
        <Navbar {...this.props} unreadNotifications={this.props.unreadNotificationCount} />
        <FlyInNotifications
          history={this.props.history}
          notifications={this.props.newNotifications}
          latestFlyInId={this.props.latestFlyInId}
          show={!isEmpty(this.props.newNotifications)}
        />
      </div>
    );
  }
}

const mapDispatchToProps = {
  toggleSidebar,
  logout,
  fetchActivePeers,
  createBackup,
  restoreBackup,
  fetchVersions,
  exportData,
  storeSearchTerm,
  storeSearchBarDisplayed,
  setIsRoot,
  showUserProfile,
  checkEmailService
};

const mapStateToProps = state => {
  return {
    showSidebar: state.getIn(["navbar", "showSidebar"]),
    peers: state.getIn(["navbar", "peers"]),
    numberOfActivePeers: state.getIn(["navbar", "numberOfActivePeers"]),
    notifications: state.getIn(["notifications", "notifications"]),
    newNotifications: state.getIn(["notifications", "newNotifications"]),
    route: state.getIn(["route", "locationBeforeTransitions"]),
    streamNames: state.getIn(["navbar", "streamNames"]),
    displayName: state.getIn(["login", "displayName"]),
    userId: state.getIn(["login", "id"]),
    organization: state.getIn(["login", "organization"]),
    avatar: state.getIn(["login", "avatar"]),
    environment: state.getIn(["login", "environment"]),
    avatarBackground: state.getIn(["login", "avatarBackground"]),
    currentProject: state.getIn(["navbar", "currentProject"]),
    currentSubProject: state.getIn(["navbar", "currentSubProject"]),
    versions: state.getIn(["navbar", "versions"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    groups: state.getIn(["login", "groups"]),
    unreadNotificationCount: state.getIn(["notifications", "unreadNotificationCount"]),
    latestFlyInId: state.getIn(["notifications", "latestFlyInId"]),
    searchTerm: state.getIn(["navbar", "searchTerm"]),
    searchBarDisplayed: state.getIn(["navbar", "searchBarDisplayed"]),
    isRoot: state.getIn(["login", "isRoot"]),
    emailServiceAvailable: state.getIn(["navbar", "emailServiceAvailable"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NavbarContainer));
