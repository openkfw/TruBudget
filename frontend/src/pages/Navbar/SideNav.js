import React from 'react';
import Drawer from 'material-ui/Drawer'

import SideNavCard from './SideNavCard'

const SideNav = ({ showSidebar, onToggleSidebar, history, loggedInUser, users }) => (
  <Drawer
    docked={false}
    width={300}
    open={showSidebar}
    onRequestChange={onToggleSidebar}>
    <SideNavCard
      history={history}
      loggedInUser={loggedInUser}
      users={users}
    />
  </Drawer>
);

export default SideNav
