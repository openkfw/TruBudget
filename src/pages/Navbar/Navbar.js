import React from 'react';
import AppBar from 'material-ui/AppBar';
import SideNav from './SideNav';

const Navbar = (props) => (
  <div>
    <AppBar onLeftIconButtonTouchTap={props.onToggleSidebar}/>
    <SideNav onToggleSidebar={props.onToggleSidebar} showSidebar={props.showSidebar}/>
  </div>
);

export default Navbar;