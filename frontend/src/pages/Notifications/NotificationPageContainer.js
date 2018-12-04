import React, { Component } from "react";
import { connect } from "react-redux";

import {
  markNotificationAsRead,
  fetchNotifications,
  markAllNotificationAsRead,
  setNotifcationsPerPage,
  setNotificationPage,
  setLastFetchedBeforeId,
  setLastFetchedAfterId,
  isNotificationPageShown
} from "./actions";
import NotificationPage from "./NotificationPage";

import globalStyles from "../../styles";
import { toJS } from "../../helper";

class NotificationPageContainer extends Component {
  componentWillMount() {
    this.props.fetchNotifications("", "", this.props.notificationsPerPage);
    this.props.isNotificationPageShown(true)
  }

  componentWillUnmount(){
    this.props.setLastFetchedAfterId("");
    this.props.setLastFetchedBeforeId("");
    this.props.setNotificationPage(0);
    this.props.isNotificationPageShown(false)
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
    fetchNotifications: (beforeId, afterId, limit) => dispatch(fetchNotifications(true, beforeId, afterId, limit)),
    markNotificationAsRead: (notificationId, beforeId, afterId, limit) =>
      dispatch(markNotificationAsRead(notificationId, beforeId, afterId, limit)),
    markAllNotificationAsRead: (notificationIds, beforeId, afterId, limit) =>
      dispatch(markAllNotificationAsRead(notificationIds, beforeId, afterId, limit)),
    setNotifcationsPerPage: limit => dispatch(setNotifcationsPerPage(limit)),
    setNotificationPage: page => dispatch(setNotificationPage(page)),
    setLastFetchedBeforeId: id => dispatch(setLastFetchedBeforeId(id)),
    setLastFetchedAfterId: id => dispatch(setLastFetchedAfterId(id)),
    isNotificationPageShown: show => dispatch(isNotificationPageShown(show))
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"]),
    notificationsPerPage: state.getIn(["notifications", "notificationsPerPage"]),
    notificationPage: state.getIn(["notifications", "notificationPage"]),
    notificationCount: state.getIn(["notifications", "notificationCount"]),
    lastFetchedBeforeId: state.getIn(["notifications", "lastFetchedBeforeId"]),
    lastFetchedAfterId: state.getIn(["notifications", "lastFetchedAfterId"])

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
