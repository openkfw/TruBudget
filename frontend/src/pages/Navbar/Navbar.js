import React from 'react';
import AppBar from 'material-ui/AppBar';

import SideNav from './SideNav';
import LeftNavbarNavigation from './LeftNavbarNavigation';
import MainNavbarNavigation from './MainNavbarNavigation';
import RightNavbarNavigation from './RightNavbarNavigation';

const styles = {
  navbar: {
    backgroundColor: 'transparent',
    boxShadow: 'transparent'
  }
}

const Navbar = ({
  onToggleSidebar, peers, unreadNotifications,
  showSidebar, history, route,
  logout, streamNames, productionActive,
  displayName, organization, avatar, avatarBackground,
  currentProject, currentSubProject
}) => (
    <div >
      <AppBar
        title={<MainNavbarNavigation productionActive={productionActive} history={history} route={route} currentProject={currentProject} currentSubProject={currentSubProject} />}
        iconElementLeft={<LeftNavbarNavigation onToggleSidebar={onToggleSidebar} />}
        iconElementRight={<RightNavbarNavigation organization={organization} unreadNotifications={unreadNotifications} peers={peers} history={history} logout={logout} />}
        style={styles.navbar}
      />
      <SideNav
        onToggleSidebar={onToggleSidebar}
        showSidebar={showSidebar}
        history={history}
        logout={logout}
        displayName={displayName}
        organization={organization}
        avatar={avatar}
        avatarBackground={avatarBackground}
      />
    </div>
  );

export default Navbar;
