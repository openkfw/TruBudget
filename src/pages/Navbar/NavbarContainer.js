import React from 'react';
import { connect } from 'react-redux';

import { toggleSidebar } from './actions';
import Navbar from './Navbar';

const NavbarContainer = (props) => <Navbar {...props}/>

const mapDispatchToProps = (dispatch) => {
  return {
    onToggleSidebar: () => dispatch(toggleSidebar())
  };
}

const mapStateToProps = (state) => {
  return {
    showSidebar: state.getIn(['navbar','showSidebar'])
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarContainer);