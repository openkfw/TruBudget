import React, { Component } from "react";
import { connect } from "react-redux";

import LiveNotification from "./LiveNotification";
import { fetchNotificationsWithId, fetchAllNotifications, hideSnackbar } from "./actions.js";
import { toJS } from "../../helper";

class LiveNotificationContainer extends Component {
  componentWillMount() {
    this.props.fetchAllNotifications();
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
    const { notifications, fetchNotifications } = this.props;
    const fromId = notifications.length > 0 ? notifications[0].notificationId : "";
    fetchNotifications(fromId, false);
  }

  stopUpdates() {
    clearInterval(this.timer);
  }

  render() {
    return <LiveNotification {...this.props} />;
    // return <div />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNotifications: (fromId, showLoading) => dispatch(fetchNotificationsWithId(fromId, showLoading)),
    fetchAllNotifications: () => dispatch(fetchAllNotifications(true)),
    closeSnackbar: () => dispatch(hideSnackbar())
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"]),
    showSnackbar: state.getIn(["notifications", "showSnackbar"]),
    snackbarMessage: state.getIn(["notifications", "snackbarMessage"]),
    snackbarError: state.getIn(["notifications", "snackbarError"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(LiveNotificationContainer));
