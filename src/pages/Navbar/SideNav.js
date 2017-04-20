import React from 'react';
import Drawer from 'material-ui/Drawer'

import SideNavCard from './SideNavCard'

const SideNav = ({ showSidebar, onToggleSidebar, history, loggedInUser }) => (
  <Drawer
    docked={false}
    width={300}
    open={showSidebar}
    onRequestChange={onToggleSidebar}>
    <SideNavCard
      history={history}
      loggedInUser={loggedInUser}
    />
  </Drawer>
);

export default SideNav
