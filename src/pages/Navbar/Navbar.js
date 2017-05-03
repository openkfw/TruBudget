import React from 'react';
import AppBar from 'material-ui/AppBar';

import SideNav from './SideNav';
import LeftNavbarNavigation from './LeftNavbarNavigation';
import MainNavbarNavigation from './MainNavbarNavigation';
import NavbarIcons from './NavbarIcons';


const Navbar = ({ onToggleSidebar, peers, unreadNotifications, showSidebar, history, route, loggedInUser, logout, streamNames, users }) => (
  <div >
    <AppBar
      title={<MainNavbarNavigation history={history} route={route} streamNames={streamNames}/>}
      iconElementLeft={<LeftNavbarNavigation onToggleSidebar={onToggleSidebar}/>}
      iconElementRight={<NavbarIcons unreadNotifications={unreadNotifications} peers={peers} history={history} logout={logout}/>}
      style={{backgroundColor: 'transparent', boxShadow: 'transparent'}}
    />
    <SideNav
      onToggleSidebar={onToggleSidebar}
      showSidebar={showSidebar}
      loggedInUser={loggedInUser}
      history={history}
      logout={logout}
      users={users} />
  </div>
);

export default Navbar;
