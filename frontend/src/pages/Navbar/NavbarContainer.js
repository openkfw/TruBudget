import isEmpty from "lodash/isEmpty";
import queryString from "query-string";
import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import { logout, fetchEmailAddress } from "../Login/actions";
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
  toggleSidebar,
  saveEmailAddress,
  storeTempEmailAddress,
  setValidEmailAddressInput,
  enableUserProfileEdit,
  hideUserProfile
} from "./actions";
import Navbar from "./Navbar";
import { convertToSearchBarString } from "../../helper";

class NavbarContainer extends Component {
  componentDidMount() {
    this.props.fetchActivePeers();
    this.props.fetchVersions();

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
      <div data-test="navigation-bar">
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
  fetchEmailAddress,
  saveEmailAddress,
  storeTempEmailAddress,
  setValidEmailAddressInput,
  enableUserProfileEdit,
  hideUserProfile
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
    open: state.getIn(["navbar", "userProfileOpen"]),
    tempEmailAddress: state.getIn(["navbar", "tempEmailAddress"]),
    userProfileEdit: state.getIn(["navbar", "userProfileEdit"]),
    emailAddress: state.getIn(["login", "emailAddress"]),
    emailServiceAvailable: state.getIn(["login", "emailServiceAvailable"]),
    isEmailAddressInputValid: state.getIn(["navbar", "isEmailAddressInputValid"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NavbarContainer));
