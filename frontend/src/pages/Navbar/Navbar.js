import React from 'react';
import AppBar from 'material-ui/AppBar';

import SideNav from './SideNav';
import LeftNavbarNavigation from './LeftNavbarNavigation';
import MainNavbarNavigation from './MainNavbarNavigation';
import RightNavbarNavigation from './RightNavbarNavigation';


const Navbar = ({
  onToggleSidebar, peers, unreadNotifications,
  showSidebar, history, route, loggedInUser,
  logout, streamNames, users, productionActive,
  displayName, organization, avatar, avatarBackground }) => (
    <div >
      <AppBar
        title={<MainNavbarNavigation productionActive={productionActive} history={history} route={route} streamNames={streamNames} />}
        iconElementLeft={<LeftNavbarNavigation onToggleSidebar={onToggleSidebar} />}
        iconElementRight={<RightNavbarNavigation organization={organization} unreadNotifications={unreadNotifications} peers={peers} history={history} logout={logout} />}
        style={{ backgroundColor: 'transparent', boxShadow: 'transparent' }}
      />
      <SideNav
        onToggleSidebar={onToggleSidebar}
        showSidebar={showSidebar}
        loggedInUser={loggedInUser}
        history={history}
        logout={logout}
        users={users}
        displayName={displayName}
        organization={organization}
        avatar={avatar}
        avatarBackground={avatarBackground}
      />
    </div>
  );

export default Navbar;
