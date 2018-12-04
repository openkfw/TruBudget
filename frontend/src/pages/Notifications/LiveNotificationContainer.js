import React, { Component } from "react";
import { connect } from "react-redux";

import LiveNotification from "./LiveNotification";
import { fetchNotifications, hideSnackbar, fetchNotificationCount } from "./actions.js";
import { toJS } from "../../helper";

class LiveNotificationContainer extends Component {
  componentWillMount() {
    this.props.fetchNotificationCount();
    this.startUpdates();
  }

  componentWillUnmount() {
    // this.stopUpdates();
  }

  startUpdates() {
    this.timer = setInterval(() => {
      this.fetch();
    }, 15000);
  }

  fetch() {
    const { fetchNotifications, notificationsPerPage } = this.props;
    fetchNotifications(notificationsPerPage);
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
    fetchNotifications: (limit) => dispatch(fetchNotifications(false, "", "", limit)),
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(LiveNotificationContainer));
