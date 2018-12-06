import React, { Component } from "react";
import { connect } from "react-redux";
import _isEmpty from "lodash/isEmpty";


import LiveNotification from "./LiveNotification";
import { hideSnackbar, fetchNotificationCount, fetchFlyInNotifications, fetchLatestNotification } from "./actions.js";
import { toJS } from "../../helper";


// Currently when a fly in appears the notifications aren't reloaded, due to the latency of the call.
// Once notifications are compacted/snapshoted we can refresh every time the fly in saga was called.

class LiveNotificationContainer extends Component {
  componentWillMount() {
    this.props.fetchNotificationCount();
    this.props.fetchLatestNotification();
    this.startUpdates();
  }

  componentWillUnmount() {
    this.stopUpdates();
  }

  startUpdates() {
    this.timer = setInterval(() => {
      this.fetch();
    }, 15000);
  }

  fetch() {
    const { fetchFlyInNotifications, latestFlyInId } = this.props;
    if (!_isEmpty(latestFlyInId)) {
      fetchFlyInNotifications(latestFlyInId);
    }
  }

  stopUpdates() {
    clearInterval(this.timer);
  }

  render() {
    return <LiveNotification {...this.props} />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchFlyInNotifications: beforeId => dispatch(fetchFlyInNotifications(false, beforeId)),
    fetchNotificationCount: () => dispatch(fetchNotificationCount()),
    fetchLatestNotification: () => dispatch(fetchLatestNotification()),
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
    latestFlyInId: state.getIn(["notifications", "latestFlyInId"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(LiveNotificationContainer));
