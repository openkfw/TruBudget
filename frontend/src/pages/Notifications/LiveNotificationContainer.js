import React, { Component } from "react";
import { connect } from "react-redux";

import LiveNotification from "./LiveNotification";
import { hideSnackbar, updateNotification } from "./actions.js";
import { toJS } from "../../helper";
import LiveUpdates from "../LiveUpdates/LiveUpdates";

// Currently when a fly in appears the notifications aren't reloaded, due to the latency of the call.
// Once notifications are compacted/snapshoted we can refresh every time the fly in saga was called.

class LiveNotificationContainer extends Component {
  fetch() {
    const { fetchFlyInNotifications, notificationCount } = this.props;
    if (this.props.userId) {
      fetchFlyInNotifications(notificationCount);
    }
  }

  render() {
    return (
      <div>
        {this.props.isLiveUpdatesEnabled ? <LiveUpdates update={() => this.fetch()} interval={15000} /> : null}
        <LiveNotification {...this.props} />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchFlyInNotifications: offset => dispatch(updateNotification(false, offset)),
    closeSnackbar: () => dispatch(hideSnackbar())
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"]),
    showSnackbar: state.getIn(["notifications", "showSnackbar"]),
    snackbarMessage: state.getIn(["notifications", "snackbarMessage"]),
    snackbarError: state.getIn(["notifications", "snackbarError"]),
    snackbarWarning: state.getIn(["notifications", "snackbarWarning"]),
    unreadNotificationCount: state.getIn(["notifications", "unreadNotificationCount"]),
    notificationCount: state.getIn(["notifications", "notificationCount"]),
    notificationsPerPage: state.getIn(["notifications", "notificationsPerPage"]),
    latestFlyInId: state.getIn(["notifications", "latestFlyInId"]),
    isLiveUpdatesEnabled: state.getIn(["notifications", "isLiveUpdatesEnabled"]),
    userId: state.getIn(["login", "id"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(LiveNotificationContainer));
