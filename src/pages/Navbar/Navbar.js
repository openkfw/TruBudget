import React from 'react';
import AppBar from 'material-ui/AppBar';

import SideNav from './SideNav';
import LeftNavbarNavigation from './LeftNavbarNavigation';
import MainNavbarNavigation from './MainNavbarNavigation';
import NavbarIcons from './NavbarIcons';


const Navbar = ({ onToggleSidebar, peers, unreadNotifications, showSidebar, history, route }) => (
  <div>
    <AppBar
      title={<MainNavbarNavigation history={history} route={route}/>}
      iconElementLeft={<LeftNavbarNavigation onToggleSidebar={onToggleSidebar}/>}
      iconElementRight={<NavbarIcons unreadNotifications={unreadNotifications} peers={peers} history={history}/>}
      style={{
        height: '500px',
        backgroundImage: 'url("/navbar_back3.jpg")',
        backgroundSize: 'cover'
      }}
    />
    <SideNav
      onToggleSidebar={onToggleSidebar}
      showSidebar={showSidebar}
      history={history} />
  </div>
);

export default Navbar;
