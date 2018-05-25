import React, { Component } from "react";
import { connect } from "react-redux";

import LiveNotification from "./LiveNotification";
import { showSnackBar, storeSnackBarMessage, fetchNotificationsWithId } from "./actions.js";
import { toJS } from "../../helper";

class LiveNotificationContainer extends Component {
  componentWillMount() {
    this.startUpdates();
  }

  startUpdates() {
    this.timer = setInterval(() => {
      const { notifications, fetchNotifications } = this.props;
      const fromId = notifications.length > 0 ? notifications[0].notificationId : "";
      fetchNotifications(fromId, false);
    }, 15000);
  }

  render() {
    return <LiveNotification {...this.props} />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchNotifications: (fromId, showLoading) => dispatch(fetchNotificationsWithId(fromId, showLoading))
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(LiveNotificationContainer));
