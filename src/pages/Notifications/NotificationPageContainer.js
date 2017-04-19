import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchNotifications } from './actions';
import NotificationPage from './NotificationPage';

class NotificationPageContainer extends Component {
  componentWillMount() {
    this.props.fetchNotifications("dummyUser");
  }
  render() {
    return <NotificationPage {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchNotifications: (user) => dispatch(fetchNotifications(user))
  };
}

const mapStateToProps = (state) => {
  return {
    list: state.getIn(['notifications', 'list']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationPageContainer);
