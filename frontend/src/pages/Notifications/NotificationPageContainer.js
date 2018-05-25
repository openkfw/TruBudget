import React, { Component } from "react";
import { connect } from "react-redux";

import { markNotificationAsRead, fetchNotificationsWithId } from "./actions";
import NotificationPage from "./NotificationPage";

import globalStyles from "../../styles";
import { toJS } from "../../helper";

class NotificationPageContainer extends Component {
  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    const { notifications, fetchNotifications } = this.props;
    const fromId = notifications.length > 0 ? notifications[0].notificationId : "";
    fetchNotifications(fromId);
  };

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
    fetchNotifications: id => dispatch(fetchNotificationsWithId(id, true)),
    markNotificationAsRead: notificationId => dispatch(markNotificationAsRead(notificationId))
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
