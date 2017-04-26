import React, { Component } from 'react';
import { connect } from 'react-redux';

import { toggleSidebar, fetchPeers, fetchStreamNames } from './actions';
import { fetchNotifications } from '../Notifications/actions';
import { logout } from '../Login/actions';

import Navbar from './Navbar';

class NavbarContainer extends Component {
  componentWillMount() {
    this.props.fetchPeers();
    this.props.fetchStreamNames();
    this.props.fetchNotifications(this.props.loggedInUser.id);
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
    logout: () => dispatch(logout()),
    fetchStreamNames: () => dispatch(fetchStreamNames()),
  };
}

const mapStateToProps = (state) => {
  return {
    showSidebar: state.getIn(['navbar', 'showSidebar']),
    peers: state.getIn(['navbar', 'peers']),
    unreadNotifications: state.getIn(['navbar', 'unreadNotifications']),
    route: state.getIn(['route', 'locationBeforeTransitions']).toObject(),
    loggedInUser: state.getIn(['login', 'loggedInUser']),
    streamNames: state.getIn(['navbar', 'streamNames']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarContainer);
