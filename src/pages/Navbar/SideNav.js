import React from 'react';
import Drawer from 'material-ui/Drawer'

import SideNavCard from './SideNavCard'

const SideNav = ({ showSidebar, onToggleSidebar }) => (
  <Drawer
    docked={false}
    width={300}
    open={showSidebar}
    onRequestChange={onToggleSidebar}>
    <SideNavCard />
  </Drawer>
);

export default SideNav
