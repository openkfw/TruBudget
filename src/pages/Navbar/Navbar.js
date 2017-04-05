import React from 'react';
import AppBar from 'material-ui/AppBar';

import SideNav from './SideNav';
import PeerInfoIcon from './PeerInfoIcon';

const Navbar = (props) => (
  <div>
    <AppBar 
      title="ACMECorp Chain"
      onLeftIconButtonTouchTap={props.onToggleSidebar} 
      iconElementRight={<PeerInfoIcon />}
    />
    <SideNav onToggleSidebar={props.onToggleSidebar} showSidebar={props.showSidebar}/>
  </div>
);

export default Navbar;