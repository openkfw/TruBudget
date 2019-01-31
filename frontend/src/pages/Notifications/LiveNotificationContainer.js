import React, { Component } from "react";
import { connect } from "react-redux";
import _isEmpty from "lodash/isEmpty";

import LiveNotification from "./LiveNotification";
import { hideSnackbar, fetchNotificationCounts, updateNotification, fetchLatestNotification } from "./actions.js";
import { toJS } from "../../helper";
import LiveUpdates from "../LiveUpdates/LiveUpdates";

// Currently when a fly in appears the notifications aren't reloaded, due to the latency of the call.
// Once notifications are compacted/snapshoted we can refresh every time the fly in saga was called.

class LiveNotificationContainer extends Component {
  componentWillMount() {
    this.props.fetchNotificationCounts();
    this.props.fetchLatestNotification();
  }

  // If there are no notifications yet, set the latestFlyInId to "0"
  // to tell the API to return all new notifications

  fetch() {
    const { fetchFlyInNotifications, latestFlyInId } = this.props;
    if (!_isEmpty(latestFlyInId) || latestFlyInId === "0") {
      fetchFlyInNotifications(latestFlyInId);
    }
  }

  render() {
    return (
      <div>
        <LiveUpdates update={() => this.fetch()} interval={15000} />
        <LiveNotification {...this.props} />;
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchFlyInNotifications: beforeId => dispatch(updateNotification(false, beforeId)),
    fetchNotificationCounts: () => dispatch(fetchNotificationCounts()),
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
    unreadNotificationCount: state.getIn(["notifications", "unreadNotificationCount"]),
    notificationsPerPage: state.getIn(["notifications", "notificationsPerPage"]),
    latestFlyInId: state.getIn(["notifications", "latestFlyInId"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(LiveNotificationContainer));
