import React, { Component } from "react";
import { connect } from "react-redux";

import { markNotificationAsRead, fetchAllNotifications, markAllNotificationAsRead } from "./actions";
import NotificationPage from "./NotificationPage";

import globalStyles from "../../styles";
import { toJS } from "../../helper";

class NotificationPageContainer extends Component {
  componentDidMount() {
    this.props.fetchNotifications();
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
    fetchNotifications: id => dispatch(fetchAllNotifications(true)),
    markNotificationAsRead: notificationId => dispatch(markNotificationAsRead(notificationId)),
    markAllNotificationAsRead: notificationIds => dispatch(markAllNotificationAsRead(notificationIds))
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
