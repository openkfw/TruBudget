import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import globalStyles from "../../styles";

import {
  disableLiveUpdates,
  enableLiveUpdates,
  fetchNotificationCounts,
  fetchNotifications,
  markMultipleNotificationsAsRead,
  markNotificationAsRead,
  setNotifcationsPerPage
} from "./actions";
import NotificationPage from "./NotificationPage";

class NotificationPageContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDataFetched: false
    };
  }

  componentDidMount() {
    this.props.disableLiveUpdates();
    this.props.fetchNotifications(this.props.currentPage);
    this.setState({ isDataFetched: true });
  }

  componentWillUnmount() {
    const loggingOut = this.props.isUserLoggedIn;
    if (!loggingOut) {
      this.props.enableLiveUpdates();
      this.props.fetchNotificationCounts();
    }
  }

  render() {
    return (
      <div style={globalStyles.innerContainer}>
        {!this.state.isDataFetched ? <div /> : <NotificationPage {...this.props} />}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchNotifications: (page) => dispatch(fetchNotifications(true, page)),
    markNotificationAsRead: (notificationId, page) => dispatch(markNotificationAsRead(notificationId, page)),
    markMultipleNotificationsAsRead: (notificationIds, page) =>
      dispatch(markMultipleNotificationsAsRead(notificationIds, page)),
    setNotifcationsPerPage: (notificationPageSize) => dispatch(setNotifcationsPerPage(notificationPageSize)),
    enableLiveUpdates: () => dispatch(enableLiveUpdates()),
    disableLiveUpdates: () => dispatch(disableLiveUpdates()),
    fetchNotificationCounts: () => dispatch(fetchNotificationCounts())
  };
};

const mapStateToProps = (state) => {
  return {
    isUserLoggedIn: state.getIn(["login", "isUserLoggedIn"]),
    notifications: state.getIn(["notifications", "notifications"]),
    notificationsPerPage: state.getIn(["notifications", "notificationPageSize"]),
    unreadNotificationCount: state.getIn(["notifications", "unreadNotificationCount"]),
    notificationCount: state.getIn(["notifications", "totalNotificationCount"]),
    currentPage: state.getIn(["notifications", "currentNotificationPage"]),
    isDataLoading: state.getIn(["loading", "loadingVisible"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
