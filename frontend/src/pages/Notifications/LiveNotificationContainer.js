import React, { Component } from 'react';
import { connect } from 'react-redux';

import LiveNotification from './LiveNotification'
import { showSnackBar, storeSnackBarMessage } from './actions.js'


class LiveNotificationContainer extends Component {

  render() {
    return (
      <LiveNotification {...this.props} />
    )
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    openSnackBar: () => dispatch(showSnackBar(true)),
    closeSnackBar: () => dispatch(showSnackBar(false)),
    storeSnackBarMessage: (message) => dispatch(storeSnackBarMessage(message))
  };
}

const mapStateToProps = (state) => {
  return {
    showSnackBar: state.getIn(['notifications', 'showSnackBar']),
    snackBarMessage: state.getIn(['notifications', 'snackBarMessage']),
    snackBarMessageIsError: state.getIn(['notifications', 'snackBarMessageIsError']),
    notifications: state.getIn(['notifications', 'list']).toJS(),
    users: state.getIn(['login', 'users']).toJS(),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveNotificationContainer);
