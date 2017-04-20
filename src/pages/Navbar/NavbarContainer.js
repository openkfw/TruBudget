import React, { Component } from 'react';
import { connect } from 'react-redux';

import { toggleSidebar, fetchPeers } from './actions';
import { fetchNotifications } from '../Notifications/actions';
import { logout } from '../Login/actions';

import Navbar from './Navbar';

class NavbarContainer extends Component {
  componentWillMount() {
    this.props.fetchPeers();
    this.props.fetchNotifications('dummyUser');
  }
  render() {
    return <Navbar {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onToggleSidebar: () => dispatch(toggleSidebar()),
    fetchPeers: () => dispatch(fetchPeers()),
    fetchNotifications:(user) => dispatch(fetchNotifications(user)),
    logout: () => dispatch(logout())
  };
}

const mapStateToProps = (state) => {
  return {
    showSidebar: state.getIn(['navbar', 'showSidebar']),
    peers: state.getIn(['navbar', 'peers']),
    unreadNotifications: state.getIn(['navbar', 'unreadNotifications']),
    route: state.getIn(['route', 'locationBeforeTransitions']).toObject(),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarContainer);
