import React, { Component } from "react";
import { connect } from "react-redux";

import {
  markNotificationAsRead,
  fetchNotifications,
  setNotifcationsPerPage,
  markMultipleNotificationsAsRead,
  enableLiveUpdates,
  fetchNotificationCounts,
  disableLiveUpdates
} from "./actions";
import NotificationPage from "./NotificationPage";

import globalStyles from "../../styles";
import { toJS } from "../../helper";

class NotificationPageContainer extends Component {
  componentDidMount() {
    this.props.disableLiveUpdates();
    this.props.fetchNotifications(this.props.currentPage);
  }

  componentWillUnmount() {
    const loggingOut = this.props.jwt;
    if (!loggingOut) {
      this.props.enableLiveUpdates();
      this.props.fetchNotificationCounts();
    }
  }

  render() {
    return (
      <div style={globalStyles.innerContainer}>
        <NotificationPage {...this.props} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchNotifications: page => dispatch(fetchNotifications(true, page)),
    markNotificationAsRead: (notificationId, page) => dispatch(markNotificationAsRead(notificationId, page)),
    markMultipleNotificationsAsRead: (notificationIds, page) =>
      dispatch(markMultipleNotificationsAsRead(notificationIds, page)),
    setNotifcationsPerPage: notificationPageSize => dispatch(setNotifcationsPerPage(notificationPageSize)),
    enableLiveUpdates: () => dispatch(enableLiveUpdates()),
    disableLiveUpdates: () => dispatch(disableLiveUpdates()),
    fetchNotificationCounts: () => dispatch(fetchNotificationCounts())
  };
};

const mapStateToProps = state => {
  return {
    jwt: state.getIn(["login", "jwt"]),
    notifications: state.getIn(["notifications", "notifications"]),
    notificationsPerPage: state.getIn(["notifications", "notificationPageSize"]),
    unreadNotificationCount: state.getIn(["notifications", "unreadNotificationCount"]),
    notificationCount: state.getIn(["notifications", "totalNotificationCount"]),
    currentPage: state.getIn(["notifications", "currentNotificationPage"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
