import React, { Component } from "react";
import { connect } from "react-redux";

import {
  markNotificationAsRead,
  fetchNotifications,
  markAllNotificationAsRead,
  setNotifcationsPerPage,
  setNotificationOffset
} from "./actions";
import NotificationPage from "./NotificationPage";

import globalStyles from "../../styles";
import { toJS } from "../../helper";

class NotificationPageContainer extends Component {
  componentWillMount() {
    this.props.fetchNotifications(this.props.notificationOffset, this.props.notificationsPerPage);
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
    setNotificationOffset: offset => dispatch(setNotificationOffset(offset))
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"]),
    notificationsPerPage: state.getIn(["notifications", "notificationsPerPage"]),
    notificationCount: state.getIn(["notifications", "notificationCount"]),
    notificationOffset: state.getIn(["notifications", "notificationOffset"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
