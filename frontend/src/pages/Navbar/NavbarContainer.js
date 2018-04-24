import React, { Component } from 'react';
import { connect } from 'react-redux';

import { toggleSidebar, fetchPeers, fetchStreamNames } from './actions';
import { fetchNotifications } from '../Notifications/actions';
import { logout } from '../Login/actions';

import Navbar from './Navbar';
import { toJS } from '../../helper';

class NavbarContainer extends Component {
  componentWillMount() {
    // this.props.fetchPeers();
    // this.props.fetchUsers();
    // this.props.fetchStreamNames();
    // this.props.fetchNotifications(this.props.loggedInUser.id);
  }
  render() {
    return <Navbar {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onToggleSidebar: () => dispatch(toggleSidebar()),
    fetchPeers: () => dispatch(fetchPeers()),
    fetchNotifications: (user) => dispatch(fetchNotifications(user)),
    logout: () => dispatch(logout()),
    fetchStreamNames: () => dispatch(fetchStreamNames()),
  };
}

const mapStateToProps = (state) => {
  return {
    showSidebar: state.getIn(['navbar', 'showSidebar']),
    peers: state.getIn(['navbar', 'peers']),
    unreadNotifications: state.getIn(['navbar', 'unreadNotifications']),
    route: state.getIn(['route', 'locationBeforeTransitions']),
    streamNames: state.getIn(['navbar', 'streamNames']),
    displayName: state.getIn(['login', 'displayName']),
    organization: state.getIn(['login', 'organization']),
    avatar: state.getIn(['login', 'avatar']),
    avatarBackground: state.getIn(['login', 'avatarBackground']),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(toJS(NavbarContainer));
