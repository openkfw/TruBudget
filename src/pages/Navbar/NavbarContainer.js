import React, { Component } from 'react';
import { connect } from 'react-redux';

import { toggleSidebar, fetchPeers } from './actions';
import Navbar from './Navbar';

class NavbarContainer extends Component {
  componentWillMount() {
    this.props.fetchPeers();
  }
  render() {
    return <Navbar {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onToggleSidebar: () => dispatch(toggleSidebar()),
    fetchPeers: () => dispatch(fetchPeers())
  };
}

const mapStateToProps = (state) => {
  return {
    showSidebar: state.getIn(['navbar', 'showSidebar']),
    peers: state.getIn(['navbar', 'peers'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarContainer);
