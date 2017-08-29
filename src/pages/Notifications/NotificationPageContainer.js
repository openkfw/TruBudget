import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchNotifications, markNotificationAsRead } from './actions';
import NotificationPage from './NotificationPage';

import globalStyles from '../../styles';

class NotificationPageContainer extends Component {
  componentWillMount () {
    this.props.fetchNotifications(this.props.loggedInUser.id);
  }

  render () {

    return (
      <div style={globalStyles.innerContainer}>
        <NotificationPage {...this.props} />
      </div>)
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    fetchNotifications: (user) => dispatch(fetchNotifications(user)),
    markNotificationAsRead: (user, id, data) => dispatch(markNotificationAsRead(user, id, data))
  };
}

const mapStateToProps = (state) => {
  return {
    list: state.getIn(['notifications', 'list']),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    users: state.getIn(['login', 'users']).toJS(),
    streamNames: state.getIn(['navbar', 'streamNames']).toJS(),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationPageContainer);
