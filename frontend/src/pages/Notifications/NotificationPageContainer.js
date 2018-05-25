import React, { Component } from "react";
import { connect } from "react-redux";

import { fetchNotifications, markNotificationAsRead } from "./actions";
import NotificationPage from "./NotificationPage";

import globalStyles from "../../styles";
import { toJS } from "../../helper";

class NotificationPageContainer extends Component {
  componentWillMount() {
    this.props.fetchNotifications(true);
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
    fetchNotifications: showLoading => dispatch(fetchNotifications(showLoading)),
    markNotificationAsRead: notificationId => dispatch(markNotificationAsRead(notificationId))
  };
};

const mapStateToProps = state => {
  return {
    notifications: state.getIn(["notifications", "notifications"])
    // loggedInUser: state.getIn(['login', 'loggedInUser']).toJS(),
    // users: state.getIn(['login', 'users']).toJS(),
    // streamNames: state.getIn(['navbar', 'streamNames']).toJS(),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NotificationPageContainer));
