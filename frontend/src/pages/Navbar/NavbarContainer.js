import React, { Component } from "react";
import { connect } from "react-redux";
import isEmpty from "lodash/isEmpty";
import queryString from "query-string";

import { convertToSearchBarString, toJS } from "../../helper";
import { withRouter } from "../../wrappers/withRouter";
import { fetchEmailAddress, logout } from "../Login/actions";
import FlyInNotifications from "../Notifications/FlyInNotifications";
import { disableAllProjectsLiveUpdates, enableAllProjectsLiveUpdates } from "../Overview/actions";

import {
  createBackup,
  enableUserProfileEdit,
  exportData,
  fetchActivePeers,
  hideUserProfile,
  restoreBackup,
  saveEmailAddress,
  setIsRoot,
  setValidEmailAddressInput,
  showUserProfile,
  storeSearchBarDisplayed,
  storeSearchTerm,
  storeTempEmailAddress,
  toggleSidebar
} from "./actions";
import Navbar from "./Navbar";

class NavbarContainer extends Component {
  componentDidMount() {
    this.props.fetchActivePeers();
    this.props.setIsRoot(this.props.userId === "root");

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
        <Navbar
          {...this.props}
          unreadNotifications={this.props.unreadNotificationCount}
          projectView={this.props.projectView}
        />
        <FlyInNotifications
          navigate={this.props.navigate}
          notifications={this.props.newNotifications}
          latestFlyInId={this.props.latestFlyInId}
          show={!isEmpty(this.props.newNotifications)}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createBackup: () => dispatch(createBackup()),
    disableLiveUpdates: () => dispatch(disableAllProjectsLiveUpdates()),
    enableLiveUpdates: () => dispatch(enableAllProjectsLiveUpdates()),
    enableUserProfileEdit: () => dispatch(enableUserProfileEdit()),
    exportData: (devModeEnvironment) => dispatch(exportData(devModeEnvironment)),
    fetchActivePeers: () => dispatch(fetchActivePeers()),
    fetchEmailAddress: () => dispatch(fetchEmailAddress()),
    hideUserProfile: () => dispatch(hideUserProfile()),
    logout: () => dispatch(logout()),
    restoreBackup: (file) => dispatch(restoreBackup(file)),
    saveEmailAddress: (emailAddress) => dispatch(saveEmailAddress(emailAddress)),
    setIsRoot: (isRoot) => dispatch(setIsRoot(isRoot)),
    setValidEmailAddressInput: (valid) => dispatch(setValidEmailAddressInput(valid)),
    showUserProfile: () => dispatch(showUserProfile()),
    storeSearchBarDisplayed: (searchBarDisplayed) => dispatch(storeSearchBarDisplayed(searchBarDisplayed)),
    storeSearchTerm: (searchTerm) => dispatch(storeSearchTerm(searchTerm)),
    storeTempEmailAddress: (emailAddress) => dispatch(storeTempEmailAddress(emailAddress)),
    toggleSidebar: () => dispatch(toggleSidebar())
  };
};

const mapStateToProps = (state) => {
  return {
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    avatar: state.getIn(["login", "avatar"]),
    avatarBackground: state.getIn(["login", "avatarBackground"]),
    currentProject: state.getIn(["navbar", "currentProject"]),
    currentSubProject: state.getIn(["navbar", "currentSubProject"]),
    displayName: state.getIn(["login", "displayName"]),
    emailAddress: state.getIn(["login", "emailAddress"]),
    emailServiceAvailable: state.getIn(["login", "emailServiceAvailable"]),
    exportServiceAvailable: state.getIn(["login", "exportServiceAvailable"]),
    groups: state.getIn(["login", "groups"]),
    isEmailAddressInputValid: state.getIn(["navbar", "isEmailAddressInputValid"]),
    isLiveUpdateAllProjectsEnabled: state.getIn(["overview", "isLiveUpdateAllProjectsEnabled"]),
    isRoot: state.getIn(["login", "isRoot"]),
    latestFlyInId: state.getIn(["notifications", "latestFlyInId"]),
    newNotifications: state.getIn(["notifications", "newNotifications"]),
    notifications: state.getIn(["notifications", "notifications"]),
    numberOfActivePeers: state.getIn(["navbar", "numberOfActivePeers"]),
    open: state.getIn(["navbar", "userProfileOpen"]),
    organization: state.getIn(["login", "organization"]),
    peers: state.getIn(["navbar", "peers"]),
    projectView: state.getIn(["overview", "projectView"]),
    route: state.getIn(["route", "locationBeforeTransitions"]),
    searchBarDisplayed: state.getIn(["navbar", "searchBarDisplayed"]),
    searchTerm: state.getIn(["navbar", "searchTerm"]),
    showSidebar: state.getIn(["navbar", "showSidebar"]),
    streamNames: state.getIn(["navbar", "streamNames"]),
    tempEmailAddress: state.getIn(["navbar", "tempEmailAddress"]),
    unreadNotificationCount: state.getIn(["notifications", "unreadNotificationCount"]),
    userId: state.getIn(["login", "id"]),
    userProfileEdit: state.getIn(["navbar", "userProfileEdit"])
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(toJS(NavbarContainer)));
