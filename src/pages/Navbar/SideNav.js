import React from 'react';
import Drawer from 'material-ui/Drawer'

import SideNavCard from './SideNavCard'

const SideNav = ({ showSidebar, onToggleSidebar, history }) => (
  <Drawer
    docked={false}
    width={300}
    open={showSidebar}
    onRequestChange={onToggleSidebar}>
    <SideNavCard
      history={history}
    />
  </Drawer>
);

export default SideNav
