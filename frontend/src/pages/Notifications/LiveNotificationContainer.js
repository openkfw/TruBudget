import React, { Component } from "react";
import { connect } from "react-redux";

import LiveNotification from "./LiveNotification";
import { hideSnackbar, fetchNotificationCount, fetchFlyInNotifications, fetchNotifications } from "./actions.js";
import { toJS } from "../../helper";

class LiveNotificationContainer extends Component {
  componentWillMount() {
    this.props.fetchNotificationCount();
    // this.props.fetchNotifications();
    // this.startUpdates();
  }

  componentWillUnmount() {
    // this.stopUpdates();
  }

  startUpdates() {
    // this.timer = setInterval(() => {
    //   this.fetch();
    // }, 15000);
  }

  fetch() {
    const { fetchFlyInNotifications, notifications, notificationPageShown } = this.props;
    if (notifications.length > 0 && !notificationPageShown) {
      const beforeId = notifications[0].notificationId;
      fetchFlyInNotifications(beforeId);
    }
  }

  stopUpdates() {
    // clearInterval(this.timer);
  }

  render() {
    return <LiveNotification {...this.props} />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchFlyInNotifications: beforeId => dispatch(fetchFlyInNotifications(false, beforeId)),
    fetchNotifications: beforeId => dispatch(fetchNotifications(false, "", "", 20)),
    fetchNotificationCount: () => dispatch(fetchNotificationCount()),
    closeSnackbar: () => dispatch(hideSnackbar())
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"]),
    showSnackbar: state.getIn(["notifications", "showSnackbar"]),
    snackbarMessage: state.getIn(["notifications", "snackbarMessage"]),
    snackbarError: state.getIn(["notifications", "snackbarError"]),
    notificationCount: state.getIn(["notifications", "notificationCount"]),
    notificationsPerPage: state.getIn(["notifications", "notificationsPerPage"]),
    notificationPageShown: state.getIn(["notifications", "notificationPageShown"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(LiveNotificationContainer));
