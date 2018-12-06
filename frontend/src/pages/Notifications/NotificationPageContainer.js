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
  isNotificationPageShown,
  setNotificationOffset
} from "./actions";
import NotificationPage from "./NotificationPage";

import globalStyles from "../../styles";
import { toJS } from "../../helper";

class NotificationPageContainer extends Component {
  componentWillMount() {
    this.props.fetchNotifications(this.props.notificationOffset, this.props.notificationsPerPage);
    this.props.isNotificationPageShown(true);
  }

  componentWillUnmount() {
    this.props.setLastFetchedAfterId("");
    this.props.setLastFetchedBeforeId("");
    this.props.setNotificationPage(0);
    this.props.isNotificationPageShown(false);
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
    fetchNotifications: (offset, limit) => dispatch(fetchNotifications(true, offset, limit)),
    markNotificationAsRead: (notificationId, offset, limit) =>
      dispatch(markNotificationAsRead(notificationId, offset, limit)),
    markAllNotificationAsRead: (notificationIds, offset, limit) =>
      dispatch(markAllNotificationAsRead(notificationIds, offset, limit)),
    setNotifcationsPerPage: limit => dispatch(setNotifcationsPerPage(limit)),
    setNotificationPage: page => dispatch(setNotificationPage(page)),
    setLastFetchedBeforeId: id => dispatch(setLastFetchedBeforeId(id)),
    setLastFetchedAfterId: id => dispatch(setLastFetchedAfterId(id)),
    isNotificationPageShown: show => dispatch(isNotificationPageShown(show)),
    setNotificationOffset: offset => dispatch(setNotificationOffset(offset))
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"]),
    notificationsPerPage: state.getIn(["notifications", "notificationsPerPage"]),
    notificationPage: state.getIn(["notifications", "notificationPage"]),
    notificationCount: state.getIn(["notifications", "notificationCount"]),
    lastFetchedBeforeId: state.getIn(["notifications", "lastFetchedBeforeId"]),
    lastFetchedAfterId: state.getIn(["notifications", "lastFetchedAfterId"]),
    notificationOffset: state.getIn(["notifications", "notificationOffset"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
